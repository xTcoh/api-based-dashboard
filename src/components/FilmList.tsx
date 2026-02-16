import { useState, useEffect } from 'react';
import type { Film } from '../services/swapiService';
import { swapiService, fetchFromUrl } from '../services/swapiService';
import { RelatedItems } from './RelatedItems';
import './ItemList.css';

interface FilmListProps {
  selectedUrl?: string | null;
  onNavigate?: (url: string, category: string) => void;
}

export function FilmList({ selectedUrl, onNavigate }: FilmListProps) {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    const loadFilms = async () => {
      try {
        setLoading(true);
        const data = await swapiService.getFilmsByPage(currentPage);
        const sortedFilms = data.results.sort((a, b) => a.episode_id - b.episode_id);
        setFilms(sortedFilms);
        setTotalCount(data.count);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load films');
        setFilms([]);
      } finally {
        setLoading(false);
      }
    };

    loadFilms();
  }, [currentPage]);

  useEffect(() => {
    if (selectedUrl) {      
      const film = films.find((f) => f.url === selectedUrl);
      if (film) {
        setSelectedFilm(film);
        return;
      }

      if (films.length > 0) {
        const loadDirectly = async () => {
          try {
            const data = await fetchFromUrl<Film>(selectedUrl);
            setSelectedFilm(data);
          } catch (err) {
            return;
          }
        };
        loadDirectly();
      }
    }
  }, [selectedUrl, films]);

  if (loading) return <div className="loading">Loading films...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="item-container">
      <div className="items-list">
        <ul>
          {films.map((film) => (
            <li
              key={film.url}
              onClick={() => setSelectedFilm(film)}
              className={selectedFilm?.url === film.url ? 'selected' : ''}
            >
              Episode {film.episode_id}: {film.title}
            </li>
          ))}
        </ul>
        
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              ←
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              →
            </button>
          </div>
        )}
      </div>

      {selectedFilm && (
        <div className="item-detail">
          <h3>Episode {selectedFilm.episode_id}: {selectedFilm.title}</h3>
          <div className="detail-grid">
            <div>
              <strong>Director:</strong> {selectedFilm.director}
            </div>
            <div>
              <strong>Producer:</strong> {selectedFilm.producer}
            </div>
            <div>
              <strong>Release Date:</strong> {selectedFilm.release_date}
            </div>
          </div>
          <div className="opening-crawl">
            <strong>Opening Crawl:</strong>
            <p>{selectedFilm.opening_crawl}</p>
          </div>

          <RelatedItems urls={selectedFilm.characters} label="Characters" onItemClick={onNavigate} />
          <RelatedItems urls={selectedFilm.planets} label="Planets" onItemClick={onNavigate} />
          <RelatedItems urls={selectedFilm.starships} label="Starships" onItemClick={onNavigate} />
          <RelatedItems urls={selectedFilm.vehicles} label="Vehicles" onItemClick={onNavigate} />
        </div>
      )}
    </div>
  );
}
