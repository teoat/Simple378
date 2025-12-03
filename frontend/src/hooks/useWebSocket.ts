import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface WebSocketMessage {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const { 
    onMessage, 
    reconnectAttempts = 5, 
    reconnectInterval = 3000 
  } = options;

  // Use a ref for connect to avoid dependency cycles and allow recursive calls
  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    if (!isAuthenticated || !token) return;

    try {
      // Append token to URL for WebSocket authentication
      // Assuming the backend expects token in query param or we use a different auth mechanism for WS
      // For now, just connecting. If auth is needed via header, WS API doesn't support headers in browser.
      // Often passed as query param: ?token=...
      // const wsUrl = new URL(url, window.location.origin);
      // wsUrl.searchParams.set('token', token); 
      // Keeping original URL logic for now as I don't know backend WS auth requirement.
      // But checking token existence is good.
      
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
        reconnectCountRef.current = 0;
      };

      ws.onclose = () => {
        setIsConnected(false);
        
        // Attempt reconnect
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current += 1;
          setTimeout(() => connectRef.current(), reconnectInterval);
        }
      };

      ws.onerror = () => {
        // Optionally, handle error state or log to a different service
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          if (onMessage) {
            onMessage(data);
          }
        } catch {
          // Silently ignore malformed messages
        }
      };

      wsRef.current = ws;
    } catch {
      // Connection failed, will retry if enabled
    }
  }, [url, isAuthenticated, onMessage, reconnectAttempts, reconnectInterval]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((type: string, payload: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    } else {
      // WebSocket not connected, message not sent
    }
  }, []);

  return { isConnected, lastMessage, sendMessage };
}
