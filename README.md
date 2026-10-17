# 🐉 Ryukami-UI (Scorch Dragon Edition)

> **Retro TUI & Neo-Brutalism Component Library for modern Astro, Next.js & Web apps.**  
> Inspired by Velgrynd Scorch lore, 8-bit CRT monitors, and raw engineering aesthetics.

![Ryukami Scorch Dragon Banner](public/scorch-dragon-banner.jpg)

---

## ⚡ Stack Tecnológico de Vanguardia

- **Framework:** [Astro 7.4.0](https://astro.build) (Motor Rolldown + Vite 8, compilación estática en ~1.1s).
- **Estilos:** [Tailwind CSS 4.3.3](https://tailwindcss.com) (Arquitectura `@import "tailwindcss";`, `@theme` en CSS puro y `@custom-variant dark`).
- **Tipado:** [TypeScript 7.0.2](https://www.typescriptlang.org) (Modo estricto nativo).
- **Audio:** Web Audio API nativo (síntesis procedural de clics mecánicos sin assets externos).

---

## ⚡ Filosofía de Diseño

1. **Neo-Brutalismo Puro:** Bordes rígidos de 2px, esquinas cuadradas (`border-radius: 0px`) y sombras sólidas hacia la izquierda-abajo (`-4px 4px 0px`).
2. **Terminal Retro TUI:** Marcos de ventana con cabecera de consola (`[ _ ][ □ ][ × ]`), tablas de datos ASCII y fuentes pixel-art.
3. **Mascota & Mitología Ryukami Scorch (Velgrynd Tribute):** Dragón oriental carmesí cuyas escamas se sombrean mediante código ASCII, combinando rojo carmesí (`#E63946`), cian eléctrico (`#4DA3FF`) y oro dragón (`#F4D35E`).
4. **Física Táctil con Web Audio API:** Clics mecánicos sintetizados en tiempo real sin cargar archivos MP3.

---

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
cd ryukami-ui
pnpm install
```

### 2. Modo de Desarrollo Local

```bash
pnpm dev
```
Abre tu navegador en `http://localhost:4321`.

### 3. Compilar para Producción

```bash
pnpm build
```

---

## 📦 Componentes Incluidos

- 🔘 **Button (`<Button variant="crimson|cyan|gold|dark|outline">`):** Botón mecánico con sonido de click táctil.
- 🏷️ **Badge (`<Badge variant="...">`):** Pastillas de estado y etiquetas de tecnologías.
- 🪟 **Card (`<Card title="..." status="...">`):** Ventana de consola TUI con controles retro.
- 📊 **Table:** Tabla de datos estilo salida ASCII de terminal.
- ⌨️ **Kbd (`<Kbd>`):** Teclas físicas de atajos de teclado.

---

## ⚖️ Licencia y Propiedad Intelectual

Distribuido bajo licencia **MIT License**.  
*Velgrynd Tribute Edition:* Homenaje y tributo visual libre de copyright directo, articulado bajo la marca original **Ryukami Labs**.
