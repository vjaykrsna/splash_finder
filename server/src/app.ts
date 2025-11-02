import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Application } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import MongoStore from 'connect-mongo';
import { env } from './config/env.js';
import { registerRoutes } from './api/routes/index.js';
import { errorHandler, notFoundHandler } from './api/middleware/errorHandler.js';
import passport, { configurePassport } from './auth/passport.js';

export const createApp = (): Application => {
  const app = express();

  if (env.nodeEnv === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(helmet());
  app.use(cors({
    origin: env.clientOrigin,
    credentials: true
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: env.nodeEnv === 'production' ? 'lax' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7
      },
      store: MongoStore.create({
        mongoUrl: env.mongoUri,
        collectionName: 'sessions',
        stringify: false
      })
    })
  );

  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
