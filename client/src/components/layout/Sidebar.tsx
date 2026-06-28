import type { ReactNode } from 'react';
import { LayoutDashboard, CheckSquare, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/shared/UserAvatar';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SidebarNavItem = {
  key: string;
  label: string;
  icon: ReactNode;
  badge?: string | number;
};

export type SidebarUser = {
  name: string;
  role?: string;
  avatarSrc?: string;
};

export interface SidebarProps {
  navItems?: SidebarNavItem[];
  activeNav?: string;
  onNavChange?: (key: string) => void;
  user?: SidebarUser;
  onLogout?: () => void;
  className?: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_NAV_ITEMS: SidebarNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { key: 'tasks', label: 'Tasks', icon: <CheckSquare className="h-[18px] w-[18px]" /> },
  { key: 'users', label: 'Users', icon: <Users className="h-[18px] w-[18px]" />, badge: 'Admin' },
  { key: 'settings', label: 'Settings', icon: <Settings className="h-[18px] w-[18px]" /> },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-5 pt-5 pb-2">
      <div className="h-8 w-8 flex-shrink-0 rounded-logo bg-primary flex items-center justify-center shadow-logo">
        <img src="/logo.svg" alt="TaskFlow logo" className="h-[18px] w-[18px]" />
      </div>
      <span className="text-base font-semibold tracking-tight text-text-primary">TaskFlow</span>
    </div>
  );
}

function NavItemButton({
  item,
  active,
  onClick,
}: {
  item: SidebarNavItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between gap-3 rounded-nav px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-white shadow-nav-active'
          : 'text-text-muted hover:bg-surface hover:text-text-primary',
      )}
    >
      <span className="flex items-center gap-3">
        <span className={cn('flex-shrink-0', active ? 'text-white' : 'text-text-muted')}>
          {item.icon}
        </span>
        {item.label}
      </span>
      {item.badge !== undefined && (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
            active ? 'bg-white/20 text-white' : 'bg-primary-light text-primary',
          )}
        >
          {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </button>
  );
}

function UserSection({ user, onLogout }: { user: SidebarUser; onLogout?: () => void }) {
  return (
    <div className="border-t border-border pt-[13px] pb-4 px-3 flex flex-col gap-1">
      <div className="bg-surface rounded-card p-3 flex items-center gap-3">
        <UserAvatar name={user.name} src={user.avatarSrc} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
          {user.role && (
            <span className="inline-flex items-center rounded-full bg-primary-light px-1.5 py-0.5 text-[11px] font-semibold text-primary">
              {user.role}
            </span>
          )}
        </div>
      </div>
      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 rounded-nav px-3 py-2.5 text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          Log out
        </button>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({
  navItems = DEFAULT_NAV_ITEMS,
  activeNav,
  onNavChange,
  user,
  onLogout,
  className,
}: SidebarProps) {
  return (
    <aside className={cn('flex h-full w-64 flex-col border-r border-border bg-card', className)}>
      <Logo />

      <nav className="flex-1 overflow-y-auto px-3 pt-4 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavItemButton
            key={item.key}
            item={item}
            active={activeNav === item.key}
            onClick={() => onNavChange?.(item.key)}
          />
        ))}
      </nav>

      {user && <UserSection user={user} onLogout={onLogout} />}
    </aside>
  );
}
