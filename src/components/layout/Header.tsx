import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  Menu,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  AlertTriangle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { RoleSwitcher } from './RoleSwitcher';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { navigate } = useNavigation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU or products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-slate-100 border border-transparent rounded-md placeholder:text-slate-400 focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
          />
        </form>

        {/* Role Switcher */}
        <RoleSwitcher />

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Notifications & Alerts</span>
                <span className="text-[10px] font-medium bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                  3 Actions Req.
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                <div
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('/products');
                  }}
                  className="p-3 hover:bg-slate-50 cursor-pointer flex gap-3 text-xs transition"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Out of Stock: Copper Wire</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">WIR-CPR-250 reached 0 PCS in all bays.</p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('/receipts');
                  }}
                  className="p-3 hover:bg-slate-50 cursor-pointer flex gap-3 text-xs transition"
                >
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Receipt Ready: REC-2026-089</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Steel Rod shipment staged at Dock A.</p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('/deliveries');
                  }}
                  className="p-3 hover:bg-slate-50 cursor-pointer flex gap-3 text-xs transition"
                >
                  <ExternalLink className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Delivery Waiting: DO-2026-055</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">BuildPro scheduled for pickup tomorrow.</p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('/dashboard');
                  }}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition"
                >
                  View All Operations on Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-slate-200 transition cursor-pointer"
            aria-label="User menu"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <span className="hidden lg:block text-xs font-semibold text-slate-800 max-w-[100px] truncate">
              {user?.name || 'User'}
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {user?.role === 'INVENTORY_MANAGER' ? 'Inventory Manager' : 'Warehouse Staff'}
                  </span>
                </div>
              </div>

              <div className="py-1 text-xs text-slate-700">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition text-left cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition text-left cursor-pointer"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  Settings
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
