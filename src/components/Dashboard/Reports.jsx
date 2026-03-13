import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import api from '../../Services/api';
import { MagnifyingGlassIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

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

  // Helper function to safely format currency
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  const fetchReportsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch sales data (daily breakdown)
      const salesRes = await api.get('/reports/sales', {
        params: {
          from_date: dateRange.from,
          to_date: dateRange.to,
          group_by: 'day',
        },
      });
      
      // Fetch best selling items
      const bestSellingRes = await api.get('/reports/best-selling', {
        params: {
          from_date: dateRange.from,
          to_date: dateRange.to,
          limit: 10,
        },
      });
      
      // Fetch summary stats
      const summaryRes = await api.get('/reports/summary', {
        params: {
          from_date: dateRange.from,
          to_date: dateRange.to,
        },
      });

      // Handle different response formats
      const salesResponseData = salesRes.data?.data || salesRes.data || [];
      const bestSellingData = bestSellingRes.data?.data || bestSellingRes.data || [];
      const summaryData = summaryRes.data?.data || summaryRes.data || {};

      // Transform sales data into orders format for the table
      const ordersData = Array.isArray(salesResponseData) ? salesResponseData.map((item, index) => ({
        id: `SALE-${index + 1}`,
        order_number: `SALE-${index + 1}`,
        created_at: item.date,
        customer_name: 'N/A',
        items: [{ name: 'Daily Total', quantity: item.total_orders || 0 }],
        total_amount: parseFloat(item.total_revenue) || 0,
        status: 'completed',
      })) : [];

      setSalesData(ordersData);
      setBestSelling(Array.isArray(bestSellingData) ? bestSellingData : []);
      setSummary(summaryData || {});
      
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  const exportToCSV = () => {
    const headers = ['Date', 'Orders', 'Revenue', 'Avg Order Value'];
    const csvData = salesData.map(item => [
      format(new Date(item.created_at), 'yyyy-MM-dd'),
      item.items?.[0]?.quantity || 0,
      `$${formatCurrency(item.total_amount)}`,
      item.total_amount && item.items?.[0]?.quantity 
        ? `$${formatCurrency(item.total_amount / item.items[0].quantity)}`
        : '$0.00',
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${dateRange.from}_to_${dateRange.to}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate totals with safe number conversion
  const totalRevenue = salesData.reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0);
  const totalOrders = salesData.reduce((sum, item) => sum + (item.items?.[0]?.quantity || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Reports</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchReportsData}
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Detailed sales reports and analytics</p>
      </div>

      {/* Date Range and Export */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex space-x-4">
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

        <button
          onClick={exportToCSV}
          disabled={salesData.length === 0}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">${formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Average Order Value</p>
          <p className="text-2xl font-bold text-gray-900">${formatCurrency(avgOrderValue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Table */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Daily Sales ({salesData.length} days)
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Order
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesData.map((item) => {
                      const dailyOrders = item.items?.[0]?.quantity || 0;
                      const avgDaily = dailyOrders > 0 ? item.total_amount / dailyOrders : 0;
                      
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {format(new Date(item.created_at), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {dailyOrders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            ${formatCurrency(item.total_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${formatCurrency(avgDaily)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {salesData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No sales data found for the selected date range.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Best Selling Items */}
        <div>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Best Selling Items
              </h3>

              <div className="space-y-4">
                {bestSelling.map((item, index) => (
                  <div key={item.menu_item_id || index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="shrink-0">
                        <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {item.menu_item?.name || item.name || `Item #${item.menu_item_id}`}
                        </p>
                        <p className="text-sm text-gray-500">{item.total_quantity || 0} sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${formatCurrency(item.total_revenue)}
                      </p>
                    </div>
                  </div>
                ))}

                {bestSelling.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No sales data available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;