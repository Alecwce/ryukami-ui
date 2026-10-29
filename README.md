# Ryukami-UI

[![CI](https://github.com/Alecwce/ryukami-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/Alecwce/ryukami-ui/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-v2.4.0-D62436.svg)](https://github.com/Alecwce/ryukami-ui/releases/tag/v2.4.0)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-96%20%7C%20100%20%7C%20100%20%7C%20100-success.svg)](https://ryukami-ui.pages.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Librería de 35 componentes Neo-Brutalistas y Retro TUI, instalador CLI y servidor MCP nativo para Astro 7, Tailwind CSS v4 y TypeScript 7.**  
> Diseñada bajo la especificación **Scorch Design System v4.1**, inspirada en terminales CRT industriales, consolas UNIX y arquitectura open-code sin dependencias de runtime.

- **Producción (Cloudflare Pages):** [https://ryukami-ui.pages.dev](https://ryukami-ui.pages.dev)
- **Registro Open-Code JSON:** [https://ryukami-ui.pages.dev/r/registry.json](https://ryukami-ui.pages.dev/r/registry.json)
- **W3C Design Tokens v4.1:** [https://ryukami-ui.pages.dev/r/tokens.json](https://ryukami-ui.pages.dev/r/tokens.json)
- **Manifiesto para Agentes IA (llms.txt):** [https://ryukami-ui.pages.dev/llms.txt](https://ryukami-ui.pages.dev/llms.txt)
- **Repositorio Oficial:** [https://github.com/Alecwce/ryukami-ui](https://github.com/Alecwce/ryukami-ui)

![Ryukami-UI Banner](public/scorch-dragon-banner.webp)

---

## 1. Stack Tecnológico y Rendimiento Auditado

| Capa | Tecnología | Detalles Técnicos |
| :--- | :--- | :--- |
| **Framework** | [Astro 7.4.0](https://astro.build) | Motor **Vite 8 + Rolldown**, HTML estático comprimido y **0 KiB de bundles JS externos**. |
| **Estilos** | [Tailwind CSS 4.3.3](https://tailwindcss.com) | Configuración CSS-first (`@import "tailwindcss";`, `@theme`, `@custom-variant dark`). |
| **Tipado** | [TypeScript 7.0.2](https://www.typescriptlang.org) | Interfaces estrictas (`export interface Props`) en todos los componentes y datos tipados en `src/data/`. |
| **CLI & Registry** | **`ryukami-ui` v2.4.0** | Instalador CLI estilo `shadcn/ui` + Servidor MCP (`stdio`) + Registro estático JSON en `/public/r/*.json` (**35 módulos**). |
| **Audio** | **Web Audio API** | Síntesis procedural en tiempo real de clics mecánicos y alertas sin archivos de audio externos. |
| **Auditoría** | **Lighthouse Verified** | **96** Performance · **100** Accessibility (WCAG AA) · **100** Best Practices · **100** SEO. |

---

## 2. Arquitectura e Ingeniería de Seguridad (AppSec)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  0xRYUKAMI_ENGINEERING // ARCHITECTURE & APPSEC BLUEPRINT                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  [PERF]   Astro 7.4 + Tailwind CSS 4.3 + TS 7 (Build estático en ~1.1s)     │
│  [FONTS]  0 KiB Google Fonts (Fuentes WOFF2 auto-alojadas en /public/fonts) │
│  [HASH]   Integridad SHA-256 por módulo + CLI Anti-Path Traversal           │
│  [DOM]    Zero-innerHTML en entradas de usuario + Validación Regex CSS      │
│  [A11Y]   Navegación por teclado WAI-ARIA, <dialog closedby="any"> y WCAG   │
│  [TESTS]  Suite nativa node:test (13/13 PASS en <100ms, 0 dependencias)     │
│  [EDGE]   HSTS (31536000 + preload), COOP, X-Frame-Options DENY             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Rendimiento y Cero Peticiones Externas
- **Fuentes 100% Auto-Alojadas:** Se eliminaron todas las peticiones a servidores de terceros. Las fuentes (`Press Start 2P`, `Tiny5`, `JetBrains Mono`, `VT323`) se sirven localmente desde `public/fonts/*.woff2` con reglas `@font-face` y `preload` en `<head>`.
- **Métricas Core Web Vitals:** FCP `0.8s`, LCP `1.1s`, TBT `0ms`, CLS `0.000`.
- **Arquitectura Escalable de Datos:** La lógica visual de los 35 componentes reside en `src/components/`, mientras que la documentación de propiedades (`src/data/component-props.ts`) y los fragmentos de código del catálogo (`src/data/component-snippets.ts`) están desacoplados en módulos TypeScript independientes.

### 2.2 Seguridad en la Cadena de Suministro (`ryukami-ui`)
- **Verificación Criptográfica SHA-256:** Cada componente compilado en `public/r/*.json` y en `registry.json` incluye su hash `sha256` calculado por `scripts/build-registry.mjs`. El CLI verifica la integridad (`verifyFileIntegrity`) antes de escribir cualquier archivo en disco y permite auditar cambios locales mediante `ryukami-ui diff`.
- **Prevención de Path Traversal (`resolveSafeTargetPath`):** Normaliza separadores multiplataforma y valida que la ruta final resuelta permanezca estrictamente dentro del directorio del proyecto (`resolvedPath.startsWith(resolvedTarget + path.sep)`), bloqueando vectores como `../../.bashrc`, `..\\..\\Windows\\win.ini` o `/etc/passwd`.

### 2.3 Hardening en Cliente (DOM XSS y CSS Injection)
- **Consola `0xSCORCH_SHELL` y Generador ASCII sin `innerHTML`:** Toda entrada del usuario se procesa exclusivamente mediante `document.createElement()` y `.textContent`.
- **Theme Studio con Validación Regex:** Los tokens CSS dinámicos se validan mediante expresiones regulares estrictas (`COLOR_REGEX = /^#[0-9a-fA-F]{3,8}$/` y `OFFSET_REGEX = /^-?\d+px$/`) antes de invocar `style.setProperty()`.

---

## 3. Instalador CLI y Servidor MCP (`ryukami-ui` v2.4.0)

El binario oficial se encuentra en [`bin/ryukami-ui.mjs`](bin/ryukami-ui.mjs) y consume tanto el registro local (`public/r/`) como el CDN remoto en Cloudflare Pages (`https://ryukami-ui.pages.dev/r`).

### 3.1 Inicializar Proyecto y Tokens W3C
Inyecta `src/styles/global.css` con la configuración de Tailwind CSS v4, crea `ryukami.json` y opcionalmente exporta `design-tokens.json` compatible con Obsidian (`--obsidian`):
```bash
ryukami-ui init --obsidian --dir ./mi-proyecto-astro
```

### 3.2 Listar e Inspeccionar Componentes
```bash
# Listar los 35 módulos disponibles en el registro
ryukami-ui list

# Inspeccionar metadatos, dependencias y hash SHA-256 de un componente
ryukami-ui info data-table
```

### 3.3 Instalar Componentes y Auditar Integridad SHA-256
```bash
# Instalar componentes específicos (resuelve dependencias automáticamente, ej: data-table -> badge)
ryukami-ui add button card callout bento-grid data-table code-block drawer --dir ./mi-proyecto-astro

# Instalar los 35 componentes del catálogo
ryukami-ui add --all --dir ./mi-proyecto-astro

# Auditar integridad SHA-256 de los componentes instalados frente al registro oficial
ryukami-ui diff --dir ./mi-proyecto-astro
```

### 3.4 Servidor MCP para Agentes de IA (`stdio` JSON-RPC 2.0)
Inicia un servidor **Model Context Protocol (MCP)** sobre `stdio` que expone las herramientas `list_components`, `get_component` y `get_design_tokens` para agentes de IA:
```bash
ryukami-ui mcp
```

> [!NOTE]
> **Acceso HTTP Automatizado a `/r/*.json` en Cloudflare:** Si consumes los endpoints JSON remotos desde scripts personalizados (`curl` o Python), incluye siempre una cabecera `User-Agent` descriptiva para evitar bloqueos del *Browser Integrity Check* de Cloudflare:
> ```bash
> curl -A "ryukami-ui-cli/2.4.0" https://ryukami-ui.pages.dev/r/registry.json
> ```

---

## 4. Reglas de Diseño (Scorch Design System v4.1)

1. **Cero Bordes Redondeados (`0px` Radius):** Esquinas rectas en todos los elementos (`border-radius: 0px`) y bordes sólidos de `2px` (`border-2 border-black`).
2. **Sombras Duras Abajo-Izquierda (`0px` Blur):** Desplazamiento estándar `-4px 4px 0px 0px var(--shadow-color)` (`shadow-brutal`) y `-2px 2px 0px 0px var(--shadow-color)` (`shadow-brutal-sm`).
3. **Controles Geométricos de Ventana (`[ - ][ □ ][ × ]`):** Cajas cuadradas de `20×20 px` (`w-5 h-5`) con vectores CSS/SVG centrados y atributos `aria-label`.
4. **Física Mecánica Acelerada por GPU:** Transiciones exclusivas en `transform` (`75ms cubic-bezier(0.23, 1, 0.32, 1)`) sin `transition-all`.
5. **Contraste Calibrado WCAG AA (≥ 4.5:1):** Carmesí Scorch (`#D62436`, ratio **5.04:1** sobre `#FFFFFF`), Cian Eléctrico (`#4DA3FF`) y Oro (`#F4D35E`), con soporte nativo para **Modo Paper (`#F5F7FA`)** y **Modo Hacker (`#0B0F17`)**.

---

## 5. Catálogo Completo (35 Módulos)

| ID CLI (`ryukami-ui add <id>`) | Archivo Astro | Categoría | Descripción |
| :--- | :--- | :--- | :--- |
| `button` | `Button.astro` | `01_CORE_UI` | Botón mecánico con 5 variantes, polimorfismo seguro y síntesis Web Audio. |
| `badge` | `Badge.astro` | `01_CORE_UI` | Etiquetas de estado y telemetría con sombra dura `-2px 2px`. |
| `card` | `Card.astro` | `01_CORE_UI` | Ventana de consola TUI interactiva con controles `[ - ][ □ ][ × ]`. |
| `kbd` | `Kbd.astro` | `01_CORE_UI` | Teclas físicas para visualización de atajos (`[Ctrl] + [K]`). |
| `progress-bar` | `ProgressBar.astro` | `01_CORE_UI` | Barra de progreso segmentada con lectura ASCII `[████████░░░░]`. |
| `avatar` | `Avatar.astro` | `01_CORE_UI` | Identificador cuadrado de operador TUI con estado (`ONLINE`/`BUSY`/`IDLE`). |
| `skeleton` | `Skeleton.astro` | `01_CORE_UI` | Bloque de carga de búfer ASCII (`[ ░░░ SYNC ░░░ ]`) con `role="status"`. |
| `stat-card` | `StatCard.astro` | `01_CORE_UI` | Tarjeta KPI de telemetría con delta porcentual y sparkline ASCII `[▁▂▃▅▆▇█]`. |
| `tooltip` | `Tooltip.astro` | `01_CORE_UI` | Etiqueta emergente accesible por teclado y hover con sombra dura `-2px 2px`. |
| `input` | `Input.astro` | `02_FORM_CONTROLS` | Campo de entrada brutalista con prefijo de terminal (`$`, `tcp://`) y validación. |
| `textarea` | `Textarea.astro` | `02_FORM_CONTROLS` | Editor multilínea UTF-8 con contador en vivo de líneas y bytes. |
| `select` | `Select.astro` | `02_FORM_CONTROLS` | Selector desplegable brutalista con prefijo `OPT //` e indicador mecánico. |
| `slider` | `Slider.astro` | `02_FORM_CONTROLS` | Control deslizante de rango con barra ASCII `[====|----]` en tiempo real. |
| `radio-group` | `RadioGroup.astro` | `02_FORM_CONTROLS` | Selector exclusivo de opciones con indicadores de terminal `( • )` y `(   )`. |
| `checkbox` | `Checkbox.astro` | `02_FORM_CONTROLS` | Casilla de verificación cuadrada con marca geométrica `✕`. |
| `switch` | `Switch.astro` | `02_FORM_CONTROLS` | Interruptor táctil deslizante (`role="switch"`). |
| `tabs` | `Tabs.astro` | `03_LAYOUT_AND_MODALS` | Pestañas multipanel TUI con navegación por flechas (`←` / `→`). |
| `accordion` | `Accordion.astro` | `03_LAYOUT_AND_MODALS` | Acordeón exclusivo nativo sobre `<details name="...">`. |
| `breadcrumb` | `Breadcrumb.astro` | `03_LAYOUT_AND_MODALS` | Ruta de navegación estilo sistema de archivos Unix (`~/ryukami/core/nodes`). |
| `pagination` | `Pagination.astro` | `03_LAYOUT_AND_MODALS` | Barra de paginación mecánica TUI (`[ ◄ PREV ] [ 01 ] [ 02 ] [ NEXT ► ]`). |
| `popover` | `Popover.astro` | `03_LAYOUT_AND_MODALS` | Globo flotante de telemetría con API nativa `popover="auto"` Top-Layer. |
| `alert` | `Alert.astro` | `03_LAYOUT_AND_MODALS` | Bloques de alerta de sistema (`crimson`, `gold`, `cyan`, `emerald`). |
| `callout` | `Callout.astro` | `03_LAYOUT_AND_MODALS` | Callout canónico compatible con Obsidian (`[!dragon]`, `[!scorch]`, `[!terminal]`, `[!tui]`, `[!summary]`). |
| `modal` | `Modal.astro` | `03_LAYOUT_AND_MODALS` | Diálogo modal nativo `<dialog closedby="any">` con light-dismiss. |
| `drawer` | `Drawer.astro` | `03_LAYOUT_AND_MODALS` | Panel lateral deslizante nativo `<dialog closedby="any">` (`left` / `right`). |
| `toast-container` | `ToastContainer.astro` | `03_LAYOUT_AND_MODALS` | Motor de notificaciones flotantes con síntesis acústica por severidad. |
| `command-palette` | `CommandPalette.astro` | `03_LAYOUT_AND_MODALS` | Paleta de comandos (`Ctrl+K`) con filtrado en tiempo real (`deps: kbd`). |
| `bento-grid` | `BentoGrid.astro` | `03_LAYOUT_AND_MODALS` | Sistema modular de grillas Neo-Brutalistas (`1x`, `2x`, `3x`) con cabeceras TUI. |
| `data-table` | `DataTable.astro` | `04_SCORCH_STUDIO` | Tabla de datos interactiva con filtrado en vivo, ordenamiento y badges (`deps: badge`). |
| `code-block` | `CodeBlock.astro` | `04_SCORCH_STUDIO` | Visor de código TUI con numeración de líneas, resaltado diff (`+`/`-`) y copia en 1 clic. |
| `audio-synth` | `AudioSynth.astro` | `04_SCORCH_STUDIO` | Sintetizador interactivo de 4 pads acústicos Web Audio API. |
| `terminal-emulator` | `TerminalEmulator.astro` | `04_SCORCH_STUDIO` | Consola interactiva en vivo (`0xSCORCH_SHELL`) con comandos integrados. |
| `component-preview` | `ComponentPreview.astro` | `04_SCORCH_STUDIO` | Contenedor de documentación `[ PREVIEW | CODE | PROPS ]`. |
| `theme-studio` | `ThemeStudio.astro` | `04_SCORCH_STUDIO` | Laboratorio en vivo de variables CSS, sombras, trama dither y exportación. |
| `ascii-generator` | `AsciiGenerator.astro` | `04_SCORCH_STUDIO` | Generador en tiempo real de banners en matriz ASCII 8-bit. |

---

## 6. Estructura del Proyecto

```text
ryukami-ui/
├── bin/
│   └── ryukami-ui.mjs             # CLI oficial (init, list, add, info, diff, mcp)
├── scripts/
│   ├── build-registry.mjs         # Compilador de los 35 módulos + styles.json + tokens.json
│   ├── scorch-ascii.py            # Utilidad Python para conversión de imágenes a ASCII
│   └── setup-hooks.sh             # Instalador del hook pre-push para despliegue continuo
├── public/
│   ├── _headers                   # Cabeceras HTTP de seguridad, caché inmutable y CORS (/r/*)
│   ├── favicon.svg                # Icono vectorial minimalista de terminal ([>_])
│   ├── llms.txt                   # Manifiesto estructurado para agentes de IA y LLMs
│   └── r/                         # 35 endpoints JSON + registry.json + styles.json + tokens.json
├── src/
│   ├── components/                # 37 componentes Astro (.astro) con tipado estricto
│   ├── data/
│   │   ├── component-props.ts     # Especificación tipada de propiedades para el catálogo
│   │   └── component-snippets.ts  # Snippets de código desacoplados para las vistas previas
│   ├── layouts/
│   │   └── BaseLayout.astro       # Layout base, metadatos SEO, tema y síntesis Web Audio
│   ├── pages/
│   │   ├── index.astro            # Documentación interactiva y catálogo de los 35 módulos
│   │   └── 404.astro              # Página de diagnóstico de rutas inexistentes
│   └── styles/
│       └── global.css             # Tokens @theme de Tailwind CSS v4 y reglas Neo-Brutalistas
├── tests/
│   └── security.test.mjs          # Suite nativa node:test (Path Traversal, SHA-256, CSS Regex)
├── AGENTS.md                      # Reglas de arquitectura y diseño para agentes de IA
├── astro.config.mjs               # Configuración de Astro 7 + Vite 8 + Tailwind v4
├── tsconfig.json                  # Configuración estricta de TypeScript 7
├── wrangler.jsonc                 # Configuración de despliegue en Cloudflare Pages
└── package.json
```

---

## 7. Desarrollo, Pruebas y Despliegue

```bash
# 1. Instalar dependencias
pnpm install

# 2. Compilar el registro estático JSON (public/r/*.json)
pnpm registry:build

# 3. Iniciar servidor de desarrollo en http://localhost:4321
pnpm dev

# 4. Ejecutar la suite de pruebas de seguridad e integridad (node:test)
pnpm test

# 5. Compilar registro y sitio estático de producción en ./dist
pnpm build

# 6. Desplegar a Cloudflare Pages
pnpm pages:deploy
```

---

## 8. Licencia

Distribuido bajo la licencia **[MIT License](LICENSE)**.  
Copyright (c) 2026 **Ryukami Labs**.
