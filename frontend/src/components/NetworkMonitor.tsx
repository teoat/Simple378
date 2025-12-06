import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface LocationState {
  from?: string;
}

export function NetworkMonitor() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastOnlinePathRef = useRef(location.pathname + location.search);

  useEffect(() => {
    if (location.pathname !== '/offline') {
      lastOnlinePathRef.current = location.pathname + location.search;
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleOffline = () => {
      toast.error('You appear to be offline. Redirecting to offline mode.');
      navigate('/offline', {
        replace: true,
        state: { from: lastOnlinePathRef.current }
      });
    };

    const handleOnline = () => {
      toast.success('Back online');
      if (location.pathname === '/offline') {
        const state = location.state as LocationState | null;
        const target = state?.from || lastOnlinePathRef.current || '/dashboard';
        navigate(target, { replace: true });
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [location.pathname, location.state, navigate]);

  return null;
}

export default NetworkMonitor;
