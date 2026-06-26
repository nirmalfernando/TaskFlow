import { useState } from 'react';
import { Search, Moon, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/shared/UserAvatar';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TopBarUser {
  name: string;
  avatarSrc?: string;
}

export interface TopBarProps {
  // Left content — provide one
  title?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;

  // Right actions
  user: TopBarUser;
  hasNotification?: boolean;
  onThemeToggle?: () => void;
  onNotifications?: () => void;
  onProfileClick?: () => void;

  className?: string;
}

// ─── Icon button ──────────────────────────────────────────────────────────────

function IconButton({
  onClick,
  label,
  children,
  badge,
}: {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  badge?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-input border border-input bg-white text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
    >
      {children}
      {badge && (
        <span className="absolute right-[6px] top-[6px] h-2 w-2 rounded-full border-2 border-white bg-primary" />
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
  hasNotification = false,
  onThemeToggle,
  onNotifications,
  onProfileClick,
  className,
}: TopBarProps) {
  const [query, setQuery] = useState('');
  const showSearch = Boolean(onSearch);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  }

  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between border-b border-border px-8',
        'bg-[rgba(250,251,252,0.92)] backdrop-blur-sm',
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
                'h-9 w-full rounded-input border border-input bg-white pl-9 pr-4 text-sm',
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
        <IconButton label="Toggle theme" onClick={onThemeToggle}>
          <Moon className="h-[18px] w-[18px]" />
        </IconButton>

        <IconButton label="Notifications" onClick={onNotifications} badge={hasNotification}>
          <Bell className="h-4 w-4" />
        </IconButton>

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
