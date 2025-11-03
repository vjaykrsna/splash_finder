import { useMemo, type JSX } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useSearch } from '@/hooks/useSearch';
import { useSelectionCounter } from '@/hooks/useSelectionCounter';
import { SearchForm } from '@/components/search/SearchForm';
import { SearchGrid } from '@/components/search/SearchGrid';
import { TopSearchBanner } from '@/components/top-searches/TopSearchBanner';
import { useTopSearches } from '@/hooks/useTopSearches';

export const SearchPage = (): JSX.Element => {
  const { user } = useAuth();
  const searchMutation = useSearch();
  const selection = useSelectionCounter<string>();
  const topSearchesQuery = useTopSearches();

  const images = searchMutation.data?.images ?? [];

  const headerMessage = useMemo(() => {
    if (!searchMutation.data) {
      return 'Search the Unsplash catalog to begin.';
    }

    return `You searched for "${searchMutation.data.term}" — ${searchMutation.data.resultCount} results.`;
  }, [searchMutation.data]);

  const handleSearch = (term: string): void => {
    searchMutation.mutate(term, {
      onSuccess: () => {
        selection.reset();
      }
    });
  };

  const errorMessage = searchMutation.isError
    ? searchMutation.error?.payload && typeof searchMutation.error.payload === 'object'
      ? 'Unable to complete the search.'
      : searchMutation.error?.message ?? 'Unable to complete the search.'
    : null;

  const topSearchError = topSearchesQuery.isError ? 'Unable to load community searches.' : null;
  const topSearchTerms = topSearchesQuery.data ?? [];

  return (
    <main className="search-page" aria-live="polite">
      <header className="search-page__header">
        <div>
          <h1>Welcome back, {user?.displayName ?? 'Explorer'}!</h1>
          <p>{headerMessage}</p>
        </div>
        <div className="search-page__counter" data-testid="selection-counter">
          Selected: {selection.selectedCount} images
        </div>
      </header>

      <section className="search-page__top-searches">
        <TopSearchBanner
          terms={topSearchTerms}
          isLoading={topSearchesQuery.isPending}
          error={topSearchError}
        />
      </section>

      <section className="search-page__panel">
        <SearchForm onSubmit={handleSearch} isSubmitting={searchMutation.isPending} />
        {errorMessage ? <p className="search-page__error">{errorMessage}</p> : null}
      </section>

      <section className="search-page__results">
        <SearchGrid
          images={images}
          isLoading={searchMutation.isPending}
          onToggle={selection.toggleSelection}
          isSelected={selection.isSelected}
        />
      </section>
    </main>
  );
};
