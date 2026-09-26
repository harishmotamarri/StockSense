import React, { useState, useEffect } from 'react';
import { getMovements, getWarehouses } from '../../lib/api';
import { StockMovement, Warehouse, MovementType } from '../../types';
import { MovementTypeBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { TableSkeleton } from '../ui/TableSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { MovementDetailModal } from './MovementDetailModal';
import { useToast } from '../../context/ToastContext';
import {
  History,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowUpDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileSpreadsheet,
} from 'lucide-react';

export function MovementList() {
  const { success } = useToast();

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const [activeMovement, setActiveMovement] = useState<StockMovement | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [movList, whList] = await Promise.all([
        getMovements({ search, type: selectedType, warehouseId: selectedWarehouse }),
        getWarehouses(),
      ]);
      setMovements(movList);
      setWarehouses(whList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedType, selectedWarehouse]);

  // Client-side sort
  const sortedMovements = [...movements].sort((a, b) => {
    const diff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    return sortOrder === 'desc' ? diff : -diff;
  });

  const totalPages = Math.ceil(sortedMovements.length / pageSize) || 1;
  const paginatedMovements = sortedMovements.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = () => {
    if (movements.length === 0) return;
    const headers = [
      'Timestamp',
      'Reference',
      'Movement Type',
      'Product',
      'SKU',
      'Quantity',
      'Unit',
      'From Location',
      'To Location',
      'User',
      'Reason',
    ];
    const rows = movements.map((m) => [
      `"${m.timestamp}"`,
      `"${m.reference}"`,
      `"${m.referenceType}"`,
      `"${m.productName}"`,
      `"${m.sku}"`,
      m.quantity,
      `"${m.unit}"`,
      `"${m.fromLocation ? `${m.fromWarehouse || ''} (${m.fromLocation})` : ''}"`,
      `"${m.toLocation ? `${m.toWarehouse || ''} (${m.toLocation})` : ''}"`,
      `"${m.user}"`,
      `"${m.reason || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stocksense-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Export generated', `Exported ${movements.length} audit entries to CSV`);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            Stock Movement History & Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable system audit trail tracking all inventory receipts, dispatches, adjustments, and transfers.
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
            variant="outline"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search reference, product, SKU, user..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="w-full md:w-48">
          <Select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'All Movement Types' },
              { value: 'Receipt', label: 'Receipts (+)' },
              { value: 'Delivery', label: 'Deliveries (-)' },
              { value: 'Transfer In', label: 'Transfers In (+)' },
              { value: 'Transfer Out', label: 'Transfers Out (-)' },
              { value: 'Adjustment', label: 'Adjustments (±)' },
              { value: 'Opening Balance', label: 'Opening Balances' },
            ]}
          />
        </div>

        <div className="w-full md:w-48">
          <Select
            value={selectedWarehouse}
            onChange={(e) => {
              setSelectedWarehouse(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'All Facilities' },
              ...warehouses.map((w) => ({ value: w.name, label: w.name })),
            ]}
          />
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <span>Found {sortedMovements.length} transactions</span>
          <button
            onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-indigo-600 transition px-2 py-1 rounded bg-slate-100"
          >
            <ArrowUpDown className="w-3 h-3" />
            {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : paginatedMovements.length === 0 ? (
          <EmptyState
            title="No movement records found"
            description="No transactions match the selected filters. Try broadening your query or date range."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearch('');
              setSelectedType('all');
              setSelectedWarehouse('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Reference</th>
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold">SKU</th>
                  <th className="py-3 px-4 font-semibold">Movement Type</th>
                  <th className="py-3 px-4 font-semibold">From</th>
                  <th className="py-3 px-4 font-semibold">To</th>
                  <th className="py-3 px-4 font-semibold text-right">Quantity</th>
                  <th className="py-3 px-4 font-semibold text-right">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedMovements.map((m) => {
                  const isPositive = m.quantity > 0;
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setActiveMovement(m)}
                      className="hover:bg-slate-50/80 transition cursor-pointer group"
                    >
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(m.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 group-hover:text-indigo-600 transition">
                        {m.reference}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{m.productName}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{m.sku}</td>
                      <td className="py-3 px-4">
                        <MovementTypeBadge type={m.referenceType} />
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {m.fromLocation ? `${m.fromWarehouse || ''} (${m.fromLocation})` : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {m.toLocation ? `${m.toWarehouse || ''} (${m.toLocation})` : '—'}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? `+${m.quantity}` : m.quantity} {m.unit}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 text-[11px] truncate max-w-[120px]">
                        {m.user}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {sortedMovements.length > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, sortedMovements.length)} of {sortedMovements.length}{' '}
              records
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

      {/* Movement Detail Modal */}
      {activeMovement && (
        <MovementDetailModal
          movement={activeMovement}
          isOpen={!!activeMovement}
          onClose={() => setActiveMovement(null)}
        />
      )}
    </div>
  );
}
