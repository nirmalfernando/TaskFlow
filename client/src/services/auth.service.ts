import { api } from './api';
import type { ApiResponse, AuthResponse, User } from '@/types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', input);
  return data.data;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', input);
  return data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function me(): Promise<User> {
  const { data } = await api.get<ApiResponse<User>>('/auth/me');
  return data.data;
}
