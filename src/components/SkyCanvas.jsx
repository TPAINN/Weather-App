import { useEffect, useRef, useMemo } from 'react';

// ── Seeded PRNG ───────────────────────────────────────────────────────────
function mkRand(seed) {
  let s = (seed * 1664525 + 1013904223) >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// ── Height-based puff color (bright sunlit top → shadowed base) ───────────
function puffRGB(hf, type, isDay) {
  let top, bot;
  if (!isDay) {
    top = [58, 76, 118]; bot = [16, 22, 46];
  } else if (type === 'storm') {
    top = [75, 70, 95];  bot = [12, 10, 20];
  } else if (type === 'stratus') {
    top = [205, 218, 235]; bot = [140, 155, 178];
  } else if (type === 'wispy') {
    top = [255, 255, 255]; bot = [218, 232, 252];
  } else {
    // cumulus
    top = [252, 255, 255]; bot = [175, 196, 228];
  }
  return [
    Math.round(bot[0] + hf * (top[0] - bot[0])),
    Math.round(bot[1] + hf * (top[1] - bot[1])),
    Math.round(bot[2] + hf * (top[2] - bot[2])),
  ];
}

// ── Per-type blur radius (px) ─────────────────────────────────────────────
const TYPE_BLUR = { wispy: 24, stratus: 30, storm: 9, cumulus: 13 };

// ── Build puff layout (fractions of cloud w/h) ────────────────────────────
function buildPuffs(seed, type) {
  const rand = mkRand(seed);
  const puffs = [];

  if (type === 'wispy') {
    const n = 9 + Math.floor(rand() * 6);
    for (let i = 0; i < n; i++) {
      puffs.push({
        ox: (rand() - 0.5) * 1.5, oy: (rand() - 0.5) * 0.55,
        rw: 0.26 + rand() * 0.42, rh: 0.10 + rand() * 0.16,
        rot: (rand() - 0.5) * 0.8, alpha: 0.16 + rand() * 0.20, hf: 0.5 + rand() * 0.5,
      });
    }
  } else if (type === 'stratus') {
    for (let i = 0; i < 42; i++) {
      puffs.push({
        ox: (rand() - 0.5) * 2.4, oy: (rand() - 0.32) * 0.9,
        rw: 0.18 + rand() * 0.34, rh: 0.15 + rand() * 0.26,
        rot: (rand() - 0.5) * 0.18, alpha: 0.38 + rand() * 0.44, hf: 0.35 + rand() * 0.6,
      });
    }
  } else if (type === 'storm') {
    for (let i = 0; i < 52; i++) {
      const isTop = rand() > 0.45;
      puffs.push({
        ox: (rand() - 0.5) * 1.4, oy: isTop ? -(rand() * 0.85) : rand() * 0.4,
        rw: 0.18 + rand() * 0.32, rh: 0.20 + rand() * 0.50,
        rot: (rand() - 0.5) * 0.35,
        alpha: 0.40 + rand() * 0.55, hf: isTop ? 0.55 + rand() * 0.45 : rand() * 0.4,
      });
    }
  } else {
    // Cumulus — three layers: base, body, crown
    for (let i = 0; i < 12; i++) {
      puffs.push({ ox:(rand()-0.5)*1.1, oy:0.18+rand()*0.26, rw:0.18+rand()*0.22, rh:0.14+rand()*0.20, rot:(rand()-0.5)*0.3, alpha:0.52+rand()*0.36, hf:rand()*0.28 });
    }
    for (let i = 0; i < 16; i++) {
      puffs.push({ ox:(rand()-0.5)*0.95, oy:(rand()-0.5)*0.72, rw:0.15+rand()*0.22, rh:0.17+rand()*0.26, rot:(rand()-0.5)*0.28, alpha:0.54+rand()*0.38, hf:0.28+rand()*0.42 });
    }
    for (let i = 0; i < 12; i++) {
      puffs.push({ ox:(rand()-0.5)*0.58, oy:-(0.18+rand()*0.44), rw:0.11+rand()*0.17, rh:0.13+rand()*0.22, rot:(rand()-0.5)*0.22, alpha:0.50+rand()*0.40, hf:0.72+rand()*0.28 });
    }
  }

  puffs.sort((a, b) => a.hf - b.hf);
  return puffs;
}

// ── Lightning ─────────────────────────────────────────────────────────────
function displace(pts, x1, y1, x2, y2, j, d) {
  if (d === 0) { pts.push([x1,y1],[x2,y2]); return; }
  const mx = (x1+x2)/2 + (Math.random()-0.5)*j;
  const my = (y1+y2)/2 + (Math.random()-0.5)*j*0.2;
  displace(pts, x1, y1, mx, my, j*0.62, d-1);
  displace(pts, mx, my, x2, y2, j*0.62, d-1);
}
function buildBolt(x1, y1, x2, y2) {
  const main = [];
  displace(main, x1, y1, x2, y2, 98, 5);
  const branches = [];
  [0.3, 0.55].forEach(f => {
    const idx = Math.floor(f * (main.length-1));
    if (!main[idx]) return;
    const [bx, by] = main[idx];
    const ang = Math.atan2(y2-y1,x2-x1) + (Math.random()-0.5)*1.6;
    const len = Math.hypot(x2-x1,y2-y1) * (0.2+Math.random()*0.35);
    const bp = [];
    displace(bp, bx, by, bx+Math.cos(ang)*len, by+Math.sin(ang)*len, 50, 3);
    branches.push(bp);
  });
  return { main, branches };
}
function strokePts(ctx, pts) {
  for (let i = 0; i < pts.length-1; i+=2) {
    ctx.beginPath(); ctx.moveTo(pts[i][0],pts[i][1]); ctx.lineTo(pts[i+1][0],pts[i+1][1]); ctx.stroke();
  }
}

// ── OffscreenCanvas cloud texture (blur once, blit every frame) ───────────
function createOffscreen(w, h) {
  // Fallback to regular canvas if OffscreenCanvas unavailable
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function buildCloudTexture(c, W, H, isDay) {
  const cw = c.wFrac * W;
  const ch = c.hFrac * H;
  const blurPx = TYPE_BLUR[c.type] || 14;
  // Generous padding so blur doesn't clip at edges
  const padX = blurPx * 3.5 + cw * 0.6;
  const padY = blurPx * 3.5 + ch * 0.6;
  const tw = Math.max(4, Math.ceil(cw * 2 + padX * 2));
  const th = Math.max(4, Math.ceil(ch * 2 + padY * 2));
  const oX = tw / 2;
  const oY = th / 2;

  const oc = createOffscreen(tw, th);
  const octx = oc.getContext('2d');

  octx.filter = `blur(${blurPx}px)`;

  c.puffs.forEach(p => {
    const px = oX + p.ox * cw;
    const py = oY + p.oy * ch;
    const rx = Math.max(2, p.rw * cw);
    const ry = Math.max(2, p.rh * ch);
    const [r, g, b] = puffRGB(p.hf, c.type, isDay);
    const alpha = Math.min(0.98, p.alpha);

    octx.save();
    octx.translate(px, py);
    octx.rotate(p.rot);
    octx.beginPath();
    octx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    octx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
    octx.fill();
    octx.restore();
  });

  octx.filter = 'none';
  return { canvas: oc, w: tw, h: th, oX, oY };
}

// ── Main Component ────────────────────────────────────────────────────────
export default function SkyCanvas({ cloudCfg, sun, moon, lightningCfg, isDay = true }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({ t: 0, raf: null });

  // Stable cloud definitions (seeded per cloud, two parallax layers)
  const cloudArr = useMemo(() => {
    if (!cloudCfg) return [];
    const { type, count, density, speed } = cloudCfg;
    const arr = [];
    for (let layer = 0; layer < 2; layer++) {
      const cnt    = layer === 0 ? Math.ceil(count * 0.62) : Math.floor(count * 0.38);
      const sScale = layer === 0 ? 1 : 0.55;
      const aScale = layer === 0 ? 1 : 0.48;
      const vScale = layer === 0 ? 1 : 0.40;
      for (let i = 0; i < cnt; i++) {
        const seed  = layer * 997 + i * 43 + type.charCodeAt(0) * 11;
        const rand  = mkRand(seed + 7);
        const wMult = type==='wispy'?0.14:type==='stratus'?0.32:type==='storm'?0.27:0.18;
        const hMult = type==='wispy'?0.032:type==='stratus'?0.048:type==='storm'?0.078:0.058;
        const yRange= type==='stratus'||type==='storm'?0.24:0.28;
        arr.push({
          xFrac: rand(),
          yFrac: (layer===0?0.04:0.01) + rand()*yRange,
          wFrac: wMult * sScale * (0.65+rand()*0.80),
          hFrac: hMult * sScale * (0.72+rand()*0.58),
          alpha: density * aScale * (0.42+rand()*0.58),
          spd:   speed   * vScale * (0.68+rand()*0.64),
          bobA:  (type==='wispy'?2.5:type==='storm'?9:5) * sScale,
          bobF:  0.00022+rand()*0.00042,
          bobP:  rand()*Math.PI*2,
          type, seed, layer,
          puffs: buildPuffs(seed, type),
        });
      }
    }
    return arr;
  }, [cloudCfg]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    // Deep-copy clouds; texture slot starts null
    const clouds = cloudArr.map(c => ({ ...c, xOff: 0, texture: null }));

    // Build OffscreenCanvas textures for every cloud (once per weather change + resize)
    const buildTextures = () => {
      const W = canvas.width, H = canvas.height;
      clouds.forEach(c => {
        c.texture = buildCloudTexture(c, W, H, isDay);
      });
    };

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      buildTextures();
    };
    resize();
    window.addEventListener('resize', resize);

    // Lightning
    let bolt = null, flashOn = false, ltTimer = null;
    const scheduleLt = () => {
      if (!lightningCfg) return;
      ltTimer = setTimeout(() => {
        const W=canvas.width, H=canvas.height;
        bolt = buildBolt(
          W*(0.15+Math.random()*0.7), H*(0.06+Math.random()*0.12),
          W*(0.1+Math.random()*0.8),  H*(0.58+Math.random()*0.32),
        );
        flashOn = true;
        setTimeout(()=>{ flashOn=false; }, 65+Math.random()*85);
        setTimeout(()=>{ flashOn=true; setTimeout(()=>{ flashOn=false; bolt=null; },52); }, 105+Math.random()*75);
        scheduleLt();
      }, 1800+Math.random()*(6000/(lightningCfg.freq||0.3)));
    };
    scheduleLt();

    const animate = () => {
      const W=canvas.width, H=canvas.height;
      ctx.clearRect(0,0,W,H);
      state.t++;
      const T=state.t;

      // ── Sun ─────────────────────────────────────────────────────────────
      if (sun) {
        const sx=W*sun.x/100, sy=H*sun.y/100, sr=sun.r, gc=sun.glow;

        // Crepuscular rays
        ctx.save();
        for (let i=0;i<20;i++) {
          const ang=(i/20)*Math.PI*2 + T*0.00055;
          const pulse=Math.sin(T*0.0038+i*0.82);
          const len=sr*(5.5+2.8*pulse);
          const op=(0.022+0.015*pulse);
          const ex=sx+Math.cos(ang)*(sr+len), ey=sy+Math.sin(ang)*(sr+len);
          const g=ctx.createLinearGradient(sx,sy,ex,ey);
          g.addColorStop(0,`${gc}${(op*5).toFixed(3)})`);
          g.addColorStop(1,`${gc}0)`);
          ctx.beginPath();
          const hw=0.03;
          ctx.moveTo(sx+Math.cos(ang-hw)*sr, sy+Math.sin(ang-hw)*sr);
          ctx.lineTo(ex,ey);
          ctx.lineTo(sx+Math.cos(ang+hw)*sr, sy+Math.sin(ang+hw)*sr);
          ctx.closePath(); ctx.fillStyle=g; ctx.fill();
        }
        ctx.restore();

        // Corona
        const og=ctx.createRadialGradient(sx,sy,sr*0.5,sx,sy,sr*6);
        og.addColorStop(0,`${gc}0.44)`); og.addColorStop(0.28,`${gc}0.15)`); og.addColorStop(1,`${gc}0)`);
        ctx.beginPath(); ctx.arc(sx,sy,sr*6,0,Math.PI*2); ctx.fillStyle=og; ctx.fill();

        // Disc
        const dg=ctx.createRadialGradient(sx-sr*0.22,sy-sr*0.22,0,sx,sy,sr);
        dg.addColorStop(0,'#ffffff'); dg.addColorStop(0.55,`${gc}1)`); dg.addColorStop(1,`${gc}0.82)`);
        ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2); ctx.fillStyle=dg; ctx.fill();

        // Shimmer ring
        const shimOp=0.05+0.035*Math.sin(T*0.022);
        const sg=ctx.createRadialGradient(sx,sy,sr*0.9,sx,sy,sr*1.4);
        sg.addColorStop(0,`${gc}0)`); sg.addColorStop(0.5,`${gc}${shimOp})`); sg.addColorStop(1,`${gc}0)`);
        ctx.beginPath(); ctx.arc(sx,sy,sr*1.4,0,Math.PI*2); ctx.fillStyle=sg; ctx.fill();
      }

      // ── Moon ────────────────────────────────────────────────────────────
      if (moon) {
        const mx=W*moon.x/100, my=H*moon.y/100, mr=moon.r, gc=moon.glow;

        const mg=ctx.createRadialGradient(mx,my,mr*0.5,mx,my,mr*6.5);
        mg.addColorStop(0,`${gc}0.24)`); mg.addColorStop(0.4,`${gc}0.08)`); mg.addColorStop(1,`${gc}0)`);
        ctx.beginPath(); ctx.arc(mx,my,mr*6.5,0,Math.PI*2); ctx.fillStyle=mg; ctx.fill();

        ctx.save();
        ctx.beginPath(); ctx.arc(mx,my,mr,0,Math.PI*2); ctx.clip();
        ctx.fillStyle='#d8e4f2'; ctx.fillRect(mx-mr,my-mr,mr*2,mr*2);
        [[0.28,0.12,mr*0.32,mr*0.22],[-0.22,0.32,mr*0.26,mr*0.17],[0.08,-0.38,mr*0.18,mr*0.13]].forEach(([dx,dy,rw,rh])=>{
          ctx.beginPath(); ctx.ellipse(mx+dx*mr,my+dy*mr,rw,rh,0,0,Math.PI*2);
          ctx.fillStyle='rgba(155,172,200,0.28)'; ctx.fill();
        });
        ctx.beginPath(); ctx.arc(mx+mr*0.32,my,mr,0,Math.PI*2);
        ctx.fillStyle='rgba(4,10,26,0.58)'; ctx.fill();
        ctx.restore();

        const haloOp=0.04+0.024*Math.sin(T*0.018);
        const hg=ctx.createRadialGradient(mx,my,mr,mx,my,mr*2.6);
        hg.addColorStop(0,`${gc}${haloOp})`); hg.addColorStop(1,`${gc}0)`);
        ctx.beginPath(); ctx.arc(mx,my,mr*2.6,0,Math.PI*2); ctx.fillStyle=hg; ctx.fill();
      }

      // ── Clouds — far layer first, GPU-blit pre-rendered textures ─────────
      const sorted = [...clouds].sort((a, b) => b.layer - a.layer);
      sorted.forEach(c => {
        c.xOff += c.spd * 0.000065;
        const rawX = c.xFrac + c.xOff;
        const absX = (((rawX + 0.25) % 1.5) - 0.25) * W;
        const absY = c.yFrac * H + Math.sin(T * c.bobF + c.bobP) * c.bobA;

        if (c.texture) {
          ctx.globalAlpha = Math.min(1, c.alpha);
          ctx.drawImage(
            c.texture.canvas,
            Math.round(absX - c.texture.oX),
            Math.round(absY - c.texture.oY),
          );
          ctx.globalAlpha = 1;
        }
      });

      // ── Lightning ────────────────────────────────────────────────────────
      if (bolt && flashOn) {
        const gc=lightningCfg.color;
        ctx.fillStyle=`${gc}0.06)`; ctx.fillRect(0,0,W,H);
        ctx.save(); ctx.lineCap='round';
        const drawBolt=(pts,lw,glow,op)=>{
          ctx.strokeStyle=`${gc}${(op*0.45).toFixed(3)})`; ctx.lineWidth=glow;
          ctx.shadowColor=`${gc}1)`; ctx.shadowBlur=20; strokePts(ctx,pts);
          ctx.strokeStyle=`rgba(255,255,255,${op})`; ctx.lineWidth=lw; ctx.shadowBlur=5; strokePts(ctx,pts);
        };
        drawBolt(bolt.main,1.8,7,0.95);
        bolt.branches.forEach(b=>drawBolt(b,0.9,3.5,0.58));
        ctx.restore();
      }

      state.raf = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(state.raf);
      clearTimeout(ltTimer);
      window.removeEventListener('resize', resize);
    };
  }, [cloudArr, sun, moon, lightningCfg, isDay]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0, zIndex: 2,
        pointerEvents: 'none', width: '100%', height: '100%',
      }}
    />
  );
}
