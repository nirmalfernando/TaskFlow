import { useState, useRef, Fragment } from 'react';
import {
  Search,
  ChevronDown,
  List,
  LayoutGrid,
  Sparkles,
  Plus,
  TriangleAlert,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PriorityBadge, type Priority } from '@/components/shared/PriorityBadge';
import { StatusBadge, type TaskStatus } from '@/components/shared/StatusBadge';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { KanbanCard } from '@/components/shared/KanbanCard';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  assignee: { name: string } | null;
  dueDate: string;
  isOverdue?: boolean;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const TASKS: Task[] = [
  {
    id: 'TASK-1042',
    title: 'Redesign onboarding flow for new users',
    description:
      'Overhaul the first-run experience including welcome screen, tutorial steps, and team invitation flow.',
    priority: 'high',
    status: 'in-progress',
    assignee: { name: 'Sarah R' },
    dueDate: 'Jul 2',
  },
  {
    id: 'TASK-1041',
    title: 'Fix authentication bug on mobile Safari',
    description:
      'Users on iOS Safari 16+ are being logged out unexpectedly after background refresh events.',
    priority: 'high',
    status: 'open',
    assignee: { name: 'Alex M' },
    dueDate: 'Jun 20',
    isOverdue: true,
  },
  {
    id: 'TASK-1040',
    title: 'Write REST API documentation',
    description:
      'Document all v2 endpoints using OpenAPI 3.1, including request/response schemas and auth flows.',
    priority: 'medium',
    status: 'in-progress',
    assignee: { name: 'John D' },
    dueDate: 'Jun 30',
  },
  {
    id: 'TASK-1039',
    title: 'Set up CI/CD pipeline with GitHub Actions',
    description:
      'Automate build, test, and deploy stages for staging and production environments using reusable workflows.',
    priority: 'high',
    status: 'testing',
    assignee: { name: 'Kim L' },
    dueDate: 'Jun 22',
    isOverdue: true,
  },
  {
    id: 'TASK-1038',
    title: 'Update analytics dashboard metrics',
    description:
      'Add retention rate, DAU/MAU ratio, and funnel conversion charts to the main analytics view.',
    priority: 'medium',
    status: 'open',
    assignee: { name: 'Sarah R' },
    dueDate: 'Jul 8',
  },
  {
    id: 'TASK-1037',
    title: 'Implement dark mode support across all pages',
    description:
      'Apply CSS variables and Tailwind dark: utilities consistently to all components and pages.',
    priority: 'low',
    status: 'done',
    assignee: { name: 'Alex M' },
    dueDate: 'Jun 15',
  },
  {
    id: 'TASK-1036',
    title: 'Performance audit and database query optimization',
    description:
      'Profile slow queries, add missing indexes, and implement query result caching with Redis.',
    priority: 'medium',
    status: 'testing',
    assignee: null,
    dueDate: 'Jul 12',
  },
  {
    id: 'TASK-1035',
    title: 'Migrate user data to PostgreSQL schema v2',
    description:
      'Execute zero-downtime migration from MongoDB using the dual-write pattern with rollback support.',
    priority: 'high',
    status: 'open',
    assignee: { name: 'Kim L' },
    dueDate: 'Jun 18',
    isOverdue: true,
  },
];

const PAGE_SIZE = 8;
const TOTAL_TASKS = 42;

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterPill({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex h-[34px] items-center gap-1.5 rounded-full border border-input bg-white px-3.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
    >
      {label}
      <ChevronDown className="h-3.5 w-3.5 text-text-placeholder" />
    </button>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: 'list' | 'kanban';
  onChange: (v: 'list' | 'kanban') => void;
}) {
  return (
    <div className="flex gap-0.5 rounded-nav border border-input bg-white p-0.5">
      <button
        type="button"
        onClick={() => onChange('list')}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-[8px] transition-colors',
          view === 'list' ? 'bg-primary text-white' : 'text-text-placeholder hover:text-text-muted',
        )}
        aria-label="List view"
      >
        <List className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onChange('kanban')}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-[8px] transition-colors',
          view === 'kanban'
            ? 'bg-primary text-white'
            : 'text-text-placeholder hover:text-text-muted',
        )}
        aria-label="Kanban view"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function PaginationButton({
  children,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-nav border text-sm font-medium transition-colors',
        active
          ? 'border-transparent bg-primary text-white shadow-[0px_1px_1.5px_rgba(43,127,255,0.2)]'
          : 'border-input bg-white text-text-muted hover:bg-surface',
        disabled && 'pointer-events-none opacity-40',
      )}
    >
      {children}
    </button>
  );
}

// ─── Kanban board ────────────────────────────────────────────────────────────

const KANBAN_COLUMNS: {
  status: TaskStatus;
  label: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  {
    status: 'open',
    label: 'Open',
    color: '#3b82f6',
    badgeBg: 'rgba(59,130,246,0.09)',
    badgeText: '#3b82f6',
  },
  {
    status: 'in-progress',
    label: 'In Progress',
    color: '#8b5cf6',
    badgeBg: 'rgba(139,92,246,0.09)',
    badgeText: '#8b5cf6',
  },
  {
    status: 'testing',
    label: 'Testing',
    color: '#f59e0b',
    badgeBg: 'rgba(245,158,11,0.09)',
    badgeText: '#d97706',
  },
  {
    status: 'done',
    label: 'Done',
    color: '#10b981',
    badgeBg: 'rgba(16,185,129,0.09)',
    badgeText: '#059669',
  },
];

// A thin horizontal line that appears at the exact insertion point between cards
function DropLine({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        'relative mx-0.5 transition-all duration-150',
        active ? 'my-1 h-0.5' : 'my-0 h-0',
      )}
    >
      {active && (
        <>
          <div className="absolute inset-0 rounded-full bg-primary" />
          <div className="absolute -left-0.5 -top-[3px] h-2 w-2 rounded-full border-2 border-primary bg-white" />
        </>
      )}
    </div>
  );
}

// Empty-column drop target
function EmptyDropZone({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 rounded-[10px] border-2 border-dashed py-5 transition-all duration-200',
        isActive ? 'border-primary/50 bg-primary/5' : 'border-border/60 bg-transparent',
      )}
    >
      <div
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200',
          isActive ? 'bg-primary/10 text-primary' : 'bg-surface text-text-placeholder',
        )}
      >
        <Plus className="h-4 w-4" />
      </div>
      <span
        className={cn(
          'text-xs font-medium transition-colors duration-200',
          isActive ? 'text-primary' : 'text-text-placeholder',
        )}
      >
        Drop here
      </span>
    </div>
  );
}

function KanbanBoard({
  tasks,
  onStatusChange,
}: {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  // Which gap index within the active column the cursor is currently over
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dragEnterCounters = useRef<Partial<Record<TaskStatus, number>>>({});

  const handleDragStart = (taskId: string) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    requestAnimationFrame(() => setDraggingId(taskId));
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverColumn(null);
    setDropIndex(null);
    dragEnterCounters.current = {};
  };

  const handleDragEnter = (status: TaskStatus) => (e: React.DragEvent) => {
    e.preventDefault();
    dragEnterCounters.current[status] = (dragEnterCounters.current[status] ?? 0) + 1;
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
      setDropIndex(null);
    }
  };

  const handleDragLeave = (status: TaskStatus) => () => {
    dragEnterCounters.current[status] = (dragEnterCounters.current[status] ?? 1) - 1;
    if ((dragEnterCounters.current[status] ?? 0) <= 0) {
      dragEnterCounters.current[status] = 0;
      setDragOverColumn((prev) => (prev === status ? null : prev));
      setDropIndex(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Per-card drag-over: figure out if cursor is in the top or bottom half
  const handleCardDragOver = (e: React.DragEvent, column: TaskStatus, cardIndex: number) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const index = e.clientY < rect.top + rect.height / 2 ? cardIndex : cardIndex + 1;
    if (dragOverColumn !== column || dropIndex !== index) {
      setDragOverColumn(column);
      setDropIndex(index);
    }
  };

  const handleDrop = (status: TaskStatus) => (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) onStatusChange(taskId, status);
    setDraggingId(null);
    setDragOverColumn(null);
    setDropIndex(null);
    dragEnterCounters.current = {};
  };

  const isDragging = draggingId !== null;

  return (
    <div className="grid grid-cols-4 gap-3.5">
      {KANBAN_COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        const isDropTarget = dragOverColumn === col.status;

        return (
          <div
            key={col.status}
            onDragEnter={handleDragEnter(col.status)}
            onDragLeave={handleDragLeave(col.status)}
            onDragOver={handleDragOver}
            onDrop={handleDrop(col.status)}
            className={cn(
              'flex flex-col overflow-hidden rounded-[14px] border transition-all duration-200',
              isDropTarget
                ? 'border-primary/30 bg-primary/[0.03] shadow-[0_0_0_2px_rgba(43,127,255,0.15)]'
                : 'border-[rgba(229,231,235,0.6)] bg-[#f9fafb]',
            )}
          >
            {/* Colored top accent */}
            <div className="h-[3px] shrink-0 w-full" style={{ backgroundColor: col.color }} />

            <div className="flex flex-col flex-1 p-3">
              {/* Column header */}
              <div className="flex items-center justify-between pb-3 px-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  <span className="text-sm font-semibold text-text-label">{col.label}</span>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                  style={{ backgroundColor: col.badgeBg, color: col.badgeText }}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Cards with per-gap drop indicators */}
              <div className="flex flex-col">
                {colTasks.length === 0 && isDragging ? (
                  <EmptyDropZone isActive={isDropTarget} />
                ) : (
                  <>
                    {/* Gap before the first card */}
                    {isDragging && <DropLine active={isDropTarget && dropIndex === 0} />}

                    {colTasks.map((task, i) => (
                      <Fragment key={task.id}>
                        <div
                          onDragOver={(e) => handleCardDragOver(e, col.status, i)}
                          className="mb-2"
                        >
                          <KanbanCard
                            id={task.id}
                            title={task.title}
                            description={task.description}
                            priority={task.priority}
                            status={task.status}
                            assignee={task.assignee}
                            dueDate={task.dueDate}
                            isOverdue={task.isOverdue}
                            isDragging={draggingId === task.id}
                            onDragStart={handleDragStart(task.id)}
                            onDragEnd={handleDragEnd}
                          />
                        </div>
                        {/* Gap after this card */}
                        {isDragging && <DropLine active={isDropTarget && dropIndex === i + 1} />}
                      </Fragment>
                    ))}
                  </>
                )}
              </div>

              {/* Add card button */}
              <button
                type="button"
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-transparent px-3 py-2.5 text-xs font-medium text-text-placeholder transition-colors hover:bg-white hover:border-border hover:text-text-muted"
              >
                <Plus className="h-3.5 w-3.5" />
                Add card
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── TasksPage ────────────────────────────────────────────────────────────────

export function TasksPage() {
  const [tasks, setTasks] = useState(TASKS);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [page, setPage] = useState(1);

  const handleStatusChange = (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const filtered = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(TOTAL_TASKS / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, TOTAL_TASKS);

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.6px] text-text-primary">Tasks</h1>
        <p className="mt-1 text-sm text-text-muted">{TOTAL_TASKS} tasks across all projects</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative w-[280px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-placeholder" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="h-9 w-full rounded-input border border-input bg-white pl-9 pr-3 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <FilterPill label="Status" />
        <FilterPill label="Priority" />

        <div className="flex-1" />

        <ViewToggle view={view} onChange={setView} />

        <button
          type="button"
          className="flex h-9 items-center gap-1.5 rounded-nav border border-[#bedbff] bg-white px-4 text-sm font-medium text-primary transition-colors hover:bg-primary-light"
        >
          <Sparkles className="h-4 w-4" />
          Create with AI
        </button>

        <button
          type="button"
          className="flex h-9 items-center gap-1.5 rounded-nav bg-primary px-4 text-sm font-medium text-white shadow-[0px_1px_1.5px_rgba(43,127,255,0.2),0px_1px_1px_rgba(43,127,255,0.2)] transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Kanban board */}
      {view === 'kanban' && <KanbanBoard tasks={filtered} onStatusChange={handleStatusChange} />}

      {/* Table */}
      {view === 'list' && (
        <div className="overflow-hidden rounded-card border border-border bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.06)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="py-2.5 pl-5 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
                  Task
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
                  Priority
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
                  Status
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
                  Assignee
                </th>
                <th className="py-2.5 pl-4 pr-5 text-left text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr
                  key={task.id}
                  className="cursor-pointer border-b border-surface transition-colors last:border-0 hover:bg-surface"
                >
                  <td className="py-3.5 pl-5 pr-4">
                    <p className="font-mono text-[11px] text-text-placeholder">{task.id}</p>
                    <p className="mt-0.5 text-sm font-medium text-text-dark">{task.title}</p>
                  </td>

                  <td className="px-4 py-3.5">
                    <PriorityBadge priority={task.priority} />
                  </td>

                  <td className="px-4 py-3.5">
                    <StatusBadge status={task.status} />
                  </td>

                  <td className="px-4 py-3.5">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar name={task.assignee.name} size="sm" />
                        <span className="text-sm font-medium text-text-secondary">
                          {task.assignee.name.split(' ')[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-text-placeholder">—</span>
                    )}
                  </td>

                  <td className="py-3.5 pl-4 pr-5">
                    <div
                      className={cn(
                        'flex items-center gap-1.5 text-sm',
                        task.isOverdue ? 'font-medium text-red-500' : 'text-text-secondary',
                      )}
                    >
                      {task.isOverdue && <TriangleAlert className="h-3.5 w-3.5 flex-shrink-0" />}
                      {task.dueDate}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination (list view only) */}
      {view === 'list' && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Showing{' '}
            <span className="font-medium text-text-label">
              {start}–{end}
            </span>{' '}
            of <span className="font-medium text-text-label">{TOTAL_TASKS}</span> tasks
          </p>

          <div className="flex items-center gap-1">
            <PaginationButton disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </PaginationButton>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <PaginationButton key={n} active={n === page} onClick={() => setPage(n)}>
                {n}
              </PaginationButton>
            ))}

            <PaginationButton disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </PaginationButton>
          </div>
        </div>
      )}
    </div>
  );
}
