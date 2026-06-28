import type { Response } from 'express';
import { ResponseHelper, type PaginationMeta } from '../utils/response';

export abstract class BaseController {
  protected ok<T>(res: Response, data: T, message?: string): Response {
    return ResponseHelper.success(res, data, message);
  }

  protected created<T>(res: Response, data: T, message?: string): Response {
    return ResponseHelper.created(res, data, message);
  }

  protected paginated<T>(
    res: Response,
    data: T[],
    meta: PaginationMeta,
    message?: string,
  ): Response {
    return ResponseHelper.paginated(res, data, meta, message);
  }

  protected noContent(res: Response): Response {
    return ResponseHelper.noContent(res);
  }
}
