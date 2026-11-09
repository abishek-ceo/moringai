'use strict';
// Whitelist the static deployment output: backend code and private configuration
// stay outside the public directory. Vercel packages root /api functions separately.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const name of ['index.html', '404.html', 'robots.txt', 'sitemap.xml']) {
  fs.copyFileSync(path.join(root, name), path.join(out, name));
}
fs.cpSync(path.join(root, 'public'), path.join(out, 'public'), { recursive: true });
console.log('Built static site in dist/; API and backend files excluded.');
