import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.config';
import { generalLimiter } from './middlewares/rate-limit.middleware';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import { router } from './routes';
import { openApiSpec } from './docs/openapi';

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
    res.json({
      status: 'ok',
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use(
    '/api-docs',
    ((_req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
      );
      next();
    }) as express.RequestHandler,
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, { explorer: false }),
  );

  app.get('/api-docs.json', (_req, res) => {
    res.json(openApiSpec);
  });

  app.use('/api/v1', router);

  // 404 must come before the error handler
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
