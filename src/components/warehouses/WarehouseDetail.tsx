import React, { useState, useEffect } from 'react';
import { Warehouse, WarehouseLocation } from '../../types';
import { getWarehouseById, getLocations } from '../../lib/api';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { LocationModal } from './LocationModal';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Warehouse as WarehouseIcon,
  MapPin,
  User,
  Plus,
  Boxes,
  Layers,
  Percent,
} from 'lucide-react';

interface WarehouseDetailProps {
  warehouseId: string;
}

export function WarehouseDetail({ warehouseId }: WarehouseDetailProps) {
  const { navigate } = useNavigation();
  const { role } = useAuth();

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [wh, locList] = await Promise.all([
        getWarehouseById(warehouseId),
        getLocations(warehouseId),
      ]);
      setWarehouse(wh);
      setLocations(locList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [warehouseId]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-32 bg-slate-200 rounded-xl"></div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Warehouse Not Found</h2>
        <Button size="sm" variant="outline" className="mt-4" onClick={() => navigate('/warehouses')}>
          Back to Warehouses
        </Button>
      </div>
    );
  }

  const totalCapacity = locations.reduce((sum, l) => sum + l.capacity, 0);
  const totalOccupied = locations.reduce((sum, l) => sum + l.currentQuantity, 0);
  const overallUtil = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/warehouses')}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{warehouse.name}</h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                  warehouse.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {warehouse.status}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-500 mt-0.5">Code: {warehouse.code}</p>
          </div>
        </div>

        {role === 'INVENTORY_MANAGER' && (
          <Button
            size="sm"
            variant="primary"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setIsAddLocationOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Location Bay
          </Button>
        )}
      </div>

      {/* Facility Meta Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Physical Address
          </span>
          <p className="mt-1 font-semibold text-slate-900 text-xs leading-relaxed">
            {warehouse.address}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" /> Facility Manager
          </span>
          <p className="mt-1 font-semibold text-slate-900 text-sm">{warehouse.manager}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" /> Total Storage Bays
          </span>
          <p className="mt-1 font-mono font-bold text-slate-900 text-lg">
            {locations.length} Bays
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-slate-400" /> Facility Capacity
          </span>
          <p className="mt-1 font-mono font-bold text-indigo-700 text-lg">
            {totalCapacity.toLocaleString()} Units
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Approx. {overallUtil}% utilized</p>
        </Card>
      </div>

      {/* Locations Table */}
      <Card>
        <CardHeader
          title="Warehouse Storage Locations & Rack Bays"
          description="Internal zoning, bay addresses, and capacity limits"
          action={
            role === 'INVENTORY_MANAGER' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddLocationOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5 text-indigo-600" />}
              >
                Add Bay
              </Button>
            ) : undefined
          }
        />
        <CardContent className="p-0">
          {locations.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No location bays have been set up for this warehouse yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Location Name</th>
                    <th className="py-3 px-4 font-semibold">Bay Code</th>
                    <th className="py-3 px-4 font-semibold">Zone / Area</th>
                    <th className="py-3 px-4 font-semibold text-right">Max Capacity</th>
                    <th className="py-3 px-4 font-semibold text-right">Current Stock</th>
                    <th className="py-3 px-4 font-semibold text-right">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {locations.map((loc) => {
                    const util =
                      loc.capacity > 0 ? Math.round((loc.currentQuantity / loc.capacity) * 100) : 0;
                    return (
                      <tr key={loc.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 font-semibold text-slate-900">{loc.name}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {loc.code}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{loc.zone}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700">
                          {loc.capacity.toLocaleString()} units
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {loc.currentQuantity.toLocaleString()} units
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <span
                            className={`font-semibold ${
                              util >= 90
                                ? 'text-rose-600'
                                : util >= 70
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {util}%
                          </span>
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

      {/* Add Location Modal */}
      {isAddLocationOpen && (
        <LocationModal
          warehouse={warehouse}
          isOpen={isAddLocationOpen}
          onClose={() => setIsAddLocationOpen(false)}
          onLocationCreated={loadData}
        />
      )}
    </div>
  );
}
