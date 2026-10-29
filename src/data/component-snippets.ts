export const buttonSnippet = `import Button from '@/components/Button.astro';

<Button variant="crimson" size="md">Carmesi Scorch</Button>
<Button variant="cyan" size="md">Cian Electrico</Button>
<Button variant="gold" size="md">Oro Dragon</Button>
<Button variant="dark" size="md">Modo Hacker</Button>
<Button variant="outline" size="md">Contorno Paper</Button>`;

export const badgeSnippet = `import Badge from '@/components/Badge.astro';

<Badge variant="crimson">● SYSTEM_ALERT</Badge>
<Badge variant="cyan">◆ RE_ENGINEERING</Badge>
<Badge variant="gold">[*] VELGRYND_CORE</Badge>
<Badge variant="dark">TS TYPESCRIPT 7</Badge>
<Badge variant="outline">POSTGRESQL 17</Badge>`;

export const cardSnippet = `import Card from '@/components/Card.astro';
import Button from '@/components/Button.astro';

<Card title="0xSERVER // NODE_2" status="ONLINE">
  <div class="space-y-3">
    <h4 class="font-extrabold text-base uppercase">Botkeep Cloud Container</h4>
    <p class="text-xs leading-relaxed opacity-80">
      Contenedor asignado con 2 GB de RAM, PostgreSQL 17 y Redis 7.2.
    </p>
    <Button variant="cyan" size="sm">INSPECCIONAR NODO</Button>
  </div>
</Card>`;

export const progressSnippet = `import ProgressBar from '@/components/ProgressBar.astro';

<ProgressBar label="Nucleo Termico Velgrynd" value={92} variant="crimson" status="CRITICAL" />
<ProgressBar label="Memoria RAM Asignada" value={68} variant="cyan" status="1.36 GB / 2 GB" />
<ProgressBar label="Sincronizacion de Paquetes" value={100} variant="emerald" status="NOMINAL" />`;

export const inputSnippet = `import Input from '@/components/Input.astro';

<Input
  label="Comando CLI"
  prefix="$"
  placeholder="ryukami-ui add button"
  hint="Ejecuta en tu terminal de confianza"
/>
<Input
  label="Host de Base de Datos"
  prefix="tcp://"
  placeholder="db.internal.botkeep.xyz"
  value="127.0.0.1:5432"
/>`;

export const selectSliderSnippet = `import Select from '@/components/Select.astro';
import Slider from '@/components/Slider.astro';

<Select
  label="Motor de Compilacion"
  prefix="ENGINE //"
  options={[
    { value: 'astro-7', label: 'Astro 7.4.0 (Vite 8 + Rolldown)' },
    { value: 'next-16', label: 'Next.js 16 App Router (Turbopack)' },
  ]}
/>

<Slider
  label="Potencia de Sombreado ASCII"
  min={0}
  max={100}
  value={75}
  unit="%"
  variant="crimson"
/>`;

export const toggleSnippet = `import Checkbox from '@/components/Checkbox.astro';
import Switch from '@/components/Switch.astro';

<Checkbox
  label="Autenticacion Cuantica"
  description="Requiere llave SSH ed25519 fisica"
  checked
/>
<Switch
  label="Vigilancia RF Activa"
  variant="crimson"
  checked
/>`;

export const tabsSnippet = `import Tabs from '@/components/Tabs.astro';

<Tabs
  title="0xDEPLOY // TARGETS"
  tabs={[
    { id: 'astro', label: 'ASTRO 7.4', badge: 'DEFAULT', content: 'Compilacion estatica en 820ms con 0 KiB JS.', code: 'ryukami-ui init && ryukami-ui add --all' },
    { id: 'docker', label: 'DOCKER ALPINE', badge: 'PROD', content: 'Contenedor ligero en Botkeep Cloud.', code: 'docker compose up -d --build' },
  ]}
/>`;

export const accordionSnippet = `import Accordion from '@/components/Accordion.astro';

<Accordion
  name="scorch-faq"
  items={[
    { title: '¿Por que cero border-radius (0px)?', badge: 'DESIGN RULE #1', content: 'El Neo-Brutalismo puro elimina las curvas suaves para emular la precision mecanica de terminales CRT y consolas industriales.', open: true },
    { title: '¿Como funciona la sintesis de sonido Web Audio?', badge: 'ZERO ASSETS', content: 'Los clics mecanicos se generan matematicamente en tiempo real con osciladores triangulares y filtros pasa-banda sin descargar archivos MP3.' },
  ]}
/>`;

export const alertSnippet = `import Alert from '@/components/Alert.astro';

<Alert variant="crimson" title="SOBRECALENTAMIENTO DE NUCLEO">
  Frecuencia de CPU al 98%. Temperatura en 89°C. Se activan ventiladores secundarios.
</Alert>

<Alert variant="cyan" title="SISTEMA ACTUALIZADO">
  Nucleo actualizado exitosamente a Astro 7.4.0 y Tailwind CSS 4.3.3.
</Alert>`;

export const avatarSkeletonSnippet = `import Avatar from '@/components/Avatar.astro';
import Skeleton from '@/components/Skeleton.astro';
import Kbd from '@/components/Kbd.astro';

<Avatar name="0xAlex // Architect" role="CORE LEAD" initials="0X" status="ONLINE" variant="crimson" />
<Skeleton lines={2} label="FETCHING_DRAGON_TELEMETRY" variant="cyan" />
<Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>`;

export const textareaRadioSnippet = `import Textarea from '@/components/Textarea.astro';
import RadioGroup from '@/components/RadioGroup.astro';

<Textarea label="Payload de Configuracion" value="{\\n  \\"node\\": \\"scorch-02\\"\\n}" />
<RadioGroup
  label="Modo de Encriptacion"
  name="cipher-mode"
  value="ed25519"
  options={[
    { value: 'ed25519', label: 'Ed25519 Quantum Key', badge: 'DEFAULT' },
    { value: 'rsa4096', label: 'RSA-4096 Legacy' },
  ]}
/>`;

export const navPrimitivesSnippet = `import Breadcrumb from '@/components/Breadcrumb.astro';
import Pagination from '@/components/Pagination.astro';

<Breadcrumb
  items={[
    { label: 'ryukami-labs', href: '#hero' },
    { label: 'scorch-v4.1', href: '#components' },
    { label: '0xkernel.astro', active: true },
  ]}
/>
<Pagination currentPage={2} totalPages={8} />`;

export const modalToastSnippet = `import Modal from '@/components/Modal.astro';
import Popover from '@/components/Popover.astro';
import Button from '@/components/Button.astro';

<Button variant="crimson" onclick="window.showToast('ALERT_CRITICAL', 'Pulso termico detectado.', 'crimson')">
  Disparar Toast Carmesi
</Button>

<Popover id="node-popover" triggerLabel="INSPECCIONAR NODO (POPOVER)" title="0xNODE // TELEMETRY">
  <p>Popover nativo HTML5 Top-Layer sin JS externo.</p>
</Popover>

<Modal id="demo-modal" title="0xKERNEL // SYSTEM_DIAGNOSTIC" status="ROOT_ACCESS">
  <p>Diagnostico cuantico completado sin anomalias.</p>
</Modal>`;

export const statCardTooltipSnippet = `import StatCard from '@/components/StatCard.astro';
import Tooltip from '@/components/Tooltip.astro';
import Badge from '@/components/Badge.astro';

<StatCard label="LATENCIA_EDGE" value="11.4 ms" delta="-18.2%" trend="up" sparkline="▇▆▅▃▂▁▁" variant="cyan" />
<StatCard label="THROUGHPUT_RPS" value="48,920" delta="+24.5%" trend="up" sparkline="▁▂▃▄▆▇█" variant="crimson" />

<Tooltip text="Ratio WCAG AA: 5.04:1 sobre #FFFFFF" variant="crimson">
  <Badge variant="crimson">HOVER TOOLTIP</Badge>
</Tooltip>`;

export const calloutBentoSnippet = `import Callout from '@/components/Callout.astro';
import BentoGrid from '@/components/BentoGrid.astro';

<Callout type="dragon" title="REGLA INVIOLABLE DE ARQUITECTURA" badge="SCORCH v4.1">
  Cero border-radius (0px), bordes solidos de 2px y sombras duras hacia abajo-izquierda.
</Callout>

<BentoGrid
  columns={3}
  items={[
    { title: '0xVAULT // SYNC', subtitle: 'OBSIDIAN BRIDGE', metric: '35 MODS', badge: 'W3C', description: 'Sincronizado con design-tokens.json y scorch-vault.css.', span: '2', variant: 'crimson' },
    { title: '0xMCP // STDIO', subtitle: 'AI AGENTS', metric: 'JSON-RPC', badge: 'NEW', description: 'Servidor MCP integrado en el CLI (ryukami-ui mcp).', span: '1', variant: 'cyan' },
  ]}
/>`;

export const drawerCodeSynthSnippet = `import Drawer from '@/components/Drawer.astro';
import CodeBlock from '@/components/CodeBlock.astro';
import AudioSynth from '@/components/AudioSynth.astro';

<Drawer id="inspect-drawer" title="0xDRAWER // TELEMETRY_SHEET" triggerLabel="ABRIR DRAWER LATERAL">
  <p>Panel lateral con HTML5 <dialog closedby="any">.</p>
</Drawer>

<CodeBlock
  filename="src/styles/global.css"
  language="CSS // DIFF"
  code="- border-radius: 8px;\\n+ border-radius: 0px;\\n+ box-shadow: -4px 4px 0px 0px var(--shadow-color);"
/>

<AudioSynth />`;

export const dataTableSnippet = `import DataTable from '@/components/DataTable.astro';

<DataTable
  title="0xCLUSTER // ACTIVE_NODES_GRID"
  columns={[
    { key: 'service', label: 'Servicio' },
    { key: 'endpoint', label: 'Endpoint' },
    { key: 'uptime', label: 'Uptime' },
    { key: 'status', label: 'Estado' },
  ]}
  rows={[
    { service: 'PostgreSQL 17', endpoint: 'tcp://5432', uptime: '99.98%', status: 'ONLINE' },
    { service: 'Cloudflare Pages Edge', endpoint: 'https://ryukami-ui.pages.dev', uptime: '100.0%', status: 'ONLINE' },
  ]}
/>`;

export const installAstroSnippet = `# 1. Obtener el CLI desde el repositorio de GitHub (bin/ryukami-ui.mjs)
# Se instala en ~/.local/bin/ryukami-ui para usarlo como comando global:
git clone https://github.com/Alecwce/ryukami-ui.git ~/.local/share/ryukami-ui
ln -sf ~/.local/share/ryukami-ui/bin/ryukami-ui.mjs ~/.local/bin/ryukami-ui
chmod +x ~/.local/bin/ryukami-ui

# 2. Inicializar tokens CSS (Tailwind v4), ryukami.json y tokens W3C opcionales (--obsidian)
ryukami-ui init --obsidian --dir ./mi-proyecto-astro

# 3. Listar los 35 componentes disponibles o verificar integridad SHA-256
ryukami-ui list
ryukami-ui diff --dir ./mi-proyecto-astro

# 4. Instalar componentes especificos (resuelve dependencias automaticamente)
ryukami-ui add button card callout bento-grid data-table code-block drawer --dir ./mi-proyecto-astro

# 5. O instalar los 35 componentes del catalogo de una sola vez
ryukami-ui add --all --dir ./mi-proyecto-astro

# 6. Iniciar servidor MCP (stdio JSON-RPC 2.0) para Agentes de IA (Antigravity / OpenCode / Claude)
ryukami-ui mcp`;
