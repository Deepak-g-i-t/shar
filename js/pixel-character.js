/* js/pixel-character.js
   Pixel-art walking man with bouquet.
   Uses STRING-based sprites: each row is a string of single chars.
   Scroll drives horizontal walk; bouquet reveal at section end.
*/

(function () {
  'use strict';

  /* ── Palette: char → CSS colour ── */
  const PAL = {
    '.': null,          // transparent
    'k': '#f5c8a0',     // skin
    'h': '#3a2010',     // hair / dark
    's': '#5ab8d4',     // shirt teal
    'p': '#2a3570',     // pants navy
    'b': '#1a1010',     // boot/shoe
    'm': '#d4a878',     // muscle shade
    'w': '#c8a060',     // bouquet wrap kraft
    'R': '#e84060',     // red flower
    'P': '#f08090',     // pink flower
    'Y': '#f0d040',     // yellow flower
    'L': '#509050',     // leaf green
    'W': '#ffffff',     // white highlight
  };

  /* ── Helper: parse sprite row strings into 2D array ── */
  function parseSprite(rows) {
    return rows.map(r => r.split(''));
  }

  /* ── WALK FRAME A (right leg forward) 16×24 ── */
  const RAW_WALK_A = [
    '................',
    '.....hhhhhh.....',
    '....hhhhhhhh....',
    '...kkhkkkkkkk...',
    '...kkkkkkkkkk...',
    '....kkkkkkkk....',
    '....ssssssss....',
    '...ssssssssss...',
    '..sssmssssmsss..',
    '..skkssssssks...',
    '.kksssssssssssk.',
    '..kkssssssssk...',
    '....pppppppp....',
    '...pppp..pppp...',
    '...ppp....ppp...',
    '...pp.....pp....',
    '...pp.....p.....',
    '...ppp...ppp....',
    '...bb.....bb....',
    '..bbb.....bbb...',
    '................',
    '................',
    '................',
    '................',
  ];

  /* ── WALK FRAME B (left leg forward) 16×24 ── */
  const RAW_WALK_B = [
    '................',
    '.....hhhhhh.....',
    '....hhhhhhhh....',
    '...kkhkkkkkkk...',
    '...kkkkkkkkkk...',
    '....kkkkkkkk....',
    '....ssssssss....',
    '...ssssssssss...',
    '..sssmssssmsss..',
    '..skkssssssks...',
    '.kksssssssssssk.',
    '..kkssssssssk...',
    '....pppppppp....',
    '...pppp..pppp...',
    '....ppp...ppp...',
    '.....pp....pppp.',
    '....pp.....pp...',
    '...pp.....pp....',
    '...bb.....bb....',
    '..bbb.....bbb...',
    '................',
    '................',
    '................',
    '................',
  ];

  /* ── BOUQUET FRAME — character raising flowers ── */
  const RAW_BOUQUET = [
    'RPLYPRPLRP......',  // flowers top
    '.LRPLYPRPL......',  // flowers
    '.LLwwwwwwLL.....',  // bouquet wrap
    'kssswwwwwsssk...',  // arms raised holding bouquet
    'ksmsssssssmsk...',  // body upper
    '.ksssssssssk....',  // body
    '....ssssssss....',  // shirt
    '...ssssssssss...',  // shirt wide
    '..sssmssssmsss..',  // muscle arms
    '..skksssssskss..',  // hands
    '...kkssssssk....',  // body
    '....kkkkkkkk....',  // waist
    '....pppppppp....',  // pants
    '...ppp....ppp...',  // legs
    '...ppp....ppp...',  // legs
    '...pppp..pppp...',  // legs
    '...pppp..pppp...',  // legs
    '...bb.....bb....',  // boots
    '...bbb...bbb....',  // boots
    '................',
    '................',
    '................',
    '................',
    '................',
  ];

  const WALK_A    = parseSprite(RAW_WALK_A);
  const WALK_B    = parseSprite(RAW_WALK_B);
  const BOUQUET   = parseSprite(RAW_BOUQUET);

  const COLS = 16, ROWS = 24;
  let SCALE = 4;

  /* ══════════════════════════════════════════
     PIXEL JOURNEY — scroll-driven walk
  ══════════════════════════════════════════ */
  function initPixelJourney() {
    const section = document.getElementById('pixel-journey');
    const canvas  = document.getElementById('pixel-canvas');
    if (!section || !canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let W, H;
    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      SCALE = Math.max(3, Math.floor(H / 150));
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* Stars */
    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random(), y: Math.random() * 0.75,
      r: rand(0.5, 2.2), a: rand(0.25, 0.85),
      tw: rand(0, Math.PI * 2), tws: rand(0.01, 0.04),
    }));

    /* Ground flowers */
    const flowers = Array.from({ length: 20 }, (_, i) => ({
      x: (i + 0.5) / 20, bloom: 0,
      color: ['#e84060','#f5c8a8','#c9b8e8','#f0d040','#f08090'][i % 5],
    }));

    /* Memory orbs that drift across the sky */
    const orbs = Array.from({ length: 6 }, (_, i) => ({
      x: 0.1 + i * 0.15, y: rand(0.05, 0.55),
      r: rand(18, 38), a: 0, targetA: rand(0.06, 0.14),
      color: ['rgba(200,160,230,','rgba(245,200,170,','rgba(230,160,180,'][i % 3],
    }));

    let charX = -COLS * SCALE;
    let frameIdx = 0, frameTick = 0;
    const FRAME_RATE = 9;
    let dustParticles = [];

    function spawnDust(x, y) {
      for (let i = 0; i < 4; i++) {
        dustParticles.push({
          x: x + rand(-6, 6), y: y + rand(-3, 3),
          vx: rand(-0.8, 0.8), vy: rand(-1.2, -0.3),
          life: 0, maxLife: randInt(25, 45),
          color: ['#c9b8e8','#f5c8a8','#e8a0b0'][randInt(0, 2)],
          r: rand(1.5, 3.5),
        });
      }
    }

    function drawSprite(frame, x, y, scale) {
      const s = scale || SCALE;
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const ch = frame[row][col];
          if (!ch || ch === '.') continue;
          const color = PAL[ch];
          if (!color) continue;
          ctx.fillStyle = color;
          ctx.fillRect(x + col * s, y + row * s, s, s);
        }
      }
    }

    function drawFlower(fx, fy, bloom, color) {
      if (bloom < 0.01) return;
      const s = Math.min(bloom * 9, 7);
      ctx.fillStyle = '#509050';
      ctx.fillRect(Math.round(fx) - 1, fy - s * 3.5, 2, s * 3.5);
      ctx.beginPath();
      ctx.arc(fx, fy - s * 3.5, s * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = Math.min(bloom * 1.5, 1);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function drawStars() {
      stars.forEach(s => {
        s.tw += s.tws;
        const a = s.a * (0.55 + 0.45 * Math.sin(s.tw));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,240,220,${a})`;
        ctx.fill();
      });
    }

    function drawOrbs(progress) {
      orbs.forEach(o => {
        o.a += (o.targetA - o.a) * 0.02 * (progress > 0.1 ? 1 : 0);
        ctx.beginPath();
        ctx.arc(o.x * W, o.y * H, o.r, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(o.x*W, o.y*H, 0, o.x*W, o.y*H, o.r);
        g.addColorStop(0, o.color + o.a + ')');
        g.addColorStop(1, o.color + '0)');
        ctx.fillStyle = g;
        ctx.fill();
      });
    }

    function loop() {
      const rect = section.getBoundingClientRect();
      const totalScroll = section.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = clamp(scrolled / totalScroll, 0, 1);

      /* Walk progress: enter from left, stop at center at 90% */
      const walkP = clamp(progress / 0.9, 0, 1);
      const targetX = lerp(-COLS * SCALE * 1.5, W / 2 - (COLS * SCALE) / 2, walkP);
      charX = lerp(charX, targetX, 0.06);

      /* Walking animation flicker */
      frameTick++;
      const isWalking = progress > 0.01 && progress < 0.88;
      if (isWalking && frameTick >= FRAME_RATE) {
        frameTick = 0;
        frameIdx = (frameIdx + 1) % 2;
        spawnDust(charX + COLS * SCALE * 0.7, H * 0.72 + ROWS * SCALE * 0.9);
      }

      /* Bloom flowers as he passes */
      flowers.forEach((f, i) => {
        const flowerX = f.x;
        const charRelX = (charX + COLS * SCALE / 2) / W;
        if (charRelX > flowerX - 0.08) {
          f.bloom = Math.min(f.bloom + 0.025, 1);
        }
      });

      ctx.clearRect(0, 0, W, H);

      /* Sky gradient */
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, `hsl(270,40%,${8 + progress * 4}%)`);
      sky.addColorStop(1, `hsl(260,35%,${12 + progress * 5}%)`);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      drawStars();
      drawOrbs(progress);

      /* Ground */
      const groundY = H * 0.72;
      const grd = ctx.createLinearGradient(0, groundY, 0, H);
      grd.addColorStop(0, '#2a1540');
      grd.addColorStop(1, '#150c22');
      ctx.fillStyle = grd;
      ctx.fillRect(0, groundY, W, H - groundY);

      /* Ground line glow */
      ctx.strokeStyle = 'rgba(200,160,230,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(W, groundY);
      ctx.stroke();

      /* Flowers */
      flowers.forEach(f => drawFlower(f.x * W, groundY, f.bloom, f.color));

      /* Dust */
      dustParticles = dustParticles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.09; p.life++;
        const a = (1 - p.life / p.maxLife) * 0.65;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 - p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = a;
        ctx.fill();
        ctx.globalAlpha = 1;
        return p.life < p.maxLife;
      });

      /* Character */
      const charY = groundY - ROWS * SCALE;
      const frame = frameIdx === 0 ? WALK_A : WALK_B;
      drawSprite(frame, charX, charY);

      /* Text fade */
      const textEls = document.querySelectorAll('.pixel-scene-text p');
      const textIdx = Math.min(Math.floor(progress * 3.5), textEls.length - 1);
      textEls.forEach((el, i) => {
        el.style.opacity = i === textIdx ? '0.9' : '0';
        el.style.transform = i === textIdx ? 'translateY(0)' : 'translateY(12px)';
      });

      requestAnimationFrame(loop);
    }

    loop();
  }

  /* ══════════════════════════════════════════
     BOUQUET REVEAL — cinematic moment
  ══════════════════════════════════════════ */
  function initBouquetReveal() {
    const canvas = document.getElementById('char-bouquet-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const S = 6;
    canvas.width  = COLS * S;
    canvas.height = ROWS * S;
    canvas.style.width  = (COLS * S * 2) + 'px';
    canvas.style.height = (ROWS * S * 2) + 'px';

    let revealed = false;
    let bloomAngle = 0;

    function drawBouquetChar(bp) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const frame = bp < 0.28 ? WALK_A : BOUQUET;

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const ch = frame[row][col];
          if (!ch || ch === '.') continue;
          const baseColor = PAL[ch];
          if (!baseColor) continue;

          let finalColor = baseColor;
          /* Flower petals glow as bouquet blooms */
          if (bp > 0.5 && (ch === 'R' || ch === 'P' || ch === 'Y')) {
            bloomAngle += 0.008;
            const pulse = 0.5 + 0.5 * Math.sin(bloomAngle + col * 0.8);
            finalColor = lerpHex(baseColor, '#ffffff', pulse * 0.35 * clamp((bp - 0.5) * 2, 0, 1));
          }

          ctx.fillStyle = finalColor;
          ctx.fillRect(col * S, row * S, S, S);
        }
      }

      /* Soft glow halo around bouquet on reveal */
      if (bp > 0.55) {
        const gAlpha = clamp((bp - 0.55) * 1.8, 0, 0.35);
        const g = ctx.createRadialGradient(
          canvas.width * 0.38, canvas.height * 0.12, 2,
          canvas.width * 0.38, canvas.height * 0.12, canvas.width * 0.7
        );
        g.addColorStop(0, `rgba(255,220,180,${gAlpha})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    function lerpHex(hex1, hex2, t) {
      const parse = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
      const [r1,g1,b1] = parse(hex1);
      const [r2,g2,b2] = parse(hex2);
      return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`;
    }

    const section = document.getElementById('bouquet');
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !revealed) {
        revealed = true;
        let start = null;
        function animate(ts) {
          if (!start) start = ts;
          const bp = clamp((ts - start) / 2400, 0, 1);
          drawBouquetChar(bp);
          if (bp >= 0.58) document.getElementById('bloom-overlay')?.classList.add('active');
          if (bp >= 0.82) document.getElementById('bouquet-text')?.classList.add('visible');
          if (bp < 1) requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.35 });
    obs.observe(section);

    drawBouquetChar(0);
  }

  window.initPixelCharacter = function () {
    initPixelJourney();
    initBouquetReveal();
  };

})();
