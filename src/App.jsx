import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { CartProvider } from './Context/CartContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import LandingPage from './components/LandingPage';
import Navbar from './components/Common/Navbar';
import AdminDashboard from './components/Dashboard/AdminDashBoard';
import Reports from './components/Dashboard/Reports';
import POSInterface from './components/Orders/POSInterface';
import OrderQueue from './components/Orders/OrderQueue';
import MenuView from './components/Menu/MenuView';
import InventoryLogs from './components/Dashboard/InventoryLogs';
import './App.css';
import './index.css';
import CustomerOrders from './components/Customer/CustomerOrders';
import CashierDashboard from "./components/Dashboard/CashierDashboard";
import CustomerDashboard from "./components/Dashboard/CustomerDashboard";

// Import only index.css (remove App.css import if it's causing issues)
import "./index.css";
// import './App.css'; // Comment this out temporarily to test

// Create a separate component that uses the auth hook
function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            style: {
              background: "#10b981",
            },
          },
          error: {
            style: {
              background: "#ef4444",
            },
          },
        }}
      />

      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard - Role based */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                  {user?.role === "admin" && <AdminDashboard />}
                  {user?.role === "cashier" && <CashierDashboard />}
                  {user?.role === "customer" && <CustomerDashboard />}
                </div>
              </>
            </ProtectedRoute>
          }
        />

        {/* POS Interface - Cashier & Admin */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute requiredRole={["cashier", "admin"]}>
              <>
                <Navbar />
                <POSInterface />
              </>
            </ProtectedRoute>
          }
        />

        {/* Order Queue - Cashier and Admin */}
        <Route
          path="/orders/queue"
          element={
            <ProtectedRoute requiredRole={["cashier", "admin"]}>
              <>
                <Navbar />
                <div className="px-2 sm:px-4 py-4">
                  <OrderQueue />
                </div>
              </>
            </ProtectedRoute>
          }
        />

        {/* Menu View - All authenticated users */}
        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                  <MenuView />
                </div>
              </>
            </ProtectedRoute>
          }
        />

        {/* Customer Orders - Customer only */}
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute requiredRole="customer">
              <>
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                  <CustomerOrders />
                </div>
              </>
            </ProtectedRoute>
          }
        />

        {/* Reports - Admin only */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <>
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                  <Reports />
                </div>
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory-logs"
          element={
            <ProtectedRoute requiredRole="admin">
              <>
                <Navbar />
                <InventoryLogs />
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
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;