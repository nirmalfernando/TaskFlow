import { useMemo } from 'react';
import { addDays, differenceInDays, format, startOfDay, eachWeekOfInterval } from 'date-fns';
import { Calendar, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, TaskStatusBackend } from '@/types';

const DAY_PX = 34;
const ROW_H = 52;
const LEFT_COL_W = 248;
const HEADER_H = 48;

const STATUS_STYLE: Record<TaskStatusBackend, { bar: string; label: string }> = {
  TODO: { bar: '#3b82f6', label: 'To Do' },
  IN_PROGRESS: { bar: '#8b5cf6', label: 'In Progress' },
  IN_QA: { bar: '#f59e0b', label: 'In QA' },
  COMPLETED: { bar: '#10b981', label: 'Completed' },
};

function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'COMPLETED') return false;
  return new Date(task.dueDate) < new Date();
}

// ─── Mobile: date-sorted list (no horizontal scroll) ─────────────────────────

function MobileTimelineList({
  tasks,
  onTaskClick,
}: {
  tasks: Task[];
  onTaskClick: (id: string) => void;
}) {
  const sorted = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }),
    [tasks],
  );

  return (
    <div className="overflow-hidden rounded-card border border-border bg-card shadow-[0px_1px_4px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
          Task
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
          Due
        </span>
      </div>

      {sorted.map((task, i) => {
        const style = STATUS_STYLE[task.status];
        const overdue = isOverdue(task);
        const assigneeName = task.assignedTo
          ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
          : null;
        const dueLabel = task.dueDate
          ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : null;

        return (
          <button
            key={task.id}
            type="button"
            onClick={() => onTaskClick(task.id)}
            className={cn(
              'flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors last:border-0',
              i % 2 === 0 ? 'bg-card hover:bg-surface/60' : 'bg-surface/30 hover:bg-surface/60',
            )}
          >
            {/* Status colour strip */}
            <div className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: style.bar }} />

            {/* Title + assignee */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-dark leading-snug">
                {task.title}
              </p>
              {assigneeName && (
                <p className="mt-0.5 truncate text-[11px] text-text-placeholder">{assigneeName}</p>
              )}
            </div>

            {/* Due date */}
            {dueLabel ? (
              <span
                className={cn(
                  'shrink-0 text-[11px] font-medium',
                  overdue ? 'text-red-500' : 'text-text-muted',
                )}
              >
                {overdue && <TriangleAlert className="mr-0.5 inline h-3 w-3" />}
                {dueLabel}
              </span>
            ) : (
              <span className="shrink-0 text-[11px] text-text-placeholder">—</span>
            )}
          </button>
        );
      })}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border px-4 py-3">
        {Object.entries(STATUS_STYLE).map(([status, { bar, label }]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: bar }} />
            <span className="text-[11px] text-text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Desktop/tablet: full horizontal Gantt ───────────────────────────────────

export function TaskGanttView({
  tasks,
  onTaskClick,
}: {
  tasks: Task[];
  onTaskClick: (id: string) => void;
}) {
  const today = startOfDay(new Date());

  const { rangeStart, totalDays } = useMemo<{ rangeStart: Date; totalDays: number }>(() => {
    if (tasks.length === 0) {
      return { rangeStart: addDays(today, -7), totalDays: 45 };
    }

    const starts = tasks.map((t) => startOfDay(new Date(t.createdAt)));
    const ends = tasks.map((t) =>
      t.dueDate ? startOfDay(new Date(t.dueDate)) : addDays(startOfDay(new Date(t.createdAt)), 7),
    );

    const minStart = starts.reduce((a, b) => (a < b ? a : b));
    const maxEnd = ends.reduce((a, b) => (a > b ? a : b));

    const rangeStart = addDays(minStart, -3);
    const rangeEnd = addDays(maxEnd > today ? maxEnd : today, 10);
    const totalDays = Math.max(differenceInDays(rangeEnd, rangeStart) + 1, 30);

    return { rangeStart, totalDays };
  }, [tasks, today]);

  const timelineWidth = totalDays * DAY_PX;

  const weeks = useMemo(
    () =>
      eachWeekOfInterval(
        { start: rangeStart, end: addDays(rangeStart, totalDays - 1) },
        { weekStartsOn: 1 },
      ) as Date[],
    [rangeStart, totalDays],
  );

  const todayOffset = differenceInDays(today, rangeStart) * DAY_PX;

  function getBar(task: Task) {
    const start = startOfDay(new Date(task.createdAt));
    const end = task.dueDate ? startOfDay(new Date(task.dueDate)) : addDays(start, 7);

    const left = Math.max(0, differenceInDays(start, rangeStart)) * DAY_PX;
    const rawWidth = Math.max(1, differenceInDays(end, start)) * DAY_PX;
    const width = Math.min(rawWidth, timelineWidth - left);
    return { left, width };
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-border bg-card py-20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-text-placeholder">
          <Calendar className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-text-muted">No tasks to display on the timeline</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile + tablet: date-sorted list (no horizontal scroll) ----------- */}
      <div className="xl:hidden">
        <MobileTimelineList tasks={tasks} onTaskClick={onTaskClick} />
      </div>

      {/* Desktop (≥1280px): full horizontal Gantt -------------------------- */}
      <div className="hidden xl:block overflow-hidden rounded-card border border-border bg-card shadow-[0px_1px_4px_rgba(0,0,0,0.06)]">
        <div className="overflow-x-auto">
          <div style={{ minWidth: LEFT_COL_W + timelineWidth }}>
            {/* ── Header row ─────────────────────────────────────────────── */}
            <div className="flex border-b border-border bg-surface" style={{ height: HEADER_H }}>
              <div
                className="sticky left-0 z-20 flex shrink-0 items-center border-r border-border bg-surface px-4"
                style={{ width: LEFT_COL_W }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
                  Task
                </span>
              </div>

              <div className="relative" style={{ width: timelineWidth, height: HEADER_H }}>
                {todayOffset >= 0 && todayOffset <= timelineWidth && (
                  <div
                    className="absolute inset-y-0 z-10 w-px bg-primary/50"
                    style={{ left: todayOffset }}
                  />
                )}
                {weeks.map((week) => {
                  const offset = differenceInDays(week, rangeStart) * DAY_PX;
                  if (offset < 0) return null;
                  return (
                    <div
                      key={week.toISOString()}
                      className="absolute inset-y-0 border-l border-border/50 pl-1.5"
                      style={{ left: offset }}
                    >
                      <span className="mt-[13px] block text-[11px] font-medium text-text-muted">
                        {format(week, 'MMM d')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Task rows ─────────────────────────────────────────────── */}
            {tasks.map((task, i) => {
              const { left, width } = getBar(task);
              const style = STATUS_STYLE[task.status];
              const overdue = isOverdue(task);
              const assigneeName = task.assignedTo
                ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                : null;

              return (
                <div
                  key={task.id}
                  className={cn(
                    'flex border-b border-border/40 last:border-0',
                    i % 2 === 0 ? 'bg-card' : 'bg-surface/30',
                  )}
                  style={{ height: ROW_H }}
                >
                  <div
                    className={cn(
                      'sticky left-0 z-10 flex shrink-0 cursor-pointer flex-col justify-center border-r border-border/50 px-4 py-2 transition-colors',
                      i % 2 === 0
                        ? 'bg-card hover:bg-surface/60'
                        : 'bg-surface/30 hover:bg-surface/70',
                    )}
                    style={{ width: LEFT_COL_W }}
                    onClick={() => onTaskClick(task.id)}
                  >
                    <p className="truncate text-sm font-medium text-text-dark leading-snug">
                      {task.title}
                    </p>
                    {assigneeName && (
                      <p className="mt-0.5 truncate text-[11px] text-text-placeholder leading-tight">
                        {assigneeName}
                      </p>
                    )}
                  </div>

                  <div className="relative" style={{ width: timelineWidth }}>
                    {weeks.map((week) => {
                      const offset = differenceInDays(week, rangeStart) * DAY_PX;
                      if (offset < 0) return null;
                      return (
                        <div
                          key={week.toISOString()}
                          className="absolute inset-y-0 border-l border-border/25"
                          style={{ left: offset }}
                        />
                      );
                    })}

                    {todayOffset >= 0 && todayOffset <= timelineWidth && (
                      <div
                        className="absolute inset-y-0 w-px bg-primary/25"
                        style={{ left: todayOffset }}
                      />
                    )}

                    <div
                      className="absolute top-1/2 -translate-y-1/2 flex cursor-pointer items-center overflow-hidden rounded-full px-2.5 text-white transition-all hover:brightness-110 active:scale-[0.99]"
                      style={{
                        left,
                        width: Math.max(width, 10),
                        height: 28,
                        backgroundColor: style.bar,
                        opacity: overdue ? 0.88 : 1,
                        boxShadow: overdue
                          ? `0 0 0 2px rgba(239,68,68,0.35), 0 1px 4px ${style.bar}50`
                          : `0 1px 4px ${style.bar}50`,
                      }}
                      onClick={() => onTaskClick(task.id)}
                      title={task.title}
                    >
                      {width > 72 && (
                        <span className="truncate text-[11px] font-medium leading-none">
                          {task.title}
                        </span>
                      )}
                      {overdue && width > 44 && (
                        <TriangleAlert className="ml-1.5 h-3 w-3 shrink-0 text-yellow-200/90" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Legend ───────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border px-4 py-3">
          {Object.entries(STATUS_STYLE).map(([status, { bar, label }]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: bar }} />
              <span className="text-[11px] text-text-muted">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-px bg-primary/50" />
            <span className="text-[11px] text-text-muted">Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/60 ring-2 ring-red-400/40" />
            <span className="text-[11px] text-text-muted">Overdue</span>
          </div>
        </div>
      </div>
    </>
  );
}
