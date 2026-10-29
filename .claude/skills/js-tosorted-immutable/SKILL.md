---
name: js-tosorted-immutable
description: Uso de toSorted() en lugar de sort() para evitar la mutación destructiva de arrays en estados y props de TypeScript.
---

# Inmutabilidad en Ordenamientos con toSorted()

El método nativo `Array.prototype.sort()` muta el array original in-place. Si el array proviene de una propiedad (`props`), de una constante global (`REGISTRY_COMPONENTS`) o de un estado compartido, mutarlo provoca efectos secundarios impredecibles y bugs difíciles de rastrear.

## 1. Antipatrón vs Patrón Recomendado

```typescript
// ANTIPATRÓN: Muta destructivamente el array original
const listaOriginal = [...componentes];
listaOriginal.sort((a, b) => a.name.localeCompare(b.name));

// PATRÓN RECOMENDADO: ECMAScript moderno inmutable
const listaOrdenada = componentes.toSorted((a, b) => a.name.localeCompare(b.name));
```

## 2. Aplicación en Componentes de Tabla de Datos

En [`DataTable.astro`](file:///home/alexwce/Documentos/a/ryukami-ui/src/components/DataTable.astro):
```typescript
// Ordena los datos de la fila sin alterar los datos originales
const filasOrdenadas = filas.toSorted((a, b) => {
  const valA = a[columnaActual] ?? '';
  const valB = b[columnaActual] ?? '';
  return direccion === 'asc'
    ? String(valA).localeCompare(String(valB))
    : String(valB).localeCompare(String(valA));
});
```
