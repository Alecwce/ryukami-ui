---
name: registry-component-patterns
description: Patrones de registro de componentes en scripts/build-registry.ts y esquema JSON de distribución en public/r/. Aplicar al añadir nuevos componentes a la librería.
---

# Patrones del Registro Open-Code (Registry Patterns)

Ryukami-UI funciona bajo el modelo de registro abierto inspirado en `shadcn/ui` y `8bitcn.com`. Los componentes no se instalan como cajas negras en `node_modules`, sino que el código fuente se compila a endpoints JSON estáticos para que el CLI los inyecte directamente en `src/components/`.

## 1. Declaración de un Nuevo Componente

Para registrar un componente, añádelo al array `ITEMS` en [`scripts/build-registry.ts`](file:///home/alexwce/Documentos/a/ryukami-ui/scripts/build-registry.ts):

```typescript
{
  name: 'nombre-componente',
  title: 'Título Visual',
  category: '01_CORE_UI', // o '02_FORM_CONTROLS' | '03_LAYOUT_AND_MODALS' | '04_SCORCH_STUDIO'
  description: 'Descripción precisa de una línea.',
  file: 'src/components/NombreComponente.astro',
  registryDependencies: ['badge', 'button'], // Dependencias opcionales
}
```

## 2. Esquema JSON Compilado (`public/r/<name>.json`)

El compilador genera un JSON con la siguiente estructura:
```json
{
  "name": "button",
  "type": "registry:component",
  "title": "Button",
  "category": "01_CORE_UI",
  "description": "Botón mecánico Neo-Brutalista con 5 variantes.",
  "files": [
    {
      "path": "src/components/Button.astro",
      "type": "registry:component",
      "content": "--- ... --- <button> ...",
      "sha256": "4a7b9c..."
    }
  ],
  "registryDependencies": []
}
```

## 3. Verificación de Integridad SHA-256

Cada archivo incluye su firma criptográfica `sha256`. El comando `ryukami-ui diff` audita cualquier modificación local comparando el hash calculado frente al hash oficial del registro.
