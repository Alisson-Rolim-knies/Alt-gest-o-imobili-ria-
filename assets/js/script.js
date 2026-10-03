'use strict';

// Informações que podem ser ajustadas sem alterar as funções abaixo.
const ALT_CONFIG = {
  whatsapp: '5555991016243',
  carouselInterval: 5500,
  condominiums: [
    'EDIFÍCIO RESIDENCIAL OCEAN',
    'RESIDENCIAL VISTA DO VALE',
    'RESIDENCIAL VALE DAS PEDRAS',
    'RESIDENCIAL OLIVEIRAS',
    'TASSIA',
    'TORRE DE VICENZA',
    'SOL DA MONTANHA',
    'BELLA VISTA',
    'DI TRENTO',
  ],
};

function initializeMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('navigation');
  if (!toggle || !navigation) return;

  function setMenuOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    navigation.classList.toggle('open', open);
  }

  toggle.addEventListener('click', () => {
    setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation.classList.contains('open')) {
      setMenuOpen(false);
      toggle.focus();
    }
  });
}

function initializeContactForm() {
  const form = document.getElementById('proposal');
  if (!form) return;

  function fieldValue(id) {
    return document.getElementById(id)?.value.trim() || '';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const lines = [
      'Olá, equipe Alt! Gostaria de conversar sobre a gestão do meu condomínio.',
      '',
      `Nome: ${fieldValue('name')}`,
      `Telefone: ${fieldValue('phone')}`,
    ];
    const optionalFields = [
      ['email', 'E-mail'],
      ['condo', 'Condomínio'],
      ['unit', 'Unidade'],
    ];
    optionalFields.forEach(([id, label]) => {
      const value = fieldValue(id);
      if (value) lines.push(`${label}: ${value}`);
    });
    lines.push('', fieldValue('message'));

    const message = encodeURIComponent(lines.join('\n'));
    window.location.href = `https://wa.me/${ALT_CONFIG.whatsapp}?text=${message}`;
  });
}

function initializeCarousel() {
  const carousel = document.querySelector('.hero-carousel');
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll('.hero-slide')];
  const dots = [...carousel.querySelectorAll('.carousel-dot')];
  const name = document.getElementById('hero-condo-name');
  const count = carousel.querySelector('.carousel-count');
  const pauseButton = carousel.querySelector('.carousel-pause');
  if (!slides.length || dots.length !== slides.length || !name || !count || !pauseButton) return;

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const unavailable = new Set();
  let current = 0;
  let paused = motionPreference.matches;
  let hovered = false;
  let focused = false;
  let timer = null;

  function nextAvailableIndex() {
    for (let offset = 1; offset <= slides.length; offset += 1) {
      const index = (current + offset) % slides.length;
      if (!unavailable.has(index)) return index;
    }
    return current;
  }

  function showSlide(index) {
    if (unavailable.has(index)) return;
    current = index;
    slides.forEach((slide, position) => {
      const active = position === index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, position) => {
      const active = position === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-pressed', String(active));
    });
    name.textContent = `${ALT_CONFIG.condominiums[index]} · SANTA MARIA`;
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }

  function scheduleNextSlide() {
    window.clearTimeout(timer);
    timer = null;
    if (paused || hovered || focused || document.hidden || slides.length - unavailable.size < 2) return;
    timer = window.setTimeout(() => {
      showSlide(nextAvailableIndex());
      scheduleNextSlide();
    }, ALT_CONFIG.carouselInterval);
  }

  function updatePlayback() {
    pauseButton.textContent = paused ? 'Reproduzir' : 'Pausar';
    pauseButton.setAttribute('aria-label', paused
      ? 'Iniciar troca automática de fotos'
      : 'Pausar troca automática de fotos');
    scheduleNextSlide();
  }

  function markUnavailable(index) {
    unavailable.add(index);
    dots[index].disabled = true;
    dots[index].setAttribute('aria-label', `${ALT_CONFIG.condominiums[index]}: foto indisponível`);
    if (current === index && unavailable.size < slides.length) showSlide(nextAvailableIndex());
    if (unavailable.size === slides.length) {
      name.textContent = 'ALT GESTÃO DE CONDOMÍNIOS · SANTA MARIA';
      paused = true;
      pauseButton.disabled = true;
    }
    updatePlayback();
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      scheduleNextSlide();
    });
  });
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    updatePlayback();
  });
  carousel.addEventListener('mouseenter', () => {
    hovered = true;
    scheduleNextSlide();
  });
  carousel.addEventListener('mouseleave', () => {
    hovered = false;
    scheduleNextSlide();
  });
  carousel.addEventListener('focusin', () => {
    focused = true;
    scheduleNextSlide();
  });
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      focused = false;
      scheduleNextSlide();
    }
  });
  document.addEventListener('visibilitychange', scheduleNextSlide);
  motionPreference.addEventListener('change', (event) => {
    if (event.matches) {
      paused = true;
      updatePlayback();
    }
  });
  slides.forEach((slide, index) => {
    slide.addEventListener('error', () => markUnavailable(index));
    if (slide.complete && slide.naturalWidth === 0) markUnavailable(index);
  });

  updatePlayback();
}

initializeMenu();
initializeContactForm();
initializeCarousel();
