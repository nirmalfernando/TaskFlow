import { useState } from 'react';
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
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  title: string;
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
    priority: 'high',
    status: 'in-progress',
    assignee: { name: 'Sarah R' },
    dueDate: 'Jul 2',
  },
  {
    id: 'TASK-1041',
    title: 'Fix authentication bug on mobile Safari',
    priority: 'high',
    status: 'open',
    assignee: { name: 'Alex M' },
    dueDate: 'Jun 20',
    isOverdue: true,
  },
  {
    id: 'TASK-1040',
    title: 'Write REST API documentation',
    priority: 'medium',
    status: 'in-progress',
    assignee: { name: 'John D' },
    dueDate: 'Jun 30',
  },
  {
    id: 'TASK-1039',
    title: 'Set up CI/CD pipeline with GitHub Actions',
    priority: 'high',
    status: 'testing',
    assignee: { name: 'Kim L' },
    dueDate: 'Jun 22',
    isOverdue: true,
  },
  {
    id: 'TASK-1038',
    title: 'Update analytics dashboard metrics',
    priority: 'medium',
    status: 'open',
    assignee: { name: 'Sarah R' },
    dueDate: 'Jul 8',
  },
  {
    id: 'TASK-1037',
    title: 'Implement dark mode support across all pages',
    priority: 'low',
    status: 'done',
    assignee: { name: 'Alex M' },
    dueDate: 'Jun 15',
  },
  {
    id: 'TASK-1036',
    title: 'Performance audit and database query optimization',
    priority: 'medium',
    status: 'testing',
    assignee: null,
    dueDate: 'Jul 12',
  },
  {
    id: 'TASK-1035',
    title: 'Migrate user data to PostgreSQL schema v2',
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

// ─── TasksPage ────────────────────────────────────────────────────────────────

export function TasksPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [page, setPage] = useState(1);

  const filtered = TASKS.filter(
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

      {/* Table */}
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

      {/* Pagination */}
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
    </div>
  );
}
