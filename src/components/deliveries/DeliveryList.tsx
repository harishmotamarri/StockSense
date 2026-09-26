import React, { useState, useEffect } from 'react';
import { Delivery, Warehouse } from '../../types';
import { getDeliveries, getWarehouses } from '../../lib/api';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { TableSkeleton } from '../ui/TableSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { useNavigation } from '../../context/NavigationContext';
import { ArrowUpFromLine, Plus, Search, RefreshCw } from 'lucide-react';

export function DeliveryList() {
  const { navigate } = useNavigation();

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
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
      const [delList, whList] = await Promise.all([
        getDeliveries({ search, status, warehouseId }),
        getWarehouses(),
      ]);
      setDeliveries(delList);
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

  const totalPages = Math.ceil(deliveries.length / pageSize) || 1;
  const paginatedDeliveries = deliveries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ArrowUpFromLine className="w-5 h-5 text-purple-600" />
            Outbound Delivery Orders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer dispatch orders, pick/pack fulfillment workflows, and freight validation.
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
            onClick={() => navigate('/deliveries/new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Delivery
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search DO #, customer, or SKU..."
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
              { value: 'Waiting', label: 'Waiting (Pending)' },
              { value: 'Ready', label: 'Ready (In Picking)' },
              { value: 'Done', label: 'Done (Dispatched)' },
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
          {deliveries.length} orders found
        </div>
      </div>

      {/* Delivery Orders Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} cols={8} />
        ) : paginatedDeliveries.length === 0 ? (
          <EmptyState
            title="No delivery orders found"
            description="No customer delivery orders match the current search filters."
            actionLabel="Create First Delivery"
            onAction={() => navigate('/deliveries/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Delivery Order #</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Fulfillment Warehouse</th>
                  <th className="py-3 px-4 font-semibold">Source Bay</th>
                  <th className="py-3 px-4 font-semibold text-center">Items</th>
                  <th className="py-3 px-4 font-semibold">Delivery Date</th>
                  <th className="py-3 px-4 font-semibold">Stage</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedDeliveries.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => navigate(`/deliveries/${d.id}`)}
                    className="hover:bg-slate-50/70 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 group-hover:text-indigo-600 transition">
                      {d.deliveryNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{d.customer}</td>
                    <td className="py-3 px-4 text-slate-600">{d.warehouseName}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{d.sourceLocationCode}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                      {d.items.length}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {d.deliveryDate}
                    </td>
                    <td className="py-3 px-4 text-slate-600 capitalize text-[11px] font-medium">
                      {d.stage}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-indigo-600"
                        onClick={() => navigate(`/deliveries/${d.id}`)}
                      >
                        Process
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {deliveries.length > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, deliveries.length)} of {deliveries.length} orders
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
