import React, { useState, useEffect } from 'react';
import api from '../../Services/api';
import { format } from 'date-fns';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to safely format currency
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setError(null);
      const response = await api.get('/customer/orders');
      // Handle different response formats
      const ordersData = response.data?.data || response.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

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
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Orders</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No orders yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Visit our menu and ask a cashier to place your order
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="font-bold text-lg">Order #{order.order_number}</span>
                  <p className="text-sm text-gray-500">
                    {order.created_at ? format(new Date(order.created_at), 'PPP p') : 'Date unavailable'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {formatStatus(order.status)}
                </span>
              </div>

              <div className="border-t border-b py-4 mb-4">
                {order.items && order.items.map(item => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span>{item.quantity || 0}x {item.menu_item?.name || 'Unknown item'}</span>
                    <span>${formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;