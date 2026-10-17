# AGENTS.md — Ryukami-UI (Scorch Design System)

Guía directa para agentes de IA que editen o amplíen este repositorio.

## 1. Stack & Comandos
- **Stack:** Astro `7.4.0` + Tailwind CSS `4.3.3` (`@tailwindcss/vite`) + TypeScript `7.0.2`.
- **Gestor de paquetes:** `pnpm`
- **Comandos:**
  - `pnpm dev` — Servidor de desarrollo en `http://localhost:4321`
  - `pnpm build` — Compilación estática de producción en `dist/`
  - `pnpm preview --port 4321 --host` — Servidor de producción local

## 2. Reglas Inviolables de Diseño (Scorch v4.1)
1. **Cero Bordes Redondeados:** Nunca uses `rounded-*`. Todo componente lleva esquinas rectas (`border-radius: 0px`) y bordes sólidos de `2px` (`border-2 border-black dark:border-scorch-crimson`).
2. **Sombras Duras Abajo-Izquierda:**
   - Estándar: `shadow-brutal` (`-4px 4px 0px 0px var(--shadow-color)`)
   - Pequeña (badges/teclas): `shadow-brutal-sm` (`-2px 2px 0px 0px var(--shadow-color)`)
   - Prohibido usar sombras difuminadas (`blur > 0`).
3. **Animaciones Aceleradas por GPU:**
   - En elementos interactivos usa `transition: transform 75ms ease-out` (o `transition-transform duration-75`).
   - Evita `transition-all` para no disparar advertencias de *non-composited animations* en Lighthouse.
4. **Accesibilidad (WCAG AA ≥ 4.5:1):**
   - El token carmesí principal es `#D62436` (`--scorch-red` / `--color-scorch-crimson`), calibrado para superar **5.04:1** de contraste con texto blanco `#FFFFFF`.
   - Mantén el orden secuencial de encabezados (`h1` → `h2` → `h3`) sin saltar niveles.
   - Todo botón de solo icono o selector de color debe incluir `aria-label`.

## 3. Convenciones de Componentes (`src/components/*.astro`)
- Define siempre `export interface Props` en el frontmatter de cada componente `.astro`.
- Para modales o paletas flotantes usa `<dialog closedby="any">` nativo con `overscroll-behavior: contain`.
- Para disparar notificaciones o sonidos usa los helpers globales expuestos en el cliente:
  - `window.showToast(title, message, variant, duration)`
  - `window.playScorchClick()`
- No instales librerías pesadas de UI en cliente (React/Vue) si puede resolverse con Astro + HTML5 nativo + Vanilla JS ligero.
