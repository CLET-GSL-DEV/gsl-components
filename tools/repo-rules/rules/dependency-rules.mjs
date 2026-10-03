// Dependency-graph rules. Unlike every other rule file here, these do not read
// source files: they read the lockfile and the installed tree, because a whole
// class of overlay bugs lives in the dependency graph and is invisible to any
// AST check.
//
// The defect this file exists for: @rfdtech/components used to declare its
// Radix packages as loose peerDependencies, so a pnpm app that did not pin
// them got whatever instances the rest of its graph already resolved. When the
// graph resolves two versions of a stateful Radix singleton, the app runs two
// disconnected copies of it. For react-dismissable-layer that means two
// DismissableLayerContext registries: a Modal locks `body { pointer-events:
// none }` through one registry while a Combobox popover registers in the
// other, never receives its `pointer-events: auto` re-enable, and stays
// rendered but click-through. react-focus-scope splits the same way and
// breaks focus coordination between an overlay and a picker inside it.
//
// Both signals are checked because they disagree in the field: a lockfile can
// be unified while node_modules is still installed from an older, split one,
// and a lockfile can carry a split the installed tree has not absorbed yet.
import fs from 'node:fs';
import path from 'node:path';

import { ROOT } from '../lib/core.mjs';

/** The Radix packages that carry module state and must exist exactly once. */
const STATEFUL_RADIX = [
  '@radix-ui/react-dismissable-layer',
  '@radix-ui/react-focus-scope',
];

/**
 * The override block that pins the family to the versions the library is
 * developed and tested against. Kept identical to the block the migrate
 * codemod writes, and to the one already applied in ppm-frontend.
 */
const OVERRIDE_PRESCRIPTION = [
  "overrides:",
  "  '@radix-ui/react-dialog': 1.1.23",
  "  '@radix-ui/react-popover': 1.1.23",
  "  '@radix-ui/react-select': 2.3.7",
  "  '@radix-ui/react-dismissable-layer': 1.1.19",
  "  '@radix-ui/react-focus-scope': 1.1.16",
].join('\n');

/** The @radix-ui packages an app must reference before this rule cares. */
function readsRadix(packageJson) {
  const groups = [
    packageJson.dependencies,
    packageJson.devDependencies,
    packageJson.peerDependencies,
  ];
  return groups.some(
    (group) =>
      group &&
      Object.keys(group).some(
        (name) => name === '@rfdtech/components' || name.startsWith('@radix-ui/'),
      ),
  );
}

function versionOf(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).version;
  } catch {
    return null;
  }
}

/**
 * Versions of the stateful singletons reachable from the INSTALLED tree:
 * walked through realpath from the library's live directory and the
 * root-hoisted @radix-ui packages, so orphaned .pnpm store directories that
// nothing links to any more are never counted.
 */
function installedSplit() {
  const nodeModules = path.join(ROOT, 'node_modules');
  if (!fs.existsSync(nodeModules)) return [];
  const versions = new Map(STATEFUL_RADIX.map((name) => [name, new Set()]));
  const queue = [];
  const libLink = path.join(nodeModules, '@rfdtech', 'components');
  if (fs.existsSync(libLink)) queue.push(libLink);
  const radixRoot = path.join(nodeModules, '@radix-ui');
  if (fs.existsSync(radixRoot)) {
    for (const entry of fs.readdirSync(radixRoot)) {
      queue.push(path.join(radixRoot, entry));
    }
  }

  const seen = new Set();
  while (queue.length > 0) {
    const link = queue.pop();
    let real;
    try {
      real = fs.realpathSync(link);
    } catch {
      continue;
    }
    // The sibling @radix-ui directory sits in the nearest node_modules
    // ancestor: for the library that is two levels up (its own package dir is
    // nested one deeper), for a radix package the parent already is it.
    let cursor = path.dirname(real);
    let siblings = path.join(cursor, '@radix-ui');
    while (path.basename(cursor) !== 'node_modules' && cursor !== path.dirname(cursor)) {
      cursor = path.dirname(cursor);
      siblings = path.join(cursor, '@radix-ui');
    }
    if (!fs.existsSync(siblings)) continue;
    for (const entry of fs.readdirSync(siblings)) {
      const pkgLink = path.join(siblings, entry);
      let realPkg;
      try {
        realPkg = fs.realpathSync(pkgLink);
      } catch {
        continue;
      }
      if (seen.has(realPkg)) continue;
      seen.add(realPkg);
      const name = `@radix-ui/${entry}`;
      if (STATEFUL_RADIX.includes(name)) {
        const version = versionOf(realPkg);
        if (version) versions.get(name).add(version);
      }
      queue.push(pkgLink);
    }
  }

  return [...versions.entries()]
    .filter(([, set]) => set.size > 1)
    .map(([name, set]) => ({ name, versions: [...set] }));
}

/**
 * Versions of the stateful singletons in the lockfile. Lockfile keys repeat a
 * package once per peer combination, so matches are deduped by bare version.
 */
function lockfileSplit() {
  const report = [];
  const pnpmLock = path.join(ROOT, 'pnpm-lock.yaml');
  if (fs.existsSync(pnpmLock)) {
    const text = fs.readFileSync(pnpmLock, 'utf8');
    for (const name of STATEFUL_RADIX) {
      const escaped = name.replace(/[/@]/g, (c) => `\\${c}`);
      const versions = new Set();
      for (const match of text.matchAll(new RegExp(`${escaped}@(\\d+\\.\\d+\\.\\d+)`, 'g'))) {
        versions.add(match[1]);
      }
      if (versions.size > 1) report.push({ name, versions: [...versions] });
    }
    return report;
  }

  const npmLock = path.join(ROOT, 'package-lock.json');
  if (fs.existsSync(npmLock)) {
    let lock;
    try {
      lock = JSON.parse(fs.readFileSync(npmLock, 'utf8'));
    } catch {
      return [];
    }
    for (const name of STATEFUL_RADIX) {
      const versions = new Set();
      for (const [key, entry] of Object.entries(lock.packages ?? {})) {
        if (key === `node_modules/${name}` && entry?.version) versions.add(entry.version);
      }
      if (versions.size > 1) report.push({ name, versions: [...versions] });
    }
  }
  return report;
}

/** Union of both signals, keyed by package so the same split is reported once. */
function splitSingletons() {
  const merged = new Map();
  for (const { name, versions } of [...installedSplit(), ...lockfileSplit()]) {
    const set = merged.get(name) ?? new Set();
    for (const version of versions) set.add(version);
    merged.set(name, set);
  }
  return [...merged.entries()]
    .filter(([, set]) => set.size > 1)
    .map(([name, set]) => ({ name, versions: [...set] }));
}

export const radixSingleInstance = {
  id: 'radix-single-instance',
  doc: 'The stateful Radix singletons (react-dismissable-layer, react-focus-scope) must resolve to exactly one version each. Pin the family with pnpm.overrides when the lockfile or the installed tree carries a split.',
  why: 'Two copies of react-dismissable-layer are two DismissableLayer registries: a Modal locks body pointer-events through one while a Combobox popover registers in the other and stays visible but click-through. The defect is invisible in source; only the dependency graph shows it.',
  // Repo-level property, deliberately not gated on the file list: a split
  // hurts every commit until it is fixed, and the check is two file reads.
  check() {
    let packageJson;
    try {
      packageJson = JSON.parse(
        fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'),
      );
    } catch {
      return [];
    }
    if (!readsRadix(packageJson)) return [];

    return splitSingletons().map(({ name, versions }) => ({
      file: 'pnpm-lock.yaml',
      line: 1,
      message:
        `${name} resolves to ${versions.length} versions (${versions.join(', ')}). ` +
        'The split instance breaks overlay coordination (click-through popovers, lost focus). ' +
        `Pin the family in pnpm-workspace.yaml or package.json and reinstall:\n${OVERRIDE_PRESCRIPTION}\n` +
        'Or run `rfdui migrate --write` on the repo, which writes the block.',
      snippet: `@radix-ui split instances: ${name}`,
    }));
  },
};

export default [radixSingleInstance];
