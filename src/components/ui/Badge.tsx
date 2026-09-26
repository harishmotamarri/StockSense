import React from 'react';
import { DocumentStatus, ProductStatus, MovementType, UserRole } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'neutral', size = 'sm', className = '' }: BadgeProps) {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: DocumentStatus }) {
  switch (status) {
    case 'Draft':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Draft
        </span>
      );
    case 'Waiting':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Waiting
        </span>
      );
    case 'Ready':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          Ready
        </span>
      );
    case 'Done':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Done
        </span>
      );
    case 'Canceled':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Canceled
        </span>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  switch (status) {
    case 'In Stock':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          In Stock
        </span>
      );
    case 'Low Stock':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Low Stock
        </span>
      );
    case 'Out of Stock':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Out of Stock
        </span>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}

export function MovementTypeBadge({ type }: { type: MovementType }) {
  switch (type) {
    case 'Receipt':
      return <Badge variant="success">+ Receipt</Badge>;
    case 'Delivery':
      return <Badge variant="danger">- Delivery</Badge>;
    case 'Transfer In':
      return <Badge variant="info">+ Transfer In</Badge>;
    case 'Transfer Out':
      return <Badge variant="warning">- Transfer Out</Badge>;
    case 'Adjustment':
      return <Badge variant="purple">± Adjustment</Badge>;
    case 'Opening Balance':
      return <Badge variant="neutral">Initial</Badge>;
    default:
      return <Badge>{type}</Badge>;
  }
}

export function RoleBadge({ role }: { role: UserRole }) {
  if (role === 'INVENTORY_MANAGER') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
        Manager
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
      Warehouse Staff
    </span>
  );
}
