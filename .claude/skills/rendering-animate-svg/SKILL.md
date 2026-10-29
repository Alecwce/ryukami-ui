---
name: rendering-animate-svg
description: Envoltorio de elementos SVG animados en divs para forzar la aceleración por GPU y prevenir caídas de FPS en animaciones retro.
---

# Aceleración por Hardware de Gráficos SVG (Animate SVG)

Animar directamente atributos de un elemento `<svg>` (como `transform` o rotación) puede provocar que ciertos motores de navegador recalculen el rasterizado vectorial en la CPU en cada fotograma.

## 1. Antipatrón vs Patrón Recomendado

```astro
<!-- ANTIPATRÓN: Animar directamente el SVG vectorial -->
<svg class="animate-spin text-scorch-crimson" viewBox="0 0 24 24">
  ...
</svg>

<!-- PATRÓN RECOMENDADO: Envolver el SVG en un contenedor div acelerado por GPU -->
<div class="inline-block animate-spin" style="contain: layout paint;">
  <svg class="w-4 h-4 text-scorch-crimson" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    ...
  </svg>
</div>
```

## 2. Componente Canónico: Icon.astro

En Ryukami-UI, todos los iconos se despachan a través de [`src/components/Icon.astro`](file:///home/alexwce/Documentos/a/ryukami-ui/src/components/Icon.astro), el cual normaliza dimensiones (`size`), trazo (`stroke-width="2"`) y atributos de accesibilidad (`aria-hidden="true"`).
