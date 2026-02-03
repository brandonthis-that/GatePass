import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { User } from '../../types';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  fallbackPath = '/login'
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading message="Verifying access..." fullScreen />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    const redirectPaths: Record<User['role'], string> = {
      student: '/dashboard',
      staff: '/dashboard',
      guard: '/guard',
      admin: '/admin'
    };
    
    return <Navigate to={redirectPaths[user.role]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;