import { Router, type IRouter } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { uploadTaskImage } from '../middlewares/upload.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  taskFiltersSchema,
} from '../validators/task.validator';

export const taskRouter: IRouter = Router();

taskRouter.use(authenticate);

taskRouter.post('/', validate(createTaskSchema), (req, res, next) => {
  taskController.create(req, res, next).catch(next);
});

taskRouter.get('/', validate(taskFiltersSchema, 'query'), (req, res, next) => {
  taskController.list(req, res, next).catch(next);
});

taskRouter.get('/:id', (req, res, next) => {
  taskController.get(req, res, next).catch(next);
});

taskRouter.patch('/:id', validate(updateTaskSchema), (req, res, next) => {
  taskController.update(req, res, next).catch(next);
});

taskRouter.delete('/:id', (req, res, next) => {
  taskController.remove(req, res, next).catch(next);
});

taskRouter.get('/:id/activity', (req, res, next) => {
  taskController.activity(req, res, next).catch(next);
});

taskRouter.post('/upload-image', uploadTaskImage, (req, res, next) => {
  taskController.uploadImage(req, res, next).catch(next);
});
