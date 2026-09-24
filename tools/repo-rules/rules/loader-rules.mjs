// Some modules are loaded by Node itself, outside Vite. What Vite rewrites, Node throws on.
import path from 'node:path';

import { ROOT, ast, rel, ts } from '../lib/core.mjs';

import fs from 'node:fs';

/** The component kit. Its entry pulls a stylesheet, which is why importing it from a Node loaded module is fatal rather than merely untidy. */
const KIT = '@rfdtech/components';

/** Loaded by Node directly: the Playwright specs, and the fixtures they read real ids out of. Everything else goes through Vite, which rewrites a stylesheet import into something a browser understands. */
function isNodeLoaded(file) {
  return /\/src\/mock-data\//.test(file) || /\/e2e\//.test(file);
}

/** The two aliases, plus a relative path, resolved the way `tsconfig.json` and `vite.config.ts` both resolve them. */
function resolveSpecifier(spec, fromFile) {
  let base;
  if (spec.startsWith('@core/')) base = path.join(ROOT, 'src/core', spec.slice('@core/'.length));
  else if (spec.startsWith('@/')) base = path.join(ROOT, 'src', spec.slice('@/'.length));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec);
  else return null;
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
  ]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/** Every module specifier this file pulls in at RUNTIME. A type-only import is erased before Node ever sees it, so it can never drag a stylesheet in and is not counted. */
function runtimeSpecifiers(file) {
  const src = ast(file);
  const out = [];
  for (const stmt of src.statements) {
    const isImport = ts.isImportDeclaration(stmt);
    const isReExport = ts.isExportDeclaration(stmt) && stmt.moduleSpecifier;
    if (!isImport && !isReExport) continue;
    if (isImport && stmt.importClause?.isTypeOnly) continue;
    if (isReExport && stmt.isTypeOnly) continue;
    const specifier = isImport ? stmt.moduleSpecifier : stmt.moduleSpecifier;
    if (!specifier || !ts.isStringLiteral(specifier)) continue;
    out.push({ text: specifier.text, node: stmt });
  }
  return { src, imports: out };
}

/** Walks a module's runtime imports until it finds the kit, and returns the chain that reached it. Bounded by a visited set, so a cycle in the app's own modules cannot hang the check. */
function chainToKit(entry, seen = new Set()) {
  if (seen.has(entry)) return null;
  seen.add(entry);
  let imports;
  try {
    ({ imports } = runtimeSpecifiers(entry));
  } catch {
    return null;
  }
  for (const { text } of imports) {
    if (text === KIT || text.startsWith(`${KIT}/`)) return [entry];
    const next = resolveSpecifier(text, entry);
    if (!next) continue;
    const deeper = chainToKit(next, seen);
    if (deeper) return [entry, ...deeper];
  }
  return null;
}

const fixturesFreeOfUiRuntime = {
  id: 'fixtures-free-of-ui-runtime',
  doc: 'A fixture or a Playwright spec never reaches the component kit at runtime, however many modules away it is.',
  why: "Playwright's specs and the fixtures they read ids from are loaded by Node, not by Vite. The kit's entry imports a stylesheet, and Node answers `Unknown file extension \".css\"` and then `No tests found`, so the whole screen walk reports nothing rather than failing loudly. It happened once through a barrel that re-exported every table cell, and the walk stayed dead for five commits because the error names a CSS file and never names the import that caused it.",
  check(files) {
    const out = [];
    for (const f of files.filter(isNodeLoaded)) {
      let parsed;
      try {
        parsed = runtimeSpecifiers(f);
      } catch {
        continue;
      }
      const { src, imports } = parsed;
      for (const { text, node } of imports) {
        if (text === KIT || text.startsWith(`${KIT}/`)) {
          out.push({
            file: rel(f),
            line: src.getLineAndCharacterOfPosition(node.getStart(src)).line + 1,
            message: `imports ${KIT} at runtime, which Node cannot load: import the type only, or the plain module holding the value`,
          });
          continue;
        }
        const target = resolveSpecifier(text, f);
        if (!target) continue;
        const chain = chainToKit(target);
        if (!chain) continue;
        const via = chain.map((c) => rel(c)).join(' imports ');
        out.push({
          file: rel(f),
          line: src.getLineAndCharacterOfPosition(node.getStart(src)).line + 1,
          message: `'${text}' reaches ${KIT} at runtime and this module is loaded by Node, so the Playwright run dies with a CSS error: ${via} imports ${KIT}. Import the specific module that holds the value, not the barrel.`,
        });
      }
    }
    return out;
  },
};

export default [fixturesFreeOfUiRuntime];
