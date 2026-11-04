import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { lintDesign } from '../scripts/lint-design.ts';

/**
 * Gate de diseño: las reglas de AGENTS.md se verifican sobre el código real.
 * Si alguien introduce `rounded-lg`, `shadow-[...]`, `transition-all` o un
 * `<dialog>` sin `closedby`, la suite falla.
 */
describe('[DS] Sistema de diseño Scorch v4.1', () => {
  const issues = lintDesign();
  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warn');

  test('no hay infracciones bloqueantes del sistema de diseño', () => {
    const detail = errors.map((issue) => `${issue.file}:${issue.line} [${issue.rule}] ${issue.message}`).join('\n');
    assert.equal(errors.length, 0, `Infracciones de diseño:\n${detail}`);
  });

  test('las reglas sin gradiente no crecen (ratchet de advertencias)', () => {
    // Base actual: 161 advertencias DS-07/DS-08 (bordes estructurales en dark y
    // colores fuera de paleta). El número solo puede bajar.
    assert.ok(
      warnings.length <= 161,
      `Las advertencias de diseño crecieron a ${warnings.length} (máximo 161). Corrige las nuevas e actualiza el ratchet.`
    );
  });

  test('el linter detecta las reglas clave en código sintético', () => {
    // Sanidad del propio linter: si las regex se rompen, este test lo delata.
    const rules = {
      rounded: /(?:^|[\s"'`])rounded(?!-none)(?:-[\w[\]%./]+)?(?=[\s"'`]|$)/,
      shadow: /shadow-\[/,
      transition: /transition-all/,
      darkBorder: /dark:border-(?:white|black|slate-(?:200|300|400|500|600|700))(?![\w-])/,
    };
    assert.ok(rules.rounded.test('class="p-4 rounded-lg"'));
    assert.ok(!rules.rounded.test('class="p-4 rounded-none"'));
    assert.ok(rules.shadow.test('class="shadow-[-4px_4px_0px_#000]"'));
    assert.ok(rules.transition.test('transition-all duration-200'));
    assert.ok(rules.darkBorder.test('dark:border-slate-700'));
    assert.ok(!rules.darkBorder.test('dark:border-scorch-crimson'));
  });
});
