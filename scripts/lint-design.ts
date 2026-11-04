#!/usr/bin/env node
/**
 * Ryukami-UI // Design System Linter (Scorch v4.1)
 *
 * Convierte las reglas de AGENTS.md en un gate ejecutable. Se ejecuta en CI
 * (`node scripts/lint-design.ts`) y en la suite de tests, para que una clase
 * fuera de norma no vuelva a colarse en un componente.
 *
 * Uso:
 *   node scripts/lint-design.ts            # reporte legible, exit 1 si hay errores
 *   node scripts/lint-design.ts --json     # salida legible por máquina
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export type Severity = 'error' | 'warn';

export interface DesignIssue {
  file: string;
  line: number;
  rule: string;
  severity: Severity;
  message: string;
  snippet: string;
}

const SCAN_TARGETS = [
  'src/components',
  'src/blocks',
  'src/layouts',
  'src/pages',
];

const SKIP_LINE = /lint-design-disable/;

function listFiles(dir: string): string[] {
  const abs = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(abs)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(rel));
    else if (entry.name.endsWith('.astro')) out.push(rel);
  }
  return out;
}

/** Reglas evaluadas línea a línea sobre clases y estilos. */
const LINE_RULES: Array<{
  id: string;
  severity: Severity;
  pattern: RegExp;
  message: string;
  appliesTo?: (file: string) => boolean;
}> = [
  {
    id: 'DS-01',
    severity: 'error',
    pattern: /(?:^|[\s"'`])rounded(?!-none)(?:-[\w[\]%./]+)?(?=[\s"'`]|$)/,
    message: 'Esquinas redondeadas prohibidas: usa `rounded-none` o nada (el reset global ya fuerza 0px).',
  },
  {
    id: 'DS-02',
    severity: 'error',
    pattern: /shadow-\[/,
    message: 'Sombra arbitraria prohibida: usa los tokens `shadow-brutal`, `-sm`, `-lg`, `-xl` o `shadow-accent-*`.',
  },
  {
    id: 'DS-03',
    severity: 'error',
    pattern: /blur\(\s*(?!0(?:px)?\s*\))(?:\d*\.?\d+)/,
    message: 'Sombras/desenfoques difuminados prohibidos (blur > 0).',
  },
  {
    id: 'DS-04',
    severity: 'error',
    pattern: /transition-all/,
    message: '`transition-all` dispara animaciones no compuestas: anima propiedades explícitas o solo transform.',
  },
  {
    id: 'DS-07',
    severity: 'warn',
    pattern: /dark:border-(?:white|black|slate-(?:200|300|400|500|600|700))(?![\w-])/,
    message: 'Regla 2: en modo oscuro el borde estructural debe ser `dark:border-scorch-crimson` (slate-800/900/950 quedan para divisores internos).',
  },
  {
    id: 'DS-10',
    severity: 'error',
    pattern: /\son(?:click|change|submit|input|keydown|load)=/,
    message: 'Manejadores inline prohibidos (bloquean una CSP estricta): usa `data-action` + addEventListener.',
    appliesTo: (file) => !file.endsWith('Button.astro'),
  },
  {
    id: 'DS-08',
    severity: 'warn',
    pattern: /\btext-(?:emerald|sky|purple|indigo|red|yellow)-\d{3}\b/,
    message: 'Color fuera de la paleta Scorch: usa tokens `scorch-crimson|cyan|gold` o `slate` neutro.',
  },
];

function lintLine(file: string, line: number, text: string, issues: DesignIssue[]) {
  if (SKIP_LINE.test(text)) return;
  for (const rule of LINE_RULES) {
    if (rule.appliesTo && !rule.appliesTo(file)) continue;
    if (rule.pattern.test(text)) {
      issues.push({
        file,
        line,
        rule: rule.id,
        severity: rule.severity,
        message: rule.message,
        snippet: text.trim().slice(0, 120),
      });
    }
  }
}

export function lintDesign(): DesignIssue[] {
  const issues: DesignIssue[] = [];
  const files = SCAN_TARGETS.flatMap(listFiles);

  for (const file of files) {
    const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => lintLine(file, index + 1, line, issues));

    // DS-05: todo <dialog> nativo debe poder cerrarse con click fuera / Escape
    const dialogMatches = [...content.matchAll(/<dialog\b[^>]*>/g)];
    for (const match of dialogMatches) {
      if (!/\bclosedby=/.test(match[0])) {
        const line = content.slice(0, match.index).split('\n').length;
        issues.push({
          file,
          line,
          rule: 'DS-05',
          severity: 'error',
          message: 'Los <dialog> deben declarar `closedby="any"` (regla 7 de AGENTS.md).',
          snippet: match[0].slice(0, 120),
        });
      }
    }

    // DS-06: convención `export interface Props`
    if (/Astro\.props/.test(content) && !/export\s+(interface|type)\s+Props/.test(content)) {
      issues.push({
        file,
        line: 1,
        rule: 'DS-06',
        severity: 'error',
        message: 'El componente lee Astro.props pero no declara `export interface Props`.',
        snippet: '(frontmatter)',
      });
    }
  }

  // DS-09: scrollbars/thumb con radio en el CSS global
  const cssPath = 'src/styles/global.css';
  const css = fs.readFileSync(path.join(ROOT_DIR, cssPath), 'utf-8');
  css.split('\n').forEach((line, index) => {
    if (/border-radius:\s*(?!0(?:px)?\b)(?:\d|\.)/.test(line)) {
      issues.push({
        file: cssPath,
        line: index + 1,
        rule: 'DS-09',
        severity: 'error',
        message: '`border-radius` distinto de 0px en el sistema de diseño.',
        snippet: line.trim(),
      });
    }
  });

  return issues;
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
  const issues = lintDesign();
  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warn');

  const verbose = process.argv.includes('--verbose') || process.argv.includes('--json');

  if (process.argv.includes('--json')) {
    process.stdout.write(JSON.stringify({ errors: errors.length, warnings: warnings.length, issues }, null, 2) + '\n');
  } else {
    for (const issue of verbose ? [...errors, ...warnings] : errors) {
      const tag = issue.severity === 'error' ? '✖' : '▲';
      console.log(`${tag} ${issue.file}:${issue.line}  [${issue.rule}] ${issue.message}`);
      console.log(`    ${issue.snippet}`);
    }
    console.log('');
    console.log(
      `Design lint: ${errors.length} error(es), ${warnings.length} advertencia(s)` +
        (verbose || warnings === 0 ? '' : ' (usa --verbose para verlas)') +
        `.`
    );
  }

  process.exitCode = errors.length > 0 ? 1 : 0;
}
