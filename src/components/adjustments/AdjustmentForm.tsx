import React, { useState, useEffect } from 'react';
import { Product, Warehouse, WarehouseLocation, AdjustmentReason } from '../../types';
import { getProducts, getWarehouses, getLocations, createAdjustment } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  SlidersHorizontal,
  AlertTriangle,
  Check,
  TrendingDown,
  TrendingUp,
  Scale,
} from 'lucide-react';

export function AdjustmentForm() {
  const { navigate } = useNavigation();
  const { success, error } = useToast();

  const [warehouseId, setWarehouseId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [productId, setProductId] = useState('');
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [reason, setReason] = useState<AdjustmentReason>('Damaged');
  const [notes, setNotes] = useState('');
  const [autoApply, setAutoApply] = useState(true);

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, whList, locList] = await Promise.all([
          getProducts(),
          getWarehouses(),
          getLocations(),
        ]);
        setAvailableProducts(prodList);
        setWarehouses(whList);
        setLocations(locList);

        if (whList.length > 0) setWarehouseId(whList[0].id);
        if (prodList.length > 0) setProductId(prodList[0].id);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  const filteredLocations = locations.filter(
    (l) => !warehouseId || l.warehouseId === warehouseId
  );

  useEffect(() => {
    if (filteredLocations.length > 0) {
      setLocationId(filteredLocations[0].id);
    }
  }, [warehouseId, locations]);

  const selectedProduct = availableProducts.find((p) => p.id === productId);

  // Compute location-specific or total system quantity
  const matchedLocStock = selectedProduct?.locations.find(
    (l) => l.warehouseId === warehouseId && l.locationId === locationId
  );

  const systemQuantity = matchedLocStock ? matchedLocStock.quantity : (selectedProduct?.totalStock || 0);

  // Auto initialize physical count when product/location changes
  useEffect(() => {
    setPhysicalCount(systemQuantity);
  }, [systemQuantity]);

  const difference = physicalCount - systemQuantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      error('Please select a product');
      return;
    }
    if (!warehouseId || !locationId) {
      error('Please select warehouse facility and location bay');
      return;
    }

    const wh = warehouses.find((w) => w.id === warehouseId);
    const loc = locations.find((l) => l.id === locationId);

    setIsSubmitting(true);
    try {
      const adj = await createAdjustment({
        warehouseId,
        warehouseName: wh ? wh.name : 'Main Warehouse',
        locationId,
        locationCode: loc ? loc.code : 'BAY-01',
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        unit: selectedProduct.unit,
        systemQuantity,
        physicalCount,
        reason,
        notes,
        autoApply,
      });

      success(
        autoApply ? 'Adjustment Applied & Inventory Adjusted' : 'Draft Adjustment Saved',
        `Discrepancy of ${difference >= 0 ? `+${difference}` : difference} ${selectedProduct.unit} recorded.`
      );
      navigate(`/adjustments/${adj.id}`);
    } catch (err: any) {
      error('Adjustment failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonOptions: { value: AdjustmentReason; label: string }[] = [
    { value: 'Damaged', label: 'Damaged (Puncture, Leakage, Broken)' },
    { value: 'Lost', label: 'Lost / Unaccounted Disappearance' },
    { value: 'Found', label: 'Found / Surplus Discovered' },
    { value: 'Counting Error', label: 'Cycle Counting / Human Error' },
    { value: 'Expired', label: 'Expired / Shelf Life Exceeded' },
    { value: 'Other', label: 'Other Stock Correction' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/adjustments')}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            Physical Stock Audit & Count Adjustment
          </h1>
          <p className="text-xs text-slate-500">
            Reconcile book inventory against physical cycle count counts with automated delta calculations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader
            title="Location & Product Selection"
            description="Select the bay and SKU being audited"
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Warehouse Facility"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                required
              />

              <Select
                label="Audited Location Bay"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                options={filteredLocations.map((l) => ({
                  value: l.id,
                  label: `${l.code} - ${l.name}`,
                }))}
                required
              />
            </div>

            <div>
              <Select
                label="Product to Count"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                options={availableProducts.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.sku})`,
                }))}
                required
              />
            </div>

            {/* Reconciliation Calculator Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Reconciliation Calculator
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    System Quantity
                  </span>
                  <span className="text-xl font-mono font-bold text-slate-800">
                    {systemQuantity}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">{selectedProduct?.unit}</span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-300">
                  <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Physical Count (Actual)
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={physicalCount}
                    onChange={(e) => setPhysicalCount(Number(e.target.value))}
                    className="w-28 text-center text-xl font-mono font-bold border rounded p-1 border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-500 ml-1">{selectedProduct?.unit}</span>
                </div>

                <div
                  className={`p-3 rounded-lg border ${
                    difference === 0
                      ? 'bg-slate-100 border-slate-200'
                      : difference < 0
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Calculated Difference
                  </span>
                  <div className="flex items-center justify-center gap-1">
                    {difference < 0 ? (
                      <TrendingDown className="w-5 h-5 text-rose-600" />
                    ) : difference > 0 ? (
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    ) : null}
                    <span
                      className={`text-xl font-mono font-bold ${
                        difference === 0
                          ? 'text-slate-700'
                          : difference < 0
                          ? 'text-rose-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {difference > 0 ? `+${difference}` : difference}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">{selectedProduct?.unit}</span>
                  </div>
                </div>
              </div>

              {/* Prominent Warning on Discrepancy */}
              {difference !== 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      Warning: Adjustment directly alters physical stock
                    </span>
                    <span className="text-amber-800">
                      Submitting will alter the inventory ledger by{' '}
                      <strong>
                        {difference > 0 ? `+${difference}` : difference} {selectedProduct?.unit}
                      </strong>{' '}
                      to match physical count of <strong>{physicalCount}</strong>.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Adjustment Reason Code"
                value={reason}
                onChange={(e) => setReason(e.target.value as AdjustmentReason)}
                options={reasonOptions}
                required
              />

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 select-none">
                  <input
                    type="checkbox"
                    checked={autoApply}
                    onChange={(e) => setAutoApply(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Immediately apply stock update & write to ledger
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Audit Notes & Discrepancy Explanation
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Discovered damaged packaging on shelf layer 2 during monthly cycle count..."
                className="w-full rounded-md border border-slate-300 p-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </CardContent>

          <CardFooter className="justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/adjustments')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
              isLoading={isSubmitting}
              leftIcon={<Check className="w-4 h-4" />}
            >
              {autoApply ? 'Apply Count Adjustment' : 'Save Draft Count'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
