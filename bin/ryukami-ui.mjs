#!/usr/bin/env node
/**
 * 🐉 RYUKAMI-UI CLI // Scorch Design System Component Installer
 * Uso:
 *   ryukami-ui init [--dir <ruta>] [--overwrite]
 *   ryukami-ui list
 *   ryukami-ui add <componente...> [--dir <ruta>] [--overwrite] [--all]
 *   ryukami-ui info <componente>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.resolve(__dirname, '..');
const LOCAL_REGISTRY_DIR = path.join(CLI_ROOT, 'public', 'r');

// Colores ANSI Scorch
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[38;2;214;36;54m',
  cyan: '\x1b[38;2;77;163;255m',
  gold: '\x1b[38;2;244;211;94m',
  emerald: '\x1b[38;2;52;211;153m',
  bgRed: '\x1b[48;2;214;36;54m\x1b[38;2;255;255;255m',
  bgBlack: '\x1b[48;2;10;14;20m\x1b[38;2;77;163;255m',
};

function printBanner() {
  console.log('');
  console.log(`${C.bgRed}${C.bold} 🐉 RYUKAMI-UI CLI v2.1.0 ${C.reset} ${C.bgBlack}${C.bold} SCORCH_DRAGON // VELGRYND EDITION ${C.reset}`);
  console.log(`${C.dim}──────────────────────────────────────────────────────────────────────${C.reset}`);
}

function parseArgs(argv) {
  const positional = [];
  const flags = {
    dir: process.cwd(),
    overwrite: false,
    all: false,
    registry: process.env.RYUKAMI_REGISTRY_URL || null,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dir' || arg === '-d') {
      flags.dir = path.resolve(argv[++i] || '.');
    } else if (arg === '--overwrite' || arg === '-f' || arg === '--yes' || arg === '-y') {
      flags.overwrite = true;
    } else if (arg === '--all' || arg === '-a') {
      flags.all = true;
    } else if (arg === '--registry' || arg === '-r') {
      flags.registry = argv[++i];
    } else if (arg === '--help' || arg === '-h') {
      flags.help = true;
    } else {
      positional.push(arg);
    }
  }

  return { command: positional[0], args: positional.slice(1), flags };
}

async function loadRegistryJson(fileName, registryUrl) {
  if (registryUrl) {
    const cleanBase = registryUrl.replace(/\/+$/, '');
    const res = await fetch(`${cleanBase}/${fileName}`);
    if (!res.ok) {
      throw new Error(`No se pudo descargar ${fileName} desde ${cleanBase} (HTTP ${res.status})`);
    }
    return await res.json();
  }

  const localPath = path.join(LOCAL_REGISTRY_DIR, fileName);
  if (!fs.existsSync(localPath)) {
    throw new Error(`Archivo de registro no encontrado: ${localPath}`);
  }
  return JSON.parse(fs.readFileSync(localPath, 'utf-8'));
}

function showHelp() {
  printBanner();
  console.log(`${C.bold}COMANDOS DISPONIBLES:${C.reset}`);
  console.log(`  ${C.cyan}ryukami-ui init${C.reset}                  Inicializa tokens CSS (global.css) y ryukami.json`);
  console.log(`  ${C.cyan}ryukami-ui list${C.reset}                  Lista los 14 componentes disponibles en el registro`);
  console.log(`  ${C.cyan}ryukami-ui add <comp...>${C.reset}         Instala uno o varios componentes en tu proyecto`);
  console.log(`  ${C.cyan}ryukami-ui add --all${C.reset}             Instala el catálogo completo de componentes`);
  console.log(`  ${C.cyan}ryukami-ui info <comp>${C.reset}           Muestra detalles técnicos y ruta de un componente`);
  console.log('');
  console.log(`${C.bold}OPCIONES:${C.reset}`);
  console.log(`  ${C.gold}--dir, -d <ruta>${C.reset}                Directorio destino del proyecto (por defecto: actual)`);
  console.log(`  ${C.gold}--overwrite, -f${C.reset}                 Sobrescribe archivos existentes sin omitirlos`);
  console.log(`  ${C.gold}--registry, -r <url>${C.reset}            URL remota del registro (ej: http://localhost:4321/r)`);
  console.log('');
  console.log(`${C.bold}EJEMPLOS RÁPIDOS:${C.reset}`);
  console.log(`  ${C.red}$${C.reset} ryukami-ui list`);
  console.log(`  ${C.red}$${C.reset} ryukami-ui init --dir ./mi-app-astro`);
  console.log(`  ${C.red}$${C.reset} ryukami-ui add button card modal command-palette --dir ./mi-app-astro`);
  console.log('');
}

async function cmdList(flags) {
  printBanner();
  const master = await loadRegistryJson('registry.json', flags.registry);
  console.log(`${C.bold}CATÁLOGO DE COMPONENTES DISPONIBLES (${master.totalItems} MÓDULOS):${C.reset}\n`);

  const pad = (str, len) => str.padEnd(len, ' ');
  console.log(`  ${C.bold}${C.gold}${pad('ID CLI', 20)}${pad('CATEGORÍA', 24)}DESCRIPCIÓN${C.reset}`);
  console.log(`  ${C.dim}────────────────────────────────────────────────────────────────────────────${C.reset}`);

  for (const item of master.items) {
    const deps =
      item.registryDependencies && item.registryDependencies.length
        ? ` ${C.dim}[deps: ${item.registryDependencies.join(', ')}]${C.reset}`
        : '';
    console.log(
      `  ${C.cyan}${C.bold}${pad(item.name, 20)}${C.reset}${C.dim}${pad(item.category, 24)}${C.reset}${item.description}${deps}`
    );
  }

  console.log('');
  console.log(`${C.bold}Instalación rápida:${C.reset} ${C.red}$${C.reset} ryukami-ui add button card modal`);
  console.log('');
}

async function cmdInit(flags) {
  printBanner();
  const targetDir = flags.dir;
  const stylesPayload = await loadRegistryJson('styles.json', flags.registry);

  console.log(`${C.cyan}▶ Inicializando Scorch Design System en:${C.reset} ${C.bold}${targetDir}${C.reset}\n`);

  for (const file of stylesPayload.files) {
    const destPath = path.join(targetDir, file.path);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    if (fs.existsSync(destPath) && !flags.overwrite) {
      console.log(`  ${C.gold}⚠ Omitido (ya existe):${C.reset} ${file.path} ${C.dim}(usa --overwrite para reemplazar)${C.reset}`);
    } else {
      fs.writeFileSync(destPath, file.content, 'utf-8');
      console.log(`  ${C.emerald}✓ Tokens inyectados:${C.reset}   ${file.path}`);
    }
  }

  const configPath = path.join(targetDir, 'ryukami.json');
  const configData = {
    $schema: 'https://ryukami-ui.dev/schema.json',
    style: 'scorch-velgrynd-v4.1',
    tailwind: {
      version: '4.3.3',
      css: 'src/styles/global.css',
    },
    aliases: {
      components: 'src/components',
    },
  };

  if (!fs.existsSync(configPath) || flags.overwrite) {
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');
    console.log(`  ${C.emerald}✓ Configuración creada:${C.reset} ryukami.json`);
  } else {
    console.log(`  ${C.gold}⚠ Configuración existente:${C.reset} ryukami.json`);
  }

  console.log(`\n${C.bold}${C.emerald}⚡ ¡Listo! Ahora añade componentes con:${C.reset} ${C.cyan}ryukami-ui add button card modal${C.reset}\n`);
}

async function cmdAdd(args, flags) {
  printBanner();
  const master = await loadRegistryJson('registry.json', flags.registry);
  const validMap = new Map(master.items.map((i) => [i.name, i]));

  let requested = flags.all ? master.items.map((i) => i.name) : args.map((a) => a.toLowerCase());

  if (requested.length === 0) {
    console.error(`${C.red}✖ Error:${C.reset} Especifica al menos un componente o usa ${C.gold}--all${C.reset}.`);
    console.log(`  Ejemplo: ${C.cyan}ryukami-ui add button badge card${C.reset}\n`);
    process.exit(1);
  }

  // Resolver dependencias del registro (ej: command-palette -> kbd)
  const queue = [...requested];
  const resolvedSet = new Set();

  while (queue.length > 0) {
    const name = queue.shift();
    if (resolvedSet.has(name)) continue;

    if (!validMap.has(name)) {
      console.error(`${C.red}✖ Componente desconocido:${C.reset} "${name}". Ejecuta ${C.cyan}ryukami-ui list${C.reset} para ver los nombres válidos.\n`);
      process.exit(1);
    }

    const meta = validMap.get(name);
    if (meta.registryDependencies) {
      for (const dep of meta.registryDependencies) {
        if (!resolvedSet.has(dep)) {
          queue.push(dep);
        }
      }
    }
    resolvedSet.add(name);
  }

  console.log(`${C.cyan}▶ Destino:${C.reset} ${C.bold}${flags.dir}${C.reset}`);
  console.log(`${C.cyan}▶ Componentes a instalar (${resolvedSet.size}):${C.reset} ${Array.from(resolvedSet).join(', ')}\n`);

  let installedCount = 0;
  let skippedCount = 0;

  for (const name of resolvedSet) {
    const itemPayload = await loadRegistryJson(`${name}.json`, flags.registry);
    for (const file of itemPayload.files) {
      const destPath = path.join(flags.dir, file.path);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });

      if (fs.existsSync(destPath) && !flags.overwrite) {
        console.log(`  ${C.gold}⚠ Omitido (ya existe):${C.reset} ${file.path} ${C.dim}(usa --overwrite para sobrescribir)${C.reset}`);
        skippedCount++;
      } else {
        fs.writeFileSync(destPath, file.content, 'utf-8');
        console.log(`  ${C.emerald}✓ Instalado [${name}]:${C.reset} ${file.path}`);
        installedCount++;
      }
    }
  }

  console.log(`\n${C.dim}──────────────────────────────────────────────────────────────────────${C.reset}`);
  console.log(
    `${C.bold}${C.emerald}⚡ Operación completada:${C.reset} ${installedCount} instalado(s), ${skippedCount} omitido(s).\n`
  );
}

async function cmdInfo(args, flags) {
  printBanner();
  const name = (args[0] || '').toLowerCase();
  if (!name) {
    console.error(`${C.red}✖ Especifica el nombre del componente. Ejemplo: ryukami-ui info button${C.reset}\n`);
    process.exit(1);
  }

  const item = await loadRegistryJson(`${name}.json`, flags.registry);
  console.log(`${C.bold}${C.cyan}MÓDULO:${C.reset}       ${item.title} (${item.name})`);
  console.log(`${C.bold}${C.cyan}CATEGORÍA:${C.reset}    ${item.category}`);
  console.log(`${C.bold}${C.cyan}DESCRIPCIÓN:${C.reset}  ${item.description}`);
  console.log(`${C.bold}${C.cyan}DEPENDENCIAS:${C.reset} ${item.registryDependencies.length ? item.registryDependencies.join(', ') : 'Ninguna (Zero-Deps)'}`);
  console.log(`${C.bold}${C.cyan}ARCHIVOS:${C.reset}     ${item.files.map((f) => f.path).join(', ')}`);
  console.log(`${C.bold}${C.cyan}ENDPOINT:${C.reset}     /r/${item.name}.json\n`);
}

async function main() {
  const { command, args, flags } = parseArgs(process.argv.slice(2));

  if (flags.help || !command) {
    showHelp();
    return;
  }

  try {
    switch (command) {
      case 'list':
      case 'ls':
        await cmdList(flags);
        break;
      case 'init':
        await cmdInit(flags);
        break;
      case 'add':
      case 'install':
      case 'i':
        await cmdAdd(args, flags);
        break;
      case 'info':
      case 'inspect':
        await cmdInfo(args, flags);
        break;
      default:
        console.error(`${C.red}✖ Comando no reconocido:${C.reset} "${command}"`);
        showHelp();
        process.exit(1);
    }
  } catch (err) {
    console.error(`\n${C.red}✖ Error en RYUKAMI-UI CLI:${C.reset} ${err.message}\n`);
    process.exit(1);
  }
}

main();
