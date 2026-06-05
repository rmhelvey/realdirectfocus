// Navigation scroll effect
const nav = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('active');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('active');
  });
});

// Scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Add fade-in to elements
document.querySelectorAll(
  '.service-card, .result-card, .credential-card, .testimonial-card, ' +
  '.about-point, .cap-layer, .section-header, .contact-content, .contact-form-wrapper, .cert-bar, ' +
  '.industry-tag, .skill-item, .expertise-block-title'
).forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Stagger animation delay for grid items
document.querySelectorAll('.services-grid, .credentials-grid, .results-grid, .industry-grid, .skills-grid').forEach(grid => {
  grid.querySelectorAll('.fade-in').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.08}s`;
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// Contact form → marketing-api
(function() {
  const MARKETING_API_URL = 'https://marketing-api-tan.vercel.app/api/lead';

  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('contact-status');
  const submitBtn = document.getElementById('contact-submit');

  function showStatus(msg, ok) {
    if (!status) return;
    status.hidden = false;
    status.textContent = msg;
    status.style.color = ok ? '#0a7d40' : '#b00020';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    showStatus('Sending…', true);

    const body = {
      kind: 'inquiry',
      source_product: 'realdirectfocus',
      name: form.elements['name'].value.trim(),
      email: form.elements['email'].value.trim(),
      message: form.elements['message'].value.trim(),
      honeypot: form.elements['honeypot'].value,
      source: 'contact-section',
    };

    try {
      const res = await fetch(MARKETING_API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        form.reset();
        showStatus("Thanks — I'll be in touch within the business day.", true);
      } else if (res.status === 400 && json.error && typeof json.error === 'object') {
        const firstField = Object.keys(json.error)[0];
        const firstMsg = json.error[firstField];
        showStatus(firstMsg ? `${firstField}: ${firstMsg}` : 'Please check your entries.', false);
      } else if (res.status === 429) {
        showStatus('Too many submissions. Try again in an hour or email directly.', false);
      } else {
        showStatus('Something went wrong. Email directly or try again later.', false);
      }
    } catch (err) {
      showStatus('Network error. Email directly or try again later.', false);
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
