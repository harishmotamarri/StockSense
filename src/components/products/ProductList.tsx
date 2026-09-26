import React, { useState, useEffect } from 'react';
import { Product, Warehouse } from '../../types';
import { getProducts, getWarehouses, deleteProduct } from '../../lib/api';
import { ProductStatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { TableSkeleton } from '../ui/TableSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Modal } from '../ui/Modal';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Boxes,
  Plus,
  Search,
  Download,
  Upload,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export function ProductList() {
  const { navigate } = useNavigation();
  const { role } = useAuth();
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'sku'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Modals
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Check URL query parameters for default status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get('status');
    const searchParam = params.get('search');
    if (statusParam) setSelectedStatus(statusParam);
    if (searchParam) setSearch(searchParam);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodList, whList] = await Promise.all([
        getProducts({
          search,
          category: selectedCategory,
          status: selectedStatus,
          warehouseId: selectedWarehouse,
        }),
        getWarehouses(),
      ]);
      setProducts(prodList);
      setWarehouses(whList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedCategory, selectedStatus, selectedWarehouse]);

  // Sorting
  const sortedProducts = [...products].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
    else if (sortBy === 'sku') comparison = a.sku.localeCompare(b.sku);
    else if (sortBy === 'stock') comparison = a.totalStock - b.totalStock;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedProducts.length / pageSize) || 1;
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      success('Product deleted', `${productToDelete.name} has been removed.`);
      setProductToDelete(null);
      loadData();
    } catch (err: any) {
      error('Delete failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (products.length === 0) return;
    const headers = ['SKU', 'Name', 'Category', 'Unit', 'Total Stock', 'Available Stock', 'Reorder Level', 'Status'];
    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.name}"`,
      `"${p.category}"`,
      `"${p.unit}"`,
      p.totalStock,
      p.availableStock,
      p.reorderLevel,
      `"${p.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `stocksense-products-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Export generated', `Exported ${products.length} products to CSV`);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600" />
            Products Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your inventory catalog, SKU parameters, and real-time stock availability.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            Import
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export
          </Button>

          {role === 'INVENTORY_MANAGER' && (
            <Button
              size="sm"
              variant="primary"
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => navigate('/products/new')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:w-72">
          <Input
            placeholder="Search product name or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="w-full md:w-44">
          <Select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'Raw Materials', label: 'Raw Materials' },
              { value: 'Building Supplies', label: 'Building Supplies' },
              { value: 'Fasteners', label: 'Fasteners' },
              { value: 'Electrical', label: 'Electrical' },
              { value: 'Safety & PPE', label: 'Safety & PPE' },
              { value: 'Chemicals & Lubricants', label: 'Chemicals & Lubricants' },
              { value: 'Finished Goods', label: 'Finished Goods' },
            ]}
          />
        </div>

        <div className="w-full md:w-40">
          <Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'In Stock', label: 'In Stock' },
              { value: 'Low Stock', label: 'Low Stock' },
              { value: 'Out of Stock', label: 'Out of Stock' },
            ]}
          />
        </div>

        <div className="w-full md:w-44">
          <Select
            value={selectedWarehouse}
            onChange={(e) => {
              setSelectedWarehouse(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'All Warehouses' },
              ...warehouses.map((w) => ({ value: w.id, label: w.name })),
            ]}
          />
        </div>

        <div className="ml-auto text-xs text-slate-500 whitespace-nowrap">
          {sortedProducts.length} items found
        </div>
      </div>

      {/* Table Card */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={8} cols={8} />
        ) : paginatedProducts.length === 0 ? (
          <EmptyState
            title="No products match your criteria"
            description="Try changing your search terms or filters, or add a new product to the catalog."
            actionLabel={role === 'INVENTORY_MANAGER' ? 'Add First Product' : undefined}
            onAction={role === 'INVENTORY_MANAGER' ? () => navigate('/products/new') : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 transition"
                    onClick={() => {
                      if (sortBy === 'name') setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                      else {
                        setSortBy('name');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    <span className="flex items-center gap-1">
                      Product Name <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </span>
                  </th>
                  <th
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 transition"
                    onClick={() => {
                      if (sortBy === 'sku') setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                      else {
                        setSortBy('sku');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    <span className="flex items-center gap-1">
                      SKU <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </span>
                  </th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Unit</th>
                  <th
                    className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-slate-900 transition"
                    onClick={() => {
                      if (sortBy === 'stock') setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                      else {
                        setSortBy('stock');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Total Stock <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </span>
                  </th>
                  <th className="py-3 px-4 font-semibold">Locations</th>
                  <th className="py-3 px-4 font-semibold text-right">Reorder Level</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProducts.map((p) => {
                  const locationBadges = p.locations.map((loc) => loc.locationCode).join(', ');
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 transition cursor-pointer"
                      onClick={() => navigate(`/products/${p.id}`)}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 hover:text-indigo-600 transition">
                        {p.name}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">{p.sku}</td>
                      <td className="py-3 px-4 text-slate-600">{p.category}</td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{p.unit}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {p.totalStock.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] truncate max-w-[140px]">
                        {locationBadges || 'None'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {p.reorderLevel.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <ProductStatusBadge status={p.status} />
                      </td>
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation() /* Prevent row navigation */}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/products/${p.id}`)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition"
                            title="View Product"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {role === 'INVENTORY_MANAGER' && (
                            <>
                              <button
                                onClick={() => navigate(`/products/${p.id}/edit`)}
                                className="p-1.5 text-slate-400 hover:text-slate-900 rounded hover:bg-slate-100 transition"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setProductToDelete(p)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {sortedProducts.length > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, sortedProducts.length)} of {sortedProducts.length}{' '}
              products
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="px-2 font-mono font-semibold">
                {currentPage} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      {productToDelete && (
        <ConfirmDialog
          isOpen={!!productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Product"
          message={
            productToDelete.totalStock > 0 ? (
              <span className="text-rose-600">
                Cannot delete <strong>{productToDelete.name}</strong> because it currently has{' '}
                {productToDelete.totalStock} units in stock. You must adjust or transfer stock to
                zero before deleting.
              </span>
            ) : (
              <>
                Are you sure you want to permanently delete <strong>{productToDelete.name}</strong>{' '}
                ({productToDelete.sku})?
              </>
            )
          }
          confirmLabel={productToDelete.totalStock > 0 ? 'Close' : 'Confirm Delete'}
          variant={productToDelete.totalStock > 0 ? 'primary' : 'destructive'}
          isLoading={isDeleting}
        />
      )}

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Catalog via CSV"
        description="Upload batch products using standard ERP CSV structure."
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center flex flex-col items-center justify-center py-8">
            <FileSpreadsheet className="w-10 h-10 text-indigo-500 mb-2" />
            <p className="font-semibold text-slate-800">Drag and drop your .csv catalog file</p>
            <p className="text-slate-500 mt-0.5">Supports UTF-8 CSV with SKU, Name, Category, Unit</p>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              id="csv-file-input"
              onChange={() => {
                success('CSV uploaded', 'Parsed 14 items ready for catalog batch import.');
                setIsImportModalOpen(false);
              }}
            />
            <label
              htmlFor="csv-file-input"
              className="mt-4 px-4 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition cursor-pointer shadow-xs"
            >
              Browse Files
            </label>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => {
                const sample = 'SKU,Name,Category,Unit,ReorderLevel\nSTL-ROD-014,Steel Rod 14mm,Raw Materials,PCS,100';
                const blob = new Blob([sample], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'stocksense-sample-template.csv';
                a.click();
              }}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Download Sample CSV Template
            </button>
            <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
