<div align="center">

# ryukami/ui

<p><strong>Componentes retro TUI y neo-brutalistas listos para copiar y pegar en tus proyectos.<br>Gratis. Código abierto. Creado con Astro 7, Tailwind CSS v4 y TypeScript.</strong></p>

<a href="https://ryukami-ui.pages.dev">
  <img alt="Ryukami-UI Scorch Design System" src="./public/scorch-dragon-banner.webp" width="100%">
</a>

<p>
  <a href="https://github.com/Alecwce/ryukami-ui/actions"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/Alecwce/ryukami-ui/ci.yml?branch=main&label=CI&color=D62436"></a>
  <a href="https://github.com/Alecwce/ryukami-ui/releases"><img alt="Version" src="https://img.shields.io/badge/version-v2.4.0-101414.svg?color=D62436"></a>
  <a href="https://ryukami-ui.pages.dev"><img alt="Lighthouse" src="https://img.shields.io/badge/Lighthouse-96%20%7C%20100%20%7C%20100%20%7C%20100-34D399.svg"></a>
  <a href="https://www.npmjs.com/package/ryukami-ui"><img alt="NPM CLI" src="https://img.shields.io/badge/cli-npx%20ryukami--ui-4DA3FF.svg"></a>
  <a href="./LICENSE"><img alt="Licencia" src="https://img.shields.io/badge/licencia-MIT-F4D35E.svg"></a>
</p>

<p>
  <a href="https://ryukami-ui.pages.dev/docs"><strong>Documentación</strong></a> ·
  <a href="https://ryukami-ui.pages.dev/docs/components"><strong>Componentes</strong></a> ·
  <a href="https://ryukami-ui.pages.dev/blocks"><strong>Bloques</strong></a> ·
  <a href="https://ryukami-ui.pages.dev/themes"><strong>Temas</strong></a> ·
  <a href="https://ryukami-ui.pages.dev/docs/cli"><strong>CLI</strong></a> ·
  <a href="https://ryukami-ui.pages.dev/docs/mcp"><strong>MCP</strong></a> ·
  <a href="https://ryukami-ui.pages.dev/r/registry.json"><strong>Registro JSON</strong></a>
</p>

</div>

---

## Inicio Rápido (CLI)

No necesitas clonar el repositorio. Puedes inicializar e instalar componentes directamente en cualquier proyecto de Astro o Tailwind CSS v4 con el CLI oficial:

### 1. Inicializar configuración y tokens de diseño

```bash
npx ryukami-ui init
```

> Agrega `--obsidian` si deseas exportar también `design-tokens.json` en formato estándar W3C.

### 2. Instalar componentes

```bash
# Instalar componentes individuales
npx ryukami-ui add button card callout data-table

# O instalar el catálogo completo de 35 componentes
npx ryukami-ui add --all
```

---

## Ejemplo de Uso

Una vez instalado el componente, impórtalo directamente en tus archivos `.astro` o utilízalo con el equivalente de tu framework preferido:

```astro
---
import Button from '../components/Button.astro';
import Card from '../components/Card.astro';
---

<Card title="0xTERMINAL // SCORCH_OS" variant="default">
  <p class="text-sm text-slate-700 dark:text-slate-300 mb-4">
    Sistema de diseño Neo-Brutalista con bordes rectos y sombras duras.
  </p>
  
  <Button variant="crimson" size="md">
    [ INICIAR_SISTEMA ]
  </Button>
</Card>
```

---

## Servidor MCP para Agentes de IA

Ryukami-UI incluye un servidor nativo de **Model Context Protocol (MCP)** sobre `stdio` para asistentes de codificación como Claude, Cursor o Antigravity:

```bash
npx ryukami-ui mcp
```

Herramientas expuestas para agentes:
- `list_components`: Consulta los 35 módulos y sus metadatos técnicos.
- `get_component`: Obtiene el código fuente íntegro verificado con SHA-256.
- `get_design_tokens`: Retorna la paleta de tokens W3C Scorch v4.1.

---

## Catálogo de Componentes (35 Módulos)

| Categoría | Componentes Disponibles |
| :--- | :--- |
| **01 Core UI** | `button`, `badge`, `card`, `kbd`, `progress-bar`, `avatar`, `skeleton`, `stat-card`, `tooltip` |
| **02 Controles de Formulario** | `input`, `textarea`, `select`, `slider`, `radio-group`, `checkbox`, `switch` |
| **03 Disposición y Modales** | `tabs`, `accordion`, `breadcrumb`, `pagination`, `popover`, `alert`, `callout`, `modal`, `drawer`, `toast-container`, `command-palette`, `bento-grid` |
| **04 Laboratorio Scorch** | `data-table`, `code-block`, `audio-synth`, `terminal-emulator`, `component-preview`, `theme-studio`, `ascii-generator` |

---

## Reglas de Diseño Inviolables (Scorch v4.1)

- **Cero bordes redondeados:** Todo elemento utiliza `border-radius: 0px` y bordes sólidos de `2px`.
- **Sombras duras abajo-izquierda:** Desplazamiento fijo de `-4px 4px 0px 0px` sin desenfoque (`blur: 0px`).
- **Controles geométricos de ventana:** Cajas cuadradas centradas `[ - ][ □ ][ × ]`.
- **Física mecánica:** Transiciones directas aceleradas por GPU (`75ms`).
- **Accesibilidad WCAG AA:** Ratio de contraste calibrado superior a 4.5:1 (Carmesí `#D62436` = 5.04:1).

---

## Licencia

Distribuido bajo la licencia [MIT](LICENSE). Código libre para uso personal y comercial.  
Desarrollado por **Ryukami Labs** (Alecwce).
