import { useState, useEffect, useRef } from 'react';

export interface ForensicsProgress {
  stage: 'upload' | 'virus_scan' | 'ocr' | 'metadata' | 'forensics' | 'indexing' | 'complete';
  progress: number;
  message: string;
}

interface WebSocketMessage {
  type: string;
  uploadId: string;
  stage: string;
  progress: number;
  message: string;
}

/**
 * Hook to track forensics processing progress via WebSocket
 */
export function useForensicsProgress(uploadId: string, onComplete?: () => void) {
  const [progress, setProgress] = useState<ForensicsProgress>({
    stage: 'upload',
    progress: 0,
    message: 'Preparing file...',
  });
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!uploadId) return;

    const token = localStorage.getItem('auth_token');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(token || '')}&uploadId=${encodeURIComponent(uploadId)}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.uploadId === uploadId && message.type === 'FORENSICS_PROGRESS') {
            setProgress({
              stage: message.stage as ForensicsProgress['stage'],
              progress: message.progress,
              message: message.message,
            });

            if (message.stage === 'complete') {
              onComplete?.();
            }
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [uploadId, onComplete]);

  // Fallback: Simulate progress if WebSocket is unavailable
  useEffect(() => {
    if (isConnected || !uploadId || progress.stage === 'complete') return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev.progress >= 100) {
          return { ...prev, stage: 'complete' };
        }
        return {
          ...prev,
          progress: Math.min(100, prev.progress + Math.random() * 15),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, uploadId, progress.stage]);

  return { progress, isConnected };
}
