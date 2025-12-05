const fs = require("fs");
const path = require("path");
const locales = ["en","ru","fr","de","es","pt"];
const data = {};
for (const code of locales) {
  const text = fs.readFileSync(path.join('features/i18n/locales', code + '.ts'), 'utf8');
  const matchKeys = [...text.matchAll(/^\s*([a-zA-Z0-9_]+):/gm)].map(m => m[1]);
  data[code] = new Set(matchKeys);
}
const base = 'en';
for (const code of locales) {
  const missing = [...data[base]].filter(k => !data[code].has(k));
  const extra = [...data[code]].filter(k => !data[base].has(k));
  console.log(`\n=== ${code} ===`);
  console.log(`Keys: ${data[code].size}`);
  console.log(`Missing vs ${base}: ${missing.length}`);
  if (missing.length) console.log('  missing:', missing.join(', '));
  if (extra.length) console.log(`Extra vs ${base}: ${extra.length} -> ${extra.join(', ')}`);
}
