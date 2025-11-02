import { useState, type ChangeEvent, type FormEvent, type JSX } from 'react';

export interface SearchFormProps {
  initialTerm?: string;
  isSubmitting?: boolean;
  onSubmit: (term: string) => void;
}

export const SearchForm = ({
  initialTerm = '',
  isSubmitting = false,
  onSubmit
}: SearchFormProps): JSX.Element => {
  const [term, setTerm] = useState(initialTerm);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = term.trim();

    if (!trimmed) {
      setError('Please enter a search term.');
      return;
    }

    setError(null);
    onSubmit(trimmed);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <label htmlFor="search-term" className="search-form__label">
        Unsplash Search
      </label>
      <div className="search-form__controls">
        <input
          id="search-term"
          type="text"
          value={term}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setTerm(event.target.value)}
          placeholder="Find inspiration (e.g. waterfalls, city skyline)"
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Searching…' : 'Search'}
        </button>
      </div>
      {error ? <p className="search-form__error">{error}</p> : null}
    </form>
  );
};
