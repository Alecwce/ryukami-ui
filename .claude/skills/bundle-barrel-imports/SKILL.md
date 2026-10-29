---
name: bundle-barrel-imports
description: Evita importar desde archivos de barril (barrel files) masivos para prevenir sobrecarga de módulos en Astro y Vite. Aplicar al estructurar importaciones de iconos o datos.
---

# Prevención de Barrel Files y Optimización de Paquetes

Los archivos de barril (`index.ts` que reexportan cientos de módulos) provocan que Vite y Rolldown tengan que parsear árboles masivos de dependencias, ralentizando el arranque en desarrollo y aumentando el tamaño final del bundle estático.

## 1. Importación Directa por Módulo

En lugar de reexportar todo desde un punto central:
```typescript
// ANTIPATRÓN: Carga el módulo entero con decenas de subrutinas
import { buttonProps, cardProps, modalProps } from '@/data/all-props';

// PATRÓN RECOMENDADO: Importa quirúrgicamente solo lo necesario
import { buttonProps } from '@/data/component-props.ts';
import { buttonSnippet } from '@/data/component-snippets.ts';
```

## 2. Componentes de Iconografía

En [`src/components/Icon.astro`](file:///home/alexwce/Documentos/a/ryukami-ui/src/components/Icon.astro), se utiliza un despachador `switch` tipado con SVGs internos vectoriales en vez de instalar paquetes masivos de miles de iconos (como `lucide-react` completo):

```astro
---
export interface Props {
  name: 'terminal' | 'copy' | 'check' | 'external' | 'chevron-down' | 'search';
  class?: string;
  size?: number;
}
const { name, class: className = '', size = 16 } = Astro.props;
---

{name === 'terminal' && (
  <svg class={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
)}
```

## Regla de Oro
- Mantén `0 KiB` de bibliotecas de iconos de terceros en runtime. Todo icono debe ser inline o despachado por `Icon.astro`.
