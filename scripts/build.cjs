'use strict';
// Whitelist the static deployment output: backend code and private configuration
// stay outside the public directory. Vercel packages root /api functions separately.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const name of ['index.html', '404.html', 'robots.txt', 'sitemap.xml']) {
  fs.copyFileSync(path.join(root, name), path.join(out, name));
}
fs.cpSync(path.join(root, 'public'), path.join(out, 'public'), { recursive: true });

// Content-hash the render-critical CSS/JS so they can be cached for a year
// (vercel.json serves any ?v= request as immutable); a change = new URL.
const VERSIONED = ['site.css', 'app.js', 'i18n.js', 'effects.js', 'checkout.js'];
const hashes = Object.fromEntries(VERSIONED.map(name => [
  name,
  crypto.createHash('sha256').update(fs.readFileSync(path.join(out, 'public', name))).digest('hex').slice(0, 10)
]));
const pattern = new RegExp('((?:/)?public/(?:' + VERSIONED.map(n => n.replace('.', '\\.')).join('|') + '))(?=["\'])', 'g');
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html') && entry.name !== 'admin.html') {
      const html = fs.readFileSync(full, 'utf8');
      const next = html.replace(pattern, (m, p1) => p1 + '?v=' + hashes[path.basename(p1)]);
      if (next !== html) fs.writeFileSync(full, next);
    }
  }
}
walk(out);
console.log('Built static site in dist/; API and backend files excluded. Asset versions:', JSON.stringify(hashes));
