import { useEffect, useState } from 'react';
import { X, ExternalLink, CalendarDays, User, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PriorityBadge, type Priority } from './PriorityBadge';
import { StatusBadge, type TaskStatus } from './StatusBadge';
import { UserAvatar } from './UserAvatar';
import { RichTextContent } from './RichTextContent';
import * as taskService from '@/services/task.service';
import type { Task, TaskStatusBackend, PriorityBackend } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── DetailRow ────────────────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <span className="w-24 shrink-0 text-xs font-medium uppercase tracking-[0.55px] text-text-muted pt-0.5">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ─── TaskDetailDrawer ─────────────────────────────────────────────────────────

interface Props {
  taskId: string | null;
  onClose: () => void;
}

export function TaskDetailDrawer({ taskId, onClose }: Props) {
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!taskId) {
      setTask(null);
      return;
    }
    setLoading(true);
    setError('');
    taskService
      .getTask(taskId)
      .then(setTask)
      .catch(() => setError('Failed to load task.'))
      .finally(() => setLoading(false));
  }, [taskId]);

  if (!taskId) return null;

  const assigneeName = task?.assignedTo
    ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
    : null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-[520px] flex-col border-l border-border bg-card shadow-[-8px_0_32px_rgba(0,0,0,0.1)]">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-4">
          {task && (
            <span className="rounded-md bg-surface px-2 py-0.5 font-mono text-[11px] text-text-placeholder">
              {task.id.slice(0, 8).toUpperCase()}
            </span>
          )}
          <h2 className="flex-1 truncate text-sm font-semibold text-text-primary">
            {task?.title ?? 'Task Details'}
          </h2>
          <button
            type="button"
            onClick={() => task && navigate(`/tasks/${task.id}`)}
            className="flex h-7 w-7 items-center justify-center rounded-nav text-text-placeholder transition-colors hover:bg-surface hover:text-text-muted"
            title="Open full page"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-nav text-text-placeholder transition-colors hover:bg-surface hover:text-text-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-text-placeholder" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-2 py-16">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <p className="text-sm text-text-muted">{error}</p>
            </div>
          )}

          {!loading && !error && task && (
            <>
              {/* Title + badges */}
              <div className="px-5 pt-5 pb-4 border-b border-border">
                <h1 className="text-base font-semibold text-text-primary leading-snug">
                  {task.title}
                </h1>
                <div className="mt-3 flex items-center gap-2">
                  <StatusBadge status={toDisplayStatus(task.status)} />
                  <PriorityBadge priority={toDisplayPriority(task.priority)} />
                </div>
              </div>

              {/* Description */}
              <div className="px-5 py-4 border-b border-border">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.55px] text-text-muted">
                  Description
                </p>
                {task.description ? (
                  <RichTextContent content={task.description} />
                ) : (
                  <p className="text-sm italic text-text-placeholder">No description.</p>
                )}
              </div>

              {/* Details */}
              <div className="px-5 py-2">
                <DetailRow label="Status">
                  <StatusBadge status={toDisplayStatus(task.status)} />
                </DetailRow>

                <DetailRow label="Priority">
                  <PriorityBadge priority={toDisplayPriority(task.priority)} />
                </DetailRow>

                <DetailRow label="Assignee">
                  {assigneeName ? (
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={assigneeName}
                        src={task.assignedTo?.avatarUrl ?? undefined}
                        size="sm"
                      />
                      <span className="text-sm text-text-secondary">{assigneeName}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-text-placeholder">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Unassigned</span>
                    </div>
                  )}
                </DetailRow>

                <DetailRow label="Due Date">
                  {task.dueDate ? (
                    <div
                      className={cn(
                        'flex items-center gap-1.5 text-sm',
                        new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
                          ? 'font-medium text-red-500'
                          : 'text-text-secondary',
                      )}
                    >
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      {formatDate(task.dueDate)}
                    </div>
                  ) : (
                    <span className="text-sm text-text-placeholder">No due date</span>
                  )}
                </DetailRow>

                <DetailRow label="Created By">
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      name={`${task.createdBy.firstName} ${task.createdBy.lastName}`}
                      src={task.createdBy.avatarUrl ?? undefined}
                      size="sm"
                    />
                    <span className="text-sm text-text-secondary">
                      {task.createdBy.firstName} {task.createdBy.lastName}
                    </span>
                  </div>
                </DetailRow>

                <DetailRow label="Created">
                  <span className="text-sm text-text-secondary">{formatDate(task.createdAt)}</span>
                </DetailRow>

                <DetailRow label="Updated">
                  <span className="text-sm text-text-secondary">{formatDate(task.updatedAt)}</span>
                </DetailRow>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {task && (
          <div className="shrink-0 border-t border-border px-5 py-3">
            <button
              type="button"
              onClick={() => navigate(`/tasks/${task.id}`)}
              className="flex w-full items-center justify-center gap-1.5 rounded-nav border border-input bg-card py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open full page
            </button>
          </div>
        )}
      </div>
    </>
  );
}
