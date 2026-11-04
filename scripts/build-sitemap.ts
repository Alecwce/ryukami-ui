#!/usr/bin/env node
/**
 * Ryukami-UI // Generador de sitemap (post-build)
 *
 * Recorre `dist/` y publica una URL por página real, con barra final (igual que
 * el canonical) y sin el 404. Evita que el sitemap se desincronice al añadir
 * componentes o páginas nuevas.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SITE = 'https://ryukami-ui.pages.dev';

function collectPages(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) collectPages(abs, acc);
    else if (entry.name === 'index.html') acc.push(path.dirname(abs));
  }
  return acc;
}

if (!fs.existsSync(DIST_DIR)) {
  console.error('[SITEMAP] No existe dist/. Ejecuta `astro build` antes.');
  process.exitCode = 1;
} else {
  const pages = collectPages(DIST_DIR)
    .map((dir) => path.relative(DIST_DIR, dir).split(path.sep).join('/'))
    .filter((rel) => rel !== '.' && rel !== '404')
    .map((rel) => (rel === '' ? '/' : `/${rel}/`))
    .sort();

  const urls = pages
    .map((route) => `  <url>\n    <loc>${SITE}${route}</loc>\n  </url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml, 'utf-8');
  console.log(`[SITEMAP] ${pages.length} URLs generadas en dist/sitemap.xml`);
}
