import type { PassportStatic } from 'passport';
import { Strategy as GoogleStrategy, type Profile } from 'passport-google-oauth20';
import { env } from '../../config/env.js';
import { OAuthUser } from '../../models/OAuthUser.js';

const extractProfileAttributes = (profile: Profile) => {
  const displayName = profile.displayName?.trim() ?? profile.emails?.[0]?.value ?? 'Unknown User';
  const email = profile.emails?.[0]?.value ?? undefined;
  const avatarUrl = profile.photos?.[0]?.value ?? undefined;

  return {
    provider: 'google' as const,
    providerId: profile.id,
    displayName,
    email,
    avatarUrl
  };
};

export const registerGoogleStrategy = (passport: PassportStatic): void => {
  if (env.nodeEnv === 'test') {
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: `http://localhost:4000/api/auth/google/callback`,
        scope: ['profile', 'email']
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          if (!profile.id) {
            throw new Error('Google profile did not include an identifier');
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
