---
name: js-early-exit
description: Uso estricto de cláusulas de guardia y retornos tempranos (early returns) para reducir anidamiento y coste computacional en TypeScript.
---

# Retornos Tempranos y Cláusulas de Guardia (Early Exit)

Reduce la complejidad ciclomática de las funciones comprobando primero las condiciones de fallo o casos base y retornando de inmediato.

## 1. Antipatrón vs Patrón Recomendado

```typescript
// ANTIPATRÓN: Código en escalera con indentación profunda
function procesarPayload(data: unknown) {
  if (data) {
    if (typeof data === 'object') {
      if ('id' in data) {
        return (data as any).id;
      }
    }
  }
  return null;
}

// PATRÓN RECOMENDADO: Cláusulas de guardia planas
function procesarPayload(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }
  if (!('id' in data)) {
    return null;
  }
  return String((data as any).id);
}
```

## 2. Aplicación en Handlers de Eventos

En componentes interactivos del cliente:
```typescript
function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return;
  if (!isModalOpen) return;

  cerrarModal();
}
```
