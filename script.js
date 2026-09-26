document.documentElement.classList.add('js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('.topbar');
const progressBar = document.querySelector('.progress-track span');
const watchedSections = [...document.querySelectorAll('.section-watch')];
const navLinks = [...document.querySelectorAll('.chapter-nav a')];


const revealItems = [...document.querySelectorAll('.reveal')];

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -9% 0px', threshold: 0.08 });

  revealItems.forEach((item) => revealObserver.observe(item));
}


let ticking = false;

function updateReadingState() {
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = documentHeight > 0 ? Math.min(window.scrollY / documentHeight, 1) : 0;
  progressBar.style.transform = `scaleX(${progress})`;

  const referenceLine = window.scrollY + Math.min(window.innerHeight * 0.38, 300);
  let currentSection = watchedSections[0];

  watchedSections.forEach((section) => {
    if (section.offsetTop <= referenceLine) currentSection = section;
  });

  const currentId = currentSection?.id;
  const activeNavId = currentId;
  navLinks.forEach((link) => {
    const isActive = link.dataset.section === activeNavId;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });

  header.classList.toggle('is-dark', currentId === 'matriz' || currentId === 'encerramento');
  ticking = false;
}

function requestReadingUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updateReadingState);
}

window.addEventListener('scroll', requestReadingUpdate, { passive: true });
window.addEventListener('resize', requestReadingUpdate, { passive: true });
updateReadingState();

// Cartões expansíveis da matriz.
const pointCards = [...document.querySelectorAll('.point-card')];

function closeCard(card, immediate = false) {
  const button = card.querySelector('button');
  const detail = card.querySelector('.point-detail');
  window.clearTimeout(card.closeTimer);
  button.setAttribute('aria-expanded', 'false');
  card.classList.remove('is-open');

  card.closeTimer = window.setTimeout(() => {
    if (!card.classList.contains('is-open')) detail.hidden = true;
  }, immediate || prefersReducedMotion ? 0 : 360);
}

function openCard(card) {
  const button = card.querySelector('button');
  const detail = card.querySelector('.point-detail');
  const quadrant = card.closest('.quadrant');

  quadrant.querySelectorAll('.point-card.is-open').forEach((openItem) => {
    if (openItem !== card) closeCard(openItem);
  });

  window.clearTimeout(card.closeTimer);
  detail.hidden = false;
  button.setAttribute('aria-expanded', 'true');
  requestAnimationFrame(() => card.classList.add('is-open'));
}

pointCards.forEach((card) => {
  const button = card.querySelector('button');
  button.addEventListener('click', () => {
    if (card.classList.contains('is-open')) closeCard(card);
    else openCard(card);
  });
});

// Mantém o estado correto ao voltar para a página pelo histórico do navegador.
window.addEventListener('pageshow', () => {
  pointCards.forEach((card) => {
    const isOpen = card.querySelector('button').getAttribute('aria-expanded') === 'true';
    card.classList.toggle('is-open', isOpen);
    card.querySelector('.point-detail').hidden = !isOpen;
  });
  updateReadingState();
});
