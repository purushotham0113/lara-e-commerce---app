import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ adminOnly = false, allowVendor = false }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Strict Admin Check
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Vendor or Admin Check (Prevents regular Customers)
  if (allowVendor && !user.isVendor && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;