---
name: component-wrapper-architecture
description: Arquitectura de envoltura, interfaces estrictas Props y polimorfismo seguro para componentes reutilizables en Astro. Aplicar al crear nuevos componentes en src/components/.
---

# Arquitectura de Envoltura de Componentes (.astro)

Define la estructura canónica para cualquier componente reutilizable en Ryukami-UI bajo las reglas del Scorch Design System.

## 1. Frontmatter Obligatorio

Todo componente debe declarar su interfaz `export interface Props`:

```astro
---
// src/components/NuevoComponente.astro
export interface Props {
  variant?: 'crimson' | 'gold' | 'cyan' | 'default';
  size?: 'sm' | 'md' | 'lg';
  class?: string;
  id?: string;
  [key: string]: any;
}

const {
  variant = 'default',
  size = 'md',
  class: className = '',
  id,
  ...rest
} = Astro.props;
---
```

## 2. Polimorfismo Seguro (Elemento Dinámico)

Para botones que pueden actuar como enlaces `<a>` o botones nativos `<button>` sin duplicar código:

```astro
---
const Tag = Astro.props.href ? 'a' : 'button';
---

<Tag
  href={Astro.props.href}
  class={`btn-brutal ${className}`}
  {...rest}
>
  <slot />
</Tag>
```

## 3. Composición con Slots

Utiliza `<slot />` por defecto y slots nombrados (`<slot name="prefix" />`, `<slot name="suffix" />`) para máxima extensibilidad de los componentes hijos sin añadir props booleanos innecesarios.
