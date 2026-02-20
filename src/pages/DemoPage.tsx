import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import { useNavigate } from 'react-router-dom';

const DemoPage: React.FC = () => {
  const navigate = useNavigate();

  const testAccounts = [
    {
      email: 'admin@anu.ac.ke',
      password: 'admin123',
      role: 'admin',
      name: 'System Administrator',
      description: 'Full access to all features',
      icon: <AdminPanelSettingsIcon />,
      color: 'error' as const
    },
    {
      email: 'guard@anu.ac.ke', 
      password: 'guard123',
      role: 'guard',
      name: 'Security Guard',
      description: 'QR scanning, vehicle logging, day scholar management',
      icon: <SecurityIcon />,
      color: 'warning' as const
    },
    {
      email: 'jdoe@anu.ac.ke',
      password: 'pass123', 
      role: 'student',
      name: 'John Doe (Student)',
      description: 'Asset registration, vehicle management, QR codes',
      icon: <SchoolIcon />,
      color: 'primary' as const
    },
    {
      email: 'mary.jane@anu.ac.ke',
      password: 'mary123',
      role: 'student', 
      name: 'Mary Jane (Student)',
      description: 'Student dashboard and asset management',
      icon: <SchoolIcon />,
      color: 'primary' as const
    },
    {
      email: 'staff@anu.ac.ke',
      password: 'staff123',
      role: 'staff',
      name: 'Jane Smith (Staff)',
      description: 'Staff dashboard with asset and vehicle registration',
      icon: <WorkIcon />,
      color: 'secondary' as const
    }
  ];

  const features = [
    'Asset Registration & Management (Laptops, Phones, Tablets)',
    'Vehicle Registration & QR Code Generation',
    'Real-time QR Code Verification',
    'Day Scholar Check-in/Check-out System',
    'Vehicle Entry Logging',
    'Security Guard Interface with High-Contrast Mode',
    'Administrative Dashboard & Reporting',
    'Gate Activity Logs & Analytics',
    'Role-based Access Control',
    'JWT Authentication & API Integration'
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h3"
            fontWeight={700}
            color="white"
            gutterBottom
          >
            GatePass Demo
          </Typography>
          <Typography
            variant="h6"
            color="rgba(255, 255, 255, 0.9)"
            mb={3}
          >
            Africa Nazarene University Gate Management System
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            Go to Login Page
          </Button>
        </Box>

        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
          {/* Test Accounts */}
          <Card elevation={8}>
            <CardContent>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                🔑 Test Accounts
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Use these credentials to test different user roles:
              </Typography>

              <List>
                {testAccounts.map((account, index) => (
                  <React.Fragment key={account.email}>
                    <ListItem>
                      <ListItemIcon>
                        {account.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {account.name}
                            </Typography>
                            <Chip 
                              label={account.role.toUpperCase()} 
                              size="small" 
                              color={account.color}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" mb={0.5}>
                              {account.description}
                            </Typography>
                            <Typography variant="body2" component="div">
                              <strong>Email:</strong> {account.email}<br/>
                              <strong>Password:</strong> {account.password}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < testAccounts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* System Features */}
          <Card elevation={8}>
            <CardContent>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                ✨ System Features
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Complete gate management solution with modern features:
              </Typography>

              <List dense>
                {features.map((feature, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon>
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: 'primary.main',
                          mr: 1
                        }} 
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography variant="body2">
                          {feature}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  📱 Backend Status:
                </Typography>
                <Typography variant="body2">
                  Django REST API running on http://localhost:8000<br/>
                  React Frontend on http://localhost:3000
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Quick Start Guide */}
        <Card elevation={8} sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              🚀 Quick Start Guide
            </Typography>
            
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr 1fr' }} gap={3} mt={2}>
              <Box>
                <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
                  1. Login as Student
                </Typography>
                <Typography variant="body2">
                  Use <strong>jdoe@anu.ac.ke</strong> to register assets and vehicles, 
                  generate QR codes, and access the student dashboard.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={600} color="warning.main" gutterBottom>
                  2. Test Guard Interface
                </Typography>
                <Typography variant="body2">
                  Use <strong>guard@anu.ac.ke</strong> to scan QR codes, log vehicle entries,
                  and manage day scholar check-ins.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={600} color="error.main" gutterBottom>
                  3. Admin Dashboard
                </Typography>
                <Typography variant="body2">
                  Use <strong>admin@anu.ac.ke</strong> to access reports, manage users,
                  and view system analytics.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
            © 2026 Africa Nazarene University - GatePass Management System
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.6)" mt={1}>
            Built with React, TypeScript, Django & Material-UI
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default DemoPage;