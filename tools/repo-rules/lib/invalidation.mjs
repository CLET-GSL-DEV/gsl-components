// Compose the app's real invalidation map from source.
//
// A query key is a contract between a read and the writes that make it stale, and nothing in
// TypeScript checks that contract: an endpoint can invalidate a key nothing reads, or read a key
// nothing ever invalidates, and both compile. This module reads every declaration site and
// composes what the codebase ACTUALLY does, so it can be compared against the map committed at
// the repo root. The committed file is a lockfile for cache behaviour: it turns a change in
// invalidation into a reviewable diff instead of an invisible one.
//
// Four kinds of site are found:
//   1. `queryKey` on an EndpointDef                    -> that endpoint READS the key
//   2. `invalidates` on an EndpointDef                 -> that endpoint INVALIDATES those keys
//   3. `useQuery({ queryKey })` written by hand        -> READS
//   4. `invalidateQueries({ queryKey })` by hand       -> INVALIDATES
//
// Keys are usually written as `queryKeys.activations` rather than inline, so a symbol table is
// built first and references are resolved through it. A key that cannot be resolved to literal
// strings is reported rather than skipped: an unresolvable key is a key the map cannot vouch for.
import fs from 'node:fs';
import path from 'node:path';

import { ROOT, ast, lineOf, rel, ts, visit } from './core.mjs';

const FACTORY = /^(GET|POST|PATCH|PUT|DELETE)$/;

/**
 * A test file, whose endpoints are fixtures and not the app's cache behaviour.
 *
 * The map is a lockfile for what the RUNNING app does. A test that exercises the endpoint factory
 * has to declare an endpoint to exercise it, and those declarations were being composed in
 * alongside the real ones: `api-service.test.ts` alone put `thing`, `thing/file`, `other` and a
 * second `export/download` into a committed file describing production cache keys, and its
 * throwaway `invalidates: [['other']]` then tripped `no-dangling-invalidation` for a read that
 * was never meant to exist. Writing a test for the endpoint system should not change the map.
 *
 * Same shape as `no-raw-http`'s skip, including the `foo.test-utils.ts` form: the segment must
 * still be `.test.` or `.spec.` so a product file that merely reads as a test stays in scope.
 */
const isTestFile = (file) => /\.(test|spec)([.-][\w.-]*)?\.[cm]?[jt]sx?$/.test(file);

/** The committed map lives at the repo root, beside the lockfiles it is a sibling of in spirit. */
export const MAP_PATH = path.join(ROOT, 'invalidation-map.json');

/**
 * An array literal reduced to its key segments, or null when a segment cannot be read.
 *
 * Handles the three forms a key is written in:
 *   ['emergency', 'activations']          plain literals
 *   [...meAppsKeys.all, 'detail']         a spread of another key, common in key factories
 *   (id) => ['activation', id]            a parameter, recorded as `:id`
 *
 * A parameter becomes a placeholder rather than being rejected, because `['activation', id]` and
 * `['activation', otherId]` are the same key as far as invalidation is concerned: invalidating
 * the prefix hits both. Recording the placeholder is what lets the map say so.
 */
function literalKey(node, symbols = null, params = new Set()) {
  if (!node || !ts.isArrayLiteralExpression(node)) return null;
  const parts = [];
  for (const raw of node.elements) {
    const element = unwrap(raw);
    if (ts.isStringLiteralLike(element)) {
      parts.push(element.text);
      continue;
    }
    if (ts.isSpreadElement(element)) {
      const spread = namedKey(unwrap(element.expression), symbols);
      if (!spread) return null;
      parts.push(...spread);
      continue;
    }
    if (ts.isIdentifier(element) && params.has(element.text)) {
      parts.push(`:${element.text}`);
      continue;
    }
    return null;
  }
  return parts;
}

/**
 * One expression looked up in the symbol table, by name or by the name it CALLS.
 *
 * A key factory is registered under its bare label, `archiveKeys.disposition`, because that is
 * what the declaration is called. Every use of it is a call, `archiveKeys.disposition()`, and the
 * arguments only fill placeholders the factory already declared. Matching the callee is therefore
 * the same lookup, not a looser one.
 *
 * `resolveKey` always did this; `literalKey`'s spread branch did not, and matched the whole call
 * text against a table of bare labels. So `[...archiveKeys.disposition(), 'detail']` - the idiom
 * ten endpoints in this repo are written in - resolved to nothing, and ten real cache keys were
 * reported unresolvable and left out of the map. One helper, used by both, so they cannot answer
 * the same question differently again.
 */
function namedKey(expr, symbols) {
  if (!expr || !symbols) return null;
  const direct = symbols.keys.get(expr.getText());
  if (direct) return direct;
  if (ts.isCallExpression(expr)) return symbols.keys.get(expr.expression.getText()) ?? null;
  return null;
}

/** The parameter names of an arrow function, so its body can name them as placeholders. */
function paramNames(arrow) {
  const names = new Set();
  for (const parameter of arrow.parameters) {
    if (ts.isIdentifier(parameter.name)) names.add(parameter.name.text);
  }
  return names;
}

/** Strip `as const` / `satisfies X` so the expression underneath can be read. */
function unwrap(node) {
  let current = node;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isSatisfiesExpression?.(current) ||
      ts.isParenthesizedExpression(current) ||
      ts.isTypeAssertionExpression?.(current))
  ) {
    current = current.expression;
  }
  return current;
}

/**
 * Every name in the workspace that stands for a key or a list of keys.
 *
 * Four passes, because each form is normally written in terms of the one before it: a factory
 * spreads a plain key, a named key spreads a factory's result, and a key LIST is written out of
 * key names (`const WRITES = [queryKeys.a, queryKeys.b]`). Resolving them in declaration order
 * would make the answer depend on which file the walker happened to read first.
 */
function buildSymbols(files) {
  /** `queryKeys.activations` -> ['emergency','activations'] */
  const keys = new Map();
  /** `ACTIVATION_WRITE_INVALIDATES` -> [['emergency','activations'], ...] */
  const lists = new Map();
  const pending = [];
  /** `const LEGAL_HOLDS_KEY = [...recordsKeys.all, 'legal-hold', 'holds']` - needs the table. */
  const pendingKeys = [];
  const factories = [];

  for (const file of files) {
    const src = ast(file);
    visit(src, (node) => {
      if (!ts.isVariableDeclaration(node) || !node.initializer || !ts.isIdentifier(node.name))
        return;
      const name = node.name.text;
      const init = unwrap(node.initializer);

      // `const queryKeys = { activations: ['emergency','activations'], list: () => [...] }`
      if (ts.isObjectLiteralExpression(init)) {
        for (const prop of init.properties) {
          if (!ts.isPropertyAssignment(prop)) continue;
          const value = unwrap(prop.initializer);
          const label = `${name}.${prop.name.getText()}`;
          if (ts.isArrowFunction(value)) {
            // A key factory. Deferred: its body usually spreads a sibling key.
            factories.push({ label, arrow: value });
            continue;
          }
          const literal = literalKey(value);
          if (literal) keys.set(label, literal);
        }
        return;
      }

      if (!ts.isArrayLiteralExpression(init)) return;

      // `const TODOS_KEY = ['todos']`
      const direct = literalKey(init);
      if (direct) {
        keys.set(name, direct);
        return;
      }
      // Two forms are still open here and they are told apart by what resolves, not by shape:
      //   `const LEGAL_HOLDS_KEY = [...recordsKeys.all, 'legal-hold', 'holds']`   one KEY
      //   `const WRITES = [queryKeys.a, queryKeys.b]`                             a LIST of keys
      // Both are deferred, key first, because a key needs only the symbol table and a list needs
      // every key in it.
      pendingKeys.push({ name, init });
      pending.push({ name, elements: init.elements.map((e) => unwrap(e)) });
    });
  }

  // Key factories, after the plain keys they spread. Two rounds, so a factory built from another
  // factory resolves too, which is the whole point of the `all` / `list()` / `detail(id)` shape.
  for (let round = 0; round < 2; round += 1) {
    for (const { label, arrow } of factories) {
      if (keys.has(label)) continue;
      const body = unwrap(arrow.body);
      const value = literalKey(body, { keys }, paramNames(arrow));
      if (value) keys.set(label, value);
    }
  }

  // Named keys that spread something, after the factories they may spread.
  //
  // These were read in the first pass with no symbol table at all, so `[...recordsKeys.all, ...]`
  // could never resolve and the name was never registered as anything. Three constants in this
  // repo are written that way, and every endpoint that used one - twenty sites across legal holds
  // and taxonomy - was reported as carrying an unresolvable key. Naming a key is the practice the
  // map is meant to reward; it should not be the reason a key falls out of it.
  for (let round = 0; round < 2; round += 1) {
    for (const { name, init } of pendingKeys) {
      if (keys.has(name)) continue;
      const value = literalKey(init, { keys });
      if (value) keys.set(name, value);
    }
  }

  for (const { name, elements } of pending) {
    if (keys.has(name)) continue;
    const resolved = [];
    let complete = true;
    for (const element of elements) {
      const inline = literalKey(element);
      if (inline) {
        resolved.push(inline);
        continue;
      }
      const named = keys.get(element.getText());
      if (named) resolved.push(named);
      else complete = false;
    }
    if (complete) lists.set(name, resolved);
  }

  return { keys, lists };
}

/**
 * Resolve one expression to a single key: a literal, a named key, or a key factory call.
 *
 * `meAppsKeys.list()` / `activationKeys.detail(id)` resolve through `namedKey`, which matches the
 * callee: the arguments only fill placeholders the factory already declared.
 */
function resolveKey(node, symbols) {
  const expr = unwrap(node);
  const inline = literalKey(expr, symbols);
  if (inline) return inline;
  return namedKey(expr, symbols);
}

/** Resolve one expression to a LIST of keys (what `invalidates` holds). */
function resolveKeyList(node, symbols) {
  const expr = unwrap(node);
  const named = symbols.lists.get(expr.getText());
  if (named) return { keys: named, unresolved: [] };
  if (!ts.isArrayLiteralExpression(expr)) {
    return { keys: [], unresolved: [expr.getText()] };
  }
  const keys = [];
  const unresolved = [];
  for (const element of expr.elements) {
    const key = resolveKey(element, symbols);
    if (key) keys.push(key);
    else unresolved.push(unwrap(element).getText());
  }
  return { keys, unresolved };
}

/** A readable name for the declaration a site sits in, e.g. `activationEndpoints.list`. */
function labelFor(node) {
  const parts = [];
  let current = node.parent;
  while (current) {
    if (ts.isPropertyAssignment(current) && current.name) parts.unshift(current.name.getText());
    if (ts.isVariableDeclaration(current) && ts.isIdentifier(current.name)) {
      parts.unshift(current.name.text);
      break;
    }
    current = current.parent;
  }
  return parts.join('.') || '<anonymous>';
}

const idOf = (key) => key.join('/');

/**
 * The map the codebase actually implements.
 *
 * Returns `{ keys, problems }`. A problem is a site whose key could not be resolved to literal
 * strings, which is a defect in its own right: a key assembled at runtime cannot be reasoned
 * about by anything, including the person writing the mutation that should invalidate it.
 */
export function composeInvalidationMap(allFilesGiven) {
  // Filtered once, at the top, so the symbol table and the sites are read from the same list. A
  // key factory defined in a test would otherwise resolve keys the map then claims nobody reads.
  const files = allFilesGiven.filter((file) => !isTestFile(file));
  const symbols = buildSymbols(files);
  const keys = new Map();
  const problems = [];

  const record = (key, relation, file, label, line) => {
    const id = idOf(key);
    if (!keys.has(id)) keys.set(id, { key, readBy: new Set(), invalidatedBy: new Set() });
    keys.get(id)[relation].add(`${rel(file)}#${label}`);
    void line;
  };

  for (const file of files) {
    const src = ast(file);

    visit(src, (node) => {
      if (!ts.isCallExpression(node)) return;
      const callee = node.expression.getText();
      const line = lineOf(src, node.getStart());

      // 1 + 2: an endpoint declaration carries both relations.
      if (FACTORY.test(callee)) {
        const config = node.arguments[0];
        if (!config || !ts.isObjectLiteralExpression(config)) return;
        const label = labelFor(node);

        for (const prop of config.properties) {
          if (!ts.isPropertyAssignment(prop)) continue;
          const name = prop.name.getText();

          if (name === 'queryKey') {
            const key = resolveKey(prop.initializer, symbols);
            if (key) record(key, 'readBy', file, label, line);
            else
              problems.push({
                file: rel(file),
                line: lineOf(src, prop.getStart()),
                message: `queryKey on ${label} is not a resolvable literal (${prop.initializer.getText()})`,
              });
          }

          if (name === 'invalidates') {
            const { keys: list, unresolved } = resolveKeyList(prop.initializer, symbols);
            for (const key of list) record(key, 'invalidatedBy', file, label, line);
            for (const text of unresolved)
              problems.push({
                file: rel(file),
                line: lineOf(src, prop.getStart()),
                message: `invalidates entry on ${label} is not a resolvable key (${text})`,
              });
          }
        }
        return;
      }

      // 3 + 4: hand-written TanStack calls, for the services people build themselves.
      const isRead = /(^|\.)useQuery$|(^|\.)useInfiniteQuery$|(^|\.)prefetchQuery$/.test(callee);
      const isWrite = /(^|\.)invalidateQueries$|(^|\.)refetchQueries$|(^|\.)removeQueries$/.test(
        callee,
      );
      if (!isRead && !isWrite) return;

      const options = node.arguments[0];
      if (!options || !ts.isObjectLiteralExpression(options)) return;
      const prop = options.properties.find(
        (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'queryKey',
      );
      if (!prop) return;

      const label = labelFor(node);
      const key = resolveKey(prop.initializer, symbols);
      if (key) {
        record(key, isRead ? 'readBy' : 'invalidatedBy', file, label, line);
        return;
      }
      // The endpoint hooks compose their own key from the endpoint's; that is the system
      // working, not a hand-rolled key, so it is not a problem to report.
      if (/src\/core\/api-client\//.test(file)) return;
      problems.push({
        file: rel(file),
        line: lineOf(src, prop.getStart()),
        message: `queryKey passed to ${callee} is not a resolvable literal (${prop.initializer.getText()})`,
      });
    });
  }

  const out = {};
  for (const id of [...keys.keys()].sort()) {
    const entry = keys.get(id);
    out[id] = {
      key: entry.key,
      readBy: [...entry.readBy].sort(),
      invalidatedBy: [...entry.invalidatedBy].sort(),
    };
  }
  return { keys: out, problems };
}

export function readDeclaredMap() {
  if (!fs.existsSync(MAP_PATH)) return null;
  return JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
}

export function writeDeclaredMap(keys) {
  const body = {
    $comment:
      'Generated by `pnpm invalidation:write`, committed on purpose. It is a lockfile for cache behaviour: every query key, what reads it, and every write that invalidates it. Regenerate when you add or move a key, and read the diff, an unexpected line here is a screen that will show stale data or refetch for no reason.',
    keys,
  };
  fs.writeFileSync(MAP_PATH, JSON.stringify(body, null, 2) + '\n');
}

/** Differences between what the code does and what the committed map claims. */
export function diffInvalidationMap(actual, declared) {
  const findings = [];
  if (!declared) {
    findings.push({
      file: rel(MAP_PATH),
      line: 1,
      message: 'no invalidation-map.json at the repo root, run `pnpm invalidation:write`',
    });
    return findings;
  }

  const declaredKeys = declared.keys ?? {};
  const setsEqual = (a = [], b = []) => a.length === b.length && a.every((x, i) => x === b[i]);

  for (const id of Object.keys(actual)) {
    if (!declaredKeys[id]) {
      findings.push({
        file: rel(MAP_PATH),
        line: 1,
        message: `key "${id}" is used in code but missing from the map, run \`pnpm invalidation:write\` and review the diff`,
      });
      continue;
    }
    const mine = actual[id];
    const theirs = declaredKeys[id];
    if (!setsEqual(mine.readBy, theirs.readBy)) {
      findings.push({
        file: rel(MAP_PATH),
        line: 1,
        message: `key "${id}" is read by ${mine.readBy.length} site(s) in code, the map says ${(theirs.readBy ?? []).length}`,
      });
    }
    if (!setsEqual(mine.invalidatedBy, theirs.invalidatedBy)) {
      const added = mine.invalidatedBy.filter((s) => !(theirs.invalidatedBy ?? []).includes(s));
      const removed = (theirs.invalidatedBy ?? []).filter((s) => !mine.invalidatedBy.includes(s));
      findings.push({
        file: rel(MAP_PATH),
        line: 1,
        message: `key "${id}" invalidation changed: ${added.length ? `+${added.join(', +')}` : ''}${added.length && removed.length ? ' ' : ''}${removed.length ? `-${removed.join(', -')}` : ''}`,
      });
    }
  }

  for (const id of Object.keys(declaredKeys)) {
    if (!actual[id]) {
      findings.push({
        file: rel(MAP_PATH),
        line: 1,
        message: `key "${id}" is in the map but nothing in code uses it, run \`pnpm invalidation:write\``,
      });
    }
  }

  return findings;
}

/** A read that no write ever invalidates. Reported as a warning: it is right for genuinely static data and wrong for everything else, and only the author knows which. */
export function orphanReads(actual) {
  return Object.entries(actual)
    .filter(([, entry]) => entry.readBy.length > 0 && entry.invalidatedBy.length === 0)
    .map(([id]) => id);
}

/** A write that invalidates a key nothing reads. Always a defect: the refetch it triggers has no subscriber, so either the key is misspelt or the read was deleted. */
export function danglingInvalidations(actual) {
  return Object.entries(actual)
    .filter(([, entry]) => entry.invalidatedBy.length > 0 && entry.readBy.length === 0)
    .map(([id]) => id);
}
