import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import passport, { configurePassport } from '../../auth/passport.js';
import { env } from '../../config/env.js';
import { OAuthUser } from '../../models/OAuthUser.js';
import type { OAuthProvider } from '../../models/OAuthUser.js';

configurePassport();

export interface TestLoginBody {
  provider: OAuthProvider;
  providerId: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
}

const safeRedirectTarget = (target: unknown): string => {
  if (typeof target !== 'string' || target.trim() === '') {
    return env.clientOrigin;
  }

  const decoded = decodeURIComponent(target.trim());

  if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
    return decoded.startsWith(env.clientOrigin) ? decoded : env.clientOrigin;
  }

  if (decoded.startsWith('/')) {
    return `${env.clientOrigin}${decoded}`;
  }

  return env.clientOrigin;
};

const handleAuthRedirect = (req: Request, res: Response): void => {
  const redirectTarget = safeRedirectTarget(req.session?.returnTo);
  if (req.session) {
    delete req.session.returnTo;
  }

  res.redirect(redirectTarget);
};

const captureReturnTo = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.session) {
    req.session.returnTo = safeRedirectTarget(req.query.returnTo);
  }
  next();
};

const logoutUser = (req: Request, res: Response, next: NextFunction): void => {
  req.logout((err: unknown) => {
    if (err) {
      return next(err);
    }

    req.session?.destroy(() => {
      res.clearCookie('connect.sid');
      res.sendStatus(204);
    });
  });
};

const authRouter = Router();

authRouter.use(passport.initialize());
authRouter.use(passport.session());

authRouter.get('/google', captureReturnTo, passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${env.clientOrigin}/login?error=google` }),
  handleAuthRedirect
);

authRouter.get('/facebook', captureReturnTo, passport.authenticate('facebook', { scope: ['email'] }));
authRouter.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: `${env.clientOrigin}/login?error=facebook` }),
  handleAuthRedirect
);

authRouter.get('/github', captureReturnTo, passport.authenticate('github', { scope: ['user:email'] }));
authRouter.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: `${env.clientOrigin}/login?error=github` }),
  handleAuthRedirect
);

authRouter.post('/logout', logoutUser);

authRouter.get('/me', (req: Request, res: Response) => {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = req.user as Partial<TestLoginBody> & { id?: string };
  return res.json({
    id: (user as any).id,
    displayName: user.displayName,
    email: user.email,
    avatarUrl: user.avatarUrl
  });
});

if (env.nodeEnv === 'test') {
  authRouter.post('/test-login', async (req: Request, res: Response, next: NextFunction) => {
    const { provider, providerId, displayName, email, avatarUrl } = req.body as TestLoginBody;

    try {
      const user = await OAuthUser.findOrCreateFromProfile({
        provider,
        providerId,
        displayName,
        email,
        avatarUrl
      });

      req.login(user, (error: unknown) => {
        if (error) {
          return next(error);
        }
        req.session?.save(() => res.sendStatus(204));
      });
    } catch (error) {
      next(error);
    }
  });
}

export { authRouter };
