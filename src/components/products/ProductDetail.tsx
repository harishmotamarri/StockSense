import React, { useState, useEffect } from 'react';
import { Product, StockMovement } from '../../types';
import { getProductById, getMovements, deleteProduct } from '../../lib/api';
import { ProductStatusBadge, MovementTypeBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { MovementDetailModal } from '../movements/MovementDetailModal';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Boxes,
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  Calendar,
  Layers,
  History,
  Tag,
  PlusCircle,
  Truck,
} from 'lucide-react';

interface ProductDetailProps {
  productId: string;
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const { navigate } = useNavigation();
  const { role } = useAuth();
  const { success, error } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [prod, allMovements] = await Promise.all([
          getProductById(productId),
          getMovements(),
        ]);
        setProduct(prod);
        if (prod) {
          setMovements(allMovements.filter((m) => m.productId === prod.id));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [productId]);

  const handleDelete = async () => {
    if (!product) return;
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      success('Product deleted', `${product.name} removed from inventory.`);
      navigate('/products');
    } catch (err: any) {
      error('Delete failed', err.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested product ID does not exist.</p>
        <Button size="sm" variant="outline" className="mt-4" onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/products')}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{product.name}</h1>
              <ProductStatusBadge status={product.status} />
            </div>
            <p className="text-xs font-mono text-slate-500 mt-0.5">SKU: {product.sku}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/receipts/new')}
            leftIcon={<PlusCircle className="w-3.5 h-3.5 text-sky-600" />}
          >
            Receive Stock
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/deliveries/new')}
            leftIcon={<Truck className="w-3.5 h-3.5 text-indigo-600" />}
          >
            Create Delivery
          </Button>

          {role === 'INVENTORY_MANAGER' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/products/${product.id}/edit`)}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Edit
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                onClick={() => setShowDeleteConfirm(true)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500">Total Stock</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {product.totalStock.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{product.unit}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Physical units counted</p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500">Available Stock</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              {product.availableStock.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{product.unit}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Ready for immediate dispatch</p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500">Reserved Stock</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-600">
              {product.reservedStock.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{product.unit}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Allocated to pending deliveries</p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500">Reorder Threshold</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-700">
              {product.reorderLevel.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{product.unit}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Safety buffer point</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Locations & Movement History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock by Location */}
          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Stock Distribution by Location
                </span>
              }
              description="Physical warehouse rack locations holding this SKU"
            />
            <CardContent className="p-0">
              {product.locations.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No warehouse locations currently hold stock for this product.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Warehouse</th>
                        <th className="py-2.5 px-4 font-semibold">Location Bay</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Stock Quantity</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {product.locations.map((loc) => {
                        const share =
                          product.totalStock > 0
                            ? Math.round((loc.quantity / product.totalStock) * 100)
                            : 0;
                        return (
                          <tr key={`${loc.warehouseId}-${loc.locationId}`} className="hover:bg-slate-50/60 transition">
                            <td className="py-2.5 px-4 font-medium text-slate-900">
                              {loc.warehouseName}
                            </td>
                            <td className="py-2.5 px-4 font-mono text-slate-700">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                                {loc.locationCode}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                              {loc.quantity.toLocaleString()} {product.unit}
                            </td>
                            <td className="py-2.5 px-4 text-right text-slate-500 font-mono text-[11px]">
                              {share}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Movement History for this product */}
          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-700" />
                  Product Movement Audit History
                </span>
              }
              description="Historical chronological transactions for this SKU"
            />
            <CardContent className="p-0">
              {movements.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No stock transactions recorded for this product yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Date & Time</th>
                        <th className="py-2.5 px-4 font-semibold">Type</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Qty</th>
                        <th className="py-2.5 px-4 font-semibold">From</th>
                        <th className="py-2.5 px-4 font-semibold">To</th>
                        <th className="py-2.5 px-4 font-semibold text-right">User</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {movements.map((m) => {
                        const isPositive = m.quantity > 0;
                        return (
                          <tr
                            key={m.id}
                            onClick={() => setSelectedMovement(m)}
                            className="hover:bg-slate-50/80 transition cursor-pointer"
                          >
                            <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                              {new Date(m.timestamp).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              {new Date(m.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-2.5 px-4">
                              <MovementTypeBadge type={m.referenceType} />
                            </td>
                            <td
                              className={`py-2.5 px-4 text-right font-mono font-bold whitespace-nowrap ${
                                isPositive ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {isPositive ? `+${m.quantity}` : m.quantity} {m.unit}
                            </td>
                            <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                              {m.fromLocation ? `${m.fromLocation}` : '—'}
                            </td>
                            <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                              {m.toLocation ? `${m.toLocation}` : '—'}
                            </td>
                            <td className="py-2.5 px-4 text-right text-slate-600 text-[11px] truncate max-w-[100px]">
                              {m.user}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Specifications & Metadata */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Product Specifications"
              description="Metadata attributes & system dates"
            />
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Category</span>
                <span className="font-semibold text-slate-900">{product.category}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Item SKU</span>
                <span className="font-mono font-semibold text-slate-900">{product.sku}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Unit of Measure</span>
                <span className="font-medium text-slate-900">{product.unit}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Estimated Unit Cost</span>
                <span className="font-mono font-semibold text-slate-900">
                  ${product.unitCost?.toFixed(2) || '0.00'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Total Inventory Valuation</span>
                <span className="font-mono font-bold text-indigo-700">
                  ${((product.unitCost || 0) * product.totalStock).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Created At</span>
                <span className="font-mono text-slate-700">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last Updated</span>
                <span className="font-mono text-slate-700">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {product.description && (
            <Card>
              <CardHeader title="Description" />
              <CardContent>
                <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={
          <>
            Are you sure you want to delete <strong>{product.name}</strong> ({product.sku})? This
            action cannot be undone.
          </>
        }
        confirmLabel="Delete SKU"
        variant="destructive"
        isLoading={isDeleting}
      />

      {/* Movement Modal */}
      {selectedMovement && (
        <MovementDetailModal
          movement={selectedMovement}
          isOpen={!!selectedMovement}
          onClose={() => setSelectedMovement(null)}
        />
      )}
    </div>
  );
}
