---
name: fumadocs-component-docs
description: Patrón de documentación de componentes con vista previa interactiva, selector multi-framework y tabla tipada de propiedades. Adaptado de Fumadocs para el motor de documentación de Ryukami-UI.
---

# Documentación de Componentes (Fumadocs -> Ryukami Docs)

En lugar de depender de librerías externas de documentación como Fumadocs o Nextra, Ryukami-UI implementa un motor nativo en [`src/pages/docs/components/[slug].astro`](file:///home/alexwce/Documentos/a/ryukami-ui/src/pages/docs/components/[slug].astro).

## 1. Estructura de Cada Ficha de Componente

Toda página de documentación debe incluir:
1. **Encabezado TUI:** Nombre del componente, descripción, badge de categoría y comando de instalación CLI rápido (`npx ryukami-ui add <id>`).
2. **ComponentPreview:**
   - Modo `PREVIEW`: Renderizado real interactivo.
   - Modo `CODE`: Selector de framework (`ASTRO`, `REACT (TSX)`, `HTML / TAILWIND`) con botón de copiado rápido y retroalimentación sonora Web Audio.
   - Modo `PROPS`: Tabla HTML semántica con las props disponibles, tipos TypeScript y valores por defecto.
3. **Instalación Manual & CLI:** Explicación del comando y de dependencias registradas.

## 2. Definición Tipada de Props

Para documentar las propiedades, añádelas en [`src/data/component-props.ts`](file:///home/alexwce/Documentos/a/ryukami-ui/src/data/component-props.ts):

```typescript
export const miComponenteProps: PropItem[] = [
  {
    name: 'variant',
    type: "'crimson' | 'gold' | 'cyan' | 'default'",
    default: "'default'",
    description: 'Variante cromática del componente según los tokens Scorch.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Escala geométrica del elemento.',
  },
];
```
