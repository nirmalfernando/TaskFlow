import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Clock, Timer, CheckCircle2, MoreHorizontal, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '@/components/shared/StatCard';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import * as taskService from '@/services/task.service';
import type { Task } from '@/types';

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

function PriorityDistributionCard({ tasks }: { tasks: Task[] }) {
  const high = tasks.filter((t) => t.priority === 'HIGH' || t.priority === 'CRITICAL').length;
  const medium = tasks.filter((t) => t.priority === 'MEDIUM').length;
  const low = tasks.filter((t) => t.priority === 'LOW').length;
  const total = tasks.length;

  const rows = [
    {
      label: 'High',
      count: high,
      pct: total > 0 ? Math.round((high / total) * 100) : 0,
      dot: 'bg-red-500',
      track: 'bg-[#ffe2e2]',
      fill: 'bg-[#ff6467]',
    },
    {
      label: 'Medium',
      count: medium,
      pct: total > 0 ? Math.round((medium / total) * 100) : 0,
      dot: 'bg-amber-400',
      track: 'bg-[#fef3c6]',
      fill: 'bg-[#ffb900]',
    },
    {
      label: 'Low',
      count: low,
      pct: total > 0 ? Math.round((low / total) * 100) : 0,
      dot: 'bg-emerald-500',
      track: 'bg-[#d0fae5]',
      fill: 'bg-[#00d492]',
    },
  ] as const;

  const footer = [
    { count: high, label: 'High', color: 'text-red-500' },
    { count: medium, label: 'Medium', color: 'text-amber-500' },
    { count: low, label: 'Low', color: 'text-emerald-500' },
  ] as const;

  return (
    <div className="flex flex-col gap-6 rounded-card border border-border bg-card p-[25px] shadow-[0px_1px_2px_rgba(0,0,0,0.06)]">
      <CardHeader title="Priority Distribution" subtitle={`Across all ${total} tasks`} />

      <div className="flex flex-col gap-5">
        {rows.map((row) => (
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
          {footer.map((item) => (
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

const STATUS_COLORS: Record<string, string> = {
  TODO: '#3b82f6',
  IN_PROGRESS: '#8b5cf6',
  IN_QA: '#f59e0b',
  COMPLETED: '#10b981',
};

const STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_QA: 'In QA',
  COMPLETED: 'Completed',
};

function TasksByStatusCard({ tasks }: { tasks: Task[] }) {
  const counts = {
    TODO: tasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    IN_QA: tasks.filter((t) => t.status === 'IN_QA').length,
    COMPLETED: tasks.filter((t) => t.status === 'COMPLETED').length,
  };
  const total = tasks.length;

  const statusData = Object.entries(counts).map(([key, value]) => ({
    name: STATUS_LABELS[key] ?? key,
    value,
    color: STATUS_COLORS[key] ?? '#6b7280',
    key,
  }));

  return (
    <div className="flex flex-col gap-6 rounded-card border border-border bg-card p-[25px] shadow-[0px_1px_2px_rgba(0,0,0,0.06)]">
      <CardHeader title="Tasks by Status" subtitle="Current overview" />

      <div className="relative mx-auto h-[200px] w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {statusData.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [value, name]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f3f4f6' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-text-primary">{total}</span>
          <span className="text-xs font-medium text-text-placeholder">Total</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {statusData.map((item) => (
          <div key={item.key} className="flex items-start gap-2.5">
            <span
              className="mt-[3px] h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-text-secondary">{item.name}</span>
                <span className="text-xs text-text-secondary">-</span>
                <span className="text-xs font-semibold text-text-dark">{item.value}</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-1 rounded-full"
                  style={{
                    width: total > 0 ? `${(item.value / total) * 100}%` : '0%',
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DashboardPage ────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.firstName ?? 'there';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskService
      .getTasks({ limit: 100 })
      .then(({ data }) => setTasks(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = tasks.length;
  const open = tasks.filter((t) => t.status === 'TODO').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const done = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
          onClick={() => navigate('/tasks?new=1')}
          className="flex h-9 w-fit items-center gap-2 rounded-nav bg-primary px-4 text-sm font-medium text-white shadow-[0px_1px_1.5px_rgba(43,127,255,0.2),0px_1px_1px_rgba(43,127,255,0.2)] transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[15.75px]">
        <StatCard
          label="Total Tasks"
          value={loading ? '—' : total}
          icon={<Layers className="h-[18px] w-[18px] text-primary" />}
          iconBg="bg-primary-light"
          trend={{ label: 'All tasks', direction: 'neutral', sentiment: 'positive' }}
        />
        <StatCard
          label="Open"
          value={loading ? '—' : open}
          icon={<Clock className="h-[18px] w-[18px] text-amber-500" />}
          iconBg="bg-[#fffbeb]"
          trend={{ label: 'Awaiting work', direction: 'neutral', sentiment: 'warning' }}
        />
        <StatCard
          label="In Progress"
          value={loading ? '—' : inProgress}
          icon={<Timer className="h-[18px] w-[18px] text-violet-500" />}
          iconBg="bg-[#f5f3ff]"
          trend={{ label: 'Being worked on', direction: 'up', sentiment: 'positive' }}
        />
        <StatCard
          label="Completed"
          value={loading ? '—' : done}
          icon={<CheckCircle2 className="h-[18px] w-[18px] text-emerald-500" />}
          iconBg="bg-[#ecfdf5]"
          trend={{ label: 'Finished tasks', direction: 'up', sentiment: 'positive' }}
        />
      </div>

      {/* Charts row */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[15.75px]">
          <PriorityDistributionCard tasks={tasks} />
          <TasksByStatusCard tasks={tasks} />
        </div>
      )}
    </div>
  );
}
