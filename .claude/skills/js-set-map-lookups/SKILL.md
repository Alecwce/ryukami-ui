---
name: js-set-map-lookups
description: Uso de Set y Map para búsquedas de pertenencia en tiempo constante O(1) en lugar de array.includes() en rutas críticas.
---

# Búsquedas O(1) con Set y Map

Cuando se verifica pertenencia sobre listas de elementos (por ejemplo, validar si un slug pertenece a los 35 componentes del registro o comprobar dependencias), `Array.prototype.includes()` tiene complejidad lineal $O(n)$. Al escalar a múltiples comprobaciones, esto degrada la velocidad de respuesta.

## 1. Antipatrón vs Patrón Recomendado

```typescript
// ANTIPATRÓN: Búsqueda lineal O(n) por cada comprobación
const validSlugs = ['button', 'card', 'modal', /* ... 35 items */];
function isValidComponent(slug: string): boolean {
  return validSlugs.includes(slug);
}

// PATRÓN RECOMENDADO: Búsqueda O(1) con Set
const VALID_SLUGS_SET = new Set([
  'button', 'badge', 'card', 'kbd', 'progress-bar',
  // ... resto de los 35 módulos
]);

function isValidComponent(slug: string): boolean {
  return VALID_SLUGS_SET.has(slug);
}
```

## 2. Agrupación y Mapeo con Map

Para relacionar metadatos o cachés de componentes:
```typescript
const COMPONENT_LOOKUP = new Map(
  REGISTRY_COMPONENTS.map(c => [c.slug, c])
);

// Acceso instantáneo en O(1)
const buttonData = COMPONENT_LOOKUP.get('button');
```
