import { useState, useEffect } from 'react';
import { fetchFromUrl, getCategoryFromUrl } from '../services/swapiService';

interface RelatedItemsProps {
  urls?: string[];
  label: string;
  onItemClick?: (url: string, category: string) => void;
}

interface RelatedItem {
  name: string;
  title?: string;
  url: string;
  category: string;
}

export function RelatedItems({ urls, label, onItemClick }: RelatedItemsProps) {
  const [items, setItems] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!urls || urls.length === 0) {
      setItems([]);
      return;
    }

    const loadItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const loadedItems = await Promise.all(
          urls.map(async (url): Promise<RelatedItem | null> => {
            try {
              const data = await fetchFromUrl<Record<string, unknown>>(url);
              const category = getCategoryFromUrl(url);
              return {
                name: (data.name || data.title || 'Unknown') as string,
                title: (data.title as string) || undefined,
                url,
                category,
              };
            } catch {
              return null;
            }
          })
        );

        const validItems = loadedItems.filter((item): item is RelatedItem => item !== null);
        setItems(validItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load related items');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [urls]);

  if (!urls || urls.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="related-items-section">
        <h4>{label} ({urls.length})</h4>
        <div className="related-items-loading">Loading...</div>
      </div>
    );
  }

  const handleItemClick = (url: string, category: string) => {
    if (onItemClick) {
      onItemClick(url, category);
    }
  };

  return (
    <div className="related-items-section">
      <h4>
        {label} ({items.length})
      </h4>
      {error && <div className="related-items-error">{error}</div>}
      <div className="related-items-grid">
        {items.map((item) => (
          <div
            key={item.url}
            className="related-item"
            onClick={() => handleItemClick(item.url, item.category)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleItemClick(item.url, item.category);
              }
            }}
          >
            <span className="related-item-category">{item.category}</span>
            <span className="related-item-name">{item.title || item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
