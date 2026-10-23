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

  // Trigger hero reveals immediately
  document.querySelectorAll('#hero .reveal').forEach(el => el.classList.add('in'));

  // 2. Video Modal / Enlarge on Click (Full size, dims & blurs behind)
  const heroMedia = document.getElementById('hero-media');
  const modalBackdrop = document.getElementById('video-backdrop');
  const modalVideo = document.getElementById('modal-video');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  function openVideoModal(videoSrc) {
    if (!modalBackdrop || !modalVideo) return;
    if (videoSrc && modalVideo.src !== videoSrc) {
      modalVideo.src = videoSrc;
    }
    modalBackdrop.classList.add('active');
    document.body.classList.add('modal-open');
    modalVideo.currentTime = 0;
    modalVideo.play().catch(() => {});
  }

  function closeVideoModal() {
    if (!modalBackdrop || !modalVideo) return;
    modalVideo.pause();
    modalBackdrop.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  if (heroMedia) {
    heroMedia.addEventListener('click', (e) => {
      e.stopPropagation();
      openVideoModal();
    });
    heroMedia.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openVideoModal();
      }
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeVideoModal();
    });
  }

  if (modalVideo) {
    modalVideo.addEventListener('click', (e) => {
      e.stopPropagation();
      if (modalVideo.paused) {
        modalVideo.play().catch(() => {});
      } else {
        modalVideo.pause();
      }
    });
    modalVideo.addEventListener('ended', () => {
      modalVideo.currentTime = 0;
      modalVideo.play().catch(() => {});
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeVideoModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('active')) {
      closeVideoModal();
    }
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
});
