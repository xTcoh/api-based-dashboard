import { useState, useEffect } from 'react';
import type { Vehicle } from '../services/swapiService';
import { swapiService, fetchFromUrl } from '../services/swapiService';
import { RelatedItems } from './RelatedItems';
import './ItemList.css';

interface VehicleListProps {
  selectedUrl?: string | null;
  onNavigate?: (url: string, category: string) => void;
}

export function VehicleList({ selectedUrl, onNavigate }: VehicleListProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true);
        const data = await swapiService.getVehiclesByPage(currentPage);
        setVehicles(data.results);
        setTotalCount(data.count);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vehicles');
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, [currentPage]);

  useEffect(() => {
    if (selectedUrl) {      
      const vehicle = vehicles.find((v) => v.url === selectedUrl);
      if (vehicle) {
        setSelectedVehicle(vehicle);
        return;
      }

      if (vehicles.length > 0) {
        const loadDirectly = async () => {
          try {
            const data = await fetchFromUrl<Vehicle>(selectedUrl);
            setSelectedVehicle(data);
          } catch (err) {
            return;
          }
        };
        loadDirectly();
      }
    }
  }, [selectedUrl, vehicles]);

  if (loading) return <div className="loading">Loading vehicles...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="item-container">
      <div className="items-list">
        <ul>
          {vehicles.map((vehicle) => (
            <li
              key={vehicle.url}
              onClick={() => setSelectedVehicle(vehicle)}
              className={selectedVehicle?.url === vehicle.url ? 'selected' : ''}
            >
              {vehicle.name}
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

      {selectedVehicle && (
        <div className="item-detail">
          <h3>{selectedVehicle.name}</h3>
          <div className="detail-grid">
            <div>
              <strong>Model:</strong> {selectedVehicle.model}
            </div>
            <div>
              <strong>Manufacturer:</strong> {selectedVehicle.manufacturer}
            </div>
            <div>
              <strong>Length:</strong> {selectedVehicle.length} m
            </div>
            <div>
              <strong>Max Speed:</strong> {selectedVehicle.max_atmosphering_speed} km/h
            </div>
            <div>
              <strong>Crew:</strong> {selectedVehicle.crew}
            </div>
            <div>
              <strong>Passengers:</strong> {selectedVehicle.passengers}
            </div>
            <div>
              <strong>Cargo Capacity:</strong> {selectedVehicle.cargo_capacity} kg
            </div>
            <div>
              <strong>Cost:</strong> {selectedVehicle.cost_in_credits} credits
            </div>
          </div>

          <RelatedItems urls={selectedVehicle.pilots} label="Pilots" onItemClick={onNavigate} />
          <RelatedItems urls={selectedVehicle.films} label="Films" onItemClick={onNavigate} />
        </div>
      )}
    </div>
  );
}
