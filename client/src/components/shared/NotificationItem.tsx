import { Bell, CalendarClock, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AppNotification } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotificationItemProps {
  notification: AppNotification;
  onRead?: (id: string) => void;
  onClick?: (notification: AppNotification) => void;
  className?: string;
}

// ─── Icon by type ─────────────────────────────────────────────────────────────

function NotificationIcon({ type }: { type: AppNotification['type'] }) {
  if (type === 'due_today') {
    return (
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/30">
        <CalendarClock className="h-4 w-4 text-orange-500" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-light">
      <Bell className="h-4 w-4 text-primary" />
    </div>
  );
}

// ─── NotificationItem ─────────────────────────────────────────────────────────

export function NotificationItem({
  notification,
  onRead,
  onClick,
  className,
}: NotificationItemProps) {
  function handleClick() {
    if (!notification.read) {
      onRead?.(notification.id);
    }
    onClick?.(notification);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={cn(
        'flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors',
        'hover:bg-surface',
        !notification.read && 'bg-primary-light/40',
        className,
      )}
    >
      <NotificationIcon type={notification.type} />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm leading-snug',
            notification.read ? 'text-text-secondary' : 'font-medium text-text-primary',
          )}
        >
          {notification.message}
        </p>
        <p className="mt-0.5 capitalize text-[11px] text-text-placeholder">
          {notification.type === 'due_today' ? 'Due today' : 'Assigned to you'}
        </p>
      </div>

      {!notification.read && (
        <span
          className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary"
          aria-label="Unread"
        />
      )}

      {notification.read && (
        <CheckCheck className="mt-1.5 h-3.5 w-3.5 flex-shrink-0 text-text-placeholder" />
      )}
    </div>
  );
}
