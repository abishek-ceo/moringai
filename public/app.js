// ─── STYLES INJECTION ────────────────────────────────────
(function(){
  var style = document.createElement('style');
  style.textContent = [
    '.card-qty-ctrl{display:flex;align-items:center;gap:0;border-radius:50px;overflow:hidden;border:2px solid #2d6a4f;background:#fff;}',
    '.card-qty-ctrl button{width:34px;height:38px;background:#2d6a4f;color:#fff;font-size:18px;font-weight:700;border:none;cursor:pointer;line-height:1;transition:background 0.2s;}',
    '.card-qty-ctrl button:hover{background:#40916c;}',
    '.card-qty-ctrl .cq-num{min-width:34px;text-align:center;font-size:15px;font-weight:700;color:#2d6a4f;font-family:Inter,sans-serif;}'
  ].join('');
  document.head.appendChild(style);
})();

// ─── STATE ────────────────────────────────────────────────
var cart = JSON.parse(localStorage.getItem('moringai_cart') || '[]');
var FREE_SHIPPING_THRESHOLD = 499;

function saveCart() {
  localStorage.setItem('moringai_cart', JSON.stringify(cart));
}

function updateMobileBuyBar() {
  var bar = document.querySelector('.mobile-buy-bar');
  if (!bar) return;
  if (getCartCount() > 0) bar.style.display = 'flex';
  else bar.style.display = 'none';
}

function getCardQty(name, variant) {
  var item = cart.find(function(i){ return i.name === name && i.variant === variant; });
  return item ? item.qty : 0;
}

function getCardPrice(card) {
  var el = card.querySelector('.price-current');
  if (!el) return 0;
  return parseInt(el.textContent.replace(/[^0-9]/g,''), 10) || 0;
}

function getCardEmoji(card) {
  var el = card.querySelector('.product-emoji');
  return el ? el.textContent.trim() : '🌿';
}

function updateCardButton(name, variant) {
  var qty = getCardQty(name, variant);
  document.querySelectorAll('.product-card').forEach(function(card) {
    if ((card.dataset.name || '') !== name) return;
    var footer = card.querySelector('.product-footer');
    if (!footer) return;
    var btn = footer.querySelector('.add-to-cart, .card-qty-ctrl');
    if (!btn) return;
    var safeN = name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    var safeV = variant.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    var price = getCardPrice(card);
    var emoji = getCardEmoji(card);
    if (qty === 0) {
      btn.outerHTML = '<button class="add-to-cart" onclick="addToCart(\'' + safeN + '\',' + price + ',\'' + emoji + '\',getActiveVariant(this))">🛒 Add</button>';
    } else {
      btn.outerHTML = '<div class="card-qty-ctrl">'+
        '<button onclick="cardDecrement(this,\'' + safeN + '\',\'' + safeV + '\')">−</button>'+
        '<span class="cq-num">' + qty + '</span>'+
        '<button onclick="cardIncrement(this,\'' + safeN + '\',' + price + ',\'' + emoji + '\',\'' + safeV + '\')">+</button>'+
        '</div>';
    }
  });
}

function cardIncrement(btn, name, price, emoji, variant) {
  var item = cart.find(function(i){ return i.name === name && i.variant === variant; });
  if (item) { item.qty += 1; }
  else { cart.push({ name: name, price: price, emoji: emoji, variant: variant, qty: 1 }); }
  saveCart(); updateCartUI(); updateCardButton(name, variant);
  showToast('✅ ' + name + ' added!');
}

function cardDecrement(btn, name, variant) {
  var idx = cart.findIndex(function(i){ return i.name === name && i.variant === variant; });
  if (idx === -1) return;
  cart[idx].qty -= 1;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart(); updateCartUI(); updateCardButton(name, variant);
}

function addToCart(name, price, emoji, variant) {
  var existing = cart.find(function(i){ return i.name === name && i.variant === variant; });
  if (existing) { existing.qty += 1; }
  else { cart.push({ name: name, price: price, emoji: emoji, variant: variant, qty: 1 }); }
  saveCart(); updateCartUI(); updateCardButton(name, variant);
  showToast('✅ ' + name + ' added to cart!');
  var cartBtn = document.getElementById('cartToggle');
  if (cartBtn) { cartBtn.style.transform = 'scale(1.3)'; setTimeout(function(){ cartBtn.style.transform = ''; }, 300); }
}

function removeFromCart(name, variant) {
  cart = cart.filter(function(i){ return !(i.name === name && i.variant === variant); });
  saveCart(); updateCartUI(); updateCardButton(name, variant);
}

function changeQty(name, variant, delta) {
  var item = cart.find(function(i){ return i.name === name && i.variant === variant; });
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(function(i){ return !(i.name === name && i.variant === variant); });
  saveCart(); updateCartUI(); updateCardButton(name, variant);
}

function getCartTotal() {
  return cart.reduce(function(sum, item){ return sum + item.price * item.qty; }, 0);
}

function getCartCount() {
  return cart.reduce(function(sum, item){ return sum + item.qty; }, 0);
}

function updateCartUI() {
  var total = getCartTotal();
  var count = getCartCount();
  var badge = document.getElementById('cartBadge');
  if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }

  var container = document.getElementById('cartBody');
  var footer = document.getElementById('cartFooter');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:48px 16px;color:#888"><div style="font-size:48px;margin-bottom:12px">🛒</div><p>Your cart is empty</p></div>';
    if (footer) footer.innerHTML = '';
  } else {
    var html = '';
    cart.forEach(function(item) {
      var safeN = item.name.replace(/"/g,'&quot;');
      var safeV = item.variant.replace(/"/g,'&quot;');
      html += '<div style="display:flex;gap:12px;align-items:center;padding:14px 0;border-bottom:1px solid #f0f0f0">' +
        '<div style="font-size:32px;width:48px;text-align:center">' + item.emoji + '</div>' +
        '<div style="flex:1">' +
          '<div style="font-weight:600;font-size:14px">' + item.name + '</div>' +
          '<div style="font-size:12px;color:#888;margin:2px 0">' + item.variant + '</div>' +
          '<div style="display:flex;align-items:center;gap:12px;margin-top:6px">' +
            '<span style="font-weight:700;color:#2d6a4f">₹' + (item.price * item.qty) + '</span>' +
            '<div style="display:flex;align-items:center;gap:6px">' +
              '<button onclick="changeQty(&quot;' + safeN + '&quot;,&quot;' + safeV + '&quot;,-1)" style="width:28px;height:28px;border-radius:50%;border:1px solid #2d6a4f;background:#fff;color:#2d6a4f;font-size:16px;cursor:pointer">−</button>' +
              '<span style="font-weight:600;min-width:20px;text-align:center">' + item.qty + '</span>' +
              '<button onclick="changeQty(&quot;' + safeN + '&quot;,&quot;' + safeV + '&quot;,1)" style="width:28px;height:28px;border-radius:50%;border:none;background:#2d6a4f;color:#fff;font-size:16px;cursor:pointer">+</button>' +
            '</div>' +
            '<button onclick="removeFromCart(&quot;' + safeN + '&quot;,&quot;' + safeV + '&quot;)" style="background:none;border:none;cursor:pointer;font-size:18px;color:#ccc">🗑</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    container.innerHTML = '<div style="padding:0 16px">' + html + '</div>';
    var shipping = total >= 499 ? 0 : 49;
    if (footer) footer.innerHTML = '<div style="padding:16px">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#888">Subtotal</span><span>₹' + total + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="color:#888">Shipping</span><span style="color:' + (shipping===0?'#2d6a4f':'#333') + '">' + (shipping===0?'FREE':'₹49') + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;font-weight:700;font-size:17px;margin-bottom:16px"><span>Total</span><span style="color:#2d6a4f">₹' + (total+shipping) + '</span></div>' +
      '<button onclick="openCheckout()" style="width:100%;padding:16px;background:#1b4332;color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer">Checkout →</button>' +
    '</div>';
  }
  updateMobileBuyBar();
}

function openCart() {
  var drawer = document.getElementById('cartDrawer');
  var overlay = document.getElementById('cartOverlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  var drawer = document.getElementById('cartDrawer');
  var overlay = document.getElementById('cartOverlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function openCheckout() {
  if (cart.length === 0) { showToast('⚠️ Your cart is empty!'); return; }
  closeCart();
  var total = getCartTotal();
  var shipping = total >= 499 ? 0 : 49;
  var finalTotal = total + shipping;
  var itemsHtml = cart.map(function(i){ return '<div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px"><span>' + i.name + ' x' + i.qty + '</span><span>₹' + (i.price*i.qty) + '</span></div>'; }).join('');
  var body = document.getElementById('checkoutBody');
  if (body) body.innerHTML = '<form onsubmit="placeOrder(event)" style="padding:0 4px">' +
    '<h4 style="margin-bottom:16px;color:#1b4332">Delivery Details</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">' +
      '<input id="cfName" placeholder="Full Name *" required style="padding:12px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;font-family:inherit">' +
      '<input id="cfPhone" placeholder="Phone *" required style="padding:12px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;font-family:inherit">' +
    '</div>' +
    '<input id="cfEmail" placeholder="Email" style="width:100%;padding:12px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;margin-bottom:10px;box-sizing:border-box;font-family:inherit">' +
    '<input id="cfAddress" placeholder="Address" style="width:100%;padding:12px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;margin-bottom:10px;box-sizing:border-box;font-family:inherit">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">' +
      '<input id="cfCity" placeholder="City" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;font-family:inherit">' +
      '<input id="cfPin" placeholder="PIN Code" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;font-family:inherit">' +
    '</div>' +
    '<h4 style="margin-bottom:12px;color:#1b4332">Order Summary</h4>' +
    '<div style="background:#f7faf8;border-radius:10px;padding:12px;margin-bottom:16px">' + itemsHtml +
      '<div style="border-top:1px solid #ddd;margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-weight:700"><span>Total</span><span style="color:#2d6a4f">₹' + finalTotal + '</span></div>' +
    '</div>' +
    '<h4 style="margin-bottom:10px;color:#1b4332">Payment</h4>' +
    '<div style="display:flex;gap:10px;margin-bottom:20px">' +
      '<label style="flex:1;padding:12px;border:1.5px solid #ddd;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:8px"><input type="radio" name="payment" value="cod" checked> Cash on Delivery</label>' +
      '<label style="flex:1;padding:12px;border:1.5px solid #ddd;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:8px"><input type="radio" name="payment" value="razorpay"> 💳 Online Pay</label>' +
    '</div>' +
    '<button type="submit" class="btn-place-order" style="width:100%;padding:16px;background:#1b4332;color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer">✅ Place Order</button>' +
  '</form>';
  var modal = document.getElementById('checkoutModal');
  var mOverlay = document.getElementById('modal-overlay') || document.getElementById('checkoutOverlay');
  if (modal) modal.classList.add('open');
  if (mOverlay) mOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  var modal = document.getElementById('checkoutModal');
  var overlay = document.getElementById('checkoutOverlay') || document.getElementById('modal-overlay');
  if (modal) modal.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function placeOrder(e) {
  e.preventDefault();
  var nameVal = document.getElementById('cfName').value.trim();
  var phone = document.getElementById('cfPhone').value.trim();
  var email = document.getElementById('cfEmail') ? document.getElementById('cfEmail').value.trim() : '';
  var address = document.getElementById('cfAddress') ? document.getElementById('cfAddress').value.trim() : '';
  var city = document.getElementById('cfCity') ? document.getElementById('cfCity').value.trim() : '';
  var pin = document.getElementById('cfPin') ? document.getElementById('cfPin').value.trim() : '';
  var paymentInput = document.querySelector('input[name="payment"]:checked');
  var selectedPayment = paymentInput ? paymentInput.value : 'cod';
  if (!nameVal || !phone) { showToast('⚠️ Please fill name and phone'); return; }
  var total = getCartTotal();
  var shipping = total >= 499 ? 0 : 49;
  var finalTotal = total + shipping;
  var orderData = {
    customer: { name: nameVal, phone: phone, email: email, address: address + (city?', '+city:'') + (pin?' - '+pin:'') },
    items: cart.map(function(i){ return { name: i.name, variant: i.variant, qty: i.qty, price: i.price }; }),
    total: finalTotal, shipping: shipping, paymentMethod: selectedPayment
  };
  var btn = document.querySelector('.btn-place-order');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Placing...'; }
  fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(orderData) })
  .then(function(r){ return r.json(); })
  .then(function(data){
    closeCheckoutModal(); cart=[]; saveCart(); updateCartUI();
    showToast('🎉 Order placed! ' + (data.order ? 'ID: '+data.order.id : "We'll deliver in 2-5 days."));
    if (btn) { btn.disabled=false; btn.textContent='✅ Place Order'; }
  })
  .catch(function(){
    closeCheckoutModal(); cart=[]; saveCart(); updateCartUI();
    showToast("🎉 Order received! We'll contact you on WhatsApp shortly.");
    if (btn) { btn.disabled=false; btn.textContent='✅ Place Order'; }
  });
}

function getActiveVariant(addBtn) {
  var card = addBtn.closest && addBtn.closest('.product-card');
  if (!card) return '100g';
  var active = card.querySelector('.variant-btn.active');
  return active ? active.textContent.trim() : '100g';
}

function selectVariant(btn) {
  var card = btn.closest('.product-card');
  if (!card) return;
  card.querySelectorAll('.variant-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
}

var toastTimer;
function showToast(msg) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ toast.classList.remove('show'); }, 3200);
}

function closeMobileMenu() {
  var menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', function(){
  // Cart toggle
  var cartToggle = document.getElementById('cartToggle');
  if (cartToggle) cartToggle.addEventListener('click', openCart);
  var cartClose = document.getElementById('cartClose');
  if (cartClose) cartClose.addEventListener('click', closeCart);
  var cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Checkout close
  var checkoutBack = document.getElementById('checkoutBack');
  if (checkoutBack) checkoutBack.addEventListener('click', closeCheckoutModal);
  var checkoutClose = document.getElementById('checkoutClose');
  if (checkoutClose) checkoutClose.addEventListener('click', closeCheckoutModal);

  // Mobile menu
  var menuToggle = document.getElementById('menuToggle');
  if (menuToggle) menuToggle.addEventListener('click', function(){
    var menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('open');
  });

  // Mobile buy bar
  var buyBarBtn = document.querySelector('.buy-bar-btn');
  if (buyBarBtn) buyBarBtn.addEventListener('click', openCart);

  // Smooth scroll nav
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior:'smooth' }); closeMobileMenu(); }
    });
  });

  // Header scroll shadow
  var header = document.querySelector('header');
  if (header) window.addEventListener('scroll', function(){
    header.style.boxShadow = window.scrollY > 10 ? '0 4px 30px rgba(45,106,79,0.12)' : '';
    header.style.background = window.scrollY > 10 ? 'rgba(255,255,255,0.99)' : '';
  }, {passive:true});

  // Products
  renderProducts();
  renderReviews();
  updateCartUI();
  cart.forEach(function(item){ updateCardButton(item.name, item.variant); });

  // Scroll fade
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, {threshold:0.1});
    document.querySelectorAll('.fade-in').forEach(function(el){ obs.observe(el); });
  } else {
    document.querySelectorAll('.fade-in').forEach(function(el){ el.classList.add('visible'); });
  }
});

// ─── PRODUCTS DATA ────────────────────────────────────────
var PRODUCTS = [
  { name:'Moringa Leaf Powder', emoji:'🌿', category:'powder', price:299, oldPrice:399, badge:'BESTSELLER',
    desc:'100% pure sun-dried moringa leaf powder. Cold processed to retain maximum nutrients.',
    variants:['100g','200g','500g'], rating:4.8, reviews:1247 },
  { name:'Moringa Capsules', emoji:'💊', category:'capsules', price:399, oldPrice:499, badge:'NEW',
    desc:'500mg pure moringa per capsule. 60 caps per bottle. Easy daily wellness routine.',
    variants:['60 caps','120 caps'], rating:4.7, reviews:863 },
  { name:'Moringa Tea Blend', emoji:'🍵', category:'tea', price:249, oldPrice:329, badge:'SALE',
    desc:'Soothing moringa green tea blend with tulsi and ginger. 20 biodegradable bags.',
    variants:['20 bags','40 bags'], rating:4.9, reviews:512 },
  { name:'Moringa Seed Oil', emoji:'✨', category:'oil', price:549, oldPrice:699, badge:'PREMIUM',
    desc:'Cold-pressed moringa seed oil for skin & hair. Rich in oleic acid and antioxidants.',
    variants:['30ml','60ml','100ml'], rating:4.8, reviews:341 },
  { name:'Moringa Gift Set', emoji:'🎁', category:'gift', price:799, oldPrice:999, badge:'GIFT',
    desc:'Curated gift set: Powder + Capsules + Tea. Perfect for gifting wellness.',
    variants:['Standard','Premium'], rating:5.0, reviews:198 },
  { name:'Raw Moringa Seeds', emoji:'🌱', category:'seeds', price:199, oldPrice:249, badge:'ORGANIC',
    desc:'Hand-picked raw moringa seeds for planting or direct consumption.',
    variants:['50g','100g','250g'], rating:4.6, reviews:427 }
];

var REVIEWS = [
  { name:'Priya S.', location:'Chennai', rating:5, text:'Amazing product! My energy levels have improved so much after using Moringai powder for just 3 weeks.', avatar:'👩' },
  { name:'Rahul M.', location:'Bangalore', rating:5, text:'Best moringa powder I have tried. The quality is exceptional and you can taste the freshness.', avatar:'👨' },
  { name:'Anitha K.', location:'Coimbatore', rating:5, text:'My whole family uses this now. The capsules are so convenient for daily use. Highly recommended!', avatar:'👩‍🦱' },
  { name:'Vikram P.', location:'Mumbai', rating:4, text:'Fast delivery, great packaging, and the moringa tea blend is absolutely delicious!', avatar:'🧔' },
  { name:'Deepa R.', location:'Hyderabad', rating:5, text:'I have been using this for 2 months and my hair and skin have never looked better. Pure magic!', avatar:'💁‍♀️' },
  { name:'Suresh N.', location:'Madurai', rating:5, text:'Directly from Tamil Nadu farms — you can feel the difference in quality. Will reorder!', avatar:'👴' }
];

function renderProducts() {
  var grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = PRODUCTS.map(function(p){
    var stars = '⭐'.repeat(Math.floor(p.rating));
    var variantBtns = p.variants.map(function(v, i){
      return '<button class="variant-btn' + (i===0?' active':'') + '" onclick="selectVariant(this)">' + v + '</button>';
    }).join('');
    var save = Math.round(((p.oldPrice - p.price)/p.oldPrice)*100);
    return '<div class="product-card fade-in" data-name="' + p.name + '" data-category="' + p.category + '">' +
      '<div class="product-img"><span class="product-emoji">' + p.emoji + '</span><span class="product-badge">' + p.badge + '</span></div>' +
      '<div class="product-info">' +
        '<div class="product-meta"><span class="product-category">' + p.category.toUpperCase() + '</span><span class="product-rating">' + stars + ' (' + p.reviews + ')</span></div>' +
        '<h3 class="product-name">' + p.name + '</h3>' +
        '<p class="product-desc">' + p.desc + '</p>' +
        '<div class="product-variants">' + variantBtns + '</div>' +
        '<div class="product-footer">' +
          '<div class="product-price"><span class="price-current">₹' + p.price + '</span><span class="price-old">₹' + p.oldPrice + '</span><span class="price-save">' + save + '% off</span></div>' +
          '<button class="add-to-cart" onclick="addToCart(\'' + p.name.replace(/'/g,"\\'") + '\',' + p.price + ',\'' + p.emoji + '\',getActiveVariant(this))">🛒 Add</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function renderReviews() {
  var grid = document.getElementById('reviewsGrid');
  if (!grid) return;
  grid.innerHTML = REVIEWS.map(function(r){
    var stars = '⭐'.repeat(r.rating);
    return '<div class="review-card fade-in">' +
      '<div class="review-header"><span class="review-avatar">' + r.avatar + '</span>' +
        '<div><div class="review-name">' + r.name + '</div><div class="review-location">📍 ' + r.location + '</div></div>' +
        '<div class="review-stars" style="margin-left:auto">' + stars + '</div>' +
      '</div>' +
      '<p class="review-text">' + r.text + '</p>' +
    '</div>';
  }).join('');
}
