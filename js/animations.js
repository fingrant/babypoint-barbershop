/* ============================================
   THE BABY POINT BARBERSHOP — Animations JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCounters();
  initContactForm();
});

// ---- Scroll Reveal ----
// Watches .reveal, .reveal-left, .reveal-scale elements and adds
// .visible when they enter the viewport, triggering CSS transitions.
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach(el => observer.observe(el));
}

// ---- Counter Animation ----
// Elements with data-count="N" animate from 0 to N when scrolled into view.
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target, parseFloat(entry.target.dataset.count));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el, target, duration = 1800) {
  const start = performance.now();
  const isFloat = target % 1 !== 0;

  function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value    = target * eased;

    el.textContent = isFloat
      ? value.toFixed(1)
      : Math.floor(value).toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = isFloat ? target.toFixed(1) : target.toLocaleString();
      // Brief pop animation to draw attention to final value
      el.classList.add('stat-pop');
      setTimeout(() => el.classList.remove('stat-pop'), 320);
    }
  }

  requestAnimationFrame(tick);
}

// ---- Contact Form ----
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = form.querySelector('[type="submit"]');
  const msgEl     = document.getElementById('formMessage');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';
    msgEl.className       = 'form-message';
    msgEl.style.display   = 'none';

    const payload = {
      name:    form.name.value.trim(),
      email:   form.email.value.trim(),
      phone:   form.phone  ? form.phone.value.trim()   : '',
      subject: form.subject ? form.subject.value.trim() : 'Website Enquiry',
      message: form.message.value.trim(),
    };

    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (res.ok) {
        msgEl.className   = 'form-message success';
        msgEl.textContent = "Message sent! We'll be in touch shortly.";
        form.reset();
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      msgEl.className   = 'form-message error';
      msgEl.textContent = 'Something went wrong. Please try again or call us directly.';
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Send Message';
      msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}
