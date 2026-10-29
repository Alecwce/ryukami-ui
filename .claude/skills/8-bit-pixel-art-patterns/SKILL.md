---
name: 8-bit-pixel-art-patterns
description: Crea bordes dentados pixelados, sombras escalonadas y efectos retro para componentes 8-bit bajo Scorch v4.1. Aplicar al construir componentes que requieran estética pixel art auténtica con cero bordes redondeados.
---

# Patrones de Pixel Art y Bordes 8-Bit (Scorch v4.1)

Genera bordes pixelados y sombras escalonadas de estilo retro utilizando divs posicionados de forma absoluta o la utilidad CSS `clip-path` `.pixel-corners`. Estos patrones son clave para componentes con estética de arcade o consola clásica.

## 1. Patrón de Bordes Pixelados mediante 9 Divs

Para crear un botón o tarjeta con esquinas dentadas de 8-bit sin usar imágenes externas:

```astro
---
// PixelButton.astro
export interface Props {
  variant?: 'crimson' | 'gold' | 'cyan' | 'default';
  class?: string;
}
const { variant = 'crimson', class: className = '' } = Astro.props;
---

<div class={`relative inline-block font-mono select-none ${className}`}>
  <!-- Contenedor Base con Cero Bordes Redondeados -->
  <button class="relative z-10 px-4 py-2 bg-black text-white font-extrabold uppercase text-xs tracking-wider border-2 border-black active:translate-x-0.5 active:translate-y-0.5 transition-transform">
    <slot />
  </button>

  <!-- Píxeles de Esquina (3x3 px) -->
  <div class="absolute -top-1 -left-1 w-1.5 h-1.5 bg-black dark:bg-scorch-crimson" aria-hidden="true"></div>
  <div class="absolute -top-1 -right-1 w-1.5 h-1.5 bg-black dark:bg-scorch-crimson" aria-hidden="true"></div>
  <div class="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-black dark:bg-scorch-crimson" aria-hidden="true"></div>
  <div class="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-black dark:bg-scorch-crimson" aria-hidden="true"></div>

  <!-- Segmentos de Borde Escalonado -->
  <div class="absolute -top-1.5 left-2 right-2 h-1 bg-black dark:bg-scorch-crimson" aria-hidden="true"></div>
  <div class="absolute -bottom-1.5 left-2 right-2 h-1 bg-black dark:bg-scorch-crimson" aria-hidden="true"></div>
  <div class="absolute top-2 bottom-2 -left-1.5 w-1 bg-black dark:bg-scorch-crimson" aria-hidden="true"></div>
  <div class="absolute top-2 bottom-2 -right-1.5 w-1 bg-black dark:bg-scorch-crimson" aria-hidden="true"></div>
</div>
```

## 2. Utilidad CSS Moderna: `.pixel-corners`

En `src/styles/global.css`, Ryukami-UI incluye el corte geométrico poligonal que no requiere divs adicionales:

```css
.pixel-corners {
  clip-path: polygon(
    0 4px, 4px 4px, 4px 0,
    calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px,
    100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%,
    4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px)
  );
}
```

## 3. Sombra Dura Abajo-Izquierda (Regla Scorch)

A diferencia de las sombras difuminadas, los componentes retro usan un desplazamiento duro sin desenfoque (`blur: 0px`):

```css
/* Estándar Scorch v4.1 */
box-shadow: -4px 4px 0px 0px var(--shadow-color, #000000);

/* Reducido para Badges y Teclas Kbd */
box-shadow: -2px 2px 0px 0px var(--shadow-color, #000000);
```

## Reglas Inviolables
1. **Cero Bordes Redondeados:** Nunca uses `rounded-*` en componentes pixel art.
2. **Medidas Fijas en Píxeles:** Usa múltiplos enteros (`1.5px`, `3px`, `4px`) para conservar la rejilla de píxeles.
3. **Alto Contraste WCAG AA:** Los bordes oscuros en modo claro contrastan contra fondos `#F5F7FA`, y en modo oscuro contra `#0B0F17`.
