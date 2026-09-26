import React from 'react';
import { InventoryCategoryStat } from '../../types';

interface StockByCategoryChartProps {
  categories: InventoryCategoryStat[];
}

export function StockByCategoryChart({ categories }: StockByCategoryChartProps) {
  const colors = [
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-sky-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-rose-500',
  ];

  return (
    <div className="space-y-3.5">
      {categories.map((cat, idx) => (
        <div key={cat.category} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700 truncate max-w-[160px]">
              {cat.category}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-500">{cat.totalQuantity.toLocaleString()} units</span>
              <span className="font-semibold text-slate-900 w-9 text-right">{cat.percentage}%</span>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colors[idx % colors.length]}`}
              style={{ width: `${Math.max(4, Math.min(100, cat.percentage))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
