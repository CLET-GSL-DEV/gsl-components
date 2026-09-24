#!/usr/bin/env node
// Fail when a working-tree diff touches a path its plan put under `## Do not touch`.
//
//   node tools/repo-rules/scope-guard.mjs plans/routes/a-route-paths-1.md
//   node tools/repo-rules/scope-guard.mjs plans/routes/*.md        # union of every plan
//
// Written after a subagent edited `src/core/auth/LoginScreen.tsx`, a path its plan explicitly
// forbade, and rewrote UI copy that had nothing to do with the task. Every acceptance command
// the agent ran still passed, and its own summary reported success. Only a `git status` sweep
// caught it, which is not a check, it is someone happening to look.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import process from 'node:process';

const argv = process.argv.slice(2);

// `--allow <glob>` exempts a path the ORCHESTRATOR changed on purpose. The plans forbid agents
// from touching the rule harness; they do not forbid the person writing the rules.
const allowGlobs = [];
const planPaths = [];
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === '--allow') {
    allowGlobs.push(argv[i + 1]);
    i += 1;
  } else {
    planPaths.push(argv[i]);
  }
}

if (!planPaths.length) {
  console.error('usage: scope-guard.mjs [--allow <glob>]... <plan.md> [plan.md ...]');
  process.exit(2);
}

/** The globs listed under `## Do not touch`, up to the next heading. */
function forbiddenGlobs(planPath) {
  const text = fs.readFileSync(planPath, 'utf8');
  const section = text.split(/^##\s+Do not touch\s*$/m)[1];
  if (!section) return [];
  const body = section.split(/^##\s/m)[0];
  const globs = [];
  for (const line of body.split('\n')) {
    // `- \`src/core/**\` - shared kit`  ->  src/core/**
    const m = line.match(/^\s*-\s*`([^`]+)`/);
    if (m) globs.push(m[1].trim());
  }
  return globs;
}

/** Glob to RegExp: `**` spans separators, `*` does not. */
function globToRe(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i += 1) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        re += '.*';
        i += 1;
        // Swallow the separator after `**` so `src/core/**` also matches `src/core`.
        if (glob[i + 1] === '/') i += 1;
      } else {
        re += '[^/]*';
      }
    } else if ('.+^${}()|[]\\/'.includes(c)) {
      re += `\\${c}`;
    } else {
      re += c;
    }
  }
  return new RegExp(`^${re}$`);
}

const globs = [...new Set(planPaths.flatMap(forbiddenGlobs))];
if (!globs.length) {
  console.error('No `## Do not touch` section found in any plan. Refusing to pass vacuously.');
  process.exit(2);
}

const changed = execSync('git diff --name-only HEAD', { encoding: 'utf8' })
  .split('\n')
  .map((f) => f.trim())
  .filter(Boolean);

const matchers = globs.map((g) => ({ glob: g, re: globToRe(g) }));
const allowMatchers = allowGlobs.map(globToRe);
const breaches = [];
for (const file of changed) {
  if (allowMatchers.some((re) => re.test(file))) continue;
  for (const { glob, re } of matchers) {
    if (re.test(file)) breaches.push({ file, glob });
  }
}

if (!breaches.length) {
  console.log(
    `scope-guard: clean - ${changed.length} changed files, none under ${globs.length} forbidden globs.`,
  );
  process.exit(0);
}

console.error(`scope-guard: ${breaches.length} SCOPE BREACH(ES)\n`);
for (const { file, glob } of breaches) {
  console.error(`  ${file}`);
  console.error(`    forbidden by: ${glob}`);
}
console.error('\nRevert each with:  git checkout -- <file>');
process.exit(1);
