import { Router, type IRouter } from 'express';
import { authRouter } from './auth.routes';
import { taskRouter } from './task.routes';
import { userRouter } from './user.routes';
import { eventsRouter } from './events.routes';
import { aiRouter } from './ai.routes';

export const router: IRouter = Router();

router.use('/auth', authRouter);
router.use('/tasks', taskRouter);
router.use('/users', userRouter);
router.use('/events', eventsRouter);
router.use('/ai', aiRouter);
