import { useEffect, useRef } from 'react';

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
        vx: cfg.speed.x + (Math.random() - 0.5) * 0.4,
        vy: cfg.speed.y * (0.7 + Math.random() * 0.6),
        len,
        width: cfg.size.min + Math.random() * (cfg.size.max - cfg.size.min),
        opacity: 0.4 + Math.random() * 0.45,
        color,
      };
    }
    case 'snow':
    case 'sleet': {
      const r = cfg.size.min + Math.random() * (cfg.size.max - cfg.size.min);
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (cfg.speed?.x || 0) + (Math.random() - 0.5) * 0.3,
        vy: (cfg.speed?.y || 1.5) * (0.4 + Math.random() * 0.9),
        r,
        driftAmp: 0.4 + Math.random() * 1.2,
        driftFreq: 0.004 + Math.random() * 0.008,
        driftOff: Math.random() * Math.PI * 2,
        t: Math.random() * 1000,
        opacity: 0.55 + Math.random() * 0.4,
        color,
        isIce: type === 'sleet' && Math.random() > 0.5,
      };
    }
    case 'stars': {
      return {
        x: Math.random() * w,
        y: Math.random() * (h * 0.78),
        r: 0.4 + Math.random() * 1.6,
        baseOp: 0.25 + Math.random() * 0.7,
        twPhase: Math.random() * Math.PI * 2,
        twFreq: 0.008 + Math.random() * 0.018,
        opacity: 0,
        color,
        isBright: Math.random() > 0.88,
      };
    }
    case 'dust':
    case 'ash': {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: cfg.speed.x * (0.4 + Math.random() * 0.9),
        vy: cfg.speed.y + (Math.random() - 0.5) * 1.5,
        r: cfg.size.min + Math.random() * (cfg.size.max - cfg.size.min),
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.04,
        opacity: 0.3 + Math.random() * 0.5,
        color,
      };
    }
    case 'smoke': {
      return {
        x: Math.random() * w,
        y: h * 0.5 + Math.random() * h * 0.5,
        vx: (cfg.speed?.x || 0.5) + (Math.random() - 0.5),
        vy: cfg.speed?.y || -1.2,
        r: cfg.size.min + Math.random() * (cfg.size.max - cfg.size.min) * 0.4,
        maxR: cfg.size.max,
        growRate: 0.04 + Math.random() * 0.1,
        opacity: 0.15 + Math.random() * 0.25,
        color,
      };
    }
    default:
      return { x: 0, y: 0, opacity: 0, color };
  }
}

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
      if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
      break;
    case 'stars':
      p.twPhase += p.twFreq;
      p.opacity = p.baseOp * (0.5 + 0.5 * Math.sin(p.twPhase));
      break;
    case 'dust':
    case 'ash':
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;
      if (p.x > w + 60) p.x = -60;
      if (p.x < -60) p.x = w + 60;
      if (p.y > h + 60) p.y = -60;
      if (p.y < -60) p.y = h + 60;
      break;
    case 'smoke':
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.growRate;
      p.opacity -= 0.0008;
      if (p.opacity <= 0 || p.y < -p.r * 3 || p.r > p.maxR * 2) {
        p.y = h * 0.5 + Math.random() * h * 0.5;
        p.x = Math.random() * w;
        p.r = cfg.size.min + Math.random() * (cfg.size.max - cfg.size.min) * 0.3;
        p.opacity = 0.15 + Math.random() * 0.25;
      }
      break;
  }
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
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color + p.opacity + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'sleet': {
      ctx.globalAlpha = p.opacity;
      if (p.isIce) {
        ctx.fillStyle = p.color + p.opacity + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = p.color + (p.opacity * 0.9) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        ctx.stroke();
      }
      break;
    }
    case 'stars': {
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color + p.opacity + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      if (p.isBright && p.r > 1) {
        ctx.globalAlpha = p.opacity * 0.35;
        ctx.strokeStyle = p.color + (p.opacity * 0.35) + ')';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(p.x - p.r * 3.5, p.y);
        ctx.lineTo(p.x + p.r * 3.5, p.y);
        ctx.moveTo(p.x, p.y - p.r * 3.5);
        ctx.lineTo(p.x, p.y + p.r * 3.5);
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
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'smoke': {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, p.color + p.opacity + ')');
      g.addColorStop(1, p.color + '0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

export default function ParticleCanvas({ particleCfg }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ particles: [], raf: null, type: null });

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
    const w = () => canvas.width;
    const h = () => canvas.height;

    stateRef.current.type = type;
    stateRef.current.particles = type && type !== 'none'
      ? Array.from({ length: count }, () => createParticle(type, w(), h(), particleCfg))
      : [];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stateRef.current.particles.forEach(p => {
        updateParticle(p, type, w(), h(), particleCfg);
        drawParticle(p, type, ctx);
      });
      stateRef.current.raf = requestAnimationFrame(animate);
    };

    if (stateRef.current.particles.length > 0) animate();

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      window.removeEventListener('resize', resize);
    };
  }, [particleCfg?.type, particleCfg?.count]);

  if (!particleCfg || particleCfg.type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4,
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
      }}
    />
  );
}
