// A tab strip is a heading. The tab that is lit names the section, so the page it switches to must
// not name itself again underneath it.
import fs from 'node:fs';
import path from 'node:path';

import { ROOT, ast, jsxName, lineOf, rel, ts, visit } from '../lib/core.mjs';
import { isEl } from '../lib/components.mjs';

/** The layout that renders the project tab strip and hosts every project section as an outlet. */
const LAYOUT = path.join(ROOT, 'src/features/portfolio/components/ProjectDetailLayout.tsx');
const ROUTES_FILE = path.join(ROOT, 'src/constants/routes.ts');
const ROUTER = path.join(ROOT, 'src/routes/router.tsx');

/** Anything that renders a page's own name at the top of the section. `PageTitle` is this repo's wrapper around the same two kit parts. */
const TITLE_ELEMENTS = new Set(['SectionTitle', 'PageTitle']);

function exists(file) {
  return fs.existsSync(file);
}

/** The last path segment of `/projects/${id}/resources`, which is what the router matches a child route on. Returns null for the parent route itself, whose template ends on the interpolation. */
function trailingSegment(node) {
  if (ts.isTemplateExpression(node)) {
    const tail = node.templateSpans.at(-1)?.literal.text ?? '';
    const segment = tail.split('/').filter(Boolean).at(-1);
    return segment ?? null;
  }
  if (ts.isNoSubstitutionTemplateLiteral(node) || ts.isStringLiteral(node)) {
    return node.text.split('/').filter(Boolean).at(-1) ?? null;
  }
  return null;
}

/** Every `ROUTES` member that resolves to a plain string or a path-building arrow, read once. `projectResources` and `PROJECT_RESOURCES_SEGMENT` both come back as "resources", which is what lets a tab be matched to the route that serves it. */
function routeSegments() {
  const src = ast(ROUTES_FILE);
  const segments = new Map();
  visit(src, (node) => {
    if (!ts.isPropertyAssignment(node) || !ts.isIdentifier(node.name)) return;
    const key = node.name.text;
    const value = node.initializer;
    if (ts.isStringLiteral(value)) {
      segments.set(key, value.text);
      return;
    }
    if (ts.isArrowFunction(value) && value.body && !ts.isBlock(value.body)) {
      const segment = trailingSegment(value.body);
      // The overview tab points at the project itself, whose template ends on the id, so it has no
      // segment of its own. The router serves it as the index child, matched separately below.
      segments.set(key, segment ?? '');
    }
  });
  return segments;
}

/** The `ROUTES` helper each tab navigates to, e.g. `projectResources`. */
function tabRouteHelpers() {
  const src = ast(LAYOUT);
  const helpers = new Set();
  visit(src, (node) => {
    if (!ts.isPropertyAssignment(node) || node.name.getText() !== 'to') return;
    visit(node.initializer, (inner) => {
      if (!ts.isCallExpression(inner) || !ts.isPropertyAccessExpression(inner.expression)) return;
      if (inner.expression.expression.getText() !== 'ROUTES') return;
      helpers.add(inner.expression.name.text);
    });
  });
  return helpers;
}

/** `@/features/tasks/pages/ProjectWbs` as an absolute file path, or null when it resolves to nothing on disk. */
function moduleFile(specifier) {
  if (!specifier.startsWith('@/')) return null;
  const base = path.join(ROOT, 'src', specifier.slice(2));
  for (const ext of ['.tsx', '.ts']) {
    if (exists(base + ext)) return base + ext;
  }
  return null;
}

/** The page files the tab strip switches between: the children of the layout route whose path segment a tab points at, plus the index child, which is the overview tab. */
function tabDestinationFiles() {
  const segments = routeSegments();
  const helpers = tabRouteHelpers();
  const wanted = new Set();
  for (const helper of helpers) {
    const segment = segments.get(helper);
    if (segment) wanted.add(segment);
  }

  const src = ast(ROUTER);
  const files = new Map();
  visit(src, (node) => {
    // The one route object that renders the layout. Its `children` are the sections.
    if (!ts.isObjectLiteralExpression(node)) return;
    const element = node.properties.find(
      (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'element',
    );
    if (!element || !element.initializer.getText().includes('ProjectDetailLayout')) return;
    const children = node.properties.find(
      (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'children',
    );
    if (!children || !ts.isArrayLiteralExpression(children.initializer)) return;

    for (const child of children.initializer.elements) {
      if (!ts.isObjectLiteralExpression(child)) continue;
      const get = (name) =>
        child.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText() === name);
      const lazy = get('lazy');
      if (!lazy) continue;
      let specifier = null;
      visit(lazy.initializer, (inner) => {
        if (ts.isCallExpression(inner) && inner.expression.kind === ts.SyntaxKind.ImportKeyword) {
          const arg = inner.arguments[0];
          if (arg && ts.isStringLiteral(arg)) specifier = arg.text;
        }
      });
      if (!specifier) continue;

      const indexChild = get('index');
      const routePath = get('path');
      let isTab = Boolean(indexChild);
      if (!isTab && routePath) {
        const text = routePath.initializer.getText();
        const constName = text.startsWith('ROUTES.') ? text.slice('ROUTES.'.length) : null;
        const segment = constName
          ? segments.get(constName)
          : ts.isStringLiteral(routePath.initializer)
            ? routePath.initializer.text
            : null;
        isTab = Boolean(segment && wanted.has(segment));
      }
      if (!isTab) continue;

      const file = moduleFile(specifier);
      if (file) files.set(file, specifier);
    }
  });
  return files;
}

const tabDestinationHasNoTitle = {
  id: 'tab-destination-has-no-title',
  doc: 'A page a tab strip switches to renders no title of its own.',
  why: 'The lit tab already names the section, and the record it belongs to is named above the strip, so a heading on the page is the third time one screen says the same word. It also costs the reader a band of vertical space before any content. Twelve of the fourteen project sections had drifted into doing this while project overview, which never did, showed what the page is supposed to look like. A page reached from INSIDE a tab, a detail record or a wizard, is not a tab destination and still needs its title.',
  check(files) {
    if (![LAYOUT, ROUTES_FILE, ROUTER].every(exists)) return [];
    const destinations = tabDestinationFiles();
    const out = [];
    for (const file of files) {
      if (!destinations.has(file)) continue;
      const src = ast(file);
      visit(src, (node) => {
        if (!isEl(node) || !TITLE_ELEMENTS.has(jsxName(node))) return;
        out.push({
          file: rel(file),
          line: lineOf(src, node.getStart(src)),
          message: `this page is what the "${path.basename(file, path.extname(file))}" tab switches to, so the strip has already named it: drop the title and keep any actions in a SectionActions`,
        });
      });
    }
    return out;
  },
};

export default [tabDestinationHasNoTitle];
