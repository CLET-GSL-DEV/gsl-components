// One defect, four shapes: a value with a new identity every render sitting on a memoisation boundary.
// react.dev names exactly three cases where memoising pays, and this rule only polices those three.
import fs from 'node:fs';
import path from 'node:path';

import { resolveLocalImport } from '../lib/components.mjs';
import { ROOT, ast, lineOf, rel, ts, visit } from '../lib/core.mjs';

const isSrc = (f) => /\/src\//.test(f) && !/\.(test|spec)\.tsx?$/.test(f);

/** A module specifier resolved to a real file, index barrels included. */
function resolveSpecifier(fromFile, spec) {
  let base;
  if (spec.startsWith('@/')) base = path.join(ROOT, 'src', spec.slice(2));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec);
  else return null;
  for (const candidate of [
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
  ]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/** Does this file declare `name` as a function of its own? */
function declaresFunction(file, name) {
  let found = false;
  visit(ast(file), (node) => {
    if (found) return;
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) found = true;
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name &&
      node.initializer &&
      (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
    ) {
      found = true;
    }
  });
  return found;
}

/** The file a hook is really declared in, following an index barrel's re-export to the module behind it. */
function resolveThroughBarrel(fromFile, name, depth = 0) {
  if (depth > 4) return null;
  const src = ast(fromFile);
  for (const statement of src.statements) {
    const isImport = ts.isImportDeclaration(statement) && statement.importClause;
    const isReExport = ts.isExportDeclaration(statement) && statement.exportClause;
    if (!isImport && !isReExport) continue;

    const names = [];
    if (isImport) {
      if (statement.importClause.name) names.push(statement.importClause.name.text);
      const named = statement.importClause.namedBindings;
      if (named && ts.isNamedImports(named))
        for (const e of named.elements) names.push(e.name.text);
    } else if (ts.isNamedExports(statement.exportClause)) {
      for (const e of statement.exportClause.elements) names.push(e.name.text);
    }
    if (!names.includes(name) || !statement.moduleSpecifier) continue;

    const target = resolveSpecifier(fromFile, statement.moduleSpecifier.getText().slice(1, -1));
    if (!target) continue;
    if (declaresFunction(target, name)) return target;
    const deeper = resolveThroughBarrel(target, name, depth + 1);
    if (deeper) return deeper;
  }
  return null;
}

/** Where a locally-imported hook is declared, or null when it comes from a package. */
function resolveHookFile(sourceFile, name) {
  const direct = resolveLocalImport(sourceFile, name);
  if (direct && declaresFunction(direct, name)) return direct;
  return resolveThroughBarrel(sourceFile.fileName, name);
}

/** React's own hooks, where a freshly-written function or literal argument is the entire point. */
const REACT_HOOKS = new Set([
  'useMemo',
  'useCallback',
  'useEffect',
  'useLayoutEffect',
  'useInsertionEffect',
  'useState',
  'useRef',
  'useReducer',
  'useImperativeHandle',
  'useSyncExternalStore',
  'useDeferredValue',
  'useTransition',
  'useContext',
  'useDebugValue',
  'useId',
  'useOptimistic',
  'useActionState',
]);

/** Hooks that take a dependency array as their last argument. */
const DEP_HOOKS =
  /^(useMemo|useCallback|useEffect|useLayoutEffect|useInsertionEffect|useImperativeHandle)$/;

/** The table surfaces a column set or a row-action set is actually handed to. */
const TABLE_SURFACES = new Set(['Table', 'TableContent', 'DataTable']);

/**
 * Hooks from `@rfdtech/components` whose OPTION properties land in one of that hook's own
 * dependency arrays. This rule follows imports into the repo but not into node_modules, so the
 * kit's hooks are named here instead. `useTableState` memoises `filters` on
 * `[searchParams, prefix, defaults]`: an inline `defaultFilters` object is a new value every
 * render, so `filters` is too, and every `useMemo` downstream that lists `filters` recomputes on
 * every render. The fix is a module-scope constant, not a `useMemo`.
 */
const KIT_HOOK_MEMOISED_OPTIONS = new Map([
  ['useTableState', new Set(['defaultFilters', 'defaultSort', 'pageSizeOptions'])],
  ['useTableFilter', new Set(['defaults'])],
]);

/** A value with no stable identity: written out fresh, so `===` against last render always fails. */
function isFreshValue(node) {
  if (!node) return false;
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) return true;
  if (ts.isObjectLiteralExpression(node)) return node.properties.length > 0;
  if (ts.isArrayLiteralExpression(node)) return node.elements.length > 0;
  if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node))
    return isFreshValue(node.expression);
  return false;
}

function describe(node) {
  if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node))
    return describe(node.expression);
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) return 'function';
  if (ts.isArrayLiteralExpression(node)) return 'array';
  return 'object';
}

/** Is this node already inside a useMemo or useCallback, where the identity is held for us? */
function insideMemoCall(node) {
  let current = node.parent;
  while (current) {
    if (
      ts.isCallExpression(current) &&
      /^(useMemo|useCallback)$/.test(current.expression.getText())
    ) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

/** The nearest enclosing function, so "declared in a component body" can be told from module scope. */
function enclosingFunction(node) {
  let current = node.parent;
  while (current) {
    if (
      ts.isFunctionDeclaration(current) ||
      ts.isArrowFunction(current) ||
      ts.isFunctionExpression(current) ||
      ts.isMethodDeclaration(current)
    ) {
      return current;
    }
    current = current.parent;
  }
  return null;
}

/** Every name a dependency array in this subtree lists, flattened to the root identifier. */
function dependencyNames(scope) {
  const names = new Set();
  visit(scope, (node) => {
    if (!ts.isCallExpression(node)) return;
    if (!DEP_HOOKS.test(node.expression.getText())) return;
    const last = node.arguments[node.arguments.length - 1];
    if (!last || !ts.isArrayLiteralExpression(last)) return;
    for (const element of last.elements) {
      let root = element;
      while (ts.isPropertyAccessExpression(root) || ts.isElementAccessExpression(root))
        root = root.expression;
      if (ts.isIdentifier(root)) names.add(root.text);
    }
  });
  return names;
}

/** The parameter names a locally-declared hook puts into one of its own dependency arrays. */
const hookParamCache = new Map();

function memoisedParams(hookFile, hookName) {
  const key = `${hookFile}::${hookName}`;
  if (hookParamCache.has(key)) return hookParamCache.get(key);

  const result = new Map();
  const src = ast(hookFile);
  visit(src, (node) => {
    let fn = null;
    let name = null;
    if (ts.isFunctionDeclaration(node) && node.name) {
      fn = node;
      name = node.name.text;
    } else if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
    ) {
      fn = node.initializer;
      name = node.name.text;
    }
    if (!fn || name !== hookName || !fn.body) return;

    const deps = dependencyNames(fn.body);
    fn.parameters.forEach((param, index) => {
      if (ts.isIdentifier(param.name) && deps.has(param.name.text)) {
        result.set(index, param.name.text);
      }
    });
  });

  hookParamCache.set(key, result);
  return result;
}

/** Does this file locally resolve `name` to a component wrapped in `memo(...)`? */
const memoCache = new Map();

function isMemoisedComponent(sourceFile, name) {
  const target = resolveLocalImport(sourceFile, name);
  const file = target ?? sourceFile.fileName;
  const key = `${file}::${name}`;
  if (memoCache.has(key)) return memoCache.get(key);

  let found = false;
  const src = file === sourceFile.fileName ? sourceFile : ast(file);
  visit(src, (node) => {
    if (found) return;
    if (!ts.isVariableDeclaration(node) || !ts.isIdentifier(node.name) || node.name.text !== name)
      return;
    const init = node.initializer;
    if (init && ts.isCallExpression(init) && /(^|\.)memo$/.test(init.expression.getText()))
      found = true;
  });

  memoCache.set(key, found);
  return found;
}

export const unstableIdentityDefeatsMemo = {
  id: 'unstable-identity-defeats-memo',
  doc: 'A value handed to a memoisation boundary keeps its identity between renders.',
  why: "react.dev names three cases where memoising pays, and only three: an expensive calculation, a prop to a `memo` component, and a value another Hook depends on. This rule polices those three and nothing else. It never asks for `useMemo` on an ordinary value, because react.dev is explicit that there is no benefit there. What it catches is the opposite defect: a `useMemo` or a `memo` that was already written and is silently doing nothing, because one argument to it is rebuilt on every render. In react.dev's words, a single value that is always new is enough to break memoization for an entire component. It covers hooks this repo declares, and the hooks from `@rfdtech/components` that memoise one of their options, because a rule that stops at the node_modules boundary misses the site every register page shares.",
  check(files) {
    const out = [];
    const seen = new Set();
    const report = (finding) => {
      const key = `${finding.file}:${finding.line}:${finding.message}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(finding);
    };

    for (const f of files.filter((x) => x.endsWith('.tsx') && isSrc(x))) {
      const src = ast(f);

      visit(src, (node) => {
        // A fresh literal handed to a custom hook that lists that parameter in its own dep array.
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
          const hookName = node.expression.text;
          if (/^use[A-Z]/.test(hookName) && !REACT_HOOKS.has(hookName)) {
            const target = resolveHookFile(src, hookName);
            // A kit hook takes one options object, so the unstable value is a PROPERTY of that
            // object rather than an argument. Only checked when the name does not resolve to a
            // hook this repo declares, so a local hook of the same name still wins.
            const kitOptions = target ? null : KIT_HOOK_MEMOISED_OPTIONS.get(hookName);
            if (kitOptions) {
              const options = node.arguments[0];
              if (options && ts.isObjectLiteralExpression(options)) {
                for (const prop of options.properties) {
                  if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) continue;
                  if (!kitOptions.has(prop.name.text) || !isFreshValue(prop.initializer)) continue;
                  report({
                    file: rel(f),
                    line: lineOf(src, prop.getStart(src)),
                    message: `\`${prop.name.text}\` is ${describe(prop.initializer) === 'object' ? 'an object' : `a ${describe(prop.initializer)}`} written inline and \`${hookName}\` lists it in a dependency array, so what it returns is new on every render and every useMemo that depends on it recomputes. Hoist it to module scope`,
                  });
                }
              }
            }
            if (target) {
              const params = memoisedParams(target, hookName);
              node.arguments.forEach((arg, index) => {
                if (!params.has(index) || !isFreshValue(arg)) return;
                report({
                  file: rel(f),
                  line: lineOf(src, arg.getStart()),
                  message: `this ${describe(arg)} is new on every render and \`${hookName}\` lists \`${params.get(index)}\` in a dependency array, so its useMemo recomputes every time. Wrap it in useCallback or useMemo, or hoist it`,
                });
              });
            }
          }
        }

        // A value declared in a component body without a stable identity, then depended on by a Hook.
        if (ts.isVariableStatement(node) || ts.isFunctionDeclaration(node)) {
          const fn = enclosingFunction(node);
          if (fn && fn.body) {
            const deps = dependencyNames(fn.body);
            const candidates = [];
            if (ts.isFunctionDeclaration(node) && node.name) {
              candidates.push({ name: node.name.text, kind: 'function', at: node });
            } else if (ts.isVariableStatement(node)) {
              for (const decl of node.declarationList.declarations) {
                if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
                if (!isFreshValue(decl.initializer)) continue;
                candidates.push({
                  name: decl.name.text,
                  kind: describe(decl.initializer),
                  at: decl,
                });
              }
            }
            for (const c of candidates) {
              if (!deps.has(c.name)) continue;
              report({
                file: rel(f),
                line: lineOf(src, c.at.getStart()),
                message: `\`${c.name}\` is ${c.kind === 'function' ? 'a' : 'an'} ${c.kind} rebuilt every render and is listed in a dependency array in this component, so that array never matches and the Hook re-runs every time`,
              });
            }
          }
        }

        // A column set or row-action set built inline in a render and handed to a table.
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
          const name = node.name.text;
          const isTableData =
            /^(columns|rowActions)$/.test(name) || /(Columns|RowActions)$/.test(name);
          const inComponent = Boolean(enclosingFunction(node));
          if (
            isTableData &&
            inComponent &&
            ts.isArrayLiteralExpression(node.initializer) &&
            !insideMemoCall(node)
          ) {
            let rendersTable = false;
            visit(src, (n) => {
              if (rendersTable) return;
              const tag = ts.isJsxSelfClosingElement(n)
                ? n.tagName.getText()
                : ts.isJsxElement(n)
                  ? n.openingElement.tagName.getText()
                  : null;
              if (tag && TABLE_SURFACES.has(tag)) rendersTable = true;
            });
            if (rendersTable) {
              report({
                file: rel(f),
                line: lineOf(src, node.getStart()),
                message: `\`${name}\` is a ${node.initializer.elements.length}-entry array rebuilt on every render and handed to a table. Hoist it to module scope, or wrap it in useMemo when it reads props`,
              });
            }
          }
        }

        // A fresh literal passed as a prop to a component that is wrapped in memo.
        if (ts.isJsxAttribute(node) && node.initializer && ts.isJsxExpression(node.initializer)) {
          const value = node.initializer.expression;
          if (value && isFreshValue(value)) {
            let el = node.parent;
            while (el && !ts.isJsxOpeningElement(el) && !ts.isJsxSelfClosingElement(el))
              el = el.parent;
            const tag = el?.tagName?.getText();
            if (tag && /^[A-Z]/.test(tag) && isMemoisedComponent(src, tag)) {
              report({
                file: rel(f),
                line: lineOf(src, node.getStart()),
                message: `\`${node.name.getText()}\` is a ${describe(value)} written inline, and \`${tag}\` is wrapped in memo. A prop that is always new makes that memo do nothing`,
              });
            }
          }
        }
      });
    }
    return out;
  },
};

export default [unstableIdentityDefeatsMemo];
