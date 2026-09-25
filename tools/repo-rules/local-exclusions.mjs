// gsl-components registers the accessibility rules and nothing else.
//
// This is the component LIBRARY, not an app. The rest of the harness encodes app-shaped contracts
// - page headers, route depth, sidebar destinations, metric strips, endpoint factories - and none
// of them have a meaning inside a package that ships the primitives those contracts are written
// about. Registering them here would produce a wall of violations that says nothing.
//
// The accessibility rules are different: the defects they catch ORIGINATE here. The September 2026
// audit found all seven in this package, and they reached the apps by being copied. A rule that
// only ever runs in the apps polices the copies and leaves the source unguarded, so these five run
// here first.
//
// The exclusion list is COMPUTED from the rules directory rather than typed out, so a rule added
// to the template lands in whichever half it belongs to with no edit here. It reads the directory
// instead of importing ./index.mjs because index.mjs imports this file, and the two would
// deadlock.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import a11yRules from './rules/a11y-rules.mjs';

const rulesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'rules');
const REGISTERED = new Set(a11yRules.map((r) => r.id));

// Only the rule FILES index.mjs actually imports count. The directory also holds modules the
// registry does not spread, and naming one of those here makes the registry refuse to start.
const indexSource = readFileSync(path.join(rulesDir, '..', 'index.mjs'), 'utf8');
const registeredFiles = new Set(
  [...indexSource.matchAll(/from ['"]\.\/rules\/([\w.-]+\.mjs)['"]/g)].map((m) => m[1]),
);

const entries = [];
for (const file of readdirSync(rulesDir)) {
  if (!registeredFiles.has(file) || file === 'a11y-rules.mjs') continue;
  const mod = await import(path.join(rulesDir, file));
  for (const rule of mod.default ?? []) {
    if (REGISTERED.has(rule.id)) continue;
    entries.push([
      rule.id,
      'App-shaped rule: gsl-components is the component library, not an app. Only the accessibility rules run here.',
    ]);
  }
}

export const NOT_REGISTERED_HERE = new Map(entries);
