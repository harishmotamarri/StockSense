import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { InventoryTrendPoint } from '../../types';

interface InventoryChartProps {
  data: InventoryTrendPoint[];
}

export function InventoryChart({ data }: InventoryChartProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fontSize: 11, fill: '#64748b' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#64748b' }}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            }}
            labelStyle={{ fontWeight: 600, color: '#e2e8f0' }}
          />
          <Area
            type="monotone"
            dataKey="totalStock"
            name="Total Stock (Units)"
            stroke="#4f46e5"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorStock)"
          />
          <Area
            type="monotone"
            dataKey="inbound"
            name="Inbound Receipts"
            stroke="#059669"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#colorInbound)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
