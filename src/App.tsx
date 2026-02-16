import { useState } from 'react';
import { PeopleList } from './components/PeopleList';
import { FilmList } from './components/FilmList';
import { PlanetList } from './components/PlanetList';
import { StarshipList } from './components/StarshipList';
import { VehicleList } from './components/VehicleList';
import { SpeciesList } from './components/SpeciesList';
import './App.css';
import Logo from './assets/Star_Wars_Logo.png'

type Category = 'characters' | 'films' | 'planets' | 'starships' | 'vehicles' | 'species';

function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('characters');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const categories: { id: Category; label: string}[] = [
    { id: 'characters', label: 'Characters' },
    { id: 'films', label: 'Films' },
    { id: 'planets', label: 'Planets'},
    { id: 'starships', label: 'Starships' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'species', label: 'Species'},
  ];

  const categoryMap: Record<string, Category> = {
    people: 'characters',
    films: 'films',
    planets: 'planets',
    starships: 'starships',
    vehicles: 'vehicles',
    species: 'species',
  };

  const handleNavigateToRelated = (url: string, category: string) => {
    const mappedCategory = categoryMap[category] || (category as Category);
    setActiveCategory(mappedCategory);
    setSelectedUrl(url);
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'characters':
        return <PeopleList selectedUrl={selectedUrl} onNavigate={handleNavigateToRelated} />;
      case 'films':
        return <FilmList selectedUrl={selectedUrl} onNavigate={handleNavigateToRelated} />;
      case 'planets':
        return <PlanetList selectedUrl={selectedUrl} onNavigate={handleNavigateToRelated} />;
      case 'starships':
        return <StarshipList selectedUrl={selectedUrl} onNavigate={handleNavigateToRelated} />;
      case 'vehicles':
        return <VehicleList selectedUrl={selectedUrl} onNavigate={handleNavigateToRelated} />;
      case 'species':
        return <SpeciesList selectedUrl={selectedUrl} onNavigate={handleNavigateToRelated} />;
      default:
        return null;
    }
  };

  return (
    <>

      <div className="bg-wrapper">
        <div id='stars'></div>
        <div id='stars2'></div>
        <div id='stars3'></div>
      </div>
      <header className="app-header">
        <img className="title-image" src={Logo} />
        <nav className="nav-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedUrl(null);
              }}
              className={`nav-button ${activeCategory === cat.id ? 'active' : ''}`}
              title={cat.label}
            >
              <span className="label">{cat.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {renderContent()}
      </main>
    </>
  );
}

export default App;
