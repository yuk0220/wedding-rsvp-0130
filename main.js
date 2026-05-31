/* ================================================
   wedding-rsvp-0130 | Main JS
   ================================================ */

/* --- Envelope scroll-driven animation ---------- */

const envelope  = document.getElementById('envelope');
const envClosed = envelope.querySelector('.env-closed');
const envOpen   = envelope.querySelector('.env-open');
const envLetter = envelope.querySelector('.env-letter');

function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

function getOffsets() {
  const rect   = envelope.getBoundingClientRect();
  const envTop = rect.top + window.scrollY;
  const vh     = window.innerHeight;
  return {
    OPEN_START: envTop - vh * 0.45,
    OPEN_END:   envTop - vh * 0.2,
  };
}

let _offsets = null;
function offsets() {
  if (!_offsets) _offsets = getOffsets();
  return _offsets;
}
window.addEventListener('resize', () => { _offsets = null; }, { passive: true });

// CSS transition 설정
envOpen.style.transition   = 'opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
envClosed.style.transition = 'opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
envLetter.style.transition = 'opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
envelope.style.transition  = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';

// letter 초기 상태
envLetter.style.opacity   = '0';
envLetter.style.transform = 'translateY(60px) scale(0.85)';

let isOpen = false;

function updateEnvelope() {
  const y = window.scrollY;
  const { OPEN_START, OPEN_END } = offsets();
  const openT = clamp((y - OPEN_START) / (OPEN_END - OPEN_START), 0, 1);

  if (openT >= 0.5 && !isOpen) {
    // CLOSED → OPEN + 전체 아래로
    isOpen = true;
    envClosed.style.opacity  = '0';
    envOpen.style.opacity    = '1';
    envelope.style.transform = 'translateY(100px)';

    setTimeout(() => {
      envLetter.style.opacity   = '1';
      envLetter.style.transform = 'translateY(0) scale(1)';
    }, 150);

  } else if (openT < 0.5 && isOpen) {
    // OPEN → CLOSED + 원위치
    isOpen = false;
    envClosed.style.opacity   = '1';
    envOpen.style.opacity     = '0';
    envelope.style.transform  = 'translateY(0)';
    envLetter.style.opacity   = '0';
    envLetter.style.transform = 'translateY(60px) scale(0.85)';
  }
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
      dateHighlight.classList.remove('pulse');
      void dateHighlight.offsetWidth;
      setTimeout(() => dateHighlight.classList.add('pulse'), 100);
    }
  });
}, { threshold: 0.5 });

if (dateHighlight) dateObserver.observe(dateHighlight);

/* --- Account accordion ------------------------- */

document.querySelectorAll('.account-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    const panel = trigger.nextElementSibling;

    // 모든 패널 닫기
    document.querySelectorAll('.account-trigger').forEach(t => {
      t.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.account-panel').forEach(p => {
      p.classList.remove('open');
    });

    // 클릭한 것만 토글
    if (!expanded) {
      trigger.setAttribute('aria-expanded', 'true');
      panel.classList.add('open');
    }
  });
});

/* --- 복사 버튼 + 토스트 ------------------------ */

const toast = document.getElementById('toast');
let toastTimer = null;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const account = btn.dataset.account;
    navigator.clipboard.writeText(account)
      .then(() => showToast('계좌번호가 복사되었습니다 ✓'))
      .catch(() => showToast('복사에 실패했습니다'));
  });
});

/* --- Gallery viewer ---------------------------- */

const thumbs    = document.querySelectorAll('.gallery-thumb');
const mainImgs  = document.querySelectorAll('.gallery-main-img');
let currentIdx  = 0;
let autoTimer   = null;

function showGallery(idx) {
  mainImgs.forEach(img => img.classList.remove('active'));
  thumbs.forEach(t => t.classList.remove('active'));
  mainImgs[idx].classList.add('active');
  thumbs[idx].classList.add('active');
  currentIdx = idx;
}

function nextGallery() {
  showGallery((currentIdx + 1) % mainImgs.length);
}

function startAuto() {
  stopAuto();
  autoTimer = setInterval(nextGallery, 3000);
}

function stopAuto() {
  if (autoTimer) clearInterval(autoTimer);
}

// 썸네일 클릭시 해당 사진 + 자동재시작
thumbs.forEach(thumb => {
  thumb.addEventListener('click', () => {
    showGallery(Number(thumb.dataset.index));
    startAuto();
  });
});

// 스와이프
const galleryMain = document.getElementById('galleryMain');
let touchStartX = 0;

galleryMain.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  stopAuto();
}, { passive: true });

galleryMain.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) < 40) {
    startAuto();
    return;
  }
  if (diff > 0) {
    showGallery((currentIdx + 1) % mainImgs.length);
  } else {
    showGallery((currentIdx - 1 + mainImgs.length) % mainImgs.length);
  }
  startAuto();
}, { passive: true });

// 자동 시작
startAuto();

/* --- Kakao Map --------------------------------- */

kakao.maps.load(() => {
  const container = document.getElementById('kakao-map');
  const options = {
    center: new kakao.maps.LatLng(37.4569, 127.1454),
    level: 4,
  };
  const map = new kakao.maps.Map(container, options);

  const marker = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(37.4569, 127.1454),
    map,
  });

  const infowindow = new kakao.maps.InfoWindow({
    content: '<div style="padding:6px 10px;font-size:13px;font-weight:600;">밀리토피아호텔</div>',
  });
  infowindow.open(map, marker);

  container.style.cursor = 'pointer';
  kakao.maps.event.addListener(map, 'click', () => {
    window.open('https://naver.me/xVBx7DtV', '_blank');
  });
});
/* --- Footer reveal ----------------------------- */

const footerEl = document.getElementById('footer');
const footerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      footerEl.classList.add('footer-revealed');
      footerObserver.unobserve(footerEl);
    }
  });
}, { threshold: 0.15 });

if (footerEl) footerObserver.observe(footerEl);