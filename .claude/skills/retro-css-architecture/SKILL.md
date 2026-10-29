---
name: retro-css-architecture
description: Arquitectura de estilos Scorch v4.1 con Tailwind CSS v4, variables @theme, fuentes WOFF2 100% locales y contrastes calibrados WCAG AA.
---

# Arquitectura CSS Retro (Scorch Design System v4.1)

Ryukami-UI implementa una arquitectura CSS-first impulsada por **Tailwind CSS 4.3.3** (`@tailwindcss/vite`), eliminando archivos JS legados de configuración y organizando los tokens en [`src/styles/global.css`](file:///home/alexwce/Documentos/a/ryukami-ui/src/styles/global.css).

## 1. Fuentes Tipográficas 100% Auto-Alojadas

A diferencia de librerías que realizan peticiones inseguras en runtime a Google Fonts, Ryukami-UI sirve sus fuentes en formato WOFF2 optimizado directamente desde `/public/fonts/`:

```css
@font-face {
  font-family: 'Press Start 2P';
  src: url('/fonts/PressStart2P-Regular.woff2') format('woff2');
  font-display: swap;
  font-weight: 400;
}
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Regular.woff2') format('woff2');
  font-display: swap;
  font-weight: 400;
}
```

## 2. Definición de Tokens con `@theme` en Tailwind CSS v4

En `src/styles/global.css`:
```css
@import "tailwindcss";

@theme {
  --color-scorch-crimson: #D62436;
  --color-scorch-gold: #F4D35E;
  --color-scorch-cyan: #4DA3FF;
  --color-scorch-dark: #0B0F17;
  --color-scorch-paper: #F5F7FA;

  --font-display: 'Press Start 2P', monospace;
  --font-mono: 'JetBrains Mono', monospace;

  --shadow-brutal: -4px 4px 0px 0px var(--shadow-color, #000000);
  --shadow-brutal-sm: -2px 2px 0px 0px var(--shadow-color, #000000);
  --ease-mechanical: cubic-bezier(0.23, 1, 0.32, 1);
}
```

## 3. Renderizado Nítido de Píxeles (`pixelated`)

Para sprites, imágenes y canvas:
```css
.pixelated {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
```

## 4. Calibración de Contraste WCAG AA (>= 4.5:1)

El tono carmesí principal `#D62436` ha sido matemáticamente calibrado para ofrecer un ratio de contraste de **5.04:1** frente a texto blanco `#FFFFFF`, garantizando accesibilidad total.
