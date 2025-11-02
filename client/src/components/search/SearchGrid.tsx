import { type JSX } from 'react';

export interface SearchImage {
  id: string;
  thumbUrl: string;
  fullUrl: string;
  description?: string | null;
  photographer?: string | null;
}

interface SearchGridProps {
  images: SearchImage[];
  isLoading?: boolean;
  onToggle: (imageId: string) => void;
  isSelected: (imageId: string) => boolean;
}

export const SearchGrid = ({
  images,
  isLoading = false,
  onToggle,
  isSelected
}: SearchGridProps): JSX.Element => {
  if (isLoading) {
    return <p role="status">Loading images…</p>;
  }

  if (images.length === 0) {
    return <p role="status">No results to display yet. Try a new search.</p>;
  }

  return (
    <div className="search-grid">
      {images.map((image: SearchImage) => (
        <article key={image.id} className="search-grid__item">
          <label>
            <input
              type="checkbox"
              checked={isSelected(image.id)}
              onChange={() => onToggle(image.id)}
              aria-label={`Select image ${image.description ?? image.id}`}
            />
            <span className="search-grid__checkbox" aria-hidden="true" />
          </label>
          <img src={image.thumbUrl} alt={image.description ?? 'Unsplash photo'} loading="lazy" />
          <footer className="search-grid__meta">
            <p>{image.description ?? 'Untitled photo'}</p>
            <p className="search-grid__photographer">{image.photographer ?? 'Unknown artist'}</p>
          </footer>
        </article>
      ))}
    </div>
  );
};
