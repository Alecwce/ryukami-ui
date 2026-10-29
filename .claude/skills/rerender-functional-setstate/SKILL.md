---
name: rerender-functional-setstate
description: Uso de actualizaciones de estado funcionales (prev => next) para evitar cierres obsoletos (stale closures) en listeners de eventos y animaciones.
---

# Actualizaciones de Estado Funcionales (Functional setState)

Cuando el estado siguiente depende directamente del estado anterior (como un contador de puntuación en un juego arcade o el toggle de un modal), leer la variable de estado directamente dentro de un callback asíncrono puede provocar cierres obsoletos si múltiples eventos se disparan en rápida sucesión.

## 1. Antipatrón vs Patrón Recomendado

```typescript
// ANTIPATRÓN: Lee el valor del closure que puede estar desactualizado
function onDisparoLaser() {
  setPuntuacion(puntuacion + 100);
}

// PATRÓN RECOMENDADO: Forma funcional atómica
function onDisparoLaser() {
  setPuntuacion(prevScore => prevScore + 100);
}
```

## 2. Aplicación en Componentes Vanilla JS de Astro

En los scripts cliente de componentes como [`ArcadeGame.astro`](file:///home/alexwce/Documentos/a/ryukami-ui/src/components/ArcadeGame.astro) o [`TerminalEmulator.astro`](file:///home/alexwce/Documentos/a/ryukami-ui/src/components/TerminalEmulator.astro), utiliza mutaciones atómicas o despachadores de eventos personalizados:

```typescript
// Despacho de telemetría desacoplada
window.dispatchEvent(new CustomEvent('ryukami:score-update', {
  detail: { delta: 100 }
}));
```
