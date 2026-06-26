import { cn } from '@/lib/utils';

export type Priority = 'high' | 'medium' | 'low';

export interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const config: Record<Priority, { bg: string; dot: string; text: string; label: string }> = {
  high: { bg: 'bg-red-50', dot: 'bg-red-500', text: 'text-red-600', label: 'High' },
  medium: { bg: 'bg-orange-50', dot: 'bg-orange-400', text: 'text-orange-600', label: 'Medium' },
  low: { bg: 'bg-green-50', dot: 'bg-green-500', text: 'text-green-700', label: 'Low' },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const { bg, dot, text, label } = config[priority];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        bg,
        text,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', dot)} />
      {label}
    </span>
  );
}
