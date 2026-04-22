/* =============================================
   GYM LEAD SITE — APP.JS
   Carousel + Scroll Animations + Analytics Hooks
   ============================================= */

// === CAROUSEL ===
let currentSlide = 0;
const carousel = document.getElementById('carousel');
const dots = document.querySelectorAll('.dot');
const totalSlides = document.querySelectorAll('.carousel-slide').length;

function goToSlide(index) {
  currentSlide = index;
  carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

// Auto-advance carousel
let autoPlay = setInterval(() => {
  goToSlide((currentSlide + 1) % totalSlides);
}, 3500);

// Touch swipe support
let touchStartX = 0;
carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
carousel.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) {
    clearInterval(autoPlay);
    goToSlide(diff > 0 ? Math.min(currentSlide + 1, totalSlides - 1) : Math.max(currentSlide - 1, 0));
  }
}, { passive: true });

// === SCROLL ANIMATIONS ===
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });

document.querySelectorAll('.service-card, .pricing-card, .transform-card, .offer-banner, .wa-card, .info-item')
  .forEach(el => { el.classList.add('fade-in'); observer.observe(el); });

// === SMOOTH SCROLL for anchor links ===
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// === ANALYTICS HOOKS (replace with GA/Pixel events) ===
function trackEvent(action, label) {
  // console.log(`Event: ${action} | ${label}`);
  // gtag('event', action, { event_category: 'CTA', event_label: label });
}

document.querySelectorAll('[id$="-cta"], #whatsapp-float').forEach(btn => {
  btn.addEventListener('click', () => trackEvent('cta_click', btn.id));
});
