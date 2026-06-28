import { createPortal } from 'react-dom';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationItem } from './NotificationItem';
import type { AppNotification } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotificationPanelProps {
  notifications: AppNotification[];
  unreadCount: number;
  loading?: boolean;
  open: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onNotificationClick?: (notification: AppNotification) => void;
  /** Screen coords of the anchor element — used to position the portal panel */
  anchorStyle?: { top: number; right: number };
  className?: string;
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
        <Bell className="h-6 w-6 text-text-placeholder" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-text-muted">All caught up!</p>
        <p className="mt-0.5 text-xs text-text-placeholder">No new notifications right now</p>
      </div>
    </div>
  );
}

// ─── NotificationPanel ────────────────────────────────────────────────────────

export function NotificationPanel({
  notifications,
  unreadCount,
  loading = false,
  open,
  onClose: _onClose,
  onMarkAllRead,
  onMarkRead,
  onNotificationClick,
  anchorStyle,
  className,
}: NotificationPanelProps) {
  if (!open) return null;

  const panel = (
    <div
      data-notification-panel
      style={anchorStyle ? { top: anchorStyle.top, right: anchorStyle.right } : undefined}
      className={cn(
        'fixed z-[9999] w-[360px]',
        'overflow-hidden rounded-[16px] border border-border bg-card',
        'shadow-[0px_8px_32px_rgba(0,0,0,0.12)]',
        className,
      )}
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-text-muted" />
          <span className="text-sm font-semibold text-text-primary">Notifications</span>
          {unreadCount > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-text-placeholder" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={onMarkRead}
                onClick={onNotificationClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-border px-4 py-2.5">
          <p className="text-center text-xs text-text-placeholder">
            {notifications.length} notification{notifications.length === 1 ? '' : 's'} total
          </p>
        </div>
      )}
    </div>
  );

  return createPortal(panel, document.body);
}
