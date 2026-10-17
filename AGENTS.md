# AGENTS.md — Ryukami-UI (Scorch Design System)

Guía directa para agentes de IA que editen o amplíen este repositorio.

## 1. Stack & Comandos
- **Stack:** Astro `7.4.0` + Tailwind CSS `4.3.3` (`@tailwindcss/vite`) + TypeScript `7.0.2`.
- **Gestor de paquetes:** `pnpm`
- **Comandos del Proyecto:**
  - `pnpm dev` — Regenera `public/r/*.json` e inicia servidor en `http://localhost:4321`
  - `pnpm build` — Regenera `public/r/*.json` y compila producción estática en `dist/`
  - `pnpm registry:build` — Ejecuta `scripts/build-registry.mjs` para actualizar los endpoints JSON del CLI
  - `pnpm preview --port 4321 --host` — Servidor de producción local
- **Comandos del CLI (`bin/ryukami-ui.mjs` / `ryukami-ui`):**
  - `ryukami-ui list` — Lista los 14 componentes del registro
  - `ryukami-ui init --dir <ruta>` — Inyecta `src/styles/global.css` y `ryukami.json`
  - `ryukami-ui add <comp...> --dir <ruta>` — Instala componentes y resuelve `registryDependencies`

## 2. Reglas Inviolables de Diseño (Scorch v4.1)
1. **Cero Bordes Redondeados:** Nunca uses `rounded-*`. Todo componente lleva esquinas rectas (`border-radius: 0px`) y bordes sólidos de `2px` (`border-2 border-black dark:border-scorch-crimson`).
2. **Sombras Duras Abajo-Izquierda:**
   - Estándar: `shadow-brutal` (`-4px 4px 0px 0px var(--shadow-color)`)
   - Pequeña (badges/teclas): `shadow-brutal-sm` (`-2px 2px 0px 0px var(--shadow-color)`)
   - Prohibido usar sombras difuminadas (`blur > 0`).
3. **Controles Geométricos de Ventana (`[ - ][ □ ][ × ]`):**
   - Usa cajas cuadradas de `20x20px` (`w-5 h-5 inline-flex items-center justify-center border border-current`) con formas CSS/SVG centradas en vez de caracteres de texto sueltos `_` o `□`.
4. **Animaciones Aceleradas por GPU:**
   - En elementos interactivos usa `transition: transform 75ms ease-out` (o `transition-transform duration-75`).
   - Evita `transition-all` para no disparar advertencias de *non-composited animations* en Lighthouse.
5. **Accesibilidad (WCAG AA ≥ 4.5:1):**
   - El token carmesí principal es `#D62436` (`--scorch-red` / `--color-scorch-crimson`), calibrado para superar **5.04:1** de contraste con texto blanco `#FFFFFF`.
   - Mantén el orden secuencial de encabezados (`h1` → `h2` → `h3`) sin saltar niveles.
   - Todo botón de solo icono o selector de color debe incluir `aria-label`.

## 3. Convenciones de Componentes y Registro (`src/components/*.astro`)
- Define siempre `export interface Props` en el frontmatter de cada componente `.astro`.
- Si creas un nuevo componente reutilizable en `src/components/`, regístralo en `scripts/build-registry.mjs` y ejecuta `pnpm registry:build` para publicar su JSON en `public/r/<nombre>.json`.
- Para modales o paletas flotantes usa `<dialog closedby="any">` nativo con `overscroll-behavior: contain`.
- Helpers globales en el cliente:
  - `window.showToast(title, message, variant, duration)`
  - `window.playMechanicalClick()` / `window.playTerminalBeep(freq, duration)`
