import type { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import * as aiService from '../services/ai.service';
import { BadRequestError } from '../utils/errors';

class AiController extends BaseController {
  transcribe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file;
      if (!file) throw new BadRequestError('Audio file is required');

      const transcript = await aiService.transcribeAudio(file.buffer, file.mimetype);
      this.ok(res, { transcript });
    } catch (err) {
      next(err);
    }
  };

  parseTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { text } = req.body as { text?: string };
      if (!text?.trim()) throw new BadRequestError('text is required');

      const parsed = await aiService.parseTaskFromText(text.trim());
      this.ok(res, parsed);
    } catch (err) {
      next(err);
    }
  };
}

export const aiController = new AiController();
