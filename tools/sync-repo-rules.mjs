#!/usr/bin/env node
// Sync the deterministic rule harness between a repo and the org starter template.
//
//   node tools/sync-repo-rules.mjs              pull the harness DOWN from the starter into this repo
//   node tools/sync-repo-rules.mjs --push       push this repo's harness UP into the starter
//   node tools/sync-repo-rules.mjs --dry-run    print the plan, write nothing
//   node tools/sync-repo-rules.mjs --from <p> --to <p>   explicit source and target repos
//   node tools/sync-repo-rules.mjs --force      overwrite a target file that is NEWER than the source
//
// The harness is `tools/repo-rules/**` plus the package.json scripts that drive it. It is a shared
// organisation asset: a rule that only ever exists in one leaf repo is a rule the org does not have.
//
// This script is re-runnable. Rules are landing in the source repos continuously, so run it again
// whenever you want the target caught up; a second run over an unchanged tree reports every file
// identical and writes nothing.
//
// PINNING. A few harness files are repo-local by construction: `lib/core.mjs` decides which
// directories a repo scans, and `local-exclusions.mjs` names the rules a repo does not register
// yet. Those must not travel in either direction. Before this existed the only thing keeping them
// apart was an mtime accident, so a `--force` run, or any edit on the other side, silently
// reinstated the wrong copy and took findings offline with no failure anywhere. A file carrying
// `sync-repo-rules: pinned` in its first 4KB is now never copied, never overwritten and never
// pushed, `--force` included, and the reason written beside the marker is printed in the plan.
// Read from BOTH copies, so pinning either end is enough.
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const HARNESS_DIR = path.join('tools', 'repo-rules');
const STAGE_DIR = path.join('tools', '.repo-rules-sync-stage');
// A harness script is one that drives the harness, matched by what it runs and not by a hardcoded list.
const isHarnessScript = (name, cmd) =>
  /^(rules|invalidation):/.test(name) || String(cmd).includes('tools/repo-rules');

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const value = (flag, fallback) => (argv.includes(flag) ? argv[argv.indexOf(flag) + 1] : fallback);

const C = process.stdout.isTTY
  ? {
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      green: '\x1b[32m',
      cyan: '\x1b[36m',
      dim: '\x1b[2m',
      bold: '\x1b[1m',
      off: '\x1b[0m',
    }
  : { red: '', yellow: '', green: '', cyan: '', dim: '', bold: '', off: '' };

// The starter is the template every new project is created from, so it is the default other end.
function defaultStarter() {
  if (process.env.RULES_STARTER) return path.resolve(process.env.RULES_STARTER);
  return path.resolve(os.homedir(), 'mm', 'CLET-GSL-DEV', 'starter');
}

function resolveEnds() {
  const explicitFrom = value('--from', null);
  const explicitTo = value('--to', null);
  if (explicitFrom || explicitTo) {
    if (!explicitFrom || !explicitTo) fail('--from and --to must be given together.');
    return { from: path.resolve(explicitFrom), to: path.resolve(explicitTo) };
  }
  const here = path.resolve(process.cwd());
  const starter = defaultStarter();
  // Push sends an improvement made in a leaf repo up to the template; pull is the new-repo case.
  return has('--push') ? { from: here, to: starter } : { from: starter, to: here };
}

function fail(message) {
  console.error(`${C.red}sync-repo-rules:${C.off} ${message}`);
  process.exit(2);
}

function walk(root, rel = '', out = []) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs
    .readdirSync(abs, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const next = rel ? path.join(rel, entry.name) : entry.name;
    if (entry.isDirectory()) walk(root, next, out);
    else out.push(next);
  }
  return out;
}

const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const mtime = (file) => fs.statSync(file).mtimeMs;

// The pin marker, and the reason written on the same line, e.g.
//   // sync-repo-rules: pinned - this repo edits src/core, so it scans it.
const PIN = /sync-repo-rules:\s*pinned\b[\s-]*(.*)$/m;

/** The pin reason if `file` carries the marker in its first 4KB, else null. */
function pinReason(file) {
  if (!fs.existsSync(file)) return null;
  const fd = fs.openSync(file, 'r');
  try {
    const buf = Buffer.alloc(4096);
    const read = fs.readSync(fd, buf, 0, 4096, 0);
    const match = PIN.exec(buf.toString('utf8', 0, read));
    return match ? match[1].trim() || 'no reason given' : null;
  } finally {
    fs.closeSync(fd);
  }
}

// Read the rule ids a repo's registry actually exposes, by loading it the way the harness does.
// Run in a child process because the registry calls process.exit(2) on a duplicate id at module scope.
function readRuleIds(repoRoot, indexPath) {
  const url = pathToFileURL(indexPath).href;
  const script = `import(${JSON.stringify(url)}).then((m) => process.stdout.write(JSON.stringify(m.RULES.map((r) => r.id))), (e) => { console.error(e.message); process.exit(3); });`;
  try {
    const out = execFileSync(process.execPath, ['--input-type=module', '-e', script], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { ok: true, ids: JSON.parse(out) };
  } catch (error) {
    const stderr = (error.stderr || '').toString().trim();
    return { ok: false, ids: [], error: stderr || error.message, code: error.status };
  }
}

function duplicatesIn(ids) {
  const seen = new Set();
  return [...new Set(ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false))))];
}

function classify(from, to) {
  const srcRoot = path.join(from, HARNESS_DIR);
  const dstRoot = path.join(to, HARNESS_DIR);
  const srcFiles = walk(srcRoot);
  const dstFiles = walk(dstRoot);
  const all = [...new Set([...srcFiles, ...dstFiles])].sort();
  return all.map((rel) => {
    const a = path.join(srcRoot, rel);
    const b = path.join(dstRoot, rel);
    const inSrc = fs.existsSync(a);
    const inDst = fs.existsSync(b);
    // Checked before anything else, so a pin outranks every other classification including
    // --force. Either end may carry it: the target pins what it must keep, and pinning in the
    // source is how the template says a file is meant to be written fresh per repo.
    const pinned = pinReason(b) ?? pinReason(a);
    if (pinned) return { rel, state: 'pinned', action: 'none', pinned };
    if (inSrc && !inDst) return { rel, state: 'only-in-source', action: 'add' };
    if (!inSrc && inDst) return { rel, state: 'only-in-target', action: 'keep' };
    if (hash(a) === hash(b)) return { rel, state: 'identical', action: 'none' };
    const newerInSource = mtime(a) > mtime(b);
    return newerInSource
      ? { rel, state: 'newer-in-source', action: 'update' }
      : { rel, state: 'newer-in-target', action: has('--force') ? 'update' : 'conflict' };
  });
}

function planScripts(from, to) {
  const srcPkgPath = path.join(from, 'package.json');
  const dstPkgPath = path.join(to, 'package.json');
  if (!fs.existsSync(srcPkgPath) || !fs.existsSync(dstPkgPath))
    return { add: [], differ: [], dstPkgPath };
  const srcScripts = JSON.parse(fs.readFileSync(srcPkgPath, 'utf8')).scripts ?? {};
  const dstScripts = JSON.parse(fs.readFileSync(dstPkgPath, 'utf8')).scripts ?? {};
  const add = [];
  const differ = [];
  for (const [name, cmd] of Object.entries(srcScripts)) {
    if (!isHarnessScript(name, cmd)) continue;
    if (!(name in dstScripts)) add.push([name, cmd]);
    else if (dstScripts[name] !== cmd) differ.push([name, dstScripts[name], cmd]);
  }
  return { add, differ, dstPkgPath };
}

function copyFile(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  // Carry the source mtime across so a re-run classifies the file as identical rather than newer.
  const s = fs.statSync(src);
  fs.utimesSync(dst, s.atime, s.mtime);
}

// Build the tree the target WOULD have and load it, so a duplicate id is caught before anything is written.
function simulate(from, to, plan) {
  const stageRoot = path.join(to, STAGE_DIR);
  fs.rmSync(stageRoot, { recursive: true, force: true });
  try {
    for (const item of plan) {
      const src =
        item.action === 'add' || item.action === 'update'
          ? path.join(from, HARNESS_DIR, item.rel)
          : path.join(to, HARNESS_DIR, item.rel);
      if (!fs.existsSync(src)) continue;
      copyFile(src, path.join(stageRoot, item.rel));
    }
    const stagedIndex = path.join(stageRoot, 'index.mjs');
    if (!fs.existsSync(stagedIndex))
      return { ok: false, ids: [], error: 'no index.mjs in the resulting harness' };
    return readRuleIds(to, stagedIndex);
  } finally {
    fs.rmSync(stageRoot, { recursive: true, force: true });
  }
}

function main() {
  const { from, to } = resolveEnds();
  const dryRun = has('--dry-run');

  if (!fs.existsSync(path.join(from, HARNESS_DIR))) fail(`source has no ${HARNESS_DIR}: ${from}`);
  if (!fs.existsSync(to)) fail(`target does not exist: ${to}`);
  if (path.resolve(from) === path.resolve(to)) fail('source and target are the same repo.');

  console.log(
    `${C.bold}sync-repo-rules${C.off} ${dryRun ? `${C.cyan}(dry run, nothing will be written)${C.off}` : ''}`,
  );
  console.log(`${C.dim}  from ${from}${C.off}`);
  console.log(`${C.dim}  to   ${to}${C.off}\n`);

  const before = {
    source: readRuleIds(from, path.join(from, HARNESS_DIR, 'index.mjs')),
    target: readRuleIds(to, path.join(to, HARNESS_DIR, 'index.mjs')),
  };
  if (!before.source.ok)
    fail(`the SOURCE registry does not load, refusing to copy it:\n${before.source.error}`);

  const plan = classify(from, to);
  const groups = {
    identical: plan.filter((p) => p.state === 'identical'),
    add: plan.filter((p) => p.action === 'add'),
    update: plan.filter((p) => p.action === 'update'),
    onlyInTarget: plan.filter((p) => p.state === 'only-in-target'),
    conflict: plan.filter((p) => p.action === 'conflict'),
    pinned: plan.filter((p) => p.state === 'pinned'),
  };

  console.log(`${C.bold}rule files${C.off}`);
  for (const p of plan) {
    const tint =
      p.state === 'identical'
        ? C.dim
        : p.state === 'only-in-source'
          ? C.green
          : p.state === 'newer-in-source'
            ? C.green
            : p.state === 'only-in-target'
              ? C.cyan
              : p.state === 'pinned'
                ? C.cyan
                : C.yellow;
    const note =
      p.state === 'only-in-target'
        ? '  kept, this is a local rule file, never deleted'
        : p.state === 'pinned'
          ? `  repo-local, never synced either way: ${p.pinned}`
          : p.action === 'conflict'
            ? '  SKIPPED, the target copy is newer. Push it back, or pass --force'
            : '';
    console.log(`  ${tint}${p.state.padEnd(16)}${C.off} ${p.rel}${C.dim}${note}${C.off}`);
  }

  const scripts = planScripts(from, to);
  console.log(`\n${C.bold}package.json harness scripts${C.off}`);
  if (!scripts.add.length && !scripts.differ.length)
    console.log(`${C.dim}  all present and identical${C.off}`);
  for (const [name, cmd] of scripts.add)
    console.log(`  ${C.green}add${C.off}              ${name}: ${cmd}`);
  for (const [name, mine] of scripts.differ)
    console.log(`  ${C.yellow}differs, kept${C.off}    ${name}: ${mine}`);

  const after = simulate(from, to, plan);
  const beforeTargetCount = before.target.ok ? before.target.ids.length : 0;
  console.log(`\n${C.bold}rule ids${C.off}`);
  console.log(`  source  ${before.source.ids.length}`);
  console.log(
    `  target  ${beforeTargetCount}${before.target.ok ? '' : `  ${C.yellow}(target registry did not load before this sync)${C.off}`}`,
  );

  if (!after.ok) {
    console.error(`\n${C.red}refusing to sync${C.off} the resulting registry does not load:`);
    console.error(after.error);
    process.exit(1);
  }
  const dupes = duplicatesIn(after.ids);
  if (dupes.length) {
    console.error(
      `\n${C.red}refusing to sync${C.off} the resulting registry would carry duplicate ids: ${dupes.join(', ')}`,
    );
    console.error(
      `${C.dim}The registry itself refuses to start on a duplicate id, so this would leave the target broken.${C.off}`,
    );
    process.exit(1);
  }
  console.log(`  target after this sync  ${after.ids.length}  ${C.green}no duplicate ids${C.off}`);

  const added = after.ids.filter((id) => !(before.target.ids ?? []).includes(id));
  const removed = (before.target.ids ?? []).filter((id) => !after.ids.includes(id));
  if (added.length)
    console.log(`\n${C.green}rules gained${C.off} (${added.length}): ${added.join(', ')}`);
  if (removed.length)
    console.log(`${C.yellow}rules lost${C.off} (${removed.length}): ${removed.join(', ')}`);
  if (!added.length && !removed.length) console.log(`\n${C.dim}no rule id changes${C.off}`);

  if (dryRun) {
    console.log(`\n${C.cyan}dry run, nothing written.${C.off} Re-run without --dry-run to apply.`);
    process.exit(0);
  }

  for (const item of [...groups.add, ...groups.update])
    copyFile(path.join(from, HARNESS_DIR, item.rel), path.join(to, HARNESS_DIR, item.rel));

  if (scripts.add.length) {
    const pkg = JSON.parse(fs.readFileSync(scripts.dstPkgPath, 'utf8'));
    pkg.scripts = pkg.scripts ?? {};
    for (const [name, cmd] of scripts.add) pkg.scripts[name] = cmd;
    fs.writeFileSync(scripts.dstPkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  }

  const verify = readRuleIds(to, path.join(to, HARNESS_DIR, 'index.mjs'));
  if (!verify.ok) {
    console.error(
      `\n${C.red}written, but the target registry now fails to load:${C.off}\n${verify.error}`,
    );
    process.exit(1);
  }
  console.log(
    `\n${C.green}synced${C.off} ${groups.add.length} added, ${groups.update.length} updated, ${groups.identical.length} already identical, ` +
      `${groups.onlyInTarget.length} local-only kept, ${groups.pinned.length} pinned, ${groups.conflict.length} skipped as newer in the target.`,
  );
  console.log(`${C.bold}${to} now carries ${verify.ids.length} rules.${C.off}`);
  process.exit(0);
}

main();
