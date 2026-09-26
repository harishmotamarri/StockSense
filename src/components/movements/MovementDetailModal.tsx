import React from 'react';
import { Modal } from '../ui/Modal';
import { StockMovement } from '../../types';
import { MovementTypeBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  FileText,
  Calendar,
  User,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  MapPin,
  Tag,
} from 'lucide-react';

interface MovementDetailModalProps {
  movement: StockMovement | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MovementDetailModal({ movement, isOpen, onClose }: MovementDetailModalProps) {
  if (!movement) return null;

  const isPositive = movement.quantity > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Ledger Audit Entry"
      description={`System ledger transaction record #${movement.id}`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Top Header Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{movement.productName}</span>
              <MovementTypeBadge type={movement.referenceType} />
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">SKU: {movement.sku}</p>
          </div>

          <div className="text-right">
            <span
              className={`text-lg font-bold font-mono ${
                isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isPositive ? `+${movement.quantity}` : movement.quantity} {movement.unit}
            </span>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Delta Impact</p>
          </div>
        </div>

        {/* Quantity Flow Timeline: Before -> Delta -> After */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
              Before Qty
            </span>
            <span className="text-base font-mono font-bold text-slate-700">
              {movement.beforeQuantity}
            </span>
            <span className="text-[10px] text-slate-500 ml-1">{movement.unit}</span>
          </div>

          <div
            className={`p-3 border rounded-lg ${
              isPositive ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
            }`}
          >
            <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
              Movement
            </span>
            <div className="flex items-center justify-center gap-1 font-mono font-bold text-base">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-600" />
              )}
              <span className={isPositive ? 'text-emerald-700' : 'text-rose-700'}>
                {isPositive ? `+${movement.quantity}` : movement.quantity}
              </span>
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
              After Qty
            </span>
            <span className="text-base font-mono font-bold text-indigo-700">
              {movement.afterQuantity}
            </span>
            <span className="text-[10px] text-slate-500 ml-1">{movement.unit}</span>
          </div>
        </div>

        {/* Audit Details Grid */}
        <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 font-medium flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5" /> Reference Document
              </span>
              <span className="font-mono font-semibold text-slate-900">
                {movement.reference}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5" /> Date & Timestamp
              </span>
              <span className="font-mono text-slate-900">
                {new Date(movement.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 font-medium flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5" /> Source Location
              </span>
              <span className="text-slate-900">
                {movement.fromLocation
                  ? `${movement.fromWarehouse || 'Warehouse'} (${movement.fromLocation})`
                  : 'N/A (Inbound intake)'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5" /> Destination Location
              </span>
              <span className="text-slate-900">
                {movement.toLocation
                  ? `${movement.toWarehouse || 'Warehouse'} (${movement.toLocation})`
                  : 'N/A (Outbound dispatch)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 font-medium flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5" /> Executing User
              </span>
              <span className="font-medium text-slate-900">{movement.user}</span>
            </div>

            <div>
              <span className="text-slate-400 font-medium flex items-center gap-1.5 mb-1">
                <Tag className="w-3.5 h-3.5" /> Reason / Notes
              </span>
              <span className="text-slate-800">{movement.reason || 'None specified'}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
