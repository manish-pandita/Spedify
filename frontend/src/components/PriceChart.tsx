import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PriceHistoryItem } from '../types';

interface PriceChartProps {
  priceHistory: PriceHistoryItem[];
  currency: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ priceHistory, currency }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const data = priceHistory
    .map((item) => ({
      date: formatDate(item.recorded_at),
      price: item.price,
      fullDate: item.recorded_at,
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Price History</h2>
        <p className="text-gray-500">No price history available yet.</p>
      </div>
    );
  }

  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const priceRange = maxPrice - minPrice;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Price History</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            domain={[minPrice - priceRange * 0.1, maxPrice + priceRange * 0.1]}
            tickFormatter={formatPrice}
          />
          <Tooltip
            formatter={(value: number) => formatPrice(value)}
            labelStyle={{ color: '#000' }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-sm text-gray-500">Current</div>
          <div className="text-lg font-semibold">{formatPrice(data[data.length - 1].price)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Lowest</div>
          <div className="text-lg font-semibold text-green-600">{formatPrice(minPrice)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Highest</div>
          <div className="text-lg font-semibold text-red-600">{formatPrice(maxPrice)}</div>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
