import { cn } from '@/lib/utils';

export type TaskStatus = 'open' | 'in-progress' | 'testing' | 'done';

export interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const config: Record<TaskStatus, { bg: string; text: string; label: string }> = {
  open: { bg: 'bg-primary-light', text: 'text-primary', label: 'Open' },
  'in-progress': {
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    text: 'text-violet-700 dark:text-violet-400',
    label: 'In Progress',
  },
  testing: {
    bg: 'bg-sky-50 dark:bg-sky-500/10',
    text: 'text-sky-700 dark:text-sky-400',
    label: 'Testing',
  },
  done: {
    bg: 'bg-green-50 dark:bg-green-500/10',
    text: 'text-green-700 dark:text-green-400',
    label: 'Done',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { bg, text, label } = config[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        bg,
        text,
        className,
      )}
    >
      {label}
    </span>
  );
}
