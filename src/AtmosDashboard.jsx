import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, AlertCircle, Droplets, Wind, Thermometer, Cloud } from 'lucide-react';
import { useClimateEngine } from './hooks/useClimateEngine';
import WeatherBackground from './components/WeatherBackground';
import MetricCard from './components/MetricCard';
import SearchIcon from './components/SearchIcon';

// ============================================
// MAIN COMPONENT
// ============================================

const AtmosDashboard = () => {
  const engine = useClimateEngine();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Derive background params from live weather data
  const bgParams = useMemo(() => {
    const data = engine.data;
    if (!data) return { conditionId: 800, windSpeed: 0, isDay: true, humidity: 50 };

    const conditionId = data.weather[0].id;
    const windSpeed   = data.wind.speed;
    const humidity    = data.main.humidity;
    // OWM icon ends in 'd' for day, 'n' for night
    const isDay       = data.weather[0].icon?.endsWith('d') ?? true;

    return { conditionId, windSpeed, isDay, humidity };
  }, [engine.data]);

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

  const handleSelectLead = useCallback((lead) => {
    engine.lookupClimate(lead.name);
    setQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);
  }, [engine]);

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
      {/* Immersive atmospheric background */}
      <WeatherBackground
        conditionId={bgParams.conditionId}
        windSpeed={bgParams.windSpeed}
        isDay={bgParams.isDay}
        humidity={bgParams.humidity}
      />

      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* Main Weather Card */}
      <motion.main
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="weather-card"
      >
        {/* Header */}
        <header className="weather-header">
          <h1 className="weather-logo">ATMOS</h1>
          <button
            onClick={handleGetLocation}
            className="location-button"
            aria-label="Get current location"
          >
            <Navigation size={18} />
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
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
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
            <div key="loading" className="loading-container">
              <div className="loading-spinner" />
            </div>
          ) : engine.error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="error-container"
            >
              <AlertCircle size={44} />
              <p className="error-message">{engine.error}</p>
            </motion.div>
          ) : engine.data ? (
            <motion.div
              key={engine.data.name}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="weather-display"
            >
              <h2 className="weather-location">{engine.data.name}</h2>
              <p className="weather-description">{engine.data.weather[0].description}</p>
              <div className="temperature-display">
                {Math.round(engine.data.main.temp)}°
              </div>
              <div className="metrics-grid">
                <MetricCard icon={Droplets} value={`${engine.data.main.humidity}%`}         label="Humidity"   />
                <MetricCard icon={Wind}     value={`${Math.round(engine.data.wind.speed)} m/s`} label="Wind"  />
                <MetricCard icon={Thermometer} value={`${Math.round(engine.data.main.feels_like)}°`} label="Feels Like" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="empty-state"
            >
              <Cloud size={44} />
              <p className="empty-state-text">Search for a location</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
};

export default AtmosDashboard;
