import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import MyAssets from './pages/student/MyAssets';
import MyVehicles from './pages/student/MyVehicles';
import GuardDashboard from './pages/guard/Dashboard';
import VerifyAsset from './pages/guard/VerifyAsset';
import LogVehicle from './pages/guard/LogVehicle';
import DayScholars from './pages/guard/DayScholars';
import './App.css';

function PrivateRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to a default page if the role doesn't match
    return <Navigate to={user.role === 'student' ? '/student' : '/guard'} />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Student Routes */}
          <Route path="/student" element={<PrivateRoute requiredRole="student"><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/assets" element={<PrivateRoute requiredRole="student"><MyAssets /></PrivateRoute>} />
          <Route path="/student/vehicles" element={<PrivateRoute requiredRole="student"><MyVehicles /></PrivateRoute>} />
          
          {/* Guard Routes */}
          <Route path="/guard" element={<PrivateRoute requiredRole="guard"><GuardDashboard /></PrivateRoute>} />
          <Route path="/guard/verify" element={<PrivateRoute requiredRole="guard"><VerifyAsset /></PrivateRoute>} />
          <Route path="/guard/vehicle" element={<PrivateRoute requiredRole="guard"><LogVehicle /></PrivateRoute>} />
          <Route path="/guard/scholars" element={<PrivateRoute requiredRole="guard"><DayScholars /></PrivateRoute>} />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

