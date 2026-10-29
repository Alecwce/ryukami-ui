#!/usr/bin/env node
/**
 * RYUKAMI-UI CLI v2.4.0 // Scorch Design System Component Installer & MCP Server
 * Uso:
 *   ryukami-ui init [--dir <ruta>] [--overwrite] [--obsidian]
 *   ryukami-ui list
 *   ryukami-ui add <componente...> [--dir <ruta>] [--overwrite] [--all]
 *   ryukami-ui info <componente>
 *   ryukami-ui diff [--dir <ruta>]
 *   ryukami-ui mcp
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.resolve(__dirname, '..');
const LOCAL_REGISTRY_DIR = path.join(CLI_ROOT, 'public', 'r');
const CLI_USER_AGENT = 'ryukami-ui-cli/2.4.0';

/**
 * Helper de Ciberseguridad: Prevención de Arbitrary File Write y Path Traversal
 * Valida que la ruta final resuelta se encuentre estrictamente dentro de targetDir.
 */
function resolveSafeTargetPath(targetDir, relativePath) {
  if (!relativePath || typeof relativePath !== 'string') {
    throw new Error('[SECURITY ALERT] Ruta de archivo inválida o vacía.');
  }

  // Cross-platform: normalizar backslashes de Windows a forward slashes
  const normalizedSlashes = relativePath.replace(/\\/g, '/');
  const normalized = path.normalize(normalizedSlashes);
  const safeBase = path.basename(normalized);

  if (!safeBase || safeBase === '.' || safeBase === '..') {
    throw new Error(`[SECURITY ALERT] Nombre de archivo inválido: "${relativePath}"`);
  }

  const resolvedTarget = path.resolve(targetDir);
  const resolvedPath = path.resolve(resolvedTarget, normalized);

  if (!resolvedPath.startsWith(resolvedTarget + path.sep)) {
    throw new Error(
      `[SECURITY ALERT] Intento de Path Traversal bloqueado: "${relativePath}" intenta escapar de "${resolvedTarget}"`
    );
  }
  return resolvedPath;
}

/**
 * Validador de esquema de integridad para payloads del Registry
 */
function validateRegistryPayload(payload, expectedName) {
  if (!payload || typeof payload !== 'object') {
    throw new Error(`Respuesta inválida recibida para "${expectedName}": no es un objeto JSON válido.`);
  }
  if (expectedName === 'registry.json') {
    if (!Array.isArray(payload.items)) {
      throw new Error(`El registro maestro registry.json no contiene una lista de items válida.`);
    }
    return;
  }
  if (expectedName === 'tokens.json') {
    if (!payload.meta || !payload.velgrynd_palette) {
      throw new Error(`El archivo tokens.json no contiene la estructura W3C Design Tokens esperada.`);
    }
    return;
  }
  if (!payload.name || typeof payload.name !== 'string') {
    throw new Error(`El módulo descargado no contiene un atributo "name" válido.`);
  }
  if (!Array.isArray(payload.files) || payload.files.length === 0) {
    throw new Error(`El módulo "${payload.name}" no define ningún archivo en el array "files".`);
  }
  for (const file of payload.files) {
    if (!file.path || typeof file.path !== 'string') {
      throw new Error(`Archivo sin ruta válida en el módulo "${payload.name}".`);
    }
    if (typeof file.content !== 'string') {
      throw new Error(`Archivo sin contenido de texto en "${file.path}".`);
    }
  }
}

/**
 * Verificación de integridad criptográfica SHA-256
 */
function verifyFileIntegrity(file) {
  if (file.sha256) {
    const computed = crypto.createHash('sha256').update(file.content, 'utf-8').digest('hex');
    if (computed !== file.sha256) {
      throw new Error(
        `[INTEGRITY ERROR] Fallo de suma de verificación SHA-256 en ${file.path}.\nEsperado: ${file.sha256}\nCalculado: ${computed}`
      );
    }
  }
}

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
  console.log(`${C.bgRed}${C.bold} RYUKAMI-UI CLI v2.4.0 ${C.reset} ${C.bgBlack}${C.bold} SCORCH DESIGN SYSTEM ${C.reset}`);
  console.log(`${C.dim}──────────────────────────────────────────────────────────────────────${C.reset}`);
}

function parseArgs(argv) {
  const positional = [];
  const flags = {
    dir: process.cwd(),
    overwrite: false,
    all: false,
    obsidian: false,
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
    } else if (arg === '--obsidian') {
      flags.obsidian = true;
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

const DEFAULT_REMOTE_REGISTRY = 'https://ryukami-ui.pages.dev/r';

async function fetchRegistryEndpoint(url, fileName) {
  let res;
  try {
    res = await fetch(url, {
      headers: {
        'User-Agent': CLI_USER_AGENT,
        Accept: 'application/json',
      },
    });
  } catch (err) {
    throw new Error(`Error de conexión con el Registry (${url}): ${err.message}`);
  }

  if (res.status === 403) {
    throw new Error(
      `[403 FORBIDDEN] Petición interceptada por Cloudflare WAF o política de seguridad en ${url}. Verifica tu conexión.`
    );
  }
  if (res.status === 404) {
    throw new Error(
      `[404 NOT FOUND] El archivo "${fileName}" no existe en el registro (${url}).`
    );
  }
  if (res.status === 429) {
    throw new Error(
      `[429 RATE LIMIT] Límite de peticiones excedido en Cloudflare Edge. Por favor espera unos momentos antes de reintentar.`
    );
  }
  if (!res.ok) {
    throw new Error(`Fallo de descarga HTTP ${res.status} desde ${url}`);
  }

  const data = await res.json();
  validateRegistryPayload(data, fileName);
  return data;
}

async function loadRegistryJson(fileName, registryUrl) {
  if (registryUrl) {
    const cleanBase = registryUrl.replace(/\/+$/, '');
    return await fetchRegistryEndpoint(`${cleanBase}/${fileName}`, fileName);
  }

  const localPath = path.join(LOCAL_REGISTRY_DIR, fileName);
  if (fs.existsSync(localPath)) {
    const raw = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
    validateRegistryPayload(raw, fileName);
    return raw;
  }

  return await fetchRegistryEndpoint(`${DEFAULT_REMOTE_REGISTRY}/${fileName}`, fileName);
}

function showHelp() {
  printBanner();
  console.log(`${C.bold}COMANDOS DISPONIBLES:${C.reset}`);
  console.log(`  ${C.cyan}ryukami-ui init${C.reset}                  Inicializa tokens CSS (global.css) y ryukami.json`);
  console.log(`  ${C.cyan}ryukami-ui init --obsidian${C.reset}       Exporta además tokens W3C (design-tokens.json) para Obsidian`);
  console.log(`  ${C.cyan}ryukami-ui list${C.reset}                  Lista los 35 componentes disponibles en el registro`);
  console.log(`  ${C.cyan}ryukami-ui add <comp...>${C.reset}         Instala uno o varios componentes en tu proyecto`);
  console.log(`  ${C.cyan}ryukami-ui add --all${C.reset}             Instala el catálogo completo de 35 componentes`);
  console.log(`  ${C.cyan}ryukami-ui info <comp>${C.reset}           Muestra detalles técnicos, SHA-256 y ruta de un componente`);
  console.log(`  ${C.cyan}ryukami-ui diff${C.reset}                  Verifica integridad SHA-256 de componentes instalados vs registro`);
  console.log(`  ${C.cyan}ryukami-ui mcp${C.reset}                   Inicia servidor MCP (stdio JSON-RPC 2.0) para Agentes de IA`);
  console.log('');
  console.log(`${C.bold}OPCIONES:${C.reset}`);
  console.log(`  ${C.gold}--dir, -d <ruta>${C.reset}                Directorio destino del proyecto (por defecto: actual)`);
  console.log(`  ${C.gold}--overwrite, -f${C.reset}                 Sobrescribe archivos existentes sin omitirlos`);
  console.log(`  ${C.gold}--obsidian${C.reset}                      Incluye design-tokens.json en ryukami-ui init`);
  console.log(`  ${C.gold}--registry, -r <url>${C.reset}            URL remota del registro (por defecto: https://ryukami-ui.pages.dev/r)`);
  console.log('');
  console.log(`${C.bold}EJEMPLOS RÁPIDOS:${C.reset}`);
  console.log(`  ${C.red}$${C.reset} ryukami-ui list`);
  console.log(`  ${C.red}$${C.reset} ryukami-ui init --dir ./mi-app-astro`);
  console.log(`  ${C.red}$${C.reset} ryukami-ui add button card callout bento-grid data-table --dir ./mi-app-astro`);
  console.log(`  ${C.red}$${C.reset} ryukami-ui diff --dir ./mi-app-astro`);
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
  console.log(`${C.bold}Instalación rápida:${C.reset} ${C.red}$${C.reset} ryukami-ui add button card callout bento-grid data-table`);
  console.log('');
}

async function cmdInit(flags) {
  printBanner();
  const targetDir = flags.dir;
  const stylesPayload = await loadRegistryJson('styles.json', flags.registry);

  console.log(`${C.cyan}> Inicializando Scorch Design System en:${C.reset} ${C.bold}${targetDir}${C.reset}\n`);

  for (const file of stylesPayload.files) {
    verifyFileIntegrity(file);
    const destPath = resolveSafeTargetPath(targetDir, file.path);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    if (fs.existsSync(destPath) && !flags.overwrite) {
      console.log(`  ${C.gold}[SKIP] Omitido (ya existe):${C.reset} ${file.path} ${C.dim}(usa --overwrite para reemplazar)${C.reset}`);
    } else {
      fs.writeFileSync(destPath, file.content, 'utf-8');
      console.log(`  ${C.emerald}[OK] Tokens inyectados e integridad verificada:${C.reset} ${file.path}`);
    }
  }

  if (flags.obsidian) {
    const tokensPayload = await loadRegistryJson('tokens.json', flags.registry);
    const tokensDest = resolveSafeTargetPath(targetDir, 'design-tokens.json');
    fs.writeFileSync(tokensDest, JSON.stringify(tokensPayload, null, 2), 'utf-8');
    console.log(`  ${C.emerald}[OK] W3C Design Tokens sincronizados:${C.reset} design-tokens.json`);
  }

  const configPath = path.join(targetDir, 'ryukami.json');
  const configData = {
    $schema: 'https://ryukami-ui.dev/schema.json',
    style: 'scorch-velgrynd-v4.1',
    version: '2.4.0',
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
    console.log(`  ${C.emerald}[OK] Configuración creada:${C.reset} ryukami.json`);
  } else {
    console.log(`  ${C.gold}[SKIP] Configuración existente:${C.reset} ryukami.json`);
  }

  console.log(`\n${C.bold}${C.emerald}[DONE] Ahora añade componentes con:${C.reset} ${C.cyan}ryukami-ui add button card callout data-table${C.reset}\n`);
}

async function cmdAdd(args, flags) {
  printBanner();
  const master = await loadRegistryJson('registry.json', flags.registry);
  const validMap = new Map(master.items.map((i) => [i.name, i]));

  let requested = flags.all ? master.items.map((i) => i.name) : args.map((a) => a.toLowerCase());

  if (requested.length === 0) {
    console.error(`${C.red}[ERROR]${C.reset} Especifica al menos un componente o usa ${C.gold}--all${C.reset}.`);
    console.log(`  Ejemplo: ${C.cyan}ryukami-ui add button badge card${C.reset}\n`);
    process.exit(1);
  }

  // Resolver dependencias del registro (ej: command-palette -> kbd, data-table -> badge)
  const queue = [...requested];
  const resolvedSet = new Set();

  while (queue.length > 0) {
    const name = queue.shift();
    if (resolvedSet.has(name)) continue;

    if (!validMap.has(name)) {
      console.error(`${C.red}[ERROR] Componente desconocido:${C.reset} "${name}". Ejecuta ${C.cyan}ryukami-ui list${C.reset} para ver los nombres válidos.\n`);
      process.exit(1);
    }

    const meta = validMap.get(name);
    if (meta.registryDependencies) {
      for (const dep of meta.registryDependencies) {
        if (validMap.has(dep) && !resolvedSet.has(dep)) {
          queue.push(dep);
        }
      }
    }
    resolvedSet.add(name);
  }

  console.log(`${C.cyan}> Destino:${C.reset} ${C.bold}${flags.dir}${C.reset}`);
  console.log(`${C.cyan}> Componentes a instalar (${resolvedSet.size}):${C.reset} ${Array.from(resolvedSet).join(', ')}\n`);

  let installedCount = 0;
  let skippedCount = 0;

  for (const name of resolvedSet) {
    const itemPayload = await loadRegistryJson(`${name}.json`, flags.registry);
    for (const file of itemPayload.files) {
      verifyFileIntegrity(file);
      const destPath = resolveSafeTargetPath(flags.dir, file.path);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });

      if (fs.existsSync(destPath) && !flags.overwrite) {
        console.log(`  ${C.gold}[SKIP] Omitido (ya existe):${C.reset} ${file.path} ${C.dim}(usa --overwrite para sobrescribir)${C.reset}`);
        skippedCount++;
      } else {
        fs.writeFileSync(destPath, file.content, 'utf-8');
        console.log(`  ${C.emerald}[OK] Instalado e integridad verificada [${name}]:${C.reset} ${file.path}`);
        installedCount++;
      }
    }
  }

  console.log(`\n${C.dim}──────────────────────────────────────────────────────────────────────${C.reset}`);
  console.log(
    `${C.bold}${C.emerald}[DONE] Operación completada:${C.reset} ${installedCount} instalado(s), ${skippedCount} omitido(s).\n`
  );
}

async function cmdInfo(args, flags) {
  printBanner();
  const name = (args[0] || '').toLowerCase();
  if (!name) {
    console.error(`${C.red}[ERROR] Especifica el nombre del componente. Ejemplo: ryukami-ui info button${C.reset}\n`);
    process.exit(1);
  }

  const item = await loadRegistryJson(`${name}.json`, flags.registry);
  console.log(`${C.bold}${C.cyan}MÓDULO:${C.reset}       ${item.title} (${item.name})`);
  console.log(`${C.bold}${C.cyan}CATEGORÍA:${C.reset}    ${item.category}`);
  console.log(`${C.bold}${C.cyan}DESCRIPCIÓN:${C.reset}  ${item.description}`);
  console.log(`${C.bold}${C.cyan}DEPENDENCIAS:${C.reset} ${item.registryDependencies.length ? item.registryDependencies.join(', ') : 'Ninguna (Zero-Deps)'}`);
  console.log(`${C.bold}${C.cyan}SHA-256:${C.reset}      ${item.sha256}`);
  console.log(`${C.bold}${C.cyan}ARCHIVOS:${C.reset}     ${item.files.map((f) => f.path).join(', ')}`);
  console.log(`${C.bold}${C.cyan}ENDPOINT:${C.reset}     /r/${item.name}.json\n`);
}

async function cmdDiff(flags) {
  printBanner();
  const master = await loadRegistryJson('registry.json', flags.registry);
  console.log(`${C.cyan}> Auditando integridad SHA-256 en:${C.reset} ${C.bold}${flags.dir}${C.reset}\n`);

  let synced = 0;
  let modified = 0;
  let missing = 0;

  for (const item of master.items) {
    const destPath = resolveSafeTargetPath(flags.dir, item.target);
    if (!fs.existsSync(destPath)) {
      missing++;
      continue;
    }
    const localContent = fs.readFileSync(destPath, 'utf-8');
    const localHash = crypto.createHash('sha256').update(localContent, 'utf-8').digest('hex');
    if (localHash === item.sha256) {
      synced++;
      console.log(`  ${C.emerald}[SYNCED]${C.reset}   ${item.name.padEnd(20, ' ')} (${item.target})`);
    } else {
      modified++;
      console.log(`  ${C.gold}[MODIFIED]${C.reset} ${item.name.padEnd(20, ' ')} (${item.target}) ${C.dim}— difiere del registro v2.4.0${C.reset}`);
    }
  }

  console.log(`\n${C.dim}──────────────────────────────────────────────────────────────────────${C.reset}`);
  console.log(
    `${C.bold}RESUMEN:${C.reset} ${C.emerald}${synced} sincronizados${C.reset} · ${C.gold}${modified} personalizados${C.reset} · ${C.dim}${missing} no instalados${C.reset}\n`
  );
}

/**
 * Servidor MCP (Model Context Protocol) JSON-RPC 2.0 sobre stdio
 * Permite que agentes como Antigravity, OpenCode 2.0 o Claude consulten componentes sin gastar tokens.
 */
async function cmdMcp(flags) {
  const rl = readline.createInterface({
    input: process.stdin,
    terminal: false,
  });

  function sendResponse(id, result) {
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
  }

  function sendError(id, code, message) {
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n');
  }

  rl.on('line', async (line) => {
    if (!line.trim()) return;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      return;
    }

    const { id, method, params } = msg;
    try {
      if (method === 'initialize') {
        sendResponse(id, {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'ryukami-ui-mcp', version: '2.4.0' },
        });
      } else if (method === 'tools/list') {
        sendResponse(id, {
          tools: [
            {
              name: 'list_components',
              description: 'Lista los 35 componentes Neo-Brutalistas y Retro TUI del registro Ryukami-UI (Scorch v4.1).',
              inputSchema: { type: 'object', properties: {} },
            },
            {
              name: 'get_component',
              description: 'Obtiene el código fuente Astro (.astro) y metadatos SHA-256 de un componente de Ryukami-UI.',
              inputSchema: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'ID del componente (ej: button, card, callout, data-table)' },
                },
                required: ['name'],
              },
            },
            {
              name: 'get_design_tokens',
              description: 'Obtiene los tokens W3C de diseño del sistema Scorch v4.1 (colores WCAG AA, tipografía, sombras).',
              inputSchema: { type: 'object', properties: {} },
            },
          ],
        });
      } else if (method === 'tools/call') {
        const toolName = params?.name;
        if (toolName === 'list_components') {
          const master = await loadRegistryJson('registry.json', flags.registry);
          sendResponse(id, {
            content: [{ type: 'text', text: JSON.stringify(master, null, 2) }],
          });
        } else if (toolName === 'get_component') {
          const compName = String(params?.arguments?.name || '').toLowerCase();
          const comp = await loadRegistryJson(`${compName}.json`, flags.registry);
          sendResponse(id, {
            content: [{ type: 'text', text: JSON.stringify(comp, null, 2) }],
          });
        } else if (toolName === 'get_design_tokens') {
          const tokens = await loadRegistryJson('tokens.json', flags.registry);
          sendResponse(id, {
            content: [{ type: 'text', text: JSON.stringify(tokens, null, 2) }],
          });
        } else {
          sendError(id, -32601, `Herramienta desconocida: ${toolName}`);
        }
      } else if (id !== undefined) {
        sendResponse(id, {});
      }
    } catch (err) {
      if (id !== undefined) {
        sendError(id, -32000, err.message);
      }
    }
  });
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
      case 'diff':
      case 'status':
        await cmdDiff(flags);
        break;
      case 'mcp':
        await cmdMcp(flags);
        break;
      default:
        console.error(`${C.red}[ERROR] Comando no reconocido:${C.reset} "${command}"`);
        showHelp();
        process.exit(1);
    }
  } catch (err) {
    console.error(`\n${C.red}[ERROR] RYUKAMI-UI CLI:${C.reset} ${err.message}\n`);
    process.exit(1);
  }
}

const isDirectExecution = () => {
  if (!process.argv[1]) return false;
  try {
    const realArgv1 = fs.realpathSync(process.argv[1]);
    const realFilename = fs.realpathSync(__filename);
    return realArgv1 === realFilename;
  } catch {
    return path.resolve(process.argv[1]) === path.resolve(__filename);
  }
};

if (isDirectExecution()) {
  main();
}

export {
  resolveSafeTargetPath,
  verifyFileIntegrity,
  validateRegistryPayload,
};
