# 🐉 Ryukami-UI (Scorch Dragon // Velgrynd Tribute Edition)

[![CI](https://github.com/Alecwce/ryukami-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/Alecwce/ryukami-ui/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-v2.3.0-D62436.svg)](https://github.com/Alecwce/ryukami-ui/releases/tag/v2.3.0)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-96%20%7C%20100%20%7C%20100%20%7C%20100-success.svg)](https://ryukami-ui.pages.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Retro TUI & Neo-Brutalist Component Library + CLI Installer for Astro 7, Tailwind CSS v4 & Modern Web Apps.**  
> Inspired by oriental dragon lore, 8-bit CRT terminals, and raw mechanical engineering aesthetics.

- 🌐 **Live Production (Cloudflare Pages):** [**https://ryukami-ui.pages.dev**](https://ryukami-ui.pages.dev)  
- 📦 **Live Open-Code JSON Registry:** [**https://ryukami-ui.pages.dev/r/registry.json**](https://ryukami-ui.pages.dev/r/registry.json)  
- 🤖 **AI Agent Manifest (llms.txt):** [**https://ryukami-ui.pages.dev/llms.txt**](https://ryukami-ui.pages.dev/llms.txt)  
- 🐙 **GitHub Repository:** [**https://github.com/Alecwce/ryukami-ui**](https://github.com/Alecwce/ryukami-ui)

![Ryukami Scorch Dragon Banner](public/scorch-dragon-banner.webp)

---

## Stack Tecnológico & Rendimiento Auditado (Lighthouse 96 / 100 / 100 / 100)

| Capa | Tecnología | Detalles Técnicos |
| :--- | :--- | :--- |
| **Framework** | [Astro 7.4.0](https://astro.build) | Motor **Vite 8 + Rolldown**, HTML comprimido y **0 KiB de bundles JS externos**. |
| **Estilos** | [Tailwind CSS 4.3.3](https://tailwindcss.com) | Configuración CSS-first (`@import "tailwindcss";`, `@theme`, `@custom-variant dark`). |
| **Tipado** | [TypeScript 7.0.2](https://www.typescriptlang.org) | Interfaces estrictas (`export interface Props`) en todos los componentes. |
| **CLI & Registry** | **`ryukami-ui` v2.3.0** | Instalador CLI estilo `shadcn/ui` & `8bitcn` + Registro estático JSON en `/public/r/*.json` (**27 módulos**). |
| **Audio** | **Web Audio API** | Síntesis procedural en tiempo real de clics mecánicos y alertas sin archivos `.mp3`. |
| **Auditoría Real** | **Lighthouse Verified** | **96** Performance · **100** Accessibility (WCAG AA) · **100** Best Practices · **100** SEO. |

---

## 🛠️ Instalador CLI (`ryukami-ui`) — Estilo `shadcn` / `8bitcn`

El proyecto incluye su propio **CLI ejecutable** ([`bin/ryukami-ui.mjs`](bin/ryukami-ui.mjs)) y su compilador de registro estático ([`scripts/build-registry.mjs`](scripts/build-registry.mjs)), instalado globalmente en `~/.local/bin/ryukami-ui`.

### 1. Inicializar Tokens y Configuración en cualquier Proyecto
Inyecta automáticamente `src/styles/global.css` con la paleta Scorch calibrada para Tailwind v4 y crea `ryukami.json`:
```bash
ryukami-ui init --dir ./mi-proyecto-astro
```

### 2. Listar todos los Componentes del Registro
Muestra una tabla TUI en terminal con los **27 módulos** disponibles y sus dependencias:
```bash
ryukami-ui list
```

### 3. Instalar Componentes Específicos (con resolución de dependencias)
Copia los componentes `.astro` directamente en `src/components/` (por ejemplo, al pedir `command-palette`, instala automáticamente su dependencia `kbd`):
```bash
ryukami-ui add button badge card avatar skeleton textarea radio-group breadcrumb pagination popover modal command-palette --dir ./mi-proyecto-astro
```

### 4. Instalar Todo el Catálogo de una Vez o Inspeccionar un Módulo
```bash
# Instalar los 27 componentes a la vez
ryukami-ui add --all --dir ./mi-proyecto-astro

# Inspeccionar metadatos y endpoint JSON de un componente
ryukami-ui info command-palette

# Consumir directamente desde el registro remoto en Cloudflare Pages
ryukami-ui add button --registry https://ryukami-ui.pages.dev/r
```

### 5. Nota sobre Cloudflare Bot Fight Mode & Acceso Automatizado a `/r/*.json`

Los endpoints JSON en `https://ryukami-ui.pages.dev/r/*.json` cuentan con cabeceras `Access-Control-Allow-Origin: *` y están disponibles para consumo web y terminal.

> [!NOTE]
> **Error HTTP 403 (Error 1010 de Cloudflare)**: Si intentas consumir los archivos JSON usando librerías de scraping o clientes HTTP sin un User-Agent de navegador (por ejemplo `curl` sin cabeceras o librerías estándar como `Python-urllib/*`), el sistema de seguridad en el Edge de Cloudflare (**Browser Integrity Check / Bot Fight Mode**) interceptará la conexión respondiendo con código `403 Forbidden` (`error code: 1010`).
>
> **Cómo resolverlo:**
> - **En scripts y automatizaciones:** Especifica siempre una cabecera `User-Agent` descriptiva (el CLI nativo `ryukami-ui` en Node.js y navegadores acceden con código 200 sin problemas):
>   ```bash
>   curl -A "Ryukami-CLI/2.3.0" https://ryukami-ui.pages.dev/r/registry.json
>   ```
> - **En el panel de Cloudflare (Dashboard):** Si deseas permitir clientes sin User-Agent, ve a **Security > Bots** en Cloudflare Dashboard y desactiva *Bot Fight Mode*, o crea una regla WAF personalizada para la ruta `/r/*`. Esta configuración opera a nivel de proxy DNS/WAF y no puede alterarse únicamente desde el repositorio estático.

---

## 🏛️ Reglas de Diseño (Scorch Design System v4.1)

1. **Neo-Brutalismo Puro (`0px` Radius):** Bordes sólidos de `2px`, esquinas de `0px` y sombras duras hacia abajo-izquierda (`-4px 4px 0px 0px`).
2. **Controles Geométricos de Ventana (`[ - ][ □ ][ × ]`):** Cajas cuadradas exactas de `20×20 px` (`w-5 h-5`) con vectores centrados al píxel.
3. **Física Táctil Acelerada por GPU:** Transiciones exclusivas en `transform: translate(-2px, 2px)` (`75ms ease-out`) para evitar repintados de CPU.
4. **Contraste Calibrado WCAG AA:** Carmesí Scorch (`#D62436`, ratio **5.04:1** sobre blanco), Cian Eléctrico (`#4DA3FF`) y Oro Dragón (`#F4D35E`).
5. **Doble Tema Nativo:** Modo **Paper (`#F5F7FA`)** de alto contraste diurno y Modo **Hacker (`#0B0F17`)** con opción *Crimson Soft (Nocturno Pro)* en el Theme Studio.

---

## 🧩 Catálogo Completo (27 Componentes & Herramientas Instalables por CLI)

| ID en CLI (`ryukami-ui add <id>`) | Archivo Astro | Categoría | Descripción |
| :--- | :--- | :--- | :--- |
| `button` | `Button.astro` | `01_CORE_UI` | Botón mecánico con 5 variantes y clic Web Audio. |
| `badge` | `Badge.astro` | `01_CORE_UI` | Pastillas de estado y telemetría (`-2px 2px 0px`). |
| `card` | `Card.astro` | `01_CORE_UI` | Ventana de consola TUI interactiva con controles `[ - ][ □ ][ × ]`. |
| `kbd` | `Kbd.astro` | `01_CORE_UI` | Teclas físicas de atajos mecánicos (`[Ctrl] + [K]`). |
| `progress-bar` | `ProgressBar.astro` | `01_CORE_UI` | Barra de progreso segmentada BIOS con lectura ASCII `[████████░░░░]`. |
| `avatar` | `Avatar.astro` | `01_CORE_UI` | Identificador cuadrado de operador TUI con indicador de estado (`ONLINE`/`BUSY`/`IDLE`). |
| `skeleton` | `Skeleton.astro` | `01_CORE_UI` | Bloque de carga de búfer ASCII (`[ ░░░ SYNC ░░░ ]`) con `role="status"`. |
| `input` | `Input.astro` | `02_FORM_CONTROLS` | Input brutalista con prefijo de terminal (`$`, `tcp://`), hints y error. |
| `textarea` | `Textarea.astro` | `02_FORM_CONTROLS` | Editor multilínea de búfer UTF-8 con contador en vivo de líneas y bytes. |
| `select` | `Select.astro` | `02_FORM_CONTROLS` | Selector desplegable brutalista con prefijo `OPT //` e indicador mecánico. |
| `slider` | `Slider.astro` | `02_FORM_CONTROLS` | Slider de rango con barra ASCII `[====|----]` en vivo y pulso de audio. |
| `radio-group` | `RadioGroup.astro` | `02_FORM_CONTROLS` | Selector exclusivo de opciones con indicadores de terminal `( • )` y `(   )`. |
| `checkbox` | `Checkbox.astro` | `02_FORM_CONTROLS` | Casilla cuadrada con marca pixel-art `✕`. |
| `switch` | `Switch.astro` | `02_FORM_CONTROLS` | Interruptor táctil deslizante (`role="switch"`). |
| `tabs` | `Tabs.astro` | `03_LAYOUT_AND_MODALS` | Pestañas multipanel TUI con navegación por flechas (`←` / `→`). |
| `accordion` | `Accordion.astro` | `03_LAYOUT_AND_MODALS` | Acordeón exclusivo nativo con `<details name="...">` HTML5. |
| `breadcrumb` | `Breadcrumb.astro` | `03_LAYOUT_AND_MODALS` | Ruta de navegación estilo sistema de archivos Unix (`~/ryukami/core/nodes`). |
| `pagination` | `Pagination.astro` | `03_LAYOUT_AND_MODALS` | Barra de paginación mecánica TUI (`[ ◄ PREV ] [ 01 ] [ 02 ] [ NEXT ► ]`). |
| `popover` | `Popover.astro` | `03_LAYOUT_AND_MODALS` | Globo flotante de telemetría con API nativa `popover="auto"` Top-Layer sin JS. |
| `alert` | `Alert.astro` | `03_LAYOUT_AND_MODALS` | Callouts de sistema (`crimson`, `gold`, `cyan`, `emerald`). |
| `modal` | `Modal.astro` | `03_LAYOUT_AND_MODALS` | Diálogo HTML5 `<dialog closedby="any">` con light-dismiss. |
| `toast-container` | `ToastContainer.astro` | `03_LAYOUT_AND_MODALS` | Notificaciones flotantes con frecuencia acústica por severidad. |
| `command-palette` | `CommandPalette.astro` | `03_LAYOUT_AND_MODALS` | Paleta de comandos (`Ctrl+K`) con buscador en vivo (`deps: kbd`). |
| `terminal-emulator` | `TerminalEmulator.astro` | `04_SCORCH_STUDIO` | Consola interactiva en vivo (`0xSCORCH_SHELL`) con comandos (`neofetch`, `status`, `dragon`, `cli`, `theme`). |
| `component-preview` | `ComponentPreview.astro` | `04_SCORCH_STUDIO` | Visor `[ PREVIEW | CODE ]` con copia de CLI y código en 1 clic. |
| `theme-studio` | `ThemeStudio.astro` | `04_SCORCH_STUDIO` | Laboratorio en vivo de colores, sombras, dither y exportador CSS. |
| `ascii-generator` | `AsciiGenerator.astro` | `04_SCORCH_STUDIO` | Forja de banners ASCII 8-bit y emblema del Dragón Scorch. |

---

## 🚀 Desarrollo y Servidor Local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Regenerar el registro JSON estático (public/r/*.json)
pnpm registry:build

# 3. Servidor de desarrollo (http://localhost:4321)
pnpm dev

# 4. Compilar para producción (regenera el registro + genera dist/)
pnpm build

# 5. Previsualizar compilación de producción optimizada
pnpm preview --port 4321 --host

# 6. Previsualizar o desplegar en Cloudflare Pages con Wrangler
pnpm pages:dev      # Emulador local de Cloudflare Pages (puerto 8788)
pnpm pages:deploy   # Despliega ./dist a Cloudflare Pages (proyecto: ryukami-ui)
```

---

## ☁️ Despliegue en Cloudflare Pages (`wrangler`)

El repositorio incluye configuración lista para producción en [`wrangler.jsonc`](wrangler.jsonc) y cabeceras de seguridad/CORS/caché en [`public/_headers`](public/_headers) (que expone `/r/*.json` con `Access-Control-Allow-Origin: *` para que el CLI funcione desde tu dominio de Cloudflare Pages).

```bash
# 1. Autenticarse en Cloudflare (solo la primera vez)
npx wrangler login

# 2. Crear el proyecto en Cloudflare Pages (solo la primera vez)
npx wrangler pages project create ryukami-ui --production-branch=main

# 3. Compilar los 27 módulos + Astro y desplegar a producción
pnpm pages:deploy
```

---

## ⌨️ Atajos Globales en la Web

| Atajo | Acción |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Abrir / cerrar la **Command Palette** interactiva |
| `Ctrl + D` | Alternar entre **Modo Paper (Claro)** y **Modo Hacker (Oscuro)** |
| `←` / `→` | Cambiar pestañas activas en `Tabs.astro` |
| `↑` / `↓` / `Enter` | Navegar y ejecutar comandos dentro de la Command Palette |
| `Esc` | Cerrar cualquier modal, popover o paleta activa |

---

## 📁 Estructura del Proyecto

```text
ryukami-ui/
├── bin/
│   └── ryukami-ui.mjs          # Ejecutable CLI oficial (init, list, add, info)
├── scripts/
│   ├── build-registry.mjs      # Compilador estático de 27 módulos a public/r/*.json
│   └── scorch-ascii.py         # Convertidor Python de imágenes a arte ASCII Velgrynd
├── examples/
│   └── legacy-prototype.html   # Prototipo HTML estático inicial de referencia
├── public/
│   ├── _headers                # Cabeceras Cloudflare Pages (Seguridad, Cache Immutable y CORS /r/*)
│   ├── r/                      # 27 endpoints JSON del registro (registry.json, button.json, etc.)
│   └── scorch-dragon-banner.*  # Banners WebP responsivos (480w, 800w, 1376w)
├── src/
│   ├── components/             # 29 componentes Astro (.astro)
│   ├── layouts/
│   │   └── BaseLayout.astro    # Layout maestro, preload LCP y carga asíncrona de fuentes
│   ├── pages/
│   │   └── index.astro         # Showcase interactivo + 0xSCORCH_SHELL + Docs + Labs
│   └── styles/
│       └── global.css          # Tokens @theme de Tailwind v4 y utilidades brutalistas
├── AGENTS.md                   # Guía rápida de contexto y reglas para agentes IA
├── LICENSE                     # Licencia MIT oficial (Ryukami Labs)
├── astro.config.mjs            # Configuración Astro 7 (compressHTML, Vite 8)
├── wrangler.jsonc              # Configuración oficial de despliegue para Cloudflare Pages
└── package.json
```

---

## ⚖️ Licencia y Propiedad Intelectual

Distribuido bajo licencia **[MIT License](LICENSE)**.  
**Ryukami Labs** (*竜神 - Dios Dragón*) · *Velgrynd Tribute Edition* (homenaje artístico y estético de código abierto).
