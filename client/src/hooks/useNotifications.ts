import { useState, useEffect, useCallback } from 'react';
import type { AppNotification, Task } from '@/types';
import * as taskService from '@/services/task.service';
import { useAuth } from '@/hooks/useAuth';

const READ_KEY = 'taskflow_notifications_read';

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
): AppNotification[] {
  const notifications: AppNotification[] = [];

  for (const task of tasks) {
    if (task.status === 'DONE') continue;

    // Assigned to me
    if (task.assignedToId === userId) {
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
    if (task.dueDate && isToday(task.dueDate)) {
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

  const refetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await taskService.getTasks({ limit: 200 });
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

  const notifications = user ? tasksToNotifications(tasks, user.id, readIds) : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

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
