import type { PassportStatic } from 'passport';
import { Strategy as GitHubStrategy, type Profile } from 'passport-github2';
import { env } from '../../config/env.js';
import { OAuthUser } from '../../models/OAuthUser.js';

const extractProfileAttributes = (profile: Profile) => {
  const displayName = profile.displayName?.trim() ?? profile.username ?? 'GitHub User';
  const email = profile.emails?.[0]?.value ?? undefined;
  const avatarUrl = profile.photos?.[0]?.value ?? undefined;

  return {
    provider: 'github' as const,
    providerId: profile.id,
    displayName,
    email,
    avatarUrl
  };
};

export const registerGitHubStrategy = (passport: PassportStatic): void => {
  if (env.nodeEnv === 'test') {
    return;
  }

  passport.use(
    new GitHubStrategy(
      {
        clientID: env.github.clientId,
        clientSecret: env.github.clientSecret,
        callbackURL: '/api/auth/github/callback',
        scope: ['user:email']
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: (error: unknown, user?: unknown) => void
      ) => {
        try {
          if (!profile.id) {
            throw new Error('GitHub profile missing identifier');
          }

          const user = await OAuthUser.findOrCreateFromProfile(extractProfileAttributes(profile));
          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
};
