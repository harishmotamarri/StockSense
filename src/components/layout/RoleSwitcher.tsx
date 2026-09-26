import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { UserRole } from '../../types';

export function RoleSwitcher() {
  const { role, switchRole } = useAuth();
  const { info } = useToast();

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    info(
      'Role switched',
      `Switched context to ${newRole === 'INVENTORY_MANAGER' ? 'Inventory Manager' : 'Warehouse Staff'}`
    );
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
      <button
        onClick={() => handleRoleChange('INVENTORY_MANAGER')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
          role === 'INVENTORY_MANAGER'
            ? 'bg-white text-indigo-700 shadow-xs font-semibold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Full ERP control: catalog, operations, warehouse config"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Manager</span>
      </button>

      <button
        onClick={() => handleRoleChange('WAREHOUSE_STAFF')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
          role === 'WAREHOUSE_STAFF'
            ? 'bg-white text-slate-900 shadow-xs font-semibold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Field operations: picking, packing, shelving, counting"
      >
        <UserCheck className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Staff</span>
      </button>
    </div>
  );
}
