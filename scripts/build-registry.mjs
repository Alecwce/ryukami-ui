#!/usr/bin/env node
/**
 * 🐉 Ryukami-UI // Static Registry Builder (8bitcn / shadcn architecture)
 * Compila src/components/*.astro y src/styles/global.css en endpoints JSON estáticos en public/r/
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT_DIR, 'public', 'r');

const ITEMS = [
  {
    name: 'button',
    title: 'Button',
    category: '01_CORE_UI',
    description: 'Botón mecánico Neo-Brutalista con 5 variantes y síntesis de clic Web Audio.',
    file: 'src/components/Button.astro',
    registryDependencies: [],
  },
  {
    name: 'badge',
    title: 'Badge',
    category: '01_CORE_UI',
    description: 'Etiquetas y pastillas TUI de estado con sombra dura de -2px 2px.',
    file: 'src/components/Badge.astro',
    registryDependencies: [],
  },
  {
    name: 'card',
    title: 'Card (TUI Window)',
    category: '01_CORE_UI',
    description: 'Ventana de consola TUI con barra superior y controles geométricos [ - ][ □ ][ × ].',
    file: 'src/components/Card.astro',
    registryDependencies: [],
  },
  {
    name: 'kbd',
    title: 'Kbd',
    category: '01_CORE_UI',
    description: 'Representación física de teclas de atajos de teclado ([Ctrl] + [K]).',
    file: 'src/components/Kbd.astro',
    registryDependencies: [],
  },
  {
    name: 'input',
    title: 'Input',
    category: '02_FORM_CONTROLS',
    description: 'Campo de entrada brutalista con prefijo de terminal ($ / tcp://), hints y validación.',
    file: 'src/components/Input.astro',
    registryDependencies: [],
  },
  {
    name: 'checkbox',
    title: 'Checkbox',
    category: '02_FORM_CONTROLS',
    description: 'Casilla de verificación cuadrada con marca pixel-art (✕) y descripción.',
    file: 'src/components/Checkbox.astro',
    registryDependencies: [],
  },
  {
    name: 'switch',
    title: 'Switch',
    category: '02_FORM_CONTROLS',
    description: 'Interruptor táctil deslizante (role="switch") con variantes crimson, cyan y gold.',
    file: 'src/components/Switch.astro',
    registryDependencies: [],
  },
  {
    name: 'alert',
    title: 'Alert',
    category: '03_FEEDBACK_OVERLAYS',
    description: 'Callouts de sistema con 4 niveles de severidad (crimson, gold, cyan, emerald).',
    file: 'src/components/Alert.astro',
    registryDependencies: [],
  },
  {
    name: 'modal',
    title: 'Modal (HTML5 Dialog)',
    category: '03_FEEDBACK_OVERLAYS',
    description: 'Diálogo modal nativo <dialog closedby="any"> con bloqueo de scroll de fondo.',
    file: 'src/components/Modal.astro',
    registryDependencies: [],
  },
  {
    name: 'toast-container',
    title: 'ToastContainer',
    category: '03_FEEDBACK_OVERLAYS',
    description: 'Motor global de notificaciones flotantes con síntesis de audio por severidad.',
    file: 'src/components/ToastContainer.astro',
    registryDependencies: [],
  },
  {
    name: 'command-palette',
    title: 'CommandPalette',
    category: '03_FEEDBACK_OVERLAYS',
    description: 'Consola de comandos interactiva (Ctrl+K) con buscador en vivo y atajos de teclado.',
    file: 'src/components/CommandPalette.astro',
    registryDependencies: ['kbd'],
  },
  {
    name: 'component-preview',
    title: 'ComponentPreview',
    category: '04_SCORCH_STUDIO',
    description: 'Visor interactivo [ PREVIEW | CODE ] con botón de copiado en 1 clic.',
    file: 'src/components/ComponentPreview.astro',
    registryDependencies: [],
  },
  {
    name: 'theme-studio',
    title: 'ThemeStudio',
    category: '04_SCORCH_STUDIO',
    description: 'Personalizador en vivo de tokens CSS, sombras brutalistas y trama halftone.',
    file: 'src/components/ThemeStudio.astro',
    registryDependencies: [],
  },
  {
    name: 'ascii-generator',
    title: 'AsciiGenerator',
    category: '04_SCORCH_STUDIO',
    description: 'Forja de banners ASCII 8-bit y emblema del Dragón Scorch en tiempo real.',
    file: 'src/components/AsciiGenerator.astro',
    registryDependencies: [],
  },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

// 1. Generar JSON individual por cada componente
const registryIndex = [];

for (const item of ITEMS) {
  const absPath = path.join(ROOT_DIR, item.file);
  const content = fs.readFileSync(absPath, 'utf-8');

  const payload = {
    $schema: 'https://ryukami-ui.dev/schema/registry-item.json',
    name: item.name,
    title: item.title,
    type: 'registry:ui',
    category: item.category,
    description: item.description,
    registryDependencies: item.registryDependencies,
    files: [
      {
        path: item.file,
        type: 'registry:component',
        content,
      },
    ],
  };

  fs.writeFileSync(
    path.join(OUT_DIR, `${item.name}.json`),
    JSON.stringify(payload, null, 2),
    'utf-8'
  );

  registryIndex.push({
    name: item.name,
    title: item.title,
    category: item.category,
    description: item.description,
    registryDependencies: item.registryDependencies,
    endpoint: `/r/${item.name}.json`,
    target: item.file,
  });
}

// 2. Generar tokens base (styles.json) para `ryukami-ui init`
const globalCssPath = path.join(ROOT_DIR, 'src/styles/global.css');
const globalCssContent = fs.readFileSync(globalCssPath, 'utf-8');
fs.writeFileSync(
  path.join(OUT_DIR, 'styles.json'),
  JSON.stringify(
    {
      name: 'styles',
      title: 'Scorch Design System Global CSS (Tailwind v4)',
      type: 'registry:style',
      files: [
        {
          path: 'src/styles/global.css',
          type: 'registry:style',
          content: globalCssContent,
        },
      ],
    },
    null,
    2
  ),
  'utf-8'
);

// 3. Generar índice maestro public/r/registry.json
const masterRegistry = {
  name: 'ryukami-ui',
  version: '2.1.0',
  edition: 'Scorch Dragon // Velgrynd Tribute Edition',
  stack: 'Astro 7.4 + Tailwind CSS 4.3 + TypeScript 7.0',
  updatedAt: new Date().toISOString(),
  totalItems: registryIndex.length,
  items: registryIndex,
};

fs.writeFileSync(
  path.join(OUT_DIR, 'registry.json'),
  JSON.stringify(masterRegistry, null, 2),
  'utf-8'
);

console.log(`⚡ [RYUKAMI-REGISTRY] Compilados ${registryIndex.length} componentes + styles.json en public/r/`);
