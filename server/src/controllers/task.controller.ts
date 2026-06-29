import type { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import * as TaskService from '../services/task.service';
import * as UploadService from '../services/upload.service';
import { BadRequestError } from '../utils/errors';
import type { CreateTaskInput, UpdateTaskInput } from '../validators/task.validator';

class TaskController extends BaseController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.createTask(req.body as CreateTaskInput, req.user!);
      this.created(res, task, 'Task created successfully');
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tasks, meta } = await TaskService.getTasks(req.query, req.user!);
      this.paginated(res, tasks, meta);
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.getTask(req.params.id);
      this.ok(res, task);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.updateTask(
        req.params.id,
        req.body as UpdateTaskInput,
        req.user!,
      );
      this.ok(res, task, 'Task updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await TaskService.deleteTask(req.params.id, req.user!);
      this.noContent(res);
    } catch (err) {
      next(err);
    }
  }

  async activity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await TaskService.getTaskActivity(req.params.id);
      this.ok(res, logs);
    } catch (err) {
      next(err);
    }
  }

  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) throw new BadRequestError('No file provided');
      const url = await UploadService.uploadTaskImageToCloudinary(req.file.buffer);
      this.ok(res, { url }, 'Image uploaded successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const taskController = new TaskController();
