import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CubeIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Canteen MS</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                <HomeIcon className="h-5 w-5 mr-1" />
                Dashboard
              </Link>

              {user?.role === 'customer' && (
                <>
                  <Link
                    to="/menu"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    <CubeIcon className="h-5 w-5 mr-1" />
                    Menu
                  </Link>
                  <Link
                    to="/my-orders"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-1" />
                    My Orders
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/menu"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    <CubeIcon className="h-5 w-5 mr-1" />
                    Menu
                  </Link>
                
              {user?.role === 'cashier' && (
                    <>
                      <Link to="/pos" className="nav-link">POS</Link>
                      <Link to="/orders/queue" className="nav-link">Order Queue</Link>
                      <Link to="/inventory" className="nav-link">Inventory</Link>
                    </>
                  )}
                  <Link
                    to="/reports"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    <ChartBarIcon className="h-5 w-5 mr-1" />
                    Reports
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-4">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;