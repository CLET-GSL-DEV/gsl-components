// Shared plumbing for the repo-rule checks: file discovery, AST access, reporting.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

export const ROOT = path.resolve(process.cwd());

/** Every file a rule actually opened, recorded so `pnpm rules:coverage` can tell a rule that holds from a rule that is looking at nothing. A rule scoped to a filename a repo does not have reports clean forever. Off unless the coverage tool turns it on, so it costs a normal run nothing. */
export const TOUCHED = new Set();
let recording = false;
export function recordTouches(on) {
  recording = on;
  if (on) TOUCHED.clear();
}

/**
 * File discovery for the rule harness. This repo is a single React application: app code lives
 * under `src`, and the Playwright suites under `e2e` are first-class source because they are the
 * only thing that proves a page renders. Both are scanned; `src/core` is not, see CORE_LAYER.
 */
function scanDirs() {
  return ['src', 'e2e', 'e2e-uat', 'qa'];
}

const SCAN_DIRS = scanDirs();
const SKIP = /node_modules|\.turbo|dist|coverage|\.d\.ts$/;

/**
 * `src/core` is the BASE LAYER: vendored, shared infrastructure (api-client, auth, ui, utils,
 * hooks, types, styles) that this repo consumes and never edits. It is the direct descendant of
 * what used to be `packages/*` in the monorepo. These rules exist to police the code this repo
 * writes, so scanning the base layer only produces findings nobody here is allowed to act on.
 * Excluded once, here, rather than by a skip inside each rule.
 */
const CORE_LAYER = /^src[/\\]core[/\\]/;

const isCore = (relPath) => CORE_LAYER.test(relPath.split(path.sep).join('/'));

/** Every source file the rules apply to. The base layer at `src/core` is not one of them. */
/**
 * A file that declares API endpoints rather than screens.
 *
 * Three rules need this and each had grown its own regex: `endpoint-defs-in-api-module` decides
 * where these declarations may live, `no-hardcoded-route` uses it to tell an API path from a
 * navigation route, and `no-structural-duplicate` uses it to avoid reading the endpoint idiom as
 * duplication. When the three disagreed, 220 findings in records-archive-frontend were tooling
 * rather than code: the hyphen form `foo-endpoints.ts` was recognised by none of them. One
 * definition so they cannot drift apart again.
 */
export const isEndpointModule = (f) => /\/src\/api\/|[.-]endpoints\.tsx?$|-api\.tsx?$/.test(f);

export function allFiles() {
  return allSourceFiles().filter((f) => !isCore(path.relative(ROOT, f)));
}

/**
 * Every source file in the repo, base layer included. Only the invalidation map wants this: the
 * map describes the cache behaviour of the RUNNING app, and the base layer declares real query
 * keys that app code reads and can invalidate. Composed without them, a key the base layer owns
 * looks like it vanished, and an app write against one looks dangling. No rule should use this.
 */
export function allSourceFiles() {
  const out = [];
  for (const dir of SCAN_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    walk(abs, out);
  }
  return out;
}

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (SKIP.test(full)) continue;
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(full)) out.push(full);
  }
}

/** Staged files only, for the pre-commit path. */
export function stagedFiles() {
  const raw = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' });
  return raw
    .split('\n')
    .filter((f) => /\.(ts|tsx)$/.test(f) && !SKIP.test(f))
    .filter((f) => SCAN_DIRS.some((d) => f.startsWith(d)))
    .filter((f) => !isCore(f))
    .map((f) => path.join(ROOT, f))
    .filter((f) => fs.existsSync(f));
}

const sourceCache = new Map();

/** Parsed TS/TSX AST, cached. Uses the compiler already in devDependencies. */
export function ast(file) {
  if (recording) TOUCHED.add(file);
  if (!sourceCache.has(file)) {
    sourceCache.set(
      file,
      ts.createSourceFile(
        file,
        fs.readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      ),
    );
  }
  return sourceCache.get(file);
}

export function read(file) {
  if (recording) TOUCHED.add(file);
  return fs.readFileSync(file, 'utf8');
}

export function lineOf(source, pos) {
  return source.getLineAndCharacterOfPosition(pos).line + 1;
}

/** Walk every node in a file. */
export function visit(node, fn) {
  fn(node);
  node.forEachChild((child) => visit(child, fn));
}

/** The literal text of a JSX attribute, or null when it is not a plain string. */
export function attrText(attr) {
  if (!attr?.initializer) return null;
  if (ts.isStringLiteral(attr.initializer)) return attr.initializer.text;
  if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
    const e = attr.initializer.expression;
    if (ts.isStringLiteral(e)) return e.text;
    // A template literal's STATIC parts are still classes we can judge.
    if (ts.isTemplateExpression(e)) {
      return [e.head.text, ...e.templateSpans.map((sp) => sp.literal.text)].join(' ');
    }
    if (ts.isNoSubstitutionTemplateLiteral(e)) return e.text;
  }
  return null;
}

export function jsxName(node) {
  const tag = node.tagName ?? node.openingElement?.tagName;
  return tag ? tag.getText() : '';
}

export function getAttr(node, name) {
  const el = ts.isJsxSelfClosingElement(node) ? node : node.openingElement;
  if (!el?.attributes) return undefined;
  return el.attributes.properties.find((p) => ts.isJsxAttribute(p) && p.name.getText() === name);
}

export function hasAttr(node, name) {
  return Boolean(getAttr(node, name));
}

export const rel = (f) => path.relative(ROOT, f);

export { ts };

/**
 * `// rules-allow: <rule-id> <reason>` on the offending line or the line above.
 * An escape hatch is what stops a gate being deleted the first time it is wrong.
 * The reason is mandatory: a bare suppression is not accepted.
 */
export function suppressed(file, line, ruleId) {
  // From the starter side: a rule may report against a file that does not exist yet (the
  // invalidation map before it is first generated). That is a finding, not a crash, and there is
  // nowhere to write a suppression comment in a file that is not there.
  if (!fs.existsSync(file)) return false;
  const lines = read(file).split('\n');
  // Look back a few lines: a site may carry more than one suppression, stacked.
  for (const candidate of [lines[line - 1], lines[line - 2], lines[line - 3], lines[line - 4]]) {
    if (!candidate) continue;
    const m = candidate.match(/rules-allow:\s*([\w-]+)\s+(.+)$/);
    if (m && m[1] === ruleId && m[2].trim().length > 8) return true;
  }
  return false;
}
