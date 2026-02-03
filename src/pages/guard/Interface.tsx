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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
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
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAuth } from '../../auth/AuthContext';
import { guardTheme } from '../../components/shared/theme';
import QRScanner from '../../components/shared/QRScanner';
import { QRCodeData, GateLog, User } from '../../types';

const GuardInterface: React.FC = () => {
  const { user } = useAuth();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'valid' | 'invalid' | 'visitor';
    user?: User;
    message: string;
  } | null>(null);
  const [dayScholars, setDayScholars] = useState<Array<User & { status: 'in' | 'out' }>>([]);
  const [recentLogs, setRecentLogs] = useState<GateLog[]>([]);
  const [highContrastMode, setHighContrastMode] = useState(true);

  // Mock day scholars data
  useEffect(() => {
    setDayScholars([
      {
        id: '1',
        email: 'john.doe@anu.ac.ke',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
        studentId: '2023001',
        isActive: true,
        status: 'out',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        email: 'jane.smith@anu.ac.ke',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'student',
        studentId: '2023002',
        isActive: true,
        status: 'in',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  }, []);

  const handleQRScan = (qrData: QRCodeData) => {
    // Mock validation - replace with API call
    const isValid = Math.random() > 0.3; // 70% success rate for demo

    if (isValid) {
      setScanResult({
        status: 'valid',
        user: {
          id: qrData.userId,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@anu.ac.ke',
          role: 'student',
          studentId: '2023001',
          photo: '/placeholder-avatar.png',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        message: 'Asset verified successfully'
      });
    } else {
      setScanResult({
        status: 'invalid',
        message: 'Invalid or expired QR code'
      });
    }
  };

  const handleVehicleEntry = () => {
    if (!vehiclePlate.trim()) return;

    // Mock vehicle validation
    const isRegistered = Math.random() > 0.5; // 50% chance for demo

    const log: GateLog = {
      id: Date.now().toString(),
      type: 'vehicle_entry',
      guardId: user?.id || '',
      status: isRegistered ? 'valid' : 'visitor',
      timestamp: new Date().toISOString(),
      notes: `Vehicle ${vehiclePlate} - ${isRegistered ? 'Registered' : 'Visitor'}`
    };

    setRecentLogs(prev => [log, ...prev.slice(0, 9)]);
    setScanResult({
      status: isRegistered ? 'valid' : 'visitor',
      message: isRegistered
        ? `Vehicle ${vehiclePlate} is registered`
        : `Vehicle ${vehiclePlate} marked as visitor`
    });
    setVehiclePlate('');
  };

  const toggleDayScholarStatus = (scholarId: string) => {
    setDayScholars(prev => prev.map(scholar => {
      if (scholar.id === scholarId) {
        const newStatus = scholar.status === 'in' ? 'out' : 'in';

        // Log the action
        const log: GateLog = {
          id: Date.now().toString(),
          type: newStatus === 'in' ? 'day_scholar_in' : 'day_scholar_out',
          userId: scholarId,
          guardId: user?.id || '',
          status: 'valid',
          timestamp: new Date().toISOString(),
          notes: `${scholar.firstName} ${scholar.lastName} signed ${newStatus}`
        };

        setRecentLogs(prev => [log, ...prev.slice(0, 9)]);

        return { ...scholar, status: newStatus };
      }
      return scholar;
    }));
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
              {scanResult.user.firstName} {scanResult.user.lastName}
              {scanResult.user.studentId && ` (${scanResult.user.studentId})`}
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
                  disabled={!vehiclePlate.trim()}
                  sx={{ fontSize: '1.25rem', py: 2 }}
                >
                  Log Vehicle Entry
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
                    Day Scholars ({dayScholars.filter(s => s.status === 'in').length} In)
                  </Typography>
                </Box>

                <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                  {dayScholars.map((scholar, index) => (
                    <React.Fragment key={scholar.id}>
                      <ListItem
                        secondaryAction={
                          <Button
                            variant={scholar.status === 'in' ? 'outlined' : 'contained'}
                            color={scholar.status === 'in' ? 'error' : 'success'}
                            size="large"
                            onClick={() => toggleDayScholarStatus(scholar.id)}
                            sx={{ minWidth: 80, fontSize: '1.1rem' }}
                          >
                            Sign {scholar.status === 'in' ? 'Out' : 'In'}
                          </Button>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: scholar.status === 'in' ? 'success.main' : 'grey.500' }}>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body1" fontWeight={500}>
                                {scholar.firstName} {scholar.lastName}
                              </Typography>
                              <Chip
                                label={scholar.status.toUpperCase()}
                                color={scholar.status === 'in' ? 'success' : 'default'}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={scholar.studentId}
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