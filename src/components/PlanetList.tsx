import { useState, useEffect } from 'react';
import type { Planet } from '../services/swapiService';
import { swapiService, fetchFromUrl } from '../services/swapiService';
import { RelatedItems } from './RelatedItems';
import './ItemList.css';

interface PlanetListProps {
  selectedUrl?: string | null;
  onNavigate?: (url: string, category: string) => void;
}

export function PlanetList({ selectedUrl, onNavigate }: PlanetListProps) {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    const loadPlanets = async () => {
      try {
        setLoading(true);
        const data = await swapiService.getPlanetsByPage(currentPage);
        setPlanets(data.results);
        setTotalCount(data.count);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load planets');
        setPlanets([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlanets();
  }, [currentPage]);

  useEffect(() => {
    if (selectedUrl) {
      const planet = planets.find((p) => p.url === selectedUrl);
      if (planet) {
        setSelectedPlanet(planet);
        return;
      }

      if (planets.length > 0) {
        const loadDirectly = async () => {
          try {
            const data = await fetchFromUrl<Planet>(selectedUrl);
            setSelectedPlanet(data);
          } catch (err) {
            return;
          }
        };
        loadDirectly();
      }
    }
  }, [selectedUrl, planets]);

  if (loading) return <div className="loading">Loading planets...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="item-container">
      <div className="items-list">
        <ul>
          {planets.map((planet) => (
            <li
              key={planet.url}
              onClick={() => setSelectedPlanet(planet)}
              className={selectedPlanet?.url === planet.url ? 'selected' : ''}
            >
              {planet.name}
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

      {selectedPlanet && (
        <div className="item-detail">
          <h3>{selectedPlanet.name}</h3>
          <div className="detail-grid">
            <div>
              <strong>Diameter:</strong> {selectedPlanet.diameter} km
            </div>
            <div>
              <strong>Climate:</strong> {selectedPlanet.climate}
            </div>
            <div>
              <strong>Gravity:</strong> {selectedPlanet.gravity}
            </div>
            <div>
              <strong>Terrain:</strong> {selectedPlanet.terrain}
            </div>
            <div>
              <strong>Population:</strong> {selectedPlanet.population}
            </div>
            <div>
              <strong>Rotation Period:</strong> {selectedPlanet.rotation_period} hours
            </div>
            <div>
              <strong>Orbital Period:</strong> {selectedPlanet.orbital_period} days
            </div>
            <div>
              <strong>Surface Water:</strong> {selectedPlanet.surface_water}%
            </div>
          </div>

          <RelatedItems urls={selectedPlanet.residents} label="Residents" onItemClick={onNavigate} />
          <RelatedItems urls={selectedPlanet.films} label="Films" onItemClick={onNavigate} />
        </div>
      )}
    </div>
  );
}
