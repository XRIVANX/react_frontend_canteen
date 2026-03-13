import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../Services/api';
import { 
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CashierDashboard = () => {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    completedOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to safely format currency
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  const fetchCashierData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    try {
      setError(null);
      
      // Use the queue endpoint which cashiers have access to
      const queueRes = await api.get('/orders/queue');
      const queueOrders = queueRes.data || [];
      
      // Calculate stats from queue data with safe number conversion
      const totalRevenue = queueOrders.reduce((sum, order) => {
        const amount = parseFloat(order.total_amount) || 0;
        return sum + amount;
      }, 0);
      
      const pending = queueOrders.filter(o => o.status === 'pending').length;
      const preparing = queueOrders.filter(o => o.status === 'preparing').length;
      const ready = queueOrders.filter(o => o.status === 'ready').length;

      setStats({
        todayOrders: queueOrders.length,
        todayRevenue: totalRevenue,
        pendingOrders: pending,
        preparingOrders: preparing,
        readyOrders: ready,
        completedOrders: 0
      });

      // Get recent orders from queue with customer info
      const sortedOrders = [...queueOrders].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      // Fetch customer details for each order
      const ordersWithCustomers = await Promise.all(
        sortedOrders.slice(0, 5).map(async (order) => {
          try {
            // Try to get customer details
            const customerRes = await api.get(`/customers/${order.user_id}`);
            return {
              ...order,
              customer: customerRes.data?.data || { name: 'Unknown', email: '' }
            };
          } catch (error) {
            // If customer fetch fails, return order with unknown customer
            return {
              ...order,
              customer: { name: 'Unknown Customer', email: '' }
            };
          }
        })
      );
      
      setRecentOrders(ordersWithCustomers);

      // Fetch low stock items
      const lowStockRes = await api.get('/inventory/low-stock');
      setLowStockItems(lowStockRes.data || []);

    } catch (error) {
      console.error('Failed to fetch cashier data:', error);
      
      if (error.response?.status === 403) {
        setError('Permission denied. Please check your cashier account permissions.');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to load dashboard data');
      }
      
      setDemoData();
    } finally {
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  }, []);

  // Demo data for testing when backend is not available
  const setDemoData = () => {
    setStats({
      todayOrders: 24,
      todayRevenue: 1245.50,
      pendingOrders: 5,
      preparingOrders: 3,
      readyOrders: 2,
      completedOrders: 14
    });
    
    setRecentOrders([
      {
        id: 1,
        order_number: 'ORD-001',
        total_amount: 45.00,
        status: 'pending',
        items: [{ id: 1 }],
        created_at: new Date().toISOString(),
        customer: { name: 'John Doe', email: 'john@example.com' }
      },
      {
        id: 2,
        order_number: 'ORD-002',
        total_amount: 78.50,
        status: 'preparing',
        items: [{ id: 1 }, { id: 2 }],
        created_at: new Date().toISOString(),
        customer: { name: 'Jane Smith', email: 'jane@example.com' }
      },
      {
        id: 3,
        order_number: 'ORD-003',
        total_amount: 12.00,
        status: 'ready',
        items: [{ id: 1 }],
        created_at: new Date().toISOString(),
        customer: { name: 'Bob Johnson', email: 'bob@example.com' }
      }
    ]);
    
    setLowStockItems([
      { id: 1, name: 'Chicken Rice', stock_quantity: 3, low_stock_threshold: 5 },
      { id: 2, name: 'French Fries', stock_quantity: 5, low_stock_threshold: 10 }
    ]);
  };

  useEffect(() => {
    fetchCashierData();
    
    const interval = setInterval(() => fetchCashierData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchCashierData]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'preparing': return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'ready': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'completed': return <CheckCircleIcon className="h-5 w-5 text-gray-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRestock = async (itemId, itemName) => {
    try {
      await api.post('/inventory/adjust', {
        menu_item_id: itemId,
        quantity: 10,
        reason: 'restock'
      });
      
      const lowStockRes = await api.get('/inventory/low-stock');
      setLowStockItems(lowStockRes.data || []);
      toast.success(`Restocked ${itemName}`);
    } catch (error) {
      console.error('Failed to restock:', error);
      toast.error('Failed to restock item');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header with Refresh Button */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cashier Dashboard</h1>
            <p className="text-gray-600">Welcome back! Ready to take some orders?</p>
          </div>
          <button
            onClick={() => fetchCashierData(true)}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">⚠️ Error loading data</p>
            <p className="text-sm">{error}</p>
            <p className="text-sm mt-2">Showing demo data for preview.</p>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link
            to="/pos"
            className="bg-blue-600 text-white rounded-lg p-6 hover:bg-blue-700 transition flex items-center justify-between group"
          >
            <div>
              <h2 className="text-xl font-semibold mb-2">Point of Sale</h2>
              <p className="text-blue-100">Take new orders</p>
            </div>
            <ShoppingCartIcon className="h-12 w-12 text-blue-300 group-hover:scale-110 transition-transform" />
          </Link>
          
          <Link
            to="/orders/queue"
            className="bg-green-600 text-white rounded-lg p-6 hover:bg-green-700 transition flex items-center justify-between group"
          >
            <div>
              <h2 className="text-xl font-semibold mb-2">Order Queue</h2>
              <p className="text-green-100">Manage active orders</p>
            </div>
            <ClipboardDocumentListIcon className="h-12 w-12 text-green-300 group-hover:scale-110 transition-transform" />
          </Link>
        </div>

        {/* Today's Stats */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            title="Active Orders"
            value={stats.todayOrders}
            icon={ShoppingCartIcon}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            title="Revenue"
            value={`$${formatCurrency(stats.todayRevenue)}`}
            icon={CurrencyDollarIcon}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <StatCard
            title="Pending"
            value={stats.pendingOrders}
            icon={ClockIcon}
            color="text-yellow-600"
            bgColor="bg-yellow-100"
          />
          <StatCard
            title="Preparing"
            value={stats.preparingOrders}
            icon={ClockIcon}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            title="Ready"
            value={stats.readyOrders}
            icon={CheckCircleIcon}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <StatCard
            title="Completed"
            value={stats.completedOrders}
            icon={CheckCircleIcon}
            color="text-gray-600"
            bgColor="bg-gray-100"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Orders with Customer Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Active Orders</h2>
                {recentOrders.length > 0 && (
                  <Link to="/orders/queue" className="text-sm text-blue-600 hover:text-blue-800">
                    View all in queue →
                  </Link>
                )}
              </div>
              <div className="divide-y divide-gray-200">
                {recentOrders.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <ShoppingCartIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 font-medium">No active orders</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Start by taking an order in Point of Sale
                    </p>
                    <Link
                      to="/pos"
                      className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Take First Order
                    </Link>
                  </div>
                ) : (
                  recentOrders.map(order => (
                    <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(order.status)}
                          <div>
                            <p className="font-medium text-gray-900">#{order.order_number}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                              <span>{order.customer?.name || 'Unknown Customer'}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="ml-9 flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                          {order.items?.length || 0} items
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          ${formatCurrency(order.total_amount)}
                        </p>
                      </div>
                      {order.customer?.email && (
                        <p className="ml-9 text-xs text-gray-400 mt-1">
                          {order.customer.email}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div>
            <div className="bg-white rounded-lg shadow sticky top-4">
              <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
                <h2 className="text-lg font-semibold text-yellow-800 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  Low Stock Alerts
                  {lowStockItems.length > 0 && (
                    <span className="ml-2 bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                      {lowStockItems.length}
                    </span>
                  )}
                </h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {lowStockItems.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-gray-500 font-medium">All stocked up!</p>
                    <p className="text-sm text-gray-400 mt-1">
                      No items need attention
                    </p>
                  </div>
                ) : (
                  lowStockItems.slice(0, 5).map(item => (
                    <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          Stock: <span className="text-red-600 font-medium">{item.stock_quantity}</span> / {item.low_stock_threshold}
                        </p>
                        <button 
                          onClick={() => handleRestock(item.id, item.name)}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
                        >
                          Restock (10)
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {lowStockItems.length > 5 && (
                <div className="px-6 py-3 bg-gray-50 text-center border-t">
                  <Link to="/inventory" className="text-sm text-blue-600 hover:text-blue-800">
                    View all {lowStockItems.length} alerts →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Quick Tips</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Click <span className="font-medium">"Point of Sale"</span> to take new orders</li>
            <li>• Check <span className="font-medium">"Order Queue"</span> to update order status</li>
            <li>• Click <span className="font-medium">"Restock"</span> on low stock items to add 10 units</li>
            <li>• Data auto-refreshes every 30 seconds</li>
          </ul>
        </div>

        {/* Real-time status */}
        <div className="mt-4 text-xs text-gray-400 text-right">
          Last updated: {new Date().toLocaleTimeString()}
          {error && ' • Using demo data'}
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;