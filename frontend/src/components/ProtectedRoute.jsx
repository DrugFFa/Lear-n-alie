import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function ProtectedRoute({ children, requireAdminRole = false, allowPending = false }) {
  const { user, loading, isAuthenticated, isPending, isSuspended, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen text="Memverifikasi autentikasi..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isSuspended) {
    return <Navigate to="/403" state={{ reason: 'Akun Anda sedang ditangguhkan.' }} replace />;
  }

  if (isPending && !allowPending) {
    return <Navigate to="/pending" replace />;
  }

  if (requireAdminRole && !isAdmin) {
    return <Navigate to="/403" state={{ reason: 'Halaman ini khusus untuk Administrator.' }} replace />;
  }

  return children;
}
