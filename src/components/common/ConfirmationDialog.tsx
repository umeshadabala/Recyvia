import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            variant === 'danger'
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
              : variant === 'warning'
              ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100">{title}</h4>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{message}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
