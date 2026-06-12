#!/usr/bin/env node
// One-shot migration: clean up demos manifest structure.
// See docs/superpowers/specs/2026-06-12-demos-manifest-cleanup-design.md
//
//   node tools/migrate-demos-schema.mjs           # dry-run (default): report only
//   node tools/migrate-demos-schema.mjs --apply    # write changes to disk
//
// Transforms (manifest data only — no IDE code):
//   index.json items:  + type (from tags[0]/legacy category); tags drop 'app'/'example'
//   <id>.json detail:  slim to incremental — keep only id + defaultConfig(non-empty)
//                      + configs(non-empty, overrides stripped) + documentation(readme not all-null);
//                      drop boardConfigs and every field duplicated from index.
//   detail that slims to just {id}: deleted (IDE falls back to the index entry).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APPLY = process.argv.includes('--apply');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEMOS = path.resolve(HERE, '..', 'demos');

const SKIP = new Set(['index.json', 'demo-template.json']);
const INDEX_KEY_ORDER = ['id', 'type', 'name', 'summary', 'tags', 'boards', 'compatibilityType', 'source', 'image', 'publish'];
const DETAIL_KEY_ORDER = ['id', 'defaultConfig', 'configs', 'documentation'];

const isEmptyObj = (o) => !o || typeof o !== 'object' || Object.keys(o).length === 0;
const readmeAllNull = (doc) => {
  const r = doc?.readme;
  if (!r || typeof r !== 'object') return true;
  return Object.values(r).every((v) => v == null || v === '');
};

function ordered(obj, order) {
  const out = {};
  for (const k of order) if (k in obj) out[k] = obj[k];
  // preserve any unknown keys (forward-compat) at the end, deterministically
  for (const k of Object.keys(obj).sort()) if (!(k in out)) out[k] = obj[k];
  return out;
}

const report = { index: { added: 0, tagsStripped: 0 }, detail: { rewritten: 0, deleted: [], boardConfigsRemoved: 0, overridesStripped: 0, docDropped: 0, defaultConfigDropped: 0 } };

// ---- index.json ----
const indexPath = path.join(DEMOS, 'index.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
for (const item of index.items) {
  const tags = Array.isArray(item.tags) ? item.tags : [];
  // Derive type from legacy tags[0] (or existing field) — 'app' vs 'example'.
  const type = item.type === 'app' || item.category === 'app' ? 'app'
    : item.type === 'example' || item.category === 'example' ? 'example'
    : tags.includes('app') ? 'app' : 'example';
  if (!('type' in item)) report.index.added++;
  const newTags = tags.filter((t) => t !== 'app' && t !== 'example');
  if (newTags.length !== tags.length) report.index.tagsStripped++;
  delete item.category;
  item.type = type;
  item.tags = newTags;
  // reorder in place
  const reordered = ordered(item, INDEX_KEY_ORDER);
  for (const k of Object.keys(item)) delete item[k];
  Object.assign(item, reordered);
}

// ---- detail files ----
const files = fs.readdirSync(DEMOS).filter((f) => f.endsWith('.json') && !SKIP.has(f));
const toDelete = [];
const rewrites = [];
for (const f of files) {
  const p = path.join(DEMOS, f);
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  const slim = { id: d.id };

  if (!isEmptyObj(d.defaultConfig)) slim.defaultConfig = d.defaultConfig;
  else if ('defaultConfig' in d) report.detail.defaultConfigDropped++;

  if (!isEmptyObj(d.configs)) {
    const configs = {};
    for (const [k, v] of Object.entries(d.configs)) {
      const file = typeof v === 'object' ? v.file : v;
      if (file) configs[k] = { file }; // overrides stripped
      if (v && typeof v === 'object' && !isEmptyObj(v.overrides)) report.detail.overridesStripped++;
    }
    if (Object.keys(configs).length) slim.configs = configs;
  }

  if ('boardConfigs' in d) report.detail.boardConfigsRemoved++;

  if (d.documentation && !readmeAllNull(d.documentation)) slim.documentation = d.documentation;
  else if (d.documentation) report.detail.docDropped++;

  const onlyId = Object.keys(slim).length === 1;
  if (onlyId) {
    toDelete.push(f);
  } else {
    rewrites.push([p, ordered(slim, DETAIL_KEY_ORDER), f]);
  }
}
report.detail.rewritten = rewrites.length;
report.detail.deleted = toDelete;

// ---- write or report ----
if (APPLY) {
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n');
  for (const [p, obj] of rewrites) fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n');
  for (const f of toDelete) fs.unlinkSync(path.join(DEMOS, f));
  console.log('APPLIED.');
} else {
  console.log('DRY-RUN (no files written). Pass --apply to write.\n');
}

console.log('index.json:');
console.log(`  type set:              ${report.index.added}`);
console.log(`  items with tags trimmed: ${report.index.tagsStripped}`);
console.log('\ndetail files:');
console.log(`  total scanned:         ${files.length}`);
console.log(`  rewritten (incremental): ${report.detail.rewritten}`);
console.log(`  deleted (slimmed to {id}): ${report.detail.deleted.length}`);
console.log(`  boardConfigs removed:  ${report.detail.boardConfigsRemoved}`);
console.log(`  overrides stripped:    ${report.detail.overridesStripped}`);
console.log(`  empty defaultConfig dropped: ${report.detail.defaultConfigDropped}`);
console.log(`  null-readme docs dropped: ${report.detail.docDropped}`);
console.log('\ndeleted files:\n  ' + (report.detail.deleted.join('\n  ') || '(none)'));

// sample previews
const sampleIdx = index.items.find((i) => i.id === 'peripherals-led');
const sampleDetail = rewrites.find(([, , f]) => f === 'peripherals-led.json');
console.log('\n--- sample index entry (peripherals-led) ---');
console.log(JSON.stringify(sampleIdx, null, 2));
if (sampleDetail) {
  console.log('\n--- sample detail (peripherals-led.json) ---');
  console.log(JSON.stringify(sampleDetail[1], null, 2));
}
