import React, { useState, useEffect } from 'react';
import { Warehouse } from '../../types';
import { getWarehouses } from '../../lib/api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { TableSkeleton } from '../ui/TableSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import {
  Warehouse as WarehouseIcon,
  Plus,
  RefreshCw,
  MapPin,
  Layers,
  Boxes,
  Eye,
} from 'lucide-react';

export function WarehouseList() {
  const { navigate } = useNavigation();
  const { role } = useAuth();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await getWarehouses();
      setWarehouses(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <WarehouseIcon className="w-5 h-5 text-indigo-600" />
            Warehouses & Facilities
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical distribution centers, staging depots, and internal bay layouts.
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

          {role === 'INVENTORY_MANAGER' && (
            <Button
              size="sm"
              variant="primary"
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => navigate('/warehouses/new')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Warehouse
            </Button>
          )}
        </div>
      </div>

      {/* Facilities Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((wh) => (
            <Card
              key={wh.id}
              onClick={() => navigate(`/warehouses/${wh.id}`)}
              className="p-5 hover:border-indigo-400 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {wh.name}
                    </h3>
                    <span className="font-mono text-xs text-slate-500">{wh.code}</span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                      wh.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {wh.status}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed line-clamp-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  {wh.address}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Storage Bays
                  </span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {wh.locationsCount} Bays
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Manager
                  </span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {wh.manager}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Facilities Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={4} cols={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Warehouse Name</th>
                  <th className="py-3 px-4 font-semibold">Facility Code</th>
                  <th className="py-3 px-4 font-semibold">Physical Address</th>
                  <th className="py-3 px-4 font-semibold text-center">Bays / Locations</th>
                  <th className="py-3 px-4 font-semibold">Manager</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {warehouses.map((wh) => (
                  <tr
                    key={wh.id}
                    onClick={() => navigate(`/warehouses/${wh.id}`)}
                    className="hover:bg-slate-50/70 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                      {wh.name}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">{wh.code}</td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[280px]">{wh.address}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {wh.locationsCount}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{wh.manager}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          wh.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {wh.status}
                      </span>
                    </td>
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-indigo-600"
                        onClick={() => navigate(`/warehouses/${wh.id}`)}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
