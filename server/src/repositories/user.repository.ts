import type { PrismaClient, User } from '@prisma/client';
import { BaseRepository } from './base.repository';

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

  async findAllUsers(page: number, limit: number): Promise<[User[], number]> {
    const skip = (page - 1) * limit;
    return Promise.all([
      this.db.user.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.db.user.count(),
    ]);
  }
}
