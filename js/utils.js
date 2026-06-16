/* js/utils.js — shared helpers */

/**
 * Clamp a number between min and max.
 */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Linear interpolate from a to b by t.
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Map a value from one range to another.
 */
function mapRange(val, inMin, inMax, outMin, outMax) {
  return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Throttle a function to fire at most once per `limit` ms.
 */
function throttle(fn, limit = 16) {
  let last = 0;
  return function(...args) {
    const now = performance.now();
    if (now - last >= limit) { last = now; fn.apply(this, args); }
  };
}

/**
 * Return whether an element's top is within the viewport.
 */
function isInViewport(el, offset = 0.85) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * offset && rect.bottom > 0;
}

/**
 * Scroll progress of an element: 0 when entering, 1 when leaving.
 */
function scrollProgress(el) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  return clamp((vh - rect.top) / (vh + rect.height), 0, 1);
}

/**
 * Random float between min and max.
 */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Random integer between min and max (inclusive).
 */
function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

/**
 * Observe elements and call fn when visible.
 */
function onVisible(selector, fn, options = {}) {
  const els = document.querySelectorAll(selector);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { fn(e.target); } });
  }, { threshold: options.threshold || 0.18, ...options });
  els.forEach(el => observer.observe(el));
  return observer;
}
