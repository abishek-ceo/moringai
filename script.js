// Cart
let cart = [];

function toggleCart() {
  document.getElementById('cartPanel').classList.toggle('open');
  document.getElementById('cartBg').classList.toggle('open');
  document.body.style.overflow = document.getElementById('cartPanel').classList.contains('open') ? 'hidden' : '';
}

function qtyChange(id, d) {
  const el = document.getElementById(id);
  let v = Math.max(1, parseInt(el.textContent) + d);
  el.textContent = v;
}

function addCart(name, price, qtyId) {
  const qty = parseInt(document.getElementById(qtyId).textContent);
  const ex = cart.find(i => i.name === name);
  if (ex) ex.qty += qty;
  else cart.push({ name, price, qty });
  document.getElementById(qtyId).textContent = '1';
  renderCart();
  toast('✅ Added: ' + name);
}

function removeCartItem(i) {
  cart.splice(i, 1);
  renderCart();
}

function renderCart() {
  const count = cart.reduce((a, i) => a + i.qty, 0);
  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
  document.getElementById('cartBadge').textContent = count;

  const body = document.getElementById('cartBody');
  const foot = document.getElementById('cartFoot');

  if (!cart.length) {
    body.innerHTML = `<div class="cart-empty-state"><p style="font-size:2.5rem">🛒</p><p>Cart is empty!</p><small>Add products to continue</small></div>`;
    foot.style.display = 'none';
    return;
  }

  body.innerHTML = cart.map((item, i) => `
    <div class="cart-item-row">
      <div class="ci-info">
        <strong>${item.name}</strong>
        <p>₹${(item.price * item.qty).toLocaleString('en-IN')} &nbsp;·&nbsp; ${item.qty} × ₹${item.price}</p>
      </div>
      <button onclick="removeCartItem(${i})">✕</button>
    </div>
  `).join('');

  document.getElementById('cartTotal').textContent = '₹' + total.toLocaleString('en-IN');
  foot.style.display = 'flex';
}

// Nav
function toggleNav() {
  document.getElementById('header').classList.toggle('mobile-nav-open');
}

// FAQ
function openFaq(btn) {
  const item = btn.parentElement;
  const ans = item.querySelector('.faq-ans');
  const isOpen = ans.classList.contains('open');
  document.querySelectorAll('.faq-ans').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) {
    ans.classList.add('open');
    item.classList.add('open');
  }
}

// Products filter
function filterProducts(cat, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.product-card').forEach(card => {
    if (cat === 'all' || card.dataset.cat === cat) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

// Contact form
function submitForm(e) {
  e.preventDefault();
  document.getElementById('formMsg').textContent = '✅ Message sent! We will reply within 2 hours.';
  e.target.reset();
  toast('Message sent successfully!');
}

// Toast
function toast(msg) {
  const box = document.getElementById('toastBox');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => el.remove(), 2700);
}

// Sticky header shadow
window.addEventListener('scroll', () => {
  document.getElementById('header').style.boxShadow =
    window.scrollY > 30 ? '0 4px 24px rgba(0,0,0,.12)' : '';
});

// Particles
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const emojis = ['🌿', '✨', '🍃', '💚', '🌱'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.cssText = [
      `left:${Math.random() * 100}%`,
      `top:${40 + Math.random() * 55}%`,
      `font-size:${0.8 + Math.random() * 1.2}rem`,
      `--dur:${5 + Math.random() * 8}s`,
      `animation-delay:${Math.random() * 6}s`,
      `opacity:0`
    ].join(';');
    container.appendChild(p);
  }
}

// Counter animation
function animateCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        clearInterval(timer);
        el.textContent = target.toLocaleString('en-IN') + '+';
      } else {
        el.textContent = Math.floor(current).toLocaleString('en-IN') + '+';
      }
    }, 25);
  });
}

// Intersection observer for counter
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateCounters();
      obs.disconnect();
    }
  }, { threshold: 0.5 });
  obs.observe(heroStats);
}

// Init
createParticles();
