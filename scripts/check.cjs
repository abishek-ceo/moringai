'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const files = ['server.js'];
function visit(dir) { for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
 const name = path.join(dir, entry.name);
 if (entry.isDirectory()) visit(name);
 else if (/\.(js|cjs)$/.test(name)) files.push(name);
} }
for (const dir of ['api','lib','site/public','scripts','tests']) visit(dir);
for (const file of files) { const r=spawnSync(process.execPath,['--check',path.join(root,file)],{stdio:'inherit'}); if(r.status) process.exit(r.status); }
console.log(`Syntax checks passed for ${files.length} JavaScript files.`);
