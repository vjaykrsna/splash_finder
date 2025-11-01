import http from 'node:http';
import process from 'node:process';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

const start = async (): Promise<http.Server> => {
  await connectDatabase();
  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return server;
};

if (process.env.NODE_ENV !== 'test') {
  start().catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
  });
}

export { start };
