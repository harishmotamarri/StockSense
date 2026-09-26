import React, { useState } from 'react';
import { Package, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function LoginView() {
  const { login, switchRole } = useAuth();
  const { navigate } = useNavigation();
  const { success, error } = useToast();

  const [email, setEmail] = useState('sarah.jenkins@stocksense.io');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Please enter your email');
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      success('Welcome back', 'Signed in successfully');
      navigate('/dashboard');
    } catch (err: any) {
      error('Login failed', err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = (role: 'INVENTORY_MANAGER' | 'WAREHOUSE_STAFF') => {
    if (role === 'INVENTORY_MANAGER') {
      setEmail('sarah.jenkins@stocksense.io');
      switchRole('INVENTORY_MANAGER');
    } else {
      setEmail('marcus.vance@stocksense.io');
      switchRole('WAREHOUSE_STAFF');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg ring-1 ring-white/20">
            <Package className="w-7 h-7 stroke-[2.2]" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          StockSense ERP
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Centralized Enterprise Inventory & Warehouse Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Sign in to your account</h3>
            <p className="text-xs text-slate-500 mt-1">
              Access your inventory catalog, receipts, and dispatch ledgers.
            </p>
          </div>

          {/* Quick Demo Switcher */}
          <div className="mb-5 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Instant Demo Presets:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickDemoLogin('INVENTORY_MANAGER')}
                className="flex items-center gap-1.5 p-2 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-800 hover:border-indigo-500 hover:text-indigo-600 transition shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-[11px]">Manager</div>
                  <div className="text-[9px] text-slate-400">Full Catalog & Config</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickDemoLogin('WAREHOUSE_STAFF')}
                className="flex items-center gap-1.5 p-2 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-800 hover:border-slate-800 hover:text-slate-900 transition shadow-xs cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-slate-700 shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-[11px]">Staff</div>
                  <div className="text-[9px] text-slate-400">Pick, Pack & Audit</div>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Remember me for 30 days
              </label>

              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="font-medium text-indigo-600 hover:text-indigo-800 transition"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an enterprise account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              Request trial signup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
