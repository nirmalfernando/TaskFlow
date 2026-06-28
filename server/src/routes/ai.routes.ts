import { Router, type IRouter } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.middleware';
import { aiController } from '../controllers/ai.controller';
import { BadRequestError } from '../utils/errors';

const AUDIO_MIME_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/ogg',
  'audio/ogg;codecs=opus',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
];

const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB (Whisper limit)
  fileFilter(_req, file, cb) {
    const base = file.mimetype.split(';')[0].trim();
    if (!AUDIO_MIME_TYPES.some((t) => t.split(';')[0] === base)) {
      cb(new BadRequestError('Only audio files are allowed'));
    } else {
      cb(null, true);
    }
  },
}).single('audio');

export const aiRouter: IRouter = Router();

aiRouter.use(authenticate);

aiRouter.post('/transcribe', uploadAudio, (req, res, next) => {
  aiController.transcribe(req, res, next).catch(next);
});
aiRouter.post('/parse-task', (req, res, next) => {
  aiController.parseTask(req, res, next).catch(next);
});
