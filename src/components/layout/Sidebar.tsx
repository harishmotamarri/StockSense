import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Warehouse,
  Settings,
  User,
  LogOut,
  Package,
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const { currentPath, navigate } = useNavigation();
  const { user, logout } = useAuth();

  const handleNav = (path: string) => {
    navigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    {
      group: 'Overview',
      items: [
        {
          label: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          active: currentPath === '/' || currentPath === '/dashboard',
        },
      ],
    },
    {
      group: 'Operations',
      items: [
        {
          label: 'Receipts',
          path: '/receipts',
          icon: ArrowDownToLine,
          active: currentPath.startsWith('/receipts'),
          badge: 'Inbound',
        },
        {
          label: 'Deliveries',
          path: '/deliveries',
          icon: ArrowUpFromLine,
          active: currentPath.startsWith('/deliveries'),
          badge: 'Outbound',
        },
        {
          label: 'Internal Transfers',
          path: '/transfers',
          icon: ArrowLeftRight,
          active: currentPath.startsWith('/transfers'),
        },
        {
          label: 'Adjustments',
          path: '/adjustments',
          icon: SlidersHorizontal,
          active: currentPath.startsWith('/adjustments'),
        },
        {
          label: 'Move History',
          path: '/movements',
          icon: History,
          active: currentPath.startsWith('/movements'),
        },
      ],
    },
    {
      group: 'Master Data',
      items: [
        {
          label: 'Products',
          path: '/products',
          icon: Boxes,
          active: currentPath.startsWith('/products'),
        },
        {
          label: 'Warehouses',
          path: '/warehouses',
          icon: Warehouse,
          active: currentPath.startsWith('/warehouses'),
        },
      ],
    },
    {
      group: 'System',
      items: [
        {
          label: 'Settings',
          path: '/settings',
          icon: Settings,
          active: currentPath.startsWith('/settings'),
        },
        {
          label: 'Profile',
          path: '/profile',
          icon: User,
          active: currentPath.startsWith('/profile'),
        },
      ],
    },
  ];

  return (
    <aside className="flex flex-col h-full bg-slate-900 text-slate-300 w-64 select-none border-r border-slate-800">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3 px-6 h-14 border-b border-slate-800/80">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
          <Package className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            StockSense
            <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-slate-800 text-slate-400 rounded">
              ERP
            </span>
          </span>
          <p className="text-[10px] text-slate-400 font-medium">Inventory System</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navItems.map((group) => (
          <div key={group.group}>
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {group.group}
            </div>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition cursor-pointer group ${
                      item.active
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition ${
                          item.active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                          item.active
                            ? 'bg-indigo-700 text-indigo-100'
                            : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-2.5 min-w-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0 text-left">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Staff User'}</p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.role === 'INVENTORY_MANAGER' ? 'Manager' : 'Staff'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700/50 transition cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
