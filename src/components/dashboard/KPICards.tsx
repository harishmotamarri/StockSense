import React from 'react';
import {
  Boxes,
  AlertTriangle,
  PackageX,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  TrendingUp,
} from 'lucide-react';
import { DashboardKPIs } from '../../types';
import { useNavigation } from '../../context/NavigationContext';

interface KPICardsProps {
  kpis: DashboardKPIs;
  isLoading?: boolean;
}

export function KPICards({ kpis, isLoading }: KPICardsProps) {
  const { navigate } = useNavigation();

  const cards = [
    {
      label: 'Products in Stock',
      value: kpis.totalProductsInStock,
      icon: Boxes,
      indicator: 'Active items',
      indicatorColor: 'text-emerald-700 bg-emerald-50',
      borderColor: 'hover:border-slate-400',
      path: '/products',
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Low Stock Items',
      value: kpis.lowStockItemsCount,
      icon: AlertTriangle,
      indicator: 'Below reorder',
      indicatorColor: 'text-amber-700 bg-amber-50',
      borderColor: 'hover:border-amber-400',
      path: '/products?status=Low+Stock',
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Out of Stock Items',
      value: kpis.outOfStockItemsCount,
      icon: PackageX,
      indicator: 'Zero units',
      indicatorColor: 'text-rose-700 bg-rose-50',
      borderColor: 'hover:border-rose-400',
      path: '/products?status=Out+of+Stock',
      color: 'text-rose-600 bg-rose-50',
    },
    {
      label: 'Pending Receipts',
      value: kpis.pendingReceiptsCount,
      icon: ArrowDownToLine,
      indicator: 'Supplier incoming',
      indicatorColor: 'text-sky-700 bg-sky-50',
      borderColor: 'hover:border-sky-400',
      path: '/receipts',
      color: 'text-sky-600 bg-sky-50',
    },
    {
      label: 'Pending Deliveries',
      value: kpis.pendingDeliveriesCount,
      icon: ArrowUpFromLine,
      indicator: 'Customer orders',
      indicatorColor: 'text-purple-700 bg-purple-50',
      borderColor: 'hover:border-purple-400',
      path: '/deliveries',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Transfers Scheduled',
      value: kpis.internalTransfersCount,
      icon: ArrowLeftRight,
      indicator: 'Inter-warehouse',
      indicatorColor: 'text-teal-700 bg-teal-50',
      borderColor: 'hover:border-teal-400',
      path: '/transfers',
      color: 'text-teal-600 bg-teal-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs animate-pulse"
          >
            <div className="h-3 bg-slate-200 rounded w-20 mb-3" />
            <div className="h-7 bg-slate-300 rounded w-14 mb-2" />
            <div className="h-2.5 bg-slate-100 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            onClick={() => navigate(card.path)}
            className={`bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs transition-all duration-150 cursor-pointer ${card.borderColor} hover:shadow-md group`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-500 truncate">{card.label}</span>
              <div className={`p-1.5 rounded-lg ${card.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition">
                {card.value}
              </span>
            </div>

            <div className="mt-2 flex items-center">
              <span
                className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${card.indicatorColor}`}
              >
                {card.indicator}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
