export type FrameworkId = 'astro' | 'react' | 'html';

export interface FrameworkSnippet {
  astro: string;
  react: string;
  html: string;
}

export const FRAMEWORK_METADATA = {
  astro: {
    id: 'astro' as const,
    label: 'ASTRO',
    language: 'ASTRO',
    fileExt: 'astro',
    getFilename: (slug: string) => `src/pages/${slug}-ejemplo.astro`,
  },
  react: {
    id: 'react' as const,
    label: 'REACT (TSX)',
    language: 'TSX // REACT',
    fileExt: 'tsx',
    getFilename: (slug: string) => `src/components/${toPascalCase(slug)}.tsx`,
  },
  html: {
    id: 'html' as const,
    label: 'HTML / TAILWIND',
    language: 'HTML // TAILWIND',
    fileExt: 'html',
    getFilename: (slug: string) => `public/${slug}-snippet.html`,
  },
};

function toPascalCase(slug: string): string {
  const overrides: Record<string, string> = {
    'stat-card': 'StatCard',
    'progress-bar': 'ProgressBar',
    'radio-group': 'RadioGroup',
    'toast-container': 'ToastContainer',
    'command-palette': 'CommandPalette',
    'bento-grid': 'BentoGrid',
    'data-table': 'DataTable',
    'code-block': 'CodeBlock',
    'audio-synth': 'AudioSynth',
    'terminal-emulator': 'TerminalEmulator',
    'component-preview': 'ComponentPreview',
    'theme-studio': 'ThemeStudio',
    'ascii-generator': 'AsciiGenerator',
    'tree-view': 'TreeView',
    'date-picker': 'DatePicker',
    'kanban-board': 'KanbanBoard',
  };
  if (overrides[slug]) return overrides[slug];
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

// Hand-crafted snippets para primitivos clave y módulos esenciales
const HANDCRAFTED_SNIPPETS: Record<string, { react: string; html: string }> = {
  button: {
    react: `import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'crimson' | 'cyan' | 'gold' | 'dark' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'crimson',
  size = 'md',
  className = '',
  ...props
}) => {
  const variants = {
    crimson: 'bg-[#D62436] text-white hover:bg-black',
    cyan: 'bg-[#4DA3FF] text-black hover:bg-white',
    gold: 'bg-[#F4D35E] text-black hover:bg-white',
    dark: 'bg-[#0B0F17] text-white hover:bg-[#D62436]',
    outline: 'bg-transparent text-current hover:bg-[#D62436] hover:text-white',
  };
  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-2.5 text-sm',
  };

  return (
    <button
      className={\`border-2 border-black font-mono font-extrabold shadow-[-4px_4px_0px_0px_#000000] active:-translate-x-0.5 active:translate-y-0.5 transition-transform duration-75 cursor-pointer \${variants[variant]} \${sizes[size]} \${className}\`}
      {...props}
    >
      {children}
    </button>
  );
};

// Ejemplo de uso:
export default function App() {
  return (
    <div className="flex flex-wrap gap-3 p-4">
      <Button variant="crimson" size="md">Carmesi Scorch</Button>
      <Button variant="cyan" size="md">Cian Electrico</Button>
      <Button variant="gold" size="md">Oro Dragon</Button>
      <Button variant="dark" size="md">Modo Hacker</Button>
    </div>
  );
}`,
    html: `<!-- Ryukami Neo-Brutalist Buttons (HTML + Tailwind CSS v4) -->
<div class="flex flex-wrap gap-3">
  <!-- Variante Carmesi Scorch -->
  <button class="border-2 border-black bg-[#D62436] text-white font-mono font-extrabold text-xs px-4 py-2 shadow-[-4px_4px_0px_0px_#000000] active:-translate-x-0.5 active:translate-y-0.5 transition-transform duration-75 cursor-pointer">
    Carmesi Scorch
  </button>

  <!-- Variante Cian Electrico -->
  <button class="border-2 border-black bg-[#4DA3FF] text-black font-mono font-extrabold text-xs px-4 py-2 shadow-[-4px_4px_0px_0px_#000000] active:-translate-x-0.5 active:translate-y-0.5 transition-transform duration-75 cursor-pointer">
    Cian Electrico
  </button>

  <!-- Variante Oro Dragon -->
  <button class="border-2 border-black bg-[#F4D35E] text-black font-mono font-extrabold text-xs px-4 py-2 shadow-[-4px_4px_0px_0px_#000000] active:-translate-x-0.5 active:translate-y-0.5 transition-transform duration-75 cursor-pointer">
    Oro Dragon
  </button>

  <!-- Variante Hacker Dark -->
  <button class="border-2 border-black bg-[#0B0F17] text-white font-mono font-extrabold text-xs px-4 py-2 shadow-[-4px_4px_0px_0px_#000000] active:-translate-x-0.5 active:translate-y-0.5 transition-transform duration-75 cursor-pointer">
    Modo Hacker
  </button>
</div>`,
  },
  badge: {
    react: `import React from 'react';

interface BadgeProps {
  variant?: 'crimson' | 'cyan' | 'gold' | 'dark' | 'outline' | 'emerald';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'crimson', children }) => {
  const styles = {
    crimson: 'bg-[#D62436] text-white border-black',
    cyan: 'bg-[#4DA3FF] text-black border-black',
    gold: 'bg-[#F4D35E] text-black border-black',
    dark: 'bg-[#0B0F17] text-white border-black',
    outline: 'bg-transparent text-current border-current',
    emerald: 'bg-[#10B981] text-black border-black',
  };

  return (
    <span
      className={\`inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase border shadow-[-2px_2px_0px_0px_#000000] \${styles[variant]}\`}
    >
      {children}
    </span>
  );
};

// Ejemplo de uso:
export default function StatusPanel() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="crimson">● SYSTEM_ALERT</Badge>
      <Badge variant="cyan">◆ RE_ENGINEERING</Badge>
      <Badge variant="gold">[*] VELGRYND_CORE</Badge>
      <Badge variant="emerald">[OK] PRODUCTION</Badge>
    </div>
  );
}`,
    html: `<!-- Ryukami TUI Badges (HTML + Tailwind CSS v4) -->
<div class="flex flex-wrap items-center gap-2">
  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase border border-black bg-[#D62436] text-white shadow-[-2px_2px_0px_0px_#000000]">
    ● SYSTEM_ALERT
  </span>
  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase border border-black bg-[#4DA3FF] text-black shadow-[-2px_2px_0px_0px_#000000]">
    ◆ RE_ENGINEERING
  </span>
  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase border border-black bg-[#F4D35E] text-black shadow-[-2px_2px_0px_0px_#000000]">
    [*] VELGRYND_CORE
  </span>
  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase border border-black bg-[#10B981] text-black shadow-[-2px_2px_0px_0px_#000000]">
    [OK] PRODUCTION
  </span>
</div>`,
  },
  card: {
    react: `import React from 'react';

interface CardProps {
  title: string;
  status?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, status = 'ONLINE', children }) => {
  return (
    <div className="border-2 border-black bg-white dark:bg-slate-900 shadow-[-4px_4px_0px_0px_#000000] font-mono">
      <div className="bg-[#0A0E14] text-white px-3 py-1.5 text-xs font-extrabold flex items-center justify-between border-b-2 border-black">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#4DA3FF] border border-black inline-block" />
          &gt; {title}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-black px-1.5 py-0.5 border border-slate-700">{status}</span>
          <div className="inline-flex items-center gap-1 text-[11px]">
            <span className="w-4 h-4 border border-current flex items-center justify-center">-</span>
            <span className="w-4 h-4 border border-current flex items-center justify-center">□</span>
            <span className="w-4 h-4 border border-current flex items-center justify-center bg-[#D62436] text-white">×</span>
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};`,
    html: `<!-- Ryukami Card TUI Window (HTML + Tailwind CSS v4) -->
<div class="border-2 border-black bg-white dark:bg-slate-900 shadow-[-4px_4px_0px_0px_#000000] font-mono">
  <div class="bg-[#0A0E14] text-white px-3 py-1.5 text-xs font-extrabold flex items-center justify-between border-b-2 border-black select-none">
    <span class="flex items-center gap-2">
      <span class="w-2.5 h-2.5 bg-[#4DA3FF] border border-black inline-block"></span>
      &gt; 0xSERVER // NODE_2
    </span>
    <div class="flex items-center gap-2">
      <span class="text-[10px] bg-black px-1.5 py-0.5 border border-slate-700">ONLINE</span>
      <div class="inline-flex items-center gap-1 text-[11px]">
        <span class="w-4 h-4 border border-current flex items-center justify-center">-</span>
        <span class="w-4 h-4 border border-current flex items-center justify-center">□</span>
        <span class="w-4 h-4 border border-current flex items-center justify-center bg-[#D62436] text-white">×</span>
      </div>
    </div>
  </div>
  <div class="p-5 space-y-3 text-slate-900 dark:text-slate-100">
    <h4 class="font-extrabold text-base uppercase">Botkeep Cloud Container</h4>
    <p class="text-xs leading-relaxed opacity-80">Contenedor asignado con 2 GB de RAM, PostgreSQL 17 y Redis 7.2.</p>
  </div>
</div>`,
  },
  kbd: {
    react: `import React from 'react';

export const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="inline-block px-1.5 py-0.5 font-mono text-[11px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-black dark:border-slate-600 shadow-[-2px_2px_0px_0px_#000000]">
    {children}
  </kbd>
);

// Ejemplo de atajo:
export default function Shortcut() {
  return (
    <div className="font-mono text-xs flex items-center gap-1.5">
      <span>Comando de búsqueda:</span>
      <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>
    </div>
  );
}`,
    html: `<!-- Ryukami Keycaps (HTML + Tailwind CSS v4) -->
<div class="font-mono text-xs flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
  <span>Comando de búsqueda:</span>
  <kbd class="inline-block px-1.5 py-0.5 font-mono text-[11px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-black shadow-[-2px_2px_0px_0px_#000000]">Ctrl</kbd>
  <span>+</span>
  <kbd class="inline-block px-1.5 py-0.5 font-mono text-[11px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-black shadow-[-2px_2px_0px_0px_#000000]">K</kbd>
</div>`,
  },
  'progress-bar': {
    react: `import React from 'react';

interface ProgressBarProps {
  label: string;
  value: number;
  status?: string;
  variant?: 'crimson' | 'cyan' | 'gold' | 'emerald';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  status,
  variant = 'crimson',
}) => {
  const colors = {
    crimson: 'bg-[#D62436]',
    cyan: 'bg-[#4DA3FF]',
    gold: 'bg-[#F4D35E]',
    emerald: 'bg-[#10B981]',
  };

  return (
    <div className="space-y-1.5 font-mono text-xs">
      <div className="flex justify-between items-center font-bold">
        <span>{label}</span>
        <span className="text-[11px] text-slate-500">{status || \`\${value}%\`}</span>
      </div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 border-2 border-black p-0.5">
        <div
          className={\`h-full \${colors[variant]} transition-all duration-300\`}
          style={{ width: \`\${Math.min(100, Math.max(0, value))}%\` }}
        />
      </div>
    </div>
  );
};`,
    html: `<!-- Ryukami Progress Bar (HTML + Tailwind CSS v4) -->
<div class="space-y-1.5 font-mono text-xs">
  <div class="flex justify-between items-center font-bold">
    <span>Nucleo Termico Velgrynd</span>
    <span class="text-[11px] text-[#D62436] font-extrabold">CRITICAL (92%)</span>
  </div>
  <div class="h-4 bg-slate-200 dark:bg-slate-800 border-2 border-black p-0.5">
    <div class="h-full bg-[#D62436]" style="width: 92%;"></div>
  </div>
</div>`,
  },
  input: {
    react: `import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prefix?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({ label, prefix, hint, className = '', ...props }) => (
  <div className="space-y-1 font-mono text-xs">
    {label && <label className="block font-bold uppercase">{label}</label>}
    <div className="flex border-2 border-black bg-white dark:bg-slate-900 shadow-[-2px_2px_0px_0px_#000000]">
      {prefix && (
        <span className="bg-black text-[#F4D35E] px-2.5 py-1.5 font-extrabold select-none border-r border-black">
          {prefix}
        </span>
      )}
      <input
        className={\`w-full px-3 py-1.5 bg-transparent font-mono text-xs outline-none \${className}\`}
        {...props}
      />
    </div>
    {hint && <span className="text-[10px] text-slate-500 font-bold block">{hint}</span>}
  </div>
);`,
    html: `<!-- Ryukami Input Terminal Prefix (HTML + Tailwind CSS v4) -->
<div class="space-y-1 font-mono text-xs">
  <label class="block font-bold uppercase">Comando CLI</label>
  <div class="flex border-2 border-black bg-white dark:bg-slate-900 shadow-[-2px_2px_0px_0px_#000000]">
    <span class="bg-black text-[#F4D35E] px-2.5 py-1.5 font-extrabold select-none border-r border-black">$</span>
    <input class="w-full px-3 py-1.5 bg-transparent font-mono text-xs outline-none" placeholder="ryukami-ui add button" />
  </div>
  <span class="text-[10px] text-slate-500 font-bold block">Ejecuta en tu terminal de confianza</span>
</div>`,
  },
  checkbox: {
    react: `import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, description, ...props }) => (
  <label className="flex items-start gap-3 cursor-pointer group font-mono text-xs select-none">
    <input type="checkbox" className="peer sr-only" {...props} />
    <div className="w-5 h-5 bg-white dark:bg-slate-900 border-2 border-black shadow-[-2px_2px_0px_0px_#000000] flex items-center justify-center peer-checked:bg-[#D62436] peer-checked:text-white transition-transform active:translate-x-0.5">
      <span className="opacity-0 peer-checked:opacity-100 font-extrabold text-xs">X</span>
    </div>
    <div className="space-y-0.5">
      <span className="block font-bold uppercase group-hover:text-[#D62436]">{label}</span>
      {description && <span className="block text-[11px] text-slate-600 dark:text-slate-400">{description}</span>}
    </div>
  </label>
);`,
    html: `<!-- Ryukami Checkbox (HTML + Tailwind CSS v4) -->
<label class="flex items-start gap-3 cursor-pointer group font-mono text-xs select-none">
  <input type="checkbox" class="peer sr-only" checked />
  <div class="w-5 h-5 bg-white dark:bg-slate-900 border-2 border-black shadow-[-2px_2px_0px_0px_#000000] flex items-center justify-center peer-checked:bg-[#D62436] peer-checked:text-white transition-transform">
    <span class="opacity-0 peer-checked:opacity-100 font-extrabold text-xs">X</span>
  </div>
  <div class="space-y-0.5">
    <span class="block font-bold uppercase group-hover:text-[#D62436]">Autenticacion Cuantica</span>
    <span class="block text-[11px] text-slate-600 dark:text-slate-400">Requiere llave SSH ed25519 fisica</span>
  </div>
</label>`,
  },
  switch: {
    react: `import React, { useState } from 'react';

interface SwitchProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({ label, checked: initial = false, onChange }) => {
  const [checked, setChecked] = useState(initial);
  const toggle = () => {
    const next = !checked;
    setChecked(next);
    onChange?.(next);
  };

  return (
    <label className="flex items-center gap-3 cursor-pointer select-none font-mono text-xs" onClick={toggle}>
      <div className={\`w-12 h-6 border-2 border-black p-0.5 transition-colors \${checked ? 'bg-[#D62436]' : 'bg-slate-200 dark:bg-slate-800'}\`}>
        <div className={\`w-4 h-4 bg-white border border-black transition-transform \${checked ? 'translate-x-6' : 'translate-x-0'}\`} />
      </div>
      <span className="font-bold uppercase">{label}</span>
    </label>
  );
};`,
    html: `<!-- Ryukami Switch (HTML + Tailwind CSS v4) -->
<label class="flex items-center gap-3 cursor-pointer select-none font-mono text-xs">
  <input type="checkbox" class="peer sr-only" checked />
  <div class="w-12 h-6 border-2 border-black p-0.5 bg-slate-200 dark:bg-slate-800 peer-checked:bg-[#D62436] transition-colors">
    <div class="w-4 h-4 bg-white border border-black peer-checked:translate-x-6 transition-transform"></div>
  </div>
  <span class="font-bold uppercase">Vigilancia RF Activa</span>
</label>`,
  },
  alert: {
    react: `import React from 'react';

interface AlertProps {
  variant?: 'crimson' | 'cyan' | 'gold' | 'emerald';
  title: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'crimson', title, children }) => {
  const tagBg = {
    crimson: 'bg-[#D62436] text-white',
    cyan: 'bg-[#4DA3FF] text-black',
    gold: 'bg-[#F4D35E] text-black',
    emerald: 'bg-[#10B981] text-black',
  };

  return (
    <div className="border-2 border-black dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-[-4px_4px_0px_0px_#000000] font-mono text-xs space-y-2">
      <div className="flex items-center gap-2">
        <span className={\`px-2 py-0.5 text-[10px] font-extrabold uppercase border border-black \${tagBg[variant]}\`}>
          {title}
        </span>
      </div>
      <div className="text-slate-700 dark:text-slate-300 leading-relaxed">{children}</div>
    </div>
  );
};`,
    html: `<!-- Ryukami Alert Box (HTML + Tailwind CSS v4) -->
<div class="border-2 border-black dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-[-4px_4px_0px_0px_#000000] font-mono text-xs space-y-2">
  <div class="flex items-center gap-2">
    <span class="bg-[#D62436] text-white px-2 py-0.5 text-[10px] font-extrabold uppercase border border-black">
      ALERTA CRITICA // KERNEL FAULT
    </span>
  </div>
  <p class="text-slate-700 dark:text-slate-300 leading-relaxed">
    Sobrecarga termica detectada en el bus primario de procesamiento.
  </p>
</div>`,
  },
  modal: {
    react: `import React, { useRef } from 'react';

export const ModalDemo: React.FC = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="btn-brutal bg-[#D62436] text-white px-4 py-2 font-mono text-xs font-bold border-2 border-black shadow-[-4px_4px_0px_0px_#000000]"
      >
        &gt; ABRIR MODAL
      </button>

      <dialog
        ref={dialogRef}
        className="border-2 border-black bg-white dark:bg-slate-900 shadow-[-6px_6px_0px_0px_#000000] p-0 font-mono text-xs backdrop:bg-black/60 max-w-lg w-full"
      >
        <div className="bg-[#0A0E14] text-white px-3 py-1.5 font-bold flex justify-between items-center border-b-2 border-black">
          <span>0xMODAL // SYSTEM</span>
          <button onClick={() => dialogRef.current?.close()} className="px-1 hover:bg-[#D62436]">×</button>
        </div>
        <div className="p-5 space-y-4">
          <h3 className="text-base font-extrabold uppercase">Confirmacion Requerida</h3>
          <p className="text-slate-600 dark:text-slate-300">¿Deseas reiniciar el cluster de microservicios?</p>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => dialogRef.current?.close()} className="px-3 py-1.5 border border-black">Cancelar</button>
            <button onClick={() => dialogRef.current?.close()} className="px-3 py-1.5 bg-[#D62436] text-white font-bold border border-black">Confirmar</button>
          </div>
        </div>
      </dialog>
    </>
  );
};`,
    html: `<!-- Ryukami HTML5 Native Dialog Modal -->
<button onclick="document.getElementById('demo-modal').showModal()" class="btn-brutal bg-[#D62436] text-white px-4 py-2 font-mono text-xs font-bold border-2 border-black shadow-[-4px_4px_0px_0px_#000000]">
  &gt; ABRIR MODAL
</button>

<dialog id="demo-modal" class="border-2 border-black bg-white dark:bg-slate-900 shadow-[-6px_6px_0px_0px_#000000] p-0 font-mono text-xs backdrop:bg-black/60 max-w-lg w-full">
  <div class="bg-[#0A0E14] text-white px-3 py-1.5 font-bold flex justify-between items-center border-b-2 border-black">
    <span>0xMODAL // SYSTEM</span>
    <button onclick="document.getElementById('demo-modal').close()" class="px-1 hover:bg-[#D62436]">×</button>
  </div>
  <div class="p-5 space-y-4">
    <h3 class="text-base font-extrabold uppercase">Confirmacion Requerida</h3>
    <p class="text-slate-600 dark:text-slate-300">¿Deseas reiniciar el cluster de microservicios?</p>
    <div class="flex justify-end gap-2 pt-2">
      <button onclick="document.getElementById('demo-modal').close()" class="px-3 py-1.5 border border-black">Cancelar</button>
      <button onclick="document.getElementById('demo-modal').close()" class="px-3 py-1.5 bg-[#D62436] text-white font-bold border border-black">Confirmar</button>
    </div>
  </div>
</dialog>`,
  },
};

// Generador inteligente de fallback para cualquier componente Astro
function transformAstroToReact(slug: string, astroCode: string): string {
  const componentName = toPascalCase(slug);

  // Separar frontmatter y cuerpo
  const lines = astroCode.split('\n');
  const bodyLines: string[] = [];
  let inFrontmatter = false;
  let fmCount = 0;

  for (const line of lines) {
    if (line.trim() === '---') {
      fmCount++;
      inFrontmatter = fmCount === 1;
      continue;
    }
    if (!inFrontmatter && fmCount >= 2) {
      bodyLines.push(line);
    } else if (fmCount === 0) {
      if (!line.trim().startsWith('import ')) {
        bodyLines.push(line);
      }
    }
  }

  const rawBody = bodyLines.join('\n').trim();
  const reactBody = rawBody
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/<!--(.*?)-->/g, '{/* $1 */}');

  return `import React from 'react';
import { ${componentName} } from '@/components/${componentName}';

export default function ${componentName}Example() {
  return (
    <div className="space-y-4 font-mono">
${reactBody
  .split('\n')
  .map((l) => (l ? `      ${l}` : ''))
  .join('\n')}
    </div>
  );
}`;
}

function transformAstroToHtml(slug: string, astroCode: string): string {
  const lines = astroCode.split('\n');
  const bodyLines: string[] = [];
  let inFrontmatter = false;
  let fmCount = 0;

  for (const line of lines) {
    if (line.trim() === '---') {
      fmCount++;
      inFrontmatter = fmCount === 1;
      continue;
    }
    if (!inFrontmatter && fmCount >= 2) {
      bodyLines.push(line);
    } else if (fmCount === 0) {
      if (!line.trim().startsWith('import ')) {
        bodyLines.push(line);
      }
    }
  }

  const rawBody = bodyLines.join('\n').trim();
  return `<!-- Ryukami ${toPascalCase(slug)} Component (HTML5 + Tailwind CSS v4) -->\n${rawBody}`;
}

export function getMultiFrameworkSnippets(slug: string, astroCode: string): FrameworkSnippet {
  const custom = HANDCRAFTED_SNIPPETS[slug];
  return {
    astro: astroCode,
    react: custom?.react || transformAstroToReact(slug, astroCode),
    html: custom?.html || transformAstroToHtml(slug, astroCode),
  };
}
