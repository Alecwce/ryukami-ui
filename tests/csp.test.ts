import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { collectInlineScriptHashes } from '../scripts/build-csp.ts';

const sha = (text: string) => `sha256-${crypto.createHash('sha256').update(text, 'utf-8').digest('base64')}`;

describe('[CSP] Generación de hashes para scripts inline', () => {
  test('hashea el contenido exacto de un script inline', () => {
    const code = "(function(){document.documentElement.dataset.x='1';})();";
    const hashes = [...collectInlineScriptHashes(`<script is:inline>${code}</script>`)];
    assert.deepEqual(hashes, [sha(code)]);
  });

  test('ignora scripts con src y bloques de datos JSON-LD', () => {
    const html = [
      '<script src="/_astro/app.js"></script>',
      '<script type="application/ld+json">{"@type":"Thing"}</script>',
      '<script type="application/json">{"a":1}</script>',
    ].join('');
    assert.equal(collectInlineScriptHashes(html).size, 0);
  });

  test('deduplica scripts idénticos', () => {
    const html = '<script>var a=1;</script><script>var a=1;</script><script>var b=2;</script>';
    assert.equal(collectInlineScriptHashes(html).size, 2);
  });

  test('respeta entidades y saltos de línea tal cual los sirve el navegador', () => {
    const code = 'if (a < b && c > d) {\n  go("x");\n}';
    const hashes = [...collectInlineScriptHashes(`<script is:inline>\n${code}\n</script>`)];
    assert.deepEqual(hashes, [sha(`\n${code}\n`)]);
  });

  test('ignora scripts vacíos', () => {
    assert.equal(collectInlineScriptHashes('<script>   </script>').size, 0);
  });
});
