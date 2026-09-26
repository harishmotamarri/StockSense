import React, { useState, useEffect } from 'react';
import { Receipt } from '../../types';
import {
  getReceiptById,
  validateReceipt,
  advanceReceiptStatus,
  cancelReceipt,
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
  Clock,
  Truck,
  Building2,
  MapPin,
  Calendar,
  User,
  AlertCircle,
  FileCheck,
  XCircle,
  ArrowRight,
  Boxes,
} from 'lucide-react';

interface ReceiptDetailProps {
  receiptId: string;
}

export function ReceiptDetail({ receiptId }: ReceiptDetailProps) {
  const { navigate } = useNavigation();
  const { success, error } = useToast();

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Dialogs
  const [showValidateConfirm, setShowValidateConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getReceiptById(receiptId);
      setReceipt(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [receiptId]);

  const handleAdvanceStatus = async () => {
    if (!receipt) return;
    setIsProcessing(true);
    try {
      const updated = await advanceReceiptStatus(receipt.id);
      setReceipt(updated);
      success('Status updated', `Receipt status is now ${updated.status}`);
    } catch (err: any) {
      error('Failed to advance status', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidateReceipt = async () => {
    if (!receipt) return;
    setIsProcessing(true);
    try {
      const updated = await validateReceipt(receipt.id);
      setReceipt(updated);
      success('Receipt Validated', 'Inventory has been officially updated and logged to the ledger.');
      setShowValidateConfirm(false);
    } catch (err: any) {
      error('Validation failed', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelReceipt = async () => {
    if (!receipt) return;
    setIsProcessing(true);
    try {
      const updated = await cancelReceipt(receipt.id);
      setReceipt(updated);
      success('Receipt Canceled', `Receipt ${receipt.receiptNumber} canceled.`);
      setShowCancelConfirm(false);
    } catch (err: any) {
      error('Failed to cancel receipt', err.message);
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

  if (!receipt) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Receipt Not Found</h2>
        <Button size="sm" variant="outline" className="mt-4" onClick={() => navigate('/receipts')}>
          Back to Receipts
        </Button>
      </div>
    );
  }

  // Workflow steps: Draft -> Waiting -> Ready -> Done
  const workflowSteps = [
    { key: 'Draft', label: 'Draft Requisition' },
    { key: 'Waiting', label: 'Supplier In-Transit' },
    { key: 'Ready', label: 'Staged at Dock' },
    { key: 'Done', label: 'Stock Intake Validated' },
  ];

  const getStepIndex = (status: string) => {
    if (status === 'Draft') return 0;
    if (status === 'Waiting') return 1;
    if (status === 'Ready') return 2;
    if (status === 'Done') return 3;
    return -1; // Canceled
  };

  const currentStepIdx = getStepIndex(receipt.status);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/receipts')}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Receipt {receipt.receiptNumber}
              </h1>
              <StatusBadge status={receipt.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Supplier: {receipt.supplier}</p>
          </div>
        </div>

        {/* Action Buttons depending on workflow state */}
        <div className="flex items-center gap-2">
          {receipt.status === 'Draft' && (
            <Button
              size="sm"
              variant="primary"
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleAdvanceStatus}
              isLoading={isProcessing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Confirm Requisition
            </Button>
          )}

          {receipt.status === 'Waiting' && (
            <Button
              size="sm"
              variant="primary"
              className="bg-sky-600 hover:bg-sky-700"
              onClick={handleAdvanceStatus}
              isLoading={isProcessing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Mark Staged / Ready at Dock
            </Button>
          )}

          {receipt.status === 'Ready' && (
            <Button
              size="sm"
              variant="success"
              onClick={() => setShowValidateConfirm(true)}
              isLoading={isProcessing}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Validate Receipt & Update Stock
            </Button>
          )}

          {receipt.status !== 'Done' && receipt.status !== 'Canceled' && (
            <Button
              size="sm"
              variant="outline"
              className="text-rose-600 hover:bg-rose-50"
              onClick={() => setShowCancelConfirm(true)}
              disabled={isProcessing}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Cancel Receipt
            </Button>
          )}
        </div>
      </div>

      {/* Visual Workflow Stepper */}
      <Card className="p-5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Receipt Workflow Progression
        </div>
        <div className="grid grid-cols-4 gap-2 relative">
          {workflowSteps.map((step, idx) => {
            const isCompleted = currentStepIdx >= idx && receipt.status !== 'Canceled';
            const isCurrent = currentStepIdx === idx && receipt.status !== 'Canceled';

            return (
              <div key={step.key} className="flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isCompleted ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {receipt.status === 'Done' && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold block">Receipt validated. Inventory has been updated.</span>
              <span className="text-emerald-700 text-[11px]">
                Stock quantities have been credited to bay {receipt.destinationLocationCode} and registered in the movement history.
              </span>
            </div>
          </div>
        )}

        {receipt.status === 'Canceled' && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">This receipt was canceled. No inventory was received.</span>
          </div>
        )}
      </Card>

      {/* Meta Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-slate-400" /> Supplier
          </span>
          <p className="mt-1 font-semibold text-slate-900 text-sm">{receipt.supplier}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" /> Warehouse Facility
          </span>
          <p className="mt-1 font-semibold text-slate-900 text-sm">{receipt.warehouseName}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Destination Bay
          </span>
          <p className="mt-1 font-semibold text-slate-900 text-sm font-mono">
            {receipt.destinationLocationCode}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Expected Date
          </span>
          <p className="mt-1 font-semibold text-slate-900 text-sm font-mono">{receipt.expectedDate}</p>
        </Card>
      </div>

      {/* Line Items Table */}
      <Card>
        <CardHeader
          title="Inbound Products"
          description="Quantities expected versus physically checked-in"
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Product Name</th>
                  <th className="py-3 px-4 font-semibold">SKU</th>
                  <th className="py-3 px-4 font-semibold text-right">Expected Qty</th>
                  <th className="py-3 px-4 font-semibold text-right">Received Qty</th>
                  <th className="py-3 px-4 font-semibold">Unit</th>
                  <th className="py-3 px-4 font-semibold text-right">Line Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipt.items.map((item) => (
                  <tr key={item.productId} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <button
                        onClick={() => navigate(`/products/${item.productId}`)}
                        className="hover:text-indigo-600 transition"
                      >
                        {item.productName}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{item.sku}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {item.expectedQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      {receipt.status === 'Done' ? item.expectedQuantity.toLocaleString() : '0'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{item.unit}</td>
                    <td className="py-3 px-4 text-right">
                      {receipt.status === 'Done' ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Intake Completed
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Pending Verification
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

      {/* Audit & Notes */}
      {receipt.notes && (
        <Card>
          <CardHeader title="Logistics & Delivery Notes" />
          <CardContent>
            <p className="text-xs text-slate-600 leading-relaxed">{receipt.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Validation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showValidateConfirm}
        onClose={() => setShowValidateConfirm(false)}
        onConfirm={handleValidateReceipt}
        title="Validate Goods Receipt"
        message={
          <>
            Are you sure you want to validate <strong>{receipt.receiptNumber}</strong>? This will
            permanently increment physical stock for all line items at bay{' '}
            <strong>{receipt.destinationLocationCode}</strong> and log transactions into the
            inventory ledger.
          </>
        }
        confirmLabel="Validate & Update Stock"
        variant="success"
        isLoading={isProcessing}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelReceipt}
        title="Cancel Receipt"
        message={`Are you sure you want to cancel receipt ${receipt.receiptNumber}? This document will be permanently voided.`}
        confirmLabel="Void Receipt"
        variant="destructive"
        isLoading={isProcessing}
      />
    </div>
  );
}
