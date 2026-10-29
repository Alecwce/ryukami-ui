---
name: 8bit-docs-patterns
description: Estándares de documentación técnica con terminología retro, telemetría de consola y ejemplos interactivos. Aplicar al redactar guías y especificaciones de componentes.
---

# Patrones de Documentación Retro TUI (8-Bit Docs)

Establece el estándar para documentar módulos del sistema utilizando vocabulario industrial, telemetría de consola y arquitectura multi-pestaña.

## 1. Convención de Títulos y Prefijos TUI

Todo documento técnico de componente o bloque debe iniciar con descriptores de nodo:
- Prefijo de módulo: `// 0xCOMPONENT_NAME`
- Estado de registro: `[STATUS: PRODUCTION READY]` o `[VERSION: v2.4.0]`
- Dependencias explícitas: `[DEPS: badge, icon]`

Ejemplo de encabezado de documentación:
```markdown
# Button // 0xBUTTON_MODULE

> [STATUS: 5 VARIANTS] · [REGISTRY: button] · [DEPS: none]
> Botón mecánico brutalista con polimorfismo seguro (button / a) y síntesis Web Audio.
```

## 2. Bloque Multi-Pestaña de Código

La documentación debe presentar tres modos de visualización:
1. `PREVIEW`: Render en vivo del componente.
2. `CODE`: Código fuente con soporte multi-framework (`ASTRO`, `REACT (TSX)`, `HTML / TAILWIND`).
3. `PROPS`: Tabla exhaustiva de propiedades tipadas (`name`, `type`, `default`, `description`).

## 3. Terminología y Cero Emojis

Usa glifos ASCII en lugar de emojis en tablas y estados:
- Correcto: `[OK]`, `[FAIL]`, `[INFO]`, `[WARN]`, `[+]`, `[-]`, `[>]`
- Prohibido: Cualquier carácter unicode del rango emoji.
