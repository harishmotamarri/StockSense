import React, { useState, useEffect } from 'react';
import { Adjustment } from '../../types';
import { getAdjustments } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { TableSkeleton } from '../ui/TableSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { useNavigation } from '../../context/NavigationContext';
import {
  SlidersHorizontal,
  Plus,
  Search,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export function AdjustmentList() {
  const { navigate } = useNavigation();

  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [reason, setReason] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await getAdjustments({ search, status, reason });
      setAdjustments(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, status, reason]);

  const totalPages = Math.ceil(adjustments.length / pageSize) || 1;
  const paginated = adjustments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
            Inventory Stock Adjustments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cycle count reconciliation, damage write-offs, and stock audit discrepancies.
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
            onClick={() => navigate('/adjustments/new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Adjustment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search adjustment #, SKU, or bay..."
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
              { value: 'Applied', label: 'Applied' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Canceled', label: 'Canceled' },
            ]}
          />
        </div>

        <div className="w-full md:w-48">
          <Select
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'All Reason Codes' },
              { value: 'Damaged', label: 'Damaged' },
              { value: 'Lost', label: 'Lost' },
              { value: 'Found', label: 'Found' },
              { value: 'Counting Error', label: 'Counting Error' },
              { value: 'Expired', label: 'Expired' },
            ]}
          />
        </div>

        <div className="ml-auto text-xs text-slate-500 whitespace-nowrap">
          {adjustments.length} records found
        </div>
      </div>

      {/* Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} cols={8} />
        ) : paginated.length === 0 ? (
          <EmptyState
            title="No adjustments found"
            description="No inventory count adjustments match your filters."
            actionLabel="Create Count Adjustment"
            onAction={() => navigate('/adjustments/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Adjustment #</th>
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold">Location Bay</th>
                  <th className="py-3 px-4 font-semibold text-right">System Qty</th>
                  <th className="py-3 px-4 font-semibold text-right">Physical Count</th>
                  <th className="py-3 px-4 font-semibold text-right">Variance</th>
                  <th className="py-3 px-4 font-semibold">Reason</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((a) => {
                  const isPositive = a.difference > 0;
                  const isZero = a.difference === 0;

                  return (
                    <tr
                      key={a.id}
                      onClick={() => navigate(`/adjustments/${a.id}`)}
                      className="hover:bg-slate-50/70 transition cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 group-hover:text-indigo-600 transition">
                        {a.adjustmentNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        <div>{a.productName}</div>
                        <span className="font-mono text-[10px] text-slate-500">{a.sku}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {a.warehouseName} ({a.locationCode})
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {a.systemQuantity} {a.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {a.physicalCount} {a.unit}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold ${
                          isZero
                            ? 'text-slate-600'
                            : isPositive
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? `+${a.difference}` : a.difference} {a.unit}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {a.reason}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {a.status === 'Applied' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Applied
                          </span>
                        ) : a.status === 'Draft' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Draft
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Canceled
                          </span>
                        )}
                      </td>
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-indigo-600"
                          onClick={() => navigate(`/adjustments/${a.id}`)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {adjustments.length > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, adjustments.length)} of {adjustments.length} records
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
