import dotenvSafe from 'dotenv-safe';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const serverRoot = path.dirname(fileURLToPath(new URL('../..', import.meta.url)));
const envPath = path.join(serverRoot, '.env');
const examplePath = path.join(serverRoot, '.env.example');

if (fs.existsSync(envPath) && fs.existsSync(examplePath)) {
  dotenvSafe.config({ path: envPath, example: examplePath, allowEmptyValues: false });
}

type NodeEnv = 'development' | 'test' | 'production';

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable ${key}`);
  }
  return value;
};

const parsePort = (value: string): number => {
  const port = Number.parseInt(value, 10);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${value}`);
  }
  return port;
};

export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
}

export interface AppEnvironment {
  nodeEnv: NodeEnv;
  port: number;
  clientOrigin: string;
  mongoUri: string;
  sessionSecret: string;
  unsplashAccessKey: string;
  google: OAuthProviderConfig;
  facebook: OAuthProviderConfig;
  github: OAuthProviderConfig;
}

export const env: AppEnvironment = {
  nodeEnv: (process.env.NODE_ENV as NodeEnv) ?? 'development',
  port: parsePort(getEnv('PORT', '4000')),
  clientOrigin: getEnv('CLIENT_ORIGIN'),
  mongoUri: getEnv('MONGODB_URI'),
  sessionSecret: getEnv('SESSION_SECRET'),
  unsplashAccessKey: getEnv('UNSPLASH_ACCESS_KEY'),
  google: {
    clientId: getEnv('GOOGLE_CLIENT_ID'),
    clientSecret: getEnv('GOOGLE_CLIENT_SECRET')
  },
  facebook: {
    clientId: getEnv('FACEBOOK_CLIENT_ID'),
    clientSecret: getEnv('FACEBOOK_CLIENT_SECRET')
  },
  github: {
    clientId: getEnv('GITHUB_CLIENT_ID'),
    clientSecret: getEnv('GITHUB_CLIENT_SECRET')
  }
};
