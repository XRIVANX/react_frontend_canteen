import React, { useState, useEffect, useCallback } from 'react';
import { orderService } from '../../Services/orderService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  FireIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ReceiptPercentIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

/* ── Skeleton ── */
const QueueSkeleton = () => (
  <div className="p-6 max-w-7xl mx-auto animate-pulse">
    <div className="skeleton h-7 w-40 rounded mb-1" />
    <div className="skeleton h-4 w-56 rounded mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton h-12 w-full" style={{ borderRadius: 0 }} />
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, j) => <div key={j} className="skeleton h-20 rounded-xl" />)}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const statusConfig = {
  pending:   { color: '#92400e', bg: '#fefce8', border: '#ca8a04', headerBg: '#fef9c3', label: 'Pending',          icon: ClockIcon,        btnColor: '#92400e', btnBg: '#fef9c3' },
  preparing: { color: '#1e40af', bg: '#eff6ff', border: '#3b82f6', headerBg: '#dbeafe', label: 'Preparing',        icon: FireIcon,         btnColor: '#1e3a8a', btnBg: '#dbeafe' },
  ready:     { color: '#14532d', bg: '#f0fdf4', border: '#22c55e', headerBg: '#dcfce7', label: 'Ready for Pickup', icon: CheckCircleIcon,  btnColor: '#14532d', btnBg: '#dcfce7' },
};

const getNextStatus = (s) => ({ pending: 'preparing', preparing: 'ready', ready: 'completed' }[s]);
const getNextLabel  = (s) => ({ pending: 'Start Preparing', preparing: 'Mark Ready', ready: 'Complete Order' }[s]);

/* ── Cancel Confirmation Modal ── */
const CancelModal = ({ order, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-full bg-red-100">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="font-bold text-gray-900">Cancel Order?</h3>
      </div>
      <p className="text-sm text-gray-600 mb-1">
        Order <span className="font-semibold">#{order.order_number}</span> will be cancelled.
      </p>
      <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-5">
        ✓ Stock will be automatically restored.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          Keep Order
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
          style={{ background: '#dc2626' }}>
          Yes, Cancel
        </button>
      </div>
    </div>
  </div>
);

const OrderQueue = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null); // order to cancel
  const [cancelling, setCancelling] = useState(null);     // currently being cancelled

  const fetchOrders = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    try {
      const data = await orderService.getOrderQueue();
      setOrders(Array.isArray(data) ? data : data.data || []);
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
      if (silent) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(cancelTarget.id);
    setCancelTarget(null);
    try {
      await orderService.updateOrderStatus(cancelTarget.id, 'cancelled');
      toast.success(`Order #${cancelTarget.order_number} cancelled — stock restored`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(null);
    }
  };

  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.status]) acc[order.status] = [];
    acc[order.status].push(order);
    return acc;
  }, {});

  if (loading) return <QueueSkeleton />;

  return (
    <>
      {/* Cancel Confirmation Modal */}
      {cancelTarget && (
        <CancelModal
          order={cancelTarget}
          onConfirm={handleCancelConfirm}
          onCancel={() => setCancelTarget(null)}
        />
      )}

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 fade-in-up">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#800000' }}>Order Queue</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {orders.length} active order{orders.length !== 1 ? 's' : ''} • Auto-refreshes every 10s
            </p>
          </div>
          <button onClick={() => fetchOrders(true)} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm"
            style={{ color: '#800000' }}>
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {['pending', 'preparing', 'ready'].map(status => {
            const cfg = statusConfig[status];
            const StatusIcon = cfg.icon;
            const colOrders = groupedOrders[status] || [];

            return (
              <div key={status} className="card overflow-hidden fade-in-up">
                {/* Column Header */}
                <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: cfg.headerBg }}>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-4 w-4" style={{ color: cfg.color }} />
                    <h2 className="font-bold text-sm" style={{ color: cfg.color }}>{cfg.label}</h2>
                  </div>
                  {colOrders.length > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {colOrders.length}
                    </span>
                  )}
                </div>

                {/* Orders */}
                <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                  {colOrders.length === 0 ? (
                    <div className="py-12 text-center">
                      <ReceiptPercentIcon className="h-10 w-10 mx-auto text-gray-200 mb-2" />
                      <p className="text-gray-400 text-sm">No {status} orders</p>
                    </div>
                  ) : colOrders.map(order => {
                    const isCancelling = cancelling === order.id;
                    return (
                      <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors"
                        style={{ borderLeft: `3px solid ${cfg.border}` }}>
                        {/* Header row */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">#{order.order_number}</p>
                            <p className="text-xs text-gray-500 mt-0.5">👤 {order.user?.name || 'Walk-in'}</p>
                            <p className="text-xs text-gray-400">
                              {order.created_at ? format(new Date(order.created_at), 'hh:mm a') : '—'}
                            </p>
                          </div>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        </div>

                        {/* Item list */}
                        <div className="rounded-lg p-2.5 mb-3 space-y-1.5" style={{ background: '#f9fafb' }}>
                          {order.items?.map(item => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span className="text-gray-700 font-medium">{item.menu_item?.name} ×{item.quantity}</span>
                              <span className="text-gray-500">₱{Number(item.subtotal || 0).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Notes */}
                        {order.notes && (
                          <div className="rounded-lg p-2.5 mb-3" style={{ background: '#fef3c7', borderLeft: '3px solid #f59e0b' }}>
                            <p className="text-xs text-gray-800 font-medium">📝 {order.notes}</p>
                          </div>
                        )}

                        {/* Total + Actions */}
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-gray-900 text-sm">
                            ₱{Number(order.total_amount || 0).toFixed(2)}
                          </p>
                          <div className="flex items-center gap-1.5">
                            {/* Cancel button — available on any non-terminal status */}
                            <button
                              onClick={() => setCancelTarget(order)}
                              disabled={isCancelling}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
                              style={{ background: '#fee2e2', color: '#991b1b' }}
                              title="Cancel order & restore stock">
                              {isCancelling ? '…' : 'Cancel'}
                            </button>
                            {/* Progress button */}
                            {getNextStatus(order.status) && (
                              <button
                                onClick={() => updateStatus(order.id, getNextStatus(order.status))}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                                style={{ background: cfg.btnBg, color: cfg.btnColor }}>
                                {getNextLabel(order.status)}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default OrderQueue;