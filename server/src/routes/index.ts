import { Router, type IRouter } from 'express';
import { authRouter } from './auth.routes';
import { taskRouter } from './task.routes';

export const router: IRouter = Router();

router.use('/auth', authRouter);
router.use('/tasks', taskRouter);

// Routes will be mounted here as each feature branch is merged:
// router.use('/users', userRouter);
// router.use('/ai', aiRouter);
