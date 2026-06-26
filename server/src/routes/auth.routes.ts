import { Router, type IRouter } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';

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
