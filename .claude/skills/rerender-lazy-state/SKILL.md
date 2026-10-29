---
name: rerender-lazy-state
description: Inicialización perezosa de estados y accesos a localStorage para evitar ejecuciones repetitivas en el hilo principal del navegador.
---

# Inicialización Perezosa de Estado (Lazy State)

Operaciones sincrónicas como leer de `localStorage`, parsear JSON grande o inicializar un `AudioContext` de la Web Audio API no deben ejecutarse en la fase inicial de carga ni en cada renderizado.

## 1. Antipatrón vs Patrón Recomendado

```typescript
// ANTIPATRÓN: Lee y parsea localStorage en cada ciclo
const [historial, setHistorial] = useState(
  JSON.parse(localStorage.getItem('ryukami-historial') || '[]')
);

// PATRÓN RECOMENDADO: Inicializador perezoso (solo se ejecuta 1 vez)
const [historial, setHistorial] = useState(() => {
  try {
    const raw = localStorage.getItem('ryukami-historial');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
});
```

## 2. Inicialización de AudioContext Bajo Interacción del Usuario

Los navegadores modernos bloquean la reproducción de audio hasta que el usuario interactúa con la página. Ryukami-UI inicializa el `AudioContext` únicamente tras el primer clic o pulsación:

```typescript
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}
```
