import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { createLocation } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Warehouse } from '../../types';
import { Check } from 'lucide-react';

interface LocationModalProps {
  warehouse: Warehouse;
  isOpen: boolean;
  onClose: () => void;
  onLocationCreated: () => void;
}

export function LocationModal({
  warehouse,
  isOpen,
  onClose,
  onLocationCreated,
}: LocationModalProps) {
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [zone, setZone] = useState('Zone 1 - High Density Pallet');
  const [capacity, setCapacity] = useState<number>(2000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      error('Location name and code are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await createLocation({
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        name,
        code: code.toUpperCase(),
        zone,
        capacity: Number(capacity) || 1000,
      });

      success('Location Bay Added', `Bay ${code.toUpperCase()} registered in ${warehouse.name}.`);
      onLocationCreated();
      onClose();
    } catch (err: any) {
      error('Failed to create location', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Location Bay to ${warehouse.name}`}
      description="Configure a new rack, shelf, or staging area inside this facility."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Location Bay Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rack C - Level 1"
            required
          />

          <Input
            label="Location Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. RACK-C1"
            helperText="Uppercase alphanumeric"
            required
          />
        </div>

        <Input
          label="Zone / Area Description"
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          placeholder="e.g. Zone 2 - Finished Goods Buffer"
          required
        />

        <Input
          label="Maximum Storage Capacity (Units)"
          type="number"
          min="1"
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          required
        />

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
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
            Create Bay
          </Button>
        </div>
      </form>
    </Modal>
  );
}
