import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { WebSocketHeartbeat } from './useWebSocketHeartbeat';

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
  const heartbeatRef = useRef<WebSocketHeartbeat | null>(null);
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

      // Construct proper WebSocket URL with authentication token
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      
      // Handle both absolute and relative URLs
      let wsUrl: URL;
      if (url.startsWith('ws://') || url.startsWith('wss://')) {
        // Absolute WebSocket URL
        wsUrl = new URL(url);
      } else {
        // Relative URL - construct full WebSocket URL
        const path = url.startsWith('/') ? url : `/${url}`;
        wsUrl = new URL(`${protocol}//${host}${path}`);
      }
      
      // Append authentication token as query parameter
      wsUrl.searchParams.set('token', token);
      
      const ws = new WebSocket(wsUrl.toString());

      ws.onopen = () => {
        setIsConnected(true);
        reconnectCountRef.current = 0;
        
        // Start heartbeat mechanism
        heartbeatRef.current = new WebSocketHeartbeat(ws, {
          interval: 30000,  // 30 seconds
          timeout: 5000,    // 5 seconds
          onTimeout: () => {
            console.warn('WebSocket heartbeat timeout - triggering reconnection');
            ws.close();
          },
          onRestored: () => {
            console.log('WebSocket connection health restored');
          }
        });
        heartbeatRef.current.start();
      };

      ws.onclose = () => {
        setIsConnected(false);
        
        // Stop heartbeat
        if (heartbeatRef.current) {
          heartbeatRef.current.stop();
          heartbeatRef.current = null;
        }
        
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
          
          // Handle pong messages for heartbeat
          if (data.type === 'pong' && heartbeatRef.current) {
            heartbeatRef.current.receivePong(data.payload?.timestamp);
            return; // Don't pass pong messages to application
          }
          
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
