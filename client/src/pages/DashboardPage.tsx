import { Layers, Clock, Timer, CheckCircle2, MoreHorizontal, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '@/components/shared/StatCard';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// ─── Static data ──────────────────────────────────────────────────────────────

const STATUS_DATA = [
  { name: 'Open', value: 38, color: '#3b82f6' },
  { name: 'In Progress', value: 29, color: '#8b5cf6' },
  { name: 'Testing', value: 18, color: '#f59e0b' },
  { name: 'Done', value: 43, color: '#10b981' },
];

const PRIORITY_ROWS = [
  {
    label: 'High',
    count: 24,
    pct: 19,
    dot: 'bg-red-500',
    track: 'bg-[#ffe2e2]',
    fill: 'bg-[#ff6467]',
  },
  {
    label: 'Medium',
    count: 58,
    pct: 45,
    dot: 'bg-amber-400',
    track: 'bg-[#fef3c6]',
    fill: 'bg-[#ffb900]',
  },
  {
    label: 'Low',
    count: 46,
    pct: 36,
    dot: 'bg-emerald-500',
    track: 'bg-[#d0fae5]',
    fill: 'bg-[#00d492]',
  },
] as const;

const PRIORITY_FOOTER = [
  { count: 24, label: 'High', color: 'text-red-500' },
  { count: 58, label: 'Medium', color: 'text-amber-500' },
  { count: 46, label: 'Low', color: 'text-emerald-500' },
] as const;

const TOTAL = 128;

// ─── Sub-components ───────────────────────────────────────────────────────────

function CardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        <p className="mt-0.5 text-xs text-text-placeholder">{subtitle}</p>
      </div>
      <button
        type="button"
        className="text-text-placeholder hover:text-text-muted transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}

function PriorityDistributionCard() {
  return (
    <div className="flex flex-col gap-6 rounded-card border border-border bg-white p-[25px] shadow-[0px_1px_2px_rgba(0,0,0,0.06)]">
      <CardHeader title="Priority Distribution" subtitle={`Across all ${TOTAL} tasks`} />

      <div className="flex flex-col gap-5">
        {PRIORITY_ROWS.map((row) => (
          <div key={row.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full flex-shrink-0', row.dot)} />
                <span className="text-sm font-medium text-text-label">{row.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary">{row.count}</span>
                <span className="w-8 text-right text-xs text-text-placeholder">{row.pct}%</span>
              </div>
            </div>
            <div className={cn('h-2 w-full overflow-hidden rounded-full', row.track)}>
              <div className={cn('h-2 rounded-full', row.fill)} style={{ width: `${row.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-5">
        <div className="grid grid-cols-3">
          {PRIORITY_FOOTER.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-0.5">
              <span className="text-[18px] font-bold text-text-primary">{item.count}</span>
              <span className={cn('text-xs', item.color)}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusLegendItem({ item }: { item: (typeof STATUS_DATA)[number] }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-text-secondary">{item.name}</span>
        <span className="text-xs text-text-secondary">-</span>
        <span className="text-xs font-semibold text-text-dark">{item.value}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-1 rounded-full"
          style={{ width: `${(item.value / TOTAL) * 100}%`, backgroundColor: item.color }}
        />
      </div>
    </div>
  );
}

function TasksByStatusCard() {
  return (
    <div className="flex flex-col gap-6 rounded-card border border-border bg-white p-[25px] shadow-[0px_1px_2px_rgba(0,0,0,0.06)]">
      <CardHeader title="Tasks by Status" subtitle="Current sprint overview" />

      {/* Donut chart */}
      <div className="relative mx-auto h-[200px] w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={STATUS_DATA}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {STATUS_DATA.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [value, name]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f3f4f6' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-text-primary">{TOTAL}</span>
          <span className="text-xs font-medium text-text-placeholder">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {STATUS_DATA.map((item) => (
          <div key={item.name} className="flex items-start gap-2.5">
            <span
              className="mt-[3px] h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <StatusLegendItem item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DashboardPage ────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useAuth();

  const firstName = user?.firstName ?? 'there';

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.6px] text-text-primary">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Here&apos;s an overview of your tasks and activity.
          </p>
        </div>
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-nav bg-primary px-4 text-sm font-medium text-white shadow-[0px_1px_1.5px_rgba(43,127,255,0.2),0px_1px_1px_rgba(43,127,255,0.2)] transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-[15.75px]">
        <StatCard
          label="Total Tasks"
          value={128}
          icon={<Layers className="h-[18px] w-[18px] text-primary" />}
          iconBg="bg-primary-light"
          trend={{ label: '+12 this month', direction: 'up', sentiment: 'positive' }}
        />
        <StatCard
          label="Open"
          value={38}
          icon={<Clock className="h-[18px] w-[18px] text-amber-500" />}
          iconBg="bg-[#fffbeb]"
          trend={{ label: '3 due today', direction: 'neutral', sentiment: 'warning' }}
        />
        <StatCard
          label="In Progress"
          value={29}
          icon={<Timer className="h-[18px] w-[18px] text-violet-500" />}
          iconBg="bg-[#f5f3ff]"
          trend={{ label: '5 updated today', direction: 'up', sentiment: 'positive' }}
        />
        <StatCard
          label="Completed"
          value={43}
          icon={<CheckCircle2 className="h-[18px] w-[18px] text-emerald-500" />}
          iconBg="bg-[#ecfdf5]"
          trend={{ label: '+8 this week', direction: 'up', sentiment: 'positive' }}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-[15.75px]">
        <PriorityDistributionCard />
        <TasksByStatusCard />
      </div>
    </div>
  );
}
