import { useState, useRef } from 'react';
import { Plus, MoveHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KanbanCard, type KanbanCardData } from '@/components/shared/KanbanCard';
import type { TaskStatus } from '@/components/shared/StatusBadge';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ColumnId = 'todo' | 'in-progress' | 'in-qa' | 'completed';

export interface KanbanTask extends KanbanCardData {
  column: ColumnId;
}

export interface TaskKanbanViewProps {
  tasks: KanbanTask[];
  onTaskMove?: (taskId: string, from: ColumnId, to: ColumnId) => void;
  onAddCard?: (columnId: ColumnId) => void;
  onCardClick?: (taskId: string) => void;
}

// ─── Column config ────────────────────────────────────────────────────────────

const COLUMNS: { id: ColumnId; label: string; dot: string; badge: string }[] = [
  { id: 'todo', label: 'To Do', dot: 'bg-primary', badge: 'bg-primary-light text-primary' },
  {
    id: 'in-progress',
    label: 'In Progress',
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-600',
  },
  { id: 'in-qa', label: 'In QA', dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-600' },
  { id: 'completed', label: 'Completed', dot: 'bg-success', badge: 'bg-green-50 text-green-700' },
];

// ─── Drop zone ────────────────────────────────────────────────────────────────

function DropZone({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed py-8 transition-all',
        active
          ? 'border-primary bg-primary-light/60 opacity-100'
          : 'border-border bg-surface opacity-60',
      )}
    >
      <MoveHorizontal
        className={cn('h-5 w-5', active ? 'text-primary' : 'text-text-placeholder')}
      />
      <p className={cn('text-xs font-medium', active ? 'text-primary' : 'text-text-placeholder')}>
        Drop here
      </p>
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

interface ColumnProps {
  column: (typeof COLUMNS)[number];
  tasks: KanbanTask[];
  draggingTaskId: string | null;
  isDropTarget: boolean;
  onDragStart: (taskId: string, fromColumn: ColumnId) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onAddCard?: () => void;
  onCardClick?: (taskId: string) => void;
}

function KanbanColumn({
  column,
  tasks,
  draggingTaskId,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onAddCard,
  onCardClick,
}: ColumnProps) {
  return (
    <div
      className="flex w-[270px] flex-shrink-0 flex-col"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Column header */}
      <div className="mb-3 flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full flex-shrink-0', column.dot)} />
        <span className="text-sm font-semibold text-text-primary">{column.label}</span>
        <span
          className={cn('ml-auto rounded-full px-2 py-0.5 text-xs font-semibold', column.badge)}
        >
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-1 flex-col gap-3">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            {...task}
            isDragging={task.id === draggingTaskId}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              onDragStart(task.id, column.id);
            }}
            onDragEnd={onDragEnd}
            onClick={() => onCardClick?.(task.id)}
          />
        ))}

        {/* Drop zone — show when dragging into a different column */}
        {(isDropTarget || tasks.length === 0) && <DropZone active={isDropTarget} />}
      </div>

      {/* Add card */}
      <button
        type="button"
        onClick={onAddCard}
        className="mt-3 flex items-center gap-1.5 rounded-nav px-3 py-2 text-sm font-medium text-text-placeholder hover:bg-surface hover:text-text-muted transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add card
      </button>
    </div>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────

export function TaskKanbanView({
  tasks: initialTasks,
  onTaskMove,
  onAddCard,
  onCardClick,
}: TaskKanbanViewProps) {
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const [dragging, setDragging] = useState<{ taskId: string; fromColumn: ColumnId } | null>(null);
  const [dropTarget, setDropTarget] = useState<ColumnId | null>(null);
  const dragLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleDragStart(taskId: string, fromColumn: ColumnId) {
    setDragging({ taskId, fromColumn });
  }

  function handleDragEnd() {
    setDragging(null);
    setDropTarget(null);
  }

  function handleDragOver(e: React.DragEvent, columnId: ColumnId) {
    e.preventDefault();
    if (dragLeaveTimer.current) clearTimeout(dragLeaveTimer.current);
    setDropTarget(columnId);
  }

  function handleDragLeave() {
    // Debounce to avoid flickering when moving between children
    dragLeaveTimer.current = setTimeout(() => setDropTarget(null), 80);
  }

  function handleDrop(e: React.DragEvent, toColumn: ColumnId) {
    e.preventDefault();
    if (!dragging || dragging.fromColumn === toColumn) {
      handleDragEnd();
      return;
    }

    const toStatus: TaskStatus =
      toColumn === 'in-progress'
        ? 'in-progress'
        : toColumn === 'in-qa'
          ? 'in-qa'
          : toColumn === 'completed'
            ? 'completed'
            : 'todo';

    setTasks((prev) =>
      prev.map((t) =>
        t.id === dragging.taskId ? { ...t, column: toColumn, status: toStatus } : t,
      ),
    );

    onTaskMove?.(dragging.taskId, dragging.fromColumn, toColumn);
    handleDragEnd();
  }

  return (
    <div className="flex gap-5 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.column === col.id);
        const isDraggingIntoThis =
          dropTarget === col.id && dragging !== null && dragging.fromColumn !== col.id;

        return (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={colTasks}
            draggingTaskId={dragging?.taskId ?? null}
            isDropTarget={isDraggingIntoThis}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            onAddCard={() => onAddCard?.(col.id)}
            onCardClick={onCardClick}
          />
        );
      })}
    </div>
  );
}
