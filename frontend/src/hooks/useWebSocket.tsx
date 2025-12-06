import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketOptions {
  url?: string;
  onOpen?: () => void;
  onClose?: () => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  autoConnect?: boolean;
}

interface WebSocketResult {
  sendMessage: (message: any) => void;
  lastMessage: any;
  readyState: number;
  connect: () => void;
  disconnect: () => void;
}

export const useWebSocket = (
  endpoint: string = '/ws',
  options: WebSocketOptions = {}
): WebSocketResult => {
  const {
    onOpen,
    onClose,
    onMessage,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    autoConnect = true,
  } = options;

  const [lastMessage, setLastMessage] = useState<any>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef<NodeJS.Timeout>();

  const getUrl = useCallback(() => {
    const token = localStorage.getItem('token') || 'mock-token-123';
    const baseUrl = import.meta.env.VITE_API_URL || '/api/v1';
    
    let wsUrl = baseUrl;
    if (baseUrl.startsWith('http')) {
      wsUrl = baseUrl.replace(/^http/, 'ws');
    } else if (baseUrl.startsWith('/')) {
      // Relative path: construct absolute WS URL based on current location
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}${baseUrl}`;
    }
    
    // Ensure no double slash issues
    const finalEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${wsUrl}${finalEndpoint}?token=${token}`;
  }, [endpoint]);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    try {
      const url = getUrl();
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WS Connected');
        setReadyState(WebSocket.OPEN);
        reconnectCount.current = 0;
        onOpen?.();
      };

      ws.current.onclose = () => {
        console.log('WS Disconnected');
        setReadyState(WebSocket.CLOSED);
        onClose?.();
        
        // Auto-reconnect logic
        if (reconnectCount.current < reconnectAttempts) {
          reconnectTimer.current = setTimeout(() => {
            reconnectCount.current++;
            console.log(`WS Reconnecting attempt ${reconnectCount.current}...`);
            connect();
          }, reconnectInterval);
        }
      };

      ws.current.onerror = (event) => {
        console.error('WS Error:', event);
        onError?.(event);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(event);
        } catch (err) {
          // Handle non-JSON messages if any
          setLastMessage(event.data);
          onMessage?.(event);
        }
      };

    } catch (err) {
      console.error('WS Connection Failed:', err);
    }
  }, [getUrl, reconnectAttempts, reconnectInterval, onOpen, onClose, onError, onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    reconnectCount.current = reconnectAttempts; // Prevent auto-reconnect
    ws.current?.close();
  }, [reconnectAttempts]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(typeof message === 'string' ? message : JSON.stringify(message));
    } else {
      console.warn('WS Not Open, cannot send:', message);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    sendMessage,
    lastMessage,
    readyState,
    connect,
    disconnect
  };
};
