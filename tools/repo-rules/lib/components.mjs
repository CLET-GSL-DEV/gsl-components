// Following a component across its file boundary.
//
// Almost every real violation in this repo is split over two files: a page composes a wrapper, and
// the wrapper renders the thing the rule cares about. A check that only reads one file at a time
// sees the easy sites and misses every real one, so the helpers here resolve a local import and
// answer what the imported component actually renders.
import fs from 'node:fs';
import path from 'node:path';

import { ROOT, ast, jsxName, ts, visit } from './core.mjs';

/** Surfaces that draw a bordered card. A second one inside the first is the double border. */
export const CARD_SURFACES = new Set(['Card', 'SectionCard', 'DetailPanel']);

/** Surfaces that put a real table on screen. `TableContent` alone is one; it just needs a wrapper. */
export const TABLE_SURFACES = new Set(['Table', 'TableContent', 'DataTable']);

/** The kit's tab strip, in any of the shapes a page reaches for. */
export const TAB_SURFACES = new Set(['Tabs', 'TabsList']);

/**
 * Overlays render in a portal, so their content is not visually inside whatever JSX ancestor it
 * happens to have. A Card in a dialog opened from inside a Card is one card on screen, not two.
 */
export const OVERLAY_SURFACES = new Set([
  'Dialog',
  'DialogContent',
  'Modal',
  'ModalContent',
  'Sheet',
  'SheetContent',
  'SheetBody',
  'Popover',
  'PopoverContent',
  'Popup',
  'PopupContent',
  'PopupBody',
  'Drawer',
  'DrawerContent',
  'DropdownMenuContent',
  'TooltipContent',
]);

export const isEl = (n) => ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n);

/**
 * The file a locally-imported component lives in, or null for anything from a package.
 *
 * Mirrors the resolution Vite does for `@/` and a relative specifier. A package import returns
 * null: the kit's own internals are not this repo's business.
 */
export function resolveLocalImport(sourceFile, componentName) {
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

/** The outermost JSX element of an expression, looking through parens and fragments. */
function outermostJsx(node) {
  let found = null;
  const walk = (n) => {
    if (found) return;
    if (isEl(n)) {
      found = n;
      return;
    }
    n.forEachChild(walk);
  };
  walk(node);
  return found;
}

const rootCache = new Map();

/**
 * Components a file exports whose rendered ROOT is a card surface, as name to the line the card
 * is written on.
 *
 * This is what makes `<SectionCard><RecordTypesTable /></SectionCard>` legible to a rule: the
 * table component's own file is where the second `<Card bordered>` was written, and that is the
 * line worth pointing at.
 */
export function exportedCardComponents(file) {
  return exportedRootComponents(file, CARD_SURFACES);
}

/**
 * Components a file exports whose rendered ROOT is one of `surfaces`, as name to the line it is
 * written on. `exportedCardComponents` is this with the card surfaces.
 */
export function exportedRootComponents(file, surfaces) {
  const cacheKey = `${file}::${[...surfaces].join(',')}`;
  if (rootCache.has(cacheKey)) return rootCache.get(cacheKey);
  const names = new Map();
  const src = ast(file);

  const consider = (name, body) => {
    if (!name || !body) return;
    // Every `return` in the component, so a component that returns a Card on one branch counts.
    visit(body, (node) => {
      if (!ts.isReturnStatement(node) || !node.expression) return;
      const root = outermostJsx(node.expression);
      if (root && surfaces.has(jsxName(root)) && !names.has(name)) {
        names.set(name, src.getLineAndCharacterOfPosition(root.getStart()).line + 1);
      }
    });
  };

  for (const statement of src.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      consider(statement.name.text, statement.body);
    }
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
        if (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer)) {
          consider(decl.name.text, decl.initializer.body);
        }
      }
    }
  }

  rootCache.set(cacheKey, names);
  return names;
}

const anywhereCache = new Map();

/**
 * Components a file exports that render one of `surfaces` ANYWHERE in their body, not only at the
 * root.
 *
 * "Is there another table on this page" cannot be answered from root elements alone: a section
 * component returns a `SectionCard` and puts the table three levels inside it, and to the page
 * that is still a table on the screen.
 */
export function exportedComponentsRendering(file, surfaces) {
  const cacheKey = `${file}::any::${[...surfaces].join(',')}`;
  if (anywhereCache.has(cacheKey)) return anywhereCache.get(cacheKey);
  const names = new Map();
  const src = ast(file);

  const consider = (name, body) => {
    if (!name || !body || names.has(name)) return;
    visit(body, (node) => {
      if (names.has(name) || !isEl(node) || !surfaces.has(jsxName(node))) return;
      names.set(name, src.getLineAndCharacterOfPosition(node.getStart()).line + 1);
    });
  };

  for (const statement of src.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      consider(statement.name.text, statement.body);
    }
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
        if (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer)) {
          consider(decl.name.text, decl.initializer.body);
        }
      }
    }
  }

  anywhereCache.set(cacheKey, names);
  return names;
}

/** The card surface `node` sits inside, or null. Stops at an overlay: a dialog is its own page. */
export function enclosingCard(node) {
  let p = node.parent;
  while (p) {
    if (isEl(p)) {
      const name = jsxName(p);
      if (OVERLAY_SURFACES.has(name)) return null;
      if (CARD_SURFACES.has(name)) return p;
    }
    p = p.parent;
  }
  return null;
}

/** Whether `node` has an ancestor that is one of `names`, stopping at an overlay boundary. */
export function hasAncestor(node, names, { stopAtOverlay = true } = {}) {
  let p = node.parent;
  while (p) {
    if (isEl(p)) {
      const name = jsxName(p);
      if (stopAtOverlay && OVERLAY_SURFACES.has(name)) return false;
      if (names.has(name)) return true;
    }
    p = p.parent;
  }
  return false;
}

/**
 * Every JSX use of `componentName` across the repo, with whether it sits inside a card surface.
 *
 * Used to judge a component that renders a bare Table: it is correct only if the surfaces that
 * mount it supply the card, and that answer lives at the call sites, not in its own file.
 */
export function callSites(files, componentName) {
  const sites = [];
  for (const f of files) {
    if (!f.endsWith('.tsx')) continue;
    const src = ast(f);
    visit(src, (node) => {
      if (!isEl(node) || jsxName(node) !== componentName) return;
      sites.push({ file: f, node, insideCard: hasAncestor(node, CARD_SURFACES) });
    });
  }
  return sites;
}

/** The name of the component whose body contains `node`, or null. */
export function enclosingComponentName(node) {
  let p = node.parent;
  while (p) {
    if (ts.isFunctionDeclaration(p) && p.name) return p.name.text;
    if (
      (ts.isArrowFunction(p) || ts.isFunctionExpression(p)) &&
      ts.isVariableDeclaration(p.parent) &&
      ts.isIdentifier(p.parent.name)
    ) {
      return p.parent.name.text;
    }
    p = p.parent;
  }
  return null;
}

/** Surfaces that put a searchable picker on screen. `ComboboxField` is the kit's form binding. */
export const COMBOBOX_SURFACES = new Set(['Combobox']);

const propCache = new Map();

/**
 * Whether the component `name` exported by `file` destructures a prop called `prop`.
 *
 * Components here are written with one destructured object parameter, so the parameter list is
 * where a prop is either offered or not. Reading it is what separates "this wrapper forwards the
 * prop, so the fix is one attribute at the call site" from "the prop does not exist and the rule
 * would be asking for something unwritable".
 */
export function declaresProp(file, name, prop) {
  const cacheKey = `${file}::${name}::${prop}`;
  if (propCache.has(cacheKey)) return propCache.get(cacheKey);
  const src = ast(file);
  let found = false;

  const consider = (fnName, fn) => {
    if (found || fnName !== name || !fn) return;
    const param = fn.parameters?.[0];
    if (!param || !ts.isObjectBindingPattern(param.name)) return;
    for (const element of param.name.elements) {
      // `loading` binds plainly, `loading = false` keeps the same name, `loading: isLoading`
      // renames it. All three still offer the prop to a caller.
      const written = element.propertyName ?? element.name;
      if (ts.isIdentifier(written) && written.text === prop) found = true;
    }
  };

  for (const statement of src.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      consider(statement.name.text, statement);
    }
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
        if (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer)) {
          consider(decl.name.text, decl.initializer);
        }
      }
    }
  }

  propCache.set(cacheKey, found);
  return found;
}
