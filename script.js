let cart = [];

function toggleSearch() {
  const search = document.getElementById('mobileSearch');
  search.classList.toggle('open');
  syncOverlay();
}

function closeSearch() {
  document.getElementById('mobileSearch').classList.remove('open');
  syncOverlay();
}

function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
  syncOverlay();
}

function closeMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
  syncOverlay();
}

function toggleCart() {
  document.getElementById('cartDrawer').classList.toggle('open');
  syncOverlay();
}

function syncOverlay() {
  const overlay = document.getElementById('overlay');
  const cartOpen = document.getElementById('cartDrawer').classList.contains('open');
  const menuOpen = document.getElementById('mobileMenu').classList.contains('open');
  const searchOpen = document.getElementById('mobileSearch').classList.contains('open');
  if (cartOpen || menuOpen || searchOpen) {
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  } else {
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function changeQty(id, diff) {
  const el = document.getElementById(id);
  let value = parseInt(el.textContent, 10) + diff;
  if (value < 1) value = 1;
  el.textContent = value;
}

function addToCart(name, price, qtyId) {
  const qty = parseInt(document.getElementById(qtyId).textContent, 10);
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ name, price, qty });
  }
  document.getElementById(qtyId).textContent = '1';
  updateCart();
  showToast(name + ' added to cart');
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}

function updateCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById('cartCount').textContent = count;

  const cartItems = document.getElementById('cartItems');
  const cartFoot = document.getElementById('cartFoot');

  if (cart.length === 0) {
    cartItems.className = 'cart-items empty-state';
    cartItems.innerHTML = `
      <div class="empty-card">
        <div class="empty-icon">🛒</div>
        <h4>Your cart is empty</h4>
        <p>Add your first Moringai product to begin.</p>
        <a href="#shop" class="btn btn-primary" onclick="toggleCart()">Shop products</a>
      </div>
    `;
    cartFoot.style.display = 'none';
    document.getElementById('cartTotal').textContent = '₹0';
    return;
  }

  cartItems.className = 'cart-items';
  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong>
        <p>₹${(item.price * item.qty).toLocaleString('en-IN')} · ${item.qty} × ₹${item.price}</p>
      </div>
      <button onclick="removeItem(${index})">✕</button>
    </div>
  `).join('');

  document.getElementById('cartTotal').textContent = '₹' + total.toLocaleString('en-IN');
  cartFoot.style.display = 'block';
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function toggleFaq(button) {
  const item = button.parentElement;
  const body = item.querySelector('.faq-body');
  const opened = body.classList.contains('open');
  document.querySelectorAll('.faq-body').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.faq-item button span').forEach(el => el.textContent = '+');
  if (!opened) {
    body.classList.add('open');
    button.querySelector('span').textContent = '−';
  }
}

function submitForm(event) {
  event.preventDefault();
  document.getElementById('formMsg').textContent = 'Message sent successfully.';
  event.target.reset();
  showToast('Support request sent');
}

function checkout() {
  showToast('Checkout flow ready for integration');
}

function jumpToShop() {
  document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) {
    closeMenu();
    closeSearch();
  }
});
