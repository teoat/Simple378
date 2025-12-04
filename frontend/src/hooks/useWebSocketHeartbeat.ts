/**
 * WebSocket heartbeat mechanism for connection health monitoring.
 * 
 * Implements ping/pong messages to detect stale connections and
 * ensure connection quality.
 */

interface HeartbeatOptions {
  interval?: number;  // Milliseconds between heartbeats (default: 30000)
  timeout?: number;   // Milliseconds to wait for pong (default: 5000)
  onTimeout?: () => void;
  onRestored?: () => void;
}

export class WebSocketHeartbeat {
  private ws: WebSocket;
  private interval: number;
  private timeout: number;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private timeoutTimer: NodeJS.Timeout | null = null;
  private pingCount: number = 0;
  private missedPings: number = 0;
  private onTimeout?: () => void;
  private onRestored?: () => void;

  constructor(ws: WebSocket, options: HeartbeatOptions = {}) {
    this.ws = ws;
    this.interval = options.interval || 30000; // 30 seconds
    this.timeout = options.timeout || 5000;    // 5 seconds
    this.onTimeout = options.onTimeout;
    this.onRestored = options.onRestored;
  }

  /**
   * Start the heartbeat mechanism.
   */
  start(): void {
    this.stop(); // Clear any existing timers
    
    this.heartbeatTimer = setInterval(() => {
      this.sendPing();
    }, this.interval);
  }

  /**
   * Stop the heartbeat mechanism.
   */
  stop(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }

  /**
   * Send a ping message and set timeout for pong response.
   */
  private sendPing(): void {
    if (this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.pingCount++;
    
    // Send ping message
    this.ws.send(JSON.stringify({
      type: 'ping',
      payload: {
        timestamp: Date.now(),
        sequence: this.pingCount
      }
    }));

    // Set timeout for pong response
    this.timeoutTimer = setTimeout(() => {
      this.handleMissedPong();
    }, this.timeout);
  }

  /**
   * Handle receiving a pong message.
   */
  receivePong(timestamp?: number): void {
    // Clear the timeout timer
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }

    // Calculate latency if timestamp provided
    if (timestamp) {
      const latency = Date.now() - timestamp;
      console.debug(`WebSocket latency: ${latency}ms`);
    }

    // Reset missed pings if connection recovered
    if (this.missedPings > 0 && this.onRestored) {
      this.onRestored();
    }
    
    this.missedPings = 0;
  }

  /**
   * Handle a missed pong response.
   */
  private handleMissedPong(): void {
    this.missedPings++;
    
    console.warn(`Missed WebSocket pong (${this.missedPings} consecutive)`);

    // If we've missed too many pongs, consider connection dead
    if (this.missedPings >= 3) {
      console.error('WebSocket connection appears dead (3+ missed pongs)');
      
      if (this.onTimeout) {
        this.onTimeout();
      }
      
      // Optionally close the connection
      // this.ws.close(1000, 'Connection timeout');
    }
  }

  /**
   * Get heartbeat statistics.
   */
  getStats() {
    return {
      pingCount: this.pingCount,
      missedPings: this.missedPings,
      interval: this.interval,
      timeout: this.timeout,
      isActive: this.heartbeatTimer !== null
    };
  }
}
