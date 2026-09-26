import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'destructive' | 'success';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
}: ConfirmDialogProps) {
  const icons = {
    primary: <Info className="w-6 h-6 text-slate-700" />,
    destructive: <AlertTriangle className="w-6 h-6 text-rose-600" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
  };

  const bgCircles = {
    primary: 'bg-slate-100',
    destructive: 'bg-rose-50',
    success: 'bg-emerald-50',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex gap-4 items-start">
        <div className={`p-2.5 rounded-full shrink-0 ${bgCircles[variant]}`}>{icons[variant]}</div>
        <div className="flex-1 text-sm text-slate-600 leading-relaxed">{message}</div>
      </div>
      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'primary' ? 'primary' : variant}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
