/* ============================================
   THE BABY POINT BARBERSHOP — Main JS
   ============================================ */

// ---- Resurva Booking URL ----
// Update RESURVA_URL to the actual Resurva booking URL for the shop.
// If Resurva supports per-staff booking via URL params (e.g. ?staff=liz),
// the data-staff attribute on each button will be appended automatically.
const RESURVA_URL = 'https://babypointbarbershop.resurva.com/book';

// ---- DOM references ----
const nav       = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

// ---- Nav: scroll background ----
function updateNav() {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ---- Nav: mobile hamburger ----
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navToggle.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });

  // Close when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!nav.contains(e.target)) closeMenu();
  });
}

function closeMenu() {
  if (!navToggle) return;
  navToggle.classList.remove('open');
  navLinks && navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}

// ---- Nav: active link ----
(function setActiveLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ---- Booking buttons ----
// Any element with data-book attr opens the Resurva URL.
// Optional: data-staff="name" appends ?staff=name to the URL.
function initBookingButtons() {
  document.querySelectorAll('[data-book]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const staff = btn.dataset.staff;
      const url = staff
        ? `${RESURVA_URL}?staff=${encodeURIComponent(staff)}`
        : RESURVA_URL;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });
}
initBookingButtons();

// ---- Page fade-in ----
document.body.classList.add('page-fade-in');
