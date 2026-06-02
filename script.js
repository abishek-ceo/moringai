let qty = 1;

function changeQty(change) {
  qty = Math.max(1, qty + change);
  document.getElementById('qty').textContent = qty;
}

function addToCart() {
  const msg = document.getElementById('cart-message');
  msg.textContent = '✅ ' + qty + ' item' + (qty > 1 ? 's' : '') + ' added to cart!';
  setTimeout(function() { msg.textContent = ''; }, 4000);
}

function submitForm(event) {
  event.preventDefault();
  const msg = document.getElementById('form-message');
  msg.textContent = '✅ Thanks! We will get back to you shortly.';
  event.target.reset();
  setTimeout(function() { msg.textContent = ''; }, 5000);
}

function toggleMenu() {
  var nav = document.getElementById('main-nav');
  nav.classList.toggle('open');
}
