import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import api from '../../Services/api';
import {
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  TrophyIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

/* ── Skeleton ── */
const ReportsSkeleton = () => (
  <div className="p-6 max-w-7xl mx-auto animate-pulse">
    <div className="skeleton h-7 w-36 rounded mb-1" />
    <div className="skeleton h-4 w-64 rounded mb-6" />
    <div className="skeleton h-16 w-full rounded-xl mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 skeleton h-80 rounded-xl" />
      <div className="skeleton h-80 rounded-xl" />
    </div>
  </div>
);

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });

  const formatCurrency = (value) => (parseFloat(value) || 0).toFixed(2);

  const fetchReportsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [salesRes, bestSellingRes, summaryRes] = await Promise.all([
        api.get('/reports/sales', { params: { from_date: dateRange.from, to_date: dateRange.to, group_by: 'day' } }),
        api.get('/reports/best-selling', { params: { from_date: dateRange.from, to_date: dateRange.to, limit: 10 } }),
        api.get('/reports/summary', { params: { from_date: dateRange.from, to_date: dateRange.to } }),
      ]);

      const salesResponseData = salesRes.data?.data || salesRes.data || [];
      const bestSellingData = bestSellingRes.data?.data || bestSellingRes.data || [];
      const summaryData = summaryRes.data?.data || summaryRes.data || {};

      const ordersData = Array.isArray(salesResponseData)
        ? salesResponseData.map((item, index) => ({
            id: `SALE-${index + 1}`,
            order_number: `SALE-${index + 1}`,
            created_at: item.date,
            items: [{ name: 'Daily Total', quantity: item.total_orders || 0 }],
            total_amount: parseFloat(item.total_revenue) || 0,
          }))
        : [];

      setSalesData(ordersData);
      setBestSelling(Array.isArray(bestSellingData) ? bestSellingData : []);
      setSummary(summaryData || {});
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchReportsData(); }, [fetchReportsData]);

  const exportToCSV = () => {
    const headers = ['Date', 'Orders', 'Revenue', 'Avg Order Value'];
    const csvData = salesData.map(item => [
      format(new Date(item.created_at), 'yyyy-MM-dd'),
      item.items?.[0]?.quantity || 0,
      `₱${formatCurrency(item.total_amount)}`,
      item.total_amount && item.items?.[0]?.quantity
        ? `₱${formatCurrency(item.total_amount / item.items[0].quantity)}`
        : '₱0.00',
    ]);
    const csvContent = [headers, ...csvData].map(row => row.map(f => `"${f}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `sales_report_${dateRange.from}_to_${dateRange.to}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue  = salesData.reduce((s, i) => s + (parseFloat(i.total_amount) || 0), 0);
  const totalOrders   = salesData.reduce((s, i) => s + (i.items?.[0]?.quantity || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (loading) return <ReportsSkeleton />;

  if (error) return (
    <div className="p-8 text-center">
      <div className="card p-8 max-w-md mx-auto">
        <span className="text-5xl block mb-3">⚠️</span>
        <h2 className="text-lg font-bold mb-2" style={{ color: '#800000' }}>Error Loading Reports</h2>
        <p className="text-gray-600 mb-4 text-sm">{error}</p>
        <button onClick={fetchReportsData} className="btn-primary">Try Again</button>
      </div>
    </div>
  );

  const rankBadge = (i) => {
    if (i === 0) return { bg: '#fef9c3', color: '#854d0e', label: '🥇' };
    if (i === 1) return { bg: '#f1f5f9', color: '#374151', label: '🥈' };
    if (i === 2) return { bg: '#fff7ed', color: '#9a3412', label: '🥉' };
    return { bg: '#eff6ff', color: '#1e40af', label: `${i + 1}` };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 fade-in-up">
        <h1 className="text-2xl font-bold" style={{ color: '#800000' }}>Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Sales performance and top-selling items</p>
      </div>

      {/* Date Range + Export */}
      <div className="card p-4 mb-6 fade-in-up">
        <div className="flex flex-wrap gap-4 items-end justify-between">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <CalendarDaysIcon className="h-4 w-4 text-gray-400" /> From
              </label>
              <input type="date" value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="input-primary" style={{ width: '160px' }} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <CalendarDaysIcon className="h-4 w-4 text-gray-400" /> To
              </label>
              <input type="date" value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="input-primary" style={{ width: '160px' }} />
            </div>
          </div>
          <button
            onClick={exportToCSV}
            disabled={salesData.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #16a34a, #065f46)' }}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { title: 'Total Revenue', value: `₱${formatCurrency(totalRevenue)}`,    icon: CurrencyDollarIcon, accentColor: '#16a34a', bg: '#dcfce7' },
          { title: 'Total Orders',  value: totalOrders,                            icon: ShoppingBagIcon,    accentColor: '#800000', bg: '#FEF2F2' },
          { title: 'Avg Order Value', value: `₱${formatCurrency(avgOrderValue)}`, icon: ChartBarIcon,       accentColor: '#7c3aed', bg: '#ede9fe' },
        ].map(({ title, value, icon: Icon, accentColor, bg }, i) => (
          <div key={title} className="stat-card fade-in-up" style={{ borderLeftColor: accentColor, animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl" style={{ background: bg }}>
                <Icon className="h-5 w-5" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Table */}
        <div className="lg:col-span-2 card overflow-hidden fade-in-up">
          <div className="card-header" style={{ borderLeft: '3px solid #800000' }}>
            <ChartBarIcon className="h-4 w-4" style={{ color: '#800000' }} />
            Daily Sales <span className="ml-auto text-xs font-normal text-gray-400">{salesData.length} day{salesData.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Date','Orders','Revenue','Avg Order'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {salesData.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400">No sales data for this period</td></tr>
                ) : salesData.map((item) => {
                  const dailyOrders = item.items?.[0]?.quantity || 0;
                  const avgDaily = dailyOrders > 0 ? item.total_amount / dailyOrders : 0;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-800">
                        {item.created_at ? format(new Date(item.created_at), 'MMM dd, yyyy') : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{dailyOrders}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">₱{formatCurrency(item.total_amount)}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">₱{formatCurrency(avgDaily)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Sales Cards */}
          <div className="md:hidden divide-y divide-gray-50">
            {salesData.length === 0 ? (
              <div className="px-5 py-12 text-center text-gray-400">No sales data for this period</div>
            ) : salesData.map((item) => {
              const dailyOrders = item.items?.[0]?.quantity || 0;
              const avgDaily = dailyOrders > 0 ? item.total_amount / dailyOrders : 0;
              return (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-900">
                      {item.created_at ? format(new Date(item.created_at), 'MMM dd, yyyy') : '—'}
                    </span>
                    <span className="text-sm font-bold" style={{ color: '#800000' }}>
                      ₱{formatCurrency(item.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center gap-1"><ShoppingBagIcon className="h-3.5 w-3.5" /> {dailyOrders} orders</span>
                    <span>Avg: ₱{formatCurrency(avgDaily)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best Selling */}
        <div className="card overflow-hidden fade-in-up">
          <div className="card-header" style={{ borderLeft: '3px solid #800000' }}>
            <TrophyIcon className="h-4 w-4" style={{ color: '#800000' }} />
            Best Selling Items
          </div>
          <div className="divide-y divide-gray-50">
            {bestSelling.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">No data available</div>
            ) : bestSelling.map((item, index) => {
              const { bg, color, label } = rankBadge(index);
              return (
                <div key={item.menu_item_id || index} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: bg, color }}>{label}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {item.menu_item?.name || item.name || `Item #${item.menu_item_id}`}
                    </p>
                    <p className="text-xs text-gray-400">{item.total_quantity || 0} sold</p>
                  </div>
                  <p className="text-sm font-bold shrink-0" style={{ color: '#800000' }}>
                    ₱{formatCurrency(item.total_revenue)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;