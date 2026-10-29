---
name: shadcn-ui-conventions
description: Convenciones de componentes, variantes y arquitectura de distribución open-code adaptadas de shadcn/ui para el ecosistema Ryukami-UI y su CLI.
---

# Convenciones de Componentes y Distribución (shadcn -> Ryukami-UI)

Ryukami-UI sigue el modelo de código abierto de componentes de `shadcn/ui`, pero optimizado para el ecosistema de **Astro 7**, **Tailwind CSS v4** y **TypeScript 7**.

## 1. Comparativa de Filosofía

| Concepto | shadcn/ui clásico | Ryukami-UI (Scorch v4.1) |
| :--- | :--- | :--- |
| **Instalador** | `npx shadcn@latest add <component>` | `npx ryukami-ui add <component>` |
| **Framework Base** | React / Next.js | **Astro 7** (con soporte React, Vue y HTML) |
| **Bordes** | Redondeados (`rounded-md`, `rounded-lg`) | **Cero Redondeo (`border-radius: 0px`)** |
| **Sombras** | Sombras difuminadas borrosas (`blur > 0`) | **Sombras duras abajo-izquierda (`-4px 4px 0px 0px`)** |
| **Audio** | Silencioso | **Síntesis Web Audio API procedural** |
| **Servidor MCP** | No disponible nativamente | **Servidor MCP nativo (`ryukami-ui mcp`)** |

## 2. Convención de Variantes Estándar

Todos los componentes reutilizables deben soportar las siguientes variantes semánticas:
- `default`: Blanco y negro puro de alto contraste con sombra dura.
- `crimson`: Carmesí Scorch (`#D62436`) para acciones primarias o críticas.
- `gold`: Oro Scorch (`#F4D35E`) para advertencias y llamadas a la acción secundarias.
- `cyan`: Cian Eléctrico (`#4DA3FF`) para enlaces técnicos y telemetría de red.

## 3. Controles de Ventana TUI

Las tarjetas y modales deben incluir la botonera geométrica de 3 controles de ventana:
- Minimizar: `[ - ]`
- Maximizar: `[ □ ]`
- Cerrar: `[ × ]`
Construidos como cajas cuadradas de 20x20px (`w-5 h-5 border border-current`) con atributos `aria-label`.
