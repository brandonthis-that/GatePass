import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';

import QrCode from '@mui/icons-material/QrCode';
import Close from '@mui/icons-material/Close';
import CameraAlt from '@mui/icons-material/CameraAlt';
import FlashOn from '@mui/icons-material/FlashOn';
import FlashOff from '@mui/icons-material/FlashOff';
import { QRCodeData } from '../../types';

interface QRScannerProps {
  onScan: (data: QRCodeData) => void;
  onError: (error: string) => void;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onError,
  isOpen,
  onClose,
  title = "Scan QR Code"
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);

  useEffect(() => {
    if (isOpen) {
      initializeScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const initializeScanner = async () => {
    try {
      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);

      // Prefer back camera for better scanning
      const backCamera = devices.find(device =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear')
      );
      const cameraId = backCamera ? backCamera.id : devices[0]?.id;

      if (!cameraId) {
        setError('No camera found');
        return;
      }

      setSelectedCamera(cameraId);
      startScanning(cameraId);
    } catch (err) {
      setError('Failed to access camera');
    }
  };

  const startScanning = async (cameraId: string) => {
    try {
      const scanner = new Html5Qrcode("qr-scanner");
      scannerRef.current = scanner;

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          try {
            const qrData = JSON.parse(decodedText) as QRCodeData;
            onScan(qrData);
            stopScanner();
            onClose();
          } catch (parseError) {
            onError('Invalid QR code format');
          }
        },
        (errorMessage) => {
          // Scanning errors are normal during scanning process
        }
      );

      setIsScanning(true);
      setError(null);
    } catch (err) {
      setError('Failed to start scanner');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const toggleFlash = async () => {
    if (scannerRef.current && isScanning) {
      try {
        const capabilities = await scannerRef.current.getRunningTrackCameraCapabilities();
        // Flash functionality would be implemented here
        // Browser support for torch/flashlight varies
        setFlashEnabled(!flashEnabled);
      } catch (err) {
        onError('Flash not supported');
      }
    }
  };

  const switchCamera = async () => {
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex(cam => cam.id === selectedCamera);
      const nextIndex = (currentIndex + 1) % cameras.length;
      const nextCamera = cameras[nextIndex];

      await stopScanner();
      startScanning(nextCamera.id);
      setSelectedCamera(nextCamera.id);
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Card sx={{ width: '90%', maxWidth: 400 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QrCode />
              {title}
            </Typography>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            id="qr-scanner"
            sx={{
              width: '100%',
              minHeight: 300,
              backgroundColor: '#000',
              borderRadius: 1,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {!isScanning && !error && (
              <Typography color="text.secondary">
                Initializing camera...
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {cameras.length > 1 && (
              <Button
                variant="outlined"
                onClick={switchCamera}
                startIcon={<CameraAlt />}
                disabled={!isScanning}
              >
                Switch Camera
              </Button>
            )}

            <Button
              variant="outlined"
              onClick={toggleFlash}
              startIcon={flashEnabled ? <FlashOff /> : <FlashOn />}
              disabled={!isScanning}
            >
              Flash
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Position the QR code within the scanning area
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default QRScanner;