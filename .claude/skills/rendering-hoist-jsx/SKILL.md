---
name: rendering-hoist-jsx
description: Extracción de elementos estáticos fuera de funciones de renderizado para evitar recolección de basura innecesaria y mejorar el rendimiento de la interfaz.
---

# Elevación de Elementos Estáticos (Hoist JSX / HTML)

Los fragmentos estáticos de HTML o plantillas que no dependen de props o estados no deben recrearse repetidamente en cada render o ciclo de hidratación.

## 1. Antipatrón vs Patrón Recomendado

```typescript
// ANTIPATRÓN: Crea un nuevo array de objetos y closures en cada ejecución
function TerminalWindow() {
  return (
    <div>
      <div className="window-controls">
        {['-', '□', '×'].map(icon => (
          <span key={icon} className="btn-win">{icon}</span>
        ))}
      </div>
    </div>
  );
}

// PATRÓN RECOMENDADO: Constante estática elevada al ámbito del módulo
const WINDOW_CONTROLS = ['-', '□', '×'] as const;

function TerminalWindow() {
  return (
    <div>
      <div className="window-controls">
        {WINDOW_CONTROLS.map(icon => (
          <span key={icon} className="btn-win">{icon}</span>
        ))}
      </div>
    </div>
  );
}
```

## 2. Aplicación en Astro

En plantillas de Astro, las cabeceras repetitivas y las plantillas de tarjetas se definen en el frontmatter del componente para que el compilador las transforme en HTML estático inmutable.
