import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CubeIcon,
  ShoppingCartIcon,
  QueueListIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-white text-[#800000] shadow-sm'
        : 'text-white/85 hover:text-white hover:bg-white/15'
    }`;

  const mobileLinkClass = (path) =>
    `flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
      isActive(path)
        ? 'bg-[#800000]/10 text-[#800000]'
        : 'text-gray-700 hover:bg-gray-50'
    }`;

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    cashier: 'bg-blue-100 text-blue-700',
    customer: 'bg-green-100 text-green-700',
  };

  return (
    <nav className="sticky top-0 z-50 shadow-lg" style={{ background: 'linear-gradient(135deg, #800000 0%, #9B1C1C 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">

          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🍽️</span>
            <span className="text-white font-bold text-lg tracking-tight">Eljay's <span className="font-light opacity-80">Kusina</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-1">
            <Link to="/dashboard" className={linkClass('/dashboard')}>
              <HomeIcon className="h-4 w-4" />Dashboard
            </Link>

            {user?.role === 'customer' && (
              <>
                <Link to="/menu" className={linkClass('/menu')}>
                  <CubeIcon className="h-4 w-4" />Menu
                </Link>
                <Link to="/my-orders" className={linkClass('/my-orders')}>
                  <ClipboardDocumentListIcon className="h-4 w-4" />My Orders
                </Link>
              </>
            )}

            {user?.role === 'cashier' && (
              <>
                <Link to="/pos" className={linkClass('/pos')}>
                  <ShoppingCartIcon className="h-4 w-4" />POS
                </Link>
                <Link to="/orders/queue" className={linkClass('/orders/queue')}>
                  <QueueListIcon className="h-4 w-4" />Order Queue
                </Link>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <Link to="/pos" className={linkClass('/pos')}>
                  <ShoppingCartIcon className="h-4 w-4" />POS
                </Link>
                <Link to="/orders/queue" className={linkClass('/orders/queue')}>
                  <QueueListIcon className="h-4 w-4" />Queue
                </Link>
                <Link to="/menu" className={linkClass('/menu')}>
                  <CubeIcon className="h-4 w-4" />Menu
                </Link>
                <Link to="/inventory-logs" className={linkClass('/inventory-logs')}>
                  <ClipboardDocumentListIcon className="h-4 w-4" />Inventory
                </Link>
                <Link to="/reports" className={linkClass('/reports')}>
                  <ChartBarIcon className="h-4 w-4" />Reports
                </Link>
                <Link to="/admin/users" className={linkClass('/admin/users')}>
                  <UsersIcon className="h-4 w-4" />Users
                </Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-white text-xs font-semibold leading-none">{user?.name}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 ${roleColors[user?.role] || 'bg-gray-100 text-gray-700'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/40 text-white text-sm font-medium rounded-full hover:bg-white/15 transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-2 text-white/80 hover:text-white"
          >
            {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <Link to="/dashboard" className={mobileLinkClass('/dashboard')} onClick={() => setMobileOpen(false)}>
              <HomeIcon className="h-5 w-5" />Dashboard
            </Link>
            {user?.role === 'customer' && (
              <>
                <Link to="/menu" className={mobileLinkClass('/menu')} onClick={() => setMobileOpen(false)}>
                  <CubeIcon className="h-5 w-5" />Menu
                </Link>
                <Link to="/my-orders" className={mobileLinkClass('/my-orders')} onClick={() => setMobileOpen(false)}>
                  <ClipboardDocumentListIcon className="h-5 w-5" />My Orders
                </Link>
              </>
            )}
            {user?.role === 'cashier' && (
              <>
                <Link to="/pos" className={mobileLinkClass('/pos')} onClick={() => setMobileOpen(false)}>
                  <ShoppingCartIcon className="h-5 w-5" />POS
                </Link>
                <Link to="/orders/queue" className={mobileLinkClass('/orders/queue')} onClick={() => setMobileOpen(false)}>
                  <QueueListIcon className="h-5 w-5" />Order Queue
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <Link to="/pos" className={mobileLinkClass('/pos')} onClick={() => setMobileOpen(false)}>
                  <ShoppingCartIcon className="h-5 w-5" />POS
                </Link>
                <Link to="/orders/queue" className={mobileLinkClass('/orders/queue')} onClick={() => setMobileOpen(false)}>
                  <QueueListIcon className="h-5 w-5" />Order Queue
                </Link>
                <Link to="/menu" className={mobileLinkClass('/menu')} onClick={() => setMobileOpen(false)}>
                  <CubeIcon className="h-5 w-5" />Menu
                </Link>
                <Link to="/inventory-logs" className={mobileLinkClass('/inventory-logs')} onClick={() => setMobileOpen(false)}>
                  <ClipboardDocumentListIcon className="h-5 w-5" />Inventory Logs
                </Link>
                <Link to="/reports" className={mobileLinkClass('/reports')} onClick={() => setMobileOpen(false)}>
                  <ChartBarIcon className="h-5 w-5" />Reports
                </Link>
                <Link to="/admin/users" className={mobileLinkClass('/admin/users')} onClick={() => setMobileOpen(false)}>
                  <UsersIcon className="h-5 w-5" />Users
                </Link>
              </>
            )}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#800000' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;