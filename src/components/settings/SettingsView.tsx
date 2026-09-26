import React, { useState } from 'react';
import { storage, AppSettings } from '../../lib/storage';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import {
  Settings as SettingsIcon,
  Warehouse,
  Boxes,
  Bell,
  Check,
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

export function SettingsView() {
  const { success, error } = useToast();

  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());
  const [activeTab, setActiveTab] = useState<'inventory' | 'warehouse' | 'notifications'>('inventory');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      storage.setSettings(settings);
      setIsSaving(false);
      success('Settings Saved', 'Inventory parameters and alert policies updated.');
    }, 250);
  };

  const handleResetData = () => {
    storage.resetAllData();
    setShowResetConfirm(false);
    success('Demo Data Reset', 'Initial catalog, warehouse, and ledger records restored.');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-indigo-600" />
            System & Inventory Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure system units, reorder automation thresholds, negative stock safeguards, and notifications.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="text-rose-600 hover:bg-rose-50"
          onClick={() => setShowResetConfirm(true)}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset Demo Data
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'inventory'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Inventory Policies
        </button>

        <button
          onClick={() => setActiveTab('warehouse')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'warehouse'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Warehouse className="w-4 h-4" />
          Facility Rules
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'notifications'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          Alerts & Notifications
        </button>
      </div>

      {/* Tab 1: Inventory Settings */}
      {activeTab === 'inventory' && (
        <Card>
          <CardHeader
            title="Stock Policies & Reorder Safeguards"
            description="Global parameters governing unit conventions and stock availability"
          />
          <CardContent className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Default Unit of Measure for New Items"
                value={settings.defaultUnit}
                onChange={(e) => setSettings({ ...settings, defaultUnit: e.target.value })}
                options={[
                  { value: 'PCS', label: 'PCS (Pieces)' },
                  { value: 'KG', label: 'KG (Kilograms)' },
                  { value: 'BOX', label: 'BOX (Boxes)' },
                  { value: 'SET', label: 'SET (Sets)' },
                ]}
              />

              <Input
                label="Default Safety Buffer / Reorder Threshold"
                type="number"
                min="1"
                value={settings.defaultLowStockThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, defaultLowStockThreshold: Number(e.target.value) })
                }
                helperText="Prepopulated on newly registered products"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowNegativeStock}
                  onChange={(e) =>
                    setSettings({ ...settings, allowNegativeStock: e.target.checked })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Allow Negative Inventory Stock
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Permit deliveries to validate even if physical book quantity would drop below zero.
                    (Strictly discouraged in standard ERP accounting practices).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSKU}
                  onChange={(e) => setSettings({ ...settings, autoSKU: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Enforce Uppercase SKU Standard
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Automatically normalize all item codes to uppercase alphanumeric strings during entry.
                  </span>
                </div>
              </label>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Save Inventory Settings
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Tab 2: Warehouse Settings */}
      {activeTab === 'warehouse' && (
        <Card>
          <CardHeader
            title="Warehouse Facility Configuration"
            description="Inter-bay transfer approvals and staging zone policies"
          />
          <CardContent className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">
                Multi-Facility Synchronization
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                StockSense supports multi-tier facility routing across primary distribution centers,
                assembly plants, and regional overflow depots.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Require Manager Sign-Off for Inter-Warehouse Transfers
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Transfers between different facilities remain in 'Waiting' until an Inventory Manager authorizes transit.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Auto-Assign Staging Area on Supplier Receipts
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Automatically route goods to the receiving bay (REC-01) before secondary shelving.
                  </span>
                </div>
              </label>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Save Warehouse Rules
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Tab 3: Notification Settings */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader
            title="Automated Alerts & Email Notifications"
            description="Manage warnings dispatched to warehouse staff and managers"
          />
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyLowStock}
                  onChange={(e) =>
                    setSettings({ ...settings, notifyLowStock: e.target.checked })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Low Stock Threshold Warnings
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Display priority banner in the top header and dashboard when any product dips below reorder level.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyPendingOverdue}
                  onChange={(e) =>
                    setSettings({ ...settings, notifyPendingOverdue: e.target.checked })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Outbound Delivery Schedule Overdue Alerts
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Flag customer delivery orders that remain in 'Waiting' or 'Picking' past their delivery date.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={(e) =>
                    setSettings({ ...settings, emailAlerts: e.target.checked })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Daily Inventory Digest Dispatch
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Send morning summary email of inbound supplier receipts and outgoing dispatches.
                  </span>
                </div>
              </label>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Save Notification Settings
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Reset Confirmation */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetData}
        title="Reset Entire Inventory Demo"
        message="Are you sure you want to reset all products, receipts, deliveries, movements, and adjustments back to original initial factory state?"
        confirmLabel="Reset Everything"
        variant="destructive"
      />
    </div>
  );
}
