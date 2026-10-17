# 🐉 Ryukami-UI (Scorch Dragon // Velgrynd Tribute Edition)

> **Retro TUI & Neo-Brutalist Component Library for Astro 7, Tailwind CSS v4 & Modern Web Apps.**  
> Inspired by oriental dragon lore, 8-bit CRT terminals, and raw mechanical engineering aesthetics.

![Ryukami Scorch Dragon Banner](public/scorch-dragon-banner.webp)

---

## ⚡ Stack Tecnológico & Rendimiento (Lighthouse 100/100)

| Capa | Tecnología | Detalles Técnicos |
| :--- | :--- | :--- |
| **Framework** | [Astro 7.4.0](https://astro.build) | Motor **Vite 8 + Rolldown**, HTML comprimido y **0 KiB de bundles JS externos**. |
| **Estilos** | [Tailwind CSS 4.3.3](https://tailwindcss.com) | Configuración CSS-first (`@import "tailwindcss";`, `@theme`, `@custom-variant dark`). |
| **Tipado** | [TypeScript 7.0.2](https://www.typescriptlang.org) | Interfaces estrictas (`interface Props`) en todos los componentes. |
| **Audio** | **Web Audio API** | Síntesis procedural en tiempo real de clics mecánicos y alertas sin archivos `.mp3`. |
| **Auditoría** | **Lighthouse 100/100** | **100** Performance · **100** Accessibility (WCAG AA) · **100** Best Practices · **100** SEO. |

---

## 🏛️ Reglas de Diseño (Scorch Design System v4.1)

1. **Neo-Brutalismo Puro (`0px` Radius):** Bordes sólidos de `2px`, esquinas de `0px` y sombras duras hacia abajo-izquierda (`-4px 4px 0px 0px`).
2. **Física Táctil acelerada por GPU:** Transiciones exclusivas en `transform: translate(-2px, 2px)` (`75ms ease-out`) para evitar repintados de CPU.
3. **Contraste Calibrado WCAG AA:** Carmesí Scorch (`#D62436`, ratio **5.04:1** sobre blanco), Cian Eléctrico (`#4DA3FF`) y Oro Dragón (`#F4D35E`).
4. **Doble Tema Nativo:** Modo **Paper (`#F5F7FA`)** de alto contraste diurno y Modo **Hacker (`#0B0F17`)** con opción *Crimson Soft (Nocturno Pro)* en el Theme Studio.

---

## 🧩 Catálogo Completo (14 Componentes & Herramientas)

### Núcleo TUI & Primitivos
- **`Button.astro`** — Botón mecánico con variantes `crimson | cyan | gold | dark | outline`, tamaños `sm | md | lg` y clic Web Audio.
- **`Badge.astro`** — Etiquetas de estado y telemetría con sombra dura de `-2px 2px 0px`.
- **`Card.astro`** — Ventana de consola TUI con barra de título, estado en vivo y controles `[ _ ][ □ ][ × ]`.
- **`Table.astro`** — Tabla de datos estilo salida ASCII de terminal con cabeceras de alto contraste.
- **`Kbd.astro`** — Teclas físicas de atajos mecánicos (`[Ctrl] + [K]`).
- **`ComponentPreview.astro`** — Visor interactivo con pestañas `[ PREVIEW | CODE ]` y copiado en 1 clic.

### Controles de Formulario & Feedback
- **`Input.astro`** — Input brutalista con prefijo de consola (`$`, `tcp://`), textos de ayuda y estado de error.
- **`Checkbox.astro`** — Casilla de verificación cuadrada con marca pixel-art `✕`.
- **`Switch.astro`** — Interruptor táctil deslizante (`role="switch"`) con variantes `crimson | cyan | gold`.
- **`Alert.astro`** — Callouts de sistema con 4 niveles de severidad (`crimson`, `gold`, `cyan`, `emerald`).

### Sistemas Interactivos & Laboratorios
- **`CommandPalette.astro`** — Paleta de comandos global (`Ctrl+K` / `Cmd+K`) con `<dialog closedby="any">`, filtro en vivo y navegación por teclado (`↑`, `↓`, `Enter`, `Esc`).
- **`ToastContainer.astro`** — Motor de notificaciones flotantes (`window.showToast(...)`) con frecuencias acústicas por severidad (`420Hz`, `660Hz`, `880Hz`, `1040Hz`).
- **`Modal.astro`** — Diálogo modal HTML5 nativo con light-dismiss y `overscroll-behavior: contain`.
- **`ThemeStudio.astro`** — Laboratorio en vivo para personalizar núcleos de color, profundidad de sombras (`-2px`, `-4px`, `-8px`), densidad Halftone y exportar el `:root` CSS.
- **`AsciiGenerator.astro`** — Forja de banners ASCII 8-bit y emblema del Dragón Scorch con 4 texturas de escamas (`█▓▒`, `0xAF`, `@#%`, `竜炎神`).
- **`SidebarNav.astro`** — Navegación lateral fija categorizada estilo `8bitcn.com` / `shadcn`.

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
pnpm install

# 2. Servidor de desarrollo (http://localhost:4321)
pnpm dev

# 3. Compilar para producción (genera dist/)
pnpm build

# 4. Previsualizar compilación de producción optimizada
pnpm preview --port 4321 --host
```

---

## ⌨️ Atajos Globales en la Web

| Atajo | Acción |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Abrir / cerrar la **Command Palette** interactiva |
| `Ctrl + D` | Alternar entre **Modo Paper (Claro)** y **Modo Hacker (Oscuro)** |
| `↑` / `↓` / `Enter` | Navegar y ejecutar comandos dentro de la Command Palette |
| `Esc` | Cerrar cualquier modal o paleta activa |

---

## 📁 Estructura del Proyecto

```text
ryukami-ui/
├── public/                     # Banners WebP responsivos (480w, 800w, 1376w)
├── src/
│   ├── components/             # 14 componentes Astro (.astro)
│   ├── layouts/
│   │   └── BaseLayout.astro    # Layout maestro, preload LCP y carga asíncrona de fuentes
│   ├── pages/
│   │   └── index.astro         # Showcase interactivo + Docs + Labs
│   └── styles/
│       └── global.css          # Tokens @theme de Tailwind v4 y utilidades brutalistas
├── AGENTS.md                   # Guía rápida de contexto y reglas para agentes IA
├── astro.config.mjs            # Configuración Astro 7 (compressHTML, Vite 8)
└── package.json
```

---

## ⚖️ Licencia y Propiedad Intelectual

Distribuido bajo licencia **MIT License**.  
**Ryukami Labs** (*竜神 - Dios Dragón*) · *Velgrynd Tribute Edition* (homenaje artístico y estético de código abierto).
