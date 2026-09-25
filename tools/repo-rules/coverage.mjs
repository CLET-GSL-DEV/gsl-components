#!/usr/bin/env node
// `pnpm rules:coverage` - which rules are actually looking at anything.
//
// A rule reporting zero violations means one of two very different things: it holds everywhere, or
// it never opened a file. This build has now shipped three checks of the second kind. Playwright's
// full-page screenshot captured one screenful because the app scrolls inside its own container.
// Prettier answered "all matched files use Prettier code style" over zero matched files. And the
// status rule was scoped to `pages`, so it never saw a single register whose table lives in a
// shared component. All three read as a pass.
//
// This prints, per rule, how many files it opened. Zero is a rule that is not running.
import fs from 'node:fs';
import process from 'node:process';

import { RULES } from './index.mjs';
import { ROOT, TOUCHED, allFiles, recordTouches } from './lib/core.mjs';

/* Several rules read a single document straight off disk rather than through the shared helpers: the CSP in `index.html`, the headers file, the page inventory. Watching only the helpers reported those three as blind, which is this tool committing the exact error it exists to catch. `fs` is one module object across the process, so patching the two entry points here sees them too. */
const realRead = fs.readFileSync;
const realExists = fs.existsSync;
fs.readFileSync = function patched(file, ...rest) {
  if (typeof file === 'string') TOUCHED.add(file);
  return realRead.call(this, file, ...rest);
};
fs.existsSync = function patched(file, ...rest) {
  if (typeof file === 'string') TOUCHED.add(file);
  return realExists.call(this, file, ...rest);
};

/* Named, with the reason, rather than filtered out quietly. A rule that legitimately opens nothing is still worth printing, because the day its reason stops being true is the day it becomes a dead check nobody is watching. */
const EXPECTED_BLIND = new Map([
  [
    'no-dangling-invalidation',
    'reads the composed map, which an earlier rule in the same process already cached, so it opens nothing of its own',
  ],
  [
    'no-types-in-endpoint-files',
    'this build has no src/api/ yet, so there are no endpoint files to police; it lights up with the first real endpoint',
  ],
]);

const files = allFiles();
const rows = [];

for (const rule of RULES) {
  recordTouches(true);
  let crashed = null;
  try {
    rule.check(files);
  } catch (error) {
    crashed = error.message;
  }
  rows.push({ id: rule.id, touched: TOUCHED.size, crashed });
  recordTouches(false);
}

const C = process.stdout.isTTY
  ? { red: '\x1b[31m', yellow: '\x1b[33m', green: '\x1b[32m', dim: '\x1b[2m', bold: '\x1b[1m', off: '\x1b[0m' }
  : { red: '', yellow: '', green: '', dim: '', bold: '', off: '' };

// A rule reading one or two files is usually correct: several read only the router, the invalidation
// map or one contract document. Zero is never correct, and neither is a crash.
const blind = rows.filter((r) => r.touched === 0 && !r.crashed && !EXPECTED_BLIND.has(r.id));
const explained = rows.filter((r) => r.touched === 0 && !r.crashed && EXPECTED_BLIND.has(r.id));
const crashed = rows.filter((r) => r.crashed);
const narrow = rows.filter((r) => r.touched > 0 && r.touched <= 2);

console.log(
  `${C.bold}rule coverage${C.off} ${C.dim}${RULES.length} rules over ${files.length} files in ${ROOT.split('/').pop()}${C.off}\n`,
);

if (crashed.length) {
  console.log(`${C.red}${crashed.length} crashed${C.off}`);
  for (const r of crashed) console.log(`    ${r.id}  ${r.crashed}`);
  console.log();
}

if (blind.length) {
  console.log(`${C.red}${blind.length} opened no file at all${C.off} ${C.dim}reporting clean by seeing nothing${C.off}`);
  for (const r of blind) console.log(`    ${r.id}`);
  console.log();
}

if (explained.length) {
  console.log(`${C.dim}${explained.length} open nothing for a stated reason${C.off}`);
  for (const r of explained) console.log(`${C.dim}    ${r.id}  ${EXPECTED_BLIND.get(r.id)}${C.off}`);
  console.log();
}

if (narrow.length) {
  console.log(
    `${C.yellow}${narrow.length} read one or two files${C.off} ${C.dim}correct for a rule about the router or the map, worth a look otherwise${C.off}`,
  );
  for (const r of narrow) console.log(`    ${r.id}  ${C.dim}${r.touched} file${r.touched === 1 ? '' : 's'}${C.off}`);
  console.log();
}

const healthy = rows.length - blind.length - crashed.length;
console.log(`${C.green}${healthy}${C.off} of ${rows.length} rules opened at least one file.`);
process.exit(blind.length || crashed.length ? 1 : 0);
