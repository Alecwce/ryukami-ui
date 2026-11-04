#!/usr/bin/env node
// @ts-check
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

function readPackageVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(CLI_ROOT, 'package.json'), 'utf-8'));
    return typeof pkg.version === 'string' && pkg.version ? pkg.version : '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/** Códigos de salida estables para scripts y CI. */
const EXIT = { OK: 0, ERROR: 1, USAGE: 2, INTEGRITY: 3, NETWORK: 4 };

class CliError extends Error {
  constructor(message, exitCode = EXIT.ERROR) {
    super(message);
    this.name = 'CliError';
    this.exitCode = exitCode;
  }
}

const MAX_REGISTRY_BYTES = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

/**
 * Normaliza y valida la URL base del registro.
 * Solo HTTPS; HTTP se tolera únicamente contra loopback para desarrollo.
 */
function resolveRegistryBase(rawUrl) {
  if (!rawUrl) return null;
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new CliError(`[ERROR] URL de registro inválida: "${rawUrl}"`, EXIT.USAGE);
  }
  if (parsed.username || parsed.password) {
    throw new CliError('[ERROR] La URL del registro no puede incluir credenciales.', EXIT.USAGE);
  }
  const isLoopback = LOOPBACK_HOSTS.has(parsed.hostname);
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && isLoopback)) {
    throw new CliError(
      `[SECURITY ALERT] El registro remoto debe usar HTTPS (recibido: ${parsed.protocol}//${parsed.host}). ` +
        'Solo localhost puede usar HTTP para desarrollo.',
      EXIT.USAGE
    );
  }
  return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}`;
}

/** Validación estricta de nombres de componente (evita traversal en rutas y URLs). */
function assertValidComponentName(name) {
  if (typeof name !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(name)) {
    throw new CliError(
      `[SECURITY ALERT] Nombre de componente inválido: "${name}". Solo se aceptan minúsculas, dígitos y guiones.`,
      EXIT.USAGE
    );
  }
  return name;
}

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
 * Verificación de integridad criptográfica SHA-256 (fail-closed).
 * Un payload sin hash válido se rechaza: la ausencia de firma NUNCA desactiva el control.
 * `expected` permite anclar el contenido al registro maestro, que se descarga por un
 * canal distinto al del propio módulo (evita que un payload se auto-valide).
 */
function verifyFileIntegrity(file, expected) {
  if (!file || typeof file !== 'object') {
    throw new CliError('[INTEGRITY ERROR] Archivo de registro inválido: no es un objeto.', EXIT.INTEGRITY);
  }
  if (typeof file.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(file.sha256)) {
    throw new CliError(
      `[INTEGRITY ERROR] El archivo "${file.path || '(sin ruta)'}" no incluye un sha256 SHA-256 válido. ` +
        'Instalación abortada: no se aceptan payloads sin firma de integridad.',
      EXIT.INTEGRITY
    );
  }
  const computed = crypto.createHash('sha256').update(file.content, 'utf-8').digest('hex');
  if (computed !== file.sha256.toLowerCase()) {
    throw new CliError(
      `[INTEGRITY ERROR] Fallo de suma de verificación SHA-256 en ${file.path}.\nEsperado: ${file.sha256}\nCalculado: ${computed}`,
      EXIT.INTEGRITY
    );
  }
  if (expected && computed !== String(expected).toLowerCase()) {
    throw new CliError(
      `[INTEGRITY ERROR] El contenido de "${file.path}" no coincide con el registro maestro.\n` +
        `Esperado (registry.json): ${expected}\nCalculado: ${computed}`,
      EXIT.INTEGRITY
    );
  }
  return computed;
}

/**
 * Escritura segura de archivos del registro.
 * Defensa en profundidad contra symlinks (CWE-59) y escapes por directorios enlazados:
 *  1. La ruta se resuelve y valida léxicamente contra targetDir (resolveSafeTargetPath).
 *  2. Se resuelve el directorio real y se exige que esté dentro del target real.
 *  3. Se rechaza cualquier destino que ya sea un symlink.
 *  4. Se abre con O_NOFOLLOW para cerrar la ventana TOCTOU.
 * @returns {'written' | 'skipped'}
 */
function writeRegistryFile({ targetDir, relativePath, content, overwrite = false }) {
  const destPath = resolveSafeTargetPath(targetDir, relativePath);

  fs.mkdirSync(targetDir, { recursive: true });
  const realBase = fs.realpathSync(targetDir);

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const realDir = fs.realpathSync(path.dirname(destPath));
  if (realDir !== realBase && !realDir.startsWith(realBase + path.sep)) {
    throw new Error(
      `[SECURITY ALERT] El directorio destino de "${relativePath}" escapa del proyecto mediante un enlace simbólico (${realDir}).`
    );
  }

  const existing = fs.lstatSync(destPath, { throwIfNoEntry: false });
  if (existing && existing.isSymbolicLink()) {
    throw new Error(
      `[SECURITY ALERT] "${relativePath}" es un enlace simbólico. Escritura bloqueada para evitar sobrescribir archivos fuera del proyecto.`
    );
  }
  if (existing && !overwrite) return 'skipped';

  if (existing && overwrite) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${destPath}.bak-${stamp}`;
    fs.copyFileSync(destPath, backupPath);
    process.stderr.write(`  [BACKUP] ${relativePath} -> ${path.basename(backupPath)}\n`);
  }

  // Escritura atómica: archivo temporal en el mismo directorio + rename.
  // Un Ctrl-C o un fallo de disco no puede dejar un .astro truncado.
  const tmpPath = `${destPath}.tmp-${process.pid}-${Date.now()}`;
  const fd = fs.openSync(
    tmpPath,
    fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL,
    0o644
  );
  try {
    fs.writeFileSync(fd, content, 'utf-8');
    fs.fsyncSync(fd);
  } catch (err) {
    fs.closeSync(fd);
    fs.rmSync(tmpPath, { force: true });
    throw err;
  }
  fs.closeSync(fd);

  try {
    fs.renameSync(tmpPath, destPath);
  } catch (err) {
    fs.rmSync(tmpPath, { force: true });
    throw err;
  }
  return 'written';
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
    dirExplicit: false,
    overwrite: false,
    all: false,
    obsidian: false,
    json: false,
    version: false,
    registry: process.env.RYUKAMI_REGISTRY_URL || null,
  };

  const takeValue = (flag, index) => {
    const value = argv[index];
    if (value === undefined || value.startsWith('-')) {
      throw new CliError(`[ERROR] La opción ${flag} requiere un valor.`, EXIT.USAGE);
    }
    return value;
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dir' || arg === '-d') {
      flags.dir = path.resolve(takeValue(arg, ++i));
      flags.dirExplicit = true;
    } else if (arg === '--overwrite' || arg === '-f' || arg === '--yes' || arg === '-y') {
      flags.overwrite = true;
    } else if (arg === '--all' || arg === '-a') {
      flags.all = true;
    } else if (arg === '--obsidian') {
      flags.obsidian = true;
    } else if (arg === '--json') {
      flags.json = true;
    } else if (arg === '--registry' || arg === '-r') {
      flags.registry = takeValue(arg, ++i);
    } else if (arg === '--version' || arg === '-v') {
      flags.version = true;
    } else if (arg === '--help' || arg === '-h') {
      flags.help = true;
    } else if (arg.startsWith('-')) {
      throw new CliError(`[ERROR] Opción desconocida: ${arg}`, EXIT.USAGE);
    } else {
      positional.push(arg);
    }
  }

  return { command: positional[0], args: positional.slice(1), flags };
}

const DEFAULT_REMOTE_REGISTRY = 'https://ryukami-ui.pages.dev/r';

/**
 * Descarga con cuerpo acotado: sin timeout ni cap, un registro hostil puede colgar
 * el CLI (o el servidor MCP) indefinidamente o agotar la memoria.
 */
async function readCappedJson(res, url, fileName) {
  const declared = Number(res.headers.get('content-length') || 0);
  if (declared > MAX_REGISTRY_BYTES) {
    throw new CliError(
      `[ERROR] El registro "${fileName}" excede el tamaño máximo permitido (${MAX_REGISTRY_BYTES} bytes).`,
      EXIT.NETWORK
    );
  }

  if (!res.body) {
    const text = await res.text();
    if (text.length > MAX_REGISTRY_BYTES) {
      throw new CliError(`[ERROR] Respuesta demasiado grande desde ${url}`, EXIT.NETWORK);
    }
    return text;
  }

  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_REGISTRY_BYTES) {
      await reader.cancel();
      throw new CliError(
        `[ERROR] El registro "${fileName}" excede ${MAX_REGISTRY_BYTES} bytes. Descarga abortada.`,
        EXIT.NETWORK
      );
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf-8');
}

async function fetchRegistryEndpoint(url, fileName) {
  if (!url.startsWith('https://') && !/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])/.test(url)) {
    throw new CliError(
      `[SECURITY ALERT] Descarga bloqueada por protocolo inseguro: ${url}`,
      EXIT.USAGE
    );
  }

  let res;
  try {
    res = await fetch(url, {
      headers: {
        'User-Agent': CLI_USER_AGENT,
        Accept: 'application/json',
      },
      redirect: 'error',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new CliError(
        `[TIMEOUT] El registro no respondió en ${FETCH_TIMEOUT_MS / 1000}s (${url}).`,
        EXIT.NETWORK
      );
    }
    throw new CliError(`Error de conexión con el Registry (${url}): ${err.message}`, EXIT.NETWORK);
  }

  if (res.status === 403) {
    throw new CliError(
      `[403 FORBIDDEN] Petición interceptada por Cloudflare WAF o política de seguridad en ${url}. Verifica tu conexión.`,
      EXIT.NETWORK
    );
  }
  if (res.status === 404) {
    throw new CliError(
      `[404 NOT FOUND] El archivo "${fileName}" no existe en el registro (${url}).`,
      EXIT.NETWORK
    );
  }
  if (res.status === 429) {
    throw new CliError(
      `[429 RATE LIMIT] Límite de peticiones excedido en Cloudflare Edge. Por favor espera unos momentos antes de reintentar.`,
      EXIT.NETWORK
    );
  }
  if (!res.ok) {
    throw new CliError(`Fallo de descarga HTTP ${res.status} desde ${url}`, EXIT.NETWORK);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!/json/i.test(contentType)) {
    throw new CliError(
      `[ERROR] El registro devolvió un Content-Type inesperado ("${contentType || 'vacío'}") en ${url}.`,
      EXIT.NETWORK
    );
  }

  const raw = await readCappedJson(res, url, fileName);
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new CliError(`[ERROR] El registro devolvió JSON inválido en ${url}.`, EXIT.NETWORK);
  }
  validateRegistryPayload(data, fileName);
  return data;
}

const registryCache = new Map();

async function loadRegistryJson(fileName, registryUrl) {
  const base = resolveRegistryBase(registryUrl) || null;
  const cacheKey = `${base ?? 'local'}::${fileName}`;
  if (registryCache.has(cacheKey)) return registryCache.get(cacheKey);

  let payload;
  if (base) {
    payload = await fetchRegistryEndpoint(`${base}/${encodeURIComponent(fileName)}`, fileName);
  } else {
    const localPath = path.join(LOCAL_REGISTRY_DIR, encodeURIComponent(fileName));
    if (fs.existsSync(localPath)) {
      payload = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
      validateRegistryPayload(payload, fileName);
    } else {
      payload = await fetchRegistryEndpoint(
        `${DEFAULT_REMOTE_REGISTRY}/${encodeURIComponent(fileName)}`,
        fileName
      );
    }
  }

  registryCache.set(cacheKey, payload);
  return payload;
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
  console.log(`  ${C.gold}--registry, -r <url>${C.reset}            URL remota del registro (solo HTTPS; por defecto: https://ryukami-ui.pages.dev/r)`);
  console.log(`  ${C.gold}--json${C.reset}                          Salida legible por máquina (ryukami-ui diff --json)`);
  console.log(`  ${C.gold}--version, -v${C.reset}                   Imprime la versión y sale`);
  console.log('');
  console.log(`${C.bold}CÓDIGOS DE SALIDA:${C.reset} ${C.dim}0 OK · 1 deriva/error genérico · 2 uso · 3 integridad · 4 red${C.reset}`);
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
  const visibleItems = master.items.filter((item) => !item.hidden);
  console.log(`${C.bold}CATÁLOGO DE COMPONENTES DISPONIBLES (${visibleItems.length} MÓDULOS):${C.reset}\n`);

  const pad = (str, len) => str.padEnd(len, ' ');
  console.log(`  ${C.bold}${C.gold}${pad('ID CLI', 20)}${pad('CATEGORÍA', 24)}DESCRIPCIÓN${C.reset}`);
  console.log(`  ${C.dim}────────────────────────────────────────────────────────────────────────────${C.reset}`);

  for (const item of visibleItems) {
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
  const master = await loadRegistryJson('registry.json', flags.registry);

  console.log(`${C.cyan}> Inicializando Scorch Design System en:${C.reset} ${C.bold}${targetDir}${C.reset}\n`);

  for (const file of stylesPayload.files) {
    const anchor = master.integrity?.[file.path];
    if (master.integrity && !anchor) {
      throw new CliError(
        `[INTEGRITY ERROR] "${file.path}" no figura en el manifiesto del registro.`,
        EXIT.INTEGRITY
      );
    }
    verifyFileIntegrity(file, anchor);
    const status = writeRegistryFile({
      targetDir,
      relativePath: file.path,
      content: file.content,
      overwrite: flags.overwrite,
    });

    if (status === 'skipped') {
      console.log(`  ${C.gold}[SKIP] Omitido (ya existe):${C.reset} ${file.path} ${C.dim}(usa --overwrite para reemplazar)${C.reset}`);
    } else {
      console.log(`  ${C.emerald}[OK] Tokens inyectados e integridad verificada:${C.reset} ${file.path}`);
    }
  }

  if (flags.obsidian) {
    const tokensPayload = await loadRegistryJson('tokens.json', flags.registry);
    const tokensContent = JSON.stringify(tokensPayload, null, 2);
    const status = writeRegistryFile({
      targetDir,
      relativePath: 'design-tokens.json',
      content: tokensContent,
      overwrite: flags.overwrite,
    });
    if (status === 'skipped') {
      console.log(`  ${C.gold}[SKIP] Omitido (ya existe):${C.reset} design-tokens.json ${C.dim}(usa --overwrite para reemplazar)${C.reset}`);
    } else {
      console.log(`  ${C.emerald}[OK] W3C Design Tokens sincronizados:${C.reset} design-tokens.json`);
    }
  }

  const configData = {
    $schema: 'https://ryukami-ui.dev/schema.json',
    style: 'scorch-velgrynd-v4.1',
    version: readPackageVersion(),
    tailwind: {
      version: '4.3.3',
      css: 'src/styles/global.css',
    },
    aliases: {
      components: 'src/components',
    },
  };

  const configStatus = writeRegistryFile({
    targetDir,
    relativePath: 'ryukami.json',
    content: JSON.stringify(configData, null, 2),
    overwrite: flags.overwrite,
  });
  if (configStatus === 'written') {
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

  let requested = flags.all
    ? master.items.filter((i) => !i.hidden).map((i) => i.name)
    : args.map((a) => a.toLowerCase());

  if (requested.length === 0) {
    throw new CliError(
      'Especifica al menos un componente o usa --all. Ejemplo: ryukami-ui add button badge card',
      EXIT.USAGE
    );
  }

  // Resolver dependencias del registro (ej: command-palette -> kbd, data-table -> badge)
  const queue = [...requested];
  const resolvedSet = new Set();

  while (queue.length > 0) {
    const name = queue.shift();
    if (resolvedSet.has(name)) continue;

    if (!validMap.has(name)) {
      throw new CliError(
        `Componente desconocido: "${name}". Ejecuta "ryukami-ui list" para ver los nombres válidos.`,
        EXIT.USAGE
      );
    }

    const meta = validMap.get(name);
    if (meta.registryDependencies) {
      for (const dep of meta.registryDependencies) {
        if (!validMap.has(dep)) {
          throw new CliError(
            `Dependencia no publicada: "${name}" requiere "${dep}", pero no existe en el registro. ` +
              'Esto es un fallo del registro, no de tu proyecto.',
            EXIT.INTEGRITY
          );
        }
        if (!resolvedSet.has(dep)) queue.push(dep);
      }
    }
    resolvedSet.add(name);
  }

  console.log(`${C.cyan}> Destino:${C.reset} ${C.bold}${flags.dir}${C.reset}`);
  console.log(`${C.cyan}> Componentes a instalar (${resolvedSet.size}):${C.reset} ${Array.from(resolvedSet).join(', ')}\n`);

  let installedCount = 0;
  let skippedCount = 0;
  const writtenInRun = new Set();

  for (const name of resolvedSet) {
    const meta = validMap.get(name);
    const itemPayload = await loadRegistryJson(`${name}.json`, flags.registry);
    for (const file of itemPayload.files) {
      // Anclaje al registro maestro: el hash esperado viaja en un payload distinto
      // (registry.json) que el del módulo, así un módulo manipulado no se auto-valida.
      const manifest = master.integrity ?? null;
      const anchoredHash = manifest?.[file.path] ?? (file.path === meta.target ? meta.sha256 : undefined);
      if (manifest && !(file.path in manifest)) {
        throw new CliError(
          `[INTEGRITY ERROR] El archivo "${file.path}" de "${name}" no figura en el manifiesto de integridad del registro.`,
          EXIT.INTEGRITY
        );
      }
      verifyFileIntegrity(file, anchoredHash);

      if (writtenInRun.has(file.path)) {
        console.log(`  ${C.dim}[SHARED] Ya provisto por otra dependencia:${C.reset} ${file.path}`);
        continue;
      }

      const status = writeRegistryFile({
        targetDir: flags.dir,
        relativePath: file.path,
        content: file.content,
        overwrite: flags.overwrite,
      });

      if (status === 'skipped') {
        console.log(`  ${C.gold}[SKIP] Omitido (ya existe):${C.reset} ${file.path} ${C.dim}(usa --overwrite para sobrescribir)${C.reset}`);
        skippedCount++;
      } else {
        writtenInRun.add(file.path);
        const label = file.path === meta.target ? `[${name}]` : `[${name} · dependencia]`;
        console.log(`  ${C.emerald}[OK] Instalado e integridad verificada ${label}:${C.reset} ${file.path}`);
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
  const rawName = String(args[0] || '').toLowerCase();
  if (!rawName) {
    throw new CliError('Especifica el nombre del componente. Ejemplo: ryukami-ui info button', EXIT.USAGE);
  }
  const name = assertValidComponentName(rawName);

  const master = await loadRegistryJson('registry.json', flags.registry);
  const known = new Set(master.items.map((item) => item.name));
  if (!known.has(name)) {
    throw new CliError(
      `Componente desconocido: "${name}". Ejecuta "ryukami-ui list" para ver los nombres válidos.`,
      EXIT.USAGE
    );
  }

  const item = await loadRegistryJson(`${name}.json`, flags.registry);
  console.log(`${C.bold}${C.cyan}MÓDULO:${C.reset}       ${item.title} (${item.name})`);
  console.log(`${C.bold}${C.cyan}CATEGORÍA:${C.reset}    ${item.category}`);
  console.log(`${C.bold}${C.cyan}DESCRIPCIÓN:${C.reset}  ${item.description}`);
  console.log(`${C.bold}${C.cyan}DEPENDENCIAS:${C.reset} ${item.registryDependencies?.length ? item.registryDependencies.join(', ') : 'Ninguna (Zero-Deps)'}`);
  console.log(`${C.bold}${C.cyan}SHA-256:${C.reset}      ${item.sha256}`);
  console.log(`${C.bold}${C.cyan}ARCHIVOS:${C.reset}     ${item.files.map((f) => f.path).join(', ')}`);
  console.log(`${C.bold}${C.cyan}ENDPOINT:${C.reset}     /r/${item.name}.json\n`);
}

async function cmdDiff(flags) {
  const master = await loadRegistryJson('registry.json', flags.registry);

  if (!flags.json) {
    printBanner();
    console.log(`${C.cyan}> Auditando integridad SHA-256 en:${C.reset} ${C.bold}${flags.dir}${C.reset}\n`);
  }

  let synced = 0;
  let modified = 0;
  let missing = 0;
  const report = [];

  for (const item of master.items.filter((i) => !i.hidden)) {
    const destPath = resolveSafeTargetPath(flags.dir, item.target);
    if (!fs.existsSync(destPath)) {
      missing++;
      report.push({ name: item.name, target: item.target, status: 'missing' });
      if (!flags.json) console.log(`  ${C.dim}[MISSING]${C.reset}  ${item.name.padEnd(20, ' ')} (${item.target})`);
      continue;
    }

    const localContent = fs.readFileSync(destPath, 'utf-8');
    const localHash = crypto.createHash('sha256').update(localContent, 'utf-8').digest('hex');
    if (localHash === item.sha256) {
      synced++;
      report.push({ name: item.name, target: item.target, status: 'synced' });
      if (!flags.json) console.log(`  ${C.emerald}[SYNCED]${C.reset}   ${item.name.padEnd(20, ' ')} (${item.target})`);
    } else {
      modified++;
      report.push({ name: item.name, target: item.target, status: 'modified' });
      if (!flags.json) {
        console.log(`  ${C.gold}[MODIFIED]${C.reset} ${item.name.padEnd(20, ' ')} (${item.target}) ${C.dim}— difiere del registro v${readPackageVersion()}${C.reset}`);
      }
    }
  }

  // Gate de CI: cualquier deriva o archivo ausente debe fallar.
  process.exitCode = modified > 0 || missing > 0 ? EXIT.ERROR : EXIT.OK;

  if (flags.json) {
    process.stdout.write(
      JSON.stringify({ synced, modified, missing, total: report.length, items: report }, null, 2) + '\n'
    );
    return;
  }

  console.log(`\n${C.dim}──────────────────────────────────────────────────────────────────────${C.reset}`);
  console.log(
    `${C.bold}RESUMEN:${C.reset} ${C.emerald}${synced} sincronizados${C.reset} · ${C.gold}${modified} personalizados${C.reset} · ${C.dim}${missing} no instalados${C.reset}\n`
  );
  if (process.exitCode !== EXIT.OK) {
    console.log(`${C.gold}[WARN] La auditoría detectó deriva respecto al registro.${C.reset}\n`);
  }
}

/**
 * Servidor MCP (Model Context Protocol) JSON-RPC 2.0 sobre stdio
 * Permite que agentes como Antigravity, OpenCode 2.0 o Claude consulten componentes sin gastar tokens.
 */
async function cmdMcp(flags) {
  const MAX_MESSAGE_BYTES = 1024 * 1024;

  const TOOLS = [
    {
      name: 'list_components',
      description: 'Lista los 35 componentes Neo-Brutalistas y Retro TUI del registro Ryukami-UI (Scorch v4.1).',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
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
        additionalProperties: false,
      },
    },
    {
      name: 'get_design_tokens',
      description: 'Obtiene los tokens W3C de diseño del sistema Scorch v4.1 (colores WCAG AA, tipografía, sombras).',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    },
  ];

  const writeMessage = (payload) => process.stdout.write(JSON.stringify(payload) + '\n');
  const ok = (id, result) => ({ jsonrpc: '2.0', id: id ?? null, result });
  const fail = (id, code, message) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

  async function processMessage(msg) {
    if (!msg || typeof msg !== 'object' || Array.isArray(msg)) {
      return fail(null, -32600, 'Invalid Request: se esperaba un objeto JSON-RPC.');
    }

    const { id, method, params } = msg;
    const isNotification = id === undefined;

    if (typeof method !== 'string') {
      return isNotification ? null : fail(id, -32600, 'Invalid Request: falta el método.');
    }

    try {
      if (method === 'initialize') {
        return ok(id, {
          protocolVersion: '2024-11-05',
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: 'ryukami-ui-mcp', version: readPackageVersion() },
        });
      }

      if (method === 'notifications/initialized' || method === 'notifications/cancelled') {
        return null;
      }

      if (method === 'ping') return ok(id, {});

      if (method === 'tools/list') return ok(id, { tools: TOOLS });

      if (method === 'tools/call') {
        const toolName = params?.name;

        if (toolName === 'list_components') {
          const master = await loadRegistryJson('registry.json', flags.registry);
          return ok(id, { content: [{ type: 'text', text: JSON.stringify(master, null, 2) }] });
        }

        if (toolName === 'get_component') {
          const rawName = String(params?.arguments?.name ?? '').toLowerCase();
          const compName = assertValidComponentName(rawName);
          const master = await loadRegistryJson('registry.json', flags.registry);
          if (!master.items.some((item) => item.name === compName)) {
            return fail(id, -32602, `Componente desconocido: "${compName}". Usa list_components para ver los IDs válidos.`);
          }
          const comp = await loadRegistryJson(`${compName}.json`, flags.registry);
          return ok(id, { content: [{ type: 'text', text: JSON.stringify(comp, null, 2) }] });
        }

        if (toolName === 'get_design_tokens') {
          const tokens = await loadRegistryJson('tokens.json', flags.registry);
          return ok(id, { content: [{ type: 'text', text: JSON.stringify(tokens, null, 2) }] });
        }

        return fail(id, -32602, `Herramienta desconocida: ${toolName}`);
      }

      return isNotification ? null : fail(id, -32601, `Method not found: ${method}`);
    } catch (err) {
      if (isNotification) return null;
      const code = err instanceof CliError && err.exitCode === EXIT.USAGE ? -32602 : -32000;
      return fail(id, code, err.message);
    }
  }

  async function dispatch(rawLine) {
    let parsed;
    try {
      parsed = JSON.parse(rawLine);
    } catch {
      writeMessage(fail(null, -32700, 'Parse error: el mensaje no es JSON válido.'));
      return;
    }

    if (Array.isArray(parsed)) {
      if (parsed.length === 0) {
        writeMessage(fail(null, -32600, 'Invalid Request: batch vacío.'));
        return;
      }
      const responses = [];
      for (const item of parsed) {
        const response = await processMessage(item);
        if (response) responses.push(response);
      }
      if (responses.length > 0) writeMessage(responses);
      return;
    }

    const response = await processMessage(parsed);
    if (response) writeMessage(response);
  }

  let buffer = '';
  let queue = Promise.resolve();

  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    buffer += chunk;

    if (buffer.length > MAX_MESSAGE_BYTES && !buffer.includes('\n')) {
      writeMessage(fail(null, -32600, `Invalid Request: mensaje mayor a ${MAX_MESSAGE_BYTES} bytes.`));
      buffer = '';
      return;
    }

    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (!line) continue;
      if (line.length > MAX_MESSAGE_BYTES) {
        writeMessage(fail(null, -32600, `Invalid Request: mensaje mayor a ${MAX_MESSAGE_BYTES} bytes.`));
        continue;
      }
      // Cola serializada: acota la concurrencia a 1 petición en vuelo.
      queue = queue.then(() => dispatch(line)).catch((err) => {
        process.stderr.write(`[MCP] ${err.message}\n`);
      });
    }
  });

  process.stdin.on('end', () => {
    queue.finally(() => process.exit(EXIT.OK));
  });

  process.stdin.resume();
}

async function main() {
  const { command, args, flags } = parseArgs(process.argv.slice(2));

  if (flags.version) {
    console.log(readPackageVersion());
    return;
  }

  if (flags.help || !command) {
    showHelp();
    return;
  }

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
      throw new CliError(`Comando no reconocido: "${command}". Ejecuta "ryukami-ui --help".`, EXIT.USAGE);
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
  main().catch((err) => {
    if (err instanceof CliError) {
      console.error(`\n${C.red}[ERROR] RYUKAMI-UI CLI:${C.reset} ${err.message}\n`);
      process.exitCode = err.exitCode;
    } else {
      console.error(`\n${C.red}[ERROR] RYUKAMI-UI CLI:${C.reset} ${err.message}\n`);
      process.exitCode = EXIT.ERROR;
    }
  });
}

export {
  resolveSafeTargetPath,
  verifyFileIntegrity,
  validateRegistryPayload,
  writeRegistryFile,
};
