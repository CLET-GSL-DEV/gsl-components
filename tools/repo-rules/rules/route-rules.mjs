// Rules for a SINGLE-APP (monolith) React repo: one `src`, one router, one route table.
//
// This repo is exactly that shape. App code lives in `src/api`, `src/components`, `src/config`,
// `src/constants`, `src/features` and `src/routes`, over a vendored base layer at `src/core`.
// Every feature writes into ONE router, so the route table is a shared vocabulary rather than a
// per-app detail, and a route only exists in one place if nothing may spell it out by hand.
import { ast, getAttr, jsxName, lineOf, rel, ts, visit } from '../lib/core.mjs';

/** The single module that is allowed to contain route path literals. */
const ROUTES_MODULE = /src\/constants\/routes\.ts$/;

/** Route-shaped literals never checked: not app routes, or owned by the auth package. */
const EXEMPT_PATHS = new Set([
  '/', // the index redirect target, not a named screen
  '/login',
  '/logout',
  '/forbidden',
  '/auth/callback',
  '/auth/logout/callback',
]);

/** A string literal that names an in-app route rather than a URL, an API path or a CSS value. */
function isRouteLiteral(text) {
  if (typeof text !== 'string') return false;
  if (!text.startsWith('/')) return false;
  if (EXEMPT_PATHS.has(text)) return false;
  // An API path belongs to the endpoint layer, not the router.
  if (text.startsWith('/v1/') || text.startsWith('/api/')) return false;
  // A protocol-relative URL or a bare slash-slash is not a route.
  if (text.startsWith('//')) return false;
  return true;
}

/** JSX attributes whose value is a destination the router resolves. */
const NAV_ATTRS = new Set(['to', 'redirectTo', 'forbiddenTo', 'dashboardPath', 'returnTo', 'href']);

/**
 * Every navigation target comes from `@/constants/routes`, never a inline string.
 *
 * A hardcoded `to="/approval-queue"` is invisible to a rename: the route moves, the router keeps
 * working, and the link 404s at runtime with nothing failing at build time. Naming each route once
 * turns that into a type error at the call site.
 */
export const routesFromConstants = {
  id: 'routes-from-constants',
  doc: 'Navigation targets come from src/constants/routes.ts, never an inline path literal.',
  why: 'A hardcoded path survives a route rename and 404s at runtime instead of failing the build.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (ROUTES_MODULE.test(f)) continue;
      const src = ast(f);
      visit(src, (node) => {
        // 1. JSX navigation attributes: <Link to="…">, <Navigate to="…">, redirectTo=…
        if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
          const el = ts.isJsxSelfClosingElement(node) ? node : node.openingElement;
          for (const prop of el.attributes?.properties ?? []) {
            if (!ts.isJsxAttribute(prop)) continue;
            const name = prop.name.getText();
            if (!NAV_ATTRS.has(name)) continue;
            const init = prop.initializer;
            let literal = null;
            if (init && ts.isStringLiteral(init)) literal = init.text;
            else if (init && ts.isJsxExpression(init) && init.expression) {
              const e = init.expression;
              if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) literal = e.text;
              // A template with a leading `/segment` is still a hardcoded base.
              else if (ts.isTemplateExpression(e) && e.head.text.startsWith('/'))
                literal = e.head.text;
            }
            if (isRouteLiteral(literal)) {
              out.push({
                file: rel(f),
                line: lineOf(src, prop.getStart()),
                message: `${jsxName(node)} ${name}="${literal}" is a hardcoded route, use ROUTES`,
              });
            }
          }
          return;
        }

        // 2. Imperative navigation: navigate('/x'), navigate(`/x/${id}`)
        if (ts.isCallExpression(node)) {
          const callee = node.expression.getText();
          if (!/^(navigate|void navigate)$/.test(callee) && !/\bnavigate$/.test(callee)) return;
          const arg = node.arguments[0];
          if (!arg) return;
          let literal = null;
          if (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg))
            literal = arg.text;
          else if (ts.isTemplateExpression(arg) && arg.head.text.startsWith('/'))
            literal = arg.head.text;
          if (isRouteLiteral(literal)) {
            out.push({
              file: rel(f),
              line: lineOf(src, node.getStart()),
              message: `navigate("${literal}") is a hardcoded route, use ROUTES`,
            });
          }
        }
      });
    }
    return out;
  },
};

/**
 * A route table declares its `path` from the same constant the links use.
 *
 * `routes.tsx` and every `<Link>` pointing at it are the two halves of one fact. Split across two
 * spellings, they drift silently: the module still mounts, the nav item just stops matching.
 */
export const routePathsDeclared = {
  id: 'route-paths-declared',
  doc: 'A RouteObject `path` comes from src/constants/routes.ts, never an inline string.',
  why: 'The route table and the links into it are one fact; two spellings of it drift silently.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (ROUTES_MODULE.test(f)) continue;
      // Only the route tables themselves declare paths.
      if (!/routes\.tsx?$/.test(f) && !/router\.tsx$/.test(f)) continue;
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isPropertyAssignment(node)) return;
        if (node.name.getText() !== 'path') return;
        const init = node.initializer;
        if (!ts.isStringLiteral(init) && !ts.isNoSubstitutionTemplateLiteral(init)) return;
        const text = init.text;
        // A relative child segment ("edit", ":id") is resolved by its parent, not a full route.
        if (text === '*' || text === '') return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: `path: "${text}" is an inline literal, declare it in ROUTES`,
        });
      });
    }
    return out;
  },
};

/**
 * A nav item's destination is a declared route, not a string typed into the nav table.
 *
 * `navigation.ts` is where a wrong path is least visible: the sidebar renders, the item is
 * clickable, and it lands on the 404 screen.
 */
export const navItemsUseRoutes = {
  id: 'nav-items-use-routes',
  doc: 'Sidebar/nav `to:` values come from src/constants/routes.ts.',
  why: 'A wrong path here still renders a clickable sidebar item that lands on the 404 screen.',
  check(files) {
    const out = [];
    /* `src/constants/navigation.ts` is where some repos keep the sidebar; this one builds it in a layout component. Scoped to that one filename the rule opened no file at all and reported clean by seeing nothing, which `pnpm rules:coverage` is what finally caught. Match wherever the nav actually is. */
    for (const f of files) {
      if (!/src\/constants\/navigation\.ts$/.test(f) && !/src\/components\/layout\/.*Sidebar.*\.tsx$/.test(f))
        continue;
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isPropertyAssignment(node)) return;
        if (node.name.getText() !== 'to') return;
        const init = node.initializer;
        if (!ts.isStringLiteral(init) && !ts.isNoSubstitutionTemplateLiteral(init)) return;
        if (!isRouteLiteral(init.text)) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: `nav to: "${init.text}" is a hardcoded route, use ROUTES`,
        });
      });
    }
    return out;
  },
};

/**
 * The route constants module stays a flat table of literals with no imports from the app.
 *
 * The moment it imports a module, that module cannot import it back without a cycle, and the
 * router, the nav table and every page all need it. It is a leaf by design.
 */
export const routesModuleIsLeaf = {
  id: 'routes-module-is-leaf',
  doc: 'src/constants/routes.ts imports nothing from the app: everything imports it.',
  why: 'The router, the nav table and every page import it; an app import back creates a cycle.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!ROUTES_MODULE.test(f)) continue;
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isImportDeclaration(node)) return;
        const spec = node.moduleSpecifier;
        if (!ts.isStringLiteral(spec)) return;
        if (!spec.text.startsWith('@/') && !spec.text.startsWith('.')) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: `routes.ts imports "${spec.text}"; it must stay a leaf module`,
        });
      });
    }
    return out;
  },
};

// ---------------------------------------------------------------------------
// From the starter side: `no-hardcoded-route`.
//
// It is NOT the same check as `routes-from-constants` above, so both are kept. The four rules
// above are monolith-shaped: they name `src/constants/routes.ts`, `src/constants/navigation.ts`
// and the route table by path, and they only look at JSX nav attributes and `navigate()`.
// `no-hardcoded-route` is the monorepo-shaped, structural version: it works from a declaration
// allowlist rather than one hardcoded module path, it also covers `path:` and `href:` property
// assignments and `redirect`/`router.push`, it excludes endpoint modules where `path` means an
// API path, and it accepts composed forms (a builder call, a ternary, a template that starts
// from a ROUTES member). In a repo with no `src/constants/routes.ts` the four above go quiet and
// this one still holds, which is the reason to carry it.
// ---------------------------------------------------------------------------

const isSrc = (f) => /\/src\//.test(f) && !/\.(test|spec)\.tsx?$/.test(f);

/** Where paths are ALLOWED to be literals, because this is where they are declared. */
const DECLARATION_FILE = /\/constants\/routes\.tsx?$|\/routes\/paths\.tsx?$|\/auth\/src\//;

/**
 * Endpoint modules, where `path` means an API path and not a route.
 *
 * The two collide on the same key name: a router config has `{ path: '/things' }` and so does an
 * `EndpointDef`. An API path SHOULD be a literal here, and a separate rule already insists these
 * declarations live in exactly these files, so this is where the collision is resolved.
 */
const ENDPOINT_FILE = /\/src\/api\/|\.endpoints\.tsx?$|-api\.tsx?$/;

/** Props and calls whose value is a route. */
const ROUTE_PROPS = /^(to|redirectTo|forbiddenTo|dashboardPath|returnTo|loginPath|path|href)$/;
const NAVIGATE_CALL = /^(navigate|redirect|replace|router\.push|history\.push)$/;

/**
 * A literal that is a real in-app path, and not one of the things that legitimately IS a string.
 *
 * Excluded: the router catch-all, empty and anchor placeholders, and any absolute URL, which is
 * a different site and cannot come from this app's route table.
 */
function isHardCodedPath(text) {
  if (!text.startsWith('/')) return false;
  if (text === '*' || text === '' || text === '#' || text === '/*') return false;
  if (/^https?:\/\//.test(text)) return false;
  return true;
}

/**
 * Every accepted way of naming a route, so the rule accommodates the composed forms rather than
 * demanding one shape:
 *   ROUTES.ACTIVATIONS              a member of the route table
 *   activationRoute(row.id)         a builder that owns the URL shape
 *   `${ROUTES.ACTIVATIONS}?tab=x`   a template BUILT FROM one, query string appended
 *   -1                              history.back
 */
function describesRouteProperly(node) {
  const expr =
    ts.isAsExpression(node) || ts.isParenthesizedExpression(node) ? node.expression : node;
  if (
    ts.isPropertyAccessExpression(expr) ||
    ts.isIdentifier(expr) ||
    ts.isElementAccessExpression(expr)
  )
    return true;
  if (ts.isCallExpression(expr)) return true;
  if (ts.isPrefixUnaryExpression(expr) || ts.isNumericLiteral(expr)) return true;
  if (ts.isConditionalExpression(expr)) {
    return describesRouteProperly(expr.whenTrue) && describesRouteProperly(expr.whenFalse);
  }
  // A template is fine as long as it does not START with a typed-out path.
  if (ts.isTemplateExpression(expr)) return !isHardCodedPath(expr.head.text);
  if (ts.isNoSubstitutionTemplateLiteral(expr)) return !isHardCodedPath(expr.text);
  if (ts.isStringLiteral(expr)) return !isHardCodedPath(expr.text);
  return true;
}

export const routesFromTheRouteTable = {
  id: 'no-hardcoded-route',
  doc: 'Navigation uses ROUTES or a route builder, never a typed-out path string.',
  why: 'A path written by hand is a copy of a fact that lives in the route table, and nothing keeps the two together. Renaming a route then compiles perfectly and leaves dead links scattered across screens nobody thought to grep. Composed forms are accepted: a builder call, or a template that starts from a ROUTES member and appends a query string.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => isSrc(x) && !DECLARATION_FILE.test(x))) {
      const src = ast(f);

      const report = (node, how) => {
        if (describesRouteProperly(node)) return;
        // A backtick path with no interpolation is still a typed-out path.
        const text =
          ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
            ? node.text
            : ts.isTemplateExpression(node)
              ? node.head.text
              : null;
        if (text === null || !isHardCodedPath(text)) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: `"${text}" is typed out in ${how}, use the matching ROUTES member or a route builder`,
        });
      };

      visit(src, (node) => {
        // navigate('/x'), redirect('/x')
        if (ts.isCallExpression(node) && NAVIGATE_CALL.test(node.expression.getText())) {
          if (node.arguments[0]) report(node.arguments[0], `${node.expression.getText()}()`);
          return;
        }
        // <Link to="/x">, <ProtectedRoute redirectTo="/x">
        if (ts.isJsxAttribute(node) && ROUTE_PROPS.test(node.name.getText())) {
          const value = node.initializer;
          if (!value) return;
          if (ts.isStringLiteral(value)) report(value, `the ${node.name.getText()} prop`);
          else if (ts.isJsxExpression(value) && value.expression) {
            report(value.expression, `the ${node.name.getText()} prop`);
          }
          return;
        }
        // { path: '/x' } in a router config, and the same keys in an options object. `path` is
        // skipped in endpoint modules, where it means an API path.
        if (ts.isPropertyAssignment(node) && ROUTE_PROPS.test(node.name.getText())) {
          const key = node.name.getText();
          if (key === 'path' && ENDPOINT_FILE.test(f)) return;
          report(node.initializer, `the ${key} key`);
        }
      });
    }
    return out;
  },
};

export default [
  routesFromConstants,
  routePathsDeclared,
  navItemsUseRoutes,
  routesModuleIsLeaf,
  routesFromTheRouteTable,
];
