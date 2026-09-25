#!/usr/bin/env node
// `pnpm invalidation:check` / `pnpm invalidation:write`
//
//   pnpm invalidation:check    compare invalidation-map.json against what the code does
//   pnpm invalidation:write    regenerate invalidation-map.json, then read the diff
//   pnpm invalidation:check --json
//
// The map is committed. That is the whole point: a change to which writes invalidate which reads
// becomes a line in a diff someone reviews, instead of a silent behaviour change that surfaces
// weeks later as a screen showing yesterday's numbers.
import process from 'node:process';

import { allSourceFiles } from './lib/core.mjs';
import {
  MAP_PATH,
  composeInvalidationMap,
  danglingInvalidations,
  diffInvalidationMap,
  orphanReads,
  readDeclaredMap,
  writeDeclaredMap,
} from './lib/invalidation.mjs';

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const WRITE = has('--write');

const C = process.stdout.isTTY
  ? {
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      green: '\x1b[32m',
      dim: '\x1b[2m',
      bold: '\x1b[1m',
      off: '\x1b[0m',
    }
  : { red: '', yellow: '', green: '', dim: '', bold: '', off: '' };

// `allSourceFiles()` and not `allFiles()`: the base layer is out of scope for the rules but its
// query keys are live at runtime, and `invalidation-rules.mjs` composes the map the same way.
// Reading the narrower list here made this CLI write a map the blocking rule then rejected.
const files = allSourceFiles();
const { keys, problems } = composeInvalidationMap(files);
const keyCount = Object.keys(keys).length;

if (has('--json')) {
  const findings = WRITE ? [] : diffInvalidationMap(keys, readDeclaredMap());
  console.log(JSON.stringify({ keys, problems, findings }, null, 2));
  process.exit(problems.length + findings.length ? 1 : 0);
}

if (WRITE) {
  writeDeclaredMap(keys);
  console.log(`${C.green}wrote${C.off} invalidation-map.json  ${C.dim}${keyCount} keys${C.off}`);
  report();
  process.exit(problems.length ? 1 : 0);
}

const findings = diffInvalidationMap(keys, readDeclaredMap());

console.log(
  `${C.bold}invalidation map${C.off} ${C.dim}${keyCount} keys across ${files.length} files${C.off}\n`,
);

for (const problem of problems) {
  console.log(
    `  ${C.red}unresolvable${C.off}  ${problem.file}:${problem.line}  ${problem.message}`,
  );
}
for (const finding of findings) {
  console.log(`  ${C.red}out of date${C.off}   ${finding.message}`);
}
report();

if (problems.length + findings.length === 0) {
  console.log(`\n${C.green}clean${C.off} - the committed map matches what the code does.`);
  process.exit(0);
}
console.log(
  `\n${C.red}${problems.length + findings.length} problems${C.off}. Fix the unresolvable keys, then \`pnpm invalidation:write\` and review the diff.`,
);
process.exit(1);

function report() {
  const dangling = danglingInvalidations(keys);
  const orphans = orphanReads(keys);
  if (dangling.length) {
    console.log(
      `\n  ${C.red}invalidates a key nothing reads${C.off} ${C.dim}(misspelt, or the read was deleted)${C.off}`,
    );
    for (const id of dangling) console.log(`    ${id}`);
  }
  if (orphans.length) {
    console.log(
      `\n  ${C.yellow}read but never invalidated${C.off} ${C.dim}(right for static data, stale for anything else)${C.off}`,
    );
    for (const id of orphans) console.log(`    ${id}`);
  }
  void MAP_PATH;
}
