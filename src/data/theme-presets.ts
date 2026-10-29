export interface ThemeColors {
  primary: string;
  whisker: string;
  gold: string;
  dark: string;
  canvasLight: string;
  canvasDark: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  edition: string;
  tag: string;
  badgeVariant: 'crimson' | 'emerald' | 'gold' | 'cyan';
  description: string;
  contrast: string;
  colors: ThemeColors;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'scorch',
    name: 'Scorch Crimson',
    edition: 'Velgrynd Original // Canonical',
    tag: 'CANONICAL',
    badgeVariant: 'crimson',
    description: 'Fuego primordial calibrado para superar WCAG AA (5.04:1). La paleta insignia del Scorch Design System.',
    contrast: '5.04:1 (WCAG AA)',
    colors: {
      primary: '#D62436',
      whisker: '#4DA3FF',
      gold: '#F4D35E',
      dark: '#9B1B30',
      canvasLight: '#F5F7FA',
      canvasDark: '#0B0F17',
    },
  },
  {
    id: 'matrix',
    name: 'Phosphor CRT',
    edition: 'Matrix Emerald // Phosphor 525',
    tag: 'CRT RETRO',
    badgeVariant: 'emerald',
    description: 'Emulacion de fosforo P1 verde clasico de monitores VT100 y consolas mainframe IBM.',
    contrast: '5.12:1 (WCAG AA)',
    colors: {
      primary: '#10B981',
      whisker: '#34D399',
      gold: '#F59E0B',
      dark: '#065F46',
      canvasLight: '#F0FDF4',
      canvasDark: '#022C22',
    },
  },
  {
    id: 'amber',
    name: 'Dungeon Gold',
    edition: 'Amber Glow // Dragon Hoard',
    tag: 'RPG GOLD',
    badgeVariant: 'gold',
    description: 'Tonos ambar calidos y bronce forjado, evocando terminales de plasma y juegos de rol clasicos.',
    contrast: '5.28:1 (WCAG AA)',
    colors: {
      primary: '#D97706',
      whisker: '#38BDF8',
      gold: '#FBBF24',
      dark: '#78350F',
      canvasLight: '#FFFBEB',
      canvasDark: '#1C1917',
    },
  },
  {
    id: 'paper',
    name: 'Paper Brutalism',
    edition: 'Swiss Mono Noir // Print Ink',
    tag: 'EDITORIAL',
    badgeVariant: 'cyan',
    description: 'Arquitectura monocromica suiza de maximo contraste y tinta negra cruda sobre papel marfil.',
    contrast: '14.2:1 (WCAG AAA)',
    colors: {
      primary: '#0F172A',
      whisker: '#64748B',
      gold: '#94A3B8',
      dark: '#020617',
      canvasLight: '#FFFFFF',
      canvasDark: '#0B0F17',
    },
  },
  {
    id: 'cyber',
    name: 'Cyber Neon',
    edition: 'Neo-Tokyo Sunset // Synthwave TUI',
    tag: 'SYNTHWAVE',
    badgeVariant: 'crimson',
    description: 'Fucsia laser y azul ciberpunk de alto impacto para tableros de mando futuristas.',
    contrast: '4.86:1 (WCAG AA)',
    colors: {
      primary: '#DB2777',
      whisker: '#06B6D4',
      gold: '#F59E0B',
      dark: '#831843',
      canvasLight: '#FDF2F8',
      canvasDark: '#0F172A',
    },
  },
  {
    id: 'emperor',
    name: 'Velgrynd Flame',
    edition: 'Emperor Supreme // Dragon Flare',
    tag: 'SUPREME',
    badgeVariant: 'gold',
    description: 'Matiz carmesi ardiente combinado con reflejos de plasma solar e interferometria de iones.',
    contrast: '5.35:1 (WCAG AA)',
    colors: {
      primary: '#E11D48',
      whisker: '#0284C7',
      gold: '#EA580C',
      dark: '#4C0519',
      canvasLight: '#FFF1F2',
      canvasDark: '#18040A',
    },
  },
];

export const THEME_PRESETS_MAP: Record<string, ThemePreset> = THEME_PRESETS.reduce(
  (acc, preset) => {
    acc[preset.id] = preset;
    return acc;
  },
  {} as Record<string, ThemePreset>
);

export const DEFAULT_THEME_ID = 'scorch';

export function getThemePreset(id: string): ThemePreset {
  return THEME_PRESETS_MAP[id] || THEME_PRESETS_MAP[DEFAULT_THEME_ID];
}
