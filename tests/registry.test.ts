import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY_DIR = path.join(ROOT, 'public', 'r');
const CLI = path.join(ROOT, 'bin', 'ryukami-ui.mjs');

const readPayload = (name) =>
  JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, `${name}.json`), 'utf-8'));

const master = readPayload('registry');
const payloads = new Map(master.items.map((item) => [item.name, readPayload(item.name)]));

function transitiveFiles(name) {
  const collected = new Set();
  const visited = new Set();
  const queue = [name];
  while (queue.length) {
    const current = queue.pop();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    const payload = payloads.get(current);
    if (!payload) continue;
    for (const file of payload.files) collected.add(file.path);
    queue.push(...(payload.registryDependencies ?? []));
  }
  return collected;
}

function resolveLocalImport(fromPath, spec) {
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(fromPath), spec));
  return [base, `${base}.ts`, `${base}.astro`, `${base}.js`];
}

describe('[REG-01] El registro se puede instalar sin dejar imports rotos', () => {
  test('toda dependencia declarada existe en el catálogo', () => {
    for (const item of master.items) {
      for (const dep of item.registryDependencies ?? []) {
        assert.ok(payloads.has(dep), `${item.name} depende de "${dep}", que no está publicado`);
      }
    }
  });

  test('icon.json existe: popover, alert, theme-studio y otros lo requieren', () => {
    assert.ok(payloads.has('icon'), 'La primitiva icon no está publicada');
    assert.ok(fs.existsSync(path.join(REGISTRY_DIR, 'icon.json')));
  });

  test('ningún payload importa un archivo fuera de su cierre de dependencias', () => {
    for (const [name, payload] of payloads) {
      const allowed = transitiveFiles(name);
      for (const file of payload.files) {
        for (const [, spec] of file.content.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
          const candidates = resolveLocalImport(file.path, spec);
          assert.ok(
            candidates.some((candidate) => allowed.has(candidate)),
            `${name} (${file.path}) importa "${spec}" y ese archivo no se instala`
          );
        }
      }
    }
  });

  test('cada archivo del payload declara sha256 válido y coincide con su contenido', () => {
    for (const [name, payload] of payloads) {
      for (const file of payload.files) {
        assert.match(file.sha256 ?? '', /^[a-f0-9]{64}$/i, `${name}: sha256 inválido en ${file.path}`);
        const computed = crypto.createHash('sha256').update(file.content, 'utf-8').digest('hex');
        assert.equal(computed, file.sha256, `${name}: hash no coincide en ${file.path}`);
      }
    }
  });

  test('el índice maestro reporta el catálogo visible y oculta solo primitivas internas', () => {
    const visible = master.items.filter((item) => !item.hidden);
    assert.equal(master.totalItems, visible.length);
    assert.equal(visible.length, 35);
    assert.deepEqual(
      master.items.filter((item) => item.hidden).map((item) => item.name),
      ['icon']
    );
  });
});

describe('[REG-02] Instalación end-to-end del catálogo completo', () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'ryukami-e2e-'));

  after(() => {
    fs.rmSync(workspace, { recursive: true, force: true });
  });

  test('ryukami-ui add --all instala todos los módulos y sus dependencias', () => {
    const projectDir = path.join(workspace, 'proyecto');
    execFileSync(process.execPath, [CLI, 'add', '--all', '--dir', projectDir], {
      cwd: ROOT,
      stdio: 'pipe',
    });

    for (const item of master.items) {
      assert.ok(
        fs.existsSync(path.join(projectDir, item.target)),
        `No se instaló ${item.name} (${item.target})`
      );
    }

    // Ninguna importación relativa puede quedar colgando tras la instalación.
    const stack = [projectDir];
    while (stack.length) {
      const current = stack.pop();
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const abs = path.join(current, entry.name);
        if (entry.isDirectory()) {
          stack.push(abs);
        } else if (/\.(astro|ts)$/.test(entry.name)) {
          const rel = path.relative(projectDir, abs).split(path.sep).join('/');
          const content = fs.readFileSync(abs, 'utf-8');
          for (const [, spec] of content.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
            const candidates = resolveLocalImport(rel, spec).map((candidate) =>
              path.join(projectDir, candidate)
            );
            assert.ok(
              candidates.some((candidate) => fs.existsSync(candidate)),
              `${rel} importa "${spec}" y el archivo no existe en el proyecto instalado`
            );
          }
        }
      }
    }
  });
});
