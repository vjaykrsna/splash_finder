import type { PassportStatic } from 'passport';
import { Strategy as FacebookStrategy, type Profile } from 'passport-facebook';
import { env } from '../../config/env.js';
import { OAuthUser } from '../../models/OAuthUser.js';

const extractProfileAttributes = (profile: Profile) => {
  const displayName = profile.displayName?.trim() ?? profile.name?.givenName ?? 'Facebook User';
  const email = profile.emails?.[0]?.value ?? undefined;
  const avatarUrl = profile.photos?.[0]?.value ?? undefined;

  return {
    provider: 'facebook' as const,
    providerId: profile.id,
    displayName,
    email,
    avatarUrl
  };
};

export const registerFacebookStrategy = (passport: PassportStatic): void => {
  if (env.nodeEnv === 'test') {
    return;
  }

  passport.use(
    new FacebookStrategy(
      {
        clientID: env.facebook.clientId,
        clientSecret: env.facebook.clientSecret,
        callbackURL: '/api/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'emails', 'photos']
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: (error: unknown, user?: unknown) => void
      ) => {
        try {
          if (!profile.id) {
            throw new Error('Facebook profile missing identifier');
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
