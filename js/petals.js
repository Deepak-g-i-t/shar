/* js/petals.js — floating petal & particle systems */

(function () {
  'use strict';

  /* ---- Hero Canvas: stars / shimmer particles ---- */
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#e8a0b0', '#c9b8e8', '#f5c8a8', '#d4a96a', '#fde8d8'];

    function mkParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: rand(1, 3),
        a: rand(0, Math.PI * 2),
        speed: rand(0.2, 0.6),
        opacity: rand(0.2, 0.7),
        color: COLORS[randInt(0, COLORS.length - 1)],
        drift: rand(-0.3, 0.3),
        life: 0,
        maxLife: rand(180, 360),
      };
    }

    for (let i = 0; i < 80; i++) particles.push(mkParticle());

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p, i) => {
        p.life++;
        p.x += p.drift;
        p.y -= p.speed;
        const lifeFrac = p.life / p.maxLife;
        const alpha = lifeFrac < 0.1 ? lifeFrac * 10 : lifeFrac > 0.85 ? (1 - lifeFrac) * 6.67 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity * alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
        if (p.life >= p.maxLife || p.y < -10) particles[i] = mkParticle();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---- Floating Hero Hearts ---- */
  function initFloatingHearts() {
    const container = document.getElementById('hero-hearts');
    if (!container) return;
    const EMOJIS = ['❤️', '🌸', '💕', '✨', '🌷'];

    function spawnHeart() {
      const el = document.createElement('span');
      el.className = 'flt-heart';
      el.textContent = EMOJIS[randInt(0, EMOJIS.length - 1)];
      const size = rand(0.8, 1.6);
      el.style.setProperty('--dur', rand(5, 9) + 's');
      el.style.setProperty('--delay', rand(0, 3) + 's');
      el.style.left = rand(5, 95) + '%';
      el.style.bottom = '-30px';
      el.style.fontSize = size + 'rem';
      container.appendChild(el);
      setTimeout(() => el.remove(), 12000);
    }

    setInterval(spawnHeart, 1600);
  }

  /* ---- Petal field for message section ---- */
  function initMessagePetals() {
    const field = document.getElementById('msg-petals');
    if (!field) return;
    const PETALS = ['🌸', '🌷', '🌺', '✨', '💮'];

    function spawnPetal() {
      const el = document.createElement('span');
      el.style.cssText = `
        position:absolute;
        font-size:${rand(1, 1.8)}rem;
        left:${rand(0, 100)}%;
        top:-30px;
        opacity:0;
        pointer-events:none;
        animation: fall-petal ${rand(4,8)}s linear ${rand(0,4)}s forwards;
      `;
      el.textContent = PETALS[randInt(0, PETALS.length - 1)];
      field.appendChild(el);
      setTimeout(() => el.remove(), 14000);
    }

    // Inject keyframes once
    if (!document.getElementById('fall-kf')) {
      const style = document.createElement('style');
      style.id = 'fall-kf';
      style.textContent = `
        @keyframes fall-petal {
          0%   { opacity:0; transform:translateY(0) rotate(0deg); }
          10%  { opacity:0.8; }
          90%  { opacity:0.5; }
          100% { opacity:0; transform:translateY(110vh) rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    setInterval(spawnPetal, 500);
  }

  /* ---- Finale Canvas: petals raining + sparkles ---- */
  function initFinaleCanvas() {
    const canvas = document.getElementById('finale-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, items = [];
    let active = false;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const PALETTE = ['#e8a0b0','#c9b8e8','#f5c8a8','#d4a96a','#fde8d8','#ff9eb5'];

    function mkPetal() {
      return {
        x: Math.random() * W,
        y: -20,
        size: rand(6, 14),
        speedY: rand(1.5, 3.5),
        speedX: rand(-0.8, 0.8),
        rot: rand(0, 360),
        rotSpeed: rand(-2, 2),
        color: PALETTE[randInt(0, PALETTE.length - 1)],
        alpha: rand(0.5, 0.9),
        type: Math.random() > 0.5 ? 'petal' : 'heart',
      };
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = p.alpha;
      if (p.type === 'heart') {
        ctx.font = p.size + 'px serif';
        ctx.fillText('❤️', -p.size/2, p.size/2);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size/2, p.size, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function loop() {
      if (!active) { requestAnimationFrame(loop); return; }
      ctx.clearRect(0, 0, W, H);
      if (items.length < 120) items.push(mkPetal());
      items = items.filter(p => {
        p.y += p.speedY; p.x += p.speedX; p.rot += p.rotSpeed;
        drawPetal(p);
        return p.y < H + 30;
      });
      requestAnimationFrame(loop);
    }
    loop();

    // Activate when finale section is visible
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) active = true;
    }, { threshold: 0.3 });
    obs.observe(document.getElementById('finale'));
  }

  /* ---- Message sparkles ---- */
  function initMessageSparkles() {
    const container = document.getElementById('msg-sparkles');
    if (!container) return;

    function spawnSparkle() {
      const el = document.createElement('div');
      el.style.cssText = `
        position:absolute;
        left:${rand(5,95)}%;
        top:${rand(5,95)}%;
        width:${rand(3,6)}px;
        height:${rand(3,6)}px;
        border-radius:50%;
        background:${['#f5c8a8','#c9b8e8','#d4a96a'][randInt(0,2)]};
        pointer-events:none;
        opacity:0;
        animation: sparkle-pop ${rand(1.5,3)}s ease-in-out ${rand(0,3)}s infinite;
      `;
      container.appendChild(el);
    }

    if (!document.getElementById('sparkle-kf')) {
      const style = document.createElement('style');
      style.id = 'sparkle-kf';
      style.textContent = `
        @keyframes sparkle-pop {
          0%,100%{opacity:0;transform:scale(0.3)}
          50%{opacity:1;transform:scale(1)}
        }
      `;
      document.head.appendChild(style);
    }

    for (let i = 0; i < 18; i++) spawnSparkle();
  }

  /* ---- Bouquet canvas background particles ---- */
  function initBouquetCanvas() {
    const canvas = document.getElementById('bouquet-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, pts = [];
    function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) pts.push({
      x: rand(0, 1), y: rand(0, 1),
      dx: rand(-0.0003, 0.0003),
      dy: rand(-0.0003, 0.0003),
      r: rand(1.5, 4),
      color: ['#c9b8e8','#f5c8a8','#e8a0b0'][randInt(0,2)],
      alpha: rand(0.2, 0.6),
    });

    function loop() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x = (p.x + p.dx + 1) % 1;
        p.y = (p.y + p.dy + 1) % 1;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      requestAnimationFrame(loop);
    }
    loop();
  }

  window.initPetals = function() {
    initHeroCanvas();
    initFloatingHearts();
    initMessagePetals();
    initFinaleCanvas();
    initMessageSparkles();
    initBouquetCanvas();
  };
})();
