import React, { useState, useEffect } from 'react';
import { Transfer } from '../../types';
import {
  getTransferById,
  validateTransfer,
  advanceTransferStatus,
  cancelTransfer,
} from '../../lib/api';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  CheckCircle2,
  ArrowLeftRight,
  ArrowRight,
  Building2,
  MapPin,
  Calendar,
  XCircle,
} from 'lucide-react';

interface TransferDetailProps {
  transferId: string;
}

export function TransferDetail({ transferId }: TransferDetailProps) {
  const { navigate } = useNavigation();
  const { success, error } = useToast();

  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showValidateConfirm, setShowValidateConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getTransferById(transferId);
      setTransfer(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [transferId]);

  const handleAdvance = async () => {
    if (!transfer) return;
    setIsProcessing(true);
    try {
      const updated = await advanceTransferStatus(transfer.id);
      setTransfer(updated);
      success('Status advanced', `Transfer status changed to ${updated.status}`);
    } catch (err: any) {
      error('Failed to advance', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidateTransfer = async () => {
    if (!transfer) return;
    setIsProcessing(true);
    try {
      const updated = await validateTransfer(transfer.id);
      setTransfer(updated);
      success(
        'Transfer Completed',
        `Stock transferred from ${transfer.sourceLocationCode} to ${transfer.destLocationCode}.`
      );
      setShowValidateConfirm(false);
    } catch (err: any) {
      error('Validation failed', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelTransfer = async () => {
    if (!transfer) return;
    setIsProcessing(true);
    try {
      const updated = await cancelTransfer(transfer.id);
      setTransfer(updated);
      success('Transfer Canceled', 'Requisition voided.');
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
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Transfer Order Not Found</h2>
        <Button size="sm" variant="outline" className="mt-4" onClick={() => navigate('/transfers')}>
          Back to Transfers
        </Button>
      </div>
    );
  }

  const steps = [
    { key: 'Draft', label: '1. Draft' },
    { key: 'Waiting', label: '2. In-Transit / Pending' },
    { key: 'Ready', label: '3. Staged for Intake' },
    { key: 'Done', label: '4. Transferred' },
  ];

  const getStepIdx = (st: string) => {
    if (st === 'Draft') return 0;
    if (st === 'Waiting') return 1;
    if (st === 'Ready') return 2;
    if (st === 'Done') return 3;
    return -1;
  };

  const currentStep = getStepIdx(transfer.status);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/transfers')}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Transfer {transfer.transferNumber}
              </h1>
              <StatusBadge status={transfer.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {transfer.sourceWarehouseName} ({transfer.sourceLocationCode}) →{' '}
              {transfer.destWarehouseName} ({transfer.destLocationCode})
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {transfer.status === 'Waiting' && (
            <Button
              size="sm"
              variant="primary"
              className="bg-teal-600 hover:bg-teal-700"
              onClick={handleAdvance}
              isLoading={isProcessing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Mark Staged at Destination
            </Button>
          )}

          {transfer.status === 'Ready' && (
            <Button
              size="sm"
              variant="success"
              onClick={() => setShowValidateConfirm(true)}
              isLoading={isProcessing}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Validate & Execute Stock Transfer
            </Button>
          )}

          {transfer.status !== 'Done' && transfer.status !== 'Canceled' && (
            <Button
              size="sm"
              variant="outline"
              className="text-rose-600 hover:bg-rose-50"
              onClick={() => setShowCancelConfirm(true)}
              disabled={isProcessing}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Cancel Transfer
            </Button>
          )}
        </div>
      </div>

      {/* Stepper */}
      <Card className="p-5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Transfer Stepper Progress
        </div>
        <div className="grid grid-cols-4 gap-2">
          {steps.map((st, idx) => {
            const isCompleted = currentStep >= idx && transfer.status !== 'Canceled';
            const isCurrent = currentStep === idx && transfer.status !== 'Canceled';

            return (
              <div key={st.key} className="flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                    isCompleted
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  } ${isCurrent ? 'ring-4 ring-teal-100' : ''}`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isCompleted ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>

        {transfer.status === 'Done' && (
          <div className="mt-4 p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            <div>
              <span className="font-semibold block">
                Transfer validated. Stock successfully reallocated.
              </span>
              <span className="text-teal-700 text-[11px]">
                Source location ({transfer.sourceLocationCode}) decreased. Destination location (
                {transfer.destLocationCode}) increased. Dual ledger movements recorded.
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Route Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-slate-50/70 border-slate-200">
          <span className="text-xs font-bold uppercase text-slate-500 block mb-2">
            Source Origin
          </span>
          <p className="text-sm font-semibold text-slate-900">{transfer.sourceWarehouseName}</p>
          <p className="text-xs font-mono text-slate-600 mt-1">
            Bay: <strong className="text-slate-900">{transfer.sourceLocationCode}</strong>
          </p>
        </Card>

        <Card className="p-4 bg-slate-50/70 border-slate-200">
          <span className="text-xs font-bold uppercase text-slate-500 block mb-2">
            Target Destination
          </span>
          <p className="text-sm font-semibold text-slate-900">{transfer.destWarehouseName}</p>
          <p className="text-xs font-mono text-slate-600 mt-1">
            Bay: <strong className="text-slate-900">{transfer.destLocationCode}</strong>
          </p>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader
          title="Transfer Line Items"
          description="Quantities being relocated between designated facilities"
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold">SKU</th>
                  <th className="py-3 px-4 font-semibold text-right">Transfer Quantity</th>
                  <th className="py-3 px-4 font-semibold">Unit</th>
                  <th className="py-3 px-4 font-semibold text-right">Transfer Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfer.items.map((item) => (
                  <tr key={item.productId} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.productName}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{item.sku}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-teal-700 text-sm">
                      {item.transferQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{item.unit}</td>
                    <td className="py-3 px-4 text-right">
                      {transfer.status === 'Done' ? (
                        <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          Reallocated
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Transfer Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Validation Dialog */}
      <ConfirmDialog
        isOpen={showValidateConfirm}
        onClose={() => setShowValidateConfirm(false)}
        onConfirm={handleValidateTransfer}
        title="Execute Internal Stock Transfer"
        message={
          <>
            Are you sure you want to validate <strong>{transfer.transferNumber}</strong>? Physical
            inventory will be decremented from bay{' '}
            <strong>{transfer.sourceLocationCode}</strong> and incremented at bay{' '}
            <strong>{transfer.destLocationCode}</strong>.
          </>
        }
        confirmLabel="Execute Transfer"
        variant="success"
        isLoading={isProcessing}
      />

      {/* Cancel Dialog */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelTransfer}
        title="Cancel Transfer Order"
        message={`Are you sure you want to void transfer ${transfer.transferNumber}?`}
        confirmLabel="Void Transfer"
        variant="destructive"
        isLoading={isProcessing}
      />
    </div>
  );
}
