import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  Pencil,
  Trash2,
  User,
  AlertCircle,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityBadge, type Priority } from '@/components/shared/PriorityBadge';
import { StatusBadge, type TaskStatus } from '@/components/shared/StatusBadge';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { RichTextContent } from '@/components/shared/RichTextContent';
import * as taskService from '@/services/task.service';
import type { Task, ActivityLog, TaskStatusBackend, PriorityBackend } from '@/types';

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const ACTION_LABELS: Record<string, string> = {
  CREATED: 'created this task',
  UPDATED: 'updated this task',
  STATUS_CHANGED: 'changed status',
  ASSIGNED: 'changed assignment',
  DELETED: 'deleted this task',
};

// ─── Inline edit field ────────────────────────────────────────────────────────

function EditableTitle({ value, onSave }: { value: string; onSave: (v: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!draft.trim() || draft === value) {
      setEditing(false);
      setDraft(value);
      return;
    }
    setSaving(true);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleSave();
            if (e.key === 'Escape') {
              setEditing(false);
              setDraft(value);
            }
          }}
          className="flex-1 rounded-input border border-primary bg-card px-3 py-1.5 text-xl font-bold text-text-primary outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="flex h-8 w-8 items-center justify-center rounded-nav bg-primary text-white hover:bg-primary/90"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setDraft(value);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-nav border border-input text-text-muted hover:bg-surface"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <h1 className="text-xl font-bold text-text-primary">{value}</h1>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-placeholder hover:text-text-muted"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── TaskDetailPage ───────────────────────────────────────────────────────────

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([taskService.getTask(id), taskService.getTaskActivity(id)])
      .then(([t, logs]) => {
        setTask(t);
        setActivity(Array.isArray(logs) ? logs : []);
      })
      .catch(() => setError('Failed to load task.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSaveTitle(title: string) {
    if (!task) return;
    const updated = await taskService.updateTask(task.id, { title });
    setTask(updated);
  }

  async function handleSaveDescription(description: string) {
    if (!task) return;
    const updated = await taskService.updateTask(task.id, { description: description || null });
    setTask(updated);
    setEditingDescription(false);
  }

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!task) return;
    const updated = await taskService.updateTask(task.id, {
      status: e.target.value as TaskStatusBackend,
    });
    setTask(updated);
  }

  async function handlePriorityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!task) return;
    const updated = await taskService.updateTask(task.id, {
      priority: e.target.value as PriorityBackend,
    });
    setTask(updated);
  }

  async function handleDelete() {
    if (!task) return;
    setDeleting(true);
    try {
      await taskService.deleteTask(task.id);
      navigate('/tasks');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-text-placeholder" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center gap-3 py-24">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-text-muted">{error || 'Task not found.'}</p>
        <button
          type="button"
          onClick={() => navigate('/tasks')}
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  const assigneeName = task.assignedTo
    ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <button
        type="button"
        onClick={() => navigate('/tasks')}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tasks
      </button>

      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Main content */}
        <div className="flex flex-col gap-5">
          {/* Title */}
          <div className="rounded-card border border-border bg-card p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <EditableTitle value={task.title} onSave={handleSaveTitle} />

            <div className="mt-3">
              {editingDescription ? (
                <RichTextEditor
                  initialValue={task.description ?? ''}
                  onSave={handleSaveDescription}
                  onCancel={() => setEditingDescription(false)}
                />
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setEditingDescription(true)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingDescription(true)}
                  className={cn(
                    'group relative rounded-input min-h-[60px] cursor-text px-3 py-2 -mx-3 transition-colors hover:bg-surface',
                    !task.description && 'flex items-center',
                  )}
                >
                  {task.description ? (
                    <RichTextContent content={task.description} />
                  ) : (
                    <p className="text-sm italic text-text-placeholder">
                      Click to add a description…
                    </p>
                  )}
                  <Pencil className="absolute right-2 top-2 h-3.5 w-3.5 text-text-placeholder opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <PriorityBadge priority={toDisplayPriority(task.priority)} />
              <StatusBadge status={toDisplayStatus(task.status)} />
              {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-text-muted">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(task.dueDate)}
                </div>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-card border border-border bg-card p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <h3 className="mb-4 text-sm font-semibold text-text-primary">Activity</h3>
            {activity.length === 0 ? (
              <p className="text-sm text-text-placeholder">No activity yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {activity.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <UserAvatar
                      name={`${log.user.firstName} ${log.user.lastName}`}
                      src={log.user.avatarUrl ?? undefined}
                      size="sm"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-text-secondary">
                        <span className="font-medium text-text-primary">
                          {log.user.firstName} {log.user.lastName}
                        </span>{' '}
                        {ACTION_LABELS[log.action] ?? log.action}
                        {log.field === 'status' && log.oldValue && log.newValue && (
                          <span className="text-text-muted">
                            {' '}
                            from{' '}
                            <span className="font-medium">
                              {toDisplayStatus(log.oldValue as TaskStatusBackend)}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">
                              {toDisplayStatus(log.newValue as TaskStatusBackend)}
                            </span>
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-text-placeholder">
                        {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Details */}
          <div className="rounded-card border border-border bg-card p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <h3 className="mb-4 text-sm font-semibold text-text-primary">Details</h3>

            <div className="flex flex-col gap-4">
              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-[0.55px] text-text-muted">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={task.status}
                    onChange={(e) => void handleStatusChange(e)}
                    className="h-9 w-full appearance-none rounded-input border border-input bg-card px-3 pr-8 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_QA">In QA</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-placeholder" />
                </div>
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-[0.55px] text-text-muted">
                  Priority
                </label>
                <div className="relative">
                  <select
                    value={task.priority}
                    onChange={(e) => void handlePriorityChange(e)}
                    className="h-9 w-full appearance-none rounded-input border border-input bg-card px-3 pr-8 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-placeholder" />
                </div>
              </div>

              {/* Assignee */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-[0.55px] text-text-muted">
                  Assignee
                </label>
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
                  <div className="flex items-center gap-2 text-text-placeholder">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Unassigned</span>
                  </div>
                )}
              </div>

              {/* Due date */}
              {task.dueDate && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-[0.55px] text-text-muted">
                    Due Date
                  </label>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <CalendarDays className="h-4 w-4 text-text-muted" />
                    {formatDate(task.dueDate)}
                  </div>
                </div>
              )}

              {/* Created by */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-[0.55px] text-text-muted">
                  Created By
                </label>
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
              </div>

              {/* Dates */}
              <div className="border-t border-border pt-3">
                <p className="text-xs text-text-placeholder">
                  Created {formatDate(task.createdAt)}
                </p>
                <p className="mt-0.5 text-xs text-text-placeholder">
                  Updated {formatDate(task.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-card border border-red-200 bg-card px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50',
            )}
          >
            <Trash2 className="h-4 w-4" />
            Delete Task
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
