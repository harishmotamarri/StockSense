import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { RoleBadge } from '../ui/Badge';
import { UserRole } from '../../types';
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  Calendar,
  Lock,
  Check,
  CheckCircle2,
  XCircle,
  Building2,
} from 'lucide-react';

export function ProfileView() {
  const { user, role, updateProfile, switchRole } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      error('Name and email cannot be empty');
      return;
    }

    setIsUpdating(true);
    setTimeout(() => {
      updateProfile({ name, email, avatarUrl });
      setIsUpdating(false);
      success('Profile Updated', 'User credentials and information updated.');
    }, 200);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      error('Passwords do not match or are empty');
      return;
    }
    success('Password Changed', 'Your security password has been updated.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const permissionsMatrix = [
    { feature: 'View Products Catalog & Stock Levels', manager: true, staff: true },
    { feature: 'Register New Products & Edit SKUs', manager: true, staff: false },
    { feature: 'Create & Validate Inbound Supplier Receipts', manager: true, staff: true },
    { feature: 'Pick & Pack Outbound Deliveries', manager: true, staff: true },
    { feature: 'Validate & Dispatch Customer Orders', manager: true, staff: false },
    { feature: 'Perform Physical Inventory Adjustments', manager: true, staff: true },
    { feature: 'Create New Warehouses & Storage Bays', manager: true, staff: false },
    { feature: 'Modify Global System & Reorder Policies', manager: true, staff: false },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-indigo-600" />
          User Profile & Security
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your organizational credentials, system authorization role, and security access.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Profile Details & Password */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Personal Information"
              description="Basic profile identification on system transactions and logs"
            />
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/20"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
                      {name.charAt(0) || 'U'}
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <Input
                      label="Avatar Image URL (Optional)"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                  <Input
                    label="Work Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Assigned Facility
                    </label>
                    <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {user?.warehouseName || 'Main Warehouse'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Account Registered
                    </label>
                    <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  isLoading={isUpdating}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Save Profile Details
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader
              title="Security & Password"
              description="Keep your inventory management account credentials secure"
            />
            <form onSubmit={handleChangePassword}>
              <CardContent className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>
              </CardContent>

              <CardFooter className="justify-end">
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  leftIcon={<Lock className="w-4 h-4" />}
                >
                  Update Password
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right Col: Role Matrix & Permissions */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Current Role & Access Control"
              description="Your ERP capability tier"
            />
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Assigned Role
                  </span>
                  <RoleBadge role={role} />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {role === 'INVENTORY_MANAGER'
                    ? 'Full administrative control over product catalog, warehouse definitions, and operation approvals.'
                    : 'Field staff permissions focused on shelf picking, packing, inbound intake staging, and cycle counts.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-700 block mb-2">
                    Switch Active Role For Testing:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant={role === 'INVENTORY_MANAGER' ? 'primary' : 'outline'}
                      className="text-xs"
                      onClick={() => switchRole('INVENTORY_MANAGER')}
                    >
                      Manager
                    </Button>
                    <Button
                      size="sm"
                      variant={role === 'WAREHOUSE_STAFF' ? 'primary' : 'outline'}
                      className="text-xs"
                      onClick={() => switchRole('WAREHOUSE_STAFF')}
                    >
                      Staff
                    </Button>
                  </div>
                </div>
              </div>

              {/* Permissions Matrix */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Permissions Matrix
                </span>
                <div className="divide-y divide-slate-100 text-xs">
                  {permissionsMatrix.map((item, i) => {
                    const hasAccess =
                      role === 'INVENTORY_MANAGER' ? item.manager : item.staff;
                    return (
                      <div key={i} className="py-2 flex items-center justify-between gap-2">
                        <span className="text-slate-600 text-[11px] leading-tight">
                          {item.feature}
                        </span>
                        {hasAccess ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
