/* ─── Nav scroll effect ─── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

/* ─── Typewriter ─── */
const phrases = [
  '用 AI 重新定义产品思维与交付方式',
  'Building products with AI, from 0 to 1.',
  'PM × AI Native × Vibe Coder',
];
let pi = 0, ci = 0, deleting = false;
const el = document.getElementById('typewriter');
const cursor = document.createElement('span');
cursor.className = 'cursor-blink';
el.after(cursor);

function type() {
  const phrase = phrases[pi];
  if (!deleting) {
    el.textContent = phrase.slice(0, ++ci);
    if (ci === phrase.length) { deleting = true; setTimeout(type, 2200); return; }
  } else {
    el.textContent = phrase.slice(0, --ci);
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

/* ─── Internship Card Slider ─── */
(function () {
  const track     = document.getElementById('internTrack');
  const cards     = Array.from(track.querySelectorAll('.intern-card'));
  const dots      = Array.from(document.querySelectorAll('.track-dot'));
  const nodes     = Array.from(document.querySelectorAll('.intern-node'));
  const prevBtn   = document.querySelector('.track-arrow--prev');
  const nextBtn   = document.querySelector('.track-arrow--next');

  if (!track || cards.length === 0) return;

  let current = 0;
  let startX = 0, isDragging = false;

  function goTo(index) {
    // clamp
    index = Math.max(0, Math.min(cards.length - 1, index));
    current = index;

    // slide: move track so active card is centered
    const cardWidth = cards[0].offsetWidth;
    const gap = 20; // matches CSS gap
    const offset = index * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;
    track.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';

    cards.forEach((c, i) => c.classList.toggle('active', i === index));
    dots.forEach((d, i)  => d.classList.toggle('active', i === index));
    nodes.forEach((n, i) => n.classList.toggle('active', i === index));
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  dots.forEach(d  => d.addEventListener('click', () => goTo(+d.dataset.index)));
  nodes.forEach(n => n.addEventListener('click', () => goTo(+n.dataset.index)));

  // drag / swipe
  track.addEventListener('pointerdown', e => {
    startX = e.clientX; isDragging = true;
    track.style.transition = 'none';
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const cardWidth = cards[0].offsetWidth;
    const gap = 20;
    const base = current * (cardWidth + gap);
    track.style.transform = `translateX(${-base + dx}px)`;
  });
  track.addEventListener('pointerup', e => {
    if (!isDragging) return;
    isDragging = false;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 60) {
      goTo(dx < 0 ? current + 1 : current - 1);
    } else {
      goTo(current);
    }
  });

  // keyboard
  document.addEventListener('keydown', e => {
    const internTab = document.getElementById('tab-internship');
    if (!internTab.classList.contains('active')) return;
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // init
  goTo(0);

  // recalculate on resize
  window.addEventListener('resize', () => goTo(current));
})();

/* ─── Scroll reveal ─── */
const revealEls = document.querySelectorAll(
  '.edu-card, .intern-card, .proj-card, .award-card, .work-block, .aigc-item'
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
