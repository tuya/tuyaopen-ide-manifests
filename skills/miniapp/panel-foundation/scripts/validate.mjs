#!/usr/bin/env node
/**
 * panel-foundation/validate.mjs
 *
 * Pre-submission validator for Tuya Ray panel miniapp projects.
 * Run from anywhere inside a panel project; the script finds the
 * `source/miniapp/` directory by walking up looking for project.tuya.json.
 *
 * Exit codes:
 *   0 — all checks pass, ready to upload
 *   1 — warnings only (advisory)
 *   2 — errors present, do NOT upload
 *
 * Usage:
 *   node validate.mjs [path-to-source/miniapp]
 *
 * Reports issues against the rules in:
 *   references/conventions.md
 *   references/upload-checklist.md
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import * as path from 'node:path';

// ─────────────────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────────────────

const MAIN_BUNDLE_MAX = 4 * 1024 * 1024;      // 4 MiB
const CDN_FILE_MAX    = 500 * 1024;           // single CDN asset warn threshold
const REQUIRED_DEPS   = ['BaseKit', 'MiniKit', 'DeviceKit'];
const ALLOWED_PROJECT_TYPES = ['panel-app'];
const ALLOWED_DEV_MODES = ['ray'];
const ALLOWED_COMPILE_TYPES = ['miniprogram'];

// Files to skip entirely during forbidden-API scan (by basename).
// ty-shim.ts is the IDE preview shim and legitimately uses localStorage.
const SKIP_FILES_FROM_API_SCAN = new Set(['ty-shim.ts', 'ty-shim.js']);

// Files / patterns to grep for forbidden APIs
const FORBIDDEN_PATTERNS = [
  { name: 'fetch()',             re: /\bfetch\s*\(/ },
  { name: 'XMLHttpRequest',      re: /\bXMLHttpRequest\b/ },
  { name: 'localStorage',        re: /\blocalStorage\b/ },
  { name: 'sessionStorage',      re: /\bsessionStorage\b/ },
  { name: 'document.cookie',     re: /\bdocument\s*\.\s*cookie\b/ },
  { name: 'window.open',         re: /\bwindow\s*\.\s*open\b/ },
  { name: 'eval()',              re: /\beval\s*\(/ },
  { name: 'new Function()',      re: /\bnew\s+Function\s*\(/ },
  { name: 'apiRequestByAtop',    re: /\bapiRequestByAtop\b/ },
  { name: 'document.querySelector', re: /\bdocument\s*\.\s*querySelector\b/ },
];

// Skip scanning these directories (binary / generated / vendored)
const SKIP_DIRS = new Set([
  'node_modules', 'dist', 'build', 'out', '.tuyaopen', '.git',
  'cdn', 'typings', 'scripts',
]);

// Files extensions we scan for code rules
const CODE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx']);

// ─────────────────────────────────────────────────────────────────────────
//  Report collector
// ─────────────────────────────────────────────────────────────────────────

class Report {
  constructor() {
    this.passes = [];
    this.warnings = [];
    this.errors = [];
  }
  pass(msg)  { this.passes.push(msg); }
  warn(msg)  { this.warnings.push(msg); }
  error(msg) { this.errors.push(msg); }

  print() {
    for (const p of this.passes)   console.log(` \x1b[32m✓\x1b[0m ${p}`);
    for (const w of this.warnings) console.log(` \x1b[33m⚠\x1b[0m ${w}`);
    for (const e of this.errors)   console.log(` \x1b[31m✗\x1b[0m ${e}`);

    console.log('');
    const e = this.errors.length;
    const w = this.warnings.length;
    if (e === 0 && w === 0) {
      console.log('\x1b[32m result: all checks passed — READY for upload\x1b[0m');
    } else if (e === 0) {
      console.log(`\x1b[33m result: ${w} warning(s) — review before upload\x1b[0m`);
    } else {
      console.log(`\x1b[31m result: ${e} error(s), ${w} warning(s) — NOT READY for upload\x1b[0m`);
    }
  }

  exitCode() {
    if (this.errors.length > 0) return 2;
    if (this.warnings.length > 0) return 1;
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  Project root discovery
// ─────────────────────────────────────────────────────────────────────────

function findProjectRoot(startDir) {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 8; i++) {
    if (existsSync(path.join(dir, 'project.tuya.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Also handle: pointing at the TuyaOpen project root (one level up)
  const candidate = path.join(startDir, 'source', 'miniapp');
  if (existsSync(path.join(candidate, 'project.tuya.json'))) return candidate;
  return null;
}

// ─────────────────────────────────────────────────────────────────────────
//  Individual checks
// ─────────────────────────────────────────────────────────────────────────

async function checkProjectTuyaJson(root, report) {
  const file = path.join(root, 'project.tuya.json');
  let raw, json;
  try {
    raw = await readFile(file, 'utf8');
    json = JSON.parse(raw);
  } catch (e) {
    report.error(`project.tuya.json: unreadable / not JSON (${e.message})`);
    return null;
  }
  report.pass('project.tuya.json present and parseable');

  // appid
  if (typeof json.appid !== 'string' || json.appid.length === 0) {
    report.error('project.tuya.json.appid is empty — must be set before upload (Tuya 平台创建 panel 后填)');
  } else if (json.appid.length < 16) {
    report.warn(`project.tuya.json.appid looks short (${json.appid.length} chars) — verify it's the real platform-issued id`);
  } else {
    report.pass(`appid set (${json.appid.slice(0, 8)}…)`);
  }

  // appVersion (semver)
  if (typeof json.appVersion !== 'string' || !/^\d+\.\d+\.\d+/.test(json.appVersion)) {
    report.error(`project.tuya.json.appVersion not semver: "${json.appVersion}"`);
  } else {
    report.pass(`appVersion ${json.appVersion} (semver)`);
  }

  // projectId
  if (typeof json.projectId !== 'string' || json.projectId.length === 0) {
    report.error('project.tuya.json.projectId is empty');
  } else {
    report.pass(`projectId ${json.projectId}`);
  }

  // type / devMode / compileType
  if (!ALLOWED_PROJECT_TYPES.includes(json.type)) {
    report.error(`project.tuya.json.type = "${json.type}" — must be one of ${ALLOWED_PROJECT_TYPES.join('|')}`);
  } else {
    report.pass(`type = ${json.type}`);
  }
  if (!ALLOWED_DEV_MODES.includes(json.devMode)) {
    report.error(`project.tuya.json.devMode = "${json.devMode}" — must be ${ALLOWED_DEV_MODES.join('|')}`);
  }
  if (!ALLOWED_COMPILE_TYPES.includes(json.compileType)) {
    report.error(`project.tuya.json.compileType = "${json.compileType}" — must be ${ALLOWED_COMPILE_TYPES.join('|')}`);
  }

  // dependencies
  if (!json.dependencies || typeof json.dependencies !== 'object') {
    report.error('project.tuya.json.dependencies missing');
  } else {
    for (const k of REQUIRED_DEPS) {
      if (!json.dependencies[k]) {
        report.error(`project.tuya.json.dependencies.${k} missing`);
      } else {
        report.pass(`dependency ${k} = ${json.dependencies[k]}`);
      }
    }
  }

  // baseversion
  if (typeof json.baseversion !== 'string' || json.baseversion.length === 0) {
    report.error('project.tuya.json.baseversion missing');
  }

  // i18n
  if (json.i18n === false) {
    report.warn('project.tuya.json.i18n is false — set to true and ship at least en + zh resources for international audit');
  }

  return json;
}

async function checkAppConfig(root, report) {
  const candidates = [
    path.join(root, 'src', 'app.config.ts'),
    path.join(root, 'src', 'app.config.js'),
  ];
  let cfgFile = null;
  for (const c of candidates) {
    if (existsSync(c)) { cfgFile = c; break; }
  }
  if (!cfgFile) {
    report.error('src/app.config.{ts,js} missing — required by Ray framework');
    return [];
  }
  const txt = await readFile(cfgFile, 'utf8');
  report.pass(`${path.relative(root, cfgFile)} present`);

  // Crude regex-extract of pages list — `pages: ['...', '...']`
  const pagesMatch = txt.match(/pages\s*:\s*\[([\s\S]*?)\]/);
  if (!pagesMatch) {
    report.error('app.config: pages list not found');
    return [];
  }
  const pageItems = [...pagesMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]);
  if (pageItems.length === 0) {
    report.error('app.config.pages is empty — at least one page required');
    return [];
  }
  report.pass(`${pageItems.length} page(s) declared in app.config`);

  // Verify each page file actually exists
  const missingPages = [];
  for (const p of pageItems) {
    const tsx = path.join(root, 'src', `${p}.tsx`);
    const ts  = path.join(root, 'src', `${p}.ts`);
    const jsx = path.join(root, 'src', `${p}.jsx`);
    if (!existsSync(tsx) && !existsSync(ts) && !existsSync(jsx)) {
      missingPages.push(p);
    }
  }
  if (missingPages.length > 0) {
    report.error(`app.config.pages references non-existent files: ${missingPages.join(', ')}`);
  } else {
    report.pass('all declared pages have matching source files');
  }
  return pageItems;
}

async function checkDeviceSchema(root, report) {
  const schemaTs = path.join(root, 'src', 'devices', 'schema.ts');
  const schemaJs = path.join(root, 'src', 'devices', 'schema.js');
  const schemaFile = existsSync(schemaTs) ? schemaTs : existsSync(schemaJs) ? schemaJs : null;

  if (!schemaFile) {
    report.error('src/devices/schema.{ts,js} missing — DP type source required (regenerate via IDE "Sync DPs from Cloud")');
    return;
  }
  report.pass('src/devices/schema present (DP type source)');

  // Verify lampSchemaMap is exported (new template requirement)
  try {
    const txt = await readFile(schemaFile, 'utf8');
    if (/export\s+const\s+lampSchemaMap\b/.test(txt)) {
      report.pass('lampSchemaMap exported from schema (required by createDpKit)');
    } else {
      report.warn('lampSchemaMap not exported from schema — required by createDpKit; regenerate via IDE "Sync DPs from Cloud"');
    }
  } catch (e) {
    report.warn(`could not read schema file: ${e.message}`);
  }

  // Check src/devices/index.ts uses createDpKit pattern
  const devIndex = path.join(root, 'src', 'devices', 'index.ts');
  if (existsSync(devIndex)) {
    try {
      const txt = await readFile(devIndex, 'utf8');
      if (/createDpKit/.test(txt)) {
        report.pass('src/devices/index.ts uses createDpKit pattern');
      } else {
        report.warn('src/devices/index.ts does not use createDpKit — old template? Regenerate from IDE scaffold');
      }
    } catch { /* ignore */ }
  }
}

async function scanForbiddenAPIs(root, report) {
  const violations = [];
  const violatorsByPattern = new Map();

  async function walk(dir) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        await walk(full);
      } else if (e.isFile() && CODE_EXTS.has(path.extname(e.name))) {
        // ty-shim.ts uses localStorage intentionally (IDE preview fallback)
        if (SKIP_FILES_FROM_API_SCAN.has(e.name)) continue;
        const rel = path.relative(root, full);
        let txt;
        try { txt = await readFile(full, 'utf8'); } catch { continue; }
        for (const pat of FORBIDDEN_PATTERNS) {
          if (pat.re.test(txt)) {
            const lines = txt.split('\n');
            for (let i = 0; i < lines.length; i++) {
              if (pat.re.test(lines[i])) {
                violations.push({ pattern: pat.name, file: rel, line: i + 1, snippet: lines[i].trim().slice(0, 80) });
                violatorsByPattern.set(pat.name, (violatorsByPattern.get(pat.name) ?? 0) + 1);
              }
            }
          }
        }
      }
    }
  }
  await walk(path.join(root, 'src'));

  if (violations.length === 0) {
    report.pass('no forbidden APIs in src/ (ty-shim.ts exempted)');
  } else {
    for (const [pat, count] of violatorsByPattern) {
      report.error(`forbidden API "${pat}" appears ${count} time(s) in src/ — see conventions.md Rule 10`);
    }
    // Show up to 5 violations
    for (const v of violations.slice(0, 5)) {
      console.error(`     ${v.file}:${v.line}: ${v.snippet}`);
    }
    if (violations.length > 5) {
      console.error(`     … and ${violations.length - 5} more`);
    }
  }
}

async function scanUseStateForDp(root, report) {
  // Heuristic: flag files that use useState AND show signs of DP-adjacent
  // access (import @/devices, reference publishDps, getDp, dpKit, etc.) but
  // do NOT import useProps/useActions from panel-sdk.
  //
  // Files that use useState purely for local UI state (OTA progress, input
  // draft, error messages) with no DP-adjacent imports are intentionally
  // excluded — they are not managing DP state. For example, OtaCard uses
  // useState for upgrade progress without touching the device model at all.
  const DP_ADJACENT_RE = /from\s+['"]@\/devices['"]|publishDps|\.getDp\b|dpKit\b|SmartDeviceModel|panel-sdk/;
  const flagged = [];
  async function walk(dir) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        await walk(full);
      } else if (e.isFile() && CODE_EXTS.has(path.extname(e.name))) {
        const txt = await readFile(full, 'utf8');
        if (!/useState\s*\(/.test(txt)) continue;
        // Already uses panel-sdk hooks correctly alongside useState — fine.
        if (/useProps|useActions/.test(txt)) continue;
        // Only flag if the file also touches the device layer (imports @/devices,
        // calls publishDps, etc.). Pure UI helpers that don't touch DPs at all
        // are allowed to use useState freely.
        if (DP_ADJACENT_RE.test(txt)) {
          flagged.push(path.relative(root, full));
        }
      }
    }
  }
  await walk(path.join(root, 'src'));
  if (flagged.length > 0) {
    report.warn(`${flagged.length} file(s) touch device layer AND use useState without panel-sdk hooks — likely managing DP state via useState (Rule 1). useState is fine for local UI state (input drafts, OTA progress, errors) in files that don't touch @/devices.`);
    for (const f of flagged.slice(0, 5)) console.error(`     ${f}`);
    if (flagged.length > 5) console.error(`     … and ${flagged.length - 5} more`);
  }
}

async function scanHardcodedChinese(root, report) {
  // Scan .tsx/.jsx for Chinese chars inside JSX text or single-quoted strings
  // that look like user-facing copy (not import paths / comments).
  const cnRe = /[一-鿿]/;
  let hits = 0;
  let firstHit = null;
  async function walk(dir) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        await walk(full);
      } else if (e.isFile() && ['.tsx', '.jsx'].includes(path.extname(e.name))) {
        const txt = await readFile(full, 'utf8');
        const lines = txt.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // Skip lines that are clearly comments
          if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
          // Skip lines that look like a t() call already
          if (/\bt\s*\(\s*['"]/.test(line)) continue;
          if (cnRe.test(line)) {
            hits++;
            if (!firstHit) firstHit = `${path.relative(root, full)}:${i + 1}: ${line.trim().slice(0, 80)}`;
          }
        }
      }
    }
  }
  await walk(path.join(root, 'src'));
  if (hits > 0) {
    report.warn(`hardcoded Chinese strings found in ${hits} line(s) of TSX/JSX — should use i18n t() (Rule 5)`);
    if (firstHit) console.error(`     first: ${firstHit}`);
  }
}

async function checkBundleSize(root, report) {
  const distRoot = path.join(root, 'dist');
  if (!existsSync(distRoot)) {
    report.warn('no dist/ directory — run `ray build --target tuya` then re-run validator for bundle-size check');
    return;
  }
  let totalSize = 0;
  async function walk(dir) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.isFile()) {
        try { totalSize += (await stat(full)).size; } catch {}
      }
    }
  }
  await walk(distRoot);
  if (totalSize > MAIN_BUNDLE_MAX) {
    report.error(`dist/ is ${(totalSize / 1024 / 1024).toFixed(2)} MiB > ${MAIN_BUNDLE_MAX / 1024 / 1024} MiB limit`);
  } else {
    report.pass(`dist/ bundle size: ${(totalSize / 1024 / 1024).toFixed(2)} MiB / ${MAIN_BUNDLE_MAX / 1024 / 1024} MiB limit`);
  }
}

async function checkCdnAssets(root, report) {
  const cdnDir = path.join(root, 'cdn');
  if (!existsSync(cdnDir)) {
    report.warn('no cdn/ directory — consider moving large assets here');
    return;
  }
  const large = [];
  async function walk(dir) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.isFile()) {
        try {
          const s = (await stat(full)).size;
          if (s > CDN_FILE_MAX) large.push({ path: path.relative(root, full), size: s });
        } catch {}
      }
    }
  }
  await walk(cdnDir);
  if (large.length > 0) {
    report.warn(`${large.length} cdn asset(s) > ${CDN_FILE_MAX / 1024}KB — consider compression`);
    for (const f of large.slice(0, 3)) {
      console.error(`     ${f.path} (${(f.size / 1024).toFixed(1)} KiB)`);
    }
  } else {
    report.pass('no oversized CDN assets');
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  Main
// ─────────────────────────────────────────────────────────────────────────

async function main() {
  const argv = process.argv.slice(2);
  const start = argv[0] ? path.resolve(argv[0]) : process.cwd();
  const root = findProjectRoot(start);
  if (!root) {
    console.error(`\x1b[31m[panel-foundation] cannot find project.tuya.json starting from ${start}\x1b[0m`);
    console.error('   run this from inside a Tuya Ray panel project (the directory with project.tuya.json),');
    console.error('   or pass the path explicitly: node validate.mjs /path/to/source/miniapp');
    process.exit(3);
  }

  console.log(`[panel-foundation] validating: ${root}\n`);

  const report = new Report();
  await checkProjectTuyaJson(root, report);
  await checkAppConfig(root, report);
  await checkDeviceSchema(root, report);
  await scanForbiddenAPIs(root, report);
  await scanUseStateForDp(root, report);
  await scanHardcodedChinese(root, report);
  await checkBundleSize(root, report);
  await checkCdnAssets(root, report);

  report.print();
  process.exit(report.exitCode());
}

main().catch((e) => {
  console.error(`\x1b[31m[panel-foundation] crash: ${e.stack ?? e.message ?? e}\x1b[0m`);
  process.exit(4);
});
