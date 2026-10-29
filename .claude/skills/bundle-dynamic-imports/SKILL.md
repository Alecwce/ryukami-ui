---
name: bundle-dynamic-imports
description: Directivas de hidratación perezosa y carga dinámica en Astro para mantener 0 KiB de JavaScript inicial en el cliente. Aplicar a componentes interactivos pesados.
---

# Carga Dinámica e Hidratación Perezosa en Astro

Astro genera HTML estático puro por defecto. Para componentes interactivos pesados (como consolas interactivas, paletas de comandos o el juego arcade), se deben utilizar directivas de hidratación selectiva para no penalizar el First Contentful Paint (FCP).

## 1. Directivas de Hidratación en Astro

- **`client:load`**: Solo para componentes que deben interactuar inmediatamente en el encabezado (ej. selector de tema, audio switcher).
- **`client:idle`**: Se hidrata cuando el navegador termina la carga inicial del hilo principal. Ideal para barras de búsqueda o paletas de comandos.
- **`client:visible`**: Se hidrata únicamente cuando el componente entra en el viewport del usuario mediante Intersection Observer (ideal para terminales y estudios en vivo situados abajo en la página).
- **`client:media="(min-width: 768px)"`**: Solo hidrata en dispositivos de pantalla grande.

## 2. Importaciones Dinámicas para Scripts en Navegador

Si un script cliente requiere una biblioteca grande o un módulo auxiliar, cargarlo dinámicamente bajo demanda:

```typescript
// En scripts cliente de Astro
async function ejecutarAccionCompleja() {
  const { procesarMatrizDither } = await import('@/utils/dither.ts');
  procesarMatrizDither();
}
```

## Beneficio Auditado
- Mantiene el bundle inicial en **36 KiB** y la puntuación de Lighthouse Performance en **96+**.
