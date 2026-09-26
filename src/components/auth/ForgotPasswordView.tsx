import React, { useState } from 'react';
import { Package, Mail, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function ForgotPasswordView() {
  const { forgotPassword } = useAuth();
  const { navigate } = useNavigation();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Please enter your work email');
      return;
    }
    setIsLoading(true);
    try {
      await forgotPassword(email);
      success('OTP Sent', 'A 6-digit verification code has been dispatched to your email.');
      navigate('/verify-otp');
    } catch (err: any) {
      error('Request failed', err.message);
    } finally {
      setIsLoading(false);
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
          Reset Password
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Enter your registered email to receive a verification OTP
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Account Work Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sarah.jenkins@stocksense.io"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              isLoading={isLoading}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Send OTP Code
            </Button>
          </form>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
