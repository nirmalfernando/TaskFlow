import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { RoleBadge, type UserRole } from '@/components/shared/RoleBadge';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserActivityStatus = 'active' | 'inactive';

export interface AdminUserData {
  id: string;
  name: string;
  email: string;
  avatarSrc?: string;
  role: UserRole;
  taskCount: number;
  joinedDate: string;
  status: UserActivityStatus;
  isCurrentUser?: boolean;
}

export interface AdminUserTableRowProps extends AdminUserData {
  onClick?: () => void;
  onMoreActions?: (e: React.MouseEvent) => void;
}

// ─── Status indicator ─────────────────────────────────────────────────────────

function StatusIndicator({ status }: { status: UserActivityStatus }) {
  const isActive = status === 'active';
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          'h-2 w-2 flex-shrink-0 rounded-full',
          isActive ? 'bg-success' : 'bg-[#d1d5dc]',
        )}
      />
      <span
        className={cn('text-sm font-medium', isActive ? 'text-[#009966]' : 'text-text-placeholder')}
      >
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
}

// ─── Table header ─────────────────────────────────────────────────────────────

export function AdminUserTableHeader() {
  return (
    <thead>
      <tr className="border-b border-border bg-surface">
        {(['User', 'Role', 'Tasks', 'Joined', 'Status'] as const).map((col) => (
          <th
            key={col}
            className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-text-muted"
          >
            {col}
          </th>
        ))}
        {/* empty header for actions column */}
        <th className="w-12 px-5 py-3" />
      </tr>
    </thead>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

export function AdminUserTableRow({
  name,
  email,
  avatarSrc,
  role,
  taskCount,
  joinedDate,
  status,
  isCurrentUser,
  onClick,
  onMoreActions,
}: AdminUserTableRowProps) {
  return (
    <tr
      className={cn(
        'group border-b border-surface transition-colors',
        onClick && 'cursor-pointer hover:bg-surface',
      )}
      onClick={onClick}
    >
      {/* User */}
      <td className="px-5 py-[14.5px]">
        <div className="flex items-center gap-3">
          <UserAvatar name={name} src={avatarSrc} size="md" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-text-primary">{name}</span>
              {isCurrentUser && (
                <span className="rounded-full border border-[rgba(190,219,255,0.5)] bg-primary-light px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  You
                </span>
              )}
            </div>
            <span className="text-xs text-text-placeholder">{email}</span>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-5 py-[14.5px]">
        <RoleBadge role={role} />
      </td>

      {/* Tasks */}
      <td className="px-5 py-[14.5px]">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-text-dark">{taskCount}</span>
          <span className="text-xs text-text-placeholder">tasks</span>
        </div>
      </td>

      {/* Joined */}
      <td className="px-5 py-[14.5px]">
        <span className="text-sm text-text-muted">{joinedDate}</span>
      </td>

      {/* Status */}
      <td className="px-5 py-[14.5px]">
        <StatusIndicator status={status} />
      </td>

      {/* More actions */}
      <td className="w-12 px-3 py-[14.5px]">
        <button
          type="button"
          aria-label="More actions"
          onClick={(e) => {
            e.stopPropagation();
            onMoreActions?.(e);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-nav text-text-placeholder opacity-0 transition-opacity hover:bg-input hover:text-text-muted group-hover:opacity-100"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
