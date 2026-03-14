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

/* ── Skeleton ── */
const DashboardSkeleton = () => (
  <div className="p-6 max-w-7xl mx-auto animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div>
        <div className="skeleton h-7 w-48 rounded-lg mb-2" />
        <div className="skeleton h-4 w-64 rounded" />
      </div>
      <div className="skeleton h-9 w-28 rounded-lg" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="skeleton h-28 rounded-xl" />
      <div className="skeleton h-28 rounded-xl" />
    </div>
    <div className="skeleton h-5 w-36 rounded mb-4" />
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
      {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 skeleton h-80 rounded-xl" />
      <div className="skeleton h-80 rounded-xl" />
    </div>
  </div>
);

/* ── Stat Card ── */
const StatCard = ({ title, value, icon: Icon, accentColor, bgColor, delay = 0 }) => (
  <div className="stat-card" style={{ borderLeftColor: accentColor, animationDelay: `${delay}ms` }}>
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-xl shrink-0" style={{ background: bgColor }}>
        <Icon className="h-5 w-5" style={{ color: accentColor }} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const statusConfig = {
  pending:   { color: '#ca8a04', bg: '#fefce8', label: 'Pending',   border: '#ca8a04' },
  preparing: { color: '#2563eb', bg: '#dbeafe', label: 'Preparing', border: '#2563eb' },
  ready:     { color: '#16a34a', bg: '#dcfce7', label: 'Ready',     border: '#16a34a' },
  completed: { color: '#6b7280', bg: '#f3f4f6', label: 'Completed', border: '#9ca3af' },
};

const CashierDashboard = () => {
  const [stats, setStats] = useState({
    todayOrders: 0, todayRevenue: 0,
    pendingOrders: 0, preparingOrders: 0,
    readyOrders: 0, completedOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const formatCurrency = (v) => (parseFloat(v) || 0).toFixed(2);

  const fetchCashierData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      setError(null);

      // Run queue + today-stats + low-stock in parallel for speed
      const [queueRes, todayRes, lowStockRes] = await Promise.all([
        api.get('/orders/queue'),
        api.get('/orders/today-stats'),
        api.get('/inventory/low-stock'),
      ]);

      const queueOrders = queueRes.data || [];
      const todayData   = todayRes.data?.data || {};

      setStats({
        todayOrders:     todayData.total_orders     ?? queueOrders.length,
        todayRevenue:    parseFloat(todayData.total_revenue) || 0,
        pendingOrders:   todayData.pending          ?? queueOrders.filter(o => o.status === 'pending').length,
        preparingOrders: todayData.preparing        ?? queueOrders.filter(o => o.status === 'preparing').length,
        readyOrders:     todayData.ready            ?? queueOrders.filter(o => o.status === 'ready').length,
        completedOrders: todayData.completed        ?? 0,
      });

      // Active queue list (user eager-loaded by the queue endpoint)
      const sorted = [...queueOrders]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(order => ({
          ...order,
          customer: order.user
            ? { name: order.user.name, email: order.user.email }
            : { name: 'Walk-in', email: '' },
        }));
      setRecentOrders(sorted);

      setLowStockItems(lowStockRes.data || []);
    } catch (error) {
      if (error.response?.status === 403) setError('Permission denied.');
      else setError(error.response?.data?.message || 'Failed to load dashboard data');
      setDemoData();
    } finally {
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  }, []);

  const setDemoData = () => {
    setStats({ todayOrders: 24, todayRevenue: 1245.50, pendingOrders: 5, preparingOrders: 3, readyOrders: 2, completedOrders: 14 });
    setRecentOrders([
      { id: 1, order_number: 'ORD-001', total_amount: 45.00, status: 'pending',   items: [{}], created_at: new Date().toISOString(), customer: { name: 'Juan Dela Cruz', email: 'juan@example.com' } },
      { id: 2, order_number: 'ORD-002', total_amount: 78.50, status: 'preparing', items: [{},{}], created_at: new Date().toISOString(), customer: { name: 'Maria Santos', email: 'maria@example.com' } },
      { id: 3, order_number: 'ORD-003', total_amount: 12.00, status: 'ready',     items: [{}], created_at: new Date().toISOString(), customer: { name: 'Bob Reyes', email: 'bob@example.com' } }
    ]);
    setLowStockItems([
      { id: 1, name: 'Chicken Rice',  stock_quantity: 3, low_stock_threshold: 5 },
      { id: 2, name: 'French Fries',  stock_quantity: 5, low_stock_threshold: 10 }
    ]);
  };

  useEffect(() => {
    fetchCashierData();
    const interval = setInterval(() => fetchCashierData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchCashierData]);

  const handleRestock = async (itemId, itemName) => {
    try {
      await api.post('/inventory/adjust', { menu_item_id: itemId, quantity: 10, reason: 'restock' });
      const r = await api.get('/inventory/low-stock');
      setLowStockItems(r.data || []);
      toast.success(`Restocked ${itemName}`);
    } catch {
      toast.error('Failed to restock item');
    }
  };

  if (loading) return <DashboardSkeleton />;

  const statItems = [
    { title: 'Active Orders', value: stats.todayOrders,     icon: ShoppingCartIcon,        accentColor: '#800000', bgColor: '#FEF2F2', delay: 0   },
    { title: 'Revenue',       value: `₱${formatCurrency(stats.todayRevenue)}`, icon: CurrencyDollarIcon, accentColor: '#16a34a', bgColor: '#dcfce7', delay: 60  },
    { title: 'Pending',       value: stats.pendingOrders,   icon: ClockIcon,               accentColor: '#ca8a04', bgColor: '#fefce8', delay: 120 },
    { title: 'Preparing',     value: stats.preparingOrders, icon: ClockIcon,               accentColor: '#2563eb', bgColor: '#dbeafe', delay: 180 },
    { title: 'Ready',         value: stats.readyOrders,     icon: CheckCircleIcon,         accentColor: '#16a34a', bgColor: '#dcfce7', delay: 240 },
    { title: 'Completed',     value: stats.completedOrders, icon: CheckCircleIcon,         accentColor: '#6b7280', bgColor: '#f3f4f6', delay: 300 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center fade-in-up">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#800000' }}>Cashier Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Ready to take some orders? 🍱</p>
        </div>
        <button
          onClick={() => fetchCashierData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm"
          style={{ borderColor: refreshing ? '#800000' : undefined, color: '#800000' }}
        >
          <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl px-4 py-3 flex gap-3 items-start fade-in-up" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <ExclamationTriangleIcon className="h-5 w-5 mt-0.5 shrink-0" style={{ color: '#800000' }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: '#800000' }}>Error loading data</p>
            <p className="text-xs text-red-600 mt-0.5">{error} — Showing demo data.</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link to="/pos"
          className="rounded-2xl p-6 text-white flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          style={{ background: 'linear-gradient(135deg, #800000 0%, #9B1C1C 100%)' }}
        >
          <div>
            <h2 className="text-xl font-bold mb-1">Point of Sale</h2>
            <p className="text-white/70 text-sm">Take new orders</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/15 group-hover:bg-white/25 transition-all">
            <ShoppingCartIcon className="h-10 w-10 text-white" />
          </div>
        </Link>
        <Link to="/orders/queue"
          className="rounded-2xl p-6 text-white flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}
        >
          <div>
            <h2 className="text-xl font-bold mb-1">Order Queue</h2>
            <p className="text-white/70 text-sm">Manage active orders</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/15 group-hover:bg-white/25 transition-all">
            <ClipboardDocumentListIcon className="h-10 w-10 text-white" />
          </div>
        </Link>
      </div>

      {/* Stats */}
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Today's Overview</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {statItems.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Orders */}
        <div className="lg:col-span-2 card overflow-hidden fade-in-up">
          <div className="card-header justify-between">
            <span className="flex items-center gap-2"><span>🧾</span> Active Orders</span>
            {recentOrders.length > 0 && (
              <Link to="/orders/queue" className="text-xs font-semibold" style={{ color: '#800000' }}>
                View queue →
              </Link>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingCartIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No active orders</p>
                <p className="text-xs text-gray-400 mt-1">Go to Point of Sale to start</p>
                <Link to="/pos" className="btn-primary inline-flex mt-4 text-sm">Take First Order</Link>
              </div>
            ) : (
              recentOrders.map(order => {
                const cfg = statusConfig[order.status] || statusConfig.completed;
                return (
                  <div key={order.id} className="px-5 py-4 hover:bg-gray-50 transition-colors"
                    style={{ borderLeft: `3px solid ${cfg.border}` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">#{order.order_number}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <UserIcon className="h-3 w-3" />
                            <span>{order.customer?.name || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-800">₱{formatCurrency(order.total_amount)}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 ml-0">{order.items?.length || 0} item(s)</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="card overflow-hidden fade-in-up">
          <div className="card-header" style={{ background: '#fefce8', borderBottom: '1px solid #fef08a' }}>
            <span className="flex items-center gap-2 text-yellow-800">
              <ExclamationTriangleIcon className="h-4 w-4" />
              Low Stock Alerts
              {lowStockItems.length > 0 && (
                <span className="ml-auto bg-yellow-200 text-yellow-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {lowStockItems.length}
                </span>
              )}
            </span>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {lowStockItems.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-gray-500 font-medium text-sm">All stocked up!</p>
                <p className="text-xs text-gray-400 mt-0.5">No items need attention</p>
              </div>
            ) : (
              lowStockItems.slice(0, 5).map(item => (
                <div key={item.id} className="px-5 py-3 hover:bg-gray-50">
                  <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-gray-500">
                      Stock: <span className="text-red-600 font-bold">{item.stock_quantity}</span>
                      <span className="text-gray-400"> / {item.low_stock_threshold}</span>
                    </p>
                    <button
                      onClick={() => handleRestock(item.id, item.name)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all"
                      style={{ background: '#FEF2F2', color: '#800000' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#800000' || (e.currentTarget.style.color = '#fff')}
                      onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#800000'; }}
                    >
                      + Restock
                    </button>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-red-400 transition-all"
                      style={{ width: `${Math.min(100, (item.stock_quantity / item.low_stock_threshold) * 100)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-[11px] text-gray-400 text-right">
        Auto-refreshes every 30s • Last updated: {new Date().toLocaleTimeString()}
        {error && ' • Demo data'}
      </div>
    </div>
  );
};

export default CashierDashboard;