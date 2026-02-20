import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/GridLegacy';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { ThemeProvider } from '@mui/material/styles';
import QrCodeScanner from '@mui/icons-material/QrCodeScanner';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import People from '@mui/icons-material/People';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import Person from '@mui/icons-material/Person';
import Warning from '@mui/icons-material/Warning';
import Refresh from '@mui/icons-material/Refresh';
import { useAuth } from '../../auth/AuthContext';
import { guardTheme } from '../../components/shared/theme';
import QRScanner from '../../components/shared/QRScanner';
import { QRCodeData, User } from '../../types';
import GateApiService from '../../services/GateApiService';

interface DayScholar extends User {
  day_scholar_status?: {
    status: 'in' | 'out';
    last_check_in?: string;
    last_check_out?: string;
  };
}

const GuardInterface: React.FC = () => {
  const { user } = useAuth();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'valid' | 'invalid' | 'visitor' | 'stolen';
    user?: User;
    message: string;
    item?: any;
  } | null>(null);
  const [dayScholars, setDayScholars] = useState<DayScholar[]>([]);
  const [highContrastMode, setHighContrastMode] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load day scholars on component mount
  useEffect(() => {
    loadDayScholars();
  }, []);

  const loadDayScholars = async () => {
    try {
      const response = await GateApiService.getDayScholars();
      if (response.success) {
        // Transform the data to match our interface
        const scholars = response.data.map((scholar: any) => ({
          ...scholar.user_details,
          day_scholar_status: {
            status: scholar.status,
            last_check_in: scholar.last_check_in,
            last_check_out: scholar.last_check_out
          }
        }));
        setDayScholars(scholars);
      }
    } catch (error) {
      console.error('Failed to load day scholars:', error);
    }
  };

  const handleQRScan = async (qrData: QRCodeData) => {
    setLoading(true);
    try {
      const response = await GateApiService.verifyQRCode(qrData);
      
      if (response.success) {
        setScanResult({
          status: response.data.status,
          user: response.data.user ? {
            id: response.data.item.user_details?.id || '',
            first_name: response.data.item.user_details?.first_name || '',
            last_name: response.data.item.user_details?.last_name || '',
            email: response.data.item.user_details?.email || '',
            role: response.data.item.user_details?.role || 'student',
            student_id: response.data.item.user_details?.student_id,
            is_active: response.data.item.user_details?.is_active || true,
            created_at: response.data.item.user_details?.created_at || new Date().toISOString(),
            updated_at: response.data.item.user_details?.updated_at || new Date().toISOString()
          } : undefined,
          message: response.message,
          item: response.data.item
        });
      } else {
        setScanResult({
          status: 'invalid',
          message: response.message || 'QR code verification failed'
        });
      }
    } catch (error: any) {
      setScanResult({
        status: 'invalid',
        message: error.message || 'QR code verification failed'
      });
    } finally {
      setLoading(false);
      setShowQRScanner(false);
    }
  };

  const handleVehicleEntry = async () => {
    if (!vehiclePlate.trim()) return;

    setLoading(true);
    try {
      const response = await GateApiService.logVehicleEntry({
        plate_number: vehiclePlate.trim(),
        notes: `Vehicle entry logged by guard`,
        location: 'Main Gate'
      });

      if (response.success) {
        setScanResult({
          status: response.data.status,
          message: response.message,
          user: response.data.user ? {
            id: response.data.vehicle?.user_details?.id || '',
            first_name: response.data.vehicle?.user_details?.first_name || '',
            last_name: response.data.vehicle?.user_details?.last_name || '',
            email: response.data.vehicle?.user_details?.email || '',
            role: response.data.vehicle?.user_details?.role || 'student',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } : undefined
        });
      }
      
      setVehiclePlate('');
    } catch (error: any) {
      setScanResult({
        status: 'invalid',
        message: error.message || 'Failed to log vehicle entry'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDayScholarStatus = async (scholarId: string) => {
    try {
      setLoading(true);
      const response = await GateApiService.toggleScholarStatus(scholarId);
      
      if (response.success) {
        // Reload day scholars to get updated data
        await loadDayScholars();
        
        // Show success message
        const scholar = dayScholars.find(s => s.id === scholarId);
        if (scholar) {
          const action = response.data.status === 'in' ? 'checked in' : 'checked out';
          setScanResult({
            status: 'valid',
            message: `${scholar.first_name} ${scholar.last_name} ${action} successfully`
          });
        }
      }
    } catch (error: any) {
      setScanResult({
        status: 'invalid',
        message: error.message || 'Failed to update status'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearScanResult = () => {
    setScanResult(null);
  };

  const StatusAlert = () => {
    if (!scanResult) return null;

    const severity = scanResult.status === 'valid' ? 'success' :
      scanResult.status === 'visitor' ? 'warning' : 'error';

    return (
      <Alert
        severity={severity}
        sx={{ mb: 3, fontSize: '1.25rem', minHeight: 80 }}
        action={
          <IconButton color="inherit" size="large" onClick={clearScanResult}>
            <Refresh />
          </IconButton>
        }
        icon={
          scanResult.status === 'valid' ? <CheckCircle fontSize="large" /> :
            scanResult.status === 'visitor' ? <Warning fontSize="large" /> :
              <Cancel fontSize="large" />
        }
      >
        <Box>
          <Typography variant="h6" component="div">
            {scanResult.message}
          </Typography>
          {scanResult.user && (
            <Typography variant="body1">
              {scanResult.user.first_name} {scanResult.user.last_name}
              {scanResult.user.student_id && ` (${scanResult.user.student_id})`}
            </Typography>
          )}
          {scanResult.item && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {scanResult.item.serial_number && `Serial: ${scanResult.item.serial_number}`}
              {scanResult.item.plate_number && `Plate: ${scanResult.item.plate_number}`}
              {scanResult.item.brand && ` | ${scanResult.item.brand} ${scanResult.item.model}`}
            </Typography>
          )}
        </Box>
      </Alert>
    );
  };

  const theme = highContrastMode ? guardTheme : guardTheme;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        p: 2
      }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={600}>
            Security Gate Control
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={highContrastMode}
                onChange={(e) => setHighContrastMode(e.target.checked)}
                color="primary"
              />
            }
            label="High Contrast"
          />
        </Box>

        <StatusAlert />

        <Grid container spacing={3}>
          {/* Asset Verification */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <QrCodeScanner sx={{ fontSize: 80, mb: 2, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Asset Verification
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Scan student/staff asset QR codes
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<QrCodeScanner />}
                  onClick={() => setShowQRScanner(true)}
                  sx={{ fontSize: '1.25rem', py: 2 }}
                >
                  Start Scanning
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Vehicle Entry */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <DirectionsCar sx={{ fontSize: 80, mb: 2, color: 'secondary.main' }} />
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Vehicle Entry
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Log vehicle entries and exits
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  label="License Plate Number"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                  placeholder="e.g., KDA 123A"
                  sx={{ mb: 3 }}
                  InputLabelProps={{ style: { fontSize: '1.25rem' } }}
                  inputProps={{ style: { fontSize: '1.5rem', textAlign: 'center' } }}
                />

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleVehicleEntry}
                  disabled={!vehiclePlate.trim() || loading}
                  sx={{ fontSize: '1.25rem', py: 2 }}
                >
                  {loading ? 'Logging...' : 'Log Vehicle Entry'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Day Scholars */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '500px', overflow: 'hidden' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <People sx={{ fontSize: 60, mb: 1, color: 'info.main' }} />
                  <Typography variant="h5" fontWeight={600}>
                    Day Scholars ({dayScholars.filter(s => s.day_scholar_status?.status === 'in').length} In)
                  </Typography>
                </Box>

                <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                  {dayScholars.map((scholar, index) => (
                    <React.Fragment key={scholar.id}>
                      <ListItem
                        secondaryAction={
                          <Button
                            variant={scholar.day_scholar_status?.status === 'in' ? 'outlined' : 'contained'}
                            color={scholar.day_scholar_status?.status === 'in' ? 'error' : 'success'}
                            size="large"
                            onClick={() => toggleDayScholarStatus(scholar.id)}
                            disabled={loading}
                            sx={{ minWidth: 80, fontSize: '1.1rem' }}
                          >
                            {loading ? '...' : `Sign ${scholar.day_scholar_status?.status === 'in' ? 'Out' : 'In'}`}
                          </Button>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: scholar.day_scholar_status?.status === 'in' ? 'success.main' : 'grey.500' }}>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body1" fontWeight={500}>
                                {scholar.first_name} {scholar.last_name}
                              </Typography>
                              <Chip
                                label={scholar.day_scholar_status?.status?.toUpperCase() || 'OUT'}
                                color={scholar.day_scholar_status?.status === 'in' ? 'success' : 'default'}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={scholar.student_id}
                        />
                      </ListItem>
                      {index < dayScholars.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* QR Scanner Modal */}
        <QRScanner
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScan={handleQRScan}
          onError={(error) => {
            setScanResult({
              status: 'invalid',
              message: error
            });
            setShowQRScanner(false);
          }}
          title="Scan Asset QR Code"
        />
      </Box>
    </ThemeProvider>
  );
};

export default GuardInterface;