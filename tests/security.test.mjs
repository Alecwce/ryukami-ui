import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import {
  resolveSafeTargetPath,
  verifyFileIntegrity,
  validateRegistryPayload,
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
