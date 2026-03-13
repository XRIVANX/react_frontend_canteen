import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../Services/api';
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon,
  ClockIcon,
  FireIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalOrders: 0,
    pendingOrders: 0,
    favoriteItem: null
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Helper function to safely format currency
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      setError(null);
      
      // Fetch customer's order history
      const ordersRes = await api.get('/customer/orders');
      const orders = ordersRes.data || [];
      
      // Calculate stats with safe number conversion
      const totalSpent = orders.reduce((sum, order) => {
        const amount = parseFloat(order.total_amount) || 0;
        return sum + amount;
      }, 0);
      
      const pendingOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length;
      
      // Find most ordered item
      const itemCounts = {};
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const name = item.menu_item?.name || 'Unknown';
            itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 0);
          });
        }
      });
      
      let favoriteItem = null;
      let maxCount = 0;
      for (const [name, count] of Object.entries(itemCounts)) {
        if (count > maxCount) {
          maxCount = count;
          favoriteItem = { name, count };
        }
      }

      setStats({
        totalSpent,
        totalOrders: orders.length,
        pendingOrders,
        favoriteItem
      });

      // Get recent orders (last 3)
      const sortedOrders = [...orders].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setRecentOrders(sortedOrders.slice(0, 3));

      // Fetch some menu items for suggestions
      const menuRes = await api.get('/menu?available=true');
      setMenuItems((menuRes.data || []).slice(0, 4));

    } catch (error) {
      console.error('Failed to fetch customer data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load dashboard');
      
      // Set demo data for preview
      setDemoData();
    } finally {
      setLoading(false);
    }
  };

  const setDemoData = () => {
    setStats({
      totalSpent: 156.50,
      totalOrders: 3,
      pendingOrders: 1,
      favoriteItem: { name: 'Chicken Rice', count: 2 }
    });
    
    setRecentOrders([
      {
        id: 1,
        order_number: 'ORD-001',
        total_amount: 45.00,
        status: 'delivered',
        items: [{ menu_item: { name: 'Chicken Rice' }, quantity: 1 }],
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        order_number: 'ORD-002',
        total_amount: 78.50,
        status: 'preparing',
        items: [{ menu_item: { name: 'Nasi Lemak' }, quantity: 1 }],
        created_at: new Date().toISOString()
      }
    ]);
    
    setMenuItems([
      { id: 1, name: 'Chicken Rice', price: 45.00, description: 'Steamed chicken with rice', image: null },
      { id: 2, name: 'Nasi Lemak', price: 50.00, description: 'Coconut rice with sambal', image: null },
      { id: 3, name: 'Mee Goreng', price: 48.00, description: 'Spicy fried noodles', image: null },
      { id: 4, name: 'Chicken Chop', price: 65.00, description: 'Grilled chicken with fries', image: null }
    ]);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed':
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
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

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCustomerData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
          <p className="text-blue-100">Hungry? Check out our delicious menu items below.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Spent"
            value={`$${formatCurrency(stats.totalSpent)}`}
            icon={CurrencyDollarIcon}
            color="text-green-600"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingBagIcon}
            color="text-blue-600"
            subtitle="All time"
          />
          <StatCard
            title="Active Orders"
            value={stats.pendingOrders}
            icon={ClockIcon}
            color="text-orange-600"
            subtitle="In progress"
          />
          <StatCard
            title="Favorite Item"
            value={stats.favoriteItem ? stats.favoriteItem.name : 'None yet'}
            icon={FireIcon}
            color="text-red-600"
            subtitle={stats.favoriteItem ? `Ordered ${stats.favoriteItem.count} times` : 'Start ordering!'}
          />
        </div>

        {/* Recent Orders */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/my-orders" className="text-blue-600 hover:text-blue-800 flex items-center">
              View All <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <ShoppingBagIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No orders yet</p>
              <p className="text-sm text-gray-400 mt-1">Visit our menu and ask a cashier to place your order</p>
              <Link to="/menu" className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentOrders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold">Order #{order.order_number}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {order.items?.length || 0} item(s) • ${formatCurrency(order.total_amount)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Items */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">You Might Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                  {!imageErrors[item.id] ? (
                    <img 
                      src={item.image || `https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=${item.name?.charAt(0) || 'F'}`} 
                      alt={item.name}
                      className="w-full h-40 object-cover"
                      onError={() => handleImageError(item.id)}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-linear-to-br from-blue-500 to-blue-600">
                      <span className="text-4xl font-bold text-white">
                        {item.name?.charAt(0) || 'F'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">${formatCurrency(item.price)}</span>
                    <span className="text-xs text-gray-500">{item.category?.name || 'Food'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;