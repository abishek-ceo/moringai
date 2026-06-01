const PRODUCTS = [
  { id: 1, name: 'Moringa Powder 100g', weight: '100g', price: 149, mrp: 199, emoji: '🌿', badge: 'Bestseller', desc: 'Pure Murungai leaf powder, fine grade' },
  { id: 2, name: 'Moringa Powder 250g', weight: '250g', price: 299, mrp: 399, emoji: '🌿', badge: 'Value Pack', desc: 'Best value for daily use' },
  { id: 3, name: 'Moringa Powder 500g', weight: '500g', price: 549, mrp: 749, emoji: '🌿', badge: 'Family Pack', desc: 'Bulk pack for the whole family' },
  { id: 4, name: 'Moringa Capsules 60ct', weight: '60 caps', price: 349, mrp: 449, emoji: '💊', badge: 'New', desc: '500mg per capsule, easy to swallow' },
  { id: 5, name: 'Moringa Tea Bags 20ct', weight: '20 bags', price: 199, mrp: 249, emoji: '🍵', badge: '', desc: 'Refreshing herbal tea, daily wellness' },
  { id: 6, name: 'Moringa Combo Pack', weight: '250g + 60 caps', price: 599, mrp: 799, emoji: '🎁', badge: '25% OFF', desc: 'Powder + Capsules combo deal' },
];

const REVIEWS = [
  { name: 'Priya S.', city: 'Chennai', stars: 5, text: 'Amazing quality! My energy levels have improved so much since I started taking Moringai powder daily.' },
  { name: 'Rajan K.', city: 'Coimbatore', stars: 5, text: 'Pure and fresh. The packaging is great and delivery was super fast. Will order again!' },
  { name: 'Meera N.', city: 'Bangalore', stars: 4, text: 'Good quality moringa powder. Noticed improvement in my hair growth after 3 weeks of use.' },
  { name: 'Arun T.', city: 'Madurai', stars: 5, text: 'Best moringa powder I have tried. No additives, natural smell, and great taste in smoothies.' },
  { name: 'Lakshmi R.', city: 'Kochi', stars: 5, text: 'Ordered the family pack and very happy. The capsules are also super convenient for travel.' },
];

let cart = JSON.parse(localStorage.getItem('moringai_cart') || '[]');

function saveCart() { localStorage.setItem('moringai_cart', JSON.stringify(cart)); }
function cartTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
function cartCount() { return cart.reduce((s, i) => s + i.qty, 0); }
function shipping(total) { return total >= 499 ? 0 : 49; }

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = PRODUCTS.map(p => {
    const ci = cart.find(c => c.id === p.id);
    const disc = Math.round((1 - p.price / p.mrp) * 100);
    return `<div class="product-card">
      <div class="product-img">
        <span>${p.emoji}</span>
        ${p.badge ? `<span class="badge-tag">${p.badge}</span>` : ''}
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-weight">${p.weight}</div>
        <div style="display:flex;align-items:center;flex-wrap:wrap">
          <span class="product-price">₹${p.price}</span>
          <span class="product-mrp">₹${p.mrp}</span>
        </div>
        <div class="product-discount">${disc}% off</div>
      </div>
      ${ci
        ? `<div class="qty-controls">
            <button class="qty-btn" onclick="changeQty(${p.id},-1)">−</button>
            <span class="qty-num">${ci.qty}</span>
            <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
           </div>`
        : `<button class="add-btn" onclick="addToCart(${p.id})">+ Add to Cart</button>`
      }
    </div>`;
  }).join('');
}

function renderReviews() {
  const el = document.getElementById('reviewsScroll');
  el.innerHTML = REVIEWS.map(r => `
    <div class="review-card">
      <div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
      <div class="review-text">"${r.text}"</div>
      <div class="review-name">— ${r.name}, ${r.city}</div>
    </div>`).join('');
}

function updateCartCount() {
  const cnt = cartCount();
  document.getElementById('cartCount').textContent = cnt;
  const sticky = document.getElementById('stickyCart');
  const stickyText = document.getElementById('stickyCartText');
  if (cnt > 0) {
    sticky.classList.add('visible');
    stickyText.textContent = `🛒 ${cnt} item${cnt > 1 ? 's' : ''} — ₹${cartTotal()}`;
  } else {
    sticky.classList.remove('visible');
  }
}

function addToCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else cart.push({ id: p.id, name: p.name, price: p.price, emoji: p.emoji, qty: 1 });
  saveCart(); renderProducts(); updateCartCount();
  showToast(`✅ ${p.name} added to cart!`);
}

function changeQty(id, delta) {
  const idx = cart.findIndex(c => c.id === id);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart(); renderProducts(); updateCartCount();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function openCart() {
  document.getElementById('cartOverlay').classList.add('active');
  showCartView();
}
function closeCart() {
  document.getElementById('cartOverlay').classList.remove('active');
}
function handleOverlayClick(e) {
  if (e.target === document.getElementById('cartOverlay')) closeCart();
}

function showCartView() {
  document.getElementById('cartView').style.display = 'block';
  document.getElementById('checkoutForm').classList.remove('active');
  document.getElementById('successScreen').classList.remove('active');
  renderCartItems();
}
function showCart() { showCartView(); }

function renderCartItems() {
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  if (cart.length === 0) {
    itemsEl.innerHTML = '<div class="cart-empty">🛒<br><br>Your cart is empty!<br><span style="font-size:0.8rem">Add some products to get started</span></div>';
    footerEl.innerHTML = '';
    return;
  }
  itemsEl.innerHTML = cart.map(i => `
    <div class="cart-item">
      <span class="cart-item-emoji">${i.emoji}</span>
      <div class="cart-item-details">
        <div class="cart-item-name">${i.name}</div>
        <div class="cart-item-price">₹${i.price} × ${i.qty} = ₹${i.price * i.qty}</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${i.id})">🗑</button>
    </div>`).join('');
  const tot = cartTotal();
  const ship = shipping(tot);
  footerEl.innerHTML = `
    <div class="cart-total">
      <div class="cart-total-row"><span>Subtotal</span><span>₹${tot}</span></div>
      <div class="cart-total-row"><span>Shipping</span><span>${ship === 0 ? '<span style="color:#2e7d32;font-weight:700">FREE 🎉</span>' : '₹' + ship}</span></div>
      ${ship > 0 ? `<div style="font-size:0.72rem;color:#e53935;margin-top:-4px;margin-bottom:4px">Add ₹${499 - tot} more for FREE shipping!</div>` : ''}
      <div class="cart-total-row grand"><span>Total</span><span>₹${tot + ship}</span></div>
    </div>
    <button class="checkout-btn" onclick="showCheckout()">Proceed to Checkout →</button>`;
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart(); renderProducts(); updateCartCount(); renderCartItems();
}

function showCheckout() {
  document.getElementById('cartView').style.display = 'none';
  document.getElementById('checkoutForm').classList.add('active');
  const tot = cartTotal();
  const ship = shipping(tot);
  document.getElementById('orderSummaryBox').innerHTML = `
    <div class="cart-total-row"><span>Subtotal</span><span>₹${tot}</span></div>
    <div class="cart-total-row"><span>Shipping</span><span>${ship === 0 ? 'FREE' : '₹' + ship}</span></div>
    <div class="cart-total-row grand"><span>Total Payable</span><span>₹${tot + ship}</span></div>`;
}

async function placeOrder(method, razorpayId = null) {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  if (!name || !phone || !address) { showToast('⚠️ Please fill all required fields'); return; }
  if (!/^[6-9]\d{9}$/.test(phone)) { showToast('⚠️ Enter a valid 10-digit phone number'); return; }
  const tot = cartTotal();
  const ship = shipping(tot);
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: { name, phone, email: document.getElementById('custEmail').value, address: address + ', ' + document.getElementById('custState').value },
        items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
        total: tot + ship, shipping: ship,
        paymentMethod: method, razorpayPaymentId: razorpayId
      })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('checkoutForm').classList.remove('active');
      document.getElementById('successScreen').classList.add('active');
      document.getElementById('successOrderId').textContent = '📦 Order ID: ' + data.order.id;
    } else { showToast('❌ Order failed. Try again.'); }
  } catch { showToast('❌ Network error. Check your connection.'); }
}

function resetCart() { cart = []; saveCart(); renderProducts(); updateCartCount(); }

function payWithRazorpay() {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  if (!name || !phone || !address) { showToast('⚠️ Please fill all required fields'); return; }
  if (!/^[6-9]\d{9}$/.test(phone)) { showToast('⚠️ Enter a valid 10-digit phone number'); return; }
  const tot = cartTotal();
  const ship = shipping(tot);
  const options = {
    key: 'YOUR_RAZORPAY_KEY_ID',
    amount: (tot + ship) * 100,
    currency: 'INR',
    name: 'Moringai',
    description: 'Pure Murungai Powder Order',
    image: '',
    handler: function(response) { placeOrder('Razorpay', response.razorpay_payment_id); },
    prefill: { name, contact: phone },
    notes: { address },
    theme: { color: '#2e7d32' }
  };
  const rzp = new Razorpay(options);
  rzp.open();
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderReviews();
  updateCartCount();
});
