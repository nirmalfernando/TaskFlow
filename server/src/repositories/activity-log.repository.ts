import type { PrismaClient, ActivityLog, ActivityAction } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface CreateActivityLogInput {
  taskId: string;
  userId: string;
  action: ActivityAction;
  field?: string;
  oldValue?: string;
  newValue?: string;
}

export class ActivityLogRepository extends BaseRepository<ActivityLog> {
  constructor(db: PrismaClient) {
    super(db);
  }

  protected getModel(): PrismaClient['activityLog'] {
    return this.db.activityLog;
  }

  async logActivity(input: CreateActivityLogInput): Promise<ActivityLog> {
    return this.db.activityLog.create({ data: input });
  }

  async findByTask(taskId: string): Promise<ActivityLog[]> {
    return this.db.activityLog.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }
}
