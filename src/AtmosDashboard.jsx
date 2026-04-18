import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, AlertCircle, Droplets, Wind, Thermometer, Cloud } from 'lucide-react';
import { useClimateEngine } from './hooks/useClimateEngine';
import WeatherBackground from './components/WeatherBackground';
import MetricCard from './components/MetricCard';
import SearchIcon from './components/SearchIcon';

const AtmosDashboard = () => {
  const engine = useClimateEngine();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Derive weather background params from live API data
  const conditionId  = engine.data?.weather[0]?.id       ?? 800;
  const windSpeed    = engine.data?.wind?.speed           ?? 0;
  const isDay        = engine.data?.weather[0]?.icon
    ? engine.data.weather[0].icon.endsWith('d')
    : true;

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || engine.leads.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % engine.leads.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + engine.leads.length) % engine.leads.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && engine.leads[selectedIndex]) {
          handleSelectLead(engine.leads[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectLead = (lead) => {
    engine.lookupClimate(lead.name);
    setQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(true);
    setSelectedIndex(-1);
    engine.fetchLeads(value);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => engine.lookupClimate({ lat: pos.coords.latitude, lon: pos.coords.longitude }, true),
        (err) => console.error('Location error:', err)
      );
    }
  };

  return (
    <div className="weather-dashboard">
      {/* Immersive weather background */}
      <WeatherBackground
        conditionId={conditionId}
        windSpeed={windSpeed}
        isDay={isDay}
      />

      {/* Main weather card */}
      <motion.main
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="weather-card"
      >
        {/* Header */}
        <header className="weather-header">
          <h1 className="weather-logo">CLIMATE WEATHER</h1>
          <button
            onClick={handleGetLocation}
            className="location-button"
            aria-label="Get current location"
          >
            <Navigation size={20} />
          </button>
        </header>

        {/* Search */}
        <div className="search-container" ref={searchContainerRef}>
          <div className="search-icon-container">
            <SearchIcon isLoading={engine.leadsLoading} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
            placeholder="Search city..."
            className="search-input"
            aria-label="Search for a city"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            autoComplete="off"
          />
          <AnimatePresence>
            {showDropdown && (engine.leads.length > 0 || (query.length >= 2 && !engine.leadsLoading)) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="search-results"
                role="listbox"
              >
                {engine.leads.length === 0 ? (
                  <div className="search-no-results">No cities found</div>
                ) : (
                  engine.leads.map((lead, index) => (
                    <button
                      key={`${lead.name}-${lead.country}-${index}`}
                      onClick={() => handleSelectLead(lead)}
                      className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                      role="option"
                      aria-selected={index === selectedIndex}
                    >
                      <span className="search-result-city">{lead.name}</span>
                      <span className="search-result-country">{lead.country}</span>
                      {lead.state && <span className="search-result-state">{lead.state}</span>}
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Weather Display */}
        <AnimatePresence mode="wait">
          {engine.status === 'busy' ? (
            <div className="loading-container">
              <div className="loading-spinner" />
            </div>
          ) : engine.error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="error-container"
            >
              <AlertCircle size={48} />
              <p className="error-message">{engine.error}</p>
            </motion.div>
          ) : engine.data ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="weather-display"
            >
              <h2 className="weather-location">{engine.data.name}</h2>
              <p className="weather-description">{engine.data.weather[0].description}</p>
              <div className="temperature-display">{Math.round(engine.data.main.temp)}°</div>
              <div className="metrics-grid">
                <MetricCard
                  icon={Droplets}
                  value={`${engine.data.main.humidity}%`}
                  label="Humidity"
                />
                <MetricCard
                  icon={Wind}
                  value={`${Math.round(engine.data.wind.speed)} m/s`}
                  label="Wind"
                />
                <MetricCard
                  icon={Thermometer}
                  value={`${Math.round(engine.data.main.feels_like)}°`}
                  label="Feels Like"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="empty-state"
            >
              <Cloud size={48} />
              <p className="empty-state-text">Search for a location</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
};

export default AtmosDashboard;
