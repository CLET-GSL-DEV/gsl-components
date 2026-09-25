// The app chrome: the actions button, where notifications live, and the four parts of the header.
import fs from 'node:fs';
import path from 'node:path';

import { isEl, resolveLocalImport } from '../lib/components.mjs';
import {
  ROOT,
  allFiles,
  allSourceFiles,
  ast,
  attrText,
  getAttr,
  jsxName,
  lineOf,
  read,
  rel,
  ts,
  visit,
} from '../lib/core.mjs';

/** Button variants that read as the page's primary action. */
const PRIMARY_VARIANTS = new Set(['primary', 'primary-destructive']);

/** The collapsed cluster's own label, so the check finds the trigger by what it says rather than by file. */
const CLUSTER_LABEL = 'Actions';

/** The plain text a JSX element renders, joined. */
function jsxText(node) {
  if (!ts.isJsxElement(node)) return '';
  return node.children
    .filter((child) => ts.isJsxText(child))
    .map((child) => child.text.trim())
    .join(' ')
    .trim();
}

/** Whether `node` sits inside an element named `name`. */
function insideElement(node, name) {
  let p = node.parent;
  while (p) {
    if (isEl(p) && jsxName(p) === name) return true;
    p = p.parent;
  }
  return false;
}

/** The collapsed Actions trigger is the page's primary button. */
export const actionsButtonPrimary = {
  id: 'actions-button-primary',
  doc: 'The actions cluster trigger on a detail page is the PRIMARY button: <Button variant="primary"> inside the <PopoverTrigger>.',
  why: "That button is the only way to act on the record, so rendering it secondary puts the page's single most important control at the weight of a cancel.",
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const isCluster = /ActionsCluster\.tsx$/.test(f);
      const src = ast(f);
      const lines = read(f).split('\n');

      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'Button') return;
        if (!insideElement(node, 'PopoverTrigger')) return;
        if (!isCluster && jsxText(node) !== CLUSTER_LABEL) return;

        const variant = attrText(getAttr(node, 'variant'));
        if (variant && PRIMARY_VARIANTS.has(variant)) return;
        const line = lineOf(src, node.getStart());
        out.push({
          file: rel(f),
          line,
          message: variant
            ? `the collapsed "${CLUSTER_LABEL}" trigger is variant="${variant}": it is the primary action on the page, so it is variant="primary"`
            : `the collapsed "${CLUSTER_LABEL}" trigger has no variant: it is the primary action on the page, so it is variant="primary"`,
          snippet: lines[line - 1]?.trim(),
        });
      });
    }
    return out;
  },
};

/** A route key or label that names the notifications surface. */
const NOTIFICATIONS_KEY = /NOTIFICATION/;

const NOTIFICATIONS_LABEL = /^notifications?$/i;

/** The `ROUTES.X` key a `to` expression names, or null. */
function routeKeyOf(expression) {
  if (!expression) return null;
  if (ts.isJsxExpression(expression)) return routeKeyOf(expression.expression);
  if (ts.isPropertyAccessExpression(expression) && expression.expression.getText() === 'ROUTES') {
    return expression.name.text;
  }
  if (ts.isStringLiteral(expression)) return expression.text;
  return null;
}

/** The property assignment named `name` on an object literal, or undefined. */
function prop(node, name) {
  return node.properties?.find(
    (p) => ts.isPropertyAssignment(p) && p.name?.getText().replace(/['"]/g, '') === name,
  );
}

/** Notifications is a header widget, not a section of the app. */
export const notificationsIsAHeaderWidget = {
  id: 'notifications-is-a-header-widget',
  doc: 'Notifications is not a module and is not a sidebar destination: it is a widget in the app header, inside <AppHeaderActions>.',
  why: 'A sidebar row is a section of the app you go and work in. Notifications is a thing you glance at from wherever you already are, which is what the header bell is for.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!/\.tsx?$/.test(f) || /\.test\.tsx?$/.test(f)) continue;
      const src = ast(f);
      const lines = read(f).split('\n');
      const report = (node, what) => {
        const line = lineOf(src, node.getStart());
        out.push({
          file: rel(f),
          line,
          message: `${what}: notifications is a header widget, so it belongs in <AppHeaderActions> alongside the Launchpad and the ProfilePopover, not in the sidebar`,
          snippet: lines[line - 1]?.trim(),
        });
      };

      visit(src, (node) => {
        // A sidebar destination literal: `{ label, to, icon }`.
        if (ts.isObjectLiteralExpression(node)) {
          const label = prop(node, 'label');
          const to = prop(node, 'to');
          if (!label || !to) return;
          const labelText =
            ts.isStringLiteral(label.initializer) ||
            ts.isNoSubstitutionTemplateLiteral(label.initializer)
              ? label.initializer.text
              : '';
          const key = routeKeyOf(to.initializer) ?? '';
          if (!NOTIFICATIONS_LABEL.test(labelText) && !NOTIFICATIONS_KEY.test(key)) return;
          report(node, `sidebar destination "${labelText || key}"`);
          return;
        }

        // A hand-written sidebar row: `<SidebarLink to={ROUTES.NOTIFICATIONS}>`.
        if (!isEl(node) || jsxName(node) !== 'SidebarLink') return;
        const to = getAttr(node, 'to');
        const key = routeKeyOf(to?.initializer) ?? '';
        if (!NOTIFICATIONS_KEY.test(key)) return;
        report(node, `<SidebarLink to={ROUTES.${key}}>`);
      });
    }
    return out;
  },
};

/** The four things the reference header carries, each with the names that satisfy it. */
const HEADER_PARTS = [
  { part: 'search control', matches: (n) => /^AppHeader.*Search$/.test(n) },
  { part: 'notifications widget', matches: (n) => /Notification/.test(n) },
  { part: 'Launchpad', matches: (n) => n === 'Launchpad' },
  { part: 'ProfilePopover', matches: (n) => n === 'ProfilePopover' },
];

/** Every JSX name a subtree renders. */
function renderedNames(node) {
  const names = new Set();
  visit(node, (n) => {
    if (isEl(n)) names.add(jsxName(n));
  });
  return names;
}

/** The file behind a `@core/x` or local import of `name`, resolving the repo's tsconfig aliases by hand. */
function resolveShellImport(src, name) {
  const local = resolveLocalImport(src, name);
  if (local) return local;
  for (const statement of src.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause) continue;
    const named = statement.importClause.namedBindings;
    const names = [];
    if (statement.importClause.name) names.push(statement.importClause.name.text);
    if (named && ts.isNamedImports(named)) for (const e of named.elements) names.push(e.name.text);
    if (!names.includes(name)) continue;
    const spec = statement.moduleSpecifier.getText().slice(1, -1);
    if (!spec.startsWith('@core/')) continue;
    const dir = path.join(ROOT, 'src/core', spec.slice('@core/'.length));
    const candidate = path.join(dir, `${name}.tsx`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/** `<AppHeader` and nothing longer. A bare substring test also matches `<AppHeaderNotifications`, `<AppHeaderActions` and `<AppHeaderSearch`, so a file holding only one part of the header gets mistaken for the file that composes it, and the other three parts are then reported missing from a header that has them. */
const COMPOSES_HEADER = /<AppHeader[\s>/]/;

/** The file that composes <AppHeader>, wherever it lives, base layer included. */
function headerFile() {
  for (const f of allSourceFiles()) {
    if (!f.endsWith('.tsx')) continue;
    if (!COMPOSES_HEADER.test(read(f))) continue;
    return f;
  }
  return null;
}

/** The app header carries a search, a notifications widget, a Launchpad and a ProfilePopover. */
export const appHeaderComplete = {
  id: 'app-header-complete',
  doc: 'The app header renders all four of: a search control, a notifications widget, a <Launchpad> and a <ProfilePopover>.',
  why: 'The reference header in records-archive-frontend carries exactly these four, and each missing one is a whole capability the app has no other route to.',
  check(files) {
    const shell = headerFile();
    if (!shell) return [];

    const names = new Set();
    const shellSrc = ast(shell);
    for (const name of renderedNames(shellSrc)) {
      names.add(name);
      const child = resolveShellImport(shellSrc, name);
      if (!child) continue;
      for (const inner of renderedNames(ast(child))) names.add(inner);
    }

    // The call site supplies the slots the shell renders as `{launchpad}` and `{notifications}`,
    // and it lives in a DIFFERENT file from the shell. Composed from the handed-in list this rule
    // answers differently under --staged than under a full run: stage the shell without its call
    // site and every slot looks missing, which refuses a commit over a file the harness does not
    // even scan. The question is repo-wide, so the scan is too.
    const sites = [];
    for (const f of allFiles()) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);
      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'AppShell') return;
        sites.push({ file: f, src, node });
        for (const name of renderedNames(node)) names.add(name);
      });
    }

    const missing = HEADER_PARTS.filter(({ matches }) => ![...names].some((n) => matches(n)));
    if (!missing.length) return [];

    const site = sites.at(0);
    const file = site ? site.file : shell;
    const src = site ? site.src : shellSrc;
    const node = site ? site.node : shellSrc;
    const line = site ? lineOf(src, node.getStart()) : 1;
    return missing.map(({ part }) => ({
      file: rel(file),
      line,
      message: `the app header has no ${part}`,
      snippet: read(file).split('\n')[line - 1]?.trim(),
    }));
  },
};

/** No component refuses to render because the viewport is small. */
export const noMobileScreenGuard = {
  id: 'no-mobile-screen-guard',
  doc: 'No component refuses to render because the viewport is small.',
  why: 'These apps are built responsively, so a viewport width is not a reason to replace the interface with a message. A guard like this hides a working screen and cannot be discovered by anyone on a phone.',
  check() {
    // Repo-wide on purpose, like the invalidation map: the guard lived in the base layer at
    // `src/core`, which the `files` list the harness hands out excludes, so scanning only that
    // list would report clean over the exact file the rule exists to watch.
    const out = [];
    for (const f of allSourceFiles()) {
      if (!f.endsWith('.ts') && !f.endsWith('.tsx')) continue;
      const file = rel(f);
      if (!file.startsWith('src/')) continue;
      const lines = read(f).split('\n');
      lines.forEach((line, i) => {
        if (/MobileWarningLayout/.test(line)) {
          out.push({
            file,
            line: i + 1,
            message:
              'MobileWarningLayout: the small-screen takeover was deleted, nothing may render it, return it or re-export it',
            snippet: line.trim(),
          });
        } else if (/Larger Screen Required/.test(line)) {
          out.push({
            file,
            line: i + 1,
            message:
              '"Larger Screen Required": the small-screen refusal message was deleted with the guard it belonged to',
            snippet: line.trim(),
          });
        }
      });
      // An early `return` guarded by a bare `isMobile` condition in a layout or shell
      // component. Scoped to layout/shell files so a hook legitimately adapting a section
      // elsewhere is not flagged: only the shell may swap the whole screen.
      if (/(Layout|Shell)\.tsx$/.test(f)) {
        lines.forEach((line, i) => {
          if (!/if\s*\([^)]*\bisMobile\b[^)]*\)/.test(line)) return;
          if (!/\breturn\b/.test(lines.slice(i, i + 6).join('\n'))) return;
          out.push({
            file,
            line: i + 1,
            message:
              'early return guarded by isMobile in a layout/shell component: a viewport width is not a reason to replace the interface',
            snippet: line.trim(),
          });
        });
      }
    }
    return out;
  },
};

export default [
  actionsButtonPrimary,
  notificationsIsAHeaderWidget,
  appHeaderComplete,
  noMobileScreenGuard,
];
