import { Router, type IRouter } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  updateUserRoleSchema,
  userFiltersSchema,
  inviteUserSchema,
} from '../validators/user.validator';

export const userRouter: IRouter = Router();

userRouter.use(authenticate, authorize('ADMIN'));

userRouter.get('/', validate(userFiltersSchema, 'query'), (req, res, next) => {
  userController.list(req, res, next).catch(next);
});

userRouter.get('/:id', (req, res, next) => {
  userController.getById(req, res, next).catch(next);
});

userRouter.patch('/:id/role', validate(updateUserRoleSchema), (req, res, next) => {
  userController.updateRole(req, res, next).catch(next);
});

userRouter.patch('/:id/deactivate', (req, res, next) => {
  userController.deactivate(req, res, next).catch(next);
});

userRouter.patch('/:id/reactivate', (req, res, next) => {
  userController.reactivate(req, res, next).catch(next);
});

userRouter.post('/invite', validate(inviteUserSchema), (req, res, next) => {
  userController.invite(req, res, next).catch(next);
});
