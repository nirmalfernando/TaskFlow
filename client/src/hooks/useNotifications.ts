import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import type { AppNotification, Task } from '@/types';
import * as taskService from '@/services/task.service';
import { tokenStorage } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

const READ_KEY = 'taskflow_notifications_read';

export const NOTIF_PREFS_KEY = 'taskflow_notification_prefs';
export const NOTIF_PREFS_CHANGED_EVENT = 'taskflow:notif_prefs_changed';

export interface NotifPrefs {
  taskAssignments: boolean;
  taskComments: boolean;
  dueDateReminders: boolean;
  statusUpdates: boolean;
}

const NOTIF_DEFAULTS: NotifPrefs = {
  taskAssignments: true,
  taskComments: true,
  dueDateReminders: false,
  statusUpdates: false,
};

export function getNotifPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(NOTIF_PREFS_KEY);
    if (raw) return { ...NOTIF_DEFAULTS, ...(JSON.parse(raw) as Partial<NotifPrefs>) };
  } catch {
    // localStorage unavailable
  }
  return { ...NOTIF_DEFAULTS };
}

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    // localStorage unavailable (SSR or private mode)
    return new Set();
  }
}

function persistReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage unavailable
  }
}

function isToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function tasksToNotifications(
  tasks: Task[],
  userId: string,
  readIds: Set<string>,
  prefs: NotifPrefs,
): AppNotification[] {
  const notifications: AppNotification[] = [];

  for (const task of tasks) {
    if (task.status === 'COMPLETED') continue;

    // Assigned to me
    if (prefs.taskAssignments && task.assignedToId === userId) {
      const id = `assigned:${task.id}`;
      notifications.push({
        id,
        type: 'assigned',
        taskId: task.id,
        taskTitle: task.title,
        message: `You've been assigned to "${task.title}"`,
        read: readIds.has(id),
        createdAt: task.updatedAt,
      });
    }

    // Due today
    if (prefs.dueDateReminders && task.dueDate && isToday(task.dueDate)) {
      const id = `due_today:${task.id}`;
      notifications.push({
        id,
        type: 'due_today',
        taskId: task.id,
        taskTitle: task.title,
        message: `"${task.title}" is due today`,
        read: readIds.has(id),
        createdAt: task.dueDate,
      });
    }
  }

  // Sort: unread first, then by createdAt desc
  notifications.sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return notifications;
}

export interface UseNotificationsReturn {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  markAllRead: () => void;
  markRead: (id: string) => void;
  refetch: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds);
  const [prefs, setPrefs] = useState<NotifPrefs>(getNotifPrefs);

  // Re-read prefs on same-tab toggle and cross-tab storage changes
  useEffect(() => {
    const handler = () => setPrefs(getNotifPrefs());
    window.addEventListener(NOTIF_PREFS_CHANGED_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(NOTIF_PREFS_CHANGED_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await taskService.getTasks({ limit: 100 });
      setTasks(result.data);
    } catch {
      // swallow fetch error; loading state resets in finally
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  // SSE: reconnect whenever user/token changes, refetch on every tasks_changed event
  useEffect(() => {
    if (!user) return;
    const token = tokenStorage.getAccess();
    if (!token) return;

    const es = new EventSource(`/api/v1/events?token=${encodeURIComponent(token)}`);
    es.addEventListener('tasks_changed', () => void refetch());
    // On error (e.g. server restart) EventSource auto-reconnects — no manual handling needed

    return () => es.close();
  }, [user, refetch]);

  const notifications = useMemo(
    () => (user ? tasksToNotifications(tasks, user.id, readIds, prefs) : []),
    [user, tasks, readIds, prefs],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Pop a toast the moment a brand-new notification appears (e.g. via SSE).
  // The first render seeds the "seen" set so we don't toast the initial batch.
  const seenIdsRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (seenIdsRef.current === null) {
      seenIdsRef.current = new Set(notifications.map((n) => n.id));
      return;
    }
    const seen = seenIdsRef.current;
    for (const n of notifications) {
      if (!seen.has(n.id) && !n.read) {
        toast(n.message, { id: n.id });
      }
    }
    seenIdsRef.current = new Set(notifications.map((n) => n.id));
  }, [notifications]);

  function markRead(id: string) {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistReadIds(next);
      return next;
    });
  }

  function markAllRead() {
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const n of notifications) next.add(n.id);
      persistReadIds(next);
      return next;
    });
  }

  return { notifications, unreadCount, loading, markAllRead, markRead, refetch };
}
