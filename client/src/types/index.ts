export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ─── Task types ───────────────────────────────────────────────────────────────

export type TaskStatusBackend = 'OPEN' | 'IN_PROGRESS' | 'TESTING' | 'DONE';
export type PriorityBackend = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TaskUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatusBackend;
  priority: PriorityBackend;
  dueDate?: string | null;
  isDeleted: boolean;
  createdById: string;
  assignedToId?: string | null;
  createdBy: TaskUser;
  assignedTo?: TaskUser | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  action: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'ASSIGNED' | 'DELETED';
  field?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
  user: TaskUser;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TaskFilters {
  status?: TaskStatusBackend;
  priority?: PriorityBackend;
  assignedToId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatusBackend;
  priority?: PriorityBackend;
  dueDate?: string;
  assignedToId?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatusBackend;
  priority?: PriorityBackend;
  dueDate?: string | null;
  assignedToId?: string | null;
}
