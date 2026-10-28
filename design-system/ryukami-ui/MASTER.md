# Design System Master File — Ryukami-UI (Scorch v4.1)

> **LOGIC:** Este archivo define la verdad canónica del sistema de diseño **Scorch Dragon // Velgrynd Edition v4.1**, sincronizado con `src/styles/global.css`, `/r/tokens.json` y la bóveda de Obsidian `ryukami-labs`.

---

**Project:** Ryukami-UI (`v2.4.0` — 35 Modules)
**Updated:** 2026-10-28
**Category:** Neo-Brutalist & Retro TUI Component Library + CLI & MCP Server
**Design Dials:** Variance 9/10 (Tactical / Mechanical) | Density 8/10 (Console / Dashboard)

---

## Global Rules (5 Reglas Inviolables)

1. **Zero Border Radius (`border-radius: 0px`):** Prohibido usar `rounded-*`. Toda tarjeta, botón, input, modal o badge es estrictamente rectangular con bordes sólidos de `2px` (`border-2 border-black`).
2. **Bottom-Left Hard Shadows (`0px` Blur):**
   - Estándar (`.tui-window`, `.btn-brutal`): `-4px 4px 0px 0px var(--shadow-color)`
   - Pequeña (`Badge`, `Kbd`, `Tooltip`): `-2px 2px 0px 0px var(--shadow-color)`
   - Hover: `transform: translate(2px, -2px); box-shadow: -6px 6px 0px 0px var(--shadow-color)`
   - Active: `transform: translate(-4px, 4px); box-shadow: 0px 0px 0px 0px var(--shadow-color)`
3. **Typography Stack (Self-Hosted WOFF2 in `/public/fonts/`):**
   - Display H1 (`.title-8bit`): `'Press Start 2P', 'VT323', monospace`
   - Subtitles H2 (`.subtitle-pixel`): `'Tiny5', 'VT323', monospace` (`letter-spacing: 0.14em`)
   - Body & Code: `'JetBrains Mono', monospace`
4. **WCAG AA Calibrated Palette (≥ 4.5:1):**
   - Scorch Crimson (`--color-scorch-crimson` / `--scorch-red`): `#D62436` (Ratio **5.04:1** sobre `#FFFFFF`)
   - Scale Dark Red (`--color-scorch-dark`): `#9B1B30`
   - Whisker Cyan (`--color-scorch-cyan`): `#4DA3FF` (`#0369A1` / `text-sky-700` para texto sobre blanco)
   - Eye Gold (`--color-scorch-gold`): `#F4D35E` (`#B45309` / `text-amber-800` para texto sobre blanco)
5. **Dual Theme Identity:**
   - **Light (Paper Brutalism):** Canvas `#F5F7FA`, Surface `#FFFFFF`, Header `#0A0E14`, Shadow `#000000`
   - **Dark (Hacker CRT):** Canvas `#0B0F17`, Surface `#111827`, Header `#D62436`, Shadow `#D62436`

---

## Pre-Delivery Checklist

- [x] Zero `rounded-*` classes (`border-radius: 0px` everywhere)
- [x] Hard bottom-left shadows (`-4px 4px 0px 0px`) with zero blur
- [x] Geometric `20x20px` window controls `[ - ][ □ ][ × ]` with `aria-label`
- [x] GPU composited transitions (`transform 75ms cubic-bezier(0.23, 1, 0.32, 1)`)
- [x] Light & Dark mode contrast ≥ 4.5:1 (WCAG AA)
- [x] `prefers-reduced-motion` respected
- [x] Responsive without horizontal scroll at 375px, 768px, 1024px, 1440px
