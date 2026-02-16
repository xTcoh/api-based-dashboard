import { useState, useEffect } from 'react';
import type { Starship } from '../services/swapiService';
import { swapiService, fetchFromUrl } from '../services/swapiService';
import { RelatedItems } from './RelatedItems';
import './ItemList.css';

interface StarshipListProps {
  selectedUrl?: string | null;
  onNavigate?: (url: string, category: string) => void;
}

export function StarshipList({ selectedUrl, onNavigate }: StarshipListProps) {
  const [starships, setStarships] = useState<Starship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStarship, setSelectedStarship] = useState<Starship | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    const loadStarships = async () => {
      try {
        setLoading(true);
        const data = await swapiService.getStarshipsByPage(currentPage);
        setStarships(data.results);
        setTotalCount(data.count);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load starships');
        setStarships([]);
      } finally {
        setLoading(false);
      }
    };

    loadStarships();
  }, [currentPage]);

  useEffect(() => {
    if (selectedUrl) {      
      const starship = starships.find((s) => s.url === selectedUrl);
      if (starship) {
        setSelectedStarship(starship);
        return;
      }

      if (starships.length > 0) {
        const loadDirectly = async () => {
          try {
            const data = await fetchFromUrl<Starship>(selectedUrl);
            setSelectedStarship(data);
          } catch (err) {
            return;
          }
        };
        loadDirectly();
      }
    }
  }, [selectedUrl, starships]);

  if (loading) return <div className="loading">Loading starships...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="item-container">
      <div className="items-list">
        <ul>
          {starships.map((starship) => (
            <li
              key={starship.url}
              onClick={() => setSelectedStarship(starship)}
              className={selectedStarship?.url === starship.url ? 'selected' : ''}
            >
              {starship.name}
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

      {selectedStarship && (
        <div className="item-detail">
          <h3>{selectedStarship.name}</h3>
          <div className="detail-grid">
            <div>
              <strong>Model:</strong> {selectedStarship.model}
            </div>
            <div>
              <strong>Manufacturer:</strong> {selectedStarship.manufacturer}
            </div>
            <div>
              <strong>Length:</strong> {selectedStarship.length} m
            </div>
            <div>
              <strong>Max Speed:</strong> {selectedStarship.max_atmosphering_speed} km/h
            </div>
            <div>
              <strong>Crew:</strong> {selectedStarship.crew}
            </div>
            <div>
              <strong>Passengers:</strong> {selectedStarship.passengers}
            </div>
            <div>
              <strong>Cargo Capacity:</strong> {selectedStarship.cargo_capacity} kg
            </div>
            <div>
              <strong>Hyperdrive Rating:</strong> {selectedStarship.hyperdrive_rating}
            </div>
            <div>
              <strong>Cost:</strong> {selectedStarship.cost_in_credits} credits
            </div>
          </div>

          <RelatedItems urls={selectedStarship.pilots} label="Pilots" onItemClick={onNavigate} />
          <RelatedItems urls={selectedStarship.films} label="Films" onItemClick={onNavigate} />
        </div>
      )}
    </div>
  );
}
