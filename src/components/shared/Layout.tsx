import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Container
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Dashboard,
  Security,
  DirectionsCar,
  Laptop,
  People
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  user?: User | null;
  title?: string;
  showNavigation?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  title = "GatePass", 
  showNavigation = true 
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    localStorage.removeItem('gatepass_token');
    navigate('/login');
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const getRoleBasedNavigation = () => {
    if (!user) return null;

    switch (user.role) {
      case 'student':
      case 'staff':
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton color="inherit" onClick={() => navigate('/dashboard')}>
              <Dashboard />
              <Typography variant="body2" sx={{ ml: 0.5 }}>Dashboard</Typography>
            </IconButton>
            <IconButton color="inherit" onClick={() => navigate('/assets')}>
              <Laptop />
              <Typography variant="body2" sx={{ ml: 0.5 }}>Assets</Typography>
            </IconButton>
            <IconButton color="inherit" onClick={() => navigate('/vehicles')}>
              <DirectionsCar />
              <Typography variant="body2" sx={{ ml: 0.5 }}>Vehicles</Typography>
            </IconButton>
          </Box>
        );
      case 'guard':
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton color="inherit" onClick={() => navigate('/guard')}>
              <Security />
              <Typography variant="body2" sx={{ ml: 0.5 }}>Security</Typography>
            </IconButton>
          </Box>
        );
      case 'admin':
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton color="inherit" onClick={() => navigate('/admin')}>
              <Dashboard />
              <Typography variant="body2" sx={{ ml: 0.5 }}>Admin</Typography>
            </IconButton>
            <IconButton color="inherit" onClick={() => navigate('/admin/users')}>
              <People />
              <Typography variant="body2" sx={{ ml: 0.5 }}>Users</Typography>
            </IconButton>
            <IconButton color="inherit" onClick={() => navigate('/admin/logs')}>
              <Security />
              <Typography variant="body2" sx={{ ml: 0.5 }}>Logs</Typography>
            </IconButton>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ flexGrow: 0, mr: 3, fontWeight: 600 }}
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            {title}
          </Typography>
          
          {showNavigation && user && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
              {getRoleBasedNavigation()}
            </Box>
          )}

          {user && (
            <Box>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Avatar 
                  src={user.photo} 
                  sx={{ width: 32, height: 32 }}
                >
                  <AccountCircle />
                </Avatar>
                <Typography variant="body2">
                  {user.firstName} {user.lastName}
                </Typography>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleProfile}>
                  <AccountCircle sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Container maxWidth={false} sx={{ mt: 3, mb: 3 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;