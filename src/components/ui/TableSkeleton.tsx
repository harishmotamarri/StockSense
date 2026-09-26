import React from 'react';

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full bg-white divide-y divide-slate-100 overflow-hidden">
      <div className="bg-slate-50 px-6 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-3.5 bg-slate-200 rounded animate-pulse"
            style={{ width: `${Math.max(12, 100 / cols - 4)}%` }}
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="px-6 py-4 flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-4 bg-slate-100 rounded animate-pulse"
              style={{
                width: c === 0 ? '25%' : c === 1 ? '15%' : `${Math.max(10, 60 / cols)}%`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-slate-200 rounded w-28"></div>
        <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
      </div>
      <div className="h-8 bg-slate-200 rounded w-20 mb-2"></div>
      <div className="h-3 bg-slate-100 rounded w-36"></div>
    </div>
  );
}
