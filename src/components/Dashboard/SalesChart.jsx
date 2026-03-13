import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../Services/api';
import { format, parseISO } from 'date-fns';

const SalesChart = ({ dateRange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, [dateRange]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/sales', {
        params: {
          from_date: dateRange.from,
          to_date: dateRange.to,
          group_by: 'day',
        },
      });
      
      const formattedData = response.data.map((item) => ({
        date: format(parseISO(item.date), 'MMM dd'),
        revenue: Number(item.total_revenue),
        orders: Number(item.total_orders),
      }));
      
      setData(formattedData);
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
        <Bar yAxisId="right" dataKey="orders" fill="#82ca9d" name="Orders" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;