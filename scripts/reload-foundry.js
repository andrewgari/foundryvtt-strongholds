#!/usr/bin/env node
/**
 * Dev helper: triggers Foundry reload by touching dist/module.json.
 * The dev watcher excludes module.json from its watch set to avoid feedback loops.
 */
import { utimesSync } from 'node:fs';
import { join } from 'node:path';

const manifest = join(process.cwd(), 'dist', 'module.json');
try {
  const now = new Date();
  utimesSync(manifest, now, now);
  console.log('Touched module.json to hint Foundry to reload.');
} catch (e) {
  console.warn('Could not touch module.json; ensure you built once and linked to Foundry.', e);
}
