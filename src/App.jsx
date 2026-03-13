import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './Context/AuthContext'; // Add useAuth here
import { CartProvider } from './Context/CartContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Navbar from './components/Common/Navbar';
import AdminDashboard from './components/Dashboard/AdminDashBoard';
import Reports from './components/Dashboard/Reports';
import POSInterface from './components/Orders/POSInterface';
import OrderQueue from './components/Orders/OrderQueue';
import MenuView from './components/Menu/MenuView';
import './App.css';
import './index.css';
import CustomerOrders from './components/Customer/CustomerOrders';
import CashierDashboard from "./components/Dashboard/CashierDashboard";
import CustomerDashboard from "./components/Dashboard/CustomerDashboard";

// Create a separate component that uses the auth hook
function AppContent() {
  const { user } = useAuth(); // Get user from auth context

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                {user?.role === 'admin' && <AdminDashboard />}
                {user?.role === 'cashier' && <CashierDashboard />}
                {user?.role === 'customer' && <CustomerDashboard />}
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pos"
          element={
            <ProtectedRoute requiredRole="cashier">
              <>
                <Navbar />
                <POSInterface />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/queue"
          element={
            <ProtectedRoute requiredRole={['cashier', 'admin']}>
              <>
                <Navbar />
                <OrderQueue />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <MenuView />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute requiredRole="customer">
              <>
                <Navbar />
                <CustomerOrders />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <>
                <Navbar />
                <Reports />
              </>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// Main App component with providers
function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent /> {/* This component has access to auth context */}
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;