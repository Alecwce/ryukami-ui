export interface BlockItem {
  id: string;
  name: string;
  title: string;
  category: 'MARKETING' | 'APPLICATION' | 'STUDIO';
  description: string;
  snippet: string;
  dependencies: string[];
}

export const BLOCKS_DATA: BlockItem[] = [
  {
    id: 'hero',
    name: 'HeroBlock.astro',
    title: 'Hero Header Section',
    category: 'MARKETING',
    description: 'Cabecera de alto impacto con título 8-bit, badge de versión, descripción y llamadas a la acción dobles.',
    snippet: `import HeroBlock from '@/blocks/HeroBlock.astro';\n\n<HeroBlock\n  tag="v2.4 // PRODUCTION READY"\n  title="CONSOLA TUI & SISTEMA NEO-BRUTALISTA"\n  primaryCtaText="EXPLORAR COMPONENTES"\n  primaryCtaHref="/docs/components"\n/>`,
    dependencies: ['button', 'badge', 'icon'],
  },
  {
    id: 'features',
    name: 'FeaturesBlock.astro',
    title: 'Features Matrix Grid',
    category: 'MARKETING',
    description: 'Cuadrícula de capacidades arquitectónicas con glifos geométricos, etiquetas TUI y sombras duras.',
    snippet: `import FeaturesBlock from '@/blocks/FeaturesBlock.astro';\n\n<FeaturesBlock title="CARACTERÍSTICAS DEL SISTEMA" />`,
    dependencies: ['badge'],
  },
  {
    id: 'cta',
    name: 'CtaBlock.astro',
    title: 'CTA Conversion & Newsletter',
    category: 'MARKETING',
    description: 'Caja de suscripción de operador o boletín de terminal con prefijo tty:// y notificación en vivo.',
    snippet: `import CtaBlock from '@/blocks/CtaBlock.astro';\n\n<CtaBlock title="CONVIÉRTETE EN OPERADOR" buttonText="REGISTRAR TTY" />`,
    dependencies: ['button', 'input', 'badge'],
  },
  {
    id: 'faq',
    name: 'FaqBlock.astro',
    title: 'Accordion FAQ Block',
    category: 'APPLICATION',
    description: 'Sección de preguntas frecuentes construida sobre HTML5 details nativo y accesible.',
    snippet: `import FaqBlock from '@/blocks/FaqBlock.astro';\n\n<FaqBlock />`,
    dependencies: ['accordion', 'badge'],
  },
  {
    id: 'login',
    name: 'LoginBlock.astro',
    title: 'Operator Auth / Login Form',
    category: 'APPLICATION',
    description: 'Formulario de inicio de sesión de consola con prefijos id:// y key://, checkbox TUI y botón de envío.',
    snippet: `import LoginBlock from '@/blocks/LoginBlock.astro';\n\n<LoginBlock title="0xAUTH // ACCESO OPERADOR" />`,
    dependencies: ['input', 'button', 'checkbox', 'badge'],
  },
  {
    id: 'bento',
    name: 'BentoGrid.astro',
    title: 'Bento Dashboard Grid',
    category: 'APPLICATION',
    description: 'Dashboard estilo Bento Box con tarjetas asimétricas, métricas de telemetría y variantes de color.',
    snippet: `import BentoGrid from '@/components/BentoGrid.astro';\n\n<BentoGrid\n  columns={3}\n  items={[\n    { title: '0xVAULT', metric: '35 MÓDULOS', span: '2', variant: 'crimson' },\n    { title: '0xSHA256', metric: '100% PASS', span: '1', variant: 'cyan' }\n  ]}\n/>`,
    dependencies: ['bento-grid'],
  },
  {
    id: 'table',
    name: 'DataTable.astro',
    title: 'Service Registry Data Table',
    category: 'APPLICATION',
    description: 'Tabla de datos de estado con filtrado en tiempo real, ordenamiento por columna y badges de uptime.',
    snippet: `import DataTable from '@/components/DataTable.astro';\n\n<DataTable\n  title="CLUSTER_REGISTRY"\n  columns={[{ key: 'service', label: 'Servicio' }, { key: 'status', label: 'Estado' }]}\n  rows={[{ service: 'PostgreSQL 17', status: 'ONLINE' }]}\n/>`,
    dependencies: ['data-table', 'badge'],
  },
  {
    id: 'shell',
    name: 'TerminalEmulator.astro',
    title: 'Interactive TUI Shell',
    category: 'STUDIO',
    description: 'Emulador de terminal interactivo con comandos integrados (neofetch, status, dragon, cli, theme).',
    snippet: `import TerminalEmulator from '@/components/TerminalEmulator.astro';\n\n<TerminalEmulator />`,
    dependencies: ['terminal-emulator'],
  },
  {
    id: 'ascii',
    name: 'AsciiGenerator.astro',
    title: '8-Bit ASCII Forge Engine',
    category: 'STUDIO',
    description: 'Generador de arte ASCII y estandartes con copiado a portapapeles en tiempo real.',
    snippet: `import AsciiGenerator from '@/components/AsciiGenerator.astro';\n\n<AsciiGenerator />`,
    dependencies: ['ascii-generator'],
  },
  {
    id: 'gaming-hud',
    name: 'GamingHudBlock.astro',
    title: '8-Bit RPG Gaming HUD & Stats',
    category: 'APPLICATION',
    description: 'Panel HUD de telemetría de videojuego retro con barras de HP, Mana, XP animada (LEVEL UP!) y ranuras de acceso rápido.',
    snippet: `import GamingHudBlock from '@/blocks/GamingHudBlock.astro';\n\n<GamingHudBlock playerName="RYU_OPERATOR_01" level={42} />`,
    dependencies: ['progress-bar', 'badge', 'button'],
  },
  {
    id: 'footer',
    name: 'FooterBlock.astro',
    title: 'Neo-Brutalist Multi-Column Footer',
    category: 'MARKETING',
    description: 'Pie de página de 4 columnas con enlaces organizados, licencia MIT y botón de retorno al inicio.',
    snippet: `import FooterBlock from '@/blocks/FooterBlock.astro';\n\n<FooterBlock version="v2.4.0" />`,
    dependencies: ['badge'],
  },
];
