import { useRef, useCallback } from 'react';

interface CameraOptions {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
  onCapture?: (blob: Blob) => void;
}

/**
 * Hook for accessing device camera and capturing photos/videos
 * Useful for evidence capture in fraud investigation
 */
export function useCamera(options: CameraOptions = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: options.facingMode || 'user',
          width: options.width ? { ideal: options.width } : undefined,
          height: options.height ? { ideal: options.height } : undefined,
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      return true;
    } catch (error) {
      console.error('Camera access denied:', error);
      return false;
    }
  }, [options]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Camera or canvas not initialized');
      return null;
    }

    const context = canvasRef.current.getContext('2d');
    if (!context) return null;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    context.drawImage(videoRef.current, 0, 0);

    return new Promise((resolve) => {
      canvasRef.current!.toBlob((blob) => {
        resolve(blob);
        options.onCapture?.(blob!);
      }, 'image/jpeg', 0.9);
    });
  }, [options]);

  return {
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
  };
}

/**
 * Hook for device storage access (camera roll, file system)
 */
export function useDeviceStorage() {
  const pickFile = useCallback(async (accept?: string): Promise<File | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      if (accept) input.accept = accept;

      input.onchange = (event: any) => {
        const file = event.target.files?.[0];
        resolve(file || null);
      };

      input.click();
    });
  }, []);

  const pickMultipleFiles = useCallback(async (accept?: string): Promise<File[]> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      if (accept) input.accept = accept;

      input.onchange = (event: any) => {
        const files = event.target.files ? Array.from(event.target.files) : [];
        resolve(files as File[]);
      };

      input.click();
    });
  }, []);

  return {
    pickFile,
    pickMultipleFiles,
  };
}
