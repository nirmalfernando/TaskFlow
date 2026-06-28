import { createApp } from './app';
import { env } from './config/env.config';
import { connectDatabase, disconnectDatabase } from './config/database';

const start = async (): Promise<void> => {
  await connectDatabase();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = (signal: string): void => {
    console.info(`${signal} received — shutting down`);
    server.close(() => {
      void disconnectDatabase().then(() => process.exit(0));
    });
  };

  process.on('SIGTERM', () => {
    shutdown('SIGTERM');
  });
  process.on('SIGINT', () => {
    shutdown('SIGINT');
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
