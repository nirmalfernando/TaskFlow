import { Router, type IRouter } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { uploadAvatar } from '../middlewares/upload.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.validator';

export const authRouter: IRouter = Router();

authRouter.post('/register', validate(registerSchema), (req, res, next) => {
  authController.register(req, res, next).catch(next);
});

authRouter.post('/login', validate(loginSchema), (req, res, next) => {
  authController.login(req, res, next).catch(next);
});

authRouter.post('/refresh', validate(refreshTokenSchema), (req, res, next) => {
  authController.refresh(req, res, next).catch(next);
});

authRouter.post('/logout', authenticate, (req, res, next) => {
  authController.logout(req, res, next).catch(next);
});

authRouter.get('/me', authenticate, (req, res, next) => {
  authController.me(req, res, next).catch(next);
});

authRouter.patch('/profile', authenticate, validate(updateProfileSchema), (req, res, next) => {
  authController.updateProfile(req, res, next).catch(next);
});

authRouter.post('/avatar', authenticate, uploadAvatar, (req, res, next) => {
  authController.uploadAvatar(req, res, next).catch(next);
});

authRouter.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  (req, res, next) => {
    authController.changePassword(req, res, next).catch(next);
  },
);
