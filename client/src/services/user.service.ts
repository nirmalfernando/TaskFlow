import { api } from './api';
import type { ApiResponse, Role, User } from '@/types';

export interface AdminUser extends User {
  isActive: boolean;
  taskCount?: number;
}

export interface PaginatedUsers {
  data: AdminUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface InviteUserInput {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  temporaryPassword: string;
}

export async function getUsers(filters?: UserFilters): Promise<PaginatedUsers> {
  const { data } = await api.get<{
    success: boolean;
    data: AdminUser[];
    meta: PaginatedUsers['meta'];
  }>('/users', { params: filters });
  return { data: data.data, meta: data.meta };
}

export async function updateUserRole(id: string, role: Role): Promise<AdminUser> {
  const { data } = await api.patch<ApiResponse<AdminUser>>(`/users/${id}/role`, { role });
  return data.data;
}

export async function deactivateUser(id: string): Promise<void> {
  await api.patch(`/users/${id}/deactivate`);
}

export async function reactivateUser(id: string): Promise<void> {
  await api.patch(`/users/${id}/reactivate`);
}

export async function inviteUser(input: InviteUserInput): Promise<AdminUser> {
  const { data } = await api.post<ApiResponse<AdminUser>>('/users/invite', input);
  return data.data;
}
