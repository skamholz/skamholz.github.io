// ToolPat+ /tour prototype interactivity
document.addEventListener('DOMContentLoaded', () => {
  // 1. Reveal on scroll (IntersectionObserver)
  const reveals = document.querySelectorAll('.reveal, .hero, .annotated');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => revealObserver.observe(el));

  // Trigger hero reveal immediately
  const heroCopy = document.querySelector('.hero-copy');
  const heroStage = document.querySelector('.hero-stage');
  if (heroCopy) heroCopy.classList.add('in');
  if (heroStage) heroStage.classList.add('in');

  // 2. Video IntersectionObserver & Zoom properties setup
  const shots = document.querySelectorAll('.shot');
  shots.forEach(shot => {
    const kb = shot.querySelector('.kb');
    if (!kb) return;

    // Set custom properties for smooth CSS zoom
    const zoom = shot.dataset.zoom || '1.4';
    const zx = shot.dataset.zx || '50%';
    const zy = shot.dataset.zy || '50%';
    kb.style.setProperty('--zs', zoom);
    kb.style.setProperty('--zx', zx);
    kb.style.setProperty('--zy', zy);
  });

  const videos = document.querySelectorAll('video.kb');
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const vid = entry.target;
      const shot = vid.closest('.shot');
      if (entry.isIntersecting) {
        vid.play().catch(() => {});
        if (shot) shot.classList.add('playing');
      } else {
        vid.pause();
        if (shot) shot.classList.remove('playing');
      }
    });
  }, { threshold: 0.25 });

  videos.forEach(v => videoObserver.observe(v));

  // 3. Scroll progress bar & Nav scroll-spy
  const progressBar = document.getElementById('nav-progress');
  const navLinks = document.querySelectorAll('.chapters a[data-spy]');
  const spySections = Array.from(navLinks).map(link => {
    const id = link.getAttribute('data-spy');
    return { id, link, el: document.getElementById(id) };
  }).filter(item => item.el !== null);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = `${progress}%`;

    // Active spy link
    const scrollPos = scrollTop + 120;
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
        delay = 90 + Math.random() * 40;
      }

      if (!isDeleting && charIdx === current.text.length) {
        delay = 2200; // Hold full text
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
  const calloutItems = document.querySelectorAll('.callouts li[data-pin]');
  const pins = document.querySelectorAll('.pins .pin');

  calloutItems.forEach(item => {
    const pinNum = item.getAttribute('data-pin');
    item.addEventListener('mouseenter', () => {
      pins.forEach(p => {
        if (p.textContent.trim() === pinNum) {
          p.style.transform = 'scale(1.4)';
          p.style.boxShadow = '0 0 0 6px rgba(255,255,255,1), 0 0 0 12px rgba(34,195,230,0.6)';
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

  // 7. Overview Video Modal
  const modal = document.getElementById('overview-modal');
  const modalVideo = document.getElementById('overview-video');
  const modalClose = document.getElementById('overview-close');
  const openButtons = document.querySelectorAll('[data-open-overview]');

  function openModal() {
    if (!modal) return;
    modal.removeAttribute('hidden');
    if (modalVideo) {
      modalVideo.currentTime = 0;
      modalVideo.play().catch(() => {});
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute('hidden', '');
    if (modalVideo) modalVideo.pause();
  }

  openButtons.forEach(btn => btn.addEventListener('click', openModal));
  if (modalClose) modalClose.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hasAttribute('hidden')) {
      closeModal();
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
