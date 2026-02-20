import React from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { QRCodeSVG } from 'qrcode.react';
import { Asset, Vehicle, QRCodeData } from '../../types';

interface QRCodeDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'asset' | 'vehicle';
  item: Asset | Vehicle;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  isOpen,
  onClose,
  type,
  item
}) => {
  
  const generateQRData = (): QRCodeData => {
    const baseData = {
      type,
      id: item.id,
      user_id: 'user' in item ? item.user : (item as any).user_id,
      timestamp: new Date().toISOString(),
      hash: (item as any).verification_hash || 'mock-hash'
    };

    return baseData;
  };

  const qrData = generateQRData();
  const qrValue = JSON.stringify(qrData);

  const getTitle = () => {
    if (type === 'asset') {
      const asset = item as Asset;
      return `${asset.brand} ${asset.model}`;
    } else {
      const vehicle = item as Vehicle;
      return `${vehicle.make} ${vehicle.model}`;
    }
  };

  const getSubtitle = () => {
    if (type === 'asset') {
      const asset = item as Asset;
      return `Serial: ${asset.serial_number}`;
    } else {
      const vehicle = item as Vehicle;
      return `Plate: ${vehicle.plate_number}`;
    }
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a larger canvas for better quality
    const size = 400;
    canvas.width = size;
    canvas.height = size;

    // Fill white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);

    // Get SVG data
    const svgElement = document.querySelector('.qr-code-svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
        
        // Create download link
        const link = document.createElement('a');
        link.download = `${type}-${item.id}-qr.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svgElement = document.querySelector('.qr-code-svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${getTitle()}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                margin: 20px;
              }
              .qr-container {
                display: inline-block;
                border: 2px solid #333;
                padding: 20px;
                margin: 20px;
              }
              h1 { font-size: 24px; margin: 10px 0; }
              h2 { font-size: 18px; margin: 5px 0; color: #666; }
              .qr-code { margin: 20px 0; }
              .footer { font-size: 12px; margin-top: 20px; color: #999; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h1>${getTitle()}</h1>
              <h2>${getSubtitle()}</h2>
              <div class="qr-code">
                ${svgData}
              </div>
              <div class="footer">
                Africa Nazarene University<br>
                Gate Management System
              </div>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          QR Code - {getTitle()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {getSubtitle()}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{ py: 3 }}
        >
          <QRCodeSVG
            value={qrValue}
            size={250}
            level="M"
            includeMargin
            className="qr-code-svg"
          />
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 2, textAlign: 'center', maxWidth: 300 }}
          >
            Scan this QR code at the university gate for quick verification
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={handleDownload}>
          Download
        </Button>
        <Button variant="outlined" onClick={handlePrint}>
          Print
        </Button>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeDisplay;