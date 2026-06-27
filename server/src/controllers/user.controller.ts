import type { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import * as UserService from '../services/user.service';
import type { UpdateUserRoleInput, InviteUserInput } from '../validators/user.validator';

class UserController extends BaseController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { users, meta } = await UserService.getUsers(req.query);
      this.paginated(res, users, meta);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.getUserById(req.params.id);
      this.ok(res, user);
    } catch (err) {
      next(err);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.updateUserRole(
        req.params.id,
        req.body as UpdateUserRoleInput,
        req.user!,
      );
      this.ok(res, user, 'User role updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await UserService.deactivateUser(req.params.id, req.user!);
      this.noContent(res);
    } catch (err) {
      next(err);
    }
  }

  async reactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await UserService.reactivateUser(req.params.id, req.user!);
      this.noContent(res);
    } catch (err) {
      next(err);
    }
  }

  async invite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.inviteUser(req.body as InviteUserInput);
      this.created(res, user, 'User invited successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
