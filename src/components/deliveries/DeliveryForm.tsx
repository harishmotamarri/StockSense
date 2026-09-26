import React, { useState, useEffect } from 'react';
import { Product, Warehouse, WarehouseLocation, DeliveryItem, UnitOfMeasure } from '../../types';
import { getProducts, getWarehouses, getLocations, createDelivery } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Plus, Trash2, ArrowUpFromLine, AlertTriangle, Check } from 'lucide-react';

export function DeliveryForm() {
  const { navigate } = useNavigation();
  const { success, error } = useToast();

  const [customer, setCustomer] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [sourceLocationId, setSourceLocationId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);

  // Line items
  const [items, setItems] = useState<
    {
      productId: string;
      productName: string;
      sku: string;
      unit: UnitOfMeasure;
      requestedQuantity: number;
      availableStock: number;
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

        if (whList.length > 0) setWarehouseId(whList[0].id);

        if (prodList.length > 0) {
          const firstInStock = prodList.find((p) => p.availableStock > 0) || prodList[0];
          setItems([
            {
              productId: firstInStock.id,
              productName: firstInStock.name,
              sku: firstInStock.sku,
              unit: firstInStock.unit,
              requestedQuantity: Math.min(20, Math.max(1, firstInStock.availableStock)),
              availableStock: firstInStock.availableStock,
            },
          ]);
        }
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
      setSourceLocationId(filteredLocations[0].id);
    }
  }, [warehouseId, locations]);

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
      availableStock: prod.availableStock,
      requestedQuantity: Math.min(updated[index].requestedQuantity, Math.max(1, prod.availableStock)),
    };
    setItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...items];
    updated[index].requestedQuantity = Math.max(1, qty);
    setItems(updated);
  };

  const handleAddItem = () => {
    const candidate = availableProducts.find((p) => p.availableStock > 0) || availableProducts[0];
    if (!candidate) return;
    setItems((prev) => [
      ...prev,
      {
        productId: candidate.id,
        productName: candidate.name,
        sku: candidate.sku,
        unit: candidate.unit,
        requestedQuantity: Math.min(10, Math.max(1, candidate.availableStock)),
        availableStock: candidate.availableStock,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      error('Delivery must have at least one line item');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim()) {
      error('Customer / Client name is required');
      return;
    }
    if (!warehouseId || !sourceLocationId) {
      error('Warehouse and source rack bay must be specified');
      return;
    }

    // Check frontend client sufficiency warning
    for (const item of items) {
      if (item.requestedQuantity > item.availableStock) {
        error(
          'Insufficient Stock',
          `Insufficient stock for ${item.productName}. Requested: ${item.requestedQuantity} ${item.unit}. Available: ${item.availableStock} ${item.unit}.`
        );
        return;
      }
    }

    const wh = warehouses.find((w) => w.id === warehouseId);
    const loc = locations.find((l) => l.id === sourceLocationId);

    setIsSubmitting(true);
    try {
      const delivery = await createDelivery({
        customer,
        warehouseId,
        warehouseName: wh ? wh.name : 'Main Warehouse',
        sourceLocationId,
        sourceLocationCode: loc ? loc.code : 'RACK-A',
        deliveryDate,
        notes,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          sku: i.sku,
          unit: i.unit,
          requestedQuantity: i.requestedQuantity,
          pickedQuantity: 0,
          packedQuantity: 0,
          availableStock: i.availableStock,
        })),
      });

      success('Delivery Order Created', `${delivery.deliveryNumber} is queued for picking.`);
      navigate(`/deliveries/${delivery.id}`);
    } catch (err: any) {
      error('Delivery creation failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerPresets = [
    'XYZ Manufacturing',
    'BuildPro Industries',
    'Alpha Constructions',
    'Apex Heavy Machinery',
    'Northline Logistics',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/deliveries')}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ArrowUpFromLine className="w-5 h-5 text-purple-600" />
            Create Outbound Delivery Order
          </h1>
          <p className="text-xs text-slate-500">
            Dispatch stock to clients or external project sites with automated inventory reservation.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader
            title="Consignee & Dispatch Information"
            description="Client details and source fulfillment warehouse"
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Customer / Client Name"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="e.g. XYZ Manufacturing"
                  required
                />
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Presets:</span>
                  {customerPresets.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCustomer(c)}
                      className="text-[10px] text-indigo-600 hover:underline"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Scheduled Delivery Date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Source Warehouse"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                required
              />

              <Select
                label="Source Picking Bay"
                value={sourceLocationId}
                onChange={(e) => setSourceLocationId(e.target.value)}
                options={filteredLocations.map((l) => ({
                  value: l.id,
                  label: `${l.code} - ${l.name}`,
                }))}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Shipping & Handling Instructions
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="SO-4421: Palletized with shrink wrap, customer truck arriving 10am Dock 3..."
                className="w-full rounded-md border border-slate-300 p-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </CardContent>

          {/* Line items table */}
          <CardHeader
            title="Outbound Products for Picking"
            description="Products requested and real-time available stock verification"
            className="border-t border-slate-100"
            action={
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={handleAddItem}
                leftIcon={<Plus className="w-3.5 h-3.5 text-purple-600" />}
              >
                Add Outbound Line
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
                    <th className="py-2.5 px-4 font-semibold text-right">Available Stock</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Requested Qty</th>
                    <th className="py-2.5 px-4 font-semibold">Unit</th>
                    <th className="py-2.5 px-4 font-semibold text-right w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const isInsufficient = item.requestedQuantity > item.availableStock;
                    return (
                      <tr
                        key={idx}
                        className={isInsufficient ? 'bg-rose-50/60' : 'hover:bg-slate-50/50'}
                      >
                        <td className="py-2.5 px-4">
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                            className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white font-medium"
                          >
                            {availableProducts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.availableStock} {p.unit} avail)
                              </option>
                            ))}
                          </select>
                          {isInsufficient && (
                            <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                              <AlertTriangle className="w-3 h-3" />
                              Insufficient stock. Requested: {item.requestedQuantity} {item.unit}.
                              Available: {item.availableStock} {item.unit}.
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">{item.sku}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-700">
                          {item.availableStock.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <input
                            type="number"
                            min="1"
                            value={item.requestedQuantity}
                            onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                            className={`w-24 text-right text-xs rounded border p-1.5 font-mono font-bold ${
                              isInsufficient
                                ? 'border-rose-400 bg-rose-50 text-rose-900'
                                : 'border-slate-300'
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
              onClick={() => navigate('/deliveries')}
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
              Create Delivery Order
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
