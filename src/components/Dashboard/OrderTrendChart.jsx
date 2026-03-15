import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../Services/api';
import { format, parseISO, subDays } from 'date-fns';

const OrderTrendChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendData();
  }, []);

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/order-trend', {
        params: { days: 30 },
      });
      
      const formattedData = response.data.map((item) => ({
        date: format(parseISO(item.date), 'MMM dd'),
        orders: item.order_count,
        revenue: item.revenue,
      }));
      
      setData(formattedData);
    } catch (error) {
      console.error('Failed to fetch trend data:', error);
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
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={15} />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{ fontSize: 12 }} width={45} />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fontSize: 12 }} width={45} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="orders"
          stroke="#8884d8"
          name="Orders"
          activeDot={{ r: 8 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="revenue"
          stroke="#82ca9d"
          name="Revenue ($)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default OrderTrendChart;