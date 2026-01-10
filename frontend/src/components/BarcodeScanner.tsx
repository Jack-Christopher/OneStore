import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Box, Button, Modal, Typography, CircularProgress } from '@mui/material';
import { Camera, X, RefreshCw } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
  title?: string;
}

export default function BarcodeScanner({
  onScan,
  onClose,
  isOpen,
  title = "Escanear Código de Barras"
}: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'barcode-scanner-container';

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING state
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      } finally {
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  }, []);

  const startScanning = useCallback(async () => {
    if (scannerRef.current) {
      await stopScanning();
    }

    setError(null);
    setLastScanned(null);

    // Wait for the container to be available in DOM
    await new Promise(resolve => setTimeout(resolve, 100));

    const containerElement = document.getElementById(containerId);
    if (!containerElement) {
      setError("No se pudo inicializar el escáner");
      return;
    }

    try {
      const scanner = new Html5Qrcode(containerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false
      });

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 150 },
          aspectRatio: 1.7777778,
        },
        (decodedText) => {
          // Código detectado
          setLastScanned(decodedText);
          onScan(decodedText);
          stopScanning();
        },
        () => {
          // Ignorar errores de escaneo (frames sin código)
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      if (err.message?.includes('NotAllowedError') || err.name === 'NotAllowedError') {
        setError("Permiso de cámara denegado. Por favor, permite el acceso a la cámara.");
      } else if (err.message?.includes('NotFoundError') || err.name === 'NotFoundError') {
        setError("No se encontró ninguna cámara en este dispositivo.");
      } else {
        setError(`Error al iniciar la cámara: ${err.message || 'Error desconocido'}`);
      }
    }
  }, [onScan, stopScanning]);

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen, startScanning, stopScanning]);

  const handleClose = async () => {
    await stopScanning();
    onClose();
  };

  const handleRetry = async () => {
    await stopScanning();
    await startScanning();
  };

  const boxStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 450,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 3,
    borderRadius: 2,
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      className="flex items-center justify-center"
    >
      <Box sx={boxStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Camera size={24} />
            {title}
          </Typography>
          <Button onClick={handleClose} sx={{ minWidth: 'auto', p: 0.5 }}>
            <X size={24} />
          </Button>
        </Box>

        {/* Scanner container */}
        <Box
          sx={{
            width: '100%',
            minHeight: 250,
            bgcolor: '#000',
            borderRadius: 1,
            overflow: 'hidden',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <div
            id={containerId}
            style={{
              width: '100%',
              height: '100%',
              minHeight: 250,
            }}
          />

          {!isScanning && !error && (
            <Box sx={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1
            }}>
              <CircularProgress color="primary" />
              <Typography variant="body2" color="white">
                Iniciando cámara...
              </Typography>
            </Box>
          )}
        </Box>

        {/* Error message */}
        {error && (
          <Box sx={{
            bgcolor: '#fee2e2',
            color: '#dc2626',
            p: 2,
            borderRadius: 1,
            mb: 2,
            textAlign: 'center'
          }}>
            <Typography variant="body2">{error}</Typography>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleRetry}
              startIcon={<RefreshCw size={16} />}
              sx={{ mt: 1 }}
            >
              Reintentar
            </Button>
          </Box>
        )}

        {/* Last scanned code */}
        {lastScanned && (
          <Box sx={{
            bgcolor: '#dcfce7',
            color: '#16a34a',
            p: 2,
            borderRadius: 1,
            mb: 2,
            textAlign: 'center'
          }}>
            <Typography variant="body2">
              ✓ Código detectado: <strong>{lastScanned}</strong>
            </Typography>
          </Box>
        )}

        {/* Instructions */}
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
          Apunta la cámara hacia el código de barras del producto
        </Typography>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleClose}
          >
            Cancelar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

