// ToolPat+ /tour interactivity — Focused & lightweight

// Native Web Component for ToolPat+ Logo (<tp-logo>, <tp-logo size="sm">, <tp-logo size="lg">)
class TpLogo extends HTMLElement {
  connectedCallback() {
    const size = this.getAttribute('size');
    let sizeClass = '';
    if (size === 'sm') sizeClass = 'logo-sm';
    else if (size === 'lg') sizeClass = 'logo-lg';
    else if (size === 'xl') sizeClass = 'logo-xl';
    else if (size === '2xl') sizeClass = 'logo-2xl';

    this.classList.add('logo');
    if (sizeClass) this.classList.add(sizeClass);
    this.innerHTML = `<span class="l-tool">Tool</span><span class="l-pat">Pat</span><span class="l-plus">&#x271A;</span>`;
  }
}
if (!customElements.get('tp-logo')) {
  customElements.define('tp-logo', TpLogo);
}

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => revealObserver.observe(el));

  // Trigger hero immediately
  const heroReveal = document.querySelector('#hero .reveal');
  if (heroReveal) heroReveal.classList.add('in');

  // 2. Hero Video: Big Silhouetted Play Overlay & Click-to-Play
  const heroMedia = document.getElementById('hero-media');
  const heroPlayOverlay = document.getElementById('hero-play-overlay');
  const heroVideo = document.querySelector('.hero-video');
  const heroPoster = document.querySelector('.hero-poster');
  const playMetaTitle = heroPlayOverlay ? heroPlayOverlay.querySelector('.play-meta-title') : null;
  const playMetaDur = document.getElementById('hero-meta-dur');
  const iconPlay = heroPlayOverlay ? heroPlayOverlay.querySelector('.icon-play-svg') : null;
  const iconReplay = heroPlayOverlay ? heroPlayOverlay.querySelector('.icon-replay-svg') : null;

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (heroVideo && heroMedia && heroPlayOverlay) {
    heroVideo.addEventListener('loadedmetadata', () => {
      if (heroVideo.duration && isFinite(heroVideo.duration) && playMetaDur) {
        playMetaDur.textContent = formatTime(heroVideo.duration);
      }
    });

    function startPlayback() {
      if (heroPoster) heroPoster.style.display = 'none';
      heroVideo.style.display = 'block';
      heroPlayOverlay.classList.add('playing');
      if (heroVideo.ended) {
        heroVideo.currentTime = 0;
      }
      heroVideo.play().catch(() => { });
    }

    function pausePlayback() {
      heroVideo.pause();
      heroPlayOverlay.classList.remove('playing');
      if (iconPlay) iconPlay.style.display = '';
      if (iconReplay) iconReplay.style.display = 'none';
      if (playMetaTitle) playMetaTitle.textContent = 'Resume demonstration';
    }

    heroMedia.addEventListener('click', (e) => {
      e.stopPropagation();
      if (heroVideo.style.display === 'none' || heroVideo.paused) {
        startPlayback();
      } else {
        pausePlayback();
      }
    });

    heroVideo.addEventListener('ended', () => {
      heroPlayOverlay.classList.remove('playing');
      if (iconPlay) iconPlay.style.display = 'none';
      if (iconReplay) iconReplay.style.display = '';
      if (playMetaTitle) playMetaTitle.textContent = 'Replay demonstration';
    });
  }

  // 3. Scroll progress & Nav scroll-spy
  const progressBar = document.getElementById('nav-progress');
  const navLinks = document.querySelectorAll('.nav-links a[data-spy]');

  const spySections = Array.from(navLinks).map(link => {
    const id = link.getAttribute('data-spy');
    return { id, link, el: document.getElementById(id) };
  }).filter(item => item.el !== null);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = `${progress}%`;

    const scrollPos = scrollTop + 140;
    let activeId = null;
    for (let i = spySections.length - 1; i >= 0; i--) {
      const sec = spySections[i];
      if (sec.el.offsetTop <= scrollPos) {
        activeId = sec.id;
        break;
      }
    }

    navLinks.forEach(link => {
      if (link.getAttribute('data-spy') === activeId) {
        link.classList.add('on');
      } else {
        link.classList.remove('on');
      }
    });
  }, { passive: true });
});
