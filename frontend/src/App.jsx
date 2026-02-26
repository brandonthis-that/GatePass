import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import AssetForm from './pages/student/AssetForm';
import AssetDetail from './pages/student/AssetDetail';
import VehicleForm from './pages/student/VehicleForm';

// Guard Pages
import GuardDashboard from './pages/guard/Dashboard';
import AssetVerify from './pages/guard/AssetVerify';
import VehicleLogger from './pages/guard/VehicleLogger';
import DayScholars from './pages/guard/DayScholars';
import VisitorForm from './pages/guard/VisitorForm';


const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Force password change on first login (assuming password = student_id or default)
  // The backend might not explicitly flag this, but if we have a "must_change_password" concept,
  // we could handle it here. 

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if they hit the wrong route
    if (user.role === 'student') return <Navigate to="/student" replace />;
    if (user.role === 'guard' || user.role === 'admin') return <Navigate to="/guard" replace />;
  }

  return children;
};


function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role === 'student' ? 'student' : 'guard'}`} /> : <Login />} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/asset/new" element={<ProtectedRoute allowedRoles={['student']}><AssetForm /></ProtectedRoute>} />
      <Route path="/student/asset/:id" element={<ProtectedRoute allowedRoles={['student']}><AssetDetail /></ProtectedRoute>} />
      <Route path="/student/vehicle/new" element={<ProtectedRoute allowedRoles={['student']}><VehicleForm /></ProtectedRoute>} />

      {/* Guard Routes */}
      <Route path="/guard" element={<ProtectedRoute allowedRoles={['guard', 'admin']}><GuardDashboard /></ProtectedRoute>} />
      <Route path="/guard/asset/verify" element={<ProtectedRoute allowedRoles={['guard', 'admin']}><AssetVerify /></ProtectedRoute>} />
      <Route path="/guard/vehicle" element={<ProtectedRoute allowedRoles={['guard', 'admin']}><VehicleLogger /></ProtectedRoute>} />
      <Route path="/guard/scholars" element={<ProtectedRoute allowedRoles={['guard', 'admin']}><DayScholars /></ProtectedRoute>} />
      <Route path="/guard/visitor/new" element={<ProtectedRoute allowedRoles={['guard', 'admin']}><VisitorForm /></ProtectedRoute>} />

      {/* Default Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
