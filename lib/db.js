'use strict';
// Supabase database via PostgREST (no SDK needed — uses built-in fetch)

function getConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel environment variables.');
  return { url, key };
}

function dbHeaders(cfg) {
  return {
    'apikey': cfg.key,
    'Authorization': `Bearer ${cfg.key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
}

async function dbFetch(path, opts = {}, queryParams = '') {
  const cfg = getConfig();
  const url = `${cfg.url}/rest/v1${path}${queryParams ? '?' + queryParams : ''}`;
  const res = await fetch(url, { ...opts, headers: { ...dbHeaders(cfg), ...(opts.headers || {}) } });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : (opts.method === 'DELETE' ? null : []); }
  catch { data = text; }
  if (!res.ok) {
    const msg = (typeof data === 'object' && data?.message) || (typeof data === 'object' && data?.error) || text || `DB error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

async function createOrder(order) {
  const data = await dbFetch('/orders', { method: 'POST', body: JSON.stringify(order) });
  return Array.isArray(data) ? data[0] : data;
}

async function getOrders({ status, search, limit = 100, offset = 0 } = {}) {
  const params = new URLSearchParams({ order: 'created_at.desc', limit: String(Math.min(limit, 500)), offset: String(offset) });
  if (status) params.set('status', `eq.${status}`);
  if (search) params.set('or', `(id.ilike.*${search}*,customer->>name.ilike.*${search}*,customer->>phone.ilike.*${search}*)`);
  return dbFetch('/orders', {}, params.toString());
}

async function getOrderById(id) {
  const data = await dbFetch('/orders', {}, `id=eq.${encodeURIComponent(id)}&limit=1`);
  if (!Array.isArray(data) || !data.length) throw new Error('Order not found');
  return data[0];
}

async function updateOrder(id, updates) {
  const data = await dbFetch(`/orders?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() })
  });
  return Array.isArray(data) ? data[0] : data;
}

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [all, todayRows] = await Promise.all([
    dbFetch('/orders', {}, 'select=total,status'),
    dbFetch('/orders', {}, `created_at=gte.${today.toISOString()}&select=id`)
  ]);
  const active = all.filter(o => o.status !== 'cancelled');
  const revenue = active.reduce((s, o) => s + (o.total || 0), 0);
  const counts = {};
  all.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
  return {
    total: all.length,
    revenue,
    today: todayRows.length,
    avg: active.length ? Math.round(revenue / active.length) : 0,
    ...counts
  };
}

module.exports = { createOrder, getOrders, getOrderById, updateOrder, getStats };
