import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, AlertCircle, Droplets, Wind, Thermometer, Cloud } from 'lucide-react';
import { useClimateEngine } from './hooks/useClimateEngine';
import Silk from './components/Silk';
import MetricCard from './components/MetricCard';
import SearchIcon from './components/SearchIcon';

const interpolateRGB = (c1, c2, factor) => {
  const clamp = Math.max(0, Math.min(1, factor));
  const r = Math.round(c1[0] + clamp * (c2[0] - c1[0]));
  const g = Math.round(c1[1] + clamp * (c2[1] - c1[1]));
  const b = Math.round(c1[2] + clamp * (c2[2] - c1[2]));
  return `rgb(${r}, ${g}, ${b})`;
};

const getTemperatureColor = (temp) => {
  const t = parseFloat(temp);
  
  const colors = {
    coldest: [14, 165, 233], // Deep Cyan-Blue (-10C)
    cold: [56, 189, 248],    // Bright Light Blue (0C)
    mild: [167, 139, 250],   // Soft Violet (15C - perfectly skips Green!)
    warm: [251, 146, 60],    // Orange (25C)
    hot: [239, 68, 68]       // Red (40C)
  };

  if (t <= 0) return interpolateRGB(colors.coldest, colors.cold, (t + 10) / 10);
  if (t <= 15) return interpolateRGB(colors.cold, colors.mild, t / 15);
  if (t <= 25) return interpolateRGB(colors.mild, colors.warm, (t - 15) / 10);
  return interpolateRGB(colors.warm, colors.hot, (t - 25) / 15);
};

const AtmosDashboard = () => {
  const engine = useClimateEngine();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Dynamic weather-based visual settings
  const vibe = useMemo(() => {
    const data = engine.data;
    if (!data) return { color: '#6366f1', speed: 2, noise: 0.4, className: '' };
    
    // Extract precision metrics
    const temp = data.main.temp; // Assuming Celsius
    const humidity = data.main.humidity; // 0-100%
    const wind = data.wind.speed; // m/s
    
    // 1. Temperature drives the RGB Color Engine directly
    // This entirely skips the green/yellow phase utilizing our refined RGB interpolation.
    const isFahrenheit = temp > 55; // Auto-detect F vs C safely
    const normalizedTemp = isFahrenheit ? ((temp - 32) * 5/9) : temp;
    const dynamicColor = getTemperatureColor(normalizedTemp);

    // 2. Wind drives the Speed
    // 0m/s -> gentle base 1.5, High wind (20m/s) -> fast 8.5
    const dynamicSpeed = 1.5 + Math.min(wind / 2.5, 8.5);

    // 3. Humidity drives the Noise/Distortion
    // 0% -> smooth sphere (0.2), 100% -> highly distorted/cloudy (1.5)
    const dynamicNoise = 0.2 + (humidity / 100) * 1.3;

    // Retain base CSS structural classes
    const id = data.weather[0].id;
    const main = data.weather[0].main.toLowerCase();
    let className = 'weather-clouds';
    if (id === 800) className = 'weather-clear';
    else if (id < 600) className = id >= 200 && id < 300 ? 'weather-storm' : (id < 400 ? 'weather-drizzle' : 'weather-rain');
    else if (id < 700) className = 'weather-snow';
    else if (id < 800) className = main.includes('fog') ? 'weather-fog' : 'weather-mist';

    return { 
      color: dynamicColor, 
      speed: dynamicSpeed, 
      noise: dynamicNoise, 
      className 
    };
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

  // Handle keyboard navigation
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
    <div className={`weather-dashboard ${vibe.className}`}>
      {/* 3D Silk background */}
      <Silk color={vibe.color} speed={vibe.speed} noiseIntensity={vibe.noise} />
      
      {/* Overlay gradient */}
      <div className="dashboard-overlay" />
      
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
