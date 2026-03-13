import React, { useState, useEffect } from 'react';
import { orderService } from '../../Services/orderService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const OrderQueue = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getOrderQueue();
      setOrders(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus) => {
    const flow = {
      pending: 'preparing',
      preparing: 'ready',
      ready: 'completed',
    };
    return flow[currentStatus];
  };

  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.status]) {
      acc[order.status] = [];
    }
    acc[order.status].push(order);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Queue</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b bg-yellow-50">
            <h2 className="font-semibold text-yellow-800">Pending</h2>
          </div>
          <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
            {groupedOrders.pending?.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">{order.order_number}</span>
                  <span className="text-sm text-gray-500">
                    {order.created_at ? format(new Date(order.created_at), 'HH:mm') : 'N/A'}
                  </span>
                </div>
                <div className="text-sm mb-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.menu_item?.name} x{item.quantity}</span>
                      <span>${Number(item.subtotal || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t">
                  <span className="font-bold">Total: ${Number(order.total_amount || 0).toFixed(2)}</span>
                  <button
                    onClick={() => updateStatus(order.id, getNextStatus(order.status))}
                    className="px-3 py-1 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700"
                  >
                    Start Preparing
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preparing Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b bg-blue-50">
            <h2 className="font-semibold text-blue-800">Preparing</h2>
          </div>
          <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
            {groupedOrders.preparing?.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">{order.order_number}</span>
                  <span className="text-sm text-gray-500">
                    {order.created_at ? format(new Date(order.created_at), 'HH:mm') : 'N/A'}
                  </span>
                </div>
                <div className="text-sm mb-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.menu_item?.name} x{item.quantity}</span>
                      <span>${Number(item.subtotal || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t">
                  <span className="font-bold">Total: ${Number(order.total_amount || 0).toFixed(2)}</span>
                  <button
                    onClick={() => updateStatus(order.id, getNextStatus(order.status))}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Mark Ready
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ready Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b bg-green-50">
            <h2 className="font-semibold text-green-800">Ready for Pickup</h2>
          </div>
          <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
            {groupedOrders.ready?.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">{order.order_number}</span>
                  <span className="text-sm text-gray-500">
                    {order.created_at ? format(new Date(order.created_at), 'HH:mm') : 'N/A'}
                  </span>
                </div>
                <div className="text-sm mb-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.menu_item?.name} x{item.quantity}</span>
                      <span>${Number(item.subtotal || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t">
                  <span className="font-bold">Total: ${Number(order.total_amount || 0).toFixed(2)}</span>
                  <button
                    onClick={() => updateStatus(order.id, 'completed')}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                  >
                    Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderQueue;