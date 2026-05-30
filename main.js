/* ================================================
   wedding-rsvp-0130 | Main JS
   ================================================ */

/* --- Envelope scroll-driven animation ---------- */

const envelope  = document.getElementById('envelope');
const envClosed = envelope.querySelector('.env-closed');
const envOpen   = envelope.querySelector('.env-open');
const envLetter = envelope.querySelector('.env-letter');

function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

function bounceOut(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function getOffsets() {
  const rect   = envelope.getBoundingClientRect();
  const envTop = rect.top + window.scrollY;
  const vh     = window.innerHeight;
  return {
    OPEN_START:   envTop - vh * 0.45,
    OPEN_END:     envTop - vh * 0.2,
    REVEAL_START: envTop - vh * 0.15,
    REVEAL_END:   envTop + vh * 0.1,
  };
}

let _offsets = null;
function offsets() {
  if (!_offsets) _offsets = getOffsets();
  return _offsets;
}
window.addEventListener('resize', () => { _offsets = null; }, { passive: true });

function updateEnvelope() {
  const y = window.scrollY;
  const { OPEN_START, OPEN_END, REVEAL_START, REVEAL_END } = offsets();

  const rawOpenT   = clamp((y - OPEN_START) / (OPEN_END - OPEN_START), 0, 1);
  const rawRevealT = clamp((y - REVEAL_START) / (REVEAL_END - REVEAL_START), 0, 1);
  const revealT    = bounceOut(rawRevealT);

  // CLOSED → OPEN 스냅
  envClosed.style.opacity = rawOpenT < 0.5 ? '1' : '0';
  envOpen.style.opacity   = rawOpenT < 0.5 ? '0' : '1';

  // LETTER bounce 등장
  envLetter.style.opacity   = rawRevealT > 0 ? '1' : '0';
  envLetter.style.transform = `translateY(${(1 - revealT) * 180}px)`;

  // envelope 살짝 내려가기
  envelope.style.transform = rawRevealT > 0
    ? `translateY(${revealT * 40}px)`
    : 'translateY(0)';
}

window.addEventListener('scroll', updateEnvelope, { passive: true });
updateEnvelope();

/* --- Scroll Reveal ----------------------------- */

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

/* --- Date pulse -------------------------------- */

const dateHighlight = document.querySelector('.date-highlight');
const dateObserver  = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => dateHighlight.classList.add('pulse'), 400);
      dateObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

if (dateHighlight) dateObserver.observe(dateHighlight);

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

const thumbs  = document.querySelectorAll('.gallery-thumb');
const mainImg = document.querySelector('.gallery-main-img');

thumbs.forEach(thumb => {
  thumb.addEventListener('click', () => {
    thumbs.forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
    const src = thumb.querySelector('img')?.src;
    if (mainImg && src) mainImg.src = src;
  });
});