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

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Student Routes */}
          <Route path="/student" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/assets" element={<PrivateRoute><MyAssets /></PrivateRoute>} />
          <Route path="/student/vehicles" element={<PrivateRoute><MyVehicles /></PrivateRoute>} />
          
          {/* Guard Routes */}
          <Route path="/guard" element={<PrivateRoute><GuardDashboard /></PrivateRoute>} />
          <Route path="/guard/verify" element={<PrivateRoute><VerifyAsset /></PrivateRoute>} />
          <Route path="/guard/vehicle" element={<PrivateRoute><LogVehicle /></PrivateRoute>} />
          <Route path="/guard/scholars" element={<PrivateRoute><DayScholars /></PrivateRoute>} />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

