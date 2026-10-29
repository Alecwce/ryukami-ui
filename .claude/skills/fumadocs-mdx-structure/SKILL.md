---
name: fumadocs-mdx-structure
description: Estructuración de páginas de documentación y metadatos frontmatter adaptados para Ryukami-UI y compatibles con callouts de Obsidian.
---

# Estructura de Documentación y Callouts (Obsidian Bridge)

Define el estándar para redactar contenido documental que sea 100% interoperable entre la web pública de Ryukami-UI y la bóveda de Obsidian.

## 1. Callouts Canónicos Compatibles

Utiliza el componente [`Callout.astro`](file:///home/alexwce/Documentos/a/ryukami-ui/src/components/Callout.astro) para alertas documentales estructuradas:

- `[!dragon]`: Hitos de alto rango tecnológico, anuncios mayores o arquitectura central.
- `[!scorch]`: Reglas estrictas de diseño, paleta carmesí y contrastes WCAG AA.
- `[!terminal]`: Comandos de terminal, shell TUI y variables de entorno.
- `[!tui]`: Interacción con teclado, atajos y navegación WAI-ARIA.
- `[!summary]`: Resúmenes ejecutivos y especificaciones de componentes.

Ejemplo en Markdown / Astro:
```markdown
> [!scorch] REGLA INVIOLABLE
> Nunca utilices bordes redondeados (rounded-*). Todo componente debe mantener border-radius: 0px.
```

## 2. Metadatos de Navegación

Toda sección documental se indexa en [`src/layouts/DocsLayout.astro`](file:///home/alexwce/Documentos/a/ryukami-ui/src/layouts/DocsLayout.astro) con su `SidebarNav` correspondiente.
