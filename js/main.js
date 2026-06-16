/* js/main.js — orchestrator */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Hero fade-in
  setTimeout(() => document.body.classList.add('loaded'), 150);

  // 2. Particles / petals
  if (typeof initPetals === 'function') initPetals();

  // 3. Pixel character
  if (typeof initPixelCharacter === 'function') initPixelCharacter();

  // 4. Typewriter
  if (typeof initTypewriter === 'function') initTypewriter();

  // 5. Music button
  if (typeof initMusic === 'function') initMusic();

  // 6. Photo collage
  initPhotoReveal();

  // 7. Feeling cards
  initCardReveal();

  // 8. Finale
  initFinaleReveal();

  // 9. Hero parallax
  initHeroParallax();

});

/* ══════════════════════════════════════════════
   PHOTO COLLAGE — staggered scroll reveal
══════════════════════════════════════════════ */
function initPhotoReveal() {
  const photos = document.querySelectorAll('.polaroid');
  if (!photos.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const idx = parseInt(el.dataset.index || '0', 10);
      const rot  = parseFloat(el.style.getPropertyValue('--rot') || '0');
      const tx   = el.style.getPropertyValue('--tx') || '0px';
      const ty   = el.style.getPropertyValue('--ty') || '0px';

      setTimeout(() => {
        el.style.transition = `opacity 0.85s ease, transform 1s cubic-bezier(0.34,1.5,0.64,1)`;
        el.style.opacity    = '1';
        el.style.transform  = `rotate(${rot}) translate(${tx}, ${ty}) scale(1) translateY(0)`;
      }, idx * 150);
      obs.unobserve(el);
    });
  }, { threshold: 0.12 });

  photos.forEach(p => obs.observe(p));
}

/* ══════════════════════════════════════════════
   FEELING CARDS — reveal on scroll
══════════════════════════════════════════════ */
function initCardReveal() {
  const cards = document.querySelectorAll('.feeling-card');
  if (!cards.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseFloat(el.dataset.delay || '0') * 1000;
      setTimeout(() => {
        el.style.transition = `opacity 0.85s ease, transform 0.85s cubic-bezier(0.34,1.5,0.64,1)`;
        el.style.opacity    = '1';
        el.style.transform  = 'translateY(0)';
      }, delay);
      obs.unobserve(el);
    });
  }, { threshold: 0.2 });

  cards.forEach(c => obs.observe(c));
}

/* ══════════════════════════════════════════════
   FINALE REVEAL
══════════════════════════════════════════════ */
function initFinaleReveal() {
  const section = document.getElementById('finale');
  const title   = document.getElementById('finale-title');
  const sub     = document.getElementById('finale-sub');
  const hearts  = document.getElementById('finale-hearts');
  if (!section || !title) return;

  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    setTimeout(() => title.classList.add('visible'), 100);
    setTimeout(() => sub?.classList.add('visible'), 500);
    setTimeout(() => hearts?.classList.add('visible'), 900);
    obs.disconnect();
  }, { threshold: 0.35 });
  obs.observe(section);
}

/* ══════════════════════════════════════════════
   HERO PARALLAX
══════════════════════════════════════════════ */
function initHeroParallax() {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.pageYOffset;
      const heroH   = document.getElementById('hero')?.offsetHeight || window.innerHeight;
      if (scrollY < heroH) {
        const frac = scrollY / heroH;
        heroContent.style.transform = `translateY(${frac * 55}px)`;
        heroContent.style.opacity   = String(Math.max(0, 1 - frac * 1.8));
      }
      ticking = false;
    });
  }, { passive: true });
}
