/* ================================================
   wedding-rsvp-0130 | Main JS
   ================================================ */

/* --- Envelope scroll-driven animation ---------- */

const envelope = document.getElementById('envelope');
const stClosed = envelope.querySelector('.env-state--closed');
const stOpen   = envelope.querySelector('.env-state--open');
const stReveal = envelope.querySelector('.env-state--reveal');

const OPEN_START   = 30;
const OPEN_END     = 180;
const REVEAL_START = 220;
const REVEAL_END   = 380;

function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

function updateEnvelope() {
  const y = window.scrollY;
  const openT   = clamp((y - OPEN_START)   / (OPEN_END   - OPEN_START),   0, 1);
  const revealT = clamp((y - REVEAL_START) / (REVEAL_END - REVEAL_START), 0, 1);

  stClosed.style.opacity = 1 - openT;
  stOpen.style.opacity   = openT * (1 - revealT);
  stReveal.style.opacity = revealT;
}

window.addEventListener('scroll', updateEnvelope, { passive: true });
updateEnvelope();



const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal').forEach(el => {
  revealObserver.observe(el);
});

/* --- Account accordion ------------------------- */

document.querySelectorAll('.account-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!expanded));
    const panel = trigger.nextElementSibling;
    if (panel && panel.classList.contains('account-panel')) {
      panel.hidden = expanded;
    }
  });
});

/* --- Gallery viewer ---------------------------- */

const thumbs = document.querySelectorAll('.gallery-thumb');
const mainImg = document.querySelector('.gallery-main-img');

thumbs.forEach(thumb => {
  thumb.addEventListener('click', () => {
    thumbs.forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
    const src = thumb.querySelector('img')?.src;
    if (mainImg && src) mainImg.src = src;
  });
});
