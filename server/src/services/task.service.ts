import { db } from '../config/database';
import { TaskRepository } from '../repositories/task.repository';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
import { buildPaginationMeta, type PaginationMeta } from '../utils/response';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import type { JwtPayload } from '../interfaces';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFiltersInput,
} from '../validators/task.validator';

const taskRepo = new TaskRepository(db);
const activityRepo = new ActivityLogRepository(db);

type TaskWithRelations = Awaited<ReturnType<typeof taskRepo.findByIdWithRelations>>;

async function assertExists(id: string): Promise<NonNullable<TaskWithRelations>> {
  const task = await taskRepo.findByIdWithRelations(id);
  if (!task) throw new NotFoundError('Task not found');
  return task;
}

function assertOwnerOrAdmin(task: NonNullable<TaskWithRelations>, actor: JwtPayload): void {
  if (actor.role !== 'ADMIN' && task.createdById !== actor.userId) {
    throw new ForbiddenError('Only the task creator or an admin can perform this action');
  }
}

export async function createTask(
  input: CreateTaskInput,
  actor: JwtPayload,
): Promise<NonNullable<TaskWithRelations>> {
  const task = await taskRepo.create({
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    assignedToId: input.assignedToId,
    createdById: actor.userId,
  });

  await activityRepo.logActivity({ taskId: task.id, userId: actor.userId, action: 'CREATED' });

  const full = await taskRepo.findByIdWithRelations(task.id);
  return full!;
}

export async function getTasks(
  filters: TaskFiltersInput,
  actor: JwtPayload,
): Promise<{ tasks: NonNullable<TaskWithRelations>[]; meta: PaginationMeta }> {
  const viewerId = actor.role !== 'ADMIN' ? actor.userId : undefined;
  const [tasks, total] = await taskRepo.findFiltered(filters, viewerId);
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  return {
    tasks: tasks as NonNullable<TaskWithRelations>[],
    meta: buildPaginationMeta(total, page, limit),
  };
}

export async function getTask(id: string): Promise<NonNullable<TaskWithRelations>> {
  return assertExists(id);
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
  actor: JwtPayload,
): Promise<NonNullable<TaskWithRelations>> {
  const task = await assertExists(id);
  assertOwnerOrAdmin(task, actor);

  const logs: Promise<unknown>[] = [];

  if (input.status !== undefined && input.status !== task.status) {
    logs.push(
      activityRepo.logActivity({
        taskId: id,
        userId: actor.userId,
        action: 'STATUS_CHANGED',
        field: 'status',
        oldValue: task.status,
        newValue: input.status,
      }),
    );
  }

  if (input.assignedToId !== undefined && input.assignedToId !== task.assignedToId) {
    logs.push(
      activityRepo.logActivity({
        taskId: id,
        userId: actor.userId,
        action: 'ASSIGNED',
        field: 'assignedToId',
        oldValue: task.assignedToId ?? undefined,
        newValue: input.assignedToId ?? undefined,
      }),
    );
  }

  const hasOtherChanges = Object.keys(input).some((k) => k !== 'status' && k !== 'assignedToId');
  if (hasOtherChanges) {
    logs.push(activityRepo.logActivity({ taskId: id, userId: actor.userId, action: 'UPDATED' }));
  }

  await taskRepo.update(id, {
    ...input,
    dueDate:
      input.dueDate !== undefined ? (input.dueDate ? new Date(input.dueDate) : null) : undefined,
  });

  await Promise.all(logs);

  const updated = await taskRepo.findByIdWithRelations(id);
  return updated!;
}

export async function deleteTask(id: string, actor: JwtPayload): Promise<void> {
  const task = await assertExists(id);
  assertOwnerOrAdmin(task, actor);

  await activityRepo.logActivity({ taskId: id, userId: actor.userId, action: 'DELETED' });
  await taskRepo.softDelete(id);
}

export async function getTaskActivity(
  id: string,
): Promise<ReturnType<typeof activityRepo.findByTask>> {
  await assertExists(id);
  return activityRepo.findByTask(id);
}
