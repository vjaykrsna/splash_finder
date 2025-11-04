import type { JSX } from 'react';
import type { HistoryItem } from '../../hooks/useHistory';

export interface SearchHistoryPanelProps {
  searches: HistoryItem[];
  isLoading: boolean;
  error: string | null;
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export const SearchHistoryPanel = ({ searches, isLoading, error }: SearchHistoryPanelProps): JSX.Element => {
  if (isLoading) {
    return (
      <section className="search-history-panel" aria-busy="true">
        <p>Loading your search history…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="search-history-panel" aria-live="polite">
        <p role="alert">Unable to load search history.</p>
      </section>
    );
  }

  if (searches.length === 0) {
    return (
      <section className="search-history-panel" aria-live="polite">
        <p>No search history yet.</p>
      </section>
    );
  }

  return (
    <section className="search-history-panel" aria-live="polite">
      <h2>Your Search History</h2>
      <ul className="search-history-panel__list">
        {searches.map((item, index) => (
          <li key={`${item.term}-${item.timestamp}`} className="search-history-panel__item">
            <div className="search-history-panel__term">{item.term}</div>
            <div className="search-history-panel__details">
              {formatTimestamp(item.timestamp)} • {item.resultCount} results
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
