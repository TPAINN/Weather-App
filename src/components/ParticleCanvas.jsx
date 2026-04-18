import { useEffect, useRef } from 'react';

// ── Particle Creators ─────────────────────────────────────────────────────

function createParticle(type, w, h, cfg) {
  const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
  switch (type) {
    case 'rain':
    case 'drizzle': {
      const len = cfg.length
        ? cfg.length.min + Math.random() * (cfg.length.max - cfg.length.min)
        : 14;
      return {
        x: Math.random() * (w + 200) - 100,
        y: Math.random() * h,
        vx: cfg.speed.x + (Math.random() - 0.5) * 0.5,
        vy: cfg.speed.y * (0.72 + Math.random() * 0.56),
        len,
        width: cfg.size.min + Math.random() * (cfg.size.max - cfg.size.min),
        opacity: 0.35 + Math.random() * 0.48,
        color,
        // For splashes
        nearbottom: false,
      };
    }
    case 'snow':
    case 'sleet': {
      const r = cfg.size.min + Math.random() * (cfg.size.max - cfg.size.min);
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (cfg.speed?.x || 0) + (Math.random() - 0.5) * 0.35,
        vy: (cfg.speed?.y || 1.5) * (0.42 + Math.random() * 0.88),
        r,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.012,
        driftAmp: 0.45 + Math.random() * 1.25,
        driftFreq: 0.0035 + Math.random() * 0.007,
        driftOff: Math.random() * Math.PI * 2,
        t: Math.random() * 1000,
        opacity: 0.55 + Math.random() * 0.42,
        color,
        isIce: type === 'sleet' && Math.random() > 0.5,
        isCrystal: type === 'snow' && r > 4.2,
      };
    }
    case 'stars': {
      const isBright = Math.random() > 0.85;
      return {
        x: Math.random() * w,
        y: Math.random() * h * 0.76,
        r: isBright ? 1.1 + Math.random() * 0.8 : 0.4 + Math.random() * 1.2,
        baseOp: isBright ? 0.55 + Math.random() * 0.45 : 0.22 + Math.random() * 0.62,
        twPhase: Math.random() * Math.PI * 2,
        twFreq: 0.007 + Math.random() * 0.018,
        opacity: 0,
        color,
        isBright,
      };
    }
    case 'dust':
    case 'ash': {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: cfg.speed.x * (0.38 + Math.random() * 0.92),
        vy: cfg.speed.y + (Math.random() - 0.5) * 1.6,
        r: cfg.size.min + Math.random() * (cfg.size.max - cfg.size.min),
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.038,
        opacity: 0.28 + Math.random() * 0.52,
        color,
      };
    }
    case 'smoke': {
      return {
        x: Math.random() * w,
        y: h * 0.5 + Math.random() * h * 0.5,
        vx: (cfg.speed?.x || 0.5) + (Math.random() - 0.5) * 0.8,
        vy: cfg.speed?.y || -1.2,
        r: cfg.size.min + Math.random() * (cfg.size.max - cfg.size.min) * 0.4,
        maxR: cfg.size.max,
        growRate: 0.038 + Math.random() * 0.09,
        wobble: (Math.random() - 0.5) * 0.015,
        wobbleOff: Math.random() * Math.PI * 2,
        opacity: 0.14 + Math.random() * 0.24,
        color,
      };
    }
    default:
      return { x: 0, y: 0, opacity: 0, color };
  }
}

// ── Particle Updaters ─────────────────────────────────────────────────────

function updateParticle(p, type, w, h, cfg) {
  switch (type) {
    case 'rain':
    case 'drizzle':
      p.x += p.vx;
      p.y += p.vy;
      if (p.y > h + 30 || p.x > w + 100 || p.x < -100) {
        p.x = Math.random() * (w + 200) - 100;
        p.y = -20;
      }
      break;
    case 'snow':
    case 'sleet':
      p.t += 1;
      p.x += p.vx + Math.sin(p.t * p.driftFreq + p.driftOff) * p.driftAmp;
      p.y += p.vy;
      p.rot += p.rotV;
      if (p.y > h + 14) { p.y = -14; p.x = Math.random() * w; }
      if (p.x > w + 20) p.x = -20;
      if (p.x < -20) p.x = w + 20;
      break;
    case 'stars':
      p.twPhase += p.twFreq;
      p.opacity = p.baseOp * (0.48 + 0.52 * Math.sin(p.twPhase));
      break;
    case 'dust':
    case 'ash':
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;
      if (p.x > w + 65) p.x = -65;
      if (p.x < -65) p.x = w + 65;
      if (p.y > h + 65) p.y = -65;
      if (p.y < -65) p.y = h + 65;
      break;
    case 'smoke':
      p.wobbleOff += 0.012;
      p.x += p.vx + Math.sin(p.wobbleOff) * 0.4;
      p.y += p.vy;
      p.r += p.growRate;
      p.opacity -= 0.00075;
      if (p.opacity <= 0 || p.y < -p.r * 2.5 || p.r > p.maxR * 2.2) {
        p.y = h * 0.5 + Math.random() * h * 0.5;
        p.x = Math.random() * w;
        p.r = cfg.size.min + Math.random() * (cfg.size.max - cfg.size.min) * 0.3;
        p.opacity = 0.14 + Math.random() * 0.24;
      }
      break;
  }
}

// ── Particle Drawers ──────────────────────────────────────────────────────

function drawSnowCrystal(ctx, x, y, r, rot, opacity, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color + opacity + ')';
  ctx.lineWidth = r * 0.18;
  ctx.lineCap = 'round';

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const cos = Math.cos(a), sin = Math.sin(a);
    // Main arm
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cos * r, sin * r);
    ctx.stroke();
    // Two branches per arm
    for (let j = 1; j <= 2; j++) {
      const t = j * 0.38;
      const bx = cos * r * t, by = sin * r * t;
      const ba = a + Math.PI * 0.38;
      const bl = r * 0.28;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(ba) * bl, by + Math.sin(ba) * bl);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(a - Math.PI * 0.38) * bl, by + Math.sin(a - Math.PI * 0.38) * bl);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawParticle(p, type, ctx) {
  ctx.save();
  switch (type) {
    case 'rain':
    case 'drizzle': {
      const angle = Math.atan2(p.vy, p.vx);
      ctx.globalAlpha = p.opacity;
      ctx.strokeStyle = p.color + p.opacity + ')';
      ctx.lineWidth = p.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - Math.cos(angle) * p.len, p.y - Math.sin(angle) * p.len);
      ctx.stroke();
      break;
    }
    case 'snow': {
      if (p.isCrystal) {
        drawSnowCrystal(ctx, p.x, p.y, p.r, p.rot, p.opacity, p.color);
      } else {
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color + p.opacity + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        // Soft inner glow for larger flakes
        if (p.r > 2.5) {
          ctx.globalAlpha = p.opacity * 0.4;
          ctx.fillStyle = 'rgba(255,255,255,' + (p.opacity * 0.4) + ')';
          ctx.beginPath();
          ctx.arc(p.x - p.r * 0.25, p.y - p.r * 0.25, p.r * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case 'sleet': {
      ctx.globalAlpha = p.opacity;
      if (p.isIce) {
        ctx.fillStyle = p.color + p.opacity + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.strokeStyle = p.color + (p.opacity * 0.88) + ')';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2.5, p.y - p.vy * 2.5);
        ctx.stroke();
      }
      break;
    }
    case 'stars': {
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color + p.opacity + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      if (p.isBright && p.r > 1) {
        // Cross diffraction spikes
        ctx.globalAlpha = p.opacity * 0.32;
        ctx.strokeStyle = p.color + (p.opacity * 0.32) + ')';
        ctx.lineWidth = 0.5;
        const slen = p.r * 3.8;
        ctx.beginPath();
        ctx.moveTo(p.x - slen, p.y); ctx.lineTo(p.x + slen, p.y);
        ctx.moveTo(p.x, p.y - slen); ctx.lineTo(p.x, p.y + slen);
        ctx.stroke();
      }
      break;
    }
    case 'dust':
    case 'ash': {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color + p.opacity + ')';
      ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'smoke': {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, p.color + p.opacity + ')');
      g.addColorStop(0.5, p.color + (p.opacity * 0.55) + ')');
      g.addColorStop(1, p.color + '0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      break;
    }
  }
  ctx.restore();
}

// ── Shooting Star ─────────────────────────────────────────────────────────
function createShootingStar(w, h) {
  const angle = Math.PI * 0.18 + Math.random() * 0.28;
  const speed = 12 + Math.random() * 14;
  return {
    x: Math.random() * w,
    y: Math.random() * h * 0.45,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    len: 80 + Math.random() * 120,
    opacity: 0,
    phase: 'fadein', // fadein → hold → fadeout
    life: 0,
    maxLife: 45 + Math.floor(Math.random() * 30),
  };
}

// ── Main Component ────────────────────────────────────────────────────────
export default function ParticleCanvas({ particleCfg }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ particles: [], shootingStars: [], raf: null, t: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const type = particleCfg?.type;
    const count = particleCfg?.count || 0;
    const W = () => canvas.width;
    const H = () => canvas.height;

    stateRef.current.t = 0;
    stateRef.current.particles = type && type !== 'none'
      ? Array.from({ length: count }, () => createParticle(type, W(), H(), particleCfg))
      : [];
    stateRef.current.shootingStars = [];

    // Shooting star spawn timer (stars scene only)
    let ssTimer = null;
    const scheduleShootingStar = () => {
      if (type !== 'stars') return;
      ssTimer = setTimeout(() => {
        const state = stateRef.current;
        if (state.shootingStars.length < 2) {
          state.shootingStars.push(createShootingStar(W(), H()));
        }
        scheduleShootingStar();
      }, 4000 + Math.random() * 14000);
    };
    scheduleShootingStar();

    const animate = () => {
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);
      stateRef.current.t++;

      // Regular particles
      stateRef.current.particles.forEach(p => {
        updateParticle(p, type, w, h, particleCfg);
        drawParticle(p, type, ctx);
      });

      // Shooting stars
      const ss = stateRef.current.shootingStars;
      for (let i = ss.length - 1; i >= 0; i--) {
        const s = ss[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;

        if (s.life < 8) s.opacity = s.life / 8;
        else if (s.life > s.maxLife - 10) s.opacity = Math.max(0, (s.maxLife - s.life) / 10);
        else s.opacity = 1;

        if (s.life >= s.maxLife || s.x > w + 100 || s.y > h + 100) {
          ss.splice(i, 1);
          continue;
        }

        ctx.save();
        const angle = Math.atan2(s.vy, s.vx);
        const g = ctx.createLinearGradient(s.x, s.y, s.x - Math.cos(angle) * s.len, s.y - Math.sin(angle) * s.len);
        g.addColorStop(0, `rgba(255,255,255,${s.opacity})`);
        g.addColorStop(0.3, `rgba(220,235,255,${s.opacity * 0.6})`);
        g.addColorStop(1, `rgba(180,210,255,0)`);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - Math.cos(angle) * s.len, s.y - Math.sin(angle) * s.len);
        ctx.stroke();
        // Bright head
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
        ctx.fill();
        ctx.restore();
      }

      stateRef.current.raf = requestAnimationFrame(animate);
    };

    if (stateRef.current.particles.length > 0 || type === 'stars') animate();

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      clearTimeout(ssTimer);
      window.removeEventListener('resize', resize);
    };
  }, [particleCfg?.type, particleCfg?.count]);

  if (!particleCfg || particleCfg.type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 4,
        pointerEvents: 'none', width: '100vw', height: '100vh',
      }}
    />
  );
}
