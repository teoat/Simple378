import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useCamera } from '../../hooks/useCamera';
import { X, Camera, Upload } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture?: (photo: Blob) => void;
  onFileSelect?: (files: File[]) => void;
  title?: string;
}

/**
 * Modal component for capturing evidence via device camera or file upload
 */
export function CameraModal({
  isOpen,
  onClose,
  onCapture,
  onFileSelect,
  title = 'Capture Evidence',
}: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    startCamera,
    stopCamera,
    capturePhoto,
    pickFile,
    pickMultipleFiles,
  } = useCamera();

  useEffect(() => {
    return () => {
      if (isCameraActive) {
        stopCamera();
      }
    };
  }, [isCameraActive, stopCamera]);

  const handleStartCamera = async () => {
    try {
      setError(null);
      const stream = await startCamera();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start camera');
    }
  };

  const handleStopCamera = () => {
    stopCamera();
    setIsCameraActive(false);
  };

  const handleCapturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      try {
        const photo = await capturePhoto(videoRef.current);
        setCapturedImage(URL.createObjectURL(photo));
        if (onCapture) {
          onCapture(photo);
        }
        handleStopCamera();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to capture photo');
      }
    }
  };

  const handleFileUpload = async () => {
    try {
      const files = await pickMultipleFiles();
      if (onFileSelect) {
        onFileSelect(files);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pick files');
    }
  };

  const handleClose = () => {
    if (isCameraActive) {
      handleStopCamera();
    }
    setCapturedImage(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <X size={20} />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-800 rounded text-sm">
              {error}
            </div>
          )}

          {!isCameraActive && !capturedImage && (
            <div className="space-y-3">
              <Button
                onClick={handleStartCamera}
                className="w-full"
                variant="primary"
              >
                <Camera size={18} className="mr-2" />
                Start Camera
              </Button>
              <Button
                onClick={handleFileUpload}
                className="w-full"
                variant="secondary"
              >
                <Upload size={18} className="mr-2" />
                Upload Files
              </Button>
            </div>
          )}

          {isCameraActive && (
            <div className="space-y-3">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded bg-black"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCapturePhoto}
                  className="flex-1"
                  variant="primary"
                >
                  <Camera size={18} className="mr-2" />
                  Capture
                </Button>
                <Button
                  onClick={handleStopCamera}
                  className="flex-1"
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-3">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full rounded"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleStartCamera}
                  className="flex-1"
                  variant="secondary"
                >
                  Retake
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1"
                  variant="primary"
                >
                  Done
                </Button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} hidden />
        </CardContent>
      </Card>
    </div>
  );
}

export default CameraModal;
