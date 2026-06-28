import type { PrismaClient } from '@prisma/client';

// Minimal shape required from any Prisma model delegate
type PrismaDelegate = {
  findUnique(args: unknown): Promise<unknown>;
  findFirst(args: unknown): Promise<unknown>;
  findMany(args?: unknown): Promise<unknown[]>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
  count(args?: unknown): Promise<number>;
};

export abstract class BaseRepository<T extends object> {
  protected readonly db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  protected abstract getModel(): PrismaDelegate;

  async findById(id: string): Promise<T | null> {
    return this.getModel().findUnique({ where: { id } }) as Promise<T | null>;
  }

  async findMany(args?: object): Promise<T[]> {
    return this.getModel().findMany(args) as Promise<T[]>;
  }

  async create(data: object): Promise<T> {
    return this.getModel().create({ data }) as Promise<T>;
  }

  async update(id: string, data: object): Promise<T> {
    return this.getModel().update({ where: { id }, data }) as Promise<T>;
  }

  async delete(id: string): Promise<T> {
    return this.getModel().delete({ where: { id } }) as Promise<T>;
  }

  async count(where?: object): Promise<number> {
    return this.getModel().count({ where });
  }

  async exists(where: object): Promise<boolean> {
    const n = await this.getModel().count({ where });
    return n > 0;
  }
}
