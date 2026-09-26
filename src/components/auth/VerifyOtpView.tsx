import React, { useState, useRef } from 'react';
import { Package, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';

export function VerifyOtpView() {
  const { verifyOtp, pendingResetEmail } = useAuth();
  const { navigate } = useNavigation();
  const { success, error, info } = useToast();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Pasting full OTP
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const val = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto advance
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      error('Please enter complete 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    try {
      const valid = await verifyOtp(fullOtp);
      if (valid) {
        success('Verification successful', 'You can now set a new password');
        navigate('/reset-password');
      } else {
        error('Invalid OTP', 'Please check the code and try again');
      }
    } catch (err: any) {
      error('Verification error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    info('Code Resent', 'A fresh OTP code has been generated: 748291');
    setOtp(['7', '4', '8', '2', '9', '1']);
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
          Verify OTP
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Enter the 6-digit code sent to {pendingResetEmail || 'your email'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-200">
          {/* Quick hint for testing */}
          <div className="mb-5 p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs flex items-center justify-between">
            <span>Demo OTP: <strong>748291</strong></span>
            <button
              type="button"
              onClick={handleResend}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-900 underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Auto-fill
            </button>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 text-center text-lg font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-slate-900"
                />
              ))}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              isLoading={isLoading}
              rightIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Verify OTP
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={() => navigate('/forgot-password')}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <button
              onClick={handleResend}
              className="font-medium text-indigo-600 hover:text-indigo-800 transition"
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
