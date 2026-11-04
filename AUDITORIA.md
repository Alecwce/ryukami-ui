# Auditoría técnica — Ryukami-UI v2.4.0

**Fecha:** 2026-11-02 · **Alcance:** código fuente completo (`bin/`, `scripts/`, `src/`, `public/`, CI, configs)
**Método:** lectura estática + verificación ejecutada (build, tests, CLI end-to-end, PoC de seguridad, inspección del CSS compilado y del HTML generado).
**Modo:** solo lectura. No se modificó ningún archivo del proyecto (el único cambio en el árbol es `public/r/registry.json`, que ya venía modificado y solo difiere en `updatedAt`).

---

## Veredicto

| Área | Estado | Nota |
| :--- | :--- | :--- |
| Build y tests | ✅ Sano | 43 páginas en 3.1 s; 13/13 tests en 213 ms |
| Identidad visual (Scorch v4.1) | ⚠️ Cumple lo grueso, falla en detalle | 0 `rounded-*`, 0 sombras con blur, 0 `transition-all`; pero 67 bordes `dark:border-slate-*` y un bug de cascada |
| Seguridad del CLI | 🔴 Crítico | Escritura arbitraria vía symlink y "verificación" SHA-256 autorreferencial |
| Integridad del registro | 🔴 Crítico | 8 de 35 componentes se instalan **rotos** (imports no resueltos) |
| Accesibilidad | 🟡 Aceptable | Base sólida (skip-link, focus-visible, aria-labels); falla en formularios, `<main>` duplicado y contraste secundario |
| Performance | 🟡 Aceptable | Todo liviano **excepto la home**: 5 882 nodos DOM y 727 KB de HTML |
| SEO | 🔴 Roto | `canonical` apunta a la portada en **todas** las páginas |
| Tooling/CI | 🟡 Incompleto | Sin typecheck real, sin lint, sin gate de calidad de diseño |

**Resumen:** el proyecto está por encima de la media en ejecución y coherencia visual, pero tiene **tres fallos de credibilidad** que hay que cerrar antes de promocionarlo: (1) el CLI puede escribir fuera del proyecto, (2) el registro publica componentes que no compilan al instalarse, y (3) cada página se declara canónica de sí misma contra la portada. Los tres son arreglables en días, no semanas.

---

## Estado de correcciones

Los cuatro P0 fueron corregidos y verificados.

| # | Hallazgo | Cambio aplicado | Verificación |
| :--- | :--- | :--- | :--- |
| P0-1 | Escritura arbitraria vía symlink | `writeRegistryFile()` en [bin/ryukami-ui.mjs](bin/ryukami-ui.mjs): `realpath` del directorio destino dentro del proyecto, rechazo de destinos symlink y apertura con `O_NOFOLLOW` | PoC repetida → aborta con `[SECURITY ALERT]`, exit 1, archivo externo intacto. 4 tests en `[SEC-04]` |
| P0-2 | Integridad SHA-256 opcional/autoreferencial | `verifyFileIntegrity()` fail-closed (exige 64 hex) y anclaje del hash primario contra `registry.json`, un payload distinto | 4 tests en `[SEC-05]`: sin hash, hash inválido, hash que no cuadra con el maestro, caso válido |
| P0-3 | 8 de 35 componentes rotos al instalar | `icon` publicado (oculto del catálogo), `registryDependencies` reales, datos de `command-palette`/`component-preview` empaquetados, error si falta una dependencia y **validación de imports en el build del registro** | `add --all` instala 36 módulos y resuelve todos los imports; 6 tests en `[REG-01]`/`[REG-02]` |
| P0-4 | Canonical fijo a la portada | `site` en [astro.config.ts](astro.config.ts), canonical/`og:url`/`twitter:url` por ruta en [BaseLayout.astro](src/layouts/BaseLayout.astro), `noindex` en el 404 | 43 páginas con canonical propio; `/404/` con `robots: noindex, follow` |

---

## Estado de correcciones — Fase 1

| Bloque | Cambio | Verificación |
| :--- | :--- | :--- |
| **Registro remoto** | Solo HTTPS (HTTP únicamente en loopback), `redirect: 'error'`, timeout de 10 s, cap de 5 MB en streaming, `Content-Type` obligatorio, caché por proceso | `--registry http://example.com` → exit 2; tests `[CLI-01]` |
| **Nombres** | `assertValidComponentName()` en `info`, `add` y MCP: `/^[a-z0-9][a-z0-9-]{0,63}$/` + pertenencia al catálogo | `info ../../package` → exit 2; MCP → `-32602` |
| **Integridad** | Manifiesto `integrity` (hash de los 41 archivos publicados) en `registry.json`; el CLI ancla **cada** archivo a él, no solo el principal | Payload manipulado con hash interno recalculado → `[INTEGRITY ERROR]`, exit 3 |
| **MCP** | JSON-RPC 2.0 completo: `-32700`, `-32600`, `-32601`, `-32602`; batches; notificaciones sin respuesta; cap de 1 MiB por mensaje; cola serializada | 11 tests en `[MCP-01]`/`[MCP-02]` |
| **CLI UX** | `--version`, `--json`, códigos de salida 0/1/2/3/4, backup `.bak-<ts>` al sobrescribir, escritura atómica (`tmp` + `rename` + `fsync`), `--dir` con valor obligatorio | 8 tests en `[CLI-01]`/`[CLI-02]` |
| **diff** | Exit code 1 ante deriva o archivos ausentes; salida JSON | `diff` en proyecto vacío → 1; catálogo íntegro → 0 |
| **Cascada CSS** | `.btn-brutal`, `.tui-window` y utilidades canónicas movidas a `@layer components`; sombras arbitrarias tokenizadas a `shadow-brutal*` (19 archivos) | CSS compilado: `.tui-window` ∈ `components`, `shadow-brutal-xl` ∈ `utilities` |

Tests totales: **46** (21 seguridad · 6 registro/E2E · 11 MCP · 8 CLI).

Queda pendiente de Fase 1: **manifiesto firmado** (Sigstore/minisign) — requiere claves y secreto de CI — y la **allowlist de hosts**, que hoy se sustituye por HTTPS obligatorio para no romper registros self-hosted.

## Estado de correcciones — Fase 2

| Bloque | Cambio | Verificación |
| :--- | :--- | :--- |
| **Gate de diseño** | `scripts/lint-design.ts` convierte AGENTS.md en reglas ejecutables: `rounded-*`, `shadow-[…]`, `blur>0`, `transition-all`, `<dialog>` sin `closedby`, `export interface Props`, `border-radius≠0`. En CI vía `pnpm lint:design` + `tests/design.test.ts` | 0 errores; ratchet de advertencias en 161 |
| **Reset global** | `*{border-radius:0}` en `@layer base`, scrollbars cuadradas, thumb de `<input type=range>` nativo, `backdrop-filter: blur(2px)` eliminado | CSS compilado: 0 `blur(2px)`, 11 declaraciones `border-radius:0` |
| **Home** | Los paneles de código de `ComponentPreview` pasan de 3×línea (div+2 spans) a gutter `<pre>` + `<pre>`; se elimina una copia completa del snippet del botón | **5 882 → 2 603 nodos (−56 %)** · 727 KB → 421 KB · gzip 82 → 61 KB |
| **A11y** | `<main>` único en docs (era 2), TOC solo con anclas reales (`#props` eliminado), logo y «volver arriba» sin anclas muertas, `aria-describedby`/`aria-invalid` en Input/Textarea/Select/Checkbox, `*` de required `aria-hidden` | `grep '<main'` = 1 por página; tests + build |
| **SEO** | JSON-LD `SoftwareApplication` en la portada, `prefetch` activado, sitemap generado post-build desde `dist/` (42 URLs con barra final, igual que el canonical) | `dist/sitemap.xml` regenerado; `@astrojs/sitemap` innecesario |
| **Sombras de acento** | Utilidades `@utility shadow-accent-{current,cyan,crimson}`: cero `shadow-[…]` arbitrarias en el repo | `grep shadow-\[` = 0 |

Pendiente de Fase 2 (justificado): **CSP estricta** (requiere eliminar los 25 `onclick` inline primero), **Lighthouse CI** (no hay navegador headless en el entorno), **fuente única de variantes** y **home < 2 000 nodos** (exige recortar el número de demos en vivo, decisión de producto).

## Estado de correcciones — Fase 3 (CSP-safe)

| Bloque | Cambio | Verificación |
| :--- | :--- | :--- |
| **Manejadores inline** | 24 `onclick`/`onchange`/`onsubmit` eliminados. Header, portada, fichas de componente y bloques usan `data-action` con un despachador único en [BaseLayout.astro](src/layouts/BaseLayout.astro); `Drawer`, `Select`, `RadioGroup`, `CtaBlock` y `LoginBlock` llevan su propio listener con guarda `data-*-bound` para seguir siendo autocontenidos al instalarlos con el CLI | `grep 'onclick=' dist/**/*.html` solo aparece dentro de ejemplos escapados en `<pre>` |
| **Regla DS-10** | El lint falla si vuelve a aparecer un `on…=` inline (excepción documentada: la prop `onclick` de `Button`, que es API pública) | `pnpm lint:design` → 0 errores |
| **CSP** | `Content-Security-Policy-Report-Only` en [public/_headers](public/_headers) (observación sin bloqueo) con `default-src 'self'`, `script-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'` | Cabecera presente en `dist/_headers` |
| **Deploy workflow** | El step de Cloudflare leía `env.CLOUDFLARE_API_TOKEN` definido en el propio step (siempre vacío en `if:` → nunca desplegaba). Movido a `env` de job; etiquetas «27 Modules» y «Node 22» corregidas | Revisión del YAML + check de secrets |

**Para activar la CSP en modo bloqueo** falta generar hashes de los 17 `<script is:inline>` en post-build y renombrar la cabecera. Se dejó en Report-Only a propósito: sin navegador headless no se puede verificar que ningún script quede bloqueado, y una CSP mal calibrada rompe toda la interactividad del sitio.

---

## 1. Lo que está bien (verificado, no asumido)

- **Sin ejecución de comandos:** no hay `child_process`, `exec`, `spawn`, `eval` ni `new Function` en `bin/`. Cero superficie de inyección de shell.
- **Validador léxico correcto:** `resolveSafeTargetPath` bloquea `../`, absolutas POSIX, backslashes Windows, `.`/`..`, vacío y no-string.
- **`add` valida contra el maestro:** `add ../../evil` falla con exit 1 sin tocar disco. (Ese mismo patrón falta en `info` y en el MCP.)
- **Colisiones por defecto:** sin `--overwrite` los archivos existentes se omiten y el resumen informa instalados/omitidos.
- **MCP no contamina stdout:** banners y logs van por stderr; cada respuesta es una línea JSON; las notificaciones sin `id` no reciben respuesta.
- **Reglas visuales duras respetadas en los componentes:** 0 usos de `rounded-*` (solo `rounded-none`), 0 sombras con blur, 0 `transition-all` en los 39 `.astro`, los 3 `<dialog>` con `closedby="any"`. (Sí hay 2 `transition-all` en páginas/datos: ver P2-37.)
- **Accesibilidad base por encima de lo habitual:** skip-link, `:focus-visible` global, `aria-label` en todos los botones de ventana `[ - ][ □ ][ × ]`, `prefers-reduced-motion` en [global.css:295](src/styles/global.css#L295), `lang="es"` y descripción por página.
- **Headers de seguridad en Cloudflare:** HSTS, `X-Frame-Options: DENY`, COOP, `nosniff`, `Referrer-Policy` y cache inmutable para `/_astro/*` y fuentes.
- **Rendimiento por página correcto** lejos de la home: 21–35 KB gzip, 500–1 200 nodos.
- **Dependencias al día:** Astro 7.4.0 (existe 7.4.5, parche menor), Tailwind 4.3.3, TS 7.0.2.

---

## 2. Críticos (P0) — arreglar antes de publicar nada más

### P0-1 · El CLI escribe archivos fuera de `--dir` mediante symlinks

[bin/ryukami-ui.mjs:29-52](bin/ryukami-ui.mjs#L29-L52) valida la ruta **léxica**; la escritura en [bin/ryukami-ui.mjs:358-364](bin/ryukami-ui.mjs#L358-L364) usa `fs.writeFileSync`, que **sigue symlinks**.

PoC ejecutada y reproducida:

```bash
ln -s ../../../secret.txt proj/src/components/Button.astro
ryukami-ui add button --dir proj --overwrite
# → [OK] Instalado e integridad verificada · secret.txt sobrescrito FUERA de proj
```

El contenido lo controla el registro remoto, así que esto es una **escritura arbitraria de archivos** con un `--dir` aparentemente inocente.

**Fix:** antes de escribir, resolver `fs.realpathSync(path.dirname(dest))` y exigir que empiece por `fs.realpathSync(targetDir) + sep`; rechazar si `lstatSync(dest).isSymbolicLink()`; abrir con `O_NOFOLLOW` o `flag: 'wx'`.

### P0-2 · La verificación SHA-256 es autorreferencial y opcional

[bin/ryukami-ui.mjs:92-101](bin/ryukami-ui.mjs#L92-L101): el hash viaja en el mismo payload que el contenido y **si falta, el control se desactiva**.

PoC: un registro malicioso con `files: [{path, content}]` sin `sha256` se instala con el mensaje *"integridad verificada"*. Con hash presente, el atacante solo tiene que recalcularlo.

**Fix:** fail-closed si `sha256` falta; anclar la confianza fuera del payload (manifiesto firmado o hashes fijados en el paquete npm) y contrastar con `registry.json`.

### P0-3 · 8 de 35 componentes se instalan rotos

El CLI reporta `[OK]` y exit 0, pero el proyecto destino no compila. Verificado recorriendo los 35 payloads y comprobando la resolución de cada `import`:

| Componente | Import que queda roto | Causa |
| :--- | :--- | :--- |
| `alert` | `./Icon.astro` | dep `icon` no declarada |
| `ascii-generator` | `./Badge.astro`, `./Icon.astro` | deps no declaradas |
| `audio-synth` | `./Icon.astro` | dep no declarada |
| `code-block` | `./Icon.astro` | dep no declarada |
| `component-preview` | `./Icon.astro`, `../data/component-props`, `../data/multi-framework` | deps + archivos de datos no empaquetados |
| `theme-studio` | `./Button.astro`, `./Badge.astro`, `./Icon.astro` | `registryDependencies: []` |
| `command-palette` | `../data/registry.ts`, `../data/blocks.ts` | datos no empaquetados |
| `popover` | `./Icon.astro` | declara dep `icon`, **pero `public/r/icon.json` no existe** |

Y el fallo se propaga en silencio: [bin/ryukami-ui.mjs:337-343](bin/ryukami-ui.mjs#L337-L343) hace `if (validMap.has(dep) && …)` **sin `else`**, así que una dependencia inexistente se ignora y el resumen dice `0 omitido(s)`.

Verificación directa:

```bash
mkdir -p /tmp/t && ryukami-ui add theme-studio --dir /tmp/t
find /tmp/t -type f
# → solo ThemeStudio.astro; faltan Button, Badge e Icon
```

**Fix:** (a) registrar `icon` como ítem del registro — `Icon.astro` existe en [src/components/Icon.astro](src/components/Icon.astro), solo falta publicarlo; (b) declarar las deps reales en [scripts/build-registry.ts](scripts/build-registry.ts); (c) fallar con error si `!validMap.has(dep)`; (d) test E2E que instale los 35 en un dir temporal y verifique que todos los imports resuelven.

### P0-4 · `canonical` apunta a la portada en todas las páginas

[BaseLayout.astro:26](src/layouts/BaseLayout.astro#L26) es fijo: `https://ryukami-ui.pages.dev/`. Igual `og:url` ([BaseLayout.astro:35](src/layouts/BaseLayout.astro#L35)). Comprobado en el HTML compilado de `/docs/cli`, `/docs/components/button`, `/blocks`: **todas** se declaran canónicas de la home. Es la vía rápida a que Google desindexe el sitio entero por duplicación, justo cuando la propuesta de valor es el catálogo.

Además, [404.astro](src/pages/404.astro) no lleva `noindex`.

**Fix:** `const canonical = new URL(Astro.url.pathname, Astro.site)` con `site` en [astro.config.ts](astro.config.ts#L1); `og:url` derivado; `<meta name="robots" content="noindex">` en 404.

---

## 3. Altos (P1)

### P1-1 · Sin HTTPS obligatorio ni allowlist en la descarga del registro

[bin/ryukami-ui.mjs:129](bin/ryukami-ui.mjs#L129) acepta `RYUKAMI_REGISTRY_URL` del entorno; [bin/ryukami-ui.mjs:159-164](bin/ryukami-ui.mjs#L159-L164) hace `fetch` sin `signal`, sin validar protocolo/host y siguiendo redirects. PoC: `add evil --registry http://127.0.0.1:8791` instala código arbitrario. El env var permite inyección silenciosa en CI.

**Fix:** exigir `https:` (http solo `localhost` tras flag explícito), `redirect: 'error'` o revalidar `res.url`, allowlist de host, ignorar el env salvo opt-in.

### P1-2 · Path traversal en `info` y en el tool MCP `get_component`

[bin/ryukami-ui.mjs:379-385](bin/ryukami-ui.mjs#L379-L385) y [bin/ryukami-ui.mjs:496-497](bin/ryukami-ui.mjs#L496-L497) concatenan el nombre sin validar. PoC: `info ../../package` lee el `package.json` del repo; por MCP la URL sale como `…/r/../../../../etc/hostname.json`.

**Fix:** `/^[a-z0-9][a-z0-9-]*$/` + `validMap.has(name)` antes de resolver; `encodeURIComponent` en la URL.

### P1-3 · Los diálogos declaran sombras que el CSS anula (bug de cascada)

En [global.css:159-193](src/styles/global.css#L159-L193), `.btn-brutal` y `.tui-window` están **fuera de `@layer`**. Verificado en el CSS compilado: `@layer utilities{` abre en el offset 8 910 y `.tui-window{` aparece en 66 211, sin capa. Como el CSS sin capa gana a cualquier `@layer`, **todas** las utilidades sobre esos nodos se ignoran.

Consecuencias reales: `shadow-[-8px_8px…]` en [Modal.astro:16](src/components/Modal.astro#L16), [Drawer.astro:40](src/components/Drawer.astro#L40), [CommandPalette.astro:29](src/components/CommandPalette.astro#L29) y [Popover.astro:42](src/components/Popover.astro#L42) es **inerte**; los `dark:border-*` sobre contenedores `.tui-window` son código muerto; el `accentMap` de [StatCard.astro:24-27](src/components/StatCard.astro#L24-L27) nunca se pinta.

**Fix:** mover las clases canónicas a `@layer components` y recién entonces tokenizar sombras (hoy cualquier tokenización se silencia).

### P1-4 · Regla de diseño incumplida en 67 sitios: borde carmesí en dark

[AGENTS.md](AGENTS.md) exige `border-2 border-black dark:border-scorch-crimson`. Hay 58 `dark:border-slate-*` y 9 `dark:border-white|black` en 26 archivos (Modal, Input, Drawer, Alert, Checkbox, Switch, Select, Textarea…). Solo **1** componente cumple: [Tooltip.astro:22](src/components/Tooltip.astro#L22).

**Fix:** reemplazo mecánico + test de contrato que lo bloquee.

### P1-5 · 16 de 39 componentes no cumplen la convención `export interface Props`

Sin `export`: Alert, ArcadeGame, Badge, Checkbox, ComponentPreview, Input, Kbd, Modal, Switch. Con `export type` en vez de interface: Button. Sin declaración alguna: AsciiGenerator, CommandPalette, Header, TerminalEmulator, ThemeStudio, ToastContainer.

**Fix:** `export interface Props` en los 39 + chequeo en CI.

### P1-6 · La home son 5 882 nodos DOM y 727 KB de HTML

| Página | HTML | gzip | Nodos |
| :--- | ---: | ---: | ---: |
| `/` (home) | 727 KB | 82 KB | **5 882** |
| `/docs/components/button` | 182 KB | 29 KB | 1 109 |
| `/blocks` | 207 KB | 35 KB | 1 187 |
| `/docs` | 108 KB | 22 KB | 500 |

Lighthouse considera "excesivo" >1 400 nodos y problemático >800. La home es 4× eso, con 23 scripts inline (65 KB de JS embebido). Es el factor que más castiga LCP/TBT y lo que hace que el badge *"Lighthouse 96/100/100/100"* del README sea difícil de sostener.

**Causa raíz identificada:** [ComponentPreview.astro](src/components/ComponentPreview.astro) incrusta **cada snippet 4 veces** (un `data-code`, tres `data-*-code` y tres paneles renderizados) para los 19 previews de la home; y [CommandPalette.astro:30-31](src/components/CommandPalette.astro#L30-L31) mete ~23 KB de JSON en atributos `data-*` **en todas las páginas**.

**Fix:** renderizar bajo el fold por demanda (IntersectionObserver + `<template>`), mover demos a `/docs/components`, serializar el snippet una sola vez y cargar CommandPalette con `client:visible`/`lazy`. Objetivo: <2 000 nodos y <40 KB gzip.

### P1-7 · El helper público `window.showToast()` inyecta HTML

[ToastContainer.astro:61](src/components/ToastContainer.astro#L61) interpola `title` y `message` en `innerHTML`, y `duration` dentro de un atributo `style`. Es la API documentada en AGENTS.md para consumidores: cualquier texto de usuario → DOM XSS. Mismo patrón en [CommandPalette.astro:274](src/components/CommandPalette.astro#L274), que refleja `searchInput.value` en `innerHTML`.

**Fix:** construir nodos y usar `textContent`; aceptar `string` solo tras escapar; `duration` numérico validado.

### P1-8 · `tsc` está roto y CI no lo detecta

```
tsconfig.json(4,5): error TS5102: Option 'baseUrl' has been removed.
tsconfig.json(6,15): error TS5090: Non-relative paths are not allowed.
```

TypeScript 7 eliminó `baseUrl`; el archivo está en formato TS 5. Al corregirlo aparecen más errores: falta `@types/node` (el CLI declara `// @ts-check`) y ~40 parámetros implícitamente `any`. Nada de esto bloquea el build (Astro resuelve `@/` por su cuenta), y como [ci.yml](.github/workflows/ci.yml) solo corre `test` + `build`, nadie se enteró.

**Fix:** `"paths": { "@/*": ["./src/*"] }` sin `baseUrl`, añadir `@types/node` y `@astrojs/check`, correr `astro check` + `tsc --noEmit` en CI.

### P1-9 · `<main>` anidado en las 39 páginas de documentación

[DocsLayout.astro:29](src/layouts/DocsLayout.astro#L29) renderiza su propio `<main>` **dentro** del `<main>` de [BaseLayout.astro:153](src/layouts/BaseLayout.astro#L153). Confirmado en el HTML compilado: dos landmarks `main` por página de docs, lo que rompe la navegación por landmarks de lectores de pantalla y el "skip to main" salta al contenedor equivocado.

**Fix:** en DocsLayout usar `<div>`/`<section>` con `aria-labelledby`. *(15 min)*

### P1-10 · Anclas muertas y TOC inventado

- El logo del header apunta a `#hero` ([Header.astro:55](src/components/Header.astro#L55)) y "VOLVER ARRIBA" a `#hero` ([BaseLayout.astro:174](src/layouts/BaseLayout.astro#L174), [FooterBlock.astro:61](src/blocks/FooterBlock.astro#L61)): ese ancla **solo existe en `/` y `/blocks`**, en el resto no hace nada.
- El TOC de [DocsLayout.astro:49-69](src/layouts/DocsLayout.astro#L49-L69) está hardcodeado e incluye `#props`, que **no existe** en ninguna página (`id="props"` = 0 coincidencias).
- La prop `headings` de DocsLayout está declarada y se ignora.

**Fix:** TOC generado desde los `h2` reales de la página; logo a `/`; "volver arriba" con `window.scrollTo(0,0)`.

### P1-11 · Todo el JS es inline: 0 archivos `.js` en `dist/`

`dist/` no contiene ningún archivo JavaScript: hay 9 `<script type="module">` inline y 21 `<script>` inline (65 KB solo en la home). Consecuencias: **no es cacheable** entre páginas, se re-parsea en cada navegación, y bloquea una CSP estricta. Además el init de tema está duplicado (head y body).

**Fix:** extraer el runtime compartido a un módulo importado (Astro lo emite como `/_astro/*.js` cacheable), dejar inline solo el snippet anti-FOUC de tema, y habilitar `prefetch` en [astro.config.ts](astro.config.ts).

---

## 4. Medios (P2)

| # | Hallazgo | Ubicación | Fix |
| :--- | :--- | :--- | :--- |
| 1 | Sin timeout ni límite de tamaño en `fetch`: `list --registry http://10.255.255.1` cuelga indefinidamente; en MCP bloquea al agente; sin caché, cada `tools/call` re-descarga el maestro | [ryukami-ui.mjs:159-164](bin/ryukami-ui.mjs#L159-L164), [:491-502](bin/ryukami-ui.mjs#L491-L502) | `AbortSignal.timeout(10_000)`, cap ~5 MB, caché por proceso |
| 2 | MCP incumple JSON-RPC: método desconocido → `{}` (debería `-32601`), JSON malformado → 0 bytes (`-32700`), batches ignorados | [ryukami-ui.mjs:448-454](bin/ryukami-ui.mjs#L448-L454), [:509-511](bin/ryukami-ui.mjs#L509-L511) | Manejar array, responder códigos correctos |
| 3 | MCP: `readline` sin límite de línea → una línea de GB agota memoria | [ryukami-ui.mjs:432-449](bin/ryukami-ui.mjs#L432-L449) | Cap ~1 MiB, `rl.close()`, límite de concurrencia |
| 4 | `diff` siempre exit 0: inservible como gate | [ryukami-ui.mjs:395-425](bin/ryukami-ui.mjs#L395-L425) | `process.exitCode = modified ? 1 : 0` + `--json` |
| 5 | `--overwrite`/`-y` pisa `src/styles/global.css` del usuario sin backup ni dry-run | [ryukami-ui.mjs:271-302](bin/ryukami-ui.mjs#L271-L302) | `.bak-<ts>`, `--dry-run`, desacoplar `-y` |
| 6 | `design-tokens.json` se sobrescribe siempre, incluso sin `--overwrite` (único archivo que ignora la política SKIP) | [ryukami-ui.mjs:279-283](bin/ryukami-ui.mjs#L279-L283) | Aplicar `existsSync && !overwrite → SKIP` |
| 7 | `--dir` sin valor = cwd; directorio inexistente se crea sin avisar | [ryukami-ui.mjs:134-136](bin/ryukami-ui.mjs#L134-L136) | Error de uso (exit 2); exigir proyecto existente |
| 8 | Escritura no atómica, `mkdir` antes del SKIP, modo según umask | [ryukami-ui.mjs:269](bin/ryukami-ui.mjs#L269), [:358-364](bin/ryukami-ui.mjs#L358-L364) | `tmp` + `renameSync`, `mode 0o644` |
| 9 | Sin `--version`; `ryukami-ui --version` sale con exit 1 | [ryukami-ui.mjs:132-149](bin/ryukami-ui.mjs#L132-L149) | Soportar `-v/--version` |
| 10 | Tests no cubren los bypass reales (symlink, payload sin hash, MCP, traversal en `info`); además los regex CSS se **duplican** en el test, así que no prueban el código real | [tests/security.test.ts:10-12](tests/security.test.ts#L10-L12) | E2E con `mkdtemp`; exportar validadores desde un módulo compartido |
| 11 | 22 sombras arbitrarias fuera de la escala (`-3px` ×4, `-6px`, `-8px` ×3); Badge hardcodea `#000` y `#4DA3FF`; Kbd usa `currentColor` | Avatar:35, RadioGroup:33, Skeleton:16, Slider:52, Badge:10-14, Kbd:9 | Tokens `shadow-brutal{,-sm,-lg,-xl}` |
| 12 | 15 `focus:outline-none` compensados con `outline: 2px dashed … !important` → doble indicador de foco | [global.css:132-135](src/styles/global.css#L132-L135) | Un solo token de foco |
| 13 | Tokens de superficie definidos y **nunca usados**: 29× `bg-white dark:bg-slate-900`, 18× `text-slate-900 dark:text-slate-100`, 15× `text-slate-700 dark:text-slate-300` | 23 archivos | Utilidades derivadas de `--bg-surface`/`--text-main` |
| 14 | ~24 colores fuera de paleta: `hover:bg-red-600`, `bg-emerald-*`, `text-purple-700`, `bg-[#E63946]` (el token es `#D62436`) | Button:44-47, StatCard:26-30, ThemeStudio:33 | Fuente única de variantes |
| 15 | Formularios sin `aria-invalid`/`aria-describedby`; el `*` de required sin `aria-hidden`; CommandPalette sin `role="combobox"` y con `placeholder:opacity-50` (~2.1:1) | Input:66, Textarea:50, Select:64, Checkbox:43, CommandPalette:58-64 | Atributos ARIA + contraste |
| 16 | Slider sin `::-webkit-slider-thumb` → pulgar redondeado del navegador (rompe "cero radius" en inputs); scrollbars sin reset | Slider:54-64 | Reset en `@layer base` |
| 17 | `backdrop-filter: blur(2px)` (único blur del repo) y `hover` de `.btn-brutal` fijo en `-6px 6px`, ignorando los presets -2/-8 de ThemeStudio | [global.css:241](src/styles/global.css#L241), [:179](src/styles/global.css#L179) | `blur(0)`; `calc()` sobre tokens |
| 18 | ToastContainer anima `width` (non-composited) | ToastContainer:76 | `transform: scaleX()` |
| 19 | `prefers-reduced-motion` está en CSS, pero el audio y el scroll suave no lo respetan; `scroll` handler lee `scrollHeight` en cada evento (layout thrash) | BaseLayout:222-234 | `rAF` throttle; gate de audio |
| 20 | `localStorage` sin `try/catch` en el script del body (el del head sí lo tiene) → en navegación privada restringida se cae todo el JS siguiente | [BaseLayout.astro:192](src/layouts/BaseLayout.astro#L192), [:239](src/layouts/BaseLayout.astro#L239) | Envolver en try/catch |
| 21 | La inicialización de tema está duplicada: head ([BaseLayout.astro:57-131](src/layouts/BaseLayout.astro#L57-L131)) y body ([:190-220](src/layouts/BaseLayout.astro#L190-L220)) | BaseLayout | Un solo módulo |
| 22 | `_headers` sin `Content-Security-Policy` pese a 23 scripts inline | [public/_headers](public/_headers) | CSP con hashes en build o Report-Only |
| 23 | `sitemap.xml` estático y mantenido a mano (44 URLs); se desincroniza al añadir páginas | [public/sitemap.xml](public/sitemap.xml) | `@astrojs/sitemap` |
| 24 | `registry.json` incluye `updatedAt: new Date()` → todo build ensucia el árbol git | [build-registry.ts:498](scripts/build-registry.ts#L498) | Quitar el campo o usar hash de contenido |
| 25 | Versión `2.4.0` hardcodeada en 10+ lugares (CLI, registry, footer, docs); el workflow de deploy aún dice "27 Modules"; docs dicen "10 bloques" pero hay 11 | varios | Leer de `package.json`, corregir textos |
| 26 | Scripts de snippets usan `shadow-[-4px_4px_0px_0px_#000000]` en vez de `var(--shadow-color)` → los ejemplos no siguen el tema | [multi-framework.ts](src/data/multi-framework.ts) | Tokenizar en los snippets |
| 27 | Sin `engines`, ni `packageManager` en `package.json`; CI usa Node 22 y local Node 24 | [package.json](package.json) | Declarar y alinear |
| 28 | Dos workflows compilan en cada push a `main` (CI + deploy) | .github/workflows | Reutilizar build/artefacto |
| 29 | Scroll-spy muerto: el JS consulta `a[data-header-nav]` ([Header.astro:234](src/components/Header.astro#L234)) pero **ningún enlace tiene el atributo** → ~2.5 KB de JS inútil y sin `aria-current` | [Header.astro:67-96](src/components/Header.astro#L67-L96) | Añadir el atributo o borrar el script |
| 30 | Doble estímulo acústico: listener global en todo `button` ([BaseLayout.astro:337-341](src/layouts/BaseLayout.astro#L337-L341)) **más** llamadas por componente (Tabs, Card, Accordion, Header) → doble beep y doble `vibrate(8)`; audio y synth sin `prefers-reduced-motion` | BaseLayout, Tabs:77, Card:82, Accordion:64 | Un solo punto de disparo + gate de accesibilidad |
| 31 | Toggles y pestañas sin `aria-pressed` / `aria-current`: ThemeStudio (10 botones), filtros de [blocks.astro:41-69](src/pages/blocks.astro#L41-L69), switcher de framework ([slug].astro:469-491](src/pages/docs/components/%5Bslug%5D.astro#L469-L491)), tabs de ComponentPreview, SidebarNav | 5 archivos | `aria-pressed`/`aria-selected` + roles |
| 32 | Contraste insuficiente en texto secundario: `#64748B` sobre `#0B0F17` = **4.03:1**, sobre `#111827` = **3.73:1**, sobre `#F5F7FA` = **4.43:1**; `emerald-600` sobre blanco = 3.77:1 a 10px | docs/components/index:43, blocks:100-235, themes:49-132, DocsLayout:32-34, GamingHud:44-141 | Subir a `slate-600`/`emerald-700` o bajar el tamaño mínimo |
| 33 | `onclick` inline con interpolación de `id` ([Drawer.astro:28](src/components/Drawer.astro#L28)); 25 `onclick` en el proyecto → imposible endurecer CSP | Drawer y otros | `addEventListener` |
| 34 | [astro.config.ts](astro.config.ts) sin `site`, sin `@astrojs/sitemap`, sin `prefetch`, sin `build.inlineStylesheets`; sitemap manual con `lastmod` fijo que lista `/r/*.json`; **cero JSON-LD** pese a breadcrumbs visuales | astro.config.ts, public/sitemap.xml | `site` + integración sitemap + prefetch + JSON-LD `SoftwareApplication`/`BreadcrumbList` |
| 35 | [ArcadeGame.astro](src/components/ArcadeGame.astro) en `/404`: bucle `requestAnimationFrame` infinito, secuestra la barra espaciadora a nivel global y no respeta `prefers-reduced-motion` | ArcadeGame:614-716 | Pausa al salir de viewport, `preventDefault` acotado, gate de movimiento |
| 36 | Afordancias falsas: `[-][□][×]` como `span` no interactivos ([GamingHudBlock:28-31](src/blocks/GamingHudBlock.astro#L28-L31)); `div` clickeables no focusables ([themes.astro:54-60](src/pages/themes.astro#L54-L60), con doble `apply` por bubbling) | 2 archivos | `<button type="button">` + `aria-label` |
| 37 | `transition-all` en páginas y datos, contra AGENTS.md | [docs/components/index.astro:34](src/pages/docs/components/index.astro#L34), [multi-framework.ts:296](src/data/multi-framework.ts#L296) | Propiedad explícita |
| 38 | En `/blocks`, un `<footer>` dentro de `<main>` ([FooterBlock.astro:15](src/blocks/FooterBlock.astro#L15)); `h4` fijos; `target="_blank"` sin `rel` | FooterBlock | Sacar el landmark; `rel="noopener noreferrer"` |
| 39 | `decoding="sync"` en la única imagen; IDs generados con `Math.random()` en SSR ([ComponentPreview:18](src/components/ComponentPreview.astro#L18), Accordion:16, Tabs:16) → colisiones entre instancias | 4 archivos | `decoding="async"`; `crypto.randomUUID()` o contador |

---

## 5. Bajos (P3) — higiene

- Sin `CHANGELOG.md`, `CONTRIBUTING.md`, `.nvmrc`, ni `.editorconfig`.
- Sin `lint` (ESLint/Stylelint) ni formateo automatizado: el estilo depende de disciplina manual.
- `pnpm-workspace.yaml` con permisos `600` y contenido que no es un workspace.
- `public/r/registry.json` versionado se regenera en cada build (ver P2-24).
- El badge "Lighthouse 96/100/100/100" del README no tiene evidencia reproducible (no hay Lighthouse CI).
- Textos mezclan español e inglés y la etiqueta del tema dice `HACKER`/`PAPER` sin descripción accesible.
- `Alert.astro` define `accentText` y nunca lo aplica; `Callout` usa `dark:border-scorch-cyan|gold` fuera de norma.

---

## 6. Plan de mejora

### Fase 0 — Quick wins (≈1 día, riesgo bajo)

1. **Canonical + `og:url` por página** y `noindex` en 404. *(1 h, impacto SEO máximo)*
2. **`icon.json` en el registro** y declarar deps reales de los 8 componentes rotos; error si falta una dep. *(3 h)*
3. **`tsconfig.json` compatible con TS 7** + `@types/node`; añadir `astro check` y `tsc --noEmit` al CI. *(2 h)*
4. **Symlink guard** en la escritura (`realpath` + rechazo de symlinks). *(2 h)*
5. **Texto**: "10 bloques" → 11; "27 Modules" → 35; leer versión de `package.json`. *(30 min)*
6. **`<main>` anidado** en DocsLayout y anclas muertas del header/footer. *(30 min)*
7. **`site` en `astro.config.ts`** + `@astrojs/sitemap`; retirar el sitemap manual. *(30 min)*

### Fase 1 — Sprint de hardening (≈1 semana)

6. CLI: HTTPS obligatorio + allowlist, `AbortSignal`, cap de tamaño, validación de nombre en `info`/MCP, `diff` con exit code, `--version`, backup en `--overwrite`, escritura atómica. *(2–3 d)*
7. Registro: `sha256` obligatorio y manifiesto firmado o hashes fijados en npm. *(1–2 d)*
8. MCP: cumplimiento JSON-RPC (`-32700/-32600/-32601`), límite de línea y de concurrencia, caché. *(1 d)*
9. Tests E2E del CLI (instalar los 35 en `mkdtemp` y compilar) + tests de los bypass. *(1 d)*
10. `@layer components` para `.btn-brutal`/`.tui-window` y tokenización de las 22 sombras. *(1 d)*

### Fase 2 — Calidad sostenible (≈2–3 semanas)

11. **Linter de diseño** (`scripts/lint-design.ts` + `tests/design.test.ts`) con reglas ejecutables: `rounded-`, `shadow-[`, `blur(`, `transition-all`, `dark:border-slate-*`, hex crudos, `<dialog>` sin `closedby`, botón sin `aria-label`, `export interface Props`. *(2 d)*
12. **Reset global**: `border-radius:0`, scrollbars, slider thumb, `dialog::backdrop`. *(1 d)*
13. **Fuente única de variantes** (`src/design/variants.ts`) y tokens generados desde ahí. *(3 d)*
14. **Performance de la home**: demos bajo el fold diferidas; objetivo <2 000 nodos y <40 KB gzip. *(3 d)*
15. **CSP** con hashes generados en build (o Report-Only primero). *(2 d)*
16. **A11y de formularios**: `aria-invalid`, `aria-describedby`, combobox en CommandPalette, contraste `text-slate-400` (2.56:1) → `slate-500` (4.76:1). *(2 d)*
17. **Lighthouse CI** en el workflow y badge real; `@astrojs/sitemap` generado. *(1 d)*
18. **Externalizar el JS compartido** (tema, audio, scroll-spy) a módulos cacheables y activar `prefetch`; borrar el scroll-spy o cablearlo con `data-header-nav`. *(1–2 d)*
19. **JSON-LD** (`SoftwareApplication` + `BreadcrumbList`) y TOC generado desde los `h2` reales. *(1 d)*

### Orden recomendado si solo hay tiempo para tres cosas

1. **P0-3** (componentes rotos): es lo que rompe la promesa del producto y lo descubre el primer usuario que instala.
2. **P0-1** (symlink): convierte un instalador en un vector de escritura arbitraria.
3. **P0-4** (canonical): anula todo el trabajo de SEO/posicionamiento del catálogo.

---

## 7. Cómo medir que mejoró

| Métrica | Hoy | Objetivo |
| :--- | :--- | :--- |
| Componentes que compilan tras `add` | **35/35 ✅** (test E2E en CI) | 35/35 |
| Nodos DOM de la home | **2 603 ✅** (era 5 882) | < 2 000 (requiere recortar demos) |
| HTML home (gzip) | **61 KB ✅** (era 82 KB) | < 40 KB |
| Tests | **46 ✅** (21 seguridad · 6 registro/E2E · 11 MCP · 8 CLI) | ≥ 30 |
| `tsc --noEmit` / `astro check` | falla / no existe | 0 errores en CI **(pendiente: requiere `@types/node`)** |
| Páginas con canonical propio | **43/43 ✅** | 43/43 |
| Infracciones bloqueantes de diseño | **0 ✅** (gate en CI) | 0 |
| Landmarks `<main>` por página de docs | **1 ✅** | 1 |
| JS cacheable en `dist/` | 0 archivos `.js` | runtime compartido como `/_astro/*.js` |
| Lighthouse mobile (Performance) | sin medir | ≥ 90 y badge reproducible |

---

## Anexo · Comandos usados para verificar

```bash
pnpm test                      # 13/13 en 213 ms
pnpm build                     # 43 páginas en 3.13 s
npx tsc --noEmit               # falla: TS5102 (baseUrl eliminado en TS 7)
node bin/ryukami-ui.mjs list   # 35 módulos

# PoC symlink (reproducida)
mkdir -p proj/src/components && echo ORIGINAL > secret.txt
ln -s ../../../secret.txt proj/src/components/Button.astro
node bin/ryukami-ui.mjs add button --dir proj --overwrite   # sobrescribe secret.txt

# Comprobación de payloads e imports
python3 - <<'EOF'
import json,glob,re,posixpath
for p in glob.glob('public/r/*.json'):
    d=json.load(open(p))
    if 'files' not in d: continue
    shipped={f['path'] for f in d['files']}
    for f in d['files']:
        for m in re.findall(r"from\s+'(\.[^']+)'", f.get('content','')):
            t=posixpath.normpath(posixpath.join(posixpath.dirname(f['path']),m))
            if t not in shipped: print(p, '->', m)
EOF
```
