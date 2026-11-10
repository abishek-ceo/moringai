'use strict';
// Injects the server-rendered product grid into site/index.html and site/public/shop.html
// by running the real renderProducts() from site/public/app.js against a stub DOM,
// so the static markup always matches what the browser renders.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const grid = { innerHTML: '' };
const noop = () => {};
const el = () => ({ appendChild: noop, addEventListener: noop, classList: { add: noop, remove: noop, toggle: noop }, style: {} });
const sandbox = {
  window: { addEventListener: noop, location: { hash: '' } },
  document: {
    createElement: el, head: el(), body: el(), addEventListener: noop,
    getElementById: id => (id === 'productsGrid' ? grid : null),
    querySelector: () => null, querySelectorAll: () => []
  },
  localStorage: { getItem: () => null, setItem: noop },
  setTimeout: noop, clearTimeout: noop
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'site/public/app.js'), 'utf8'), sandbox);
vm.runInContext('renderProducts()', sandbox);
if (!grid.innerHTML.includes('/products/')) throw new Error('prerender produced no product links');
const re = /(<div class="products-grid" id="productsGrid">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>)/;
for (const f of ['site/index.html', 'site/public/shop.html']) {
  const p = path.join(root, f);
  const html = fs.readFileSync(p, 'utf8');
  if (!re.test(html)) throw new Error('productsGrid not found in ' + f);
  fs.writeFileSync(p, html.replace(re, (_, a, b) => a + grid.innerHTML + b));
  console.log('prerendered', f);
}
