import { db } from '../config/database';
import { UserRepository } from '../repositories/user.repository';
import { buildPaginationMeta, type PaginationMeta } from '../utils/response';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import type { JwtPayload, SafeUser } from '../interfaces';
import type { UpdateUserRoleInput, UserFiltersInput } from '../validators/user.validator';

const userRepo = new UserRepository(db);

type UserWithTasks = NonNullable<Awaited<ReturnType<typeof userRepo.findByIdWithTasks>>>;

function toSafeUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): SafeUser & { isActive: boolean } {
  const { id, email, firstName, lastName, role, isActive, createdAt, updatedAt } = user;
  return {
    id,
    email,
    firstName,
    lastName,
    role: role as SafeUser['role'],
    isActive,
    createdAt,
    updatedAt,
  };
}

async function assertExists(id: string): Promise<UserWithTasks> {
  const user = await userRepo.findByIdWithTasks(id);
  if (!user) throw new NotFoundError('User not found');
  return user;
}

export async function getUsers(
  filters: UserFiltersInput,
): Promise<{ users: ReturnType<typeof toSafeUser>[]; meta: PaginationMeta }> {
  const [users, total] = await userRepo.findFiltered(filters);
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  return {
    users: users.map(toSafeUser),
    meta: buildPaginationMeta(total, page, limit),
  };
}

export async function getUserById(id: string): Promise<UserWithTasks> {
  return assertExists(id);
}

export async function updateUserRole(
  id: string,
  input: UpdateUserRoleInput,
  actor: JwtPayload,
): Promise<ReturnType<typeof toSafeUser>> {
  if (id === actor.userId) {
    throw new ForbiddenError('You cannot change your own role');
  }

  const user = await userRepo.findById(id);
  if (!user) throw new NotFoundError('User not found');

  const updated = await userRepo.update(id, { role: input.role });
  return toSafeUser(updated);
}

export async function deactivateUser(id: string, actor: JwtPayload): Promise<void> {
  if (id === actor.userId) {
    throw new ForbiddenError('You cannot deactivate your own account');
  }

  const user = await userRepo.findById(id);
  if (!user) throw new NotFoundError('User not found');
  if (!user.isActive) throw new ForbiddenError('User is already inactive');

  await userRepo.update(id, { isActive: false, refreshToken: null });
}

export async function reactivateUser(id: string, actor: JwtPayload): Promise<void> {
  if (id === actor.userId) {
    throw new ForbiddenError('You cannot reactivate your own account');
  }

  const user = await userRepo.findById(id);
  if (!user) throw new NotFoundError('User not found');
  if (user.isActive) throw new ForbiddenError('User is already active');

  await userRepo.update(id, { isActive: true });
}
