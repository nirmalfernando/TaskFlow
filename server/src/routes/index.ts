import { Router, type IRouter } from 'express';
import { authRouter } from './auth.routes';

export const router: IRouter = Router();

router.use('/auth', authRouter);

// Routes will be mounted here as each feature branch is merged:
// router.use('/tasks', taskRouter);
// router.use('/users', userRouter);
// router.use('/ai', aiRouter);
