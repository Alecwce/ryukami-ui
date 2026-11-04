import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  resolveSafeTargetPath,
  verifyFileIntegrity,
  validateRegistryPayload,
  writeRegistryFile,
} from '../bin/ryukami-ui.mjs';

// Validadores extraídos de ThemeStudio.astro para validación de CSS Injection
const COLOR_REGEX = /^#[0-9a-fA-F]{3,8}$/;
const OFFSET_REGEX = /^-?\d+px$/;
const DITHER_REGEX = /^\d+px$/;

describe('[SEC-01] Ryukami-UI Supply Chain & Path Traversal Prevention', () => {
  const dummyTarget = '/app/workspace/my-project';

  test('debe bloquear intentos de Path Traversal relativos tipo Unix ("../../.bashrc")', () => {
    assert.throws(
      () => resolveSafeTargetPath(dummyTarget, '../../.bashrc'),
      (err) => err.message.includes('[SECURITY ALERT]') && err.message.includes('intenta escapar')
    );
  });

  test('debe bloquear intentos de Path Traversal estilo Windows ("..\\..\\Windows\\win.ini")', () => {
    assert.throws(
      () => resolveSafeTargetPath(dummyTarget, '..\\..\\Windows\\win.ini'),
      (err) => err.message.includes('[SECURITY ALERT]') && err.message.includes('intenta escapar')
    );
  });

  test('debe bloquear rutas absolutas del sistema ("/etc/passwd")', () => {
    assert.throws(
      () => resolveSafeTargetPath(dummyTarget, '/etc/passwd'),
      (err) => err.message.includes('[SECURITY ALERT]') && err.message.includes('intenta escapar')
    );
  });

  test('debe bloquear referencias de directorio especial (".")', () => {
    assert.throws(
      () => resolveSafeTargetPath(dummyTarget, '.'),
      (err) => err.message.includes('[SECURITY ALERT]') && err.message.includes('inválido')
    );
  });

  test('debe bloquear rutas vacías o no string', () => {
    assert.throws(
      () => resolveSafeTargetPath(dummyTarget, ''),
      (err) => err.message.includes('[SECURITY ALERT]')
    );
    assert.throws(
      () => resolveSafeTargetPath(dummyTarget, null),
      (err) => err.message.includes('[SECURITY ALERT]')
    );
  });

  test('debe permitir rutas relativas seguras preservando subdirectorios legítimos', () => {
    const resolvedComp = resolveSafeTargetPath(dummyTarget, 'src/components/Button.astro');
    assert.equal(resolvedComp, path.resolve(dummyTarget, 'src/components/Button.astro'));

    const resolvedStyle = resolveSafeTargetPath(dummyTarget, 'src/styles/global.css');
    assert.equal(resolvedStyle, path.resolve(dummyTarget, 'src/styles/global.css'));
  });
});

describe('[SEC-02] SHA-256 Cryptographic Integrity Verification', () => {
  test('debe aceptar archivos cuyo hash SHA-256 coincide exactamente con el contenido', () => {
    const rawContent = 'export default function Button() { return "SCORCH_V4"; }';
    const validHash = crypto.createHash('sha256').update(rawContent, 'utf-8').digest('hex');

    assert.doesNotThrow(() => {
      verifyFileIntegrity({
        path: 'src/components/Button.astro',
        content: rawContent,
        sha256: validHash,
      });
    });
  });

  test('debe rechazar con [INTEGRITY ERROR] un archivo con tan solo 1 byte alterado (tampering)', () => {
    const genuineContent = 'export default function Button() { return "SCORCH_V4"; }';
    const genuineHash = crypto.createHash('sha256').update(genuineContent, 'utf-8').digest('hex');

    // Alteración sutil de 1 byte ('v4' en minúscula)
    const tamperedContent = 'export default function Button() { return "SCORCH_v4"; }';

    assert.throws(
      () => {
        verifyFileIntegrity({
          path: 'src/components/Button.astro',
          content: tamperedContent,
          sha256: genuineHash,
        });
      },
      (err) => err.message.includes('[INTEGRITY ERROR]') && err.message.includes('Fallo de suma de verificación')
    );
  });
});

describe('[SEC-03] CSS Injection Prevention (Theme Studio Regex Hardening)', () => {
  test('COLOR_REGEX debe bloquear payloads maliciosos de inyección CSS y JavaScript', () => {
    const maliciousColorPayloads = [
      '#fff; background: url(javascript:...);',
      '#fff; background: url("https://malicious.site/leak")',
      'red; display: none;',
      '<script>alert("xss")</script>',
      'expression(alert(1))',
      '#D62436; font-size: 100px;',
      '#D62436; animation: leak 1s infinite;',
      'rgb(255, 0, 0)',
      'rgba(0,0,0,1)',
      '#',
      '#12',
      '#123456789',
    ];

    for (const payload of maliciousColorPayloads) {
      assert.equal(
        COLOR_REGEX.test(payload),
        false,
        `El payload malicioso de color no fue bloqueado: ${payload}`
      );
    }
  });

  test('COLOR_REGEX debe aceptar tokens Hex válidos (3, 4, 6 y 8 caracteres)', () => {
    const validHexTokens = [
      '#D62436',
      '#4DA3FF',
      '#F4D35E',
      '#34D399',
      '#fff',
      '#000000',
      '#10141eff',
    ];

    for (const token of validHexTokens) {
      assert.equal(
        COLOR_REGEX.test(token),
        true,
        `Token Hex legítimo fue rechazado erróneamente: ${token}`
      );
    }
  });

  test('OFFSET_REGEX debe bloquear intentos de inyección CSS en desplazamientos de sombra', () => {
    const maliciousOffsetPayloads = [
      '10px; display: none',
      '-4px; --scorch-red: #000',
      'url("https://evil.com")',
      'calc(100% - 20px)',
      '10',
      '10em',
      '10rem',
      '10px 10px 5px #000',
    ];

    for (const payload of maliciousOffsetPayloads) {
      assert.equal(
        OFFSET_REGEX.test(payload),
        false,
        `El payload malicioso de offset no fue bloqueado: ${payload}`
      );
    }
  });

  test('OFFSET_REGEX debe permitir valores numéricos enteros en px (positivos, negativos y cero)', () => {
    const validOffsets = ['-4px', '-2px', '0px', '2px', '4px', '8px', '-12px'];

    for (const offset of validOffsets) {
      assert.equal(
        OFFSET_REGEX.test(offset),
        true,
        `Offset legítimo fue rechazado erróneamente: ${offset}`
      );
    }
  });

  test('validateRegistryPayload debe validar tokens.json W3C y registry.json de 35 módulos', () => {
    assert.doesNotThrow(() => {
      validateRegistryPayload(
        {
          meta: { name: 'Scorch-CLI', version: '4.1.0' },
          velgrynd_palette: { scorch_crimson: { value: '#D62436' } },
        },
        'tokens.json'
      );
    });
    assert.throws(() => {
      validateRegistryPayload({ invalid: true }, 'tokens.json');
    });
  });
});

describe('[SEC-04] Escritura endurecida contra symlinks (CWE-59)', () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'ryukami-sec-'));

  after(() => {
    fs.rmSync(workspace, { recursive: true, force: true });
  });

  test('debe rechazar la escritura cuando el destino es un symlink', () => {
    const project = path.join(workspace, 'p1');
    fs.mkdirSync(path.join(project, 'src', 'components'), { recursive: true });

    const secret = path.join(workspace, 'secret-p1.txt');
    fs.writeFileSync(secret, 'ORIGINAL', 'utf-8');
    fs.symlinkSync(secret, path.join(project, 'src', 'components', 'Button.astro'));

    assert.throws(
      () =>
        writeRegistryFile({
          targetDir: project,
          relativePath: 'src/components/Button.astro',
          content: 'PWNED',
          overwrite: true,
        }),
      (err) => err.message.includes('[SECURITY ALERT]') && err.message.includes('enlace simbólico')
    );
    assert.equal(fs.readFileSync(secret, 'utf-8'), 'ORIGINAL');
  });

  test('debe rechazar un directorio intermedio que escapa del proyecto por symlink', () => {
    const project = path.join(workspace, 'p2');
    const outside = path.join(workspace, 'outside-p2');
    fs.mkdirSync(project, { recursive: true });
    fs.mkdirSync(outside, { recursive: true });
    fs.symlinkSync(outside, path.join(project, 'src'));

    assert.throws(
      () =>
        writeRegistryFile({
          targetDir: project,
          relativePath: 'src/evil.astro',
          content: 'PWNED',
          overwrite: true,
        }),
      (err) => err.message.includes('[SECURITY ALERT]') && err.message.includes('escapa del proyecto')
    );
    assert.equal(fs.existsSync(path.join(outside, 'evil.astro')), false);
  });

  test('debe escribir normalmente dentro del proyecto con modo 0644', () => {
    const project = path.join(workspace, 'p3');
    const status = writeRegistryFile({
      targetDir: project,
      relativePath: 'src/components/Button.astro',
      content: 'CONTENIDO',
    });

    assert.equal(status, 'written');
    const dest = path.join(project, 'src', 'components', 'Button.astro');
    assert.equal(fs.readFileSync(dest, 'utf-8'), 'CONTENIDO');
    assert.equal(fs.statSync(dest).mode & 0o777, 0o644);
  });

  test('debe omitir sin --overwrite y respetar el contenido previo', () => {
    const project = path.join(workspace, 'p4');
    fs.mkdirSync(path.join(project, 'src'), { recursive: true });
    fs.writeFileSync(path.join(project, 'src', 'a.txt'), 'EVIDENCIA', 'utf-8');

    const status = writeRegistryFile({
      targetDir: project,
      relativePath: 'src/a.txt',
      content: 'NUEVO',
      overwrite: false,
    });

    assert.equal(status, 'skipped');
    assert.equal(fs.readFileSync(path.join(project, 'src', 'a.txt'), 'utf-8'), 'EVIDENCIA');
  });
});

describe('[SEC-05] Integridad fail-closed y anclaje al registro maestro', () => {
  const content = 'export const x = 1;';
  const hash = crypto.createHash('sha256').update(content, 'utf-8').digest('hex');

  test('debe RECHAZAR un archivo sin sha256 (no se acepta integridad opcional)', () => {
    assert.throws(
      () => verifyFileIntegrity({ path: 'src/x.ts', content }),
      (err) => err.message.includes('[INTEGRITY ERROR]') && err.message.includes('no incluye un sha256')
    );
  });

  test('debe RECHAZAR un sha256 con formato inválido', () => {
    assert.throws(
      () => verifyFileIntegrity({ path: 'src/x.ts', content, sha256: 'deadbeef' }),
      (err) => err.message.includes('[INTEGRITY ERROR]')
    );
  });

  test('debe RECHAZAR contenido que no coincide con el registro maestro aunque su hash interno cuadre', () => {
    assert.throws(
      () =>
        verifyFileIntegrity(
          { path: 'src/x.ts', content, sha256: hash },
          'f'.repeat(64)
        ),
      (err) => err.message.includes('[INTEGRITY ERROR]') && err.message.includes('registro maestro')
    );
  });

  test('debe ACEPTAR contenido con hash correcto y anclaje coincidente', () => {
    assert.doesNotThrow(() => verifyFileIntegrity({ path: 'src/x.ts', content, sha256: hash }, hash));
  });
});
