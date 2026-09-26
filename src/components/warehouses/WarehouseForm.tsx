import React, { useState } from 'react';
import { createWarehouse } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Warehouse as WarehouseIcon, Check } from 'lucide-react';

export function WarehouseForm() {
  const { navigate } = useNavigation();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [manager, setManager] = useState('Sarah Jenkins');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !address.trim()) {
      error('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const wh = await createWarehouse({
        name,
        code: code.toUpperCase(),
        address,
        manager,
        status,
      });

      success('Warehouse Created', `${wh.name} has been added.`);
      navigate(`/warehouses/${wh.id}`);
    } catch (err: any) {
      error('Failed to create warehouse', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/warehouses')}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <WarehouseIcon className="w-5 h-5 text-indigo-600" />
            Add Warehouse Facility
          </h1>
          <p className="text-xs text-slate-500">
            Register a new physical warehouse site and designate manager oversight.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader
            title="Facility Specifications"
            description="Identifiers and physical address used on freight and transfer manifests"
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Warehouse Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. South Logistics Depot"
                required
              />

              <Input
                label="Facility Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. WH-SOUTH"
                helperText="Unique uppercase identifier code"
                required
              />
            </div>

            <Input
              label="Physical Address / GPS Location"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 500 Industrial Ring Rd, Sector 4, Houston, TX 77001"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Warehouse Manager"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                required
              />

              <Select
                label="Operational Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                options={[
                  { value: 'Active', label: 'Active (Operational)' },
                  { value: 'Inactive', label: 'Inactive (Maintenance)' },
                ]}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/warehouses')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
              isLoading={isSubmitting}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Save Warehouse
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
