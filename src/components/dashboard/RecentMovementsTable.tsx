import React from 'react';
import { StockMovement } from '../../types';
import { MovementTypeBadge } from '../ui/Badge';
import { useNavigation } from '../../context/NavigationContext';

interface RecentMovementsTableProps {
  movements: StockMovement[];
  onSelectMovement?: (movement: StockMovement) => void;
}

export function RecentMovementsTable({ movements, onSelectMovement }: RecentMovementsTableProps) {
  const { navigate } = useNavigation();

  if (movements.length === 0) {
    return <div className="py-8 text-center text-xs text-slate-500">No stock movements recorded yet.</div>;
  }

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    } catch {
      return ts;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-100">
          <tr>
            <th className="py-2.5 px-3 font-semibold">Timestamp</th>
            <th className="py-2.5 px-3 font-semibold">Product</th>
            <th className="py-2.5 px-3 font-semibold">Type</th>
            <th className="py-2.5 px-3 font-semibold">From</th>
            <th className="py-2.5 px-3 font-semibold">To</th>
            <th className="py-2.5 px-3 font-semibold text-right">Quantity</th>
            <th className="py-2.5 px-3 font-semibold text-right">User</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {movements.map((m) => {
            const isPositive = m.quantity > 0;
            return (
              <tr
                key={m.id}
                onClick={() => (onSelectMovement ? onSelectMovement(m) : navigate('/movements'))}
                className="hover:bg-slate-50/80 transition cursor-pointer"
              >
                <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                  {formatTime(m.timestamp)}
                </td>
                <td className="py-2.5 px-3 font-medium text-slate-900">
                  <div>{m.productName}</div>
                  <span className="font-mono text-[10px] text-slate-400">{m.sku}</span>
                </td>
                <td className="py-2.5 px-3">
                  <MovementTypeBadge type={m.referenceType} />
                </td>
                <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                  {m.fromLocation ? `${m.fromWarehouse || ''} (${m.fromLocation})` : '—'}
                </td>
                <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                  {m.toLocation ? `${m.toWarehouse || ''} (${m.toLocation})` : '—'}
                </td>
                <td
                  className={`py-2.5 px-3 text-right font-mono font-bold ${
                    isPositive ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {isPositive ? `+${m.quantity}` : m.quantity} {m.unit}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-600 text-[11px] truncate max-w-[120px]">
                  {m.user}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
