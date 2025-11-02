import { type JSX } from 'react';

const oauthProviders = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'facebook', label: 'Continue with Facebook' },
  { id: 'github', label: 'Continue with GitHub' }
];

const redirectToProvider = (providerId: string): void => {
  const currentPath = window.location.pathname + window.location.search;
  const encodedReturnTo = encodeURIComponent(currentPath);
  window.location.href = `/api/auth/${providerId}?returnTo=${encodedReturnTo}`;
};

export const LoginPage = (): JSX.Element => (
  <main className="login-page">
    <section className="login-card">
      <h1>Splash Finder</h1>
      <p>Sign in to search and curate Unsplash photos.</p>
      <div className="login-actions">
        {oauthProviders.map((provider) => (
          <button key={provider.id} onClick={() => redirectToProvider(provider.id)} className="login-button">
            {provider.label}
          </button>
        ))}
      </div>
    </section>
  </main>
);
