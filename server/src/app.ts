import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import { env } from './config/env.config';
import { generalLimiter } from './middlewares/rate-limit.middleware';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import { router } from './routes';

export const createApp = (): express.Application => {
  const app = express();

  app.use(helmet());
  app.use(compression());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== 'test') {
    app.use('/api', generalLimiter);
  }

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', environment: env.NODE_ENV, timestamp: new Date().toISOString() });
  });

  app.use('/api/v1', router);

  // 404 must come before the error handler
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
