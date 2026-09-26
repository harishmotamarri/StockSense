import React, { useState, useEffect } from 'react';
import { Product, Warehouse, WarehouseLocation, TransferItem, UnitOfMeasure } from '../../types';
import { getProducts, getWarehouses, getLocations, createTransfer } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Plus, Trash2, ArrowLeftRight, Check, AlertTriangle } from 'lucide-react';

export function TransferForm() {
  const { navigate } = useNavigation();
  const { success, error } = useToast();

  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [sourceLocationId, setSourceLocationId] = useState('');
  const [destWarehouseId, setDestWarehouseId] = useState('');
  const [destLocationId, setDestLocationId] = useState('');
  const [notes, setNotes] = useState('');

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);

  const [items, setItems] = useState<
    {
      productId: string;
      productName: string;
      sku: string;
      unit: UnitOfMeasure;
      availableQuantity: number;
      transferQuantity: number;
    }[]
  >([]);

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

        if (whList.length > 0) {
          setSourceWarehouseId(whList[0].id);
          setDestWarehouseId(whList[1]?.id || whList[0].id);
        }

        if (prodList.length > 0) {
          const inStock = prodList.find((p) => p.totalStock > 0) || prodList[0];
          setItems([
            {
              productId: inStock.id,
              productName: inStock.name,
              sku: inStock.sku,
              unit: inStock.unit,
              availableQuantity: inStock.totalStock,
              transferQuantity: Math.min(25, inStock.totalStock),
            },
          ]);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  const sourceLocations = locations.filter((l) => l.warehouseId === sourceWarehouseId);
  const destLocations = locations.filter((l) => l.warehouseId === destWarehouseId);

  useEffect(() => {
    if (sourceLocations.length > 0) setSourceLocationId(sourceLocations[0].id);
  }, [sourceWarehouseId, locations]);

  useEffect(() => {
    if (destLocations.length > 0) setDestLocationId(destLocations[0].id);
  }, [destWarehouseId, locations]);

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = availableProducts.find((p) => p.id === prodId);
    if (!prod) return;
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      unit: prod.unit,
      availableQuantity: prod.totalStock,
      transferQuantity: Math.min(updated[index].transferQuantity, Math.max(1, prod.totalStock)),
    };
    setItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...items];
    updated[index].transferQuantity = Math.max(1, qty);
    setItems(updated);
  };

  const handleAddItem = () => {
    const candidate = availableProducts.find((p) => p.totalStock > 0) || availableProducts[0];
    if (!candidate) return;
    setItems((prev) => [
      ...prev,
      {
        productId: candidate.id,
        productName: candidate.name,
        sku: candidate.sku,
        unit: candidate.unit,
        availableQuantity: candidate.totalStock,
        transferQuantity: Math.min(10, Math.max(1, candidate.totalStock)),
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      error('Transfer must have at least one line item');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceWarehouseId || !sourceLocationId) {
      error('Source warehouse and location are required');
      return;
    }
    if (!destWarehouseId || !destLocationId) {
      error('Destination warehouse and location are required');
      return;
    }

    if (sourceWarehouseId === destWarehouseId && sourceLocationId === destLocationId) {
      error('Source and destination bays must be different for a transfer');
      return;
    }

    for (const item of items) {
      if (item.transferQuantity > item.availableQuantity) {
        error(
          'Insufficient Stock',
          `Cannot transfer ${item.transferQuantity} of ${item.productName}. Only ${item.availableQuantity} available in inventory.`
        );
        return;
      }
    }

    const srcWh = warehouses.find((w) => w.id === sourceWarehouseId);
    const srcLoc = locations.find((l) => l.id === sourceLocationId);
    const dstWh = warehouses.find((w) => w.id === destWarehouseId);
    const dstLoc = locations.find((l) => l.id === destLocationId);

    setIsSubmitting(true);
    try {
      const transfer = await createTransfer({
        sourceWarehouseId,
        sourceWarehouseName: srcWh ? srcWh.name : 'Source Warehouse',
        sourceLocationId,
        sourceLocationCode: srcLoc ? srcLoc.code : 'SRC-01',
        destWarehouseId,
        destWarehouseName: dstWh ? dstWh.name : 'Dest Warehouse',
        destLocationId,
        destLocationCode: dstLoc ? dstLoc.code : 'DST-01',
        notes,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          sku: i.sku,
          unit: i.unit,
          availableQuantity: i.availableQuantity,
          transferQuantity: i.transferQuantity,
        })),
      });

      success('Transfer Order Created', `${transfer.transferNumber} scheduled.`);
      navigate(`/transfers/${transfer.id}`);
    } catch (err: any) {
      error('Failed to create transfer', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/transfers')}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-teal-600" />
            Internal Stock Transfer
          </h1>
          <p className="text-xs text-slate-500">
            Relocate stock between bays or transfer items across physical warehouse facilities.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader
            title="Route & Facilities Selection"
            description="Origin and destination locations for the transfer shipment"
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
              {/* Source Origin */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Source (Origin)
                </span>
                <Select
                  label="Source Warehouse"
                  value={sourceWarehouseId}
                  onChange={(e) => setSourceWarehouseId(e.target.value)}
                  options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                  required
                />
                <Select
                  label="Source Bay"
                  value={sourceLocationId}
                  onChange={(e) => setSourceLocationId(e.target.value)}
                  options={sourceLocations.map((l) => ({
                    value: l.id,
                    label: `${l.code} - ${l.name}`,
                  }))}
                  required
                />
              </div>

              {/* Destination */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Destination (Target)
                </span>
                <Select
                  label="Destination Warehouse"
                  value={destWarehouseId}
                  onChange={(e) => setDestWarehouseId(e.target.value)}
                  options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                  required
                />
                <Select
                  label="Destination Bay"
                  value={destLocationId}
                  onChange={(e) => setDestLocationId(e.target.value)}
                  options={destLocations.map((l) => ({
                    value: l.id,
                    label: `${l.code} - ${l.name}`,
                  }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Internal Transfer Purpose / Logistics Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Replenish production line staging for assembly shift..."
                className="w-full rounded-md border border-slate-300 p-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </CardContent>

          {/* Transfer Line items */}
          <CardHeader
            title="Products to Transfer"
            description="Ensure available balance at source location meets transfer quantity"
            className="border-t border-slate-100"
            action={
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={handleAddItem}
                leftIcon={<Plus className="w-3.5 h-3.5 text-teal-600" />}
              >
                Add Transfer Line
              </Button>
            }
          />
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold w-1/2">Product</th>
                    <th className="py-2.5 px-4 font-semibold">SKU</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Available Qty</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Transfer Qty</th>
                    <th className="py-2.5 px-4 font-semibold">Unit</th>
                    <th className="py-2.5 px-4 font-semibold text-right w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const isExceeded = item.transferQuantity > item.availableQuantity;
                    return (
                      <tr key={idx} className={isExceeded ? 'bg-rose-50/60' : 'hover:bg-slate-50/50'}>
                        <td className="py-2.5 px-4">
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                            className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white font-medium"
                          >
                            {availableProducts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">{item.sku}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-700">
                          {item.availableQuantity.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <input
                            type="number"
                            min="1"
                            value={item.transferQuantity}
                            onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                            className={`w-24 text-right text-xs rounded border p-1.5 font-mono font-bold ${
                              isExceeded ? 'border-rose-400 bg-rose-50 text-rose-900' : 'border-slate-300'
                            }`}
                          />
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 font-medium">{item.unit}</td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={items.length <= 1}
                            className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>

          <CardFooter className="justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/transfers')}
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
              Submit Transfer Requisition
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
