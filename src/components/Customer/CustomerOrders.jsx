import React, { useState, useEffect } from 'react';
import api from '../../Services/api';
import { format } from 'date-fns';
import {
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';

/* ── Skeleton ── */
const OrdersSkeleton = () => (
  <div className="p-6 max-w-4xl mx-auto animate-pulse space-y-4">
    <div className="skeleton h-7 w-32 rounded mb-1" />
    <div className="skeleton h-4 w-48 rounded mb-6" />
    {[...Array(3)].map((_, i) => (
      <div key={i} className="card p-5 space-y-3">
        <div className="flex justify-between">
          <div className="skeleton h-5 w-32 rounded" />
          <div className="skeleton h-5 w-20 rounded-full" />
        </div>
        <div className="skeleton h-3 w-48 rounded" />
        <div className="skeleton h-px w-full" />
        {[...Array(2)].map((_, j) => (
          <div key={j} className="flex justify-between">
            <div className="skeleton h-3 w-40 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        ))}
        <div className="skeleton h-px w-full" />
        <div className="flex justify-between">
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
        </div>
      </div>
    ))}
  </div>
);

const statusConfig = {
  pending:   { color: '#92400e', bg: '#fef9c3', border: '#ca8a04', label: 'Pending',   icon: ClockIcon },
  preparing: { color: '#1e40af', bg: '#dbeafe', border: '#3b82f6', label: 'Preparing', icon: ClockIcon },
  ready:     { color: '#14532d', bg: '#dcfce7', border: '#22c55e', label: 'Ready',     icon: CheckCircleIcon },
  completed: { color: '#374151', bg: '#f3f4f6', border: '#9ca3af', label: 'Completed', icon: CheckCircleIcon },
  delivered: { color: '#374151', bg: '#f3f4f6', border: '#9ca3af', label: 'Delivered', icon: CheckCircleIcon },
  cancelled: { color: '#991b1b', bg: '#fee2e2', border: '#ef4444', label: 'Cancelled', icon: XCircleIcon },
};

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatCurrency = (v) => (parseFloat(v) || 0).toFixed(2);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setError(null);
      const response = await api.get('/customer/orders');
      const ordersData = response.data?.data || response.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <OrdersSkeleton />;

  if (error) return (
    <div className="p-8 text-center">
      <div className="card p-8 max-w-md mx-auto">
        <span className="text-5xl block mb-3">⚠️</span>
        <h2 className="text-lg font-bold mb-2" style={{ color: '#800000' }}>Error Loading Orders</h2>
        <p className="text-gray-600 mb-4 text-sm">{error}</p>
        <button onClick={fetchOrders} className="btn-primary">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 fade-in-up">
        <h1 className="text-2xl font-bold" style={{ color: '#800000' }}>My Orders</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {orders.length} order{orders.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="card p-16 text-center fade-in-up">
          <ShoppingBagIcon className="h-16 w-16 mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-semibold text-lg">No orders yet</p>
          <p className="text-sm text-gray-400 mt-1">Browse the menu to place your first order!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => {
            const cfg = statusConfig[order.status?.toLowerCase()] || statusConfig.completed;
            const StatusIcon = cfg.icon;
            return (
              <div key={order.id} className="card overflow-hidden fade-in-up"
                style={{ borderLeft: `4px solid ${cfg.border}`, animationDelay: `${idx * 50}ms` }}>
                {/* Header */}
                <div className="px-5 py-4 flex items-start justify-between border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <ReceiptPercentIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-bold text-gray-900">Order #{order.order_number}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 ml-6">
                      {order.created_at
                        ? format(new Date(order.created_at), 'MMM dd, yyyy • hh:mm a')
                        : 'Date unavailable'}
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {cfg.label}
                  </span>
                </div>

                {/* Items */}
                <div className="px-5 py-3 space-y-2">
                  {order.items?.length > 0 ? order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">
                        <span className="font-semibold text-gray-900">{item.quantity || 0}×</span>{' '}
                        {item.menu_item?.name || 'Unknown item'}
                      </span>
                      <span className="font-medium text-gray-600">₱{formatCurrency(item.subtotal)}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-400">No items</p>
                  )}
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="px-5 pb-3">
                    <div className="rounded-lg p-2.5" style={{ background: '#fef3c7', borderLeft: '3px solid #f59e0b' }}>
                      <p className="text-xs text-gray-800 font-medium">📝 {order.notes}</p>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center"
                  style={{ background: '#f9fafb' }}>
                  <span className="text-sm font-semibold text-gray-600">Total</span>
                  <span className="text-lg font-bold" style={{ color: '#800000' }}>
                    ₱{formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;