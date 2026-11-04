#!/usr/bin/env node
/**
 * Ryukami-UI // Generador de CSP (post-build)
 *
 * Recorre el HTML compilado, calcula el sha256 de cada `<script>` inline y
 * reescribe `dist/_headers` con una Content-Security-Policy que los autoriza
 * por hash. Así la política puede aplicarse en modo bloqueo sin `unsafe-inline`
 * para scripts.
 *
 * Requisitos que el sitio ya cumple:
 *  - cero manejadores inline (`onclick`, `onchange`, `onsubmit`) → regla DS-10
 *  - cero `eval` / `new Function` / URLs `javascript:`
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const HEADERS_SOURCE = path.join(ROOT_DIR, 'public', '_headers');
const HEADERS_TARGET = path.join(DIST_DIR, '_headers');

const INLINE_SCRIPT = /<script([^>]*)>([\s\S]*?)<\/script>/g;
const NON_JS_TYPES = /type\s*=\s*["'](?:application\/(?:ld\+json|json)|text\/(?:template|plain))["']/i;

export function collectInlineScriptHashes(html) {
  const hashes = new Set();
  for (const match of html.matchAll(INLINE_SCRIPT)) {
    const attrs = match[1] ?? '';
    const content = match[2] ?? '';
    if (/\ssrc\s*=/.test(attrs)) continue;
    if (NON_JS_TYPES.test(attrs)) continue;
    if (content.trim() === '') continue;
    const digest = crypto.createHash('sha256').update(content, 'utf-8').digest('base64');
    hashes.add(`sha256-${digest}`);
  }
  return hashes;
}

function listHtmlFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) listHtmlFiles(abs, acc);
    else if (entry.name.endsWith('.html')) acc.push(abs);
  }
  return acc;
}

function buildPolicy(hashes) {
  // En CSP los hashes deben ir entre comillas simples: 'sha256-…'
  const scriptHashes = [...hashes].sort().map((hash) => `'${hash}'`).join(' ');
  return [
    "default-src 'self'",
    `script-src 'self' ${scriptHashes}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

export function buildCsp() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('[CSP] No existe dist/. Ejecuta `astro build` antes.');
    return 1;
  }
  const pages = listHtmlFiles(DIST_DIR);
  const hashes = new Set();
  for (const page of pages) {
    for (const hash of collectInlineScriptHashes(fs.readFileSync(page, 'utf-8'))) hashes.add(hash);
  }

  const template = fs.readFileSync(HEADERS_SOURCE, 'utf-8');
  const policy = buildPolicy(hashes);

  const withoutReport = template
    .split('\n')
    .filter((line) => !/^\s*Content-Security-Policy(-Report-Only)?:/i.test(line))
    .join('\n');

  // La política se inyecta justo después del bloque global (`/*`).
  const lines = withoutReport.split('\n');
  const globalIndex = lines.findIndex((line) => line.trim() === '/*');
  const insertAt = globalIndex === -1 ? 0 : globalIndex + 1;
  lines.splice(insertAt, 0, `  Content-Security-Policy: ${policy}`);

  fs.writeFileSync(HEADERS_TARGET, lines.join('\n'), 'utf-8');

  // Verificación: todo script inline del build debe estar cubierto.
  const missing = [];
  for (const page of pages) {
    const html = fs.readFileSync(page, 'utf-8');
    for (const hash of collectInlineScriptHashes(html)) {
      if (!policy.includes(hash)) missing.push(`${path.relative(DIST_DIR, page)} → ${hash.slice(0, 20)}…`);
    }
    // Los ejemplos de código viven escapados dentro de <pre>; se excluyen.
    const executableHtml = html.replace(/<pre[\s\S]*?<\/pre>/gi, '').replace(/<code[\s\S]*?<\/code>/gi, '');
    // Solo cuentan los atributos reales (`onclick="…"`); los ejemplos escapados
    // (`onclick=&quot;…`) y el JSX (`onClick={…}`) no son atributos HTML.
    if (/\son(?:click|change|submit|input|keydown|load)\s*=\s*["']/i.test(executableHtml)) {
      missing.push(`${path.relative(DIST_DIR, page)} → manejador inline presente`);
    }
  }

  if (missing.length > 0) {
    console.error('[CSP] Scripts sin cubrir:');
    for (const item of missing) console.error(`  - ${item}`);
    return 1;
  }

  console.log(
    `[CSP] ${hashes.size} hashes sha256 · ${pages.length} páginas · política en dist/_headers (modo bloqueo)`
  );
  return 0;
}

const isDirectRun = () => {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
};

if (isDirectRun()) {
  process.exitCode = buildCsp();
}
