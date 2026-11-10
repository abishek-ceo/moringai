'use strict';
// Content-hash the render-critical CSS/JS references in the committed site/ pages
// so they can be cached for a year (vercel.json serves any ?v= URL as immutable).
// Run after editing site.css or any of the scripts; it is idempotent.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const site = path.resolve(__dirname, '..', 'site');
const VERSIONED = ['site.css', 'app.js', 'i18n.js', 'effects.js', 'checkout.js'];
const hashes = Object.fromEntries(VERSIONED.map(name => [
  name,
  crypto.createHash('sha256').update(fs.readFileSync(path.join(site, 'public', name))).digest('hex').slice(0, 10)
]));
const pattern = new RegExp('((?:/)?public/(?:' + VERSIONED.map(n => n.replace('.', '\\.')).join('|') + '))(\\?v=[a-f0-9]+)?(?=["\'])', 'g');
let changed = 0;
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html') && entry.name !== 'admin.html') {
      const html = fs.readFileSync(full, 'utf8');
      const next = html.replace(pattern, (m, p1) => p1 + '?v=' + hashes[path.basename(p1)]);
      if (next !== html) { fs.writeFileSync(full, next); changed++; }
    }
  }
})(site);
console.log('Stamped asset versions in', changed, 'page(s):', JSON.stringify(hashes));
