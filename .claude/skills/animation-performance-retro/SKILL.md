---
name: animation-performance-retro
description: Optimiza animaciones retro y pixel art para evitar penalizaciones en Lighthouse. Aplicar al crear transiciones mecánicas, efectos de parpadeo arcade o barras de progreso animadas.
---

# Rendimiento de Animaciones Retro (Scorch v4.1)

Asegura animaciones mecánicas a 60 FPS aceleradas por hardware sin provocar avisos de animaciones no compuestas en Lighthouse ni repintados costosos del árbol de renderizado.

## 1. Animaciones Aceleradas por GPU

**Propiedades recomendadas:**
- `transform` (`translate`, `scale`): compositing directo en GPU.
- `opacity`: sin recálculo de geometría de layout.

**Propiedades prohibidas en animaciones continuas:**
- `width`, `height`, `top`, `left`, `margin`, `padding`: disparan layout y recalculo de estilos en el hilo principal.

Ejemplo de interacción mecánica Scorch:
```css
/* Transición física de pulsación mecánica */
.btn-mechanical {
  transition: transform 75ms cubic-bezier(0.23, 1, 0.32, 1);
}
.btn-mechanical:hover {
  transform: translate(2px, -2px);
}
.btn-mechanical:active {
  transform: translate(-4px, 4px);
}
```

## 2. Parpadeo de Texto por Pasos (`step-end`)

Para recrear el parpadeo de texto de las máquinas recreativas arcade de los años 80 sin interpolación suave ni borrosidad:

```css
@keyframes pixel-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.animate-pixel-blink {
  animation: pixel-blink 0.5s step-end infinite;
}
```

## 3. Aislamiento de Capas para Canvas y SVGs

Los componentes interactivos pesados (como `ArcadeGame.astro` o gráficos vectoriales complejos) deben contenerse en capas aisladas:
```css
.retro-canvas-layer {
  contain: layout paint;
  will-change: transform;
}
```
