---
name: js-hoist-regexp
description: Elevación obligatoria de expresiones regulares a nivel de módulo para evitar recompilaciones en bucles o funciones frecuentes.
---

# Elevación de Expresiones Regulares (RegExp Hoisting)

Crear una expresión regular literal o mediante `new RegExp()` dentro del cuerpo de una función provoca que el motor V8 de Node.js o el navegador tenga que recompilar el patrón en cada invocación, degradando el rendimiento en tareas repetitivas o bucles de renderizado.

## 1. Antipatrón vs Patrón Recomendado

```typescript
// ANTIPATRÓN: Recompila la RegExp en cada iteración del bucle o llamada
function validarColor(hex: string): boolean {
  const COLOR_REGEX = /^#[0-9a-fA-F]{3,8}$/;
  return COLOR_REGEX.test(hex);
}

// PATRÓN RECOMENDADO: Elevada al ámbito del módulo (compilada una sola vez)
const COLOR_REGEX = /^#[0-9a-fA-F]{3,8}$/;
const OFFSET_REGEX = /^-?\d+px$/;

function validarColor(hex: string): boolean {
  return COLOR_REGEX.test(hex);
}
```

## 2. Aplicación en Ryukami-UI

Este patrón está implementado estrictamente en:
- `ThemeStudio.astro` (validación de inyección CSS).
- `tests/security.test.ts` (verificación de seguridad contra ataques XSS).
- `bin/ryukami-ui.mjs` (normalización de rutas).
