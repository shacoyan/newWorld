/* ===========================
   RIKA MAKEUP PORTFOLIO — JS
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Nav scroll ─── */
  const nav = document.getElementById('nav');
  const navBackdrop = document.querySelector('.nav-backdrop');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  /* ─── Fade-up on scroll (Intersection Observer) ─── */
  const fadeEls = document.querySelectorAll('.fade-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  fadeEls.forEach(el => observer.observe(el));

  /* ─── Mobile Hamburger Menu ─── */
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks  = document.querySelector('.nav-links');

  function openMenu() {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    if (navBackdrop) navBackdrop.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    if (navBackdrop) navBackdrop.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  if (navLinks) navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  if (navBackdrop) navBackdrop.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger?.classList.contains('open')) closeMenu();
  });

  /* ─── Gallery filter ─── */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const galleryGrid = document.querySelector('.gallery-grid');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (galleryGrid?.classList.contains('filtering')) return;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      if (galleryGrid) {
        galleryGrid.classList.add('filtering');
        setTimeout(() => {
          galleryItems.forEach(item => {
            item.classList.toggle('hidden', filter !== 'all' && item.dataset.category !== filter);
          });
          galleryGrid.classList.remove('filtering');
        }, 300);
      }
    });
  });

  /* ─── Lightbox ─── */
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightbox-img');
  const lightboxCap   = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev  = document.getElementById('lightbox-prev');
  const lightboxNext  = document.getElementById('lightbox-next');

  let currentIndex = 0;
  let visibleItems = [];
  let touchStartX = 0;
  let touchStartY = 0;

  const getVisibleItems = () => [...document.querySelectorAll('.gallery-item:not(.hidden)')];

  function updateLightboxImage() {
    if (!lightboxImg) return;
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
      const item = visibleItems[currentIndex];
      const img = item.querySelector('img');
      if (img) lightboxImg.src = img.src;
      if (lightboxCap) lightboxCap.textContent = item.dataset.label || '';
      lightboxImg.style.opacity = '1';
    }, 200);
  }

  function openLightbox(index) {
    visibleItems = getVisibleItems();
    currentIndex = index;
    const img = visibleItems[currentIndex].querySelector('img');
    if (img) lightboxImg.src = img.src;
    if (lightboxCap) lightboxCap.textContent = visibleItems[currentIndex].dataset.label || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      visibleItems = getVisibleItems();
      const idx = visibleItems.indexOf(item);
      if (idx !== -1) openLightbox(idx);
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  lightboxPrev?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    updateLightboxImage();
  });
  lightboxNext?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % visibleItems.length;
    updateLightboxImage();
  });

  // Touch swipe (50px threshold)
  lightbox?.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  lightbox?.addEventListener('touchend', e => {
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      diffX < 0
        ? (currentIndex = (currentIndex + 1) % visibleItems.length)
        : (currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length);
      updateLightboxImage();
    }
  }, { passive: true });

  document.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev?.click();
    if (e.key === 'ArrowRight') lightboxNext?.click();
  });

  /* ─── Smooth scroll ─── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  /* ─── Footer year ─── */
  const footerYear = document.querySelector('.footer-year');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

});
