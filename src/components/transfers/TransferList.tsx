import React, { useState, useEffect } from 'react';
import { Transfer } from '../../types';
import { getTransfers } from '../../lib/api';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { TableSkeleton } from '../ui/TableSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { useNavigation } from '../../context/NavigationContext';
import { ArrowLeftRight, Plus, Search, RefreshCw, ArrowRight } from 'lucide-react';

export function TransferList() {
  const { navigate } = useNavigation();

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await getTransfers({ search, status });
      setTransfers(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, status]);

  const totalPages = Math.ceil(transfers.length / pageSize) || 1;
  const paginatedTransfers = transfers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-teal-600" />
            Internal Stock Transfers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inter-facility relocation and bay-to-bay replenishment between warehouse staging racks.
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
            onClick={() => navigate('/transfers/new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Transfer
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search transfer # or route..."
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
              { value: 'Waiting', label: 'Waiting (In-Transit)' },
              { value: 'Ready', label: 'Ready at Bay' },
              { value: 'Done', label: 'Done (Completed)' },
              { value: 'Canceled', label: 'Canceled' },
            ]}
          />
        </div>

        <div className="ml-auto text-xs text-slate-500 whitespace-nowrap">
          {transfers.length} transfers found
        </div>
      </div>

      {/* Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : paginatedTransfers.length === 0 ? (
          <EmptyState
            title="No internal transfers found"
            description="No relocation orders match the query criteria."
            actionLabel="Create Transfer Order"
            onAction={() => navigate('/transfers/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Transfer #</th>
                  <th className="py-3 px-4 font-semibold">Origin (Source)</th>
                  <th className="py-3 px-4 font-semibold">Target (Destination)</th>
                  <th className="py-3 px-4 font-semibold text-center">Items</th>
                  <th className="py-3 px-4 font-semibold">Date Created</th>
                  <th className="py-3 px-4 font-semibold">Created By</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTransfers.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => navigate(`/transfers/${t.id}`)}
                    className="hover:bg-slate-50/70 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 group-hover:text-indigo-600 transition">
                      {t.transferNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      <div className="font-medium">{t.sourceWarehouseName}</div>
                      <span className="font-mono text-[10px] text-slate-500">{t.sourceLocationCode}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      <div className="font-medium">{t.destWarehouseName}</div>
                      <span className="font-mono text-[10px] text-slate-500">{t.destLocationCode}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                      {t.items.length}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px] truncate max-w-[120px]">
                      {t.createdBy}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-teal-600 hover:text-teal-900"
                        onClick={() => navigate(`/transfers/${t.id}`)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {transfers.length > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, transfers.length)} of {transfers.length} records
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
