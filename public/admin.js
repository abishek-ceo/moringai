let adminPass = '';
let allOrders = [];

function doLogin() {
  const pass = document.getElementById('passInput').value;
  if (!pass) return;
  adminPass = pass;
  fetchOrders();
}

function doLogout() {
  adminPass = '';
  allOrders = [];
  document.getElementById('loginWrap').style.display = 'flex';
  document.getElementById('adminWrap').style.display = 'none';
  document.getElementById('passInput').value = '';
}

async function fetchOrders() {
  try {
    const res = await fetch('/api/orders', { headers: { 'x-admin-password': adminPass } });
    if (res.status === 401) {
      document.getElementById('loginErr').style.display = 'block';
      return;
    }
    const data = await res.json();
    allOrders = data.orders || [];
    document.getElementById('loginWrap').style.display = 'none';
    document.getElementById('adminWrap').style.display = 'block';
    renderStats();
    renderOrders();
  } catch (e) {
    alert('Error connecting to server: ' + e.message);
  }
}

function renderStats() {
  const total = allOrders.length;
  const revenue = allOrders.reduce((s, o) => s + (o.total || 0), 0);
  const newOrders = allOrders.filter(o => o.status === 'new').length;
  const delivered = allOrders.filter(o => o.status === 'delivered').length;
  document.getElementById('statsRow').innerHTML = [
    { num: total, label: 'Total Orders' },
    { num: '₹' + revenue.toLocaleString('en-IN'), label: 'Total Revenue' },
    { num: newOrders, label: 'New Orders' },
    { num: delivered, label: 'Delivered' }
  ].map(s => `<div class="stat-card"><div class="num">${s.num}</div><div class="label">${s.label}</div></div>`).join('');
}

function renderOrders() {
  const filter = document.getElementById('statusFilter').value;
  const search = document.getElementById('searchInput').value.toLowerCase();
  let orders = allOrders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter;
    const matchSearch = !search ||
      (o.id && o.id.toLowerCase().includes(search)) ||
      (o.customer && o.customer.name && o.customer.name.toLowerCase().includes(search)) ||
      (o.customer && o.customer.phone && o.customer.phone.includes(search));
    return matchStatus && matchSearch;
  });
  const container = document.getElementById('ordersContainer');
  if (!orders.length) {
    container.innerHTML = '<div class="empty">No orders found.</div>';
    return;
  }
  container.innerHTML = orders.map(o => {
    const date = new Date(o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const itemsText = (o.items || []).map(i => `${i.name} x${i.qty} = ₹${i.price * i.qty}`).join(' | ');
    const badgeClass = `badge-${o.status || 'new'}`;
    return `
      <div class="order-card status-${o.status || 'new'}">
        <div class="order-top">
          <div>
            <div class="order-id">${o.id}</div>
            <div class="order-time">${date}</div>
          </div>
          <div class="order-amount">₹${(o.total || 0).toLocaleString('en-IN')}</div>
        </div>
        <div class="order-customer">
          👤 <strong>${o.customer ? o.customer.name : '—'}</strong> &nbsp;|
          📱 ${o.customer ? o.customer.phone : '—'} &nbsp;|
          📍 ${o.customer ? (o.customer.address || '—') : '—'}
        </div>
        <div class="order-items">🛒 ${itemsText}</div>
        <div class="order-footer">
          <span class="status-badge ${badgeClass}">${o.status || 'new'}</span>
          <span class="payment-badge">${o.paymentMethod || 'cod'}</span>
          <select class="status-select" onchange="updateStatus('${o.id}', this.value)">
            <option value="new" ${o.status==='new'?'selected':''}>New</option>
            <option value="dispatched" ${o.status==='dispatched'?'selected':''}>Dispatched</option>
            <option value="delivered" ${o.status==='delivered'?'selected':''}>Delivered</option>
            <option value="cancelled" ${o.status==='cancelled'?'selected':''}>Cancelled</option>
          </select>
        </div>
      </div>
    `;
  }).join('');
}

async function updateStatus(orderId, status) {
  try {
    const res = await fetch('/api/orders/' + orderId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPass },
      body: JSON.stringify({ status })
    });
    if (!res.ok) { alert('Failed to update status'); return; }
    const idx = allOrders.findIndex(o => o.id === orderId);
    if (idx !== -1) allOrders[idx].status = status;
    renderOrders();
    renderStats();
  } catch (e) {
    alert('Error: ' + e.message);
  }
}
