// ============ Footer year ============
document.getElementById('year').textContent = new Date().getFullYear();

// ============ Navbar opacity on scroll ============
const nav = document.getElementById('nav');
function updateNavScroll() {
  nav.classList.toggle('scrolled', window.scrollY > 12);
}
updateNavScroll();
window.addEventListener('scroll', updateNavScroll, { passive: true });

// ============ Mobile nav toggle ============
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
navToggle.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});
navMobile.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => navMobile.classList.remove('open'));
});

// ============ Pricing toggle ============
const pricingToggle = document.getElementById('pricingToggle');
const proPrice = document.getElementById('proPrice');
const proPeriod = document.getElementById('proPeriod');
const labelMonthly = document.getElementById('labelMonthly');
const labelYearly = document.getElementById('labelYearly');

let isYearly = false;
function renderPricing() {
  pricingToggle.classList.toggle('on', isYearly);
  pricingToggle.setAttribute('aria-pressed', String(isYearly));
  labelMonthly.classList.toggle('active', !isYearly);
  labelYearly.classList.toggle('active', isYearly);
  proPrice.textContent = isYearly ? '$72' : '$8';
  proPeriod.textContent = isYearly ? '/yr' : '/mo';
}
pricingToggle.addEventListener('click', () => {
  isYearly = !isYearly;
  renderPricing();
});
renderPricing();

// ============ Scroll fade-in ============
const fadeEls = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);
fadeEls.forEach((el) => fadeObserver.observe(el));

// ============ Chaos icon animation ============
// Icons drift, gently rotate/pulse, bounce off container walls,
// and repel away from the mouse cursor.
const chaosField = document.getElementById('chaosField');

if (chaosField) {
  const icons = Array.from(chaosField.querySelectorAll('.chaos-icon'));
  const ICON_SIZE = 42;
  const REPEL_RADIUS = 90;
  const REPEL_STRENGTH = 900;
  const MAX_SPEED = 0.9;

  let fieldWidth = 0;
  let fieldHeight = 0;
  let mouseX = -9999;
  let mouseY = -9999;
  let mouseActive = false;

  function measureField() {
    const rect = chaosField.getBoundingClientRect();
    fieldWidth = rect.width;
    fieldHeight = rect.height;
  }
  measureField();
  window.addEventListener('resize', measureField);

  chaosField.addEventListener('mousemove', (e) => {
    const rect = chaosField.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseActive = true;
  });
  chaosField.addEventListener('mouseleave', () => {
    mouseActive = false;
    mouseX = -9999;
    mouseY = -9999;
  });

  const state = icons.map((el, i) => {
    const cols = 4;
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      el,
      x: 30 + col * ((fieldWidth - 80) / (cols - 1 || 1)) + (Math.random() * 20 - 10),
      y: 40 + row * 110 + (Math.random() * 20 - 10),
      vx: (Math.random() - 0.5) * MAX_SPEED,
      vy: (Math.random() - 0.5) * MAX_SPEED,
      rotOffset: Math.random() * Math.PI * 2,
      rotSpeed: 0.0004 + Math.random() * 0.0006,
      pulseOffset: Math.random() * Math.PI * 2,
    };
  });

  let lastTime = performance.now();

  function tick(now) {
    const dt = Math.min(now - lastTime, 48);
    lastTime = now;

    for (const s of state) {
      // Mouse repulsion
      if (mouseActive) {
        const dx = s.x - mouseX;
        const dy = s.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < REPEL_RADIUS) {
          const force = (REPEL_STRENGTH * (1 - dist / REPEL_RADIUS)) / dist;
          s.vx += (dx / dist) * force * (dt / 1000);
          s.vy += (dy / dist) * force * (dt / 1000);
        }
      }

      // Gentle random drift
      s.vx += (Math.random() - 0.5) * 0.02;
      s.vy += (Math.random() - 0.5) * 0.02;

      // Clamp speed
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      if (speed > MAX_SPEED * 3) {
        s.vx = (s.vx / speed) * MAX_SPEED * 3;
        s.vy = (s.vy / speed) * MAX_SPEED * 3;
      }

      // Damping so mouse-repelled icons settle back down
      s.vx *= 0.985;
      s.vy *= 0.985;

      s.x += s.vx * dt;
      s.y += s.vy * dt;

      // Bounce off walls
      const maxX = fieldWidth - ICON_SIZE;
      const maxY = fieldHeight - ICON_SIZE;
      if (s.x < 0) { s.x = 0; s.vx *= -1; }
      if (s.x > maxX) { s.x = maxX; s.vx *= -1; }
      if (s.y < 0) { s.y = 0; s.vy *= -1; }
      if (s.y > maxY) { s.y = maxY; s.vy *= -1; }

      const rotation = Math.sin(now * s.rotSpeed + s.rotOffset) * 10;
      const scale = 1 + Math.sin(now * 0.0018 + s.pulseOffset) * 0.06;

      s.el.style.transform =
        `translate(${s.x}px, ${s.y}px) rotate(${rotation}deg) scale(${scale})`;
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
