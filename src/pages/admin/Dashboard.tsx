import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Avatar,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,

} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  Security,
  DirectionsCar,
  Laptop,
  Add,
  Edit,
  Delete,
  Download,
  Refresh,
  FilterList,
  Search
} from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import Layout from '../../components/shared/Layout';
import { User, GateLog, DashboardStats } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<GateLog[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mock data
  useEffect(() => {
    setStats({
      totalUsers: 1247,
      totalAssets: 856,
      totalVehicles: 324,
      todayLogs: 89,
      activeGuards: 8
    });

    setUsers([
      {
        id: '1',
        email: 'john.doe@anu.ac.ke',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
        studentId: '2023001',
        phone: '+254712345678',
        department: 'Computer Science',
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-02-01T14:20:00Z'
      },
      {
        id: '2',
        email: 'jane.smith@anu.ac.ke',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'staff',
        staffId: 'ST2024001',
        phone: '+254723456789',
        department: 'Security',
        isActive: true,
        createdAt: '2024-01-10T09:15:00Z',
        updatedAt: '2024-02-02T11:45:00Z'
      },
      {
        id: '3',
        email: 'mike.guard@anu.ac.ke',
        firstName: 'Mike',
        lastName: 'Wilson',
        role: 'guard',
        staffId: 'GD2024001',
        phone: '+254734567890',
        department: 'Security',
        isActive: true,
        createdAt: '2024-01-05T08:00:00Z',
        updatedAt: '2024-02-03T16:30:00Z'
      }
    ]);

    setLogs([
      {
        id: '1',
        type: 'asset_verification',
        userId: '1',
        guardId: '3',
        status: 'valid',
        timestamp: new Date().toISOString(),
        notes: 'HP EliteBook verified'
      },
      {
        id: '2',
        type: 'vehicle_entry',
        userId: '2',
        guardId: '3',
        status: 'valid',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        notes: 'KDA 123A - Toyota Corolla'
      },
      {
        id: '3',
        type: 'day_scholar_in',
        userId: '1',
        guardId: '3',
        status: 'valid',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        notes: 'John Doe signed in'
      }
    ]);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleDeleteUser = (userId: string) => {
    // Implement delete user
    console.log('Delete user:', userId);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'success';
      case 'invalid': return 'error';
      case 'visitor': return 'warning';
      default: return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'guard': return 'warning';
      case 'staff': return 'info';
      case 'student': return 'primary';
      default: return 'default';
    }
  };

  const StatsCard = ({ title, value, icon, color }: any) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight={600}>
              {value.toLocaleString()}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  // Simple table data for users
  const userTableRows = users.map(user => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role: user.role,
    department: user.department || '-',
    isActive: user.isActive
  }));

  // Simple table data for logs  
  const logTableRows = logs.map(log => ({
    id: log.id,
    timestamp: formatTimestamp(log.timestamp),
    type: log.type,
    status: log.status,
    notes: log.notes || '-',
    guardId: log.guardId
  }));

  return (
    <Layout user={user} title="GatePass - Administration">
      <Box>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          System Administration
        </Typography>

        {/* Stats Overview */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatsCard
                title="Total Users"
                value={stats.totalUsers}
                icon={<People />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatsCard
                title="Assets"
                value={stats.totalAssets}
                icon={<Laptop />}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatsCard
                title="Vehicles"
                value={stats.totalVehicles}
                icon={<DirectionsCar />}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatsCard
                title="Today's Logs"
                value={stats.todayLogs}
                icon={<Security />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatsCard
                title="Active Guards"
                value={stats.activeGuards}
                icon={<DashboardIcon />}
                color="success"
              />
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="User Management" />
              <Tab label="Access Logs" />
              <Tab label="Reports" />
              <Tab label="Settings" />
            </Tabs>
          </Box>

          {/* User Management Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">User Management</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowUserDialog(true)}
              >
                Add User
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userTableRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role.toUpperCase()}
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditUser(users.find(u => u.id === user.id)!)} size="small">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteUser(user.id)} size="small">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={users.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))}
            />
          </TabPanel>

          {/* Access Logs Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Access Logs</Typography>
              <Box display="flex" gap={1}>
                <Button variant="outlined" startIcon={<FilterList />}>
                  Filter
                </Button>
                <Button variant="outlined" startIcon={<Download />}>
                  Export
                </Button>
                <Button variant="outlined" startIcon={<Refresh />}>
                  Refresh
                </Button>
              </Box>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Guard ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logTableRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.type.replace('_', ' ').toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.status.toUpperCase()}
                          color={getStatusColor(log.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{log.notes}</TableCell>
                      <TableCell>{log.guardId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={logs.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))}
            />
          </TabPanel>

          {/* Reports Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>Reports & Analytics</Typography>
            <Typography variant="body1" color="text.secondary">
              Advanced reporting features will be implemented here including:
            </Typography>
            <Box component="ul" sx={{ mt: 2 }}>
              <li>Daily/Weekly/Monthly access summaries</li>
              <li>User activity reports</li>
              <li>Security incident reports</li>
              <li>Asset verification statistics</li>
              <li>Custom date range reports</li>
            </Box>
          </TabPanel>

          {/* Settings Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>System Settings</Typography>
            <Typography variant="body1" color="text.secondary">
              System configuration options will be implemented here including:
            </Typography>
            <Box component="ul" sx={{ mt: 2 }}>
              <li>Security policies</li>
              <li>Access control settings</li>
              <li>Notification preferences</li>
              <li>Backup and maintenance</li>
              <li>Integration settings</li>
            </Box>
          </TabPanel>
        </Card>

        {/* User Dialog */}
        <Dialog open={showUserDialog} onClose={() => setShowUserDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              User management form will be implemented here with full CRUD capabilities.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowUserDialog(false)}>Cancel</Button>
            <Button variant="contained">
              {selectedUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default AdminDashboard;