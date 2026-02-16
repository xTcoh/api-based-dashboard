import { useState, useEffect } from 'react';
import type { Species } from '../services/swapiService';
import { swapiService, fetchFromUrl } from '../services/swapiService';
import { RelatedItems } from './RelatedItems';
import './ItemList.css';

interface SpeciesListProps {
  selectedUrl?: string | null;
  onNavigate?: (url: string, category: string) => void;
}

export function SpeciesList({ selectedUrl, onNavigate }: SpeciesListProps) {
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    const loadSpecies = async () => {
      try {
        setLoading(true);
        const data = await swapiService.getSpeciesByPage(currentPage);
        setSpecies(data.results);
        setTotalCount(data.count);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load species');
        setSpecies([]);
      } finally {
        setLoading(false);
      }
    };

    loadSpecies();
  }, [currentPage]);

  useEffect(() => {
    if (selectedUrl) {      
      const sp = species.find((s) => s.url === selectedUrl);
      if (sp) {
        setSelectedSpecies(sp);
        return;
      }

      if (species.length > 0) {
        const loadDirectly = async () => {
          try {
            const data = await fetchFromUrl<Species>(selectedUrl);
            setSelectedSpecies(data);
          } catch (err) {
            return;
          }
        };
        loadDirectly();
      }
    }
  }, [selectedUrl, species]);

  if (loading) return <div className="loading">Loading species...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="item-container">
      <div className="items-list">
        <ul>
          {species.map((sp) => (
            <li
              key={sp.url}
              onClick={() => setSelectedSpecies(sp)}
              className={selectedSpecies?.url === sp.url ? 'selected' : ''}
            >
              {sp.name}
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

      {selectedSpecies && (
        <div className="item-detail">
          <h3>{selectedSpecies.name}</h3>
          <div className="detail-grid">
            <div>
              <strong>Classification:</strong> {selectedSpecies.classification}
            </div>
            <div>
              <strong>Designation:</strong> {selectedSpecies.designation}
            </div>
            <div>
              <strong>Average Height:</strong> {selectedSpecies.average_height} cm
            </div>
            <div>
              <strong>Skin Colors:</strong> {selectedSpecies.skin_colors}
            </div>
            <div>
              <strong>Hair Colors:</strong> {selectedSpecies.hair_colors}
            </div>
            <div>
              <strong>Eye Colors:</strong> {selectedSpecies.eye_colors}
            </div>
            <div>
              <strong>Average Lifespan:</strong> {selectedSpecies.average_lifespan} years
            </div>
            <div>
              <strong>Language:</strong> {selectedSpecies.language}
            </div>
          </div>

          <RelatedItems urls={selectedSpecies.people} label="Characters" onItemClick={onNavigate} />
          <RelatedItems urls={selectedSpecies.films} label="Films" onItemClick={onNavigate} />
        </div>
      )}
    </div>
  );
}
