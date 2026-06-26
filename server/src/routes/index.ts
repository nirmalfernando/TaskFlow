import { Router, type IRouter } from 'express';
import { authRouter } from './auth.routes';
import { taskRouter } from './task.routes';
import { userRouter } from './user.routes';

export const router: IRouter = Router();

router.use('/auth', authRouter);
router.use('/tasks', taskRouter);
router.use('/users', userRouter);

// router.use('/ai', aiRouter);
