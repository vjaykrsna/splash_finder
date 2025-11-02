import passport from 'passport';
import type { PassportStatic } from 'passport';
import { OAuthUser } from '../models/OAuthUser.js';
import type { OAuthUserDocument } from '../models/OAuthUser.js';
import { registerGoogleStrategy } from './strategies/googleStrategy.js';
import { registerFacebookStrategy } from './strategies/facebookStrategy.js';
import { registerGitHubStrategy } from './strategies/githubStrategy.js';

let isConfigured = false;

const serializeUser = (): void => {
  passport.serializeUser((user: unknown, done: (error: unknown, id?: string) => void) => {
    try {
      const oauthUser = user as OAuthUserDocument & { id?: string; _id?: { toString: () => string } };
      const userId = (oauthUser as any).id ?? (oauthUser as any)._id?.toString();

      if (!userId) {
        throw new Error('Unable to serialize OAuth user without identifier');
      }

      done(null, userId);
    } catch (error) {
      done(error as Error);
    }
  });
};

const deserializeUser = (): void => {
  passport.deserializeUser((id: string, done: (err: any, user?: any) => void) => {
    OAuthUser.findById(id).exec()
      .then((user) => {
        if (!user) {
          return done(null, false);
        }

        const sanitizedUser = {
          id: user.id,
          provider: user.provider,
          displayName: user.displayName,
          email: user.email,
          avatarUrl: user.avatarUrl
        } satisfies Partial<OAuthUserDocument> & { id: string };

        return done(null, sanitizedUser);
      })
      .catch((error) => {
        return done(error);
      });
  });
};

export const configurePassport = (): PassportStatic => {
  if (isConfigured) {
    return passport;
  }

  serializeUser();
  deserializeUser();

  registerGoogleStrategy(passport);
  registerFacebookStrategy(passport);
  registerGitHubStrategy(passport);

  isConfigured = true;

  return passport;
};

export default passport;
