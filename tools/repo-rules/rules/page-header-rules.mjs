// The page title block is the top of the visual hierarchy. Its controls are sized to match.
import fs from 'node:fs';
import path from 'node:path';

import { ROOT, ast, attrText, getAttr, jsxName, lineOf, rel, ts, visit } from '../lib/core.mjs';

/** Controls that carry a `size` and can sit in a page header's action slot. */
const SIZED_CONTROLS = new Set(['Button', 'ExportButton', 'Dropdown', 'Combobox', 'DateSelector']);

/**
 * Anything rendered inside one of these is in an overlay, not in the page header.
 *
 * A menu row or a dialog footer button is `sm` on purpose: it sits in a popover at its own scale.
 * Only the control that opens the overlay is a page-title action.
 */
const OVERLAY_CONTENT = new Set([
  'PopoverContent',
  'PopupContent',
  'ModalContent',
  'DialogContent',
  'DropdownMenuContent',
  'TooltipContent',
  'SheetContent',
]);

/** Walk `node`, skipping any subtree that sits inside an overlay. */
function visitOutsideOverlays(node, fn) {
  const walk = (current) => {
    if (
      (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current)) &&
      OVERLAY_CONTENT.has(jsxName(current))
    ) {
      return;
    }
    fn(current);
    current.forEachChild(walk);
  };
  walk(node);
}

/**
 * The file a locally-imported component lives in, or null for anything from a package.
 *
 * Wrapping a button in a component is the ordinary way to write this codebase, so a rule that only
 * reads the `actions` slot literally checks the easy sites and misses every real one.
 */
function resolveLocalImport(sourceFile, componentName) {
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause) continue;
    const named = statement.importClause.namedBindings;
    const names = [];
    if (statement.importClause.name) names.push(statement.importClause.name.text);
    if (named && ts.isNamedImports(named)) {
      for (const element of named.elements) names.push(element.name.text);
    }
    if (!names.includes(componentName)) continue;

    const spec = statement.moduleSpecifier.getText().slice(1, -1);
    let base;
    if (spec.startsWith('@/')) base = path.join(ROOT, 'src', spec.slice(2));
    else if (spec.startsWith('.')) base = path.resolve(path.dirname(sourceFile.fileName), spec);
    else return null;

    for (const candidate of [`${base}.tsx`, `${base}.ts`, path.join(base, 'index.tsx')]) {
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

/**
 * A page-title action is never `size="sm"`, and never leaves its size to the default.
 *
 * `sm` is the table-toolbar size. Beside a page heading it reads as a secondary control on a
 * screen where it is the primary one, and the two sizes sitting at the same altitude in different
 * modules is what makes the app look assembled rather than designed. State `md` or `lg` outright.
 */
export const pageHeaderActionSize = {
  id: 'page-header-action-size',
  doc: 'A control in PageHeader `actions` declares size="md" or size="lg". Never sm, never default.',
  why: 'sm is the table-toolbar size; beside a page heading it reads as a secondary control.',
  check(files) {
    const out = [];
    // One report per wrapper, however many pages put it in their header.
    const seenWrappers = new Set();
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) return;
        if (jsxName(node) !== 'PageHeader') return;
        const actions = getAttr(node, 'actions');
        if (!actions?.initializer || !ts.isJsxExpression(actions.initializer)) return;
        const slot = actions.initializer.expression;
        if (!slot) return;

        visit(slot, (child) => {
          if (!ts.isJsxElement(child) && !ts.isJsxSelfClosingElement(child)) return;
          const name = jsxName(child);

          if (!SIZED_CONTROLS.has(name)) {
            // A local wrapper. Follow it once and check the controls it actually renders, since
            // the size that reaches the screen is the one written in there, not out here.
            if (!/^[A-Z]/.test(name) || seenWrappers.has(name)) return;
            seenWrappers.add(name);
            const wrapperFile = resolveLocalImport(src, name);
            if (!wrapperFile) return;
            const wrapperSrc = ast(wrapperFile);
            visitOutsideOverlays(wrapperSrc, (inner) => {
              if (!ts.isJsxElement(inner) && !ts.isJsxSelfClosingElement(inner)) return;
              const innerName = jsxName(inner);
              if (!SIZED_CONTROLS.has(innerName)) return;
              const innerSize = attrText(getAttr(inner, 'size'));
              if (innerSize === 'md' || innerSize === 'lg') return;
              out.push({
                file: rel(wrapperFile),
                line: lineOf(wrapperSrc, inner.getStart()),
                message:
                  innerSize === null
                    ? `<${innerName}> reaches PageHeader actions via <${name}> with no explicit size, state md or lg`
                    : `<${innerName} size="${innerSize}"> reaches PageHeader actions via <${name}>, use md or lg`,
              });
            });
            return;
          }

          const size = attrText(getAttr(child, 'size'));
          if (size === 'md' || size === 'lg') return;
          out.push({
            file: rel(f),
            line: lineOf(src, child.getStart()),
            message:
              size === null
                ? `<${name}> in PageHeader actions has no explicit size, state md or lg`
                : `<${name} size="${size}"> in PageHeader actions, use md or lg`,
          });
        });
      });
    }
    return out;
  },
};

export default [pageHeaderActionSize];
