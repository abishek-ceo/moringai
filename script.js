let cart = [];
let countersAnimated = false;
let navOpen = false;

/* ---- SCROLL REVEAL ---- */
// Defined early but populated after DOMContentLoaded to avoid missing dynamic classes
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
  });
}, { threshold: 0.12 });

/* ---- SPARKLE CURSOR (mouse only, not on touch devices) ---- */
const sparkleEmojis = ['✨','🌿','🌟','💚','⚡','🍃'];
let lastSparkle = 0;
if (window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - lastSparkle < 120) return;
    lastSparkle = now;
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
    s.style.left = e.clientX - 10 + 'px';
    s.style.top = e.clientY - 10 + 'px';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 650);
  });
}

function toggleCart() {
  const panel = document.getElementById('cartPanel');
  const bg = document.getElementById('cartBg');
  panel.classList.toggle('open');
  bg.classList.toggle('open');
  document.body.style.overflow = panel.classList.contains('open') ? 'hidden' : '';
}

function qtyChange(id, d) {
  const el = document.getElementById(id);
  const v = Math.min(99, Math.max(1, parseInt(el.textContent, 10) + d));
  el.textContent = v;
}

function addCart(name, price, qtyId) {
  const qty = parseInt(document.getElementById(qtyId).textContent, 10);
  const ex = cart.find(i => i.name === name);
  if (ex) ex.qty += qty;
  else cart.push({ name, price, qty });
  document.getElementById(qtyId).textContent = '1';
  renderCart();
  updateWhatsAppLink();
  // Only auto-open cart on desktop to avoid jarring experience on mobile
  if (!document.getElementById('cartPanel').classList.contains('open')) {
    toggleCart();
  }
  toast('\u2705 Added: ' + name);
}

function removeCartItem(i) {
  cart.splice(i, 1);
  renderCart();
  updateWhatsAppLink();
  // Close cart if it becomes empty
  if (cart.length === 0 && document.getElementById('cartPanel').classList.contains('open')) {
    toggleCart();
  }
}

function updateWhatsAppLink() {
  const link = document.getElementById('cartWaLink');
  if (!link) return;
  if (!cart.length) {
    link.href = 'https://wa.me/919514499924?text=Hello%20Moringai!%20I%20want%20to%20place%20an%20order';
    return;
  }
  const lines = [
    'Hello Moringai! I want to place an order.',
    ...cart.map(i => i.name + ' x ' + i.qty + ' = \u20b9' + (i.price * i.qty).toLocaleString('en-IN')),
    'Total: \u20b9' + cart.reduce((a, i) => a + i.price * i.qty, 0).toLocaleString('en-IN')
  ];
  link.href = 'https://wa.me/919514499924?text=' + encodeURIComponent(lines.join('\n'));
}

function renderCart() {
  const count = cart.reduce((a, i) => a + i.qty, 0);
  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
  document.getElementById('cartBadge').textContent = count;
  const body = document.getElementById('cartBody');
  const foot = document.getElementById('cartFoot');
  if (!cart.length) {
    body.innerHTML = '<div class="cart-empty-state"><p style="font-size:2.5rem">\ud83d\uded2</p><p>Cart is empty!</p><small>Add products to continue</small></div>';
    foot.style.display = 'none';
    return;
  }
  body.innerHTML = cart.map((item, i) => `
    <div class="cart-item-row">
      <div class="ci-info">
        <strong>${item.name}</strong>
        <p>\u20b9${(item.price * item.qty).toLocaleString('en-IN')} &nbsp;&middot;&nbsp; ${item.qty} &times; \u20b9${item.price}</p>
      </div>
      <button onclick="removeCartItem(${i})" aria-label="Remove item">&times;</button>
    </div>
  `).join('');
  document.getElementById('cartTotal').textContent = '\u20b9' + total.toLocaleString('en-IN');
  foot.style.display = 'flex';
  updateWhatsAppLink();
}

function toggleNav() {
  navOpen = !navOpen;
  document.getElementById('header').classList.toggle('mobile-nav-open', navOpen);
  // Prevent body scroll when mobile nav is open
  document.body.style.overflow = navOpen ? 'hidden' : '';
}

function closeNav() {
  if (!navOpen) return;
  navOpen = false;
  document.getElementById('header').classList.remove('mobile-nav-open');
  document.body.style.overflow = '';
}

// Close mobile nav when clicking outside of header
document.addEventListener('click', e => {
  if (navOpen && !e.target.closest('#header')) {
    closeNav();
  }
});

function openFaq(btn) {
  const item = btn.parentElement;
  const ans = item.querySelector('.faq-ans');
  const isOpen = ans.classList.contains('open');
  // Close all
  document.querySelectorAll('.faq-ans').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  // Update all + icons to +
  document.querySelectorAll('.faq-item button span').forEach(s => s.textContent = '+');
  if (!isOpen) {
    ans.classList.add('open');
    item.classList.add('open');
    // Update icon of the opened item to −
    btn.querySelector('span').textContent = '\u2212';
  }
}

function filterProducts(cat, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.product-card').forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? '' : 'none';
    // Also toggle hidden class for CSS-driven transitions
    card.classList.toggle('hidden', !show);
  });
}

function submitForm(e) {
  e.preventDefault();
  const form = e.target;
  const msg = document.getElementById('formMsg');
  // Basic phone validation
  const phone = form.querySelector('input[type="tel"]').value.trim();
  if (phone.length < 10) {
    msg.style.color = '#c0392b';
    msg.textContent = '\u26a0\ufe0f Please enter a valid 10-digit phone number.';
    return;
  }
  msg.style.color = '#2d7a46';
  msg.textContent = '\u2705 Message sent! We will reply within 2 hours.';
  form.reset();
  toast('Message sent successfully!');
  setTimeout(() => { msg.textContent = ''; }, 5000);
}

function toast(msg) {
  const box = document.getElementById('toastBox');
  if (!box) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => {
    el.classList.add('toast-hide');
    setTimeout(() => el.remove(), 400);
  }, 2300);
}

window.addEventListener('scroll', () => {
  document.getElementById('header').style.boxShadow =
    window.scrollY > 30 ? '0 4px 24px rgba(0,0,0,.12)' : '';
});

function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const emojis = ['\ud83c\udf3f', '\u2728', '\ud83c\udf43', '\ud83d\udc9a', '\ud83c\udf31', '\u2b50', '\ud83d\udcb5'];
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.cssText = [
      'left:' + (Math.random() * 100) + '%',
      'top:' + (30 + Math.random() * 65) + '%',
      'font-size:' + (0.7 + Math.random() * 1.4) + 'rem',
      '--dur:' + (4 + Math.random() * 9) + 's',
      'animation-delay:' + (Math.random() * 7) + 's',
      'opacity:0'
    ].join(';');
    container.appendChild(p);
  }
}

function animateCounters() {
  if (countersAnimated) return;
  countersAnimated = true;
  document.querySelectorAll('.counter').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    let current = 0;
    const duration = 1500; // ms
    const steps = 60;
    const step = target / steps;
    const interval = duration / steps;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        clearInterval(timer);
        el.textContent = target.toLocaleString('en-IN') + '+';
      } else {
        el.textContent = Math.floor(current).toLocaleString('en-IN') + '+';
      }
    }, interval);
  });
}

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(heroStats);
  } else {
    animateCounters();
  }
}

/* ---- ADD REVEAL CLASSES & RE-OBSERVE AFTER DOM IS READY ---- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.benefit-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i * 0.08) + 's';
  });
  document.querySelectorAll('.product-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i * 0.1) + 's';
  });
  document.querySelectorAll('.review-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i * 0.1) + 's';
  });
  document.querySelectorAll('.howto-step').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i * 0.12) + 's';
  });
  document.querySelectorAll('.section-title').forEach(el => el.classList.add('reveal'));
  document.querySelectorAll('.contact-card').forEach((el, i) => {
    el.classList.add('reveal-left');
    el.style.transitionDelay = (i * 0.1) + 's';
  });
  document.querySelectorAll('.contact-form').forEach(el => el.classList.add('reveal-right'));
  document.querySelectorAll('.trust-item').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i * 0.07) + 's';
  });
  // Observe all newly-added reveal elements
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));

  // Initial render
  renderCart();
  updateWhatsAppLink();
  createParticles();
});
