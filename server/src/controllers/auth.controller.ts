import type { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import * as AuthService from '../services/auth.service';
import * as UploadService from '../services/upload.service';
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from '../validators/auth.validator';
import { BadRequestError } from '../utils/errors';

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

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.updateProfile(
        req.user!.userId,
        req.body as UpdateProfileInput,
      );
      this.ok(res, user, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) throw new BadRequestError('No file uploaded');
      const avatarUrl = await UploadService.uploadAvatarToCloudinary(
        req.file.buffer,
        req.user!.userId,
      );
      const user = await AuthService.updateAvatar(req.user!.userId, avatarUrl);
      this.ok(res, user, 'Avatar updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AuthService.changePassword(req.user!.userId, req.body as ChangePasswordInput);
      this.ok(res, null, 'Password changed successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
