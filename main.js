/* ================================================
   wedding-rsvp-0130 | Main JS
   ================================================ */

/* --- RSVP 모달 --------------------------------- */

(function () {
  const STORAGE_KEY = 'rsvp_modal_hidden_until';

  const overlay    = document.getElementById('rsvpOverlay');
  const view1      = document.getElementById('rsvpView1');
  const view2      = document.getElementById('rsvpView2');
  const closeBtn   = document.getElementById('rsvpClose');
  const closeBtn2  = document.getElementById('rsvpClose2');
  const confirmBtn = document.getElementById('rsvpConfirm');
  const dismissBtn = document.getElementById('rsvpDismiss');
  const form       = document.getElementById('rsvpForm');

  let triggered = false;

  /* ---- 열기/닫기 ---- */
  function openModal() {
    overlay.classList.add('active');
  }

  function closeModal() {
    overlay.classList.remove('active');
    // 닫힐 때 view1으로 리셋
    setTimeout(() => {
      view2.classList.add('rsvp-view--hidden');
      view1.classList.remove('rsvp-view--hidden');
    }, 300);
  }

  function dismissForToday() {
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    localStorage.setItem(STORAGE_KEY, midnight.getTime());
    closeModal();
  }

  function shouldShow() {
    const until = localStorage.getItem(STORAGE_KEY);
    if (!until) return true;
    return Date.now() > Number(until);
  }

  /* ---- account 섹션 진입 시 트리거 ---- */
  const accountSection = document.getElementById('account');
  if (accountSection && shouldShow()) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          observer.disconnect();
          setTimeout(openModal, 400);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(accountSection);
  }

  /* ---- view 1 → view 2 전환 ---- */
  confirmBtn.addEventListener('click', () => {
    view1.classList.add('rsvp-view--hidden');
    view2.classList.remove('rsvp-view--hidden');
  });

  /* ---- 닫기 ---- */
  closeBtn.addEventListener('click', closeModal);
  closeBtn2.addEventListener('click', closeModal);
  dismissBtn.addEventListener('click', dismissForToday);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* ---- 세그먼트 버튼 ---- */
  overlay.querySelectorAll('.rsvp-segment').forEach((group) => {
    group.querySelectorAll('.rsvp-segment-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.rsvp-segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });

  /* ---- 폼 제출 ---- */
  // ✅ Google Apps Script 배포 후 아래 URL을 교체하세요
  const SHEET_URL = 'YOUR_APPS_SCRIPT_URL';

  form.addEventListener('submit', async (e) => {https://script.google.com/macros/s/AKfycbxdsDr0OpPHbNqszkIBnIKlpozceQRZHJZCtAY3Rp8r9BcBTDQZqcmsBO-FktFM6Eiq/exec
    e.preventDefault();

    const name    = document.getElementById('rsvpName').value.trim();
    const privacy = document.getElementById('rsvpPrivacy').checked;
    const attend  = form.querySelector('.rsvp-segment-btn.active[data-group="attend"]')?.dataset.value;
    const side    = form.querySelector('.rsvp-segment-btn.active[data-group="side"]')?.dataset.value;
    const guests  = document.getElementById('rsvpGuests').value;

    if (!name) {
      document.getElementById('rsvpName').focus();
      return;
    }
    if (!privacy) {
      document.getElementById('rsvpPrivacy').focus();
      return;
    }

    const submitBtn = document.getElementById('rsvpSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = '전송 중...';

    try {
      const params = new URLSearchParams({
        timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        attend, side, name, guests,
      });
      // doGet 방식: CORS 헤더 없이도 안정적으로 전달됨
      await fetch(SHEET_URL + '?' + params.toString(), { mode: 'no-cors' });
    } catch (_) {
      // opaque response — 토스트만 표시
    }

    submitBtn.disabled = false;
    submitBtn.textContent = '제출하기';
    closeModal();

    const toast = document.getElementById('toast');
    toast.textContent = '참석 여부가 전달되었습니다 🙏';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  });
})();

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

/* --- Date 달력 --------------------------------- */

function renderCalendar(year, month) {
  const calDays  = document.getElementById('calDays');
  const calTitle = document.getElementById('calTitle');
  if (!calDays || !calTitle) return;

  const monthNames = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
  calTitle.textContent = `${monthNames[month]} ${year}`;

  const firstDay  = new Date(year, month, 1).getDay();
  const lastDate  = new Date(year, month + 1, 0).getDate();
  const prevLast  = new Date(year, month, 0).getDate();

  let html = '';

  // 이전 달 날짜
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<span class="other-month">${prevLast - i}</span>`;
  }

  // 이번 달 날짜
  for (let d = 1; d <= lastDate; d++) {
    const isToday = (year === 2027 && month === 0 && d === 30);
    html += `<span class="${isToday ? 'today' : ''}">${d}</span>`;
  }

  calDays.innerHTML = html;
}

let calYear = 2027, calMonth = 0;
renderCalendar(calYear, calMonth);

document.getElementById('calPrev')?.addEventListener('click', () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar(calYear, calMonth);
});

document.getElementById('calNext')?.addEventListener('click', () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar(calYear, calMonth);
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

function trackAnalyticsEvent(eventName, params = {}) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, {
    page_location: window.location.href,
    ...params,
  });
}

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const account = btn.dataset.account;
    navigator.clipboard.writeText(account)
      .then(() => {
        showToast('계좌번호를 복사했습니다.');
        trackAnalyticsEvent('account_copy', {
          account_id: btn.dataset.accountId,
          account_side: btn.dataset.accountSide,
          account_role: btn.dataset.accountRole,
          account_name: btn.dataset.accountName,
        });
      })
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
    center: new kakao.maps.LatLng(37.46820, 127.14385),
    level: 4,
  };
  const map = new kakao.maps.Map(container, options);

  const marker = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(37.46820, 127.14385),
    map,
  });

  const infowindow = new kakao.maps.InfoWindow({
    content: '<div style="padding:6px 10px;font-size:13px;font-weight:600;">밀리토피아호텔</div>',
  });
  infowindow.open(map, marker);

  container.style.cursor = 'pointer';
  kakao.maps.event.addListener(map, 'click', () => {
    window.open('https://place.map.kakao.com/26865188', '_blank');
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

/* --- Footer 공유 버튼 -------------------------- */

// URL 복사
document.getElementById('btnCopyUrl')?.addEventListener('click', () => {
  navigator.clipboard.writeText('https://wedding-rsvp-0130.vercel.app')
    .then(() => {
      const t = document.getElementById('toast');
      t.textContent = '링크를 복사했습니다.';
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2000);
      trackAnalyticsEvent('url_copy', {
        copy_type: 'reshare',
        share_method: 'url_copy',
        share_location: 'footer',
      });
    });
});

// 카카오 공유 (SDK 미연동 시 URL 복사로 fallback)
document.getElementById('btnKakaoShare')?.addEventListener('click', () => {
  if (window.Kakao?.isInitialized()) {
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: 'Better Together — 2027.01.30',
        description: '이종현 · 육예진의 결혼식에 초대합니다 💌',
        imageUrl: 'https://wedding-rsvp-0130.vercel.app/assets/og-image.jpg',
        link: {
          mobileWebUrl: 'https://wedding-rsvp-0130.vercel.app',
          webUrl: 'https://wedding-rsvp-0130.vercel.app',
        },
      },
    });
    trackAnalyticsEvent('share_click', { method: 'kakao' });
  } else {
    navigator.clipboard.writeText('https://wedding-rsvp-0130.vercel.app')
      .then(() => {
        const t = document.getElementById('toast');
        t.textContent = '링크를 복사했습니다.';
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2000);
        trackAnalyticsEvent('url_copy', {
          copy_type: 'reshare',
          share_method: 'kakao_fallback_url_copy',
          share_location: 'footer',
        });
      });
  }
});

if (footerEl) footerObserver.observe(footerEl);

/* --- BGM Vinyl Player -------------------------- */

const audio       = new Audio('./assets/bgm.mp3');
const vinylBtn    = document.getElementById('vinylBtn');
const vinylDisk   = document.getElementById('vinylDisk');
const vinylPlayer = document.getElementById('vinylPlayer');
const bgmFixed    = document.getElementById('bgmFixed');
const bgmFixedDisk = document.getElementById('bgmFixedDisk');

audio.loop   = true;
audio.volume = 0;
let isPlaying = false;

function fadeVolume(target, duration = 400) {
  const start   = audio.volume;
  const diff    = target - start;
  const step    = 16;
  const steps   = duration / step;
  let   current = 0;
  const timer = setInterval(() => {
    current++;
    audio.volume = Math.min(1, Math.max(0, start + diff * (current / steps)));
    if (current >= steps) clearInterval(timer);
  }, step);
}

function toggleBGM() {
  const icon = document.getElementById('bgmFixedIcon');
  if (isPlaying) {
    fadeVolume(0);
    setTimeout(() => audio.pause(), 800);
    isPlaying = false;
    vinylDisk.classList.remove('playing');
    icon.src = './assets/icon-volume-off.svg';   /* off 상태 */
  } else {
    audio.play();
    fadeVolume(0.4);
    isPlaying = true;
    vinylDisk.classList.add('playing');
    icon.src = './assets/icon-volume-on.svg';    /* on 상태 */
  }
}

vinylBtn.addEventListener('click', toggleBGM);
bgmFixed.addEventListener('click', toggleBGM);

// 스크롤 시 바이닐 → 고정 버튼 전환
function updateBGMScroll() {
  const rect   = vinylPlayer.getBoundingClientRect();
  const hidden = rect.bottom < 0;
  bgmFixed.classList.toggle('visible', hidden);
}

window.addEventListener('scroll', updateBGMScroll, { passive: true });
updateBGMScroll();

// 페이지 로드 즉시 자동 재생 시도
window.addEventListener('load', () => {
  audio.play().then(() => {
    fadeVolume(0.4);
    isPlaying = true;
    vinylDisk.classList.add('playing');
    document.getElementById('bgmFixedIcon').src = './assets/icon-volume-on.svg';
  }).catch(() => {
    // 브라우저 정책으로 막힌 경우 → 첫 클릭 시 재생
    document.addEventListener('click', () => {
      if (!isPlaying) {
        audio.play();
        fadeVolume(0.4);
        isPlaying = true;
        vinylDisk.classList.add('playing');
        document.getElementById('bgmFixedIcon').src = './assets/icon-volume-on.svg';
      }
    }, { once: true });
  });
});
