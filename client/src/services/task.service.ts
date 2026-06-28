import { api } from './api';
import type {
  Task,
  ActivityLog,
  TaskFilters,
  CreateTaskPayload,
  UpdateTaskPayload,
  PaginationMeta,
} from '@/types';

export interface PaginatedTasks {
  data: Task[];
  meta: PaginationMeta;
}

export async function getTasks(filters?: TaskFilters): Promise<PaginatedTasks> {
  const { data } = await api.get<{ success: boolean; data: Task[]; meta: PaginationMeta }>(
    '/tasks',
    { params: filters },
  );
  return { data: data.data, meta: data.meta };
}

export async function getTask(id: string): Promise<Task> {
  const { data } = await api.get<{ success: boolean; data: Task }>(`/tasks/${id}`);
  return data.data;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await api.post<{ success: boolean; data: Task }>('/tasks', payload);
  return data.data;
}

export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
  const { data } = await api.patch<{ success: boolean; data: Task }>(`/tasks/${id}`, payload);
  return data.data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function getTaskActivity(id: string): Promise<ActivityLog[]> {
  const { data } = await api.get<{ success: boolean; data: ActivityLog[] }>(
    `/tasks/${id}/activity`,
  );
  return data.data;
}
