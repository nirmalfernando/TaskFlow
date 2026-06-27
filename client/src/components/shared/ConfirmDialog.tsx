import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-[400px] rounded-[20px] border border-border bg-white shadow-[0px_24px_64px_rgba(0,0,0,0.15)]">
        <div className="p-6">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <p className="mt-2 text-sm text-text-muted">{description}</p>
        </div>
        <div className="flex items-center justify-end gap-2.5 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-9 rounded-nav border border-input px-5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-nav px-5 text-sm font-medium text-white transition-colors disabled:opacity-50',
              variant === 'danger'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-primary hover:bg-primary/90',
            )}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
