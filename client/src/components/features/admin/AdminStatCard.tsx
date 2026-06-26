import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface AdminStatCardProps {
  value: number | string;
  label: string;
  icon: ReactNode;
  iconBg?: string;
  className?: string;
}

export function AdminStatCard({
  value,
  label,
  icon,
  iconBg = 'bg-primary-light',
  className,
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-card border border-border bg-white p-[17px]',
        'shadow-[0px_1px_2px_rgba(0,0,0,0.05)]',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-input',
          iconBg,
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold leading-none text-text-primary">{value}</span>
        <span className="mt-1 text-xs font-medium text-text-muted">{label}</span>
      </div>
    </div>
  );
}
