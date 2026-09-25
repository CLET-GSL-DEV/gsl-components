// Code-quality rules with no opinion in them: each one names a concrete, checkable defect.
//
// These exist because the same four mistakes kept appearing across the SFL apps, and none of them
// is visible to typecheck or lint. They are cheap to make, expensive to find later, and every one
// of them compiles perfectly.
import fs from 'node:fs';
import path from 'node:path';

import { ROOT, ast, lineOf, read, rel, ts, visit } from '../lib/core.mjs';

const isSrc = (f) => /\/src\//.test(f) && !/\.(test|spec)\.tsx?$/.test(f);

/** The nearest enclosing function, so a rule can tell "inside a component" from "at module scope". */
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

/** Is this node inside a `useMemo` / `useCallback` / `useState` initialiser, where a fresh value per render is the point? */
function insideMemo(node) {
  let current = node.parent;
  while (current) {
    if (ts.isCallExpression(current)) {
      const callee = current.expression.getText();
      if (/^(useMemo|useCallback|useState|useRef|createContext)$/.test(callee)) return true;
    }
    current = current.parent;
  }
  return false;
}

/** The JSX attribute a node sits in, if any, so styling props can be told from data props. */
function enclosingJsxAttribute(node) {
  let current = node.parent;
  while (current) {
    if (ts.isJsxAttribute(current)) return current.name.getText();
    if (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current)) return null;
    current = current.parent;
  }
  return null;
}

/** Is this node inside JSX, i.e. rebuilt on every render? */
function insideJsx(node) {
  let current = node.parent;
  while (current) {
    if (ts.isJsxExpression(current) || ts.isJsxAttribute(current)) return true;
    current = current.parent;
  }
  return false;
}

/**
 * Is every leaf of this literal a compile-time constant?
 *
 * This is the whole rule. A literal built from props or state (`items={[{ value: data.name }]}`)
 * is DERIVED: it cannot be hoisted, and memoising it is a judgement call nobody should be forced
 * into by a blocking check. A literal made only of constants (`keys={['Blocking', 'Needs']}`) can
 * always be hoisted, and the advice is never wrong.
 */
function isStaticLiteral(node) {
  if (
    ts.isStringLiteralLike(node) ||
    ts.isNumericLiteral(node) ||
    node.kind === ts.SyntaxKind.TrueKeyword ||
    node.kind === ts.SyntaxKind.FalseKeyword ||
    node.kind === ts.SyntaxKind.NullKeyword
  ) {
    return true;
  }
  if (ts.isPrefixUnaryExpression(node)) return isStaticLiteral(node.operand);
  if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node))
    return isStaticLiteral(node.expression);
  if (ts.isArrayLiteralExpression(node)) return node.elements.every(isStaticLiteral);
  if (ts.isObjectLiteralExpression(node)) {
    return node.properties.every(
      (p) =>
        ts.isPropertyAssignment(p) &&
        !ts.isComputedPropertyName(p.name) &&
        isStaticLiteral(p.initializer),
    );
  }
  return false;
}

export const noInlineLiteralInRender = {
  id: 'no-inline-literal-in-render',
  doc: 'A CONSTANT array or object is declared at module scope, not rebuilt inside JSX.',
  why: 'A literal made only of constants is a new reference on every render for no reason at all, so every child that receives it re-renders and any hook depending on it never settles. Hoisting it is free and always correct. A literal derived from props or state is NOT flagged: it cannot be hoisted, and whether to memoise it is a judgement call.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx') && isSrc(x))) {
      const src = ast(f);
      visit(src, (node) => {
        const isLiteral =
          ts.isArrayLiteralExpression(node) ||
          (ts.isObjectLiteralExpression(node) && node.properties.length > 0);
        if (!isLiteral) return;
        if (!insideJsx(node)) return;
        if (insideMemo(node)) return;
        if (!enclosingFunction(node)) return;

        /* Styling props are excluded deliberately. `classNames={{ root: '...' }}` really is
           rebuilt every render, but it feeds a leaf presentational component and flagging every
           one of them buries the finding that matters under dozens that do not. The cost this
           rule exists for is DATA rebuilt every render: an options list, a column set, a config
           object handed to a hook. */
        /* Only CONSTANT literals. A derived one cannot be hoisted, so flagging it would be
           advice the author cannot take. */
        if (!isStaticLiteral(node)) return;

        // A nested literal is reported through its outermost parent, not once per level.
        if (
          ts.isArrayLiteralExpression(node.parent) ||
          ts.isObjectLiteralExpression(node.parent) ||
          (ts.isPropertyAssignment(node.parent) && ts.isObjectLiteralExpression(node.parent.parent))
        ) {
          return;
        }

        const attr = enclosingJsxAttribute(node);
        if (attr && /^(className|classNames|style|sx)$/.test(attr)) return;

        const heavy = ts.isArrayLiteralExpression(node)
          ? node.elements.length >= 2
          : node.properties.length >= 2;
        if (!heavy) return;

        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: ts.isArrayLiteralExpression(node)
            ? `constant array of ${node.elements.length} rebuilt every render, hoist it to module scope`
            : `constant object of ${node.properties.length} keys rebuilt every render, hoist it to module scope`,
        });
      });
    }
    return out;
  },
};

/** A UUID that is all zeros, or an obvious placeholder id. */
const PLACEHOLDER =
  /^0{8}-0{4}-[0-9a-f]{4}-[0-9a-f]{4}-0{12}$|^(00000000|11111111|xxxxxxxx|test-id|dummy|placeholder|todo)$/i;

export const noPlaceholderData = {
  id: 'no-placeholder-data',
  doc: 'No placeholder id, dummy record or invented default stands in for real data.',
  why: 'A placeholder makes a broken integration look like a working screen. It reaches production as a request for a record that cannot exist, and the failure surfaces far from the line that caused it. If an id genuinely has meaning, it is a named constant that says so.',
  check(files) {
    const out = [];
    for (const f of files.filter(isSrc)) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isStringLiteralLike(node)) return;
        if (!PLACEHOLDER.test(node.text)) return;
        // A named module-scope constant is the sanctioned way to carry a meaningful id.
        const parent = node.parent;
        const named =
          ts.isVariableDeclaration(parent) &&
          ts.isIdentifier(parent.name) &&
          /^[A-Z0-9_]+$/.test(parent.name.text) &&
          !enclosingFunction(node);
        if (named) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: `placeholder value "${node.text}" used as real data, remove it or make it a named module-scope constant`,
        });
      });
    }
    return out;
  },
};

const ENDPOINT_FILE = /\/src\/api\/|\.endpoints\.tsx?$/;

export const noTypesInEndpointFiles = {
  id: 'no-types-in-endpoint-files',
  doc: "An endpoint module declares endpoints. Its types live in the feature's types module.",
  why: 'A response shape declared next to the call that returns it cannot be reused by the screen that renders it, so it gets retyped by hand a second time and the two drift. Keeping every shape in one types module is what makes a backend field rename a single edit.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => ENDPOINT_FILE.test(x) && isSrc(x))) {
      const src = ast(f);
      visit(src, (node) => {
        const isDecl = ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node);
        if (!isDecl) return;
        if (node.parent !== src) return;

        // A request BODY or QUERY type is part of the endpoint's own signature and belongs here;
        // a response shape is domain data and belongs with the domain.
        const name = node.name.text;
        if (/(Body|Query|Params|Request|Args)$/.test(name)) return;

        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: `\`${name}\` is declared in an endpoint module, move it to the feature's types.ts and import it`,
        });
      });
    }
    return out;
  },
};

export const noGratuitousOptional = {
  id: 'no-gratuitous-optional',
  doc: 'A wire type marks a field optional only when the backend can genuinely omit it.',
  severity: 'warn',
  why: 'Optional everywhere pushes a null check to every call site and hides which fields the backend actually guarantees. A field that is always present but nullable is `T | null`, which is a different and honest claim.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => /types\.tsx?$/.test(x) && isSrc(x))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isInterfaceDeclaration(node)) return;
        /* A REQUEST type is excluded: an optional query parameter is exactly what optional means,
           so `PageQuery { siteCode: string; page?: number }` is correct and flagging it would
           teach people to ignore this rule. The target is a RESPONSE shape, where optional
           usually means the author guessed rather than read the backend. */
        if (/(Query|Params|Body|Request|Args|Options|Props|Config|Filters)$/.test(node.name.text))
          return;
        const members = node.members.filter((m) => ts.isPropertySignature(m));
        if (members.length < 4) return;
        const optional = members.filter((m) => m.questionToken);
        // Over half optional is the signal: it means the shape was guessed, not read.
        if (optional.length * 2 <= members.length) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: `${optional.length} of ${members.length} fields on \`${node.name.text}\` are optional, use \`T | null\` for fields the backend always sends`,
        });
      });
    }
    return out;
  },
};

/** Every name a feature's display module exports whose declaration contains JSX. A component and a camelCase factory returning cells are the same defect, and the name shape cannot tell them apart, so the declaration is read instead. */
const displayJsxCache = new Map();

function jsxExportsOfDisplay(feature, moduleName = 'display') {
  const cacheKey = `${feature}::${moduleName}`;
  if (displayJsxCache.has(cacheKey)) return displayJsxCache.get(cacheKey);
  const names = new Set();
  for (const extension of ['ts', 'tsx']) {
    const file = path.join(ROOT, 'src', 'features', feature, `${moduleName}.${extension}`);
    if (!fs.existsSync(file)) continue;
    const src = ast(file);
    for (const stmt of src.statements) {
      if (!stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
      const declarations = ts.isVariableStatement(stmt)
        ? stmt.declarationList.declarations.filter((d) => d.initializer)
        : [stmt];
      for (const decl of declarations) {
        const declName = ts.isIdentifier(decl.name ?? {}) ? decl.name.text : null;
        if (!declName) continue;
        const body = ts.isVariableDeclaration(decl) ? decl.initializer : decl;
        if (body && returnsJsx(body)) names.add(declName);
      }
    }
  }
  displayJsxCache.set(cacheKey, names);
  return names;
}

export const cleanModuleBoundaries = {
  id: 'clean-module-boundaries',
  doc: 'A feature imports another feature through its published surface (types, constants, display or api), never from its internals.',
  why: "A reach into another feature's pages, components or hooks makes the two impossible to move or delete separately, and it is how a folder structure quietly becomes one module.",
  check(files) {
    const out = [];
    for (const f of files.filter(isSrc)) {
      const mine = f.match(/\/src\/features\/([^/]+)\//)?.[1];
      if (!mine) continue;
      const src = ast(f);
      for (const stmt of src.statements) {
        if (!ts.isImportDeclaration(stmt) || !ts.isStringLiteral(stmt.moduleSpecifier)) continue;
        const m = stmt.moduleSpecifier.text.match(/^@\/features\/([^/]+)\/(.+)$/);
        if (!m) continue;
        const [, theirs, path] = m;
        if (theirs === mine) continue;
        const line = lineOf(src, stmt.getStart(src));
        // types and constants are the whole sanctioned public surface, whatever is imported from them.
        if (/^(types|constants)(\.tsx?)?$/.test(path)) continue;
        // `display` is a feature's presentation constants and pure derivation helpers, and `api` is
        // the behaviour it publishes: the store action another feature is meant to call, such as
        // advancing a project's phase when a gate is approved. Both stay importable, but ONLY for
        // that: anything reached through either that renders is the hole this closes. A feature with
        // no way to publish an action is a feature others route around, which is worse. The
        // declaration is read rather than the name, because a camelCase factory returning
        // `TableColumn[]` full of cells walked straight through the old name test.
        const surface = path.match(/^(display|api)(\.tsx?)?$/)?.[1];
        if (surface) {
          const clause = stmt.importClause;
          if (!clause || clause.isTypeOnly) continue;
          const named = clause.namedBindings;
          if (!named || !ts.isNamedImports(named)) continue;
          const jsxExports = jsxExportsOfDisplay(theirs, surface);
          for (const element of named.elements) {
            if (element.isTypeOnly) continue;
            const name = (element.propertyName ?? element.name).text;
            const rendersJsx = jsxExports.has(name);
            if (!rendersJsx && !/^[A-Z][a-z]/.test(name)) continue;
            out.push({
              file: rel(f),
              line,
              message: rendersJsx
                ? `${mine} imports ${name} from ${theirs}/${surface} and it renders JSX, a ${surface} module carries no markup, move it to src/components`
                : `${mine} imports the component ${name} from ${theirs}/${surface}, a ${surface} module carries no markup, move the component to src/components`,
            });
          }
          continue;
        }
        out.push({
          file: rel(f),
          line,
          message: `${mine} imports ${theirs}/${path}, reach only for ${theirs}/types, constants, display or api, or move the shared piece up`,
        });
      }
    }
    return out;
  },
};

/** True when a function's body can return JSX, which is what makes it a component rather than a helper. */
function returnsJsx(node) {
  let found = false;
  visit(node, (child) => {
    if (child === node) return;
    if (ts.isFunctionDeclaration(child) || ts.isFunctionExpression(child)) return;
    if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child) || ts.isJsxFragment(child)) {
      found = true;
    }
  });
  return found;
}

export const displayHoldsNoComponents = {
  id: 'display-holds-no-components',
  doc: "A display module holds a feature's presentation constants and pure derivation helpers, and exports nothing that renders.",
  why: 'Anything that renders in the display module is what makes the module un-importable by another feature without dragging rendering along with it, and it is what ESLint reports as react-refresh/only-export-components. The test is the declaration, not the name: a camelCase factory returning a column set whose cells are JSX is a component under another name, and gating on a PascalCase name let exactly that walk through. Move it to src/components and leave the constants behind.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => /\/display\.tsx?$/.test(x) && isSrc(x))) {
      const src = ast(f);
      for (const stmt of src.statements) {
        const exported = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
        if (!exported) continue;
        const declarations = ts.isVariableStatement(stmt)
          ? stmt.declarationList.declarations.filter((d) => d.initializer)
          : [stmt];
        for (const decl of declarations) {
          const name = ts.isIdentifier(decl.name ?? {}) ? decl.name.text : null;
          if (!name) continue;
          const body = ts.isVariableDeclaration(decl) ? decl.initializer : decl;
          if (!body || !returnsJsx(body)) continue;
          out.push({
            file: rel(f),
            line: lineOf(src, decl.getStart(src)),
            message: /^[A-Z]/.test(name)
              ? `\`${name}\` is a React component in a display module, move it to src/components and leave the constants here`
              : `\`${name}\` renders JSX in a display module, so it is a component under a lowercase name, move it to src/components and leave the constants here`,
          });
        }
      }
    }
    return out;
  },
};

export const deriveConstantsFromTypes = {
  id: 'no-duplicated-union-literal',
  doc: 'A union type of string literals has ONE runtime list, and the type is derived from it.',
  why: 'Writing the members twice, once as a union and again as an array to iterate, means a value added to one is silently missing from the other: the type still compiles and the dropdown just never offers the new option. Declaring the array `as const` and deriving the union from it makes that impossible.',
  check(files) {
    // Every union of string literals declared in a types module, by its exact member set.
    const unions = new Map();
    for (const f of files.filter((x) => /types\.tsx?$/.test(x) && isSrc(x))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isTypeAliasDeclaration(node) || !ts.isUnionTypeNode(node.type)) return;
        const members = node.type.types.map((t) =>
          ts.isLiteralTypeNode(t) && ts.isStringLiteral(t.literal) ? t.literal.text : null,
        );
        if (members.length < 2 || members.some((m) => m === null)) return;
        unions.set([...members].sort().join('\u0000'), { name: node.name.text, file: rel(f) });
      });
    }
    if (!unions.size) return [];

    const out = [];
    for (const f of files.filter(isSrc)) {
      if (/types\.tsx?$/.test(f)) continue;
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isArrayLiteralExpression(node) || node.elements.length < 2) return;
        const values = node.elements.map((e) => (ts.isStringLiteralLike(e) ? e.text : null));
        if (values.some((v) => v === null)) return;
        const hit = unions.get([...values].sort().join('\u0000'));
        if (!hit) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: `this repeats every member of \`${hit.name}\` (${hit.file}). Declare the list there \`as const\` and derive the union from it, then import the list`,
        });
      });
    }
    return out;
  },
};

export const oneDeclarationPerConstant = {
  id: 'no-duplicated-constant',
  doc: 'A shared constant is declared in exactly one module and imported everywhere else.',
  why: 'Two copies drift. Someone adds 100 to the page-size list in one file and not the other, and the same table then offers different options depending on which screen you opened it from. Where two copies are genuinely wanted, say so with a `rules-allow` comment giving the reason.',
  check(files) {
    // Module-scope SCREAMING_CASE consts with a literal value, by name.
    const declarations = new Map();
    for (const f of files.filter(isSrc)) {
      const src = ast(f);
      for (const statement of src.statements) {
        if (!ts.isVariableStatement(statement)) continue;
        for (const decl of statement.declarationList.declarations) {
          if (!ts.isIdentifier(decl.name) || !/^[A-Z][A-Z0-9_]{2,}$/.test(decl.name.text)) continue;
          if (!decl.initializer) continue;
          const value = decl.initializer.getText().replace(/\s+/g, ' ').trim();
          if (value.length > 400) continue;
          if (!declarations.has(decl.name.text)) declarations.set(decl.name.text, []);
          declarations.get(decl.name.text).push({
            file: rel(f),
            line: lineOf(src, decl.getStart()),
            value,
          });
        }
      }
    }

    const out = [];
    for (const [name, sites] of declarations) {
      if (sites.length < 2) continue;
      const values = new Set(sites.map((s) => s.value));
      // Identical value in two places is one constant written twice. Different values under one
      // name is a different defect: a reader cannot tell which one a screen is using.
      const identical = values.size === 1;
      for (const site of sites) {
        const others = sites.filter((s) => s !== site).map((s) => s.file);
        out.push({
          file: site.file,
          line: site.line,
          message: identical
            ? `\`${name}\` is declared identically in ${sites.length} files (also ${others.join(', ')}), move it to one module and import it`
            : `\`${name}\` is declared in ${sites.length} files with DIFFERENT values (also ${others.join(', ')}), give each a name that says which it is, or share one`,
        });
      }
    }
    return out;
  },
};

const INDEX_HTML = 'index.html';
const HEADERS_FILE = 'public/_headers';

/** The directives the page must keep, declared in index.html itself so the requirement travels with the file it governs. */
function requiredDirectives(html) {
  const declared = html.match(/csp-required:\s*([^\n]+)/);
  if (!declared) return null;
  // Keep only real directive names, so the comment's own `-->` terminator is not read as one.
  return declared[1].split(/[\s,]+/).filter((token) => /^[a-z]+(-[a-z]+)*$/.test(token));
}

export const cspIntact = {
  id: 'csp-directives-intact',
  doc: 'index.html keeps every CSP directive its own `csp-required` comment lists.',
  why: 'A CSP is edited to fix one thing and quietly loses another. `object-src` and `base-uri` are real protections in a meta tag, and nothing else in the build would notice them going missing. The comment states the intent next to the policy, so removing a directive means deleting the line that asks for it, which is a visible act rather than an accident.',
  check() {
    const file = path.join(ROOT, INDEX_HTML);
    if (!fs.existsSync(file)) return [];
    const html = fs.readFileSync(file, 'utf8');
    const required = requiredDirectives(html);
    if (!required) {
      return [
        {
          file: INDEX_HTML,
          line: 1,
          message: 'no `csp-required:` comment, add one naming the directives this page must keep',
        },
      ];
    }
    const policy = html.match(/content="([^"]*default-src[^"]*)"/)?.[1] ?? '';
    const line = html.split('\n').findIndex((l) => l.includes('csp-required')) + 1;
    return required
      .filter((directive) => !new RegExp(`(^|;)\\s*${directive}[\\s;]`).test(`${policy};`))
      .map((directive) => ({
        file: INDEX_HTML,
        line: line || 1,
        message: `\`${directive}\` is named in csp-required but missing from the policy`,
      }));
  },
};

export const frameProtectionServed = {
  id: 'frame-protection-served',
  doc: 'Clickjacking protection lives in the HTTP headers, because `frame-ancestors` does nothing in a meta tag.',
  why: 'Browsers ignore frame-ancestors delivered via meta and log an error for it, so a policy that only sets it there is not protected at all while looking like it is. The real defence is the `_headers` file, and it needs X-Frame-Options beside it for anything that does not read CSP level 2.',
  check() {
    const out = [];
    const headersPath = path.join(ROOT, HEADERS_FILE);
    if (!fs.existsSync(headersPath)) {
      return [
        {
          file: HEADERS_FILE,
          line: 1,
          message: 'missing, so nothing serves the real security headers',
        },
      ];
    }
    const headers = fs.readFileSync(headersPath, 'utf8');
    if (!/frame-ancestors\s+'none'/.test(headers)) {
      out.push({
        file: HEADERS_FILE,
        line: 1,
        message: "no `frame-ancestors 'none'`, so the app can be framed",
      });
    }
    if (!/X-Frame-Options:\s*DENY/i.test(headers)) {
      out.push({ file: HEADERS_FILE, line: 1, message: 'no `X-Frame-Options: DENY` fallback' });
    }

    const indexPath = path.join(ROOT, INDEX_HTML);
    if (fs.existsSync(indexPath)) {
      const html = fs.readFileSync(indexPath, 'utf8');
      const metaPolicy = html.match(/content="([^"]*default-src[^"]*)"/)?.[1] ?? '';
      if (/frame-ancestors/.test(metaPolicy)) {
        out.push({
          file: INDEX_HTML,
          line: html.split('\n').findIndex((l) => l.includes('frame-ancestors')) + 1,
          message:
            'frame-ancestors in a meta tag is ignored by the browser and logs an error, it belongs in _headers only',
        });
      }
    }
    return out;
  },
};

export default [
  cspIntact,
  frameProtectionServed,
  noInlineLiteralInRender,
  deriveConstantsFromTypes,
  oneDeclarationPerConstant,
  noPlaceholderData,
  noTypesInEndpointFiles,
  noGratuitousOptional,
  cleanModuleBoundaries,
  displayHoldsNoComponents,
];
