import { useState, useEffect } from 'react';
import type { Person } from '../services/swapiService';
import { swapiService, fetchFromUrl } from '../services/swapiService';
import { RelatedItems } from './RelatedItems';
import './ItemList.css';

interface PeopleListProps {
  selectedUrl?: string | null;
  onNavigate?: (url: string, category: string) => void;
}

export function PeopleList({ selectedUrl, onNavigate }: PeopleListProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    const loadPeople = async () => {
      try {
        setLoading(true);
        const data = await swapiService.getPeopleByPage(currentPage);
        setPeople(data.results);
        setTotalCount(data.count);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load people');
        setPeople([]);
      } finally {
        setLoading(false);
      }
    };

    loadPeople();
  }, [currentPage]);

  useEffect(() => {
    if (selectedUrl) {      
      const person = people.find((p) => p.url === selectedUrl);
      if (person) {
        setSelectedPerson(person);
        return;
      }

      if (people.length > 0) {
        const loadDirectly = async () => {
          try {
            const data = await fetchFromUrl<Person>(selectedUrl);
            setSelectedPerson(data);
          } catch (err) {
            return;
          }
        };
        loadDirectly();
      }
    }
  }, [selectedUrl, people]);

  if (loading) return <div className="loading">Loading characters...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="item-container">
      <div className="items-list">
        <ul>
          {people.map((person) => (
            <li
              key={person.url}
              onClick={() => setSelectedPerson(person)}
              className={selectedPerson?.url === person.url ? 'selected' : ''}
            >
              {person.name}
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

      {selectedPerson && (
        <div className="item-detail">
          <h3>{selectedPerson.name}</h3>
          <div className="detail-grid">
            <div>
              <strong>Height:</strong> {selectedPerson.height} cm
            </div>
            <div>
              <strong>Mass:</strong> {selectedPerson.mass} kg
            </div>
            <div>
              <strong>Hair:</strong> {selectedPerson.hair_color}
            </div>
            <div>
              <strong>Skin:</strong> {selectedPerson.skin_color}
            </div>
            <div>
              <strong>Eyes:</strong> {selectedPerson.eye_color}
            </div>
            <div>
              <strong>Birth Year:</strong> {selectedPerson.birth_year}
            </div>
            <div>
              <strong>Gender:</strong> {selectedPerson.gender}
            </div>
          </div>

          <RelatedItems urls={selectedPerson.films} label="Films" onItemClick={onNavigate} />
          <RelatedItems urls={selectedPerson.species} label="Species" onItemClick={onNavigate} />
          <RelatedItems urls={selectedPerson.vehicles} label="Vehicles" onItemClick={onNavigate} />
          <RelatedItems urls={selectedPerson.starships} label="Starships" onItemClick={onNavigate} />
        </div>
      )}
    </div>
  );
}
