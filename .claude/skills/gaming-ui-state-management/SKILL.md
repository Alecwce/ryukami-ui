---
name: gaming-ui-state-management
description: Patrones de interfaz y telemetría para interfaces de videojuegos RPG y tableros retro (HP, Mana, XP, boss health y alertas LEVEL UP!).
---

# Gestión de Estado y Telemetría Gamer (Gaming UI)

Permite construir interfaces visuales inspiradas en videojuegos clásicos (RPG y arcades de 8-bit) integradas con los componentes brutalistas de Scorch.

## 1. Código Cromático de Telemetría Gamer

- **Vida / Salud (HP):** Carmesí Scorch (`#D62436`). Representa integridad crítica de sistema o energía vital.
- **Maná / Energía (MP):** Cian Eléctrico (`#4DA3FF`). Representa recursos de cálculo o magia técnica.
- **Experiencia / Progreso (XP):** Oro Scorch (`#F4D35E`). Representa avance de nivel o compilación.
- **Resistencia / Estamina (STA):** Esmeralda (`#34D399`). Representa latencia o estabilidad.

## 2. Patrón de Barra Gamer con Alerta de Nivel

Ejemplo de uso extendido de `ProgressBar.astro`:

```astro
---
import ProgressBar from '@/components/ProgressBar.astro';
---

<!-- Barra de Salud (HP) -->
<ProgressBar
  label="VIDA [HP]"
  value={850}
  max={1000}
  variant="crimson"
  status="VITAL: OK"
/>

<!-- Barra de Maná (MP) -->
<ProgressBar
  label="ENERGÍA [MP]"
  value={320}
  max={500}
  variant="cyan"
  status="RECARGA: 12/s"
/>

<!-- Barra de Experiencia con Alerta LEVEL UP! -->
<ProgressBar
  label="EXPERIENCIA [XP]"
  value={100}
  max={100}
  variant="gold"
  status="NIVEL 42"
/>
```

## 3. Alerta Parpadeante Arcade (`LEVEL UP!`)

Cuando una métrica alcanza el 100%, se activa la animación por pasos sin interpolación difuminada:

```html
<div class="inline-block bg-black text-scorch-gold border-2 border-scorch-gold px-2 py-0.5 font-extrabold text-[10px] animate-pixel-blink">
  [ ! ] LEVEL UP!
</div>
```
