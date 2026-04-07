/* ─── Nav scroll effect ─── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

/* ─── Hero flower video compatibility fallback ─── */
(function () {
  const videoLayer = document.querySelector('.flower-br');
  const heroVideo = document.querySelector('.hero-br-video');
  if (!videoLayer || !heroVideo) return;

  // Chromium often reports partial HEVC support but cannot render alpha MOV reliably.
  // Use MOV only on Safari; all other browsers keep static SVG fallback.
  const ua = navigator.userAgent;
  const isSafari =
    /Safari/.test(ua) &&
    !/Chrome|CriOS|Chromium|Edg|OPR|Firefox|FxiOS|SamsungBrowser/.test(ua);
  if (!isSafari) return;
  videoLayer.classList.add('safari-mov-enabled');

  // Safari autoplay is sensitive to muted/inline flags at runtime.
  heroVideo.muted = true;
  heroVideo.defaultMuted = true;
  heroVideo.playsInline = true;
  heroVideo.autoplay = false;
  heroVideo.loop = false;

  let hasStartedPlayback = false;
  let hasCompletedPlayback = false;
  const END_HOLD_OFFSET = 1 / 30;

  const sourceEl = heroVideo.querySelector('source[data-src]');
  const loadHeroFlowerVideo = () => {
    if (!sourceEl || sourceEl.src) return;
    sourceEl.src = sourceEl.dataset.src || '';
    if (!sourceEl.src) return;
    heroVideo.load();
  };

  const lockToLastFrame = () => {
    if (hasCompletedPlayback) return;
    hasCompletedPlayback = true;
    const duration = Number.isFinite(heroVideo.duration) ? heroVideo.duration : 0;
    const endFrame = Math.max(duration - END_HOLD_OFFSET, 0);
    try {
      heroVideo.currentTime = endFrame;
    } catch (_) {
      // Ignore seek errors on some Safari states.
    }
    heroVideo.pause();
    heroVideo.loop = false;
    heroVideo.autoplay = false;
    heroVideo.removeAttribute('loop');
    heroVideo.removeAttribute('autoplay');
    videoLayer.classList.add('show-video');
  };

  const tryPlay = () => {
    if (hasCompletedPlayback || hasStartedPlayback) return;
    heroVideo.play()
      .then(() => {
        videoLayer.classList.add('show-video');
      })
      .catch(() => {
        videoLayer.classList.remove('show-video');
      });
  };

  if (heroVideo.readyState >= 2) {
    tryPlay();
  } else {
    heroVideo.addEventListener('loadeddata', tryPlay, { once: true });
    heroVideo.addEventListener('canplay', tryPlay, { once: true });
  }
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadHeroFlowerVideo, { timeout: 1200 });
  } else {
    setTimeout(loadHeroFlowerVideo, 300);
  }
  heroVideo.addEventListener('playing', () => {
    hasStartedPlayback = true;
    videoLayer.classList.add('show-video');
  });
  heroVideo.addEventListener('timeupdate', () => {
    if (hasCompletedPlayback) return;
    const duration = Number.isFinite(heroVideo.duration) ? heroVideo.duration : 0;
    if (!duration) return;
    if (heroVideo.currentTime >= duration - END_HOLD_OFFSET) {
      lockToLastFrame();
    }
  });
  heroVideo.addEventListener('play', () => {
    if (hasCompletedPlayback) {
      lockToLastFrame();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !hasStartedPlayback && !hasCompletedPlayback) {
      loadHeroFlowerVideo();
      tryPlay();
    }
  });
  heroVideo.addEventListener('ended', () => {
    lockToLastFrame();
  });
  heroVideo.addEventListener('error', () => {
    videoLayer.classList.remove('show-video');
  });
})();

/* ─── Typewriter ─── */
const phrases = [
  '用 AI 重新定义产品思维与交付方式',
  'Building products with AI, from 0 to 1.',
  'PM × AI Native × Vibe Coder',
];
let pi = 0, ci = 0, deleting = false;
const el = document.getElementById('typewriter');
const typingText = document.createElement('span');
typingText.className = 'typewriter-text';
const cursor = document.createElement('span');
cursor.className = 'cursor-blink';
el.replaceChildren(typingText, cursor);

function type() {
  const phrase = phrases[pi];
  if (!deleting) {
    typingText.textContent = phrase.slice(0, ++ci);
    if (ci === phrase.length) { deleting = true; setTimeout(type, 2200); return; }
  } else {
    typingText.textContent = phrase.slice(0, --ci);
    if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 400); return; }
  }
  setTimeout(type, deleting ? 40 : 75);
}
type();

/* ─── Resume Tabs ─── */
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

/* ─── Internship Card Tab Switcher ─── */
(function () {
  const track     = document.getElementById('internTrack');
  const cards     = Array.from(track.querySelectorAll('.intern-card'));
  const dots      = Array.from(document.querySelectorAll('.track-dot'));
  const nodes     = Array.from(document.querySelectorAll('.intern-node'));
  const prevBtn   = document.querySelector('.track-arrow--prev');
  const nextBtn   = document.querySelector('.track-arrow--next');

  if (!track || cards.length === 0) return;

  let current = 0;

  function goTo(index, direction) {
    // clamp
    index = Math.max(0, Math.min(cards.length - 1, index));
    
    // 确定滑动方向：如果未指定，根据索引差值判断
    if (direction === undefined) {
      direction = index > current ? 'next' : 'prev';
    }
    
    const prevIndex = current;
    current = index;

    // 更新卡片位置类
    cards.forEach((card, i) => {
      card.classList.remove('active', 'prev', 'next');
      
      if (i === current) {
        // 当前卡片：居中显示
        card.classList.add('active');
      } else if (i < current) {
        // 当前卡片之前的卡片：在左侧
        card.classList.add('prev');
      } else {
        // 当前卡片之后的卡片：在右侧
        card.classList.add('next');
      }
    });

    // 更新指示点
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    
    // 更新时间轴节点
    nodes.forEach((n, i) => n.classList.toggle('active', i === current));

    if (prevBtn && nextBtn) {
      const atStart = current === 0;
      const atEnd = current === cards.length - 1;
      prevBtn.classList.toggle('is-disabled', atStart);
      nextBtn.classList.toggle('is-disabled', atEnd);
      prevBtn.disabled = atStart;
      nextBtn.disabled = atEnd;
    }
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1, 'prev'));
  nextBtn?.addEventListener('click', () => goTo(current + 1, 'next'));

  dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.index)));
  nodes.forEach(n => n.addEventListener('click', () => goTo(+n.dataset.index)));

  // keyboard
  document.addEventListener('keydown', e => {
    const internTab = document.getElementById('tab-internship');
    if (!internTab.classList.contains('active')) return;
    if (e.key === 'ArrowLeft')  goTo(current - 1, 'prev');
    if (e.key === 'ArrowRight') goTo(current + 1, 'next');
  });

  // init - 设置初始位置
  cards.forEach((card, i) => {
    card.classList.remove('active', 'prev', 'next');
    if (i === 0) {
      card.classList.add('active');
    } else {
      card.classList.add('next');
    }
  });
  dots.forEach((d, i) => d.classList.toggle('active', i === 0));
  nodes.forEach((n, i) => n.classList.toggle('active', i === 0));

  if (prevBtn && nextBtn) {
    prevBtn.classList.add('is-disabled');
    prevBtn.disabled = true;
  }
})();

/* ─── Scroll reveal ─── */
const revealEls = document.querySelectorAll(
  '.edu-card, .intern-card, .proj-card, .award-card, .work-block, .aigc-item, .aigc-coming-soon'
);
revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // stagger siblings slightly
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => observer.observe(el));

/* ─── Active nav link on scroll ─── */
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + entry.target.id
          ? 'var(--green-dk)' : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ─── Web project preview fallback ─── */
(function () {
  const previewScreens = document.querySelectorAll('.browser-screen');
  if (!previewScreens.length) return;

  const fitters = [];
  const resizeObservers = [];

  previewScreens.forEach(screen => {
    const webEmbed = screen.querySelector('.web-embed');
    const fallback = screen.querySelector('.web-embed-fallback');
    if (!webEmbed || !fallback) return;

    const showFallback = () => {
      fallback.style.display = 'flex';
    };
    const hideFallback = () => {
      fallback.style.display = 'none';
    };
    const fitWebPreview = () => {
      const baseWidth = 1280;
      const baseHeight = 720;
      const availableWidth = screen.clientWidth;
      const availableHeight = screen.clientHeight;
      if (!availableWidth || !availableHeight) return;

      // Use "cover" behavior to avoid left/right blank bars in preview.
      const scale = Math.max(availableWidth / baseWidth, availableHeight / baseHeight);
      const scaledWidth = baseWidth * scale;
      const scaledHeight = baseHeight * scale;
      const offsetX = (availableWidth - scaledWidth) / 2;
      const offsetY = (availableHeight - scaledHeight) / 2;

      webEmbed.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    };

    // Keep fallback visible by default; hide only when iframe loads successfully.
    showFallback();
    fitWebPreview();
    window.addEventListener('load', fitWebPreview, { once: true });
    webEmbed.addEventListener('load', hideFallback, { once: true });
    webEmbed.addEventListener('error', showFallback);
    fitters.push(fitWebPreview);

    // Re-fit when each preview container size changes (more reliable online).
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(() => fitWebPreview());
      observer.observe(screen);
      resizeObservers.push(observer);
    }
  });

  if (fitters.length) {
    window.addEventListener('resize', () => {
      fitters.forEach(fit => fit());
    });
  }
})();
