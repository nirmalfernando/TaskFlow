import { z } from 'zod';
import { Role } from '@prisma/client';

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const userFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(100)).optional(),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UserFiltersInput = z.infer<typeof userFiltersSchema>;
