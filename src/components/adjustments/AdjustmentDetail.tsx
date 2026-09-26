import React, { useState, useEffect } from 'react';
import { Adjustment } from '../../types';
import { getAdjustmentById, applyAdjustment, cancelAdjustment } from '../../lib/api';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  CheckCircle2,
  SlidersHorizontal,
  Building2,
  MapPin,
  Calendar,
  User,
  AlertTriangle,
  XCircle,
  Tag,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface AdjustmentDetailProps {
  adjustmentId: string;
}

export function AdjustmentDetail({ adjustmentId }: AdjustmentDetailProps) {
  const { navigate } = useNavigation();
  const { success, error } = useToast();

  const [adjustment, setAdjustment] = useState<Adjustment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAdjustmentById(adjustmentId);
      setAdjustment(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [adjustmentId]);

  const handleApply = async () => {
    if (!adjustment) return;
    setIsProcessing(true);
    try {
      const updated = await applyAdjustment(adjustment.id);
      setAdjustment(updated);
      success('Adjustment Applied', 'Inventory has been officially updated.');
      setShowApplyConfirm(false);
    } catch (err: any) {
      error('Failed to apply', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!adjustment) return;
    setIsProcessing(true);
    try {
      const updated = await cancelAdjustment(adjustment.id);
      setAdjustment(updated);
      success('Adjustment Canceled', 'Draft audit canceled.');
      setShowCancelConfirm(false);
    } catch (err: any) {
      error('Failed to cancel', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-32 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (!adjustment) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Adjustment Not Found</h2>
        <Button size="sm" variant="outline" className="mt-4" onClick={() => navigate('/adjustments')}>
          Back to Adjustments
        </Button>
      </div>
    );
  }

  const isPositive = adjustment.difference > 0;
  const isZero = adjustment.difference === 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/adjustments')}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Adjustment {adjustment.adjustmentNumber}
              </h1>
              {adjustment.status === 'Applied' ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Applied
                </span>
              ) : adjustment.status === 'Draft' ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Draft Count
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Canceled
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Product: {adjustment.productName} ({adjustment.sku})
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {adjustment.status === 'Draft' && (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => setShowApplyConfirm(true)}
                isLoading={isProcessing}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Apply Count & Update Stock
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-rose-600 hover:bg-rose-50"
                onClick={() => setShowCancelConfirm(true)}
                disabled={isProcessing}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Cancel Draft
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Delta KPI Box */}
      <Card className="p-5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Count Discrepancy Breakdown
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Book System Qty</span>
            <span className="text-2xl font-mono font-bold text-slate-800">
              {adjustment.systemQuantity}
            </span>
            <span className="text-xs text-slate-500 ml-1">{adjustment.unit}</span>
          </div>

          <div className="p-4 bg-white border border-slate-300 rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-slate-700 block mb-1">
              Actual Physical Count
            </span>
            <span className="text-2xl font-mono font-bold text-indigo-700">
              {adjustment.physicalCount}
            </span>
            <span className="text-xs text-slate-500 ml-1">{adjustment.unit}</span>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              isZero
                ? 'bg-slate-50 border-slate-200'
                : isPositive
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-rose-50 border-rose-200'
            }`}
          >
            <span className="text-xs font-semibold text-slate-500 block mb-1">Variance Delta</span>
            <div className="flex items-center justify-center gap-1.5 font-mono font-bold text-2xl">
              {isPositive ? (
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              ) : !isZero ? (
                <TrendingDown className="w-6 h-6 text-rose-600" />
              ) : null}
              <span
                className={
                  isZero
                    ? 'text-slate-700'
                    : isPositive
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                }
              >
                {isPositive ? `+${adjustment.difference}` : adjustment.difference}
              </span>
              <span className="text-xs text-slate-500 ml-1">{adjustment.unit}</span>
            </div>
          </div>
        </div>

        {adjustment.status === 'Applied' && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold block">Adjustment applied to inventory ledger.</span>
              <span className="text-emerald-700 text-[11px]">
                Product stock at bay {adjustment.locationCode} has been synced with actual physical
                count ({adjustment.physicalCount} {adjustment.unit}).
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Meta Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" /> Facility
          </span>
          <p className="mt-1 font-semibold text-slate-900 text-sm">{adjustment.warehouseName}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Audited Bay
          </span>
          <p className="mt-1 font-semibold text-slate-900 text-sm font-mono">
            {adjustment.locationCode}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" /> Reason Code
          </span>
          <p className="mt-1 font-semibold text-slate-900 text-sm">{adjustment.reason}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" /> Counter Staff
          </span>
          <p className="mt-1 font-semibold text-slate-900 text-sm">{adjustment.createdBy}</p>
        </Card>
      </div>

      {adjustment.notes && (
        <Card>
          <CardHeader title="Audit Explanation / Discrepancy Findings" />
          <CardContent>
            <p className="text-xs text-slate-600 leading-relaxed">{adjustment.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={showApplyConfirm}
        onClose={() => setShowApplyConfirm(false)}
        onConfirm={handleApply}
        title="Apply Inventory Adjustment"
        message={`Are you sure you want to adjust inventory for ${adjustment.productName}? This will modify stock by ${adjustment.difference > 0 ? `+${adjustment.difference}` : adjustment.difference} ${adjustment.unit}.`}
        confirmLabel="Apply & Sync Ledger"
        variant="success"
        isLoading={isProcessing}
      />

      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title="Cancel Draft Count"
        message="Are you sure you want to void this count record?"
        confirmLabel="Void Count"
        variant="destructive"
        isLoading={isProcessing}
      />
    </div>
  );
}
