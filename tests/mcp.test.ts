import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLI = path.join(ROOT, 'bin', 'ryukami-ui.mjs');

/** Envía líneas JSON-RPC al servidor MCP y devuelve las respuestas parseadas. */
function runMcp(lines: string[]) {
  const res = spawnSync(process.execPath, [CLI, 'mcp'], {
    cwd: ROOT,
    input: lines.join('\n') + '\n',
    encoding: 'utf-8',
    timeout: 20_000,
    maxBuffer: 16 * 1024 * 1024,
  });

  assert.equal(res.status, 0, `El servidor MCP terminó con error: ${res.stderr}`);

  return res.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .flat();
}

const request = (id: number, method: string, params?: unknown) =>
  JSON.stringify({ jsonrpc: '2.0', id, method, ...(params ? { params } : {}) });

describe('[MCP-01] Cumplimiento JSON-RPC 2.0', () => {
  test('initialize negocia protocolo y declara el servidor', () => {
    const [response] = runMcp([request(1, 'initialize')]);
    assert.equal(response.id, 1);
    assert.equal(response.result.serverInfo.name, 'ryukami-ui-mcp');
    assert.ok(response.result.capabilities.tools);
  });

  test('tools/list expone las tres herramientas', () => {
    const [response] = runMcp([request(1, 'tools/list')]);
    const names = response.result.tools.map((tool: { name: string }) => tool.name);
    assert.deepEqual(names.sort(), ['get_component', 'get_design_tokens', 'list_components']);
  });

  test('un método desconocido devuelve -32601', () => {
    const [response] = runMcp([request(7, 'bogus/method')]);
    assert.equal(response.error.code, -32601);
  });

  test('un JSON inválido devuelve -32700 con id null', () => {
    const [response] = runMcp(['esto no es json']);
    assert.equal(response.id, null);
    assert.equal(response.error.code, -32700);
  });

  test('un batch procesa cada mensaje por separado', () => {
    const responses = runMcp([
      JSON.stringify([
        { jsonrpc: '2.0', id: 10, method: 'ping' },
        { jsonrpc: '2.0', id: 11, method: 'nope' },
      ]),
    ]);
    assert.equal(responses.length, 2);
    assert.deepEqual(
      responses.map((r) => r.id),
      [10, 11]
    );
    assert.equal(responses[1].error.code, -32601);
  });

  test('una notificación no recibe respuesta', () => {
    const responses = runMcp([
      JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
      request(12, 'ping'),
    ]);
    assert.equal(responses.length, 1);
    assert.equal(responses[0].id, 12);
  });

  test('un mensaje mayor a 1 MiB se rechaza sin agotar memoria', () => {
    const huge = 'x'.repeat(1024 * 1024 + 32);
    const [response] = runMcp([huge]);
    assert.equal(response.error.code, -32600);
  });
});

describe('[MCP-02] Validación de herramientas', () => {
  test('get_component rechaza traversal en el nombre (-32602)', () => {
    const [response] = runMcp([
      request(20, 'tools/call', { name: 'get_component', arguments: { name: '../../package' } }),
    ]);
    assert.equal(response.error.code, -32602);
    assert.match(response.error.message, /Nombre de componente inválido/);
  });

  test('get_component rechaza un componente inexistente (-32602)', () => {
    const [response] = runMcp([
      request(21, 'tools/call', { name: 'get_component', arguments: { name: 'no-existe' } }),
    ]);
    assert.equal(response.error.code, -32602);
  });

  test('get_component devuelve el código y su sha256', () => {
    const [response] = runMcp([
      request(22, 'tools/call', { name: 'get_component', arguments: { name: 'button' } }),
    ]);
    const payload = JSON.parse(response.result.content[0].text);
    assert.equal(payload.name, 'button');
    assert.match(payload.files[0].sha256, /^[a-f0-9]{64}$/);
    assert.match(payload.files[0].content, /interface CommonProps/);
  });

  test('list_components devuelve 35 módulos visibles', () => {
    const [response] = runMcp([request(23, 'tools/call', { name: 'list_components' })]);
    const master = JSON.parse(response.result.content[0].text);
    assert.equal(master.totalItems, 35);
    assert.equal(master.items.filter((i: { hidden?: boolean }) => !i.hidden).length, 35);
  });
});
