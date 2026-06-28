import type { PrismaClient, Task, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import type { TaskFiltersInput } from '../validators/task.validator';

export class TaskRepository extends BaseRepository<Task> {
  constructor(db: PrismaClient) {
    super(db);
  }

  protected getModel(): PrismaClient['task'] {
    return this.db.task;
  }

  async findByIdWithRelations(id: string): Promise<
    | (Task & {
        createdBy: { id: string; firstName: string; lastName: string; email: string };
        assignedTo: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          avatarUrl: string | null;
        } | null;
      })
    | null
  > {
    return this.db.task.findFirst({
      where: { id, isDeleted: false },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async findFiltered(filters: TaskFiltersInput, viewerId?: string): Promise<[Task[], number]> {
    const {
      status,
      priority,
      assignedToId,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: Prisma.TaskWhereInput = {
      isDeleted: false,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assignedToId && { assignedToId }),
      ...(viewerId && { OR: [{ createdById: viewerId }, { assignedToId: viewerId }] }),
      ...(search && {
        AND: [{ OR: [{ title: { contains: search } }, { description: { contains: search } }] }],
      }),
    };

    const skip = (page - 1) * limit;

    return Promise.all([
      this.db.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
          },
        },
      }),
      this.db.task.count({ where }),
    ]);
  }

  async softDelete(id: string): Promise<Task> {
    return this.db.task.update({ where: { id }, data: { isDeleted: true } });
  }
}
