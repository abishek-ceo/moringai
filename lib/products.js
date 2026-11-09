'use strict';
// Canonical product catalog — single source of truth for pricing/availability.
// Mirrors public/app.js PRODUCTS (kept in sync manually since there is no build step).
// Server code MUST price orders from here, never from client-submitted values.

const PRODUCTS = [
  {
    slug: 'moringa-leaf-powder',
    name: 'Moringa Leaf Powder',
    category: 'powder',
    price: 299,
    oldPrice: 399,
    variants: ['100g', '200g', '500g'],
    inStock: true
  },
  {
    slug: 'moringa-capsules',
    name: 'Moringa Capsules',
    category: 'capsules',
    price: 399,
    oldPrice: 499,
    variants: ['60 caps', '120 caps'],
    inStock: true
  },
  {
    slug: 'moringa-tea-blend',
    name: 'Moringa Tea Blend',
    category: 'tea',
    price: 249,
    oldPrice: 329,
    variants: ['20 bags', '40 bags'],
    inStock: true
  },
  {
    slug: 'moringa-seed-oil',
    name: 'Moringa Seed Oil',
    category: 'oil',
    price: 549,
    oldPrice: 699,
    variants: ['30ml', '60ml', '100ml'],
    inStock: true
  },
  {
    slug: 'moringa-gift-set',
    name: 'Moringa Gift Set',
    category: 'gift',
    price: 799,
    oldPrice: 999,
    variants: ['Standard', 'Premium'],
    inStock: true
  },
  {
    slug: 'raw-moringa-seeds',
    name: 'Raw Moringa Seeds',
    category: 'seeds',
    price: 199,
    oldPrice: 249,
    variants: ['50g', '100g', '250g'],
    inStock: true
  }
];

const BY_NAME = new Map(PRODUCTS.map(p => [p.name, p]));
const BY_SLUG = new Map(PRODUCTS.map(p => [p.slug, p]));

function findByName(name) {
  return BY_NAME.get(name) || null;
}

function findBySlug(slug) {
  return BY_SLUG.get(slug) || null;
}

// Recomputes authoritative line items + totals from the catalog for a cart
// payload the client sent, ignoring any client-supplied price. Throws with a
// customer-facing message if the cart references an unknown product/variant.
function priceCart(items) {
  if (!Array.isArray(items) || !items.length || items.length > 100) {
    throw new Error('Cart cannot be empty');
  }
  const quantities = new Map();
  const priced = items.map(item => {
    const product = findByName(item && item.name);
    if (!product) throw new Error(`Unknown product: ${item && item.name}`);
    if (!product.inStock) throw new Error(`${product.name} is currently out of stock`);
    const variant = item.variant;
    if (!product.variants.includes(variant)) {
      throw new Error(`Invalid variant "${variant}" for ${product.name}`);
    }
    const qty = item.qty;
    if (!Number.isSafeInteger(qty) || qty < 1 || qty > 50) {
      throw new Error(`Invalid quantity for ${product.name}`);
    }
    const key = `${product.slug}:${variant}`;
    const cumulative = (quantities.get(key) || 0) + qty;
    if (cumulative > 50) throw new Error(`Maximum quantity is 50 for ${product.name}`);
    quantities.set(key, cumulative);
    return { name: product.name, variant, qty, price: product.price };
  });
  const FREE_SHIPPING_THRESHOLD = 499;
  const subtotal = priced.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 49;
  return { items: priced, subtotal, shipping, total: subtotal + shipping };
}

module.exports = { PRODUCTS, findByName, findBySlug, priceCart };
