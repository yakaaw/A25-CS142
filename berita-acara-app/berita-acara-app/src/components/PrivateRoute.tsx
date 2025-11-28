import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermission?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles, requiredPermission }) => {
  const { currentUser, userProfile, loading, permissions } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!loading && currentUser) {
      if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role || '')) {
        showToast('Anda tidak memiliki akses ke halaman ini', 'error');
      } else if (requiredPermission && !permissions.includes(requiredPermission)) {
        showToast('Anda tidak memiliki izin untuk mengakses halaman ini', 'error');
      }
    }
  }, [loading, currentUser, allowedRoles, userProfile, requiredPermission, permissions, showToast]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role || '')) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
