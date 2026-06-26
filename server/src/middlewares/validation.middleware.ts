import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

type ValidateTarget = 'body' | 'params' | 'query';

export const validate =
  (schema: ZodSchema, target: ValidateTarget = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return next(new ValidationError(flattenZodErrors(result.error)));
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    req[target] = result.data;
    next();
  };

function flattenZodErrors(error: ZodError): Record<string, string[]> {
  const map: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : 'root';
    if (!map[key]) map[key] = [];
    map[key].push(issue.message);
  }

  return map;
}
