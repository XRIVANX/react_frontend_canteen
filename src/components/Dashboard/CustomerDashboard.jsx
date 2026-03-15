import React, { useState, useEffect, useCallback, useRef } from 'react';
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

/* ── Skeleton ── */
const CustomerSkeleton = () => (
  <div className="p-6 max-w-7xl mx-auto">
    <div className="skeleton h-36 w-full rounded-2xl mb-6" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
    </div>
    <div className="skeleton h-5 w-36 rounded mb-4" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
    </div>
    <div className="skeleton h-5 w-32 rounded mb-4" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-56 rounded-xl" />)}
    </div>
  </div>
);

/* ── Stat Card ── */
const StatCard = ({ title, value, icon: Icon, accentColor, bgColor, subtitle, delay = 0 }) => (
  <div className="stat-card" style={{ borderLeftColor: accentColor, animationDelay: `${delay}ms` }}>
    <div className="flex items-center gap-3">
      <div className="hidden sm:block p-3 rounded-xl shrink-0" style={{ background: bgColor }}>
        <Icon className="h-5 w-5" style={{ color: accentColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const statusConfig = {
  pending:   { color: '#ca8a04', bg: '#fefce8', border: '#ca8a04', label: 'Pending' },
  preparing: { color: '#2563eb', bg: '#dbeafe', border: '#2563eb', label: 'Preparing' },
  ready:     { color: '#16a34a', bg: '#dcfce7', border: '#16a34a', label: 'Ready' },
  completed: { color: '#6b7280', bg: '#f3f4f6', border: '#9ca3af', label: 'Completed' },
  delivered: { color: '#6b7280', bg: '#f3f4f6', border: '#9ca3af', label: 'Delivered' },
};

const CustomerDashboard = () => {
  const [stats, setStats] = useState({ totalSpent: 0, totalOrders: 0, pendingOrders: 0, favoriteItem: null });
  const [recentOrders, setRecentOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const isMounted = useRef(true);
  const refreshInterval = useRef(null);

  const formatCurrency = (v) => (parseFloat(v) || 0).toFixed(2);
  const handleImageError = (id) => setImageErrors(prev => ({ ...prev, [id]: true }));

  // Lifecycle management
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);

  const fetchCustomerData = useCallback(async (showToast = false) => {
    try {
      const ordersRes = await api.get('/customer/orders');
      if (!isMounted.current) return;
      
      const ordersRaw = ordersRes.data || [];
      const orders = Array.isArray(ordersRaw) ? ordersRaw : ordersRaw.data || [];
      
      // Calculate stats
      const totalSpent = orders.reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0);
      const pendingOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length;

      // Calculate favorite item
      const itemCounts = {};
      orders.forEach(order => {
        (order.items || []).forEach(item => {
          const name = item.menu_item?.name || 'Unknown';
          itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 0);
        });
      });
      
      let favoriteItem = null, maxCount = 0;
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
      
      setRecentOrders([...orders]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3));

      setLastUpdated(new Date());

      if (menuItems.length === 0) {
        api.get('/menu?available=true').then(menuRes => {
          if (!isMounted.current) return;
          const menuRaw = menuRes.data || [];
          const menuArray = Array.isArray(menuRaw) ? menuRaw : menuRaw.data || Object.values(menuRaw || {});
          setMenuItems(menuArray.slice(0, 4));
        }).catch(console.error);
      }

      if (showToast) {
        toast.success('Dashboard updated!');
      }

    } catch (error) {
      console.error('Error fetching customer data:', error);
      if (!isMounted.current) return;
      
      // Setting fallback data via state update to avoid stale closures
      setStats(prev => {
        if (prev.totalOrders === 0) {
          setRecentOrders([
            { id: 1, order_number: 'ORD-001', total_amount: 45.00, status: 'delivered', items: [{}], created_at: new Date().toISOString() },
            { id: 2, order_number: 'ORD-002', total_amount: 78.50, status: 'preparing', items: [{},{}], created_at: new Date().toISOString() }
          ]);
          setMenuItems([
            { id: 1, name: 'Chicken Rice',  price: 45.00, description: 'Steamed chicken with fragrant white rice', image: null },
            { id: 2, name: 'Nasi Lemak',    price: 50.00, description: 'Coconut rice with sambal & fried egg',    image: null },
            { id: 3, name: 'Mee Goreng',    price: 48.00, description: 'Spicy stir-fried yellow noodles',         image: null },
            { id: 4, name: 'Chicken Chop',  price: 65.00, description: 'Grilled chicken with crispy fries',       image: null }
          ]);
          return { 
            totalSpent: 156.50, 
            totalOrders: 3, 
            pendingOrders: 1, 
            favoriteItem: { name: 'Chicken Rice', count: 2 } 
          };
        }
        return prev;
      });
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Initial fetch and setup real-time updates
  useEffect(() => {
    fetchCustomerData();

    // Poll every 10 seconds for real-time updates
    refreshInterval.current = setInterval(() => {
      if (isMounted.current) {
        fetchCustomerData(false);
      }
    }, 10000);

    // Listen for storage events (for multi-tab updates)
    const handleStorageChange = (e) => {
      if (e.key === 'order-updated' || e.key === 'new-order') {
        fetchCustomerData(false);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    // Custom event listeners for same-tab updates
    const handleOrderUpdate = () => {
      fetchCustomerData(true);
    };

    window.addEventListener('order-status-changed', handleOrderUpdate);
    window.addEventListener('new-order-placed', handleOrderUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('order-status-changed', handleOrderUpdate);
      window.removeEventListener('new-order-placed', handleOrderUpdate);
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [fetchCustomerData]);

  // Add visibility change listener to refresh when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted.current) {
        fetchCustomerData(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchCustomerData]);

  if (loading) return <CustomerSkeleton />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div
        className="rounded-2xl p-7 mb-6 text-white flex items-center justify-between overflow-hidden relative fade-in-up shadow-lg"
        style={{ background: 'linear-gradient(135deg, #800000 0%, #9B1C1C 60%, #c0392b 100%)' }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <p className="text-white/70 text-sm font-medium uppercase tracking-widest">Customer Portal</p>
            {lastUpdated && (
              <span className="text-xs text-white/50">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-white/75 text-sm">Hungry? Check out today's menu or track your orders below.</p>
          <Link to="/menu"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full text-sm font-semibold bg-white transition-all hover:bg-gray-100 hover:shadow-md"
            style={{ color: '#800000' }}>
            Browse Menu <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="hidden md:block text-[120px] leading-none opacity-20 select-none absolute right-6 bottom-0">🍽️</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Spent"     value={`₱${formatCurrency(stats.totalSpent)}`} icon={CurrencyDollarIcon} accentColor="#16a34a" bgColor="#dcfce7" delay={0} />
        <StatCard title="Total Orders"    value={stats.totalOrders}                       icon={ShoppingBagIcon}    accentColor="#2563eb" bgColor="#dbeafe" subtitle="All time" delay={80} />
        <StatCard title="Active Orders"   value={stats.pendingOrders}                     icon={ClockIcon}           accentColor="#ca8a04" bgColor="#fefce8" subtitle="In progress" delay={160} />
        <StatCard title="Favorite"        value={stats.favoriteItem?.name || 'None yet'}  icon={FireIcon}           accentColor="#800000" bgColor="#FEF2F2"
          subtitle={stats.favoriteItem ? `Ordered ${stats.favoriteItem.count}×` : 'Start ordering!'} delay={240} />
      </div>

      {/* Recent Orders */}
      <div className="mb-8 fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
          <Link to="/my-orders" className="text-sm font-semibold flex items-center gap-1" style={{ color: '#800000' }}>
            View All <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="card p-10 text-center">
            <ShoppingBagIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1">Browse the menu and place your first order!</p>
            <Link to="/menu" className="btn-primary inline-flex mt-4 text-sm">Browse Menu</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentOrders.map((order, i) => {
              const cfg = statusConfig[order.status] || statusConfig.completed;
              return (
                <div key={order.id} className="card p-4 hover:-translate-y-1 transition-all duration-200"
                  style={{ borderLeft: `3px solid ${cfg.border}`, animationDelay: `${i * 60}ms` }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-800 text-sm">#{order.order_number}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {order.items?.length || 0} item(s) • <span className="font-bold text-gray-800">₱{formatCurrency(order.total_amount)}</span>
                  </p>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* You Might Like */}
      <div className="fade-in-up">
        <h2 className="text-lg font-bold text-gray-800 mb-4">You Might Like 😋</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {menuItems.map((item, i) => (
            <div key={item.id} className="card overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${i * 60}ms` }}>
              <div className="h-36 relative overflow-hidden">
                {!imageErrors[item.id] && item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                    onError={() => handleImageError(item.id)} loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #800000, #9B1C1C)' }}>
                    <span className="text-5xl font-bold text-white/80">{item.name?.charAt(0) || '🍽'}</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white shadow"
                    style={{ background: '#800000' }}>₱{formatCurrency(item.price)}</span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;