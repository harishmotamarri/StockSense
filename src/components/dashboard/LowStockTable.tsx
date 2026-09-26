import React from 'react';
import { Product } from '../../types';
import { ProductStatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useNavigation } from '../../context/NavigationContext';
import { ArrowRight, PlusCircle, AlertCircle } from 'lucide-react';

interface LowStockTableProps {
  products: Product[];
}

export function LowStockTable({ products }: LowStockTableProps) {
  const { navigate } = useNavigation();

  if (products.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center">
        <AlertCircle className="w-6 h-6 text-emerald-500 mb-1" />
        <p className="font-semibold text-slate-800">All stock levels healthy</p>
        <p className="text-slate-400 mt-0.5">No products currently below their minimum reorder thresholds.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-100">
          <tr>
            <th className="py-2.5 px-3 font-semibold">Product</th>
            <th className="py-2.5 px-3 font-semibold">SKU</th>
            <th className="py-2.5 px-3 font-semibold">Category</th>
            <th className="py-2.5 px-3 font-semibold text-right">Current Stock</th>
            <th className="py-2.5 px-3 font-semibold text-right">Reorder Level</th>
            <th className="py-2.5 px-3 font-semibold">Status</th>
            <th className="py-2.5 px-3 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50/60 transition">
              <td className="py-2.5 px-3 font-medium text-slate-900">
                <button
                  onClick={() => navigate(`/products/${p.id}`)}
                  className="hover:text-indigo-600 transition text-left cursor-pointer font-semibold"
                >
                  {p.name}
                </button>
              </td>
              <td className="py-2.5 px-3 font-mono text-slate-600">{p.sku}</td>
              <td className="py-2.5 px-3 text-slate-600">{p.category}</td>
              <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                {p.totalStock} {p.unit}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                {p.reorderLevel} {p.unit}
              </td>
              <td className="py-2.5 px-3">
                <ProductStatusBadge status={p.status} />
              </td>
              <td className="py-2.5 px-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[11px]"
                    onClick={() => navigate('/receipts/new')}
                    leftIcon={<PlusCircle className="w-3 h-3 text-indigo-600" />}
                  >
                    Reorder
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
