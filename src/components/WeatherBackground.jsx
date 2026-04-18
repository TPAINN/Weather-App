import React, { useMemo } from 'react';
import SkyCanvas from './SkyCanvas';
import ParticleCanvas from './ParticleCanvas';

// ── Weather Profile Engine ─────────────────────────────────────────────────

function getProfile(id, wind = 0, isDay = true) {
  const w = Math.min(wind, 35);

  // Clear
  if (id === 800) {
    return isDay ? {
      sky: { z: '#041e52', m: '#0d4a96', ml: '#2a78c8', h: '#d4843a', g: '#a05e20' },
      sun: { x: 68, y: 20, r: 56, glow: 'rgba(255,210,90,' },
      moon: null, clouds: null, particles: null,
      fog: null, haze: null, lightning: false,
      vignette: 'rgba(0,8,28,0.28)',
    } : {
      sky: { z: '#010810', m: '#04101e', ml: '#080f26', h: '#0d1832', g: '#050c18' },
      sun: null,
      moon: { x: 72, y: 18, r: 30, glow: 'rgba(200,218,255,' },
      clouds: null,
      particles: { type: 'stars', count: 240, colors: ['rgba(255,255,255,', 'rgba(190,205,255,', 'rgba(255,245,200,'], speed: { x: 0, y: 0 }, size: { min: 0.4, max: 2.1 } },
      fog: null, haze: null, lightning: false,
      vignette: 'rgba(0,0,12,0.52)',
    };
  }

  // Few clouds
  if (id === 801) {
    return isDay ? {
      sky: { z: '#083070', m: '#1055a5', ml: '#2d80c5', h: '#c8b868', g: '#a09050' },
      sun: { x: 70, y: 24, r: 46, glow: 'rgba(255,225,130,' },
      moon: null,
      clouds: { type: 'wispy', count: 4, density: 0.32, speed: 0.014, color: 'rgba(255,255,255,' },
      particles: null, fog: null, haze: null, lightning: false,
      vignette: 'rgba(0,8,28,0.2)',
    } : {
      sky: { z: '#010918', m: '#050e20', ml: '#091528', h: '#0f1e38', g: '#07101e' },
      sun: null,
      moon: { x: 66, y: 20, r: 25, glow: 'rgba(195,215,255,' },
      clouds: { type: 'wispy', count: 3, density: 0.24, speed: 0.009, color: 'rgba(75,95,130,' },
      particles: { type: 'stars', count: 160, colors: ['rgba(255,255,255,', 'rgba(190,205,255,'], speed: { x: 0, y: 0 }, size: { min: 0.4, max: 1.6 } },
      fog: null, haze: null, lightning: false,
      vignette: 'rgba(0,0,12,0.45)',
    };
  }

  // Scattered clouds
  if (id === 802) {
    return isDay ? {
      sky: { z: '#0b3272', m: '#1558a5', ml: '#3d86c5', h: '#b8c2d0', g: '#90a0b0' },
      sun: { x: 65, y: 28, r: 38, glow: 'rgba(255,220,150,' },
      moon: null,
      clouds: { type: 'cumulus', count: 6, density: 0.55, speed: 0.017, color: 'rgba(240,245,255,' },
      particles: null, fog: null, haze: null, lightning: false,
      vignette: 'rgba(0,8,28,0.18)',
    } : {
      sky: { z: '#010810', m: '#040c1c', ml: '#081228', h: '#0d1a30', g: '#060c18' },
      sun: null,
      moon: { x: 60, y: 22, r: 22, glow: 'rgba(180,200,240,' },
      clouds: { type: 'cumulus', count: 5, density: 0.44, speed: 0.011, color: 'rgba(42,58,85,' },
      particles: { type: 'stars', count: 110, colors: ['rgba(255,255,255,', 'rgba(190,205,255,'], speed: { x: 0, y: 0 }, size: { min: 0.4, max: 1.5 } },
      fog: null, haze: null, lightning: false,
      vignette: 'rgba(0,0,10,0.4)',
    };
  }

  // Broken clouds
  if (id === 803) {
    return isDay ? {
      sky: { z: '#182535', m: '#223248', ml: '#384d68', h: '#6888a5', g: '#506575' },
      sun: { x: 60, y: 32, r: 30, glow: 'rgba(255,210,170,' },
      moon: null,
      clouds: { type: 'cumulus', count: 9, density: 0.8, speed: 0.02, color: 'rgba(208,218,232,' },
      particles: null, fog: null, haze: null, lightning: false,
      vignette: 'rgba(0,5,18,0.32)',
    } : {
      sky: { z: '#020508', m: '#050910', ml: '#090d18', h: '#0d1420', g: '#050a10' },
      sun: null,
      moon: { x: 55, y: 25, r: 18, glow: 'rgba(160,180,225,' },
      clouds: { type: 'cumulus', count: 7, density: 0.72, speed: 0.013, color: 'rgba(28,38,55,' },
      particles: { type: 'stars', count: 65, colors: ['rgba(255,255,255,'], speed: { x: 0, y: 0 }, size: { min: 0.4, max: 1.3 } },
      fog: null, haze: null, lightning: false,
      vignette: 'rgba(0,0,8,0.48)',
    };
  }

  // Overcast
  if (id === 804) {
    return {
      sky: { z: '#1c2028', m: '#2c3040', ml: '#3e4455', h: '#68727e', g: '#505860' },
      sun: null, moon: null,
      clouds: { type: 'stratus', count: 14, density: 1.0, speed: 0.007, color: 'rgba(175,185,200,' },
      particles: null,
      fog: { density: 0.14, color: 'rgba(155,165,178,' }, haze: null, lightning: false,
      vignette: 'rgba(0,0,10,0.4)',
    };
  }

  // Thunderstorm
  if (id >= 200 && id <= 232) {
    return {
      sky: { z: '#050608', m: '#08090f', ml: '#0c0f18', h: '#141825', g: '#0a0c15' },
      sun: null, moon: null,
      clouds: { type: 'storm', count: 16, density: 1.0, speed: 0.028, color: 'rgba(18,16,28,' },
      particles: { type: 'rain', count: 360, colors: ['rgba(148,168,200,', 'rgba(128,152,188,'], speed: { x: Math.min(w * 0.7, 10), y: 18 }, size: { min: 1, max: 2 }, length: { min: 14, max: 32 } },
      fog: { density: 0.42, color: 'rgba(28,32,45,' }, haze: null,
      lightning: { freq: 0.35, color: 'rgba(210,225,255,' },
      vignette: 'rgba(0,0,18,0.7)',
    };
  }

  // Drizzle
  if (id >= 300 && id <= 321) {
    return {
      sky: { z: '#1a2330', m: '#263445', ml: '#364855', h: '#587080', g: '#485868' },
      sun: null, moon: null,
      clouds: { type: 'stratus', count: 11, density: 0.92, speed: 0.009, color: 'rgba(158,168,185,' },
      particles: { type: 'drizzle', count: 130, colors: ['rgba(178,198,220,'], speed: { x: Math.min(w * 0.3, 2.5), y: 4.5 }, size: { min: 0.8, max: 1.4 }, length: { min: 5, max: 9 } },
      fog: { density: 0.24, color: 'rgba(145,162,178,' }, haze: null, lightning: false,
      vignette: 'rgba(0,5,15,0.32)',
    };
  }

  // Light/moderate rain
  if (id === 500 || id === 501) {
    return {
      sky: { z: '#131c28', m: '#1c2c3c', ml: '#263c52', h: '#3e5868', g: '#304858' },
      sun: null, moon: null,
      clouds: { type: 'stratus', count: 11, density: 0.95, speed: 0.011, color: 'rgba(138,152,168,' },
      particles: { type: 'rain', count: id === 500 ? 190 : 230, colors: ['rgba(168,190,215,', 'rgba(148,172,205,'], speed: { x: Math.min(w * 0.45, 4.5), y: id === 500 ? 9 : 12 }, size: { min: 0.8, max: 1.5 }, length: { min: 10, max: 20 } },
      fog: { density: 0.28, color: 'rgba(125,145,162,' }, haze: null, lightning: false,
      vignette: 'rgba(0,5,15,0.4)',
    };
  }

  // Heavy rain / showers
  if (id >= 502 && id <= 531) {
    const heavy = [502, 503, 504, 522, 531].includes(id);
    return {
      sky: { z: '#0a1218', m: '#121c28', ml: '#1a2a38', h: '#283a4a', g: '#182030' },
      sun: null, moon: null,
      clouds: { type: 'stratus', count: 13, density: 1.0, speed: 0.014, color: 'rgba(88,102,118,' },
      particles: { type: 'rain', count: heavy ? 400 : 280, colors: ['rgba(138,162,195,', 'rgba(118,145,182,'], speed: { x: Math.min(w * 0.6, 7), y: heavy ? 21 : 15 }, size: { min: 0.9, max: heavy ? 2 : 1.8 }, length: { min: 11, max: heavy ? 36 : 26 } },
      fog: { density: heavy ? 0.48 : 0.34, color: 'rgba(75,92,110,' }, haze: null, lightning: false,
      vignette: 'rgba(0,5,15,0.56)',
    };
  }

  // Light snow / flurries
  if (id === 600 || id === 620) {
    return {
      sky: { z: '#485560', m: '#606e7a', ml: '#80909a', h: '#b0bec8', g: '#98aab5' },
      sun: null, moon: null,
      clouds: { type: 'stratus', count: 8, density: 0.85, speed: 0.007, color: 'rgba(198,208,220,' },
      particles: { type: 'snow', count: 120, colors: ['rgba(255,255,255,', 'rgba(235,242,252,', 'rgba(218,228,245,'], speed: { x: Math.min(w * 0.25, 1.8), y: 1.4 }, size: { min: 1.8, max: 4.5 } },
      fog: { density: 0.1, color: 'rgba(218,228,238,' }, haze: null, lightning: false,
      vignette: 'rgba(28,38,58,0.2)',
    };
  }

  // Snow
  if (id === 601) {
    return {
      sky: { z: '#4e5c68', m: '#6a7882', ml: '#8a9aa8', h: '#bec8d2', g: '#a8b8c2' },
      sun: null, moon: null,
      clouds: { type: 'stratus', count: 10, density: 0.96, speed: 0.006, color: 'rgba(208,218,230,' },
      particles: { type: 'snow', count: 210, colors: ['rgba(255,255,255,', 'rgba(238,244,255,', 'rgba(222,230,248,'], speed: { x: Math.min(w * 0.3, 2.5), y: 2 }, size: { min: 2, max: 6.5 } },
      fog: { density: 0.2, color: 'rgba(232,240,250,' }, haze: null, lightning: false,
      vignette: 'rgba(18,32,52,0.16)',
    };
  }

  // Heavy snow
  if (id === 602) {
    return {
      sky: { z: '#5e6870', m: '#78858e', ml: '#98a5ae', h: '#ccd4dc', g: '#bcC8d0' },
      sun: null, moon: null,
      clouds: { type: 'stratus', count: 13, density: 1.0, speed: 0.005, color: 'rgba(218,226,236,' },
      particles: { type: 'snow', count: 340, colors: ['rgba(255,255,255,', 'rgba(245,248,255,'], speed: { x: Math.min(w * 0.45, 4.5), y: 3.2 }, size: { min: 2.5, max: 8.5 } },
      fog: { density: 0.42, color: 'rgba(238,244,252,' }, haze: null, lightning: false,
      vignette: 'rgba(8,22,42,0.16)',
    };
  }

  // Sleet / freezing rain
  if (id >= 611 && id <= 616) {
    return {
      sky: { z: '#282e38', m: '#363e4a', ml: '#484e5c', h: '#788090', g: '#60686e' },
      sun: null, moon: null,
      clouds: { type: 'stratus', count: 11, density: 0.95, speed: 0.01, color: 'rgba(148,160,175,' },
      particles: { type: 'sleet', count: 230, colors: ['rgba(198,215,232,', 'rgba(255,255,255,'], speed: { x: Math.min(w * 0.45, 4), y: 8 }, size: { min: 1.2, max: 3.2 } },
      fog: { density: 0.32, color: 'rgba(138,152,168,' }, haze: null, lightning: false,
      vignette: 'rgba(0,8,20,0.4)',
    };
  }

  // Snow showers
  if (id === 621 || id === 622) {
    return {
      sky: { z: '#363c46', m: '#464e58', ml: '#5e6670', h: '#8e98a5', g: '#787f88' },
      sun: null, moon: null,
      clouds: { type: 'cumulus', count: 9, density: 0.85, speed: 0.017, color: 'rgba(188,200,215,' },
      particles: { type: 'snow', count: 185, colors: ['rgba(255,255,255,', 'rgba(238,244,255,'], speed: { x: Math.min(w * 0.45, 5), y: 3.8 }, size: { min: 1.8, max: 6 } },
      fog: { density: 0.2, color: 'rgba(198,210,225,' }, haze: null, lightning: false,
      vignette: 'rgba(8,18,38,0.26)',
    };
  }

  // Mist
  if (id === 701) {
    return {
      sky: { z: '#383e45', m: '#4e5560', ml: '#686e78', h: '#8e9298', g: '#787e85' },
      sun: null, moon: null, clouds: null, particles: null,
      fog: { density: 0.6, color: 'rgba(168,176,188,' }, haze: null, lightning: false,
      vignette: 'rgba(0,5,15,0.32)',
    };
  }

  // Smoke
  if (id === 711) {
    return {
      sky: { z: '#181610', m: '#221f14', ml: '#2e2c1c', h: '#4a4830', g: '#363420' },
      sun: { x: 60, y: 32, r: 25, glow: 'rgba(198,130,50,' },
      moon: null, clouds: null,
      particles: { type: 'smoke', count: 85, colors: ['rgba(95,90,68,', 'rgba(75,72,55,', 'rgba(115,110,85,'], speed: { x: Math.min(w * 0.4, 3), y: -1.4 }, size: { min: 18, max: 45 } },
      fog: { density: 0.52, color: 'rgba(75,70,50,' },
      haze: { color: 'rgba(115,95,52,' }, lightning: false,
      vignette: 'rgba(10,8,0,0.56)',
    };
  }

  // Haze
  if (id === 721) {
    return {
      sky: { z: '#584820', m: '#7a6030', ml: '#9a7840', h: '#c09858', g: '#a07840' },
      sun: { x: 64, y: 28, r: 34, glow: 'rgba(220,155,58,' },
      moon: null, clouds: null, particles: null,
      fog: { density: 0.38, color: 'rgba(178,145,78,' },
      haze: { color: 'rgba(195,162,78,' }, lightning: false,
      vignette: 'rgba(20,12,0,0.4)',
    };
  }

  // Dust whirls
  if (id === 731) {
    return {
      sky: { z: '#582e0e', m: '#784a1c', ml: '#98642c', h: '#be8e48', g: '#9e6e32' },
      sun: { x: 62, y: 26, r: 26, glow: 'rgba(218,145,48,' },
      moon: null, clouds: null,
      particles: { type: 'dust', count: 260, colors: ['rgba(188,138,65,', 'rgba(165,118,50,', 'rgba(208,158,82,'], speed: { x: Math.min(w * 1.5, 14), y: 0.5 }, size: { min: 1, max: 3 } },
      fog: null, haze: { color: 'rgba(195,145,58,' }, lightning: false,
      vignette: 'rgba(24,12,0,0.5)',
    };
  }

  // Fog
  if (id === 741) {
    return {
      sky: { z: '#282c32', m: '#383e46', ml: '#4e5660', h: '#78808a', g: '#5e6670' },
      sun: null, moon: null, clouds: null, particles: null,
      fog: { density: 0.9, color: 'rgba(150,160,172,' }, haze: null, lightning: false,
      vignette: 'rgba(0,5,15,0.4)',
    };
  }

  // Sand
  if (id === 751) {
    return {
      sky: { z: '#684818', m: '#886228', ml: '#a87a38', h: '#ce9850', g: '#ae7838' },
      sun: { x: 68, y: 22, r: 22, glow: 'rgba(228,158,48,' },
      moon: null, clouds: null,
      particles: { type: 'dust', count: 310, colors: ['rgba(198,152,72,', 'rgba(172,128,52,', 'rgba(218,168,88,'], speed: { x: Math.min(w * 2, 20), y: 0.8 }, size: { min: 0.8, max: 2 } },
      fog: null, haze: { color: 'rgba(208,152,62,' }, lightning: false,
      vignette: 'rgba(28,14,0,0.54)',
    };
  }

  // Dust
  if (id === 761) {
    return {
      sky: { z: '#483618', m: '#684e22', ml: '#886630', h: '#ae8646', g: '#8e6a2e' },
      sun: { x: 60, y: 30, r: 20, glow: 'rgba(208,145,48,' },
      moon: null, clouds: null,
      particles: { type: 'dust', count: 210, colors: ['rgba(178,132,58,', 'rgba(155,110,42,', 'rgba(198,152,72,'], speed: { x: Math.min(w * 1.7, 17), y: 0.6 }, size: { min: 0.8, max: 2.5 } },
      fog: null, haze: { color: 'rgba(182,135,58,' }, lightning: false,
      vignette: 'rgba(20,10,0,0.48)',
    };
  }

  // Ash
  if (id === 762) {
    return {
      sky: { z: '#1a1810', m: '#262418', ml: '#323020', h: '#565236', g: '#3e3c28' },
      sun: { x: 58, y: 34, r: 20, glow: 'rgba(178,118,38,' },
      moon: null, clouds: null,
      particles: { type: 'ash', count: 155, colors: ['rgba(135,128,108,', 'rgba(98,92,75,', 'rgba(158,150,128,'], speed: { x: Math.min(w * 0.4, 3.5), y: -0.7 }, size: { min: 1.2, max: 4 } },
      fog: { density: 0.48, color: 'rgba(88,82,62,' },
      haze: { color: 'rgba(125,118,82,' }, lightning: false,
      vignette: 'rgba(14,10,0,0.6)',
    };
  }

  // Squall
  if (id === 771) {
    return {
      sky: { z: '#0c1220', m: '#121a28', ml: '#1c2438', h: '#2c3a4a', g: '#182030' },
      sun: null, moon: null,
      clouds: { type: 'storm', count: 13, density: 0.98, speed: 0.04, color: 'rgba(28,32,48,' },
      particles: { type: 'rain', count: 310, colors: ['rgba(148,168,200,'], speed: { x: Math.min(w * 1.1, 18), y: 16 }, size: { min: 0.9, max: 2 }, length: { min: 12, max: 28 } },
      fog: { density: 0.38, color: 'rgba(48,58,72,' }, haze: null, lightning: false,
      vignette: 'rgba(0,5,18,0.6)',
    };
  }

  // Tornado
  if (id === 781) {
    return {
      sky: { z: '#040810', m: '#080b18', ml: '#0a1020', h: '#121a28', g: '#080e18' },
      sun: null, moon: null,
      clouds: { type: 'storm', count: 18, density: 1.0, speed: 0.055, color: 'rgba(14,16,28,' },
      particles: { type: 'dust', count: 190, colors: ['rgba(95,88,72,', 'rgba(75,70,58,', 'rgba(115,108,90,'], speed: { x: 18, y: 8 }, size: { min: 2, max: 6 } },
      fog: { density: 0.62, color: 'rgba(38,42,55,' }, haze: null,
      lightning: { freq: 0.45, color: 'rgba(178,198,242,' },
      vignette: 'rgba(0,0,15,0.76)',
    };
  }

  // Fallback
  return {
    sky: { z: '#182530', m: '#243545', ml: '#344558', h: '#607080', g: '#506070' },
    sun: null, moon: null,
    clouds: { type: 'cumulus', count: 7, density: 0.64, speed: 0.012, color: 'rgba(158,172,190,' },
    particles: null,
    fog: { density: 0.15, color: 'rgba(138,152,168,' }, haze: null, lightning: false,
    vignette: 'rgba(0,8,20,0.32)',
  };
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function WeatherBackground({ conditionId = 800, windSpeed = 0, isDay = true }) {
  const p = useMemo(
    () => getProfile(conditionId, windSpeed, isDay),
    [conditionId, windSpeed, isDay]
  );

  const skyStyle = {
    background: `linear-gradient(to bottom, ${p.sky.z} 0%, ${p.sky.m} 28%, ${p.sky.ml} 58%, ${p.sky.h} 82%, ${p.sky.g} 100%)`,
    transition: 'background 2.5s ease',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      {/* Sky gradient */}
      <div style={{ position: 'absolute', inset: 0, ...skyStyle }} />

      {/* Canvas: clouds + sun + moon + lightning */}
      <SkyCanvas
        cloudCfg={p.clouds}
        sun={p.sun}
        moon={p.moon}
        lightningCfg={p.lightning || null}
        isDay={isDay}
      />

      {/* Canvas: precipitation / stars / atmospheric particles */}
      <ParticleCanvas particleCfg={p.particles} />

      {/* Fog overlay */}
      {p.fog && (
        <div
          className="atmos-fog"
          style={{
            opacity: p.fog.density,
            background: `linear-gradient(to bottom,
              transparent 0%,
              ${p.fog.color}0.82) 35%,
              ${p.fog.color}0.94) 62%,
              transparent 100%)`,
          }}
        />
      )}

      {/* Haze tint */}
      {p.haze && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none',
          background: `${p.haze.color}0.36)`,
          mixBlendMode: 'multiply',
        }} />
      )}

      {/* Film grain */}
      <div className="atmos-grain" />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 7, pointerEvents: 'none',
        background: `radial-gradient(ellipse 110% 90% at 50% 45%, transparent 28%, ${p.vignette} 100%)`,
      }} />
    </div>
  );
}
