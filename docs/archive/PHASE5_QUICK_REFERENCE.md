# Phase 5 Quick Reference - Enterprise Features

## 🔌 Quick Integration Examples

### 1. Check if Feature is Available
```typescript
import { useTenant } from '@/hooks/useTenant';

function MyComponent() {
  const { isTenantFeatureEnabled } = useTenant();
  
  return isTenantFeatureEnabled('ai_orchestration') ? (
    <AdvancedAIPanel />
  ) : (
    <div>Feature not available on your plan</div>
  );
}
```

### 2. Capture Evidence via Camera
```typescript
import { CameraModal } from '@/components/modal/CameraModal';
import { useState } from 'react';

function EvidenceCapture() {
  const [isOpen, setIsOpen] = useState(false);
  const [photo, setPhoto] = useState<Blob | null>(null);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Capture Evidence</button>
      <CameraModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCapture={(blob) => {
          setPhoto(blob);
          // Upload blob to server
          uploadEvidence(blob);
        }}
      />
    </>
  );
}
```

### 3. Track Application Health
```typescript
import { useMonitoring } from '@/hooks/useMonitoring';

function HealthIndicator() {
  const { isHealthy, metrics, alerts } = useMonitoring();
  
  return (
    <div className={isHealthy ? 'bg-green-50' : 'bg-red-50'}>
      <p>Response Time: {metrics?.responseTime}ms</p>
      <p>Error Rate: {metrics?.errorRate.toFixed(2)}%</p>
      {alerts.length > 0 && (
        <ul>
          {alerts.map((alert, i) => (
            <li key={i}>{alert}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 4. Load Balanced API Calls
```typescript
import scalableApi from '@/lib/scalableApi';

// GET with automatic caching
const cases = await scalableApi.get('/cases');

// POST with automatic retry on server failure
const newCase = await scalableApi.post('/cases', { name: 'New Case' });

// PUT with load balancing
await scalableApi.put(`/cases/${id}`, updates);

// DELETE with fallback to cache
await scalableApi.delete(`/cases/${id}`);
```

### 5. Multi-Region Data Handling
```typescript
import { useTenant } from '@/hooks/useTenant';

function DataProcessor() {
  const { tenant, getApiBaseUrl } = useTenant();
  
  // API calls automatically routed to correct region
  const regionSpecificUrl = getApiBaseUrl();
  // Returns: https://api.us-east.example.com or https://api.eu-west.example.com
}
```

### 6. Monitor Service Worker Status
```typescript
import { usePWA } from '@/hooks/usePWA';

function PWAStatus() {
  const { canInstall, installApp, isUpdateAvailable } = usePWA();
  
  return (
    <>
      {canInstall && (
        <button onClick={installApp}>Install App</button>
      )}
      {isUpdateAvailable && (
        <button onClick={() => window.location.reload()}>
          Update Available - Reload
        </button>
      )}
    </>
  );
}
```

## 📊 Component Locations

| Component | Path | Purpose |
|-----------|------|---------|
| PWAInstallBanner | `components/pwa/PWAInstallBanner.tsx` | Install prompt UI |
| OfflineSyncStatus | `components/pwa/OfflineSyncStatus.tsx` | Offline indicator |
| CameraModal | `components/modal/CameraModal.tsx` | Photo capture |
| EnterpriseDashboard | `components/admin/EnterpriseDashboard.tsx` | Admin monitoring |

## 🪝 Hook Locations

| Hook | Path | Provides |
|------|------|----------|
| usePWA | `hooks/usePWA.ts` | PWA lifecycle, install, sync |
| useCamera | `hooks/useCamera.ts` | Camera, file picker |
| useTenant | `hooks/useTenant.ts` | Tenant config, feature gates |
| useMonitoring | `hooks/useMonitoring.ts` | Health metrics, SLA |
| useScaling | `hooks/useScaling.ts` | LoadBalancer, DistributedCache |

## 🔌 Library Integration Points

### Service Worker
- **File**: `public/service-worker.js`
- **Auto-registered**: Yes (via usePWA hook)
- **Caching**: Network-first (APIs), Cache-first (assets)
- **Offline**: IndexedDB sync queue

### Monitoring Endpoint
- **URL**: `GET /api/monitoring/health`
- **Poll Rate**: Every 10 seconds
- **Metrics Returned**:
  ```json
  {
    "responseTime": 250,
    "errorRate": 0.02,
    "uptime": 0.9999,
    "activeUsers": 42
  }
  ```

### Tenant Configuration Endpoint
- **URL**: `GET /api/tenant/config`
- **Caching**: In memory (React Query)
- **Response Format**:
  ```json
  {
    "id": "tenant-123",
    "name": "Acme Corp",
    "region": "us-east",
    "plan": "enterprise",
    "features": ["advanced_analytics", "ai_orchestration", "sso"]
  }
  ```

## ⚙️ Configuration

### Environment Variables
```bash
# API Servers (for load balancing)
REACT_APP_API_URL=http://server1:8000
REACT_APP_API_BACKUP_URL=http://server2:8000

# Feature flags (app-level)
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_OFFLINE=true
```

### Service Worker Assets to Cache
Edit `public/service-worker.js` to customize:
- Static assets to cache on install
- Network timeout (default: 5s)
- Cache expiration policies
- Periodic sync interval (default: 6 hours)

## 🧪 Testing Checklist

- [ ] PWA installs on desktop/mobile browsers
- [ ] App works offline after service worker cache
- [ ] Sync queue drains when back online
- [ ] Camera capture works on device
- [ ] Feature gates prevent unauthorized access
- [ ] Monitoring dashboard updates in real-time
- [ ] Load balancer distributes requests evenly
- [ ] Cache hit rate improves on repeated requests
- [ ] Multi-region routing works correctly
- [ ] Failover to backup server on primary failure

## 🐛 Debugging Tips

### Service Worker Issues
```javascript
// In DevTools Console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('SW registrations:', regs);
});

// Check pending updates
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(reg => {
    reg.addEventListener('updatefound', () => {
      console.log('SW update found!');
    });
  });
}
```

### Offline Sync Queue
```javascript
// View pending syncs in IndexedDB
const db = await new Promise(resolve => {
  const req = indexedDB.open('SyncQueue', 1);
  req.onsuccess = () => resolve(req.result);
});
const tx = db.transaction('pending', 'readonly');
const items = await new Promise(resolve => {
  const req = tx.objectStore('pending').getAll();
  req.onsuccess = () => resolve(req.result);
});
console.log('Pending syncs:', items);
```

### Tenant Feature Check
```typescript
const { tenant, isTenantFeatureEnabled } = useTenant();
console.log('Tenant:', tenant);
console.log('AI enabled?', isTenantFeatureEnabled('ai_orchestration'));
```

### Monitoring Status
```typescript
const { metrics, alerts } = useMonitoring();
console.log('Current metrics:', metrics);
console.log('Active alerts:', alerts);
```

### Load Balancer Status
```typescript
import scalableApi from '@/lib/scalableApi';
console.log('Available servers:', scalableApi.getServers());
```

## 📖 Related Documentation

- [Phase 5 Complete Status](./PHASE5_ENTERPRISE_INTEGRATION.md)
- [PWA Implementation Guide](./docs/pwa-guide.md) *(create as needed)*
- [Multi-Tenant Architecture](./docs/multi-tenant-guide.md) *(create as needed)*
- [Monitoring Setup](./docs/monitoring-guide.md) *(create as needed)*

## 💡 Common Patterns

### Pattern: Graceful Feature Degradation
```typescript
const { isTenantFeatureEnabled } = useTenant();

return (
  <div>
    {isTenantFeatureEnabled('advanced_analytics') && (
      <AdvancedAnalytics />
    )}
    <StandardAnalytics /> {/* Always available */}
  </div>
);
```

### Pattern: Offline-Aware Form Submission
```typescript
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  window.addEventListener('online', () => setIsOnline(true));
  window.addEventListener('offline', () => setIsOnline(false));
}, []);

const handleSubmit = async (data) => {
  if (isOnline) {
    await scalableApi.post('/submit', data);
  } else {
    // Queue in IndexedDB, sync when online
    await queueAction('submit', data);
  }
};
```

### Pattern: Health-Based UI Updates
```typescript
const { isHealthy, metrics } = useMonitoring();

if (!isHealthy) {
  return <WarningBanner message="System degraded" />;
}

if (metrics?.responseTime > 1000) {
  return <SlowNetworkBanner />;
}

return <NormalContent />;
```

---

**Last Updated**: Phase 5 Integration Complete  
**Status**: Production Ready ✅
