import React, { useState, useEffect } from 'react';
import { Receipt, Warehouse } from '../../types';
import { getReceipts, getWarehouses } from '../../lib/api';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { TableSkeleton } from '../ui/TableSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { useNavigation } from '../../context/NavigationContext';
import {
  ArrowDownToLine,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
} from 'lucide-react';

export function ReceiptList() {
  const { navigate } = useNavigation();

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [warehouseId, setWarehouseId] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recList, whList] = await Promise.all([
        getReceipts({ search, status, warehouseId }),
        getWarehouses(),
      ]);
      setReceipts(recList);
      setWarehouses(whList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, status, warehouseId]);

  const totalPages = Math.ceil(receipts.length / pageSize) || 1;
  const paginatedReceipts = receipts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-sky-600" />
            Inbound Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track incoming inventory from suppliers, check-in staging, and validate stock intake.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            variant="primary"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => navigate('/receipts/new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Receipt
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search receipt #, supplier, or product..."
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
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Waiting', label: 'Waiting (En Route)' },
              { value: 'Ready', label: 'Ready at Dock' },
              { value: 'Done', label: 'Done (Validated)' },
              { value: 'Canceled', label: 'Canceled' },
            ]}
          />
        </div>

        <div className="w-full md:w-48">
          <Select
            value={warehouseId}
            onChange={(e) => {
              setWarehouseId(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'All Warehouses' },
              ...warehouses.map((w) => ({ value: w.id, label: w.name })),
            ]}
          />
        </div>

        <div className="ml-auto text-xs text-slate-500 whitespace-nowrap">
          {receipts.length} receipts found
        </div>
      </div>

      {/* Receipts Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} cols={8} />
        ) : paginatedReceipts.length === 0 ? (
          <EmptyState
            title="No receipts found"
            description="No inbound shipment receipts match the active filters."
            actionLabel="Create First Receipt"
            onAction={() => navigate('/receipts/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Receipt Number</th>
                  <th className="py-3 px-4 font-semibold">Supplier</th>
                  <th className="py-3 px-4 font-semibold">Destination Facility</th>
                  <th className="py-3 px-4 font-semibold">Staging Bay</th>
                  <th className="py-3 px-4 font-semibold text-center">Items</th>
                  <th className="py-3 px-4 font-semibold">Expected Date</th>
                  <th className="py-3 px-4 font-semibold">Created By</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedReceipts.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/receipts/${r.id}`)}
                    className="hover:bg-slate-50/70 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 group-hover:text-indigo-600 transition">
                      {r.receiptNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{r.supplier}</td>
                    <td className="py-3 px-4 text-slate-600">{r.warehouseName}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{r.destinationLocationCode}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                      {r.items.length}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {r.expectedDate}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px] truncate max-w-[120px]">
                      {r.createdBy}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-indigo-600"
                        onClick={() => navigate(`/receipts/${r.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {receipts.length > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, receipts.length)} of {receipts.length} receipts
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
    </div>
  );
}
