import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLI = path.join(ROOT, 'bin', 'ryukami-ui.mjs');
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));

function runCli(args: string[], options: { input?: string; cwd?: string } = {}) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd: options.cwd ?? ROOT,
    input: options.input,
    encoding: 'utf-8',
    timeout: 20_000,
    maxBuffer: 16 * 1024 * 1024,
  });
}

describe('[CLI-01] Superficie de comandos y códigos de salida', () => {
  test('--version imprime la versión de package.json y sale con 0', () => {
    const res = runCli(['--version']);
    assert.equal(res.status, 0);
    assert.equal(res.stdout.trim(), PKG.version);
  });

  test('una opción desconocida es un error de uso (exit 2)', () => {
    const res = runCli(['--definitely-not-a-flag']);
    assert.equal(res.status, 2);
    assert.match(res.stderr, /Opción desconocida/);
  });

  test('--dir sin valor es un error de uso, nunca instala en el cwd', () => {
    const res = runCli(['add', 'button', '--dir']);
    assert.equal(res.status, 2);
    assert.match(res.stderr, /requiere un valor/);
  });

  test('el registro remoto debe ser HTTPS', () => {
    const res = runCli(['list', '--registry', 'http://example.com']);
    assert.equal(res.status, 2);
    assert.match(res.stderr, /debe usar HTTPS/);
  });

  test('un nombre de componente con traversal se rechaza en info', () => {
    const res = runCli(['info', '../../package']);
    assert.equal(res.status, 2);
    assert.match(res.stderr, /Nombre de componente inválido/);
  });
});

describe('[CLI-02] diff como gate de integridad', () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'ryukami-cli-'));

  after(() => fs.rmSync(workspace, { recursive: true, force: true }));

  test('diff falla (exit 1) cuando faltan componentes', () => {
    const empty = path.join(workspace, 'vacio');
    fs.mkdirSync(empty, { recursive: true });
    const res = runCli(['diff', '--dir', empty]);
    assert.equal(res.status, 1);
  });

  test('diff pasa (exit 0) y reporta sincronizados tras instalar todo', () => {
    const project = path.join(workspace, 'proyecto');
    const install = runCli(['add', '--all', '--dir', project]);
    assert.equal(install.status, 0);

    const res = runCli(['diff', '--dir', project, '--json']);
    assert.equal(res.status, 0);
    const report = JSON.parse(res.stdout);
    assert.equal(report.synced, 35);
    assert.equal(report.missing, 0);
    assert.equal(report.modified, 0);
  });

  test('diff detecta un archivo manipulado y sale con 1', () => {
    const project = path.join(workspace, 'manipulado');
    runCli(['add', 'button', '--dir', project]);
    fs.appendFileSync(path.join(project, 'src', 'components', 'Button.astro'), '\n<!-- tampered -->\n');

    const res = runCli(['diff', '--dir', project, '--json']);
    assert.equal(res.status, 1);
    const report = JSON.parse(res.stdout);
    assert.equal(report.modified, 1);
  });
});
