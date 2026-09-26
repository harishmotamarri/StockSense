import React from 'react';
import { PendingOperation } from '../../types';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useNavigation } from '../../context/NavigationContext';
import { ArrowRight, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';

interface PendingOpsTableProps {
  operations: PendingOperation[];
}

export function PendingOpsTable({ operations }: PendingOpsTableProps) {
  const { navigate } = useNavigation();

  if (operations.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-500">
        No pending operations currently in the queue.
      </div>
    );
  }

  const getTypeIcon = (type: PendingOperation['type']) => {
    switch (type) {
      case 'Receipt':
        return <ArrowDownToLine className="w-3.5 h-3.5 text-sky-600" />;
      case 'Delivery':
        return <ArrowUpFromLine className="w-3.5 h-3.5 text-purple-600" />;
      case 'Transfer':
        return <ArrowLeftRight className="w-3.5 h-3.5 text-teal-600" />;
    }
  };

  const handleRoute = (op: PendingOperation) => {
    if (op.type === 'Receipt') navigate(`/receipts/${op.id}`);
    else if (op.type === 'Delivery') navigate(`/deliveries/${op.id}`);
    else if (op.type === 'Transfer') navigate(`/transfers/${op.id}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-100">
          <tr>
            <th className="py-2.5 px-3 font-semibold">Document #</th>
            <th className="py-2.5 px-3 font-semibold">Type</th>
            <th className="py-2.5 px-3 font-semibold">Warehouse / Route</th>
            <th className="py-2.5 px-3 font-semibold">Scheduled Date</th>
            <th className="py-2.5 px-3 font-semibold">Status</th>
            <th className="py-2.5 px-3 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {operations.map((op) => (
            <tr key={`${op.type}-${op.id}`} className="hover:bg-slate-50/60 transition">
              <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                <button
                  onClick={() => handleRoute(op)}
                  className="hover:text-indigo-600 transition text-left cursor-pointer underline"
                >
                  {op.documentNumber}
                </button>
              </td>
              <td className="py-2.5 px-3">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                  {getTypeIcon(op.type)}
                  {op.type}
                </span>
              </td>
              <td className="py-2.5 px-3 text-slate-600 truncate max-w-[200px]">{op.warehouse}</td>
              <td className="py-2.5 px-3 text-slate-500 font-mono">{op.date}</td>
              <td className="py-2.5 px-3">
                <StatusBadge status={op.status} />
              </td>
              <td className="py-2.5 px-3 text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[11px] text-indigo-600 hover:text-indigo-900"
                  onClick={() => handleRoute(op)}
                  rightIcon={<ArrowRight className="w-3 h-3" />}
                >
                  Process
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
