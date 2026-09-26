import React, { useState, useEffect } from 'react';
import { Product, Warehouse, WarehouseLocation, ReceiptItem, UnitOfMeasure } from '../../types';
import { getProducts, getWarehouses, getLocations, createReceipt } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Plus, Trash2, Check, ArrowDownToLine } from 'lucide-react';

export function ReceiptForm() {
  const { navigate } = useNavigation();
  const { success, error } = useToast();

  const [supplier, setSupplier] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState('');
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
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
      expectedQuantity: number;
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
          setItems([
            {
              productId: prodList[0].id,
              productName: prodList[0].name,
              sku: prodList[0].sku,
              unit: prodList[0].unit,
              expectedQuantity: 50,
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
      setDestinationLocationId(filteredLocations[0].id);
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
    };
    setItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...items];
    updated[index].expectedQuantity = Math.max(1, qty);
    setItems(updated);
  };

  const handleAddItem = () => {
    if (availableProducts.length === 0) return;
    const firstProd = availableProducts[0];
    setItems((prev) => [
      ...prev,
      {
        productId: firstProd.id,
        productName: firstProd.name,
        sku: firstProd.sku,
        unit: firstProd.unit,
        expectedQuantity: 10,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      error('Receipt must have at least one line item');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalItemsCount = items.length;
  const totalQuantitySum = items.reduce((acc, i) => acc + (Number(i.expectedQuantity) || 0), 0);

  const handleSubmit = async (status: 'Draft' | 'Waiting') => {
    if (!supplier.trim()) {
      error('Supplier name is required');
      return;
    }
    if (!warehouseId || !destinationLocationId) {
      error('Warehouse and destination bay must be specified');
      return;
    }

    const wh = warehouses.find((w) => w.id === warehouseId);
    const loc = locations.find((l) => l.id === destinationLocationId);

    setIsSubmitting(true);
    try {
      const receipt = await createReceipt({
        supplier,
        warehouseId,
        warehouseName: wh ? wh.name : 'Main Warehouse',
        destinationLocationId,
        destinationLocationCode: loc ? loc.code : 'RECEIVE-01',
        expectedDate,
        notes,
        status,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          sku: i.sku,
          unit: i.unit,
          expectedQuantity: i.expectedQuantity,
          receivedQuantity: 0,
        })),
      });

      success(
        status === 'Draft' ? 'Draft Receipt Saved' : 'Receipt Confirmed',
        `Receipt ${receipt.receiptNumber} scheduled.`
      );
      navigate(`/receipts/${receipt.id}`);
    } catch (err: any) {
      error('Failed to create receipt', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/receipts')}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-sky-600" />
            Create Inbound Goods Receipt
          </h1>
          <p className="text-xs text-slate-500">
            Log an incoming supplier shipment into a destination warehouse rack.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          title="General Logistics Details"
          description="Supplier origin and intake facility destination"
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Supplier / Vendor Name"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. ABC Steel Ltd or Global Components"
              required
            />

            <Input
              label="Expected Delivery Date"
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Receiving Warehouse"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
              required
            />

            <Select
              label="Destination Staging Location"
              value={destinationLocationId}
              onChange={(e) => setDestinationLocationId(e.target.value)}
              options={filteredLocations.map((l) => ({
                value: l.id,
                label: `${l.code} - ${l.name} (${l.zone})`,
              }))}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              PO Reference / Freight Carrier Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="PO-8821: Deliver to Receiving Dock A, forklift offloading required..."
              className="w-full rounded-md border border-slate-300 p-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </CardContent>

        {/* Line Items Section */}
        <CardHeader
          title="Inbound Line Items"
          description="Specify products and quantities expected from the vendor"
          className="border-t border-slate-100"
          action={
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={handleAddItem}
              leftIcon={<Plus className="w-3.5 h-3.5 text-sky-600" />}
            >
              Add Product Line
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
                  <th className="py-2.5 px-4 font-semibold text-right">Expected Qty</th>
                  <th className="py-2.5 px-4 font-semibold">Unit</th>
                  <th className="py-2.5 px-4 font-semibold text-right w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-4">
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
                    <td className="py-2 px-4 font-mono text-slate-600">{item.sku}</td>
                    <td className="py-2 px-4 text-right">
                      <input
                        type="number"
                        min="1"
                        value={item.expectedQuantity}
                        onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                        className="w-24 text-right text-xs rounded border border-slate-300 p-1.5 font-mono font-bold"
                      />
                    </td>
                    <td className="py-2 px-4 text-slate-600 font-medium">{item.unit}</td>
                    <td className="py-2 px-4 text-right">
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Line Items Summary */}
          <div className="bg-slate-50/70 p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Total Line Items: <strong className="text-slate-900 font-mono">{totalItemsCount}</strong>
            </span>
            <span className="text-slate-500 font-medium">
              Total Expected Units:{' '}
              <strong className="text-slate-900 font-mono text-sm">
                {totalQuantitySum.toLocaleString()}
              </strong>
            </span>
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/receipts')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleSubmit('Draft')}
            isLoading={isSubmitting}
          >
            Save as Draft
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => handleSubmit('Waiting')}
            isLoading={isSubmitting}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Confirm & Schedule Receipt
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
