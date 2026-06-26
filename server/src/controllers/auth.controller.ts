import type { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import * as AuthService from '../services/auth.service';
import type { RegisterInput, LoginInput, RefreshTokenInput } from '../validators/auth.validator';

class AuthController extends BaseController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body as RegisterInput);
      this.created(res, result, 'Account created successfully');
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body as LoginInput);
      this.ok(res, result, 'Logged in successfully');
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body as RefreshTokenInput;
      const tokens = await AuthService.refreshTokens(refreshToken);
      this.ok(res, tokens, 'Tokens refreshed');
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AuthService.logout(req.user!.userId);
      this.noContent(res);
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser(req.user!.userId);
      this.ok(res, user);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
