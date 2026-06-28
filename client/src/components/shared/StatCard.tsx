import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TrendSentiment = 'positive' | 'negative' | 'warning' | 'neutral';
export type TrendDirection = 'up' | 'down' | 'neutral';

export interface StatCardTrend {
  label: string;
  direction?: TrendDirection;
  sentiment?: TrendSentiment;
}

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  iconBg?: string;
  trend?: StatCardTrend;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sentimentColor: Record<TrendSentiment, string> = {
  positive: 'text-success',
  negative: 'text-red-500',
  warning: 'text-orange-500',
  neutral: 'text-text-muted',
};

const TrendIcon = ({ direction }: { direction: TrendDirection }) => {
  const cls = 'h-3.5 w-3.5 flex-shrink-0';
  if (direction === 'up') return <TrendingUp className={cls} />;
  if (direction === 'down') return <TrendingDown className={cls} />;
  return <Minus className={cls} />;
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  icon,
  iconBg = 'bg-primary-light',
  trend,
  className,
}: StatCardProps) {
  const sentiment = trend?.sentiment ?? 'neutral';
  const direction = trend?.direction ?? 'neutral';

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-card bg-card p-[25px]',
        'border border-border shadow-[0px_1px_2px_rgba(0,0,0,0.06)]',
        className,
      )}
    >
      {/* Header: label + icon */}
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        <div
          className={cn(
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-nav',
            iconBg,
          )}
        >
          {icon}
        </div>
      </div>

      {/* Value + trend */}
      <div className="flex flex-col gap-2">
        <span className="text-[32px] font-bold leading-none tracking-tight text-text-primary">
          {value}
        </span>
        {trend && (
          <div
            className={cn('flex items-center gap-1 text-xs font-medium', sentimentColor[sentiment])}
          >
            <TrendIcon direction={direction} />
            <span>{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
