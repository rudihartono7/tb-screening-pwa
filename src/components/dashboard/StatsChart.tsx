'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ChartDataPoint {
  label: string;
  positive: number;
  negative: number;
  pending: number;
}

interface StatsChartProps {
  data: ChartDataPoint[];
}

export function StatsChart({ data }: StatsChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="label" 
            axisLine={false}
            tickLine={false}
            className="text-sm text-gray-600"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            className="text-sm text-gray-600"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="positive" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            name="Positive"
          />
          <Line 
            type="monotone" 
            dataKey="negative" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            name="Negative"
          />
          <Line 
            type="monotone" 
            dataKey="pending" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            name="Pending"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}