#!/usr/bin/env node
// `pnpm rules:dryrun` - run every rule against the fixture tree and check the result.
//
// A rule that only ever fires is as useless as one that never does, so the fixture carries both:
// code that SHOULD trip each rule, and code that must NOT. This asserts both halves. Run it after
// touching any rule, before propagating a rule to another repo.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { ROOT } from './lib/core.mjs';
import api from './rules/api-rules.mjs';
import flow from './rules/flow-rules.mjs';
import jsx from './rules/jsx-rules.mjs';
import quality from './rules/quality-rules.mjs';
import route from './rules/route-rules.mjs';

const FIXTURES = path.join(ROOT, 'tools/repo-rules/fixtures');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(full)) out.push(full);
  }
  return out;
}

// What each rule must find in the fixture tree, and what it must not.
const EXPECT = [
  // One, not two: the placeholder object in this fixture sits in a hook call, not in JSX, so this
  // rule correctly leaves it to `no-placeholder-data`.
  { rule: 'no-inline-literal-in-render', mustFireIn: ['Bad.tsx'], count: 2 },
  { rule: 'no-placeholder-data', mustFireIn: ['Bad.tsx'], count: 1 },
  { rule: 'no-types-in-endpoint-files', mustFireIn: ['things.ts'], count: 1 },
  { rule: 'no-gratuitous-optional', mustFireIn: ['types.ts'], count: 1 },
  { rule: 'clean-module-boundaries', mustFireIn: ['CrossImport.tsx'], count: 1 },
  // Fires on the duplicated union, and NOT on `LIFECYCLES`, which is the derived-from-const shape
  // this rule is asking for.
  { rule: 'no-duplicated-union-literal', mustFireIn: ['Bad.tsx'], count: 2 },
  // Two names, each declared in two files, so four sites are reported.
  { rule: 'no-duplicated-constant', mustFireIn: ['Bad.tsx', 'Dup.tsx'], count: 4 },
  // Five in Nav.tsx and one in router-ish.ts, and NONE of the accepted composed shapes.
  { rule: 'no-hardcoded-route', mustFireIn: ['Nav.tsx', 'router-ish.ts'], count: 6 },
];

const RULES = [...quality, ...route, ...api, ...jsx, ...flow];
const files = walk(FIXTURES);
const C = process.stdout.isTTY
  ? { red: '\x1b[31m', green: '\x1b[32m', dim: '\x1b[2m', bold: '\x1b[1m', off: '\x1b[0m' }
  : { red: '', green: '', dim: '', bold: '', off: '' };

console.log(`${C.bold}rule dry run${C.off} ${C.dim}${files.length} fixture files${C.off}\n`);

let failures = 0;
for (const expectation of EXPECT) {
  const rule = RULES.find((r) => r.id === expectation.rule);
  if (!rule) {
    console.log(`${C.red}MISSING${C.off} no rule with id ${expectation.rule}`);
    failures += 1;
    continue;
  }
  const found = rule.check(files) ?? [];
  const where = [...new Set(found.map((f) => path.basename(f.file)))];
  const wrongFile = where.filter((w) => !expectation.mustFireIn.includes(w));

  if (found.length !== expectation.count) {
    console.log(
      `${C.red}FAIL${C.off}    ${rule.id}  expected ${expectation.count} finding(s), got ${found.length}`,
    );
    for (const f of found)
      console.log(`${C.dim}          ${f.file}:${f.line}  ${f.message}${C.off}`);
    failures += 1;
    continue;
  }
  if (wrongFile.length) {
    console.log(
      `${C.red}FAIL${C.off}    ${rule.id}  fired in an unexpected file: ${wrongFile.join(', ')}`,
    );
    failures += 1;
    continue;
  }
  console.log(
    `${C.green}ok${C.off}      ${rule.id}  ${C.dim}${found.length} finding(s) in ${where.join(', ')}${C.off}`,
  );
}

// Every other rule must stay silent on the fixtures, which is what proves they do not over-fire.
const expected = new Set(EXPECT.map((e) => e.rule));
for (const rule of RULES.filter((r) => !expected.has(r.id))) {
  let found = [];
  try {
    found = rule.check(files) ?? [];
  } catch (error) {
    console.log(`${C.red}CRASH${C.off}   ${rule.id}  ${error.message}`);
    failures += 1;
    continue;
  }
  if (found.length) {
    console.log(
      `${C.red}NOISE${C.off}   ${rule.id}  fired ${found.length} time(s) on fixtures it should ignore`,
    );
    for (const f of found.slice(0, 3))
      console.log(`${C.dim}          ${f.file}:${f.line}  ${f.message}${C.off}`);
    failures += 1;
  }
}

console.log();
if (failures) {
  console.log(`${C.red}${failures} rule(s) behaved wrongly on the fixtures.${C.off}`);
  process.exit(1);
}
console.log(`${C.green}every rule fires where it should and nowhere else.${C.off}`);
