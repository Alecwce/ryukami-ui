#!/usr/bin/env node
/**
 * Ryukami-UI // Static Registry Builder (8bitcn / shadcn architecture)
 * Compila src/components/*.astro, src/styles/global.css y tokens.json en endpoints JSON estáticos en public/r/
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT_DIR, 'public', 'r');

export interface RegistryItemDef {
  name: string;
  title: string;
  category: '01_CORE_UI' | '02_FORM_CONTROLS' | '03_LAYOUT_AND_MODALS' | '04_SCORCH_STUDIO';
  description: string;
  file: string;
  registryDependencies: string[];
}

export interface CompiledFile {
  path: string;
  type: string;
  content: string;
  sha256: string;
}

export interface ComponentPayload {
  name: string;
  type: string;
  title: string;
  category: string;
  description: string;
  files: CompiledFile[];
  registryDependencies: string[];
}

const ITEMS: RegistryItemDef[] = [
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
    description: 'Ventana de consola TUI interactiva con controles geométricos [ - ][ □ ][ × ].',
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
    name: 'progress-bar',
    title: 'ProgressBar',
    category: '01_CORE_UI',
    description: 'Barra de progreso segmentada estilo BIOS con lectura ASCII [████████░░░░] en vivo.',
    file: 'src/components/ProgressBar.astro',
    registryDependencies: [],
  },
  {
    name: 'avatar',
    title: 'Avatar',
    category: '01_CORE_UI',
    description: 'Identificador cuadrado de operador TUI con indicador de estado (ONLINE/BUSY/IDLE).',
    file: 'src/components/Avatar.astro',
    registryDependencies: [],
  },
  {
    name: 'skeleton',
    title: 'Skeleton',
    category: '01_CORE_UI',
    description: 'Bloque de carga de búfer ASCII ([ ░░░ SYNC ░░░ ]) con estructura brutalista.',
    file: 'src/components/Skeleton.astro',
    registryDependencies: [],
  },
  {
    name: 'stat-card',
    title: 'StatCard (Telemetry KPI)',
    category: '01_CORE_UI',
    description: 'Tarjeta de métrica KPI con delta porcentual (▲/▼) y sparkline ASCII [▁▂▃▅▆▇█].',
    file: 'src/components/StatCard.astro',
    registryDependencies: [],
  },
  {
    name: 'tooltip',
    title: 'Tooltip',
    category: '01_CORE_UI',
    description: 'Etiqueta emergente accesible por teclado y hover con sombra dura -2px 2px.',
    file: 'src/components/Tooltip.astro',
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
    name: 'textarea',
    title: 'Textarea',
    category: '02_FORM_CONTROLS',
    description: 'Editor multilínea de búfer UTF-8 con contador en vivo de líneas y bytes.',
    file: 'src/components/Textarea.astro',
    registryDependencies: [],
  },
  {
    name: 'select',
    title: 'Select',
    category: '02_FORM_CONTROLS',
    description: 'Selector desplegable brutalista con prefijo OPT // e indicador mecánico.',
    file: 'src/components/Select.astro',
    registryDependencies: [],
  },
  {
    name: 'slider',
    title: 'Slider (ASCII Range)',
    category: '02_FORM_CONTROLS',
    description: 'Control deslizante de rango con barra de caracteres ASCII [====|----] en tiempo real.',
    file: 'src/components/Slider.astro',
    registryDependencies: [],
  },
  {
    name: 'radio-group',
    title: 'RadioGroup',
    category: '02_FORM_CONTROLS',
    description: 'Selector exclusivo de opciones con indicadores de terminal ( • ) y (   ).',
    file: 'src/components/RadioGroup.astro',
    registryDependencies: [],
  },
  {
    name: 'checkbox',
    title: 'Checkbox',
    category: '02_FORM_CONTROLS',
    description: 'Casilla de verificación cuadrada con marca pixel-art (X) y descripción.',
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
    name: 'tabs',
    title: 'Tabs',
    category: '03_LAYOUT_AND_MODALS',
    description: 'Paneles multipestaña TUI con navegación por flechas de teclado y sonido mecánico.',
    file: 'src/components/Tabs.astro',
    registryDependencies: [],
  },
  {
    name: 'accordion',
    title: 'Accordion',
    category: '03_LAYOUT_AND_MODALS',
    description: 'Acordeón exclusivo nativo con <details name="..."> accesible y buscable en página.',
    file: 'src/components/Accordion.astro',
    registryDependencies: [],
  },
  {
    name: 'breadcrumb',
    title: 'Breadcrumb',
    category: '03_LAYOUT_AND_MODALS',
    description: 'Ruta de navegación estilo sistema de archivos Unix (~/ryukami/core/nodes).',
    file: 'src/components/Breadcrumb.astro',
    registryDependencies: [],
  },
  {
    name: 'pagination',
    title: 'Pagination',
    category: '03_LAYOUT_AND_MODALS',
    description: 'Barra de paginación mecánica TUI ([ ◄ PREV ] [ 01 ] [ 02 ] [ NEXT ► ]).',
    file: 'src/components/Pagination.astro',
    registryDependencies: [],
  },
  {
    name: 'popover',
    title: 'Popover (HTML5 Popover API)',
    category: '03_LAYOUT_AND_MODALS',
    description: 'Globo flotante de telemetría con API nativa popover="auto" sin dependencias JS.',
    file: 'src/components/Popover.astro',
    registryDependencies: ['icon'],
  },
  {
    name: 'alert',
    title: 'Alert',
    category: '03_LAYOUT_AND_MODALS',
    description: 'Callouts de sistema con 4 niveles de severidad (crimson, gold, cyan, emerald).',
    file: 'src/components/Alert.astro',
    registryDependencies: [],
  },
  {
    name: 'callout',
    title: 'Callout (Obsidian Scorch)',
    category: '03_LAYOUT_AND_MODALS',
    description: 'Callout canónico compatible con Obsidian ([!dragon], [!scorch], [!terminal], [!tui], [!summary]).',
    file: 'src/components/Callout.astro',
    registryDependencies: [],
  },
  {
    name: 'modal',
    title: 'Modal (HTML5 Dialog)',
    category: '03_LAYOUT_AND_MODALS',
    description: 'Diálogo modal nativo <dialog closedby="any"> con bloqueo de scroll de fondo.',
    file: 'src/components/Modal.astro',
    registryDependencies: [],
  },
  {
    name: 'drawer',
    title: 'Drawer (Side Sheet Dialog)',
    category: '03_LAYOUT_AND_MODALS',
    description: 'Panel lateral deslizante nativo <dialog closedby="any"> con posición izquierda o derecha.',
    file: 'src/components/Drawer.astro',
    registryDependencies: [],
  },
  {
    name: 'toast-container',
    title: 'ToastContainer',
    category: '03_LAYOUT_AND_MODALS',
    description: 'Motor global de notificaciones flotantes con síntesis de audio por severidad.',
    file: 'src/components/ToastContainer.astro',
    registryDependencies: [],
  },
  {
    name: 'command-palette',
    title: 'CommandPalette',
    category: '03_LAYOUT_AND_MODALS',
    description: 'Consola de comandos interactiva (Ctrl+K) con buscador en vivo y atajos de teclado.',
    file: 'src/components/CommandPalette.astro',
    registryDependencies: ['kbd'],
  },
  {
    name: 'bento-grid',
    title: 'BentoGrid',
    category: '03_LAYOUT_AND_MODALS',
    description: 'Sistema modular de grillas Neo-Brutalistas (1x, 2x, 3x) con telemetría y cabeceras TUI.',
    file: 'src/components/BentoGrid.astro',
    registryDependencies: [],
  },
  {
    name: 'data-table',
    title: 'DataTable (Interactive TUI Grid)',
    category: '04_SCORCH_STUDIO',
    description: 'Tabla de datos interactiva con filtrado en vivo, ordenamiento por columna y badges de estado.',
    file: 'src/components/DataTable.astro',
    registryDependencies: ['badge'],
  },
  {
    name: 'code-block',
    title: 'CodeBlock (Diff & Copy)',
    category: '04_SCORCH_STUDIO',
    description: 'Visor de código TUI con numeración de líneas, resaltado diff (+/-) y copiado en 1 clic.',
    file: 'src/components/CodeBlock.astro',
    registryDependencies: [],
  },
  {
    name: 'audio-synth',
    title: 'AudioSynth (8-Bit Oscillator)',
    category: '04_SCORCH_STUDIO',
    description: 'Sintetizador interactivo de 4 pads acústicos Web Audio API (Cherry MX, Pip, Ack, Scorch Pulse).',
    file: 'src/components/AudioSynth.astro',
    registryDependencies: [],
  },
  {
    name: 'terminal-emulator',
    title: 'TerminalEmulator (0xSCORCH_SHELL)',
    category: '04_SCORCH_STUDIO',
    description: 'Consola interactiva en vivo con comandos (neofetch, status, dragon, cli, theme, clear).',
    file: 'src/components/TerminalEmulator.astro',
    registryDependencies: [],
  },
  {
    name: 'component-preview',
    title: 'ComponentPreview',
    category: '04_SCORCH_STUDIO',
    description: 'Visor interactivo [ PREVIEW | CODE | PROPS ] con botón de copiado de CLI y código en 1 clic.',
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

const registryIndex = [];

for (const item of ITEMS) {
  const absPath = path.join(ROOT_DIR, item.file);
  const content = fs.readFileSync(absPath, 'utf-8');
  const sha256 = crypto.createHash('sha256').update(content, 'utf-8').digest('hex');

  const payload = {
    $schema: 'https://ryukami-ui.dev/schema/registry-item.json',
    name: item.name,
    title: item.title,
    type: 'registry:ui',
    category: item.category,
    description: item.description,
    registryDependencies: item.registryDependencies,
    sha256,
    files: [
      {
        path: item.file,
        type: 'registry:component',
        sha256,
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
    sha256,
    endpoint: `/r/${item.name}.json`,
    target: item.file,
  });
}

const globalCssPath = path.join(ROOT_DIR, 'src/styles/global.css');
const globalCssContent = fs.readFileSync(globalCssPath, 'utf-8');
const stylesSha256 = crypto.createHash('sha256').update(globalCssContent, 'utf-8').digest('hex');

fs.writeFileSync(
  path.join(OUT_DIR, 'styles.json'),
  JSON.stringify(
    {
      name: 'styles',
      title: 'Scorch Design System Global CSS (Tailwind v4)',
      type: 'registry:style',
      sha256: stylesSha256,
      files: [
        {
          path: 'src/styles/global.css',
          type: 'registry:style',
          sha256: stylesSha256,
          content: globalCssContent,
        },
      ],
    },
    null,
    2
  ),
  'utf-8'
);

// W3C Design Tokens sincronizados con la bóveda Obsidian (Scorch v4.1)
const designTokens = {
  $schema: 'https://tr.designtokens.org/format/',
  meta: {
    name: 'Scorch-CLI Design System (Velgrynd Edition)',
    version: '4.1.0',
    uiVersion: '2.4.0',
    author: 'Ryukami Labs (Alecwce)',
    license: 'MIT',
    updatedAt: '2026-10-28',
    aesthetic: [
      'Neo-Brutalism',
      'Retro TUI / CLI',
      'ASCII Matrix Art',
      '8-Bit Pixel Display',
      'Velgrynd Scorch Lore',
    ],
  },
  themes: {
    light_paper: {
      bg_canvas: '#F5F7FA',
      bg_surface: '#FFFFFF',
      bg_terminal_header: '#0A0E14',
      text_primary: '#111111',
      text_secondary: '#334155',
      text_inverted: '#FFFFFF',
      border_color: '#000000',
      shadow_color: '#000000',
      dither_dots: '#94A3B8',
      ascii_color: '#D62436',
    },
    dark_hacker: {
      bg_canvas: '#0B0F17',
      bg_surface: '#111827',
      bg_terminal_header: '#D62436',
      text_primary: '#F8FAFC',
      text_secondary: '#CBD5E1',
      text_inverted: '#FFFFFF',
      border_color: '#E2E8F0',
      shadow_color: '#D62436',
      dither_dots: '#1E293B',
      ascii_color: '#FF4D5A',
    },
  },
  velgrynd_palette: {
    scorch_crimson: {
      value: '#D62436',
      contrast_white: '5.04:1 (WCAG AA)',
      description: 'Fuego primordial calibrado WCAG AA, botones primarios, alertas, sombra en modo oscuro',
    },
    scale_dark_red: {
      value: '#9B1B30',
      description: 'Sombra interna de escamas y gradientes de matriz ASCII',
    },
    whisker_cyan: {
      value: '#4DA3FF',
      description: 'Bigotes de dragón, acento técnico, badges RE_ENGINEERING, enlaces',
    },
    eye_gold: {
      value: '#F4D35E',
      description: 'Ojos brillantes de Velgrynd, advertencias, toggles de estado',
    },
    eye_gold_contrast: {
      value: '#B45309',
      description: 'Variación ámbar de alto contraste WCAG (7.09:1) para texto en modo claro',
    },
  },
  typography: {
    font_display: "'Press Start 2P', 'VT323', monospace",
    font_sub: "'Tiny5', 'VT323', monospace",
    font_mono: "'JetBrains Mono', monospace",
    text_transform_headings: 'uppercase',
    letter_spacing_sub: '0.14em',
  },
  layout_and_physics: {
    border_width: '2px',
    border_radius: '0px',
    shadow_direction: 'bottom-left',
    shadow_default: '-4px 4px 0px 0px var(--shadow-color)',
    shadow_hover: '-6px 6px 0px 0px var(--shadow-color)',
    shadow_active: '0px 0px 0px 0px var(--shadow-color)',
    shadow_badge: '-2px 2px 0px 0px var(--shadow-color)',
    transform_hover: 'translate(2px, -2px)',
    transform_active: 'translate(-4px, 4px)',
    ease_mechanical: 'cubic-bezier(0.23, 1, 0.32, 1)',
    transition_mechanical: 'transform 75ms cubic-bezier(0.23, 1, 0.32, 1)',
  },
};

fs.writeFileSync(
  path.join(OUT_DIR, 'tokens.json'),
  JSON.stringify(designTokens, null, 2),
  'utf-8'
);

const masterRegistry = {
  name: 'ryukami-ui',
  version: '2.4.0',
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

console.log(`[RYUKAMI-REGISTRY] Compilados ${registryIndex.length} componentes + styles.json + tokens.json en public/r/`);
