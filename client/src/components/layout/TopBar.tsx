import { useState, useRef, useEffect } from 'react';
import { Search, Moon, Sun, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { useTheme } from '@/hooks/useTheme';
import { NotificationPanel } from '@/components/shared/NotificationPanel';
import type { AppNotification } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TopBarUser {
  name: string;
  avatarSrc?: string;
}

export interface TopBarProps {
  // Left content
  title?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;

  // Right actions
  user: TopBarUser;
  onProfileClick?: () => void;

  // Notifications
  notifications?: AppNotification[];
  unreadCount?: number;
  notificationsLoading?: boolean;
  onMarkAllRead?: () => void;
  onMarkRead?: (id: string) => void;
  onNotificationClick?: (notification: AppNotification) => void;

  className?: string;
}

// ─── Icon button ──────────────────────────────────────────────────────────────

function IconButton({
  onClick,
  label,
  children,
  badgeCount,
}: {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  badgeCount?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-input border border-input bg-card text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
    >
      {children}
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </button>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

export function TopBar({
  title,
  searchPlaceholder = 'Search tasks…',
  onSearch,
  user,
  onProfileClick,
  notifications = [],
  unreadCount = 0,
  notificationsLoading = false,
  onMarkAllRead,
  onMarkRead,
  onNotificationClick,
  className,
}: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifContainerRef = useRef<HTMLDivElement>(null);
  const showSearch = Boolean(onSearch);

  useEffect(() => {
    if (!notifOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (notifContainerRef.current && !notifContainerRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [notifOpen]);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  }

  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between border-b border-border bg-card px-8',
        className,
      )}
    >
      {/* Left */}
      <div className="flex-1">
        {showSearch ? (
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-placeholder" />
            <input
              type="search"
              value={query}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className={cn(
                'h-9 w-full rounded-input border border-input bg-surface pl-9 pr-4 text-sm',
                'text-text-primary placeholder:text-text-placeholder',
                'outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                'transition-colors',
              )}
            />
          </div>
        ) : title ? (
          <span className="text-sm font-semibold text-text-muted">{title}</span>
        ) : null}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <IconButton
          label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </IconButton>

        <div className="relative" ref={notifContainerRef}>
          <IconButton
            label="Notifications"
            onClick={() => setNotifOpen((o) => !o)}
            badgeCount={unreadCount}
          >
            <Bell className="h-4 w-4" />
          </IconButton>

          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            loading={notificationsLoading}
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
            onMarkAllRead={() => onMarkAllRead?.()}
            onMarkRead={(id) => onMarkRead?.(id)}
            onNotificationClick={(notification) => {
              setNotifOpen(false);
              onNotificationClick?.(notification);
            }}
          />
        </div>

        <button
          type="button"
          onClick={onProfileClick}
          aria-label="Profile"
          className="flex-shrink-0"
        >
          <UserAvatar name={user.name} src={user.avatarSrc} size="md" />
        </button>
      </div>
    </header>
  );
}
