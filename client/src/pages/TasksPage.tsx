import { useState, Fragment, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  List,
  LayoutGrid,
  GanttChart,
  Sparkles,
  Plus,
  TriangleAlert,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { PriorityBadge, type Priority } from '@/components/shared/PriorityBadge';
import { StatusBadge, type TaskStatus } from '@/components/shared/StatusBadge';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { KanbanCard } from '@/components/shared/KanbanCard';
import { CreateTaskModal } from '@/components/shared/CreateTaskModal';
import { TaskDetailDrawer } from '@/components/shared/TaskDetailDrawer';
import { cn } from '@/lib/utils';
import { useTasks } from '@/hooks/useTasks';
import type { Task, TaskStatusBackend, PriorityBackend, UpdateTaskPayload } from '@/types';
import { TaskGanttView } from '@/components/features/tasks/TaskGanttView';

// ─── Enum mappers ─────────────────────────────────────────────────────────────

function toDisplayStatus(s: TaskStatusBackend): TaskStatus {
  const map: Record<TaskStatusBackend, TaskStatus> = {
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    IN_QA: 'in-qa',
    COMPLETED: 'completed',
  };
  return map[s];
}

function toDisplayPriority(p: PriorityBackend): Priority {
  const map: Record<PriorityBackend, Priority> = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'high',
  };
  return map[p];
}

function formatDueDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(iso: string | null | undefined, status: TaskStatusBackend): boolean {
  if (!iso || status === 'COMPLETED') return false;
  return new Date(iso) < new Date();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const STATUS_OPTIONS: { label: string; value: TaskStatusBackend | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'To Do', value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'In QA', value: 'IN_QA' },
  { label: 'Completed', value: 'COMPLETED' },
];

const PRIORITY_OPTIONS: { label: string; value: PriorityBackend | '' }[] = [
  { label: 'All Priorities', value: '' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Critical', value: 'CRITICAL' },
];

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | '';
  options: { label: string; value: T | '' }[];
  onChange: (v: T | '') => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T | '')}
        className="h-[34px] appearance-none rounded-full border border-input bg-card pl-3.5 pr-8 text-sm font-medium text-text-secondary transition-colors hover:bg-surface focus:outline-none focus:border-primary"
      >
        {value === '' && <option value="">{label}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-placeholder" />
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: 'list' | 'kanban' | 'gantt';
  onChange: (v: 'list' | 'kanban' | 'gantt') => void;
}) {
  return (
    <div className="flex gap-0.5 rounded-nav border border-input bg-card p-0.5">
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
      <button
        type="button"
        onClick={() => onChange('gantt')}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-[8px] transition-colors',
          view === 'gantt'
            ? 'bg-primary text-white'
            : 'text-text-placeholder hover:text-text-muted',
        )}
        aria-label="Gantt view"
      >
        <GanttChart className="h-3.5 w-3.5" />
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
          : 'border-input bg-card text-text-muted hover:bg-surface',
        disabled && 'pointer-events-none opacity-40',
      )}
    >
      {children}
    </button>
  );
}

// ─── Kanban board ─────────────────────────────────────────────────────────────

const KANBAN_COLUMNS: {
  status: TaskStatus;
  backendStatus: TaskStatusBackend;
  label: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  {
    status: 'todo',
    backendStatus: 'TODO',
    label: 'To Do',
    color: '#3b82f6',
    badgeBg: 'rgba(59,130,246,0.09)',
    badgeText: '#3b82f6',
  },
  {
    status: 'in-progress',
    backendStatus: 'IN_PROGRESS',
    label: 'In Progress',
    color: '#8b5cf6',
    badgeBg: 'rgba(139,92,246,0.09)',
    badgeText: '#8b5cf6',
  },
  {
    status: 'in-qa',
    backendStatus: 'IN_QA',
    label: 'In QA',
    color: '#f59e0b',
    badgeBg: 'rgba(245,158,11,0.09)',
    badgeText: '#d97706',
  },
  {
    status: 'completed',
    backendStatus: 'COMPLETED',
    label: 'Completed',
    color: '#10b981',
    badgeBg: 'rgba(16,185,129,0.09)',
    badgeText: '#059669',
  },
];

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
          <div className="absolute -left-0.5 -top-[3px] h-2 w-2 rounded-full border-2 border-primary bg-card" />
        </>
      )}
    </div>
  );
}

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
  onAddCard,
  onCardClick,
}: {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatusBackend) => void;
  onAddCard: () => void;
  onCardClick: (id: string) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const didDragRef = { current: false };
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatusBackend | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dragEnterCounters = useState<Partial<Record<TaskStatusBackend, number>>>(() => ({}))[0];

  const handleDragStart = (taskId: string) => (e: React.DragEvent) => {
    didDragRef.current = true;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    requestAnimationFrame(() => setDraggingId(taskId));
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setTimeout(() => {
      didDragRef.current = false;
    }, 0);
    setDragOverColumn(null);
    setDropIndex(null);
    Object.keys(dragEnterCounters).forEach((k) => {
      delete (dragEnterCounters as Record<string, number>)[k];
    });
  };

  const handleDragEnter = (status: TaskStatusBackend) => (e: React.DragEvent) => {
    e.preventDefault();
    (dragEnterCounters as Record<string, number>)[status] =
      ((dragEnterCounters as Record<string, number>)[status] ?? 0) + 1;
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
      setDropIndex(null);
    }
  };

  const handleDragLeave = (status: TaskStatusBackend) => () => {
    (dragEnterCounters as Record<string, number>)[status] =
      ((dragEnterCounters as Record<string, number>)[status] ?? 1) - 1;
    if (((dragEnterCounters as Record<string, number>)[status] ?? 0) <= 0) {
      (dragEnterCounters as Record<string, number>)[status] = 0;
      setDragOverColumn((prev) => (prev === status ? null : prev));
      setDropIndex(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCardDragOver = (e: React.DragEvent, column: TaskStatusBackend, cardIndex: number) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const index = e.clientY < rect.top + rect.height / 2 ? cardIndex : cardIndex + 1;
    if (dragOverColumn !== column || dropIndex !== index) {
      setDragOverColumn(column);
      setDropIndex(index);
    }
  };

  const handleDrop = (status: TaskStatusBackend) => (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) onStatusChange(taskId, status);
    setDraggingId(null);
    setDragOverColumn(null);
    setDropIndex(null);
  };

  const isDragging = draggingId !== null;

  return (
    <div className="grid grid-cols-4 gap-3.5">
      {KANBAN_COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.backendStatus);
        const isDropTarget = dragOverColumn === col.backendStatus;

        return (
          <div
            key={col.status}
            onDragEnter={handleDragEnter(col.backendStatus)}
            onDragLeave={handleDragLeave(col.backendStatus)}
            onDragOver={handleDragOver}
            onDrop={handleDrop(col.backendStatus)}
            className={cn(
              'flex flex-col overflow-hidden rounded-[14px] border transition-all duration-200',
              isDropTarget
                ? 'border-primary/30 bg-primary/[0.03] shadow-[0_0_0_2px_rgba(43,127,255,0.15)]'
                : 'border-border bg-surface',
            )}
          >
            <div className="h-[3px] shrink-0 w-full" style={{ backgroundColor: col.color }} />

            <div className="flex flex-col flex-1 p-3">
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

              <div className="flex flex-col">
                {colTasks.length === 0 && isDragging ? (
                  <EmptyDropZone isActive={isDropTarget} />
                ) : (
                  <>
                    {isDragging && <DropLine active={isDropTarget && dropIndex === 0} />}
                    {colTasks.map((task, i) => {
                      const due = formatDueDate(task.dueDate);
                      const overdue = isOverdue(task.dueDate, task.status);
                      const assigneeName = task.assignedTo
                        ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                        : null;
                      return (
                        <Fragment key={task.id}>
                          <div
                            onDragOver={(e) => handleCardDragOver(e, col.backendStatus, i)}
                            className="mb-2"
                          >
                            <KanbanCard
                              id={task.id}
                              title={task.title}
                              description={task.description ?? undefined}
                              priority={toDisplayPriority(task.priority)}
                              status={col.status}
                              assignee={assigneeName ? { name: assigneeName } : null}
                              dueDate={due ?? ''}
                              isOverdue={overdue}
                              isDragging={draggingId === task.id}
                              onDragStart={handleDragStart(task.id)}
                              onDragEnd={handleDragEnd}
                              onClick={() => {
                                if (!didDragRef.current) onCardClick(task.id);
                              }}
                            />
                          </div>
                          {isDragging && <DropLine active={isDropTarget && dropIndex === i + 1} />}
                        </Fragment>
                      );
                    })}
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={onAddCard}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-transparent px-3 py-2.5 text-xs font-medium text-text-placeholder transition-colors hover:bg-card hover:border-border hover:text-text-muted"
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

// ─── Mobile Kanban View ───────────────────────────────────────────────────────

function MobileKanbanView({
  tasks,
  onAddCard,
  onCardClick,
}: {
  tasks: Task[];
  onAddCard: () => void;
  onCardClick: (id: string) => void;
}) {
  const [activeStatus, setActiveStatus] = useState<TaskStatusBackend>('TODO');

  const colTasks = tasks.filter((t) => t.status === activeStatus);
  const activeCol = KANBAN_COLUMNS.find((c) => c.backendStatus === activeStatus)!;

  return (
    <div className="flex flex-col gap-3">
      {/* Status tab bar */}
      <div className="grid grid-cols-4 gap-1.5">
        {KANBAN_COLUMNS.map((col) => {
          const count = tasks.filter((t) => t.status === col.backendStatus).length;
          const active = activeStatus === col.backendStatus;
          return (
            <button
              key={col.backendStatus}
              type="button"
              onClick={() => setActiveStatus(col.backendStatus)}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-[10px] border px-2 py-2 text-[11px] font-semibold transition-colors',
                active
                  ? 'border-transparent text-white'
                  : 'border-border bg-card text-text-muted hover:bg-surface',
              )}
              style={active ? { backgroundColor: col.color, borderColor: col.color } : undefined}
            >
              <span className="truncate w-full text-center leading-tight">{col.label}</span>
              <span
                className={cn(
                  'inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold',
                  active ? 'bg-white/25 text-white' : 'bg-border/60 text-text-placeholder',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Column header strip */}
      <div
        className="flex items-center gap-2 rounded-[10px] px-3 py-2"
        style={{ backgroundColor: `${activeCol.color}12` }}
      >
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: activeCol.color }}
        />
        <span className="text-sm font-semibold" style={{ color: activeCol.color }}>
          {activeCol.label}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-bold ml-auto"
          style={{ backgroundColor: activeCol.badgeBg, color: activeCol.badgeText }}
        >
          {colTasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {colTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-border/60 py-10">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-text-placeholder">
              <Plus className="h-4 w-4" />
            </div>
            <p className="text-xs text-text-placeholder">No tasks here yet</p>
          </div>
        ) : (
          colTasks.map((task) => {
            const due = formatDueDate(task.dueDate);
            const overdue = isOverdue(task.dueDate, task.status);
            const assigneeName = task.assignedTo
              ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
              : null;
            return (
              <KanbanCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description ?? undefined}
                priority={toDisplayPriority(task.priority)}
                status={activeCol.status}
                assignee={assigneeName ? { name: assigneeName } : null}
                dueDate={due ?? ''}
                isOverdue={overdue}
                isDragging={false}
                onDragStart={() => undefined}
                onDragEnd={() => undefined}
                onClick={() => onCardClick(task.id)}
              />
            );
          })
        )}
      </div>

      {/* Add card */}
      <button
        type="button"
        onClick={onAddCard}
        className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-border px-3 py-3 text-xs font-medium text-text-placeholder transition-colors hover:bg-surface hover:text-text-muted hover:border-border/80"
      >
        <Plus className="h-3.5 w-3.5" />
        Add card to {activeCol.label}
      </button>
    </div>
  );
}

// ─── TasksPage ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

export function TasksPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'list' | 'kanban' | 'gantt'>('kanban');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusBackend | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityBackend | ''>('');
  const [showModal, setShowModal] = useState(() => searchParams.get('new') === '1');
  const [modalAiFocus, setModalAiFocus] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowModal(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Simple debounce for search
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchTimer) clearTimeout(searchTimer);
    const t = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
    setSearchTimer(t);
  }

  const isKanban = view === 'kanban';
  const isGantt = view === 'gantt';
  const filters = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(priorityFilter ? { priority: priorityFilter } : {}),
    page: isKanban || isGantt ? 1 : page,
    limit: isKanban || isGantt ? 100 : PAGE_SIZE,
  };

  const { tasks, meta, loading, error, createTask, updateTask } = useTasks(filters);

  async function handleStatusChange(id: string, status: TaskStatusBackend) {
    const payload: UpdateTaskPayload = { status };
    await updateTask(id, payload);
  }

  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  const pageNumbers = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.6px] text-text-primary">Tasks</h1>
        <p className="mt-1 text-sm text-text-muted">
          {loading ? 'Loading…' : `${total} task${total === 1 ? '' : 's'} found`}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-placeholder" />
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="h-9 w-full rounded-input border border-input bg-card pl-9 pr-3 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <FilterSelect
          label="Status"
          value={statusFilter}
          options={STATUS_OPTIONS}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        />

        <FilterSelect
          label="Priority"
          value={priorityFilter}
          options={PRIORITY_OPTIONS}
          onChange={(v) => {
            setPriorityFilter(v);
            setPage(1);
          }}
        />

        <div className="flex-1" />

        <ViewToggle view={view} onChange={setView} />

        <button
          type="button"
          onClick={() => {
            setModalAiFocus(true);
            setShowModal(true);
          }}
          className="hidden sm:flex h-9 items-center gap-1.5 rounded-nav border border-[#bedbff] bg-card px-4 text-sm font-medium text-primary transition-colors hover:bg-primary-light"
        >
          <Sparkles className="h-4 w-4" />
          Create with AI
        </button>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex h-9 items-center gap-1.5 rounded-nav bg-primary px-4 text-sm font-medium text-white shadow-[0px_1px_1.5px_rgba(43,127,255,0.2),0px_1px_1px_rgba(43,127,255,0.2)] transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Task detail drawer */}
      <TaskDetailDrawer taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />

      {/* Create Task modal */}
      <CreateTaskModal
        open={showModal}
        autoFocusAi={modalAiFocus}
        onClose={() => {
          setShowModal(false);
          setModalAiFocus(false);
        }}
        onCreateTask={createTask}
      />

      {/* Error state */}
      {error && (
        <div className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-text-placeholder" />
        </div>
      )}

      {/* Kanban board — mobile: tab view, desktop: full board */}
      {!loading && view === 'kanban' && (
        <>
          {/* Mobile/tablet: tab-based single column */}
          <div className="xl:hidden">
            <MobileKanbanView
              tasks={tasks}
              onAddCard={() => setShowModal(true)}
              onCardClick={(id) => setSelectedTaskId(id)}
            />
          </div>
          {/* Desktop: 4-column drag-drop board */}
          <div className="hidden xl:block">
            <KanbanBoard
              tasks={tasks}
              onStatusChange={(id, status) => void handleStatusChange(id, status)}
              onAddCard={() => setShowModal(true)}
              onCardClick={(id) => setSelectedTaskId(id)}
            />
          </div>
        </>
      )}

      {/* Gantt chart */}
      {!loading && view === 'gantt' && (
        <TaskGanttView tasks={tasks} onTaskClick={(id) => setSelectedTaskId(id)} />
      )}

      {/* Table */}
      {!loading && view === 'list' && (
        <div className="overflow-hidden rounded-card border border-border bg-card shadow-[0px_1px_4px_rgba(0,0,0,0.06)]">
          {tasks.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-text-muted">No tasks found.</p>
            </div>
          ) : (
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
                  <th className="hidden sm:table-cell px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
                    Assignee
                  </th>
                  <th className="hidden sm:table-cell py-2.5 pl-4 pr-5 text-left text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const due = formatDueDate(task.dueDate);
                  const overdue = isOverdue(task.dueDate, task.status);
                  const assigneeName = task.assignedTo
                    ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                    : null;

                  return (
                    <tr
                      key={task.id}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="cursor-pointer border-b border-surface transition-colors last:border-0 hover:bg-surface"
                    >
                      <td className="py-3.5 pl-5 pr-4">
                        <p className="font-mono text-[11px] text-text-placeholder">
                          {task.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-text-dark">{task.title}</p>
                      </td>

                      <td className="px-4 py-3.5">
                        <PriorityBadge priority={toDisplayPriority(task.priority)} />
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge status={toDisplayStatus(task.status)} />
                      </td>

                      <td className="hidden sm:table-cell px-4 py-3.5">
                        {assigneeName ? (
                          <div className="flex items-center gap-2">
                            <UserAvatar
                              name={assigneeName}
                              src={task.assignedTo?.avatarUrl ?? undefined}
                              size="sm"
                            />
                            <span className="text-sm font-medium text-text-secondary">
                              {task.assignedTo?.firstName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-text-placeholder">—</span>
                        )}
                      </td>

                      <td className="hidden sm:table-cell py-3.5 pl-4 pr-5">
                        {due ? (
                          <div
                            className={cn(
                              'flex items-center gap-1.5 text-sm',
                              overdue ? 'font-medium text-red-500' : 'text-text-secondary',
                            )}
                          >
                            {overdue && <TriangleAlert className="h-3.5 w-3.5 flex-shrink-0" />}
                            {due}
                          </div>
                        ) : (
                          <span className="text-sm text-text-placeholder">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Pagination — list view only */}
      {!loading && view === 'list' && total > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm text-text-muted">
            Showing{' '}
            <span className="font-medium text-text-label">
              {start}–{end}
            </span>{' '}
            of <span className="font-medium text-text-label">{total}</span> tasks
          </p>

          <div className="flex items-center gap-1">
            <PaginationButton disabled={!meta?.hasPrev} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </PaginationButton>

            {pageNumbers.map((n) => (
              <PaginationButton key={n} active={n === page} onClick={() => setPage(n)}>
                {n}
              </PaginationButton>
            ))}

            <PaginationButton disabled={!meta?.hasNext} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </PaginationButton>
          </div>
        </div>
      )}
    </div>
  );
}
