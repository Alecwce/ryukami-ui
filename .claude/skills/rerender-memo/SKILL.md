---
name: rerender-memo
description: Memoización estratégica de cálculos costosos y almacenamiento en caché de nodos DOM en componentes de alto rendimiento.
---

# Memoización Estratégica (Rerender Memo)

Evita recalcular operaciones pesadas como la generación de tramas dither, filtrado sobre tablas de datos grandes o búsquedas difusas en paletas de comandos cuando las entradas no han cambiado.

## 1. Antipatrón vs Patrón Recomendado

```typescript
// ANTIPATRÓN: Filtra 1,000 filas en cada evento de entrada del usuario
function filtrarComponentes(termino: string) {
  return CATALOGO_COMPLETO.filter(c => c.name.includes(termino));
}

// PATRÓN RECOMENDADO: Caché indexada en memoria
const busquedaCache = new Map<string, typeof CATALOGO_COMPLETO>();

function buscarConCache(termino: string) {
  const normalizado = termino.trim().toLowerCase();
  if (busquedaCache.has(normalizado)) {
    return busquedaCache.get(normalizado)!;
  }
  const resultado = CATALOGO_COMPLETO.filter(c =>
    c.name.toLowerCase().includes(normalizado) || c.description.toLowerCase().includes(normalizado)
  );
  busquedaCache.set(normalizado, resultado);
  return resultado;
}
```

## 2. Nodos de Audio en Web Audio API

En [`AudioSynth.astro`](file:///home/alexwce/Documentos/a/ryukami-ui/src/components/AudioSynth.astro), los buffers acústicos y sintetizadores procedurales se memorizan para evitar instanciar osciladores repetidos en cada interacción de clic.
