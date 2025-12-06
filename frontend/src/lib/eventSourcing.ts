import { v4 as uuid } from 'uuid';
import React from 'react';

/**
 * Event Sourcing Pattern for Offline-First Synchronization
 * 
 * Fix #7: Advanced Event Sourcing Implementation
 * 
 * Provides:
 * - Complete audit trail of all changes
 * - Replay capability for recovery
 * - Conflict detection and resolution
 * - Causality tracking via Lamport clocks
 */

export interface DomainEvent {
  id: string;                    // Unique event ID
  aggregateId: string;           // Which entity this affects
  aggregateType: string;         // Entity type (Case, Subject, Evidence)
  eventType: string;             // case.created, evidence.added, etc.
  timestamp: number;             // When it happened (client time)
  nodeId: string;                // Which node (instance) created it
  clock: number;                 // Lamport clock for causality
  version: number;               // Entity version after this event
  data: Record<string, unknown>; // Event payload
  correlationId?: string;        // Link related events
  causationId?: string;          // What caused this event
  synced: boolean;               // Whether sent to server
  syncAttempts: number;
  lastSyncAttempt?: number;
  syncError?: string;
  checksum: string;              // For conflict detection
}

export interface ConflictInfo {
  aggregateId: string;
  fields: string[];
  localEvent: DomainEvent;
  remoteEvent: DomainEvent;
  resolution?: 'local' | 'remote' | 'merge';
}

export class EventStore {
  private dbName = 'antigravity-events';
  private storeName = 'events';
  private snapshotStoreName = 'snapshots';
  private db: IDBDatabase | null = null;
  private nodeId: string;
  private lamportClock = 0;
  private initPromise: Promise<void> | null = null;

  constructor(nodeId = uuid()) {
    this.nodeId = nodeId;
    // Restore clock from localStorage if available
    const savedClock = localStorage.getItem('eventStore_clock');
    if (savedClock) {
      this.lamportClock = parseInt(savedClock, 10);
    }
  }

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 2);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Events store
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          
          // Indexes for querying
          store.createIndex('aggregateId', 'aggregateId', { unique: false });
          store.createIndex('eventType', 'eventType', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
          store.createIndex('clock', 'clock', { unique: false });
        }
        
        // Snapshots store for faster state reconstruction
        if (!db.objectStoreNames.contains(this.snapshotStoreName)) {
          const snapshotStore = db.createObjectStore(this.snapshotStoreName, { keyPath: 'aggregateId' });
          snapshotStore.createIndex('version', 'version', { unique: false });
        }
      };
    });
    
    return this.initPromise;
  }

  private incrementClock(): number {
    this.lamportClock++;
    localStorage.setItem('eventStore_clock', String(this.lamportClock));
    return this.lamportClock;
  }

  /**
   * Update Lamport clock when receiving remote events
   */
  receiveClock(remoteClock: number): void {
    this.lamportClock = Math.max(this.lamportClock, remoteClock) + 1;
    localStorage.setItem('eventStore_clock', String(this.lamportClock));
  }

  /**
   * Append event to store
   */
  async append(
    aggregateId: string,
    aggregateType: string,
    eventType: string,
    data: Record<string, unknown>,
    correlationId?: string,
    causationId?: string
  ): Promise<DomainEvent> {
    if (!this.db) throw new Error('EventStore not initialized');

    const event: DomainEvent = {
      id: uuid(),
      aggregateId,
      aggregateType,
      eventType,
      timestamp: Date.now(),
      nodeId: this.nodeId,
      clock: this.incrementClock(),
      version: await this.getAggregateVersion(aggregateId),
      data,
      correlationId,
      causationId,
      synced: false,
      syncAttempts: 0,
      checksum: this.generateChecksum({ ...data, timestamp: Date.now() })
    };

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.add(event);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(event);
    });
  }

  /**
   * Get all events for an aggregate, sorted by clock
   */
  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    if (!this.db) throw new Error('EventStore not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName], 'readonly');
      const store = tx.objectStore(this.storeName);
      const index = store.index('aggregateId');
      const request = index.getAll(aggregateId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        // Sort by Lamport clock for causality
        const events = request.result.sort((a, b) => a.clock - b.clock);
        resolve(events);
      };
    });
  }

  /**
   * Get unsynchronized events
   */
  async getUnsyncedEvents(): Promise<DomainEvent[]> {
    if (!this.db) throw new Error('EventStore not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName], 'readonly');
      const store = tx.objectStore(this.storeName);
      const events: DomainEvent[] = [];
      
      // Use cursor to iterate through all events and filter unsynced ones
      const request = store.openCursor();
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const event = cursor.value as DomainEvent;
          if (!event.synced) {
            events.push(event);
          }
          cursor.continue();
        } else {
          // Sort by clock for proper ordering during sync
          events.sort((a, b) => a.clock - b.clock);
          resolve(events);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mark events as synced
   */
  async markSynced(eventIds: string[]): Promise<void> {
    if (!this.db) throw new Error('EventStore not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);

      let completed = 0;
      eventIds.forEach((id) => {
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
          const event = getRequest.result;
          if (event) {
            event.synced = true;
            store.put(event);
          }
          completed++;
          if (completed === eventIds.length) {
            resolve();
          }
        };
      });

      tx.onerror = () => reject(tx.error);
      
      // Handle empty array
      if (eventIds.length === 0) {
        resolve();
      }
    });
  }

  /**
   * Mark sync attempt (for retry tracking)
   */
  async markSyncAttempt(eventId: string, error?: string): Promise<void> {
    if (!this.db) throw new Error('EventStore not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.get(eventId);

      request.onsuccess = () => {
        const event = request.result;
        if (event) {
          event.syncAttempts++;
          event.lastSyncAttempt = Date.now();
          if (error) {
            event.syncError = error;
          }
          store.put(event);
        }
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Replay events to reconstruct state
   */
  async replay(aggregateId: string): Promise<Record<string, unknown>> {
    const events = await this.getEvents(aggregateId);
    const state: Record<string, unknown> = {};

    for (const event of events) {
      // Apply event to state based on event type
      switch (event.eventType) {
        case 'created':
          Object.assign(state, event.data);
          break;
        case 'updated':
          Object.assign(state, event.data);
          break;
        case 'deleted':
          Object.assign(state, { _deleted: true, _deletedAt: event.timestamp });
          break;
        default:
          // Generic field merge
          Object.assign(state, event.data);
      }
      
      state.version = event.version;
      state.lastUpdated = event.timestamp;
    }

    return state;
  }

  /**
   * Create snapshot for faster state reconstruction
   */
  async createSnapshot(aggregateId: string): Promise<void> {
    if (!this.db) throw new Error('EventStore not initialized');

    const state = await this.replay(aggregateId);
    const events = await this.getEvents(aggregateId);
    const lastEvent = events[events.length - 1];

    if (!lastEvent) return;

    const snapshot = {
      aggregateId,
      state,
      version: lastEvent.version,
      clock: lastEvent.clock,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.snapshotStoreName], 'readwrite');
      const store = tx.objectStore(this.snapshotStoreName);
      const request = store.put(snapshot);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Detect conflicts in events
   */
  detectConflicts(localEvents: DomainEvent[], remoteEvents: DomainEvent[]): ConflictInfo[] {
    const conflicts: ConflictInfo[] = [];

    // Group by aggregate
    const localByAggregate = new Map<string, DomainEvent[]>();
    const remoteByAggregate = new Map<string, DomainEvent[]>();

    for (const event of localEvents) {
      if (!localByAggregate.has(event.aggregateId)) {
        localByAggregate.set(event.aggregateId, []);
      }
      localByAggregate.get(event.aggregateId)!.push(event);
    }

    for (const event of remoteEvents) {
      if (!remoteByAggregate.has(event.aggregateId)) {
        remoteByAggregate.set(event.aggregateId, []);
      }
      remoteByAggregate.get(event.aggregateId)!.push(event);
    }

    // Check for concurrent writes to same fields
    for (const [aggregateId, localAggEvents] of localByAggregate) {
      const remoteAggEvents = remoteByAggregate.get(aggregateId) || [];

      for (const localEvent of localAggEvents) {
        for (const remoteEvent of remoteAggEvents) {
          // If same version (concurrent edit) → potential conflict
          if (localEvent.version === remoteEvent.version && localEvent.nodeId !== remoteEvent.nodeId) {
            const localFields = Object.keys(localEvent.data);
            const remoteFields = Object.keys(remoteEvent.data);
            const conflictingFields = localFields.filter(f => remoteFields.includes(f));

            if (conflictingFields.length > 0) {
              conflicts.push({
                aggregateId,
                fields: conflictingFields,
                localEvent,
                remoteEvent,
              });
            }
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Resolve conflicts with a strategy
   */
  resolveConflicts(
    conflicts: ConflictInfo[],
    strategy: 'last-write-wins' | 'first-write-wins' | 'merge' = 'last-write-wins'
  ): DomainEvent[] {
    const resolvedEvents: DomainEvent[] = [];

    for (const conflict of conflicts) {
      let winner: DomainEvent;

      switch (strategy) {
        case 'last-write-wins':
          winner = conflict.localEvent.timestamp > conflict.remoteEvent.timestamp
            ? conflict.localEvent
            : conflict.remoteEvent;
          break;
        case 'first-write-wins':
          winner = conflict.localEvent.timestamp < conflict.remoteEvent.timestamp
            ? conflict.localEvent
            : conflict.remoteEvent;
          break;
        case 'merge':
          // Create merged event with both changes
          const mergedData = {
            ...conflict.remoteEvent.data,
            ...conflict.localEvent.data,
          };
          winner = {
            ...conflict.localEvent,
            id: uuid(),
            data: mergedData,
            eventType: 'merged',
            timestamp: Date.now(),
          };
          break;
      }

      conflict.resolution = winner === conflict.localEvent ? 'local' : 
                           winner === conflict.remoteEvent ? 'remote' : 'merge';
      resolvedEvents.push(winner);
    }

    return resolvedEvents;
  }

  /**
   * Generate checksum for conflict detection
   */
  private generateChecksum(data: Record<string, unknown>): string {
    const json = JSON.stringify(data, Object.keys(data).sort());
    let hash = 0;

    for (let i = 0; i < json.length; i++) {
      const char = json.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash).toString(16);
  }

  private async getAggregateVersion(aggregateId: string): Promise<number> {
    const events = await this.getEvents(aggregateId);
    return events.length > 0 ? events[events.length - 1].version + 1 : 1;
  }

  /**
   * Get total event count
   */
  async getEventCount(): Promise<number> {
    if (!this.db) throw new Error('EventStore not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName], 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Clear all events (use with caution!)
   */
  async clear(): Promise<void> {
    if (!this.db) throw new Error('EventStore not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName, this.snapshotStoreName], 'readwrite');
      const eventsStore = tx.objectStore(this.storeName);
      const snapshotStore = tx.objectStore(this.snapshotStoreName);

      eventsStore.clear();
      snapshotStore.clear();

      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve();
    });
  }
}

// Singleton instance
let eventStoreInstance: EventStore | null = null;

export function getEventStore(): EventStore {
  if (!eventStoreInstance) {
    eventStoreInstance = new EventStore();
  }
  return eventStoreInstance;
}

/**
 * Hook for event sourcing
 */
export function useEventStore() {
  const [store] = React.useState(() => getEventStore());
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    store.init()
      .then(() => setIsReady(true))
      .catch((err) => setError(err));
  }, [store]);

  const appendEvent = React.useCallback(
    async (
      aggregateId: string,
      aggregateType: string,
      eventType: string,
      data: Record<string, unknown>,
      correlationId?: string
    ) => {
      if (!isReady) throw new Error('EventStore not ready');
      return store.append(aggregateId, aggregateType, eventType, data, correlationId);
    },
    [store, isReady]
  );

  const getState = React.useCallback(
    async (aggregateId: string) => {
      if (!isReady) throw new Error('EventStore not ready');
      return store.replay(aggregateId);
    },
    [store, isReady]
  );

  const getUnsyncedCount = React.useCallback(async () => {
    if (!isReady) return 0;
    const events = await store.getUnsyncedEvents();
    return events.length;
  }, [store, isReady]);

  return { 
    store, 
    isReady, 
    error,
    appendEvent, 
    getState, 
    getUnsyncedCount,
  };
}

/**
 * Hook for syncing events to server
 */
export function useEventSync(syncEndpoint: string) {
  const { store, isReady } = useEventStore();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [lastSyncResult, setLastSyncResult] = React.useState<{
    success: boolean;
    syncedCount: number;
    failedCount: number;
    conflicts: ConflictInfo[];
  } | null>(null);

  const sync = React.useCallback(async () => {
    if (!isReady || isSyncing) return;

    setIsSyncing(true);
    try {
      const unsyncedEvents = await store.getUnsyncedEvents();
      
      if (unsyncedEvents.length === 0) {
        setLastSyncResult({ success: true, syncedCount: 0, failedCount: 0, conflicts: [] });
        return;
      }

      // Send to server
      const response = await fetch(syncEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ events: unsyncedEvents }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Mark synced events
      if (result.synced && result.synced.length > 0) {
        await store.markSynced(result.synced);
      }

      // Handle conflicts
      let conflicts: ConflictInfo[] = [];
      if (result.conflicts && result.conflicts.length > 0) {
        conflicts = store.detectConflicts(unsyncedEvents, result.conflicts);
      }

      setLastSyncResult({
        success: true,
        syncedCount: result.synced?.length || 0,
        failedCount: result.failed?.length || 0,
        conflicts,
      });
    } catch (error) {
      setLastSyncResult({
        success: false,
        syncedCount: 0,
        failedCount: 0,
        conflicts: [],
      });
      console.error('Event sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [store, isReady, isSyncing, syncEndpoint]);

  return { sync, isSyncing, lastSyncResult };
}
