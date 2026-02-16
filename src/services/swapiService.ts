const BASE_URL = 'https://swapi.py4e.com/api';

export interface Person {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld?: string;
  films?: string[];
  species?: string[];
  vehicles?: string[];
  starships?: string[];
  url: string;
}

export interface Film {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  characters?: string[];
  planets?: string[];
  starships?: string[];
  vehicles?: string[];
  url: string;
}

export interface Planet {
  name: string;
  rotation_period: string;
  orbital_period: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surface_water: string;
  population: string;
  residents?: string[];
  films?: string[];
  url: string;
}

export interface Starship {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  max_atmosphering_speed: string;
  crew: string;
  passengers: string;
  cargo_capacity: string;
  hyperdrive_rating: string;
  pilots?: string[];
  films?: string[];
  url: string;
}

export interface Vehicle {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  max_atmosphering_speed: string;
  crew: string;
  passengers: string;
  cargo_capacity: string;
  pilots?: string[];
  films?: string[];
  url: string;
}

export interface Species {
  name: string;
  classification: string;
  designation: string;
  average_height: string;
  skin_colors: string;
  hair_colors: string;
  eye_colors: string;
  average_lifespan: string;
  homeworld?: string;
  people?: string[];
  films?: string[];
  language: string;
  url: string;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

async function fetchFromApi<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchFromUrl<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${url}: ${response.statusText}`);
  }
  return response.json();
}

export function extractIdFromUrl(url: string): string {
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 1];
}

export function getCategoryFromUrl(url: string): string {
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 2] || '';
}

export const swapiService = {
  getPeopleByPage: (page: number) => fetchFromApi<Person>(`/people/?page=${page}`),
  getFilmsByPage: (page: number) => fetchFromApi<Film>(`/films/?page=${page}`),
  getPlanetsByPage: (page: number) => fetchFromApi<Planet>(`/planets/?page=${page}`),
  getStarshipsByPage: (page: number) => fetchFromApi<Starship>(`/starships/?page=${page}`),
  getVehiclesByPage: (page: number) => fetchFromApi<Vehicle>(`/vehicles/?page=${page}`),
  getSpeciesByPage: (page: number) => fetchFromApi<Species>(`/species/?page=${page}`),
  fetchFromUrl,
};
