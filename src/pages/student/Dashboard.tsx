import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/GridLegacy';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Add from '@mui/icons-material/Add';
import Laptop from '@mui/icons-material/Laptop';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import QrCode from '@mui/icons-material/QrCode';
import Download from '@mui/icons-material/Download';
import Print from '@mui/icons-material/Print';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Visibility from '@mui/icons-material/Visibility';
import { useAuth } from '../../auth/AuthContext';
import Layout from '../../components/shared/Layout';
import { Asset, Vehicle } from '../../types';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showAssetDialog, setShowAssetDialog] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrData, setQrData] = useState<{ type: 'asset' | 'vehicle'; item: Asset | Vehicle } | null>(null);

  // Mock data - replace with API calls
  useEffect(() => {
    // Mock assets
    setAssets([
      {
        id: '1',
        userId: user?.id || '',
        type: 'laptop',
        serialNumber: 'HP123456789',
        model: 'HP EliteBook 840',
        brand: 'HP',
        description: 'Work laptop',
        qrCode: 'QR_ASSET_1',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);

    // Mock vehicles
    setVehicles([
      {
        id: '1',
        userId: user?.id || '',
        plateNumber: 'KDA 123A',
        make: 'Toyota',
        model: 'Corolla',
        color: 'Silver',
        year: 2020,
        qrCode: 'QR_VEHICLE_1',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  }, [user]);

  const handleViewQR = (type: 'asset' | 'vehicle', item: Asset | Vehicle) => {
    setQrData({ type, item });
    setShowQRDialog(true);
  };

  const handleDownloadQR = () => {
    // Implement QR code download
    console.log('Download QR code');
  };

  const handlePrintQR = () => {
    // Implement QR code printing
    window.print();
  };

  const AssetCard = ({ asset }: { asset: Asset }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Laptop />
            </Avatar>
            <Box>
              <Typography variant="h6">{asset.brand} {asset.model}</Typography>
              <Typography variant="body2" color="text.secondary">
                Serial: {asset.serialNumber}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={asset.type.toUpperCase()}
            color="primary"
            size="small"
          />
        </Box>

        <Box display="flex" gap={1} justifyContent="flex-end">
          <IconButton
            size="small"
            onClick={() => handleViewQR('asset', asset)}
            title="View QR Code"
          >
            <QrCode />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setSelectedAsset(asset)}
            title="Edit Asset"
          >
            <Edit />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <DirectionsCar />
            </Avatar>
            <Box>
              <Typography variant="h6">{vehicle.make} {vehicle.model}</Typography>
              <Typography variant="body2" color="text.secondary">
                {vehicle.plateNumber} • {vehicle.color} • {vehicle.year}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box display="flex" gap={1} justifyContent="flex-end">
          <IconButton
            size="small"
            onClick={() => handleViewQR('vehicle', vehicle)}
            title="View QR Code"
          >
            <QrCode />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setSelectedVehicle(vehicle)}
            title="Edit Vehicle"
          >
            <Edit />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Layout user={user} title="GatePass - Student Portal">
      <Box>
        {/* Welcome Section */}
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Welcome back, {user?.firstName}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Manage your registered assets and vehicles. Generate QR codes for quick gate access.
            </Typography>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Assets Section */}
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5" fontWeight={600}>
                My Assets
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowAssetDialog(true)}
                size="small"
              >
                Add Asset
              </Button>
            </Box>

            {assets.length === 0 ? (
              <Card sx={{ textAlign: 'center', py: 4 }}>
                <CardContent>
                  <Laptop sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">
                    No assets registered yet
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setShowAssetDialog(true)}
                    sx={{ mt: 2 }}
                  >
                    Register First Asset
                  </Button>
                </CardContent>
              </Card>
            ) : (
              assets.map((asset) => <AssetCard key={asset.id} asset={asset} />)
            )}
          </Grid>

          {/* Vehicles Section */}
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5" fontWeight={600}>
                My Vehicles
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowVehicleDialog(true)}
                size="small"
              >
                Add Vehicle
              </Button>
            </Box>

            {vehicles.length === 0 ? (
              <Card sx={{ textAlign: 'center', py: 4 }}>
                <CardContent>
                  <DirectionsCar sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">
                    No vehicles registered yet
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setShowVehicleDialog(true)}
                    sx={{ mt: 2 }}
                  >
                    Register First Vehicle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)
            )}
          </Grid>
        </Grid>
      </Box>

      {/* QR Code Dialog */}
      <Dialog
        open={showQRDialog}
        onClose={() => setShowQRDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          QR Code - {qrData?.type === 'asset' ? 'Asset' : 'Vehicle'}
        </DialogTitle>
        <DialogContent>
          <Box textAlign="center" py={3}>
            {/* QR Code placeholder - implement actual QR generation */}
            <Box
              sx={{
                width: 200,
                height: 200,
                bgcolor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                border: '1px solid',
                borderColor: 'grey.300'
              }}
            >
              <QrCode sx={{ fontSize: 100, color: 'grey.500' }} />
            </Box>
            <Typography variant="h6" gutterBottom>
              {qrData ? (qrData.type === 'asset'
                ? `${(qrData.item as Asset).brand} ${(qrData.item as Asset).model}`
                : `${(qrData.item as Vehicle).make} ${(qrData.item as Vehicle).model}`
              ) : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Show this QR code to security for verification
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePrintQR} startIcon={<Print />}>
            Print
          </Button>
          <Button onClick={handleDownloadQR} startIcon={<Download />}>
            Download
          </Button>
          <Button onClick={() => setShowQRDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Asset Registration Dialog - Simplified for now */}
      <Dialog open={showAssetDialog} onClose={() => setShowAssetDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register New Asset</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Asset registration form will be implemented here
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAssetDialog(false)}>Cancel</Button>
          <Button variant="contained">Register</Button>
        </DialogActions>
      </Dialog>

      {/* Vehicle Registration Dialog - Simplified for now */}
      <Dialog open={showVehicleDialog} onClose={() => setShowVehicleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register New Vehicle</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Vehicle registration form will be implemented here
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVehicleDialog(false)}>Cancel</Button>
          <Button variant="contained">Register</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default StudentDashboard;