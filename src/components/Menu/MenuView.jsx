import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import MenuList from './MenuList';
import CustomerMenu from '../Customer/CustomerMenu';

const MenuView = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <MenuList />;
  }

  if (user.role === 'customer') {
    return <CustomerMenu />;
  }

  // For other roles (cashier, etc.) redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default MenuView;
