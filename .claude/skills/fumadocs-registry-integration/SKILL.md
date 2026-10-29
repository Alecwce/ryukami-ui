---
name: fumadocs-registry-integration
description: Conexión entre los endpoints JSON de public/r/ y las vistas previas de la documentación. Adaptado de Fumadocs para el registro de Ryukami-UI.
---

# Integración del Registro Open-Code con la Documentación

Garantiza que la documentación web y el instalador CLI compartan exactamente la misma fuente de verdad para el código y las dependencias.

## 1. Fuente Única de Verdad

Todos los módulos del catálogo se declaran en [`src/data/registry.ts`](file:///home/alexwce/Documentos/a/ryukami-ui/src/data/registry.ts):
```typescript
export interface RegistryComponent {
  slug: string;
  name: string;
  title: string;
  category: '01_CORE_UI' | '02_FORM_CONTROLS' | '03_LAYOUT_AND_MODALS' | '04_SCORCH_STUDIO';
  description: string;
  propsDoc?: PropItem[];
  codeSnippet: string;
  status: string;
  cli: string;
  registryDependencies: string[];
}
```

## 2. Flujo de Compilación y Publicación
1. Al ejecutar `pnpm registry:build` (o `node scripts/build-registry.ts`), se leen los componentes y estilos.
2. Se generan automáticamente los archivos JSON en `public/r/<slug>.json` y el índice maestro `public/r/registry.json` con su hash SHA-256.
3. La documentación en [`src/pages/docs/components/[slug].astro`](file:///home/alexwce/Documentos/a/ryukami-ui/src/pages/docs/components/[slug].astro) genera rutas estáticas para los 35 módulos a partir de este registro central.
