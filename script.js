// Cart state
let cart = [];

// Qty selectors
function changeQty(id, delta) {
  const el = document.getElementById(id);
  let val = parseInt(el.textContent) + delta;
  if (val < 1) val = 1;
  el.textContent = val;
}

// Add to cart
function addToCart(name, price, qtyId) {
  const qty = parseInt(document.getElementById(qtyId).textContent);
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ name, price, qty });
  }
  updateCartUI();
  showToast('\u2705 ' + name + ' added to cart!');
  document.getElementById(qtyId).textContent = '1';
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((a, i) => a + i.qty, 0);
  document.getElementById('cart-count').textContent = count;
  const itemsEl = document.getElementById('cart-items');
  const footerEl = document.getElementById('cart-footer');
  if (cart.length === 0) {
    itemsEl.innerHTML = '<div class="cart-empty"><div class="empty-icon">\u1f6d2</div><p>Your cart is empty</p><a href="#products" class="btn btn-primary" onclick="toggleCart()">Shop Now</a></div>';
    footerEl.style.display = 'none';
    return;
  }
  let html = '';
  let total = 0;
  cart.forEach((item, i) => {
    total += item.price * item.qty;
    html += '<div class="cart-item"><div class="cart-item-info"><h4>' + item.name + '</h4><p>\u20b9' + (item.price * item.qty).toLocaleString('en-IN') + ' (' + item.qty + ' x \u20b9' + item.price + ')</p></div><button class="cart-item-remove" onclick="removeFromCart(' + i + ')">\u2715</button></div>';
  });
  itemsEl.innerHTML = html;
  document.getElementById('cart-total').textContent = '\u20b9' + total.toLocaleString('en-IN');
  footerEl.style.display = 'flex';
}

function toggleCart() {
  document.getElementById('cart-sidebar').classList.toggle('open');
  document.getElementById('cart-overlay').classList.toggle('open');
  document.body.style.overflow = document.getElementById('cart-sidebar').classList.contains('open') ? 'hidden' : '';
}

function checkout() {
  showToast('\u2705 Redirecting to checkout...');
  setTimeout(() => toggleCart(), 1200);
}

// Search
function toggleSearch() {
  document.getElementById('search-bar').classList.toggle('open');
  if (document.getElementById('search-bar').classList.contains('open')) {
    document.getElementById('search-input').focus();
  }
}

// Mobile menu
function toggleMenu() {
  document.getElementById('nav-links').classList.toggle('open');
}

// FAQ
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = answer.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach(q => q.classList.remove('open'));
  if (!isOpen) {
    answer.classList.add('open');
    btn.classList.add('open');
  }
}

// Toast
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Contact form
function submitForm(e) {
  e.preventDefault();
  document.getElementById('form-message').textContent = '\u2705 Message sent! We will reply within 24 hours.';
  e.target.reset();
  setTimeout(() => { document.getElementById('form-message').textContent = ''; }, 5000);
}

// Newsletter
function subscribeNewsletter(e) {
  e.preventDefault();
  document.getElementById('nl-message').textContent = '\u2705 Subscribed! Check your inbox.';
  e.target.reset();
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  const backTop = document.getElementById('back-top');
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
    backTop.classList.add('visible');
  } else {
    navbar.classList.remove('scrolled');
    backTop.classList.remove('visible');
  }
});

// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('nav-links').classList.remove('open');
  });
});
