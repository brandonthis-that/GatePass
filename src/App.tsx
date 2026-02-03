import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './auth/AuthContext';
import { baseTheme } from './components/shared/theme';

// Pages (will be created)
import LoginPage from './pages/auth/LoginPage';
import StudentDashboard from './pages/student/Dashboard';
import GuardInterface from './pages/guard/Interface';
import AdminDashboard from './pages/admin/Dashboard';

// Protected Route component
import { ProtectedRoute } from './components/shared/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={baseTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student', 'staff']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/guard"
              element={
                <ProtectedRoute allowedRoles={['guard']}>
                  <GuardInterface />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
