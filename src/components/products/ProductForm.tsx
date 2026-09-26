import React, { useState, useEffect } from 'react';
import { Product, UnitOfMeasure, Warehouse, WarehouseLocation } from '../../types';
import { createProduct, updateProduct, getWarehouses, getLocations } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { Package, ArrowLeft, Check, AlertCircle } from 'lucide-react';

interface ProductFormProps {
  initialProduct?: Product | null;
  isEdit?: boolean;
}

export function ProductForm({ initialProduct, isEdit = false }: ProductFormProps) {
  const { navigate, goBack } = useNavigation();
  const { success, error } = useToast();

  const [name, setName] = useState(initialProduct?.name || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [category, setCategory] = useState(initialProduct?.category || 'Raw Materials');
  const [unit, setUnit] = useState<UnitOfMeasure>(initialProduct?.unit || 'PCS');
  const [reorderLevel, setReorderLevel] = useState<number>(initialProduct?.reorderLevel ?? 50);
  const [description, setDescription] = useState(initialProduct?.description || '');

  // Initial stock fields for creation
  const [initialStock, setInitialStock] = useState<number>(0);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadLocations() {
      try {
        const [whList, locList] = await Promise.all([getWarehouses(), getLocations()]);
        setWarehouses(whList);
        setLocations(locList);
        if (whList.length > 0 && !selectedWarehouseId) {
          setSelectedWarehouseId(whList[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadLocations();
  }, []);

  const filteredLocations = locations.filter(
    (loc) => !selectedWarehouseId || loc.warehouseId === selectedWarehouseId
  );

  useEffect(() => {
    if (filteredLocations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(filteredLocations[0].id);
    }
  }, [selectedWarehouseId, filteredLocations]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Product name is required';
    if (!sku.trim()) errs.sku = 'SKU / item code is required';
    if (!category.trim()) errs.category = 'Category is required';
    if (reorderLevel < 0) errs.reorderLevel = 'Reorder level cannot be negative';
    if (initialStock < 0) errs.initialStock = 'Initial stock cannot be negative';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEdit && initialProduct) {
        const updated = await updateProduct(initialProduct.id, {
          name,
          sku: sku.toUpperCase(),
          category,
          unit,
          reorderLevel,
          description,
        });
        success('Product updated', `${updated.name} has been updated.`);
        navigate(`/products/${updated.id}`);
      } else {
        const created = await createProduct({
          name,
          sku: sku.toUpperCase(),
          category,
          unit,
          reorderLevel,
          description,
          initialStock: Number(initialStock),
          initialWarehouseId: selectedWarehouseId,
          initialLocationId: selectedLocationId,
        });
        success('Product created', `${created.name} added to catalog.`);
        navigate(`/products/${created.id}`);
      }
    } catch (err: any) {
      error('Failed to save product', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: 'Raw Materials', label: 'Raw Materials' },
    { value: 'Building Supplies', label: 'Building Supplies' },
    { value: 'Fasteners', label: 'Fasteners' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Safety & PPE', label: 'Safety & PPE' },
    { value: 'Chemicals & Lubricants', label: 'Chemicals & Lubricants' },
    { value: 'Finished Goods', label: 'Finished Goods' },
    { value: 'Packaging', label: 'Packaging' },
  ];

  const unitOptions: { value: UnitOfMeasure; label: string }[] = [
    { value: 'PCS', label: 'PCS (Pieces)' },
    { value: 'KG', label: 'KG (Kilograms)' },
    { value: 'G', label: 'G (Grams)' },
    { value: 'L', label: 'L (Liters)' },
    { value: 'ML', label: 'ML (Milliliters)' },
    { value: 'BOX', label: 'BOX (Boxes)' },
    { value: 'M', label: 'M (Meters)' },
    { value: 'SET', label: 'SET (Sets)' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb / Back */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (isEdit && initialProduct ? navigate(`/products/${initialProduct.id}`) : navigate('/products'))}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isEdit ? `Edit Product: ${initialProduct?.name}` : 'New Product Registration'}
          </h1>
          <p className="text-xs text-slate-500">
            {isEdit
              ? 'Update catalog specifications and reorder threshold parameters.'
              : 'Add a new inventory SKU with specifications and initial warehouse balance.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader
            title="General Catalog Information"
            description="Core identifiers and classification used across all inventory operations"
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Steel Rod (12mm x 6m)"
                error={formErrors.name}
                required
              />

              <Input
                label="SKU / Item Code"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. STL-ROD-012"
                error={formErrors.sku}
                helperText="Unique uppercase identifier for barcode and scanning"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={categoryOptions}
                required
              />

              <Select
                label="Unit of Measure"
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitOfMeasure)}
                options={unitOptions}
                required
              />

              <Input
                label="Reorder Threshold"
                type="number"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(Number(e.target.value))}
                error={formErrors.reorderLevel}
                helperText="Triggers low-stock warnings"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description / Technical Specifications
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Grade, dimensions, material specifications or storage warnings..."
                className="w-full rounded-md border border-slate-300 p-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </CardContent>

          {/* Initial Stock Configuration (Only on creation) */}
          {!isEdit && (
            <>
              <CardHeader
                title="Initial Stock Opening Balance (Optional)"
                description="If stock already physically exists in a bay, log it as an opening balance."
                className="border-t border-slate-100"
              />
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Initial Stock Quantity"
                    type="number"
                    min="0"
                    value={initialStock}
                    onChange={(e) => setInitialStock(Number(e.target.value))}
                    error={formErrors.initialStock}
                    helperText={`Measured in ${unit}`}
                  />

                  {initialStock > 0 && (
                    <>
                      <Select
                        label="Initial Warehouse"
                        value={selectedWarehouseId}
                        onChange={(e) => setSelectedWarehouseId(e.target.value)}
                        options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                        required
                      />

                      <Select
                        label="Initial Location Bay"
                        value={selectedLocationId}
                        onChange={(e) => setSelectedLocationId(e.target.value)}
                        options={filteredLocations.map((l) => ({
                          value: l.id,
                          label: `${l.code} (${l.name})`,
                        }))}
                        required
                      />
                    </>
                  )}
                </div>

                {initialStock > 0 && (
                  <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-sky-600" />
                    <p>
                      An Opening Balance transaction will be registered in the stock ledger for{' '}
                      <strong>
                        {initialStock} {unit}
                      </strong>{' '}
                      assigned to the chosen bay.
                    </p>
                  </div>
                )}
              </CardContent>
            </>
          )}

          <CardFooter className="justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => (isEdit && initialProduct ? navigate(`/products/${initialProduct.id}`) : navigate('/products'))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<Check className="w-4 h-4" />}
            >
              {isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
