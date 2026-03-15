import React, { useState, useEffect } from 'react';

import { format, subDays } from 'date-fns';
import api from '../../Services/api';
import SalesChart from './SalesChart';
import CategoryPieChart from './CategoryPieChart';
import OrderTrendChart from './OrderTrendChart';
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  CalendarIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, accentColor, bgColor, loading, delay = 0 }) => (
  <div className="stat-card" style={{ borderLeftColor: accentColor, animationDelay: `${delay}ms` }}>
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-xl" style={{ background: bgColor }}>
        <Icon className="h-6 w-6" style={{ color: accentColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
        {loading ? (
          <div className="skeleton h-7 w-24 mt-1 rounded-lg" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        )}
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchSummary();
  }, [dateRange]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/summary', {
        params: { from_date: dateRange.from, to_date: dateRange.to },
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 fade-in-up flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#800000' }}>Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here's an overview of your canteen.</p>
        </div>
      </div>

      {/* ── ANALYTICS ── */}
      {/* Date Range Picker */}
      <div className="card mb-6 p-4 fade-in-up">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" /> Date Range
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input type="date" value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="input-primary" />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input type="date" value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="input-primary" />
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Revenue"    value={`₱${Number(summary?.total_revenue || 0).toFixed(2)}`} icon={CurrencyDollarIcon} accentColor="#16a34a" bgColor="#dcfce7" loading={loading} delay={0} />
            <StatCard title="Total Orders"     value={summary?.total_orders || 0}                           icon={ShoppingBagIcon}    accentColor="#2563eb" bgColor="#dbeafe" loading={loading} delay={80} />
            <StatCard title="Avg Order Value"  value={`₱${Number(summary?.average_order_value || 0).toFixed(2)}`} icon={UsersIcon} accentColor="#7c3aed" bgColor="#ede9fe" loading={loading} delay={160} />
            <StatCard title="Items Sold"       value={summary?.total_items_sold || 0}                       icon={CubeIcon}           accentColor="#800000" bgColor="#FEF2F2" loading={loading} delay={240} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card overflow-hidden fade-in-up">
              <div className="card-header flex items-center gap-2" style={{ borderLeft: '3px solid #800000' }}>
                <ChartBarIcon className="h-5 w-5" /> Sales Overview
              </div>
              <div className="card-body">
                <SalesChart dateRange={dateRange} />
              </div>
            </div>
            <div className="card overflow-hidden fade-in-up">
              <div className="card-header flex items-center gap-2" style={{ borderLeft: '3px solid #800000' }}>
                <ChartPieIcon className="h-5 w-5" /> Category Breakdown
              </div>
              <div className="card-body">
                <CategoryPieChart dateRange={dateRange} />
              </div>
            </div>
          </div>

          <div className="card overflow-hidden fade-in-up">
            <div className="card-header flex items-center gap-2" style={{ borderLeft: '3px solid #800000' }}>
              <ArrowTrendingUpIcon className="h-5 w-5" /> Order Trends (30 Days)
            </div>
            <div className="card-body">
              <OrderTrendChart />
            </div>
          </div>
    </div>
  );
};

export default AdminDashboard;