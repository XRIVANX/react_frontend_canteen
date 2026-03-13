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
  CubeIcon 
} from '@heroicons/react/24/outline';

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
        params: {
          from_date: dateRange.from,
          to_date: dateRange.to,
        },
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {loading ? '...' : value}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Date Range Picker */}
      <div className="mb-6 flex space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">From</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">To</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Revenue"
          value={`$${Number(summary?.total_revenue || 0).toFixed(2)}`}
          icon={CurrencyDollarIcon}
          color="text-green-600"
        />
        <StatCard
          title="Total Orders"
          value={summary?.total_orders || 0}
          icon={ShoppingBagIcon}
          color="text-blue-600"
        />
        <StatCard
          title="Avg Order Value"
          value={`$${Number(summary?.average_order_value || 0).toFixed(2)}`}
          icon={UsersIcon}
          color="text-purple-600"
        />
        <StatCard
          title="Items Sold"
          value={summary?.total_items_sold || 0}
          icon={CubeIcon}
          color="text-orange-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
          <SalesChart dateRange={dateRange} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Category Breakdown</h2>
          <CategoryPieChart dateRange={dateRange} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Order Trends (30 Days)</h2>
        <OrderTrendChart />
      </div>
    </div>

    
  );
};

export default AdminDashboard;