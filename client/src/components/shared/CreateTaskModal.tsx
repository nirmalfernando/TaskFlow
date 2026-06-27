import { useState } from 'react';
import { X, Plus, Mic, Sparkles, Check, ArrowRight, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityBadge, type Priority } from './PriorityBadge';
import { StatusBadge, type TaskStatus } from './StatusBadge';
import type { CreateTaskPayload, TaskStatusBackend, PriorityBackend } from '@/types';

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

// ─── CreateTaskModal ──────────────────────────────────────────────────────────

export function CreateTaskModal({ open, onClose, onCreateTask }: CreateTaskModalProps) {
  const [aiState, setAiState] = useState<AiState>('idle');
  const [aiInput, setAiInput] = useState('');
  const [parsedTask, setParsedTask] = useState<ParsedTask | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('open');
  const [dueDate, setDueDate] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleParseTask = async () => {
    if (!aiInput.trim()) return;
    setAiState('parsing');
    await new Promise((r) => setTimeout(r, 1200));
    setParsedTask({
      title: 'Redesign User Profile Page',
      description:
        'Update avatar upload with drag-and-drop support, add bio section with 280-character limit, and integrate social links (Twitter, LinkedIn, GitHub). Ensure responsive layout across all breakpoints.',
      priority: 'high',
      status: 'open',
      dueDate: 'Jul 4',
    });
    setAiState('parsed');
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
        ...(dueDate ? { dueDate: new Date(dueDate).toISOString() } : {}),
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
    setAiState('idle');
    setAiInput('');
    setParsedTask(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('open');
    setDueDate('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={handleClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-[540px] rounded-[20px] border border-border bg-white shadow-[0px_24px_64px_rgba(0,0,0,0.15)]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#dbeafe]">
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
          <div className="rounded-[14px] bg-[#eff6ff] p-4">
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
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Describe your task naturally..."
                  className="h-[80px] w-full resize-none rounded-[10px] border border-[#bedbff] bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-8 items-center gap-1.5 rounded-nav border border-input bg-white px-3.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    Voice
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleParseTask()}
                    disabled={!aiInput.trim() || aiState === 'parsing'}
                    className="flex h-8 items-center gap-1.5 rounded-nav border border-[#bedbff] px-3.5 text-sm font-medium text-primary transition-colors hover:bg-primary-light disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {aiState === 'parsing' ? 'Parsing…' : 'Parse Task'}
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

                <div className="mb-3 rounded-[10px] border border-border bg-white p-3.5">
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
                    className="flex h-8 items-center gap-1.5 rounded-nav border border-input bg-white px-3.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
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
              className="h-11 w-full rounded-input border border-input bg-white px-3.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
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
              className="h-[90px] w-full resize-none rounded-input border border-input bg-white px-3.5 py-3 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Priority / Status / Due Date row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-label" htmlFor="task-priority">
                Priority
              </label>
              <div className="relative">
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="h-11 w-full appearance-none rounded-input border border-input bg-white px-3.5 pr-9 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                  className="h-11 w-full appearance-none rounded-input border border-input bg-white px-3.5 pr-9 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="testing">Testing</option>
                  <option value="done">Done</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-placeholder" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-label" htmlFor="task-due">
                Due Date
              </label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-11 w-full rounded-input border border-input bg-white px-3.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
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
