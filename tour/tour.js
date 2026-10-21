// ToolPat+ /tour prototype interactivity
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Reveal on scroll (IntersectionObserver)
  const reveals = document.querySelectorAll('.reveal, .hero, .tree-stage');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => revealObserver.observe(el));

  // Trigger hero reveal immediately
  const heroCopy = document.querySelector('.hero-copy');
  const heroStage = document.querySelector('.hero-stage');
  if (heroCopy) heroCopy.classList.add('in');
  if (heroStage) heroStage.classList.add('in');

  // 2. Video IntersectionObserver & Playback Controls
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
          vid.play().then(() => {
            updatePlayIcon(vid, true);
          }).catch(() => {});
        } else {
          vid.pause();
          updatePlayIcon(vid, false);
        }
      });
    }, { threshold: 0.25 });

    videos.forEach(v => videoObserver.observe(v));
  } else {
    // Respect reduced motion: leave paused until user explicitly clicks play
    videos.forEach(v => {
      v.pause();
      updatePlayIcon(v, false);
    });
  }

  // Hook up video control buttons (Toggle & Replay)
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

  // 3. Scroll progress bar & Nav scroll-spy (Desktop + Mobile)
  const progressBar = document.getElementById('nav-progress');
  const desktopLinks = document.querySelectorAll('.chapters a[data-spy]');
  const mobileLinks = document.querySelectorAll('.mobile-nav a[data-spy]');
  const allSpyLinks = [...desktopLinks, ...mobileLinks];

  const spySections = Array.from(desktopLinks).map(link => {
    const id = link.getAttribute('data-spy');
    return { id, el: document.getElementById(id) };
  }).filter(item => item.el !== null);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = `${progress}%`;

    // Active spy section
    const scrollPos = scrollTop + 140;
    let activeId = null;
    for (let i = spySections.length - 1; i >= 0; i--) {
      const sec = spySections[i];
      if (sec.el.offsetTop <= scrollPos) {
        activeId = sec.id;
        break;
      }
    }

    allSpyLinks.forEach(link => {
      if (link.getAttribute('data-spy') === activeId) {
        link.classList.add('on');
      } else {
        link.classList.remove('on');
      }
    });
  }, { passive: true });

  // 4. Typing Search Bar Demo
  const typedEl = document.getElementById('typed');
  const typedTag = document.getElementById('typed-tag');
  if (typedEl && typedTag) {
    const queries = [
      { text: "11,140,441", tag: "Patent" },
      { text: "IPR2025-00351", tag: "PTAB Trial" },
      { text: "90/016,506", tag: "Reexam" },
      { text: "Stingray Group", tag: "Party" }
    ];

    let queryIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let delay = 100;

    function typeLoop() {
      const current = queries[queryIdx];
      if (isDeleting) {
        charIdx--;
        typedEl.textContent = current.text.substring(0, charIdx);
        delay = 45;
      } else {
        charIdx++;
        typedEl.textContent = current.text.substring(0, charIdx);
        delay = 85 + Math.random() * 35;
      }

      if (!isDeleting && charIdx === current.text.length) {
        delay = 2400; // Hold full text
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        queryIdx = (queryIdx + 1) % queries.length;
        typedTag.textContent = queries[queryIdx].tag;
        delay = 450;
      }

      setTimeout(typeLoop, delay);
    }

    setTimeout(typeLoop, 800);
  }

  // 5. Centerpiece Annotated Callouts Hover/Pin Link
  const treeCallouts = document.querySelectorAll('.tree-callouts li[data-pin]');
  const pins = document.querySelectorAll('.pins .pin');

  treeCallouts.forEach(item => {
    const pinNum = item.getAttribute('data-pin');
    item.addEventListener('mouseenter', () => {
      pins.forEach(p => {
        if (p.textContent.trim() === pinNum) {
          p.style.transform = 'scale(1.4)';
          p.style.boxShadow = '0 0 0 5px rgba(255,255,255,1), 0 0 0 11px rgba(34,195,230,0.6)';
        }
      });
    });
    item.addEventListener('mouseleave', () => {
      pins.forEach(p => {
        p.style.transform = '';
        p.style.boxShadow = '';
      });
    });
  });

  // 6. PTAB & Reexam Tab Toggle
  const segPtab = document.getElementById('seg-ptab');
  const segRex = document.getElementById('seg-rex');
  const segContainer = document.querySelector('.seg');
  const feedPtab = document.querySelector('[data-feed-panel="ptab"]');
  const feedRex = document.querySelector('[data-feed-panel="rex"]');

  function switchFeed(type) {
    if (!segContainer) return;
    if (type === 'rex') {
      segContainer.setAttribute('data-on', 'rex');
      if (segRex) { segRex.classList.add('on'); segRex.setAttribute('aria-selected', 'true'); }
      if (segPtab) { segPtab.classList.remove('on'); segPtab.setAttribute('aria-selected', 'false'); }
      if (feedRex) feedRex.classList.add('on');
      if (feedPtab) feedPtab.classList.remove('on');
    } else {
      segContainer.removeAttribute('data-on');
      if (segPtab) { segPtab.classList.add('on'); segPtab.setAttribute('aria-selected', 'true'); }
      if (segRex) { segRex.classList.remove('on'); segRex.setAttribute('aria-selected', 'false'); }
      if (feedPtab) feedPtab.classList.add('on');
      if (feedRex) feedRex.classList.remove('on');
    }
  }

  if (segPtab) segPtab.addEventListener('click', () => switchFeed('ptab'));
  if (segRex) segRex.addEventListener('click', () => switchFeed('rex'));

  // 7. Accessible Lightbox Zoom Modal
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  let lastActiveElementBeforeLightbox = null;

  function openLightbox(src, caption) {
    if (!lightbox || !lightboxImg) return;
    lastActiveElementBeforeLightbox = document.activeElement;
    lightboxImg.src = src;
    lightboxCaption.textContent = caption || '';
    lightbox.removeAttribute('hidden');
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.setAttribute('hidden', '');
    if (lightboxImg) lightboxImg.src = '';
    if (lastActiveElementBeforeLightbox) {
      lastActiveElementBeforeLightbox.focus();
      lastActiveElementBeforeLightbox = null;
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
  }

  // 8. Accessible Overview Video Modal
  const modal = document.getElementById('overview-modal');
  const modalVideo = document.getElementById('overview-video');
  const modalClose = document.getElementById('overview-close');
  const openButtons = document.querySelectorAll('[data-open-overview]');
  let lastActiveElementBeforeModal = null;

  function trapFocus(e, container) {
    if (e.key !== 'Tab') return;
    const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), video');
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

  function openModal() {
    if (!modal) return;
    lastActiveElementBeforeModal = document.activeElement;
    modal.removeAttribute('hidden');
    if (modalClose) modalClose.focus();
    if (modalVideo) {
      modalVideo.currentTime = 0;
      modalVideo.play().catch(() => {});
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute('hidden', '');
    if (modalVideo) modalVideo.pause();
    if (lastActiveElementBeforeModal) {
      lastActiveElementBeforeModal.focus();
      lastActiveElementBeforeModal = null;
    }
  }

  openButtons.forEach(btn => btn.addEventListener('click', openModal));
  if (modalClose) modalClose.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    modal.addEventListener('keydown', (e) => trapFocus(e, modal));
  }

  if (lightbox) {
    lightbox.addEventListener('keydown', (e) => trapFocus(e, lightbox));
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox && !lightbox.hasAttribute('hidden')) {
        closeLightbox();
      } else if (modal && !modal.hasAttribute('hidden')) {
        closeModal();
      }
    }
  });

  // Overview chapter timestamp buttons
  const chapterButtons = document.querySelectorAll('.chapters-row button[data-t]');
  chapterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const t = parseFloat(btn.getAttribute('data-t') || '0');
      if (modalVideo) {
        modalVideo.currentTime = t;
        modalVideo.play().catch(() => {});
      }
    });
  });
});
