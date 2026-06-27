import { useState, useEffect, useCallback } from 'react';
import * as taskService from '@/services/task.service';
import type {
  Task,
  TaskFilters,
  CreateTaskPayload,
  UpdateTaskPayload,
  PaginationMeta,
} from '@/types';

export interface UseTasksReturn {
  tasks: Task[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTask: (payload: CreateTaskPayload) => Promise<Task>;
  updateTask: (id: string, payload: UpdateTaskPayload) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
}

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

export function useTasks(filters?: TaskFilters): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters ?? {});

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await taskService.getTasks(filters);
      setTasks(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  async function createTask(payload: CreateTaskPayload): Promise<Task> {
    const task = await taskService.createTask(payload);
    setTasks((prev) => [task, ...prev]);
    setMeta((prev) => (prev ? { ...prev, total: prev.total + 1 } : DEFAULT_META));
    return task;
  }

  async function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const updated = await taskService.updateTask(id, payload);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }

  async function deleteTask(id: string): Promise<void> {
    await taskService.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setMeta((prev) => (prev ? { ...prev, total: Math.max(0, prev.total - 1) } : null));
  }

  return { tasks, meta, loading, error, refetch: fetch, createTask, updateTask, deleteTask };
}
