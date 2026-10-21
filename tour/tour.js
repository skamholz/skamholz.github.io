// ToolPat+ /tour interactivity — Focused & lightweight
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
  const heroCopy = document.querySelector('.hero-copy');
  const heroStage = document.querySelector('.hero-stage');
  if (heroCopy) heroCopy.classList.add('in');
  if (heroStage) heroStage.classList.add('in');

  // 2. Video Controls & Playback
  const videos = document.querySelectorAll('video.kb');

  function updatePlayIcon(vid, isPlaying) {
    const shot = vid.closest('.shot');
    if (!shot) return;
    const pauseIcon = shot.querySelector('.icon-pause');
    const playIcon = shot.querySelector('.icon-play');
    const toggleBtn = shot.querySelector('.vid-toggle');
    if (pauseIcon && playIcon) {
      if (isPlaying) {
        pauseIcon.style.display = '';
        playIcon.style.display = 'none';
        if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Pause demonstration');
      } else {
        pauseIcon.style.display = 'none';
        playIcon.style.display = '';
        if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Play demonstration');
      }
    }
  }

  if (!prefersReducedMotion) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const vid = entry.target;
        if (entry.isIntersecting) {
          vid.play().then(() => updatePlayIcon(vid, true)).catch(() => {});
        } else {
          vid.pause();
          updatePlayIcon(vid, false);
        }
      });
    }, { threshold: 0.25 });

    videos.forEach(v => videoObserver.observe(v));
  } else {
    videos.forEach(v => {
      v.pause();
      updatePlayIcon(v, false);
    });
  }

  document.querySelectorAll('.shot').forEach(shot => {
    const vid = shot.querySelector('video.kb');
    if (!vid) return;

    const toggleBtn = shot.querySelector('.vid-toggle');
    const replayBtn = shot.querySelector('.vid-replay');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (vid.paused) {
          vid.play().then(() => updatePlayIcon(vid, true)).catch(() => {});
        } else {
          vid.pause();
          updatePlayIcon(vid, false);
        }
      });
    }

    if (replayBtn) {
      replayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vid.currentTime = 0;
        vid.play().then(() => updatePlayIcon(vid, true)).catch(() => {});
      });
    }

    vid.addEventListener('play', () => updatePlayIcon(vid, true));
    vid.addEventListener('pause', () => updatePlayIcon(vid, false));
  });

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

  // 4. Accessible Lightbox Zoom Modal
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  let lastActiveElement = null;

  function trapFocus(e, container) {
    if (e.key !== 'Tab') return;
    const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }

  function openLightbox(src, caption) {
    if (!lightbox || !lightboxImg) return;
    lastActiveElement = document.activeElement;
    lightboxImg.src = src;
    lightboxCaption.textContent = caption || '';
    lightbox.removeAttribute('hidden');
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.setAttribute('hidden', '');
    if (lightboxImg) lightboxImg.src = '';
    if (lastActiveElement) {
      lastActiveElement.focus();
      lastActiveElement = null;
    }
  }

  document.querySelectorAll('[data-zoom-src]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const src = btn.getAttribute('data-zoom-src');
      const caption = btn.getAttribute('data-zoom-caption') || '';
      openLightbox(src, caption);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener('keydown', (e) => trapFocus(e, lightbox));
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && !lightbox.hasAttribute('hidden')) {
      closeLightbox();
    }
  });
});
