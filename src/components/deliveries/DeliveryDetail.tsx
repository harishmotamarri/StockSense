import React, { useState, useEffect } from 'react';
import { Delivery } from '../../types';
import {
  getDeliveryById,
  startPickingDelivery,
  markDeliveryPacked,
  validateDelivery,
  cancelDelivery,
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
  PackageCheck,
  Boxes,
  Truck,
  Building2,
  MapPin,
  Calendar,
  XCircle,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';

interface DeliveryDetailProps {
  deliveryId: string;
}

export function DeliveryDetail({ deliveryId }: DeliveryDetailProps) {
  const { navigate } = useNavigation();
  const { success, error } = useToast();

  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modals
  const [showValidateConfirm, setShowValidateConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getDeliveryById(deliveryId);
      setDelivery(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [deliveryId]);

  const handleStartPicking = async () => {
    if (!delivery) return;
    setIsProcessing(true);
    try {
      const updated = await startPickingDelivery(delivery.id);
      setDelivery(updated);
      success('Picking Started', 'Items marked as picked from warehouse shelving.');
    } catch (err: any) {
      error('Failed to start picking', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkPacked = async () => {
    if (!delivery) return;
    setIsProcessing(true);
    try {
      const updated = await markDeliveryPacked(delivery.id);
      setDelivery(updated);
      success('Packing Completed', 'Consignment packed and staged for vehicle loading.');
    } catch (err: any) {
      error('Failed to pack', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidateDelivery = async () => {
    if (!delivery) return;
    setIsProcessing(true);
    try {
      const updated = await validateDelivery(delivery.id);
      setDelivery(updated);
      success('Delivery Validated', 'Stock has been officially deducted from inventory and logged in ledger.');
      setShowValidateConfirm(false);
    } catch (err: any) {
      error('Validation failed', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelDelivery = async () => {
    if (!delivery) return;
    setIsProcessing(true);
    try {
      const updated = await cancelDelivery(delivery.id);
      setDelivery(updated);
      success('Delivery Order Canceled', 'Allocated stock reservations have been released.');
      setShowCancelConfirm(false);
    } catch (err: any) {
      error('Failed to cancel delivery', err.message);
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

  if (!delivery) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Delivery Not Found</h2>
        <Button size="sm" variant="outline" className="mt-4" onClick={() => navigate('/deliveries')}>
          Back to Deliveries
        </Button>
      </div>
    );
  }

  // 3-step outbound workflow: Pick -> Pack -> Validate
  const stages = [
    { key: 'draft', label: '1. Requisition & Staged' },
    { key: 'picking', label: '2. Picking from Shelf' },
    { key: 'packing', label: '3. Packed & Loaded' },
    { key: 'validated', label: '4. Validated & Dispatched' },
  ];

  const getStageIdx = (stg: Delivery['stage']) => {
    switch (stg) {
      case 'draft':
        return 0;
      case 'picking':
        return 1;
      case 'packing':
        return 2;
      case 'validated':
        return 3;
      default:
        return 0;
    }
  };

  const activeStageIdx = getStageIdx(delivery.stage);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/deliveries')}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Delivery Order {delivery.deliveryNumber}
              </h1>
              <StatusBadge status={delivery.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Consignee: {delivery.customer}</p>
          </div>
        </div>

        {/* Workflow Actions */}
        <div className="flex items-center gap-2">
          {delivery.status !== 'Done' && delivery.status !== 'Canceled' && (
            <>
              {delivery.stage === 'draft' && (
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleStartPicking}
                  isLoading={isProcessing}
                  leftIcon={<ClipboardList className="w-4 h-4" />}
                >
                  Start Picking
                </Button>
              )}

              {delivery.stage === 'picking' && (
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleMarkPacked}
                  isLoading={isProcessing}
                  leftIcon={<PackageCheck className="w-4 h-4" />}
                >
                  Mark Packed
                </Button>
              )}

              {delivery.stage === 'packing' && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => setShowValidateConfirm(true)}
                  isLoading={isProcessing}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Validate Delivery & Deduct Stock
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                className="text-rose-600 hover:bg-rose-50"
                onClick={() => setShowCancelConfirm(true)}
                disabled={isProcessing}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Cancel Delivery
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stepper Card */}
      <Card className="p-5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Outbound Fulfillment Stepper (Pick → Pack → Validate)
        </div>
        <div className="grid grid-cols-4 gap-2">
          {stages.map((stg, idx) => {
            const isCompleted = activeStageIdx >= idx && delivery.status !== 'Canceled';
            const isCurrent = activeStageIdx === idx && delivery.status !== 'Canceled';

            return (
              <div key={stg.key} className="flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                    isCompleted
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  } ${isCurrent ? 'ring-4 ring-purple-100' : ''}`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isCompleted ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {stg.label}
                </span>
              </div>
            );
          })}
        </div>

        {delivery.status === 'Done' && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold block">Delivery order validated and dispatched.</span>
              <span className="text-emerald-700 text-[11px]">
                Stock quantities were permanently deducted from bay {delivery.sourceLocationCode} and recorded in the audit ledger.
              </span>
            </div>
          </div>
        )}

        {delivery.status === 'Canceled' && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">Delivery canceled. Stock reservations released.</span>
          </div>
        )}
      </Card>

      {/* Meta Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-slate-400" /> Consignee Customer
          </span>
          <p className="mt-1 font-semibold text-slate-900 text-sm">{delivery.customer}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" /> Dispatch Warehouse
          </span>
          <p className="mt-1 font-semibold text-slate-900 text-sm">{delivery.warehouseName}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Source Picking Bay
          </span>
          <p className="mt-1 font-semibold text-slate-900 text-sm font-mono">
            {delivery.sourceLocationCode}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Scheduled Date
          </span>
          <p className="mt-1 font-semibold text-slate-900 text-sm font-mono">
            {delivery.deliveryDate}
          </p>
        </Card>
      </div>

      {/* Line Items Table */}
      <Card>
        <CardHeader
          title="Outbound Items Fulfillment Matrix"
          description="Track items picked, packed, and released against order requirements"
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold">SKU</th>
                  <th className="py-3 px-4 font-semibold text-right">Requested Qty</th>
                  <th className="py-3 px-4 font-semibold text-right">Picked Qty</th>
                  <th className="py-3 px-4 font-semibold text-right">Packed Qty</th>
                  <th className="py-3 px-4 font-semibold">Unit</th>
                  <th className="py-3 px-4 font-semibold text-right">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {delivery.items.map((item) => (
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
                      {item.requestedQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">
                      {item.pickedQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-purple-600">
                      {item.packedQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{item.unit}</td>
                    <td className="py-3 px-4 text-right">
                      {delivery.status === 'Done' ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Dispatched
                        </span>
                      ) : delivery.stage === 'packing' ? (
                        <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Packed & Ready
                        </span>
                      ) : delivery.stage === 'picking' ? (
                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          Picked from Shelf
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Staged for Pick
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

      {/* Notes */}
      {delivery.notes && (
        <Card>
          <CardHeader title="Dispatch & Freight Notes" />
          <CardContent>
            <p className="text-xs text-slate-600 leading-relaxed">{delivery.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Validation Confirm */}
      <ConfirmDialog
        isOpen={showValidateConfirm}
        onClose={() => setShowValidateConfirm(false)}
        onConfirm={handleValidateDelivery}
        title="Validate Outbound Delivery"
        message={
          <>
            Are you sure you want to validate <strong>{delivery.deliveryNumber}</strong>? Physical
            inventory will be permanently deducted from bay{' '}
            <strong>{delivery.sourceLocationCode}</strong> and outbound transactions recorded in the
            movement ledger.
          </>
        }
        confirmLabel="Validate & Dispatch"
        variant="success"
        isLoading={isProcessing}
      />

      {/* Cancel Confirm */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelDelivery}
        title="Cancel Delivery Order"
        message={`Are you sure you want to cancel ${delivery.deliveryNumber}? All stock reservations will be released immediately.`}
        confirmLabel="Void Delivery Order"
        variant="destructive"
        isLoading={isProcessing}
      />
    </div>
  );
}
