#!/usr/bin/env node
/*
 Simple dev auto-reload watcher with zero dependencies.
 - Scans key module files and directories periodically
 - When it detects a change, it updates dev-reload.json with a new token
 - The module (when Dev: Auto Reload is enabled) polls dev-reload.json and reloads clients on change
*/
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const MODULE_ROOT = ROOT; // This script should be run from the module root
const OUTPUT_FILE = path.join(MODULE_ROOT, 'dev-reload.json');
// Attempt to also write into Foundry's served module directory (so clients can fetch it)
const HOME = process.env.HOME || require('os').homedir();
const MODULE_ID = 'strongholds-and-followers';
const DEFAULT_DATA_DIR = path.join(HOME, '.local', 'share', 'FoundryVTT');
const FOUNDRY_DATA_DIR = process.env.FOUNDRY_DATA_DIR || DEFAULT_DATA_DIR;
const SERVED_OUTPUT_FILE = path.join(
  FOUNDRY_DATA_DIR,
  'Data',
  'modules',
  MODULE_ID,
  'dev-reload.json',
);

// Directories/files to watch for changes
const WATCH_TARGETS = ['scripts', 'templates', 'styles', 'lang', 'module.json'];

const EXCLUDE_DIRS = new Set(['.git', 'node_modules', '.idea', '.vscode']);
const EXCLUDE_FILES = new Set(['package-lock.json']);

function isExcluded(p) {
  const parts = p.split(path.sep);
  return parts.some((seg) => EXCLUDE_DIRS.has(seg)) || EXCLUDE_FILES.has(path.basename(p));
}

function listFilesRec(targetPath) {
  const out = [];
  const abs = path.join(MODULE_ROOT, targetPath);
  if (!fs.existsSync(abs)) return out;
  const stat = fs.statSync(abs);
  if (stat.isFile()) {
    if (!isExcluded(abs)) out.push(abs);
    return out;
  }
  const stack = [abs];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      const full = path.join(current, ent.name);
      if (isExcluded(full)) continue;
      if (ent.isDirectory()) stack.push(full);
      else out.push(full);
    }
  }
  return out;
}

function computeSnapshot() {
  const files = WATCH_TARGETS.flatMap((t) => listFilesRec(t));
  let latest = 0;
  let count = 0;
  for (const f of files) {
    try {
      const s = fs.statSync(f);
      latest = Math.max(latest, s.mtimeMs);
      count++;
    } catch {}
  }
  return { latest, count };
}

function safeWrite(p, contents) {
  try {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, contents);
    return true;
  } catch (e) {
    log(`Write failed: ${p} (${e.message})`);
    return false;
  }
}

function writeToken() {
  const token = Date.now().toString();
  const payload = JSON.stringify({ token }, null, 2);
  safeWrite(OUTPUT_FILE, payload);
  safeWrite(SERVED_OUTPUT_FILE, payload);
  log(`Updated token -> ${token}`);
}

function log(msg) {
  process.stdout.write(`[dev-reload] ${msg}\n`);
}

// Ensure output file exists
if (!fs.existsSync(OUTPUT_FILE)) {
  writeToken();
}

let last = computeSnapshot();
log(`Watching for changes in: ${WATCH_TARGETS.join(', ')}`);
log(`Initial snapshot: ${last.count} files, latest mtime ${new Date(last.latest).toISOString()}`);

setInterval(() => {
  const now = computeSnapshot();
  if (now.latest !== last.latest || now.count !== last.count) {
    writeToken();
    last = now;
  }
}, 1000);
