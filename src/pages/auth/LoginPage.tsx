import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Avatar,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Security,
  Visibility,
  VisibilityOff,
  Email,
  Lock
} from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Loading from '../../components/shared/Loading';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      const redirectPaths: Record<string, string> = {
        student: '/dashboard',
        staff: '/dashboard',
        guard: '/guard',
        admin: '/admin'
      };
      
      const from = (location.state as any)?.from?.pathname || redirectPaths[user.role];
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation will be handled by the useEffect above
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoading) {
    return <Loading message="Signing in..." fullScreen />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3
      }}
    >
      <Container maxWidth="sm">
        <Card 
          elevation={24}
          sx={{ 
            borderRadius: 3,
            overflow: 'visible'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 64,
                  height: 64,
                  mb: 2
                }}
              >
                <Security fontSize="large" />
              </Avatar>
              
              <Typography 
                variant="h4" 
                component="h1" 
                fontWeight={600}
                color="text.primary"
                gutterBottom
              >
                GatePass
              </Typography>
              
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                textAlign="center"
              >
                Africa Nazarene University
              </Typography>
              
              <Typography 
                variant="body2" 
                color="text.secondary"
                textAlign="center"
                sx={{ mb: 2 }}
              >
                Integrated Gate Access & Asset Management System
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="outlined"
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter your university email"
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="outlined"
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter your password"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading || !email || !password}
                sx={{ 
                  mb: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Typography 
                variant="body2" 
                color="text.secondary" 
                textAlign="center"
                sx={{ mt: 2 }}
              >
                Authorized personnel only. All access is monitored.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography 
          variant="caption" 
          color="rgba(255, 255, 255, 0.8)" 
          textAlign="center"
          sx={{ mt: 3, display: 'block' }}
        >
          © 2026 Africa Nazarene University. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default LoginPage;