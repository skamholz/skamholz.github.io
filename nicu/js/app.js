/**
 * Georgetown Neonatology Fellowship Application
 * Pure Vanilla JS router, vertical slide stream, FAQ accordion, and GME viewer
 * Zero jQuery dependency
 */

(function () {
  'use strict';

  const TOTAL_PDF_PAGES = 31;
  let currentPdfPage = 1;

  // Map each page number (1-31) to its canonical section start page
  function getSectionStartPage(page) {
    if (page >= 2 && page <= 6) return 2;    // Sample Housestaff Agreement (pages 2-6)
    if (page >= 7 && page <= 9) return 7;    // Sample Compact (pages 7-9)
    if (page === 10) return 10;              // Stipends (page 10)
    if (page >= 11 && page <= 19) return 11; // Benefits (pages 11-19)
    if (page === 20) return 20;              // Work Authorization and Visa Info (page 20)
    if (page >= 21 && page <= 22) return 21; // Leave of Absence Policy (pages 21-22)
    if (page === 23) return 23;              // Paid Time Off Policy (page 23)
    if (page >= 24 && page <= 25) return 24; // Examination Policy (pages 24-25)
    if (page === 26) return 26;              // Professional Liability Insurance (page 26)
    if (page === 27) return 27;              // Requirements for Employment (page 27)
    if (page >= 28 && page <= 31) return 28; // Policy on Drugs and Alcohol in the Workplace (pages 28-31)
    return null;
  }

  // --- Navigation & Routing ---
  function initRouting() {
    function handleRoute() {
      let hash = window.location.hash.replace('#', '') || 'landing';
      if (!document.getElementById(hash)) {
        hash = 'landing';
      }
      setActiveTab(hash);
    }

    window.addEventListener('hashchange', handleRoute);
    handleRoute();

    // Nav click event delegation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-tab]');
      if (link) {
        e.preventDefault();
        const tab = link.getAttribute('data-tab');
        window.location.hash = tab;
        setActiveTab(tab);
        closeMobileMenu();
      }
    });
  }

  function setActiveTab(tabId) {
    // Update section visibility
    document.querySelectorAll('.view-section').forEach((sec) => {
      sec.classList.remove('active');
    });
    const targetSec = document.getElementById(tabId);
    if (targetSec) {
      targetSec.classList.add('active');
    }

    // Reset GME viewer to page 1 whenever opening Stipend / GME info
    if (tabId === 'gmeinfo' && typeof window.resetGMEPage1 === 'function') {
      window.resetGMEPage1();
    }

    // Update nav links active styling (MedStar Yellow)
    document.querySelectorAll('.nav-link').forEach((link) => {
      if (link.getAttribute('data-tab') === tabId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Pause any playing videos when switching tabs
    document.querySelectorAll('video').forEach((v) => {
      if (!v.paused) v.pause();
    });

    // Scroll to absolute top of page and viewport immediately
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  // --- Mobile Drawer Toggle ---
  function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
      });

      document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      });
    }
  }

  function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.remove('open');
    }
  }

  // --- FAQ Accordion ---
  function initFAQ() {
    const faqContainer = document.getElementById('faq-accordion');
    if (!faqContainer) return;

    faqContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq-q-btn');
      if (!btn) return;
      const item = btn.closest('.faq-item');
      item.classList.toggle('open');
    });
  }

  // --- GME Viewer (Universal Desktop Buttons + Mobile Select Dropdown) ---
  function initGMEViewer() {
    const pageImg = document.getElementById('gme-rendered-page');
    const pageNumSpan = document.getElementById('gme-page-num');
    const prevBtn = document.getElementById('gme-prev-page');
    const nextBtn = document.getElementById('gme-next-page');
    const mobileSelect = document.getElementById('gme-mobile-select');

    function updatePage(pageNo) {
      if (pageNo < 1) pageNo = 1;
      if (pageNo > TOTAL_PDF_PAGES) pageNo = TOTAL_PDF_PAGES;
      currentPdfPage = pageNo;

      const padded = String(pageNo).padStart(2, '0');
      if (pageImg) {
        pageImg.src = `assets/pdf_pages/page-${padded}.png`;
      }
      if (pageNumSpan) {
        pageNumSpan.textContent = `Page ${pageNo} of ${TOTAL_PDF_PAGES}`;
      }

      // Highlight the section menu entry that this page belongs to
      const sectionStart = getSectionStartPage(pageNo);

      // Sync active state on desktop buttons
      document.querySelectorAll('[data-pdf-page]').forEach((b) => {
        const btnPage = parseInt(b.getAttribute('data-pdf-page'), 10);
        if (sectionStart !== null && btnPage === sectionStart) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      // Sync mobile select value if it matches the current section
      if (mobileSelect) {
        mobileSelect.value = sectionStart !== null ? String(sectionStart) : '';
      }
    }

    // Desktop submenu button clicks
    document.querySelectorAll('[data-pdf-page]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(btn.getAttribute('data-pdf-page'), 10);
        updatePage(page);
      });
    });

    // Mobile dropdown selection change
    if (mobileSelect) {
      mobileSelect.addEventListener('change', (e) => {
        const page = parseInt(e.target.value, 10);
        updatePage(page);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        updatePage(currentPdfPage - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        updatePage(currentPdfPage + 1);
      });
    }

    // Default to page 1
    updatePage(1);
    window.resetGMEPage1 = () => updatePage(1);
  }

  // --- Initialization ---
  document.addEventListener('DOMContentLoaded', () => {
    initRouting();
    initMobileMenu();
    initFAQ();
    initGMEViewer();
  });

})();
