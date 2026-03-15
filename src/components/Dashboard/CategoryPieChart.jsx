import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../Services/api';

const COLORS = ['#800000', '#9B1C1C', '#c0392b', '#e74c3c', '#EF9A9A', '#FFCDD2'];

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.15;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="#666" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
      {`${name} (₱${Number(value).toFixed(0)})`}
    </text>
  );
};

const CategoryPieChart = ({ dateRange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryData();
  }, [dateRange]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/category-breakdown', {
        params: {
          from_date: dateRange.from,
          to_date: dateRange.to,
        },
      });

      const formattedData = (response.data || []).map((item) => ({
        name: item.name,
        value: Number(item.revenue) || 0,
      }));

      setData(formattedData);
    } catch (error) {
      console.error('Failed to fetch category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPeso = (value) => `₱${Number(value).toFixed(2)}`;

  if (loading) {
    return (
      <div className="animate-pulse space-y-3 py-4">
        <div className="flex justify-center">
          <div className="skeleton rounded-full" style={{ width: 160, height: 160 }} />
        </div>
        <div className="flex justify-center gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-3 w-16 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <span className="text-4xl mb-2">🥧</span>
        <p className="text-sm">No category data for this period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={renderCustomLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`₱${Number(value).toFixed(2)}`, 'Revenue']} />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryPieChart;