import { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Mic,
  MicOff,
  Sparkles,
  Check,
  ArrowRight,
  Loader2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { PriorityBadge, type Priority } from './PriorityBadge';
import { StatusBadge, type TaskStatus } from './StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import * as userService from '@/services/user.service';
import * as aiService from '@/services/ai.service';
import type { CreateTaskPayload, TaskStatusBackend, PriorityBackend, TaskUser } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type AiState = 'idle' | 'parsing' | 'parsed';

interface ParsedTask {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
}

export interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onCreateTask?: (payload: CreateTaskPayload) => Promise<unknown>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toBackendStatus(s: TaskStatus): TaskStatusBackend {
  const map: Record<TaskStatus, TaskStatusBackend> = {
    open: 'OPEN',
    'in-progress': 'IN_PROGRESS',
    testing: 'TESTING',
    done: 'DONE',
  };
  return map[s];
}

function toBackendPriority(p: Priority): PriorityBackend {
  const map: Record<Priority, PriorityBackend> = {
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
  };
  return map[p];
}

// ─── DatePickerPopover ────────────────────────────────────────────────────────

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

function DatePickerPopover({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(value ?? new Date());
  const [pending, setPending] = useState<Date | null>(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function handleOpen() {
    setPending(value);
    setViewMonth(value ?? new Date());
    setOpen(true);
  }

  function handleApply() {
    onChange(pending);
    setOpen(false);
  }

  function handleCancel() {
    setPending(value);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          'flex h-11 w-full items-center gap-2 rounded-input border bg-card px-3.5 text-sm outline-none transition-colors',
          open
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-input text-text-primary hover:border-primary/50',
          !value && 'text-text-placeholder',
        )}
      >
        <Calendar className="h-4 w-4 flex-shrink-0 text-text-placeholder" />
        <span className="flex-1 text-left">
          {value ? format(value, 'MMM d, yyyy') : 'Pick a date'}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="text-text-placeholder hover:text-text-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </button>

      {open && (
        <div className="absolute left-0 bottom-[calc(100%+6px)] z-50 w-[280px] rounded-[14px] border border-border bg-card shadow-[0px_8px_24px_rgba(0,0,0,0.12)]">
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-nav text-text-muted transition-colors hover:bg-surface"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-primary">
              {format(viewMonth, 'MMMM yyyy')}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-nav text-text-muted transition-colors hover:bg-surface"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 px-3 pb-1">
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-[11px] font-medium text-text-placeholder"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-0.5 px-3 pb-3">
            {days.map((day) => {
              const inMonth = isSameMonth(day, viewMonth);
              const selected = pending ? isSameDay(day, pending) : false;
              const todayDay = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setPending(day)}
                  className={cn(
                    'flex h-8 w-full items-center justify-center rounded-nav text-sm transition-colors',
                    selected && 'bg-primary text-white font-semibold',
                    !selected && todayDay && inMonth && 'text-primary font-semibold',
                    !selected && inMonth && !todayDay && 'text-text-primary hover:bg-primary-light',
                    !selected && !inMonth && 'text-text-placeholder hover:bg-surface',
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
            <button
              type="button"
              onClick={handleCancel}
              className="h-8 rounded-nav border border-input px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="h-8 rounded-nav bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AssigneeSelect ───────────────────────────────────────────────────────────

interface AssigneeSelectProps {
  users: TaskUser[];
  value: string | null;
  onChange: (id: string | null) => void;
  currentUserId: string;
  loading: boolean;
}

function AssigneeSelect({ users, value, onChange, currentUserId, loading }: AssigneeSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = users.find((u) => u.id === value) ?? null;

  function getInitials(u: TaskUser) {
    return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  }

  function getDisplayLabel(u: TaskUser) {
    return u.id === currentUserId
      ? `${u.firstName} ${u.lastName} (You)`
      : `${u.firstName} ${u.lastName}`;
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-11 w-full items-center gap-2 rounded-input border bg-card px-3.5 text-sm outline-none transition-colors',
          open
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-input text-text-primary hover:border-primary/50',
          !selected && 'text-text-placeholder',
        )}
      >
        {selected ? (
          selected.avatarUrl ? (
            <img
              src={selected.avatarUrl}
              alt=""
              className="h-5 w-5 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-light text-[10px] font-semibold text-primary">
              {getInitials(selected)}
            </div>
          )
        ) : (
          <User className="h-4 w-4 flex-shrink-0 text-text-placeholder" />
        )}
        <span className="flex-1 truncate text-left">
          {loading ? 'Loading…' : selected ? getDisplayLabel(selected) : 'Unassigned'}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 flex-shrink-0 text-text-placeholder transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 bottom-[calc(100%+6px)] z-50 w-full rounded-[12px] border border-border bg-card py-1.5 shadow-[0px_8px_24px_rgba(0,0,0,0.12)]">
          {/* Unassigned option */}
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className={cn(
              'flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition-colors hover:bg-surface',
              !value && 'bg-primary-light',
            )}
          >
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-dashed border-input">
              <User className="h-3.5 w-3.5 text-text-placeholder" />
            </div>
            <span className="text-text-muted">Unassigned</span>
            {!value && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
          </button>

          {users.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                onChange(u.id);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition-colors hover:bg-surface',
                value === u.id && 'bg-primary-light',
              )}
            >
              {u.avatarUrl ? (
                <img
                  src={u.avatarUrl}
                  alt=""
                  className="h-6 w-6 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-light text-[10px] font-semibold text-primary">
                  {getInitials(u)}
                </div>
              )}
              <span className="truncate text-text-primary">{getDisplayLabel(u)}</span>
              {value === u.id && (
                <Check className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CreateTaskModal ──────────────────────────────────────────────────────────

export function CreateTaskModal({ open, onClose, onCreateTask }: CreateTaskModalProps) {
  const { user: currentUser } = useAuth();

  const [aiState, setAiState] = useState<AiState>('idle');
  const [aiInput, setAiInput] = useState('');
  const [parsedTask, setParsedTask] = useState<ParsedTask | null>(null);
  const [aiError, setAiError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('open');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);

  const [users, setUsers] = useState<TaskUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {
    voiceState,
    startRecording,
    stopRecording,
    cancel: cancelRecording,
  } = useVoiceInput({
    onTranscript: (text) => {
      setAiInput(text);
      setAiError('');
    },
    onError: (msg) => setAiError(msg),
  });

  const isVoiceActive = voiceState === 'recording' || voiceState === 'processing';

  useEffect(() => {
    if (!open) return;
    setUsersLoading(true);
    userService
      .getAssignableUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setUsersLoading(false));
  }, [open]);

  if (!open) return null;

  const handleParseTask = async () => {
    if (!aiInput.trim()) return;
    setAiState('parsing');
    setAiError('');
    try {
      const result = await aiService.parseTaskFromText(aiInput.trim());
      setParsedTask({
        title: result.title,
        description: result.description,
        priority: result.priority,
        status: result.status,
        dueDate: result.dueDate
          ? new Date(result.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '',
      });
      setAiState('parsed');
    } catch {
      setAiError('Failed to parse task. Please try again.');
      setAiState('idle');
    }
  };

  const handleUseTask = () => {
    if (parsedTask) {
      setTitle(parsedTask.title);
      setDescription(parsedTask.description);
      setPriority(parsedTask.priority);
      setStatus(parsedTask.status);
    }
  };

  const handleTryAgain = () => {
    setAiState('idle');
    setAiInput('');
    setParsedTask(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const payload: CreateTaskPayload = {
        title: title.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        status: toBackendStatus(status),
        priority: toBackendPriority(priority),
        ...(dueDate ? { dueDate: dueDate.toISOString() } : {}),
        ...(assigneeId ? { assignedToId: assigneeId } : {}),
      };
      await onCreateTask?.(payload);
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    cancelRecording();
    setAiState('idle');
    setAiInput('');
    setParsedTask(null);
    setAiError('');
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('open');
    setDueDate(null);
    setAssigneeId(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={handleClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-[540px] rounded-[20px] border border-border bg-card shadow-[0px_24px_64px_rgba(0,0,0,0.15)]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary-light">
            <Plus className="h-[18px] w-[18px] text-primary" />
          </div>
          <h2 className="flex-1 text-base font-semibold text-text-primary">Create New Task</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-text-placeholder transition-colors hover:text-text-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* AI Task Assistant */}
        <div className="px-6 pt-5">
          <div className="rounded-[14px] bg-primary-light p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-text-primary">AI Task Assistant</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-2.5 py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-green-600">Voice Enabled</span>
              </div>
            </div>

            {aiState !== 'parsed' && (
              <>
                <textarea
                  value={voiceState === 'processing' ? '' : aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={
                    voiceState === 'recording'
                      ? 'Listening…'
                      : voiceState === 'processing'
                        ? 'Transcribing…'
                        : 'Describe your task naturally…'
                  }
                  disabled={isVoiceActive}
                  className="h-[80px] w-full resize-none rounded-[10px] border border-input bg-card px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
                {aiError && <p className="mt-1.5 text-xs text-red-500">{aiError}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (voiceState === 'recording') {
                        stopRecording();
                      } else if (voiceState === 'idle' || voiceState === 'error') {
                        void startRecording();
                      }
                    }}
                    disabled={voiceState === 'processing'}
                    className={cn(
                      'flex h-8 items-center gap-1.5 rounded-nav border px-3.5 text-sm font-medium transition-colors disabled:opacity-50',
                      voiceState === 'recording'
                        ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
                        : 'border-input bg-card text-text-secondary hover:bg-surface',
                    )}
                  >
                    {voiceState === 'recording' ? (
                      <>
                        <span className="relative flex h-3.5 w-3.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                          <MicOff className="relative h-3.5 w-3.5" />
                        </span>
                        Stop
                      </>
                    ) : voiceState === 'processing' ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Transcribing…
                      </>
                    ) : (
                      <>
                        <Mic className="h-3.5 w-3.5" />
                        Voice
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleParseTask()}
                    disabled={!aiInput.trim() || aiState === 'parsing' || isVoiceActive}
                    className="flex h-8 items-center gap-1.5 rounded-nav border border-input px-3.5 text-sm font-medium text-primary transition-colors hover:bg-primary-light disabled:opacity-50"
                  >
                    {aiState === 'parsing' ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Parsing…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Parse Task
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {aiState === 'parsed' && parsedTask && (
              <>
                <div className="mb-3 flex items-center justify-between rounded-[10px] bg-[#dcfce7] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-700">
                      Task parsed successfully
                    </span>
                  </div>
                  <Sparkles className="h-3.5 w-3.5 text-green-500" />
                </div>

                <div className="mb-3 rounded-[10px] border border-border bg-card p-3.5">
                  <p className="text-sm font-semibold text-text-primary">{parsedTask.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-placeholder">
                    {parsedTask.description}
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <PriorityBadge priority={parsedTask.priority} />
                    <StatusBadge status={parsedTask.status} />
                    <span className="ml-auto text-xs text-text-placeholder">
                      {parsedTask.dueDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="flex h-8 items-center gap-1.5 rounded-nav border border-input bg-card px-3.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={handleUseTask}
                    className="flex h-8 items-center gap-1.5 rounded-nav bg-primary px-3.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                  >
                    Use This Task
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <p className="mt-3 text-center text-xs text-text-placeholder">
                  or fill in manually
                </p>
              </>
            )}
          </div>
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-4 px-6 pt-5">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-label" htmlFor="task-title">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className="h-11 w-full rounded-input border border-input bg-card px-3.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-label" htmlFor="task-description">
              Description
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="h-[90px] w-full resize-none rounded-input border border-input bg-card px-3.5 py-3 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Priority / Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-label" htmlFor="task-priority">
                Priority
              </label>
              <div className="relative">
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="h-11 w-full appearance-none rounded-input border border-input bg-card px-3.5 pr-9 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-placeholder" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-label" htmlFor="task-status">
                Status
              </label>
              <div className="relative">
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="h-11 w-full appearance-none rounded-input border border-input bg-card px-3.5 pr-9 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="testing">Testing</option>
                  <option value="done">Done</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-placeholder" />
              </div>
            </div>
          </div>

          {/* Assignee / Due Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-label">Assignee</label>
              <AssigneeSelect
                users={users}
                value={assigneeId}
                onChange={setAssigneeId}
                currentUserId={currentUser?.id ?? ''}
                loading={usersLoading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-label">Due Date</label>
              <DatePickerPopover value={dueDate} onChange={setDueDate} />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="h-9 rounded-nav border border-input px-5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={saving || !title.trim()}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-nav px-5 text-sm font-medium text-white shadow-[0px_1px_1.5px_rgba(43,127,255,0.2)] transition-colors',
              saving || !title.trim()
                ? 'bg-primary/60 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90',
            )}
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Create Task
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
