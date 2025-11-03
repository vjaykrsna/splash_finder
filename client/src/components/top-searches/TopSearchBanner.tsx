import type { JSX } from 'react';
import type { TopSearchTerm } from '../../hooks/useTopSearches';

export interface TopSearchBannerProps {
  terms: TopSearchTerm[];
  isLoading: boolean;
  error: string | null;
}

const formatTerm = (term: string): string =>
  term
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const formatCountLabel = (count: number): string => `${count} ${count === 1 ? 'search' : 'searches'}`;

export const TopSearchBanner = ({ terms, isLoading, error }: TopSearchBannerProps): JSX.Element => {
  if (isLoading) {
    return (
      <section className="top-search-banner" aria-busy="true">
        <p>Loading top searches…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="top-search-banner" aria-live="polite">
        <p role="alert">Unable to load top searches.</p>
      </section>
    );
  }

  if (terms.length === 0) {
    return (
      <section className="top-search-banner" aria-live="polite">
        <p>No community searches yet.</p>
      </section>
    );
  }

  return (
    <section className="top-search-banner" aria-live="polite">
      <h2>Top community searches</h2>
      <ol className="top-search-banner__list">
        {terms.map((item, index) => (
          <li key={item.term} className="top-search-banner__item">
            {formatTerm(item.term)} — {formatCountLabel(item.count)}
          </li>
        ))}
      </ol>
    </section>
  );
};
