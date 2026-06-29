import type { RequestHandler } from 'express';
import multer from 'multer';
import { BadRequestError } from '../utils/errors';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const uploadAvatar: RequestHandler = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      cb(new BadRequestError('Only JPEG, PNG, WebP, or GIF images are allowed'));
    } else {
      cb(null, true);
    }
  },
}).single('avatar');

export const uploadTaskImage: RequestHandler = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      cb(new BadRequestError('Only JPEG, PNG, WebP, or GIF images are allowed'));
    } else {
      cb(null, true);
    }
  },
}).single('file');
