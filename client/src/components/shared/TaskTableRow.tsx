import { TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityBadge, type Priority } from './PriorityBadge';
import { StatusBadge, type TaskStatus } from './StatusBadge';
import { UserAvatar } from './UserAvatar';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TaskTableRowProps {
  id: string;
  title: string;
  priority: Priority;
  status: TaskStatus;
  assignee: {
    name: string;
    avatarSrc?: string;
  };
  dueDate: string;
  isOverdue?: boolean;
  onClick?: () => void;
  className?: string;
}

// ─── Column header (used in TaskTable) ────────────────────────────────────────

export function TaskTableHeader() {
  return (
    <thead>
      <tr className="border-b border-border">
        <th className="py-3 pl-5 pr-4 text-left text-xs font-medium uppercase tracking-wide text-text-placeholder">
          Task
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-placeholder">
          Priority
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-placeholder">
          Status
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-placeholder">
          Assignee
        </th>
        <th className="py-3 pl-4 pr-5 text-left text-xs font-medium uppercase tracking-wide text-text-placeholder">
          Due Date
        </th>
      </tr>
    </thead>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

export function TaskTableRow({
  id,
  title,
  priority,
  status,
  assignee,
  dueDate,
  isOverdue = false,
  onClick,
  className,
}: TaskTableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-b border-surface transition-colors',
        onClick && 'cursor-pointer hover:bg-surface',
        className,
      )}
    >
      {/* Task */}
      <td className="py-3.5 pl-5 pr-4">
        <p className="font-mono text-[11px] text-text-placeholder">{id}</p>
        <p className="mt-0.5 text-sm font-medium text-text-dark">{title}</p>
      </td>

      {/* Priority */}
      <td className="px-4 py-3.5">
        <PriorityBadge priority={priority} />
      </td>

      {/* Status */}
      <td className="px-4 py-3.5">
        <StatusBadge status={status} />
      </td>

      {/* Assignee */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <UserAvatar name={assignee.name} src={assignee.avatarSrc} size="sm" />
          <span className="text-sm font-medium text-text-secondary">
            {assignee.name.split(' ')[0]}
          </span>
        </div>
      </td>

      {/* Due Date */}
      <td className="py-3.5 pl-4 pr-5">
        <div
          className={cn(
            'flex items-center gap-1.5 text-sm',
            isOverdue ? 'text-orange-500' : 'text-text-secondary',
          )}
        >
          {isOverdue && <TriangleAlert className="h-3.5 w-3.5 flex-shrink-0" />}
          {dueDate}
        </div>
      </td>
    </tr>
  );
}
