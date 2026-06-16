/* js/typewriter.js — typewriter effect for the birthday message */

(function () {
  'use strict';

  const MESSAGE = `I never said this before, and it has always felt a bit weird to say these things. Maybe today I will…

Thank you for your smile, your words, your patience with me, and the happiness you bring into my life. To this day, I'm learning a lot from you, and I will always owe you for that.

We have faced a lot of problems, ego clashes, and moments where we lost patience, but we're still talking today. I don't know why, but you feel like home to me, and I love that.

I won't lie — you can be a bit complex to understand in some situations, and I wish I had a little more brain just to give you extra emotional support.

I don't know how long we'll keep talking, but remember that I'll always think about you, no matter what. You'll always have a place in my heart.

May all your dreams come true endlessly.

And happy birthday, pretty ❤️`;

  let started = false;

  function startTypewriter() {
    if (started) return;
    started = true;

    const el = document.getElementById('message-body');
    if (!el) return;

    // Split message into paragraphs
    const paragraphs = MESSAGE.split('\n\n');
    el.innerHTML = '';

    let pIdx = 0;
    let charIdx = 0;
    let currentP = null;

    function nextParagraph() {
      if (pIdx >= paragraphs.length) {
        // Done — remove cursor
        const cur = el.querySelector('.cursor');
        if (cur) cur.remove();
        return;
      }
      currentP = document.createElement('p');
      currentP.style.cssText = 'margin-bottom:1.2rem; opacity:0; transition:opacity 0.5s ease;';
      el.appendChild(currentP);
      setTimeout(() => { currentP.style.opacity = '1'; }, 30);
      charIdx = 0;
      typeChar();
    }

    function typeChar() {
      const text = paragraphs[pIdx];
      if (charIdx < text.length) {
        // Remove old cursor
        const oldCursor = currentP.querySelector('.cursor');
        if (oldCursor) oldCursor.remove();

        currentP.textContent += text[charIdx];

        // Add cursor
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        currentP.appendChild(cursor);

        charIdx++;
        const delay = text[charIdx - 1] === '.' || text[charIdx - 1] === '…' || text[charIdx - 1] === ',' ? 90 : 28;
        setTimeout(typeChar, delay);
      } else {
        // End of paragraph
        const oldCursor = currentP.querySelector('.cursor');
        if (oldCursor) oldCursor.remove();
        pIdx++;
        setTimeout(nextParagraph, 450);
      }
    }

    nextParagraph();
  }

  // Observe message section
  window.initTypewriter = function () {
    const card = document.getElementById('message-card');
    if (!card) return;

    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        card.classList.add('visible');
        setTimeout(startTypewriter, 900);
        obs.disconnect();
      }
    }, { threshold: 0.35 });
    obs.observe(card);
  };
})();
