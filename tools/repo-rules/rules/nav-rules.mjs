// A sidebar item is a ROOT of the app, and the two things that betray one that is not.
//
// The sidebar highlights by path prefix (`isNavItemActive`), so a nav destination nested under
// another nav destination lights BOTH rows at once: `/disposition/schedules` under `/disposition`
// left two items looking current, and no amount of styling fixes that while the path says the
// page lives inside the other one. The same fact from the other side: a page you reach by
// clicking the sidebar has nothing to go up to, so a breadcrumb trail on it is a lie about where
// the reader is.
//
// Both checks read the real tables: `NAV_ITEMS` in src/constants/navigation.ts for the sidebar
// destinations, `ROUTES` in src/constants/routes.ts for what those keys resolve to, and each
// module's `routes.tsx` for the page file a route lazy-loads.
import fs from 'node:fs';
import path from 'node:path';

import { isEl } from '../lib/components.mjs';
import { ROOT, ast, getAttr, jsxName, lineOf, read, rel, ts, visit } from '../lib/core.mjs';

const NAV_FILE = path.join(ROOT, 'src/constants/navigation.ts');
const ROUTES_FILE = path.join(ROOT, 'src/constants/routes.ts');

/** `{ key: '/path' }` from an `as const` object literal in a source file. */
function objectLiteralStrings(file, objectName) {
  if (!fs.existsSync(file)) return new Map();
  const src = ast(file);
  const out = new Map();
  visit(src, (node) => {
    if (!ts.isVariableDeclaration(node) || !ts.isIdentifier(node.name)) return;
    if (node.name.text !== objectName) return;
    let literal = node.initializer;
    while (literal && ts.isAsExpression(literal)) literal = literal.expression;
    if (!literal || !ts.isObjectLiteralExpression(literal)) return;
    for (const prop of literal.properties) {
      if (!ts.isPropertyAssignment(prop) || !prop.name) continue;
      if (!ts.isStringLiteral(prop.initializer)) continue;
      out.set(prop.name.getText().replace(/['"]/g, ''), prop.initializer.text);
    }
  });
  return out;
}

/**
 * The sidebar destinations, as `{ navKey, routeKey, line }`.
 *
 * A nav entry writes `to: ROUTES.<routeKey>`, so the route key is what ties a sidebar row to a
 * path and to the module route that renders it.
 */
function navDestinations() {
  if (!fs.existsSync(NAV_FILE)) return [];
  const src = ast(NAV_FILE);
  const out = [];
  visit(src, (node) => {
    if (!ts.isVariableDeclaration(node) || !ts.isIdentifier(node.name)) return;
    if (node.name.text !== 'NAV_ITEMS') return;
    let literal = node.initializer;
    while (literal && (ts.isAsExpression(literal) || ts.isSatisfiesExpression(literal))) {
      literal = literal.expression;
    }
    if (!literal || !ts.isObjectLiteralExpression(literal)) return;
    for (const prop of literal.properties) {
      if (!ts.isPropertyAssignment(prop) || !ts.isObjectLiteralExpression(prop.initializer)) {
        continue;
      }
      const to = prop.initializer.properties.find(
        (p) => ts.isPropertyAssignment(p) && p.name?.getText() === 'to',
      );
      if (!to) continue;
      const expression = to.initializer;
      const routeKey =
        ts.isPropertyAccessExpression(expression) && expression.expression.getText() === 'ROUTES'
          ? expression.name.text
          : null;
      out.push({
        navKey: prop.name.getText().replace(/['"]/g, ''),
        routeKey,
        line: lineOf(src, prop.getStart()),
      });
    }
  });
  return out;
}

/** Every `src/modules/<m>/routes.tsx`. */
function routeModules() {
  const modulesDir = path.join(ROOT, 'src/modules');
  if (!fs.existsSync(modulesDir)) return [];
  return fs
    .readdirSync(modulesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(modulesDir, entry.name, 'routes.tsx'))
    .filter((file) => fs.existsSync(file));
}

/**
 * Route key to the page file it lazy-loads, read from every module's route table.
 *
 * `{ path: ROUTE_PATHS.taxonomy, lazy: () => import('./pages/Taxonomy') }` is the shape; the
 * import specifier is resolved against the module directory.
 */
function pageFileByRouteKey() {
  const out = new Map();
  for (const file of routeModules()) {
    const src = ast(file);
    visit(src, (node) => {
      if (!ts.isObjectLiteralExpression(node)) return;
      const pathProp = node.properties.find(
        (p) => ts.isPropertyAssignment(p) && p.name?.getText() === 'path',
      );
      const lazyProp = node.properties.find(
        (p) => ts.isPropertyAssignment(p) && p.name?.getText() === 'lazy',
      );
      if (!pathProp || !lazyProp) return;
      const value = pathProp.initializer;
      if (!ts.isPropertyAccessExpression(value) || value.expression.getText() !== 'ROUTE_PATHS') {
        return;
      }
      let specifier = null;
      visit(lazyProp.initializer, (inner) => {
        if (specifier) return;
        if (ts.isCallExpression(inner) && inner.expression.kind === ts.SyntaxKind.ImportKeyword) {
          const arg = inner.arguments[0];
          if (arg && ts.isStringLiteral(arg)) specifier = arg.text;
        }
      });
      if (!specifier) return;
      const base = path.resolve(path.dirname(file), specifier);
      for (const candidate of [`${base}.tsx`, `${base}.ts`, path.join(base, 'index.tsx')]) {
        if (fs.existsSync(candidate)) {
          out.set(value.name.text, candidate);
          break;
        }
      }
    });
  }
  return out;
}

/**
 * A sidebar destination is a top-level path.
 *
 * The sidebar decides which row is current with a prefix match, so a nested destination lights up
 * its parent's row too and the app looks like it cannot tell you where you are. If a screen is
 * important enough to be in the sidebar it is a section of the app, not a page inside another
 * section: give it its own first-level path. If it really belongs inside another page, take it
 * out of the sidebar and reach it from that page.
 *
 * Deliberate exception: `// rules-allow: sidebar-route-top-level <why this nests>`.
 */
export const sidebarRouteTopLevel = {
  id: 'sidebar-route-top-level',
  doc: 'A NAV_ITEMS destination is a top-level path: one segment, never nested under another route.',
  why: 'The sidebar highlights by prefix, so a nested destination lights two rows at once.',
  check(files) {
    // Reads the nav and route tables directly rather than the file list, so it runs only when one
    // of those two tables is in scope: always on the full pass, on --staged only when one changed.
    if (!files.includes(NAV_FILE) && !files.includes(ROUTES_FILE)) return [];
    const routes = objectLiteralStrings(ROUTES_FILE, 'ROUTES');
    const out = [];
    for (const item of navDestinations()) {
      if (!item.routeKey) continue;
      const to = routes.get(item.routeKey);
      if (!to) continue;
      const segments = to.split('/').filter(Boolean);
      if (segments.length <= 1) continue;
      out.push({
        file: rel(NAV_FILE),
        line: item.line,
        message: `sidebar item "${item.navKey}" points at ${to}, which nests under /${segments[0]}: give it a top-level path`,
      });
    }
    return out;
  },
};

/**
 * A page you reach from the sidebar carries no breadcrumbs.
 *
 * Breadcrumbs say "you are inside something and here is the way back up". A sidebar destination is
 * the top of its own section: there is nothing above it, and the trail either points at a page the
 * reader never came from or repeats the sidebar row they just clicked. Breadcrumbs belong on
 * detail pages, the ones you can only arrive at from a list.
 *
 * Deliberate exception: `// rules-allow: sidebar-page-no-breadcrumbs <why this trail is real>`.
 */
export const sidebarPageNoBreadcrumbs = {
  id: 'sidebar-page-no-breadcrumbs',
  doc: 'A page reachable from NAV_ITEMS renders no PageHeader `breadcrumbs`.',
  why: 'A sidebar destination is the top of its section; there is nothing above it to go back to.',
  check(files) {
    const pages = pageFileByRouteKey();
    const out = [];
    for (const item of navDestinations()) {
      if (!item.routeKey) continue;
      const pageFile = pages.get(item.routeKey);
      if (!pageFile || !files.includes(pageFile)) continue;
      const src = ast(pageFile);
      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'PageHeader') return;
        const crumbs = getAttr(node, 'breadcrumbs');
        if (!crumbs) return;
        out.push({
          file: rel(pageFile),
          line: lineOf(src, crumbs.getStart()),
          message: `"${item.navKey}" is a sidebar destination, so its PageHeader carries no breadcrumbs`,
          snippet: read(pageFile).split('\n')[lineOf(src, crumbs.getStart()) - 1]?.trim(),
        });
      });
    }
    return out;
  },
};

export default [sidebarRouteTopLevel, sidebarPageNoBreadcrumbs];
