---
name: rendering-conditional-render
description: Uso de operadores ternarios explícitos o comprobaciones booleanas estrictas para evitar renderizar ceros falsos (0) o strings vacíos en JSX y Astro.
---

# Renderizado Condicional Seguro (Conditional Render)

En JSX y plantillas de Astro, el uso del operador `&&` con valores numéricos o strings puede provocar que un valor falsy (como el número `0` o una cadena vacía `""`) se imprima literalmente en el HTML final.

## 1. Antipatrón vs Patrón Recomendado

```astro
<!-- ANTIPATRÓN: Si badgeCount es 0, imprime "0" en el DOM -->
<div class="header">
  {badgeCount && <span class="badge">{badgeCount}</span>}
</div>

<!-- PATRÓN RECOMENDADO: Comprobación booleana explícita -->
<div class="header">
  {badgeCount > 0 ? (
    <span class="badge">{badgeCount}</span>
  ) : null}
</div>
```

## 2. Slots Opcionales en Astro

En componentes `.astro`:
```astro
---
const hasFooter = Astro.slots.has('footer');
---

<div class="card-body">
  <slot />
</div>

{hasFooter && (
  <div class="card-footer border-t-2 border-black p-2">
    <slot name="footer" />
  </div>
)}
```
