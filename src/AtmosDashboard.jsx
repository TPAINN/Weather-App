import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, AlertCircle, Droplets, Wind, Thermometer, Cloud } from 'lucide-react';
import { useClimateEngine } from './hooks/useClimateEngine';
import Silk from './components/Silk';
import MetricCard from './components/MetricCard';
import SearchIcon from './components/SearchIcon';

// ============================================
// BACKGROUND PRESET DEFINITIONS
// ============================================

const BACKGROUND_PRESETS = {
  aurora: {
    name: 'Aurora Borealis',
    description: 'Flowing northern lights',
    className: 'bg-aurora',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" opacity="0.5"/>
        <circle cx="12" cy="12" r="4"/>
      </svg>
    )
  },
  liquid: {
    name: 'Liquid Glass',
    description: 'Smooth translucent waves',
    className: 'bg-liquid',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12c2-2 4-4 6-4s4 2 6 4 4 4 6 4 4-2 4-4"/>
        <path d="M2 18c2-2 4-4 6-4s4 2 6 4 4 4 6 4 4-2 4-4" opacity="0.5"/>
      </svg>
    )
  },
  mesh: {
    name: 'Mesh Gradient',
    description: 'Vibrant multi-color bloom',
    className: 'bg-mesh',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="8" cy="8" r="3"/>
        <circle cx="16" cy="16" r="3"/>
        <circle cx="16" cy="6" r="2"/>
        <circle cx="6" cy="16" r="2"/>
        <path d="M8 11l3 3M13 8l-3 3" opacity="0.5"/>
      </svg>
    )
  },
  ember: {
    name: 'Ember & Smoke',
    description: 'Warm rising particles',
    className: 'bg-ember',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22c-4 0-8-2-8-6 0-3 2-5 4-7 1 2 3 3 4 3s3-1 4-3c2 2 4 4 4 7 0 4-4 6-8 6z"/>
        <path d="M12 22c-2 0-4-1-4-3 0-1.5 1-2.5 2-3.5.5 1 1.5 1.5 2 1.5s1.5-.5 2-1.5c1 1 2 2 2 3.5 0 2-2 3-4 3z" opacity="0.6"/>
      </svg>
    )
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

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
    coldest: [14, 165, 233],  // Deep Cyan-Blue
    cold: [56, 189, 248],      // Bright Light Blue
    mild: [167, 139, 250],      // Soft Violet
    warm: [251, 146, 60],      // Orange
    hot: [239, 68, 68]          // Red
  };

  if (t <= 0) return interpolateRGB(colors.coldest, colors.cold, (t + 10) / 10);
  if (t <= 15) return interpolateRGB(colors.cold, colors.mild, t / 15);
  if (t <= 25) return interpolateRGB(colors.mild, colors.warm, (t - 15) / 10);
  return interpolateRGB(colors.warm, colors.hot, (t - 25) / 15);
};

const getTemperatureClass = (temp) => {
  if (temp < 10) return 'bg-temp-cold';
  if (temp < 20) return 'bg-temp-mild';
  if (temp < 30) return 'bg-temp-warm';
  return 'bg-temp-hot';
};

// ============================================
// EMBER PARTICLES COMPONENT
// ============================================

const EmberParticles = () => (
  <div className="floating-particles">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="ember-particle" />
    ))}
  </div>
);

// ============================================
// THEME SELECTOR COMPONENT
// ============================================

const ThemeSelector = ({ currentTheme, onThemeChange }) => (
  <div className="theme-selector">
    {Object.entries(BACKGROUND_PRESETS).map(([key, preset]) => (
      <button
        key={key}
        className={`theme-btn ${key} ${currentTheme === key ? 'active' : ''}`}
        onClick={() => onThemeChange(key)}
        title={preset.name}
        aria-label={`Switch to ${preset.name} background`}
      />
    ))}
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

const AtmosDashboard = () => {
  const engine = useClimateEngine();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [backgroundTheme, setBackgroundTheme] = useState('aurora');
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);
  const prevDataRef = useRef(null);

  // Dynamic vibe based on weather data with seamless transitions
  const vibe = useMemo(() => {
    const data = engine.data;
    if (!data) {
      return { 
        color: '#6366f1', 
        speed: 2, 
        noise: 0.4, 
        weatherClass: '',
        tempClass: '' 
      };
    }
    
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const wind = data.wind.speed;
    
    const isFahrenheit = temp > 55;
    const normalizedTemp = isFahrenheit ? ((temp - 32) * 5/9) : temp;
    const dynamicColor = getTemperatureColor(normalizedTemp);
    const dynamicSpeed = 1.5 + Math.min(wind / 2.5, 8.5);
    const dynamicNoise = 0.2 + (humidity / 100) * 1.3;
    
    const id = data.weather[0].id;
    const main = data.weather[0].main.toLowerCase();
    let weatherClass = 'weather-clouds';
    if (id === 800) weatherClass = 'weather-clear';
    else if (id < 600) weatherClass = id >= 200 && id < 300 ? 'weather-storm' : (id < 400 ? 'weather-drizzle' : 'weather-rain');
    else if (id < 700) weatherClass = 'weather-snow';
    else if (id < 800) weatherClass = main.includes('fog') ? 'weather-fog' : 'weather-mist';

    return { 
      color: dynamicColor, 
      speed: dynamicSpeed, 
      noise: dynamicNoise, 
      weatherClass,
      tempClass: getTemperatureClass(normalizedTemp)
    };
  }, [engine.data]);

  // Handle theme change with smooth transition
  const handleThemeChange = useCallback((theme) => {
    setBackgroundTheme(theme);
  }, []);

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

  // Combine all background classes
  const backgroundClasses = [
    'weather-dashboard',
    BACKGROUND_PRESETS[backgroundTheme]?.className || 'bg-aurora',
    vibe.weatherClass,
    vibe.tempClass
  ].filter(Boolean).join(' ');

  return (
    <div className={backgroundClasses}>
      {/* Theme Selector */}
      <ThemeSelector 
        currentTheme={backgroundTheme} 
        onThemeChange={handleThemeChange} 
      />
      
      {/* 3D Silk background - smooth color transitions */}
      <Silk 
        color={vibe.color} 
        speed={vibe.speed} 
        noiseIntensity={vibe.noise} 
      />
      
      {/* Aurora Morphing Blobs */}
      <div className="aurora-container">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        <div className="aurora-blob aurora-blob-4" />
      </div>
      
      {/* Floating Orbs */}
      <div className="floating-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="orb orb-5" />
        <div className="orb orb-6" />
      </div>
      
      {/* Ember Particles (only show for ember theme) */}
      <AnimatePresence>
        {backgroundTheme === 'ember' && <EmberParticles />}
      </AnimatePresence>
      
      {/* Noise Overlay */}
      <div className="noise-overlay" />
      
      {/* Dashboard Overlay */}
      <div className="dashboard-overlay" />
      
      {/* Main Weather Card */}
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

        {/* Weather Display - Seamless Transitions */}
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
              <AlertCircle size={48} />
              <p className="error-message">{engine.error}</p>
            </motion.div>
          ) : engine.data ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
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
              transition={{ duration: 0.3 }}
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
