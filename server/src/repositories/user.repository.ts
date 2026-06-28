import type { PrismaClient, User, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface UserFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export class UserRepository extends BaseRepository<User> {
  constructor(db: PrismaClient) {
    super(db);
  }

  protected getModel(): PrismaClient['user'] {
    return this.db.user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<User> {
    return this.db.user.update({ where: { id }, data: { refreshToken } });
  }

  async findByIdWithTasks(id: string): Promise<Prisma.UserGetPayload<{
    include: { createdTasks: true; assignedTasks: true };
  }> | null> {
    return this.db.user.findUnique({
      where: { id },
      include: {
        createdTasks: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
        },
        assignedTasks: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findFiltered(filters: UserFilters): Promise<[User[], number]> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      const term = filters.search;
      where.OR = [
        { firstName: { contains: term } },
        { lastName: { contains: term } },
        { email: { contains: term } },
      ];
    }

    return Promise.all([
      this.db.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.db.user.count({ where }),
    ]);
  }

  async findAllUsers(page: number, limit: number): Promise<[User[], number]> {
    return this.findFiltered({ page, limit });
  }

  async findAssignable(): Promise<Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>[]> {
    return this.db.user.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
  }
}
