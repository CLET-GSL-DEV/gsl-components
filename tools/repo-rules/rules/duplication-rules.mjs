// The same thing written twice in two files, found by SHAPE rather than by text.
// Text comparison misses a copy the moment someone renames a key, which is exactly what happened here.
import { ast, lineOf, rel, ts, visit } from '../lib/core.mjs';

const isSrc = (f) => /\/src\//.test(f) && !/\.(test|spec)\.tsx?$/.test(f);

/** A constant map is a copy when its VALUES line up, whatever its keys are called. */
function shapeOfValue(node) {
  if (!node) return '?';
  if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node))
    return shapeOfValue(node.expression);
  if (ts.isObjectLiteralExpression(node)) {
    const parts = node.properties.map((p) =>
      ts.isPropertyAssignment(p) ? shapeOfValue(p.initializer) : '~',
    );
    return `{${parts.join(',')}}`;
  }
  if (ts.isArrayLiteralExpression(node)) {
    return `[${node.elements.map(shapeOfValue).join(',')}]`;
  }
  if (ts.isStringLiteralLike(node)) return JSON.stringify(node.text);
  if (ts.isNumericLiteral(node)) return node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return 'true';
  if (node.kind === ts.SyntaxKind.FalseKeyword) return 'false';
  if (node.kind === ts.SyntaxKind.NullKeyword) return 'null';
  if (
    ts.isIdentifier(node) ||
    ts.isPropertyAccessExpression(node) ||
    ts.isElementAccessExpression(node)
  ) {
    return '#';
  }
  // A call carries its arguments' shape. Without this every call collapses to the bare kind name,
  // so any two exported maps of N calls fingerprint identically however unrelated they are: eight
  // `personWithRole('DTI_DIRECTOR')` entries matched eight `GET({ path, queryKey })` entries. The
  // callee itself still normalises to `#`, so renaming the function does not hide a real copy.
  if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
    const args = (node.arguments ?? []).map(shapeOfValue).join(',');
    return `${shapeOfValue(node.expression)}(${args})`;
  }
  return ts.SyntaxKind[node.kind];
}

/** How much of this value is real literal content rather than a reference to something else. */
function literalCount(node) {
  let n = 0;
  const walk = (x) => {
    if (ts.isStringLiteralLike(x) || ts.isNumericLiteral(x)) n += 1;
    x.forEachChild(walk);
  };
  walk(node);
  return n;
}

function valueSize(node) {
  if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node))
    return valueSize(node.expression);
  if (ts.isObjectLiteralExpression(node)) return node.properties.length;
  if (ts.isArrayLiteralExpression(node)) return node.elements.length;
  return 0;
}

/** A body is a copy when its STRUCTURE lines up: same markup, same calls, whatever the locals are called. */
function shapeOfBody(node) {
  const tokens = [];
  const walk = (n) => {
    if (ts.isIdentifier(n)) {
      tokens.push('#');
      return;
    }
    if (ts.isStringLiteralLike(n) || ts.isNumericLiteral(n)) {
      tokens.push('L');
      return;
    }
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxClosingElement(n)) {
      tokens.push(`<${n.tagName.getText()}>`);
    } else if (ts.isJsxAttribute(n)) {
      tokens.push(`@${n.name.getText()}`);
    } else if (ts.isCallExpression(n) && ts.isIdentifier(n.expression)) {
      tokens.push(`call:${n.expression.text}`);
    } else if (ts.isPropertyAssignment(n) && !ts.isComputedPropertyName(n.name)) {
      tokens.push(`key:${n.name.getText().replace(/['"]/g, '')}`);
    } else {
      tokens.push(ts.SyntaxKind[n.kind]);
    }
    n.forEachChild(walk);
  };
  walk(node);
  return tokens;
}

/** Every exported top-level value and function in a file, with the shape that identifies a copy. */
function declarationsIn(file) {
  const src = ast(file);
  const values = [];
  const bodies = [];

  for (const statement of src.statements) {
    const exported = statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;

    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
        const init = decl.initializer;
        if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
          if (init.body) {
            bodies.push({
              name: decl.name.text,
              file: rel(file),
              line: lineOf(src, decl.getStart()),
              tokens: shapeOfBody(init.body),
            });
          }
          continue;
        }
        if (valueSize(init) < 3) continue;
        // A map whose entries are all references collapses to the same shape as any other map of
        // that size, so it carries no evidence of a copy. Two real values is the floor.
        if (literalCount(init) < 2) continue;
        values.push({
          name: decl.name.text,
          file: rel(file),
          line: lineOf(src, decl.getStart()),
          shape: shapeOfValue(init),
          size: valueSize(init),
        });
      }
      continue;
    }

    if (ts.isFunctionDeclaration(statement) && statement.name && statement.body) {
      bodies.push({
        name: statement.name.text,
        file: rel(file),
        line: lineOf(src, statement.getStart()),
        tokens: shapeOfBody(statement.body),
      });
    }
  }

  return { values, bodies };
}

/** Below this a shared shape is coincidence, not a copy. Measured on this repo: a bare `array.filter(x => x.a === b)` is 16 nodes and two unrelated helpers collide there, while the shortest real copy found is 23. */
const MIN_BODY_TOKENS = 20;

/** The stand-in a cell shows when the backend sent nothing. There is one of these per app, not one per feature, because changing it has to change every screen at once. `none` and a bare dash are deliberately absent: both are CSS keywords and separators far more often than they are missing data. */
const EMPTY_PLACEHOLDER =
  /^(n\/?a|not available|not applicable|not set|not provided|not recorded|unknown|no data|tbc|tbd)$/i;

function group(items, keyOf) {
  const map = new Map();
  for (const item of items) {
    const key = keyOf(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

/** Only a copy that crossed a file boundary is worth reporting: two in one file are visibly adjacent. */
const acrossFiles = (sites) => new Set(sites.map((s) => s.file)).size > 1;

const elsewhere = (sites, self) =>
  sites
    .filter((s) => s !== self)
    .slice(0, 4)
    .map((s) => `${s.file}:${s.line}`)
    .join(', ');

export const noStructuralDuplicate = {
  id: 'no-structural-duplicate',
  doc: 'A constant map or a component body is written once and imported, not copied into the next feature.',
  why: 'Two copies drift. A tone added to one status map and not its twin is a chip that renders grey on one screen and red on the other, and nothing fails until a user notices. This compares NORMALISED AST SHAPE, not text: a constant matches when its values line up whatever its keys are called, and a body matches when its markup and calls line up whatever its locals are called. That is why it still sees a copy after somebody renamed half of it.',
  check(files) {
    const scope = files.filter((f) => isSrc(f));
    const allValues = [];
    const allBodies = [];
    for (const f of scope) {
      const { values, bodies } = declarationsIn(f);
      allValues.push(...values);
      allBodies.push(...bodies);
    }

    const out = [];

    for (const [, sites] of group(allValues, (v) => v.shape)) {
      if (sites.length < 2 || !acrossFiles(sites)) continue;
      for (const site of sites) {
        out.push({
          file: site.file,
          line: site.line,
          message: `\`${site.name}\` has the same ${site.size}-entry shape and the same values as ${sites.length - 1} other exported constant${sites.length > 2 ? 's' : ''} (${elsewhere(sites, site)}). Declare it once and import it`,
        });
      }
    }

    const bodyKey = (b) => b.tokens.join('|');
    for (const [, sites] of group(
      allBodies.filter((b) => b.tokens.length >= MIN_BODY_TOKENS),
      bodyKey,
    )) {
      if (sites.length < 2 || !acrossFiles(sites)) continue;
      for (const site of sites) {
        out.push({
          file: site.file,
          line: site.line,
          message: `\`${site.name}\` has a structurally identical body to ${elsewhere(sites, site)} (${site.tokens.length} nodes, same markup and same calls). Move one copy to a shared module and delete the other`,
        });
      }
    }

    // The empty-value placeholder, typed out by hand instead of imported from the one constant that owns it.
    const placeholders = [];
    for (const f of scope) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isStringLiteralLike(node)) return;
        if (!EMPTY_PLACEHOLDER.test(node.text.trim())) return;
        if (ts.isImportDeclaration(node.parent) || ts.isExportDeclaration(node.parent)) return;
        // The one module-scope constant that declares it is the thing every other site should import.
        const decl = node.parent;
        if (
          ts.isVariableDeclaration(decl) &&
          ts.isIdentifier(decl.name) &&
          /^[A-Z0-9_]+$/.test(decl.name.text) &&
          decl.parent.parent.parent === src
        ) {
          return;
        }
        placeholders.push({ text: node.text, file: rel(f), line: lineOf(src, node.getStart()) });
      });
    }

    for (const [, sites] of group(placeholders, (p) => p.text.toLowerCase())) {
      const text = sites[0].text;
      const fileCount = new Set(sites.map((s) => s.file)).size;
      if (fileCount < 2) continue;
      const reported = new Set();
      for (const site of sites) {
        const key = `${site.file}:${site.line}`;
        if (reported.has(key)) continue;
        reported.add(key);
        out.push({
          file: site.file,
          line: site.line,
          message: `"${text}" is the empty-value placeholder written out by hand, at ${sites.length} sites across ${fileCount} files. Import the one constant that declares it`,
        });
      }
    }

    return out;
  },
};

export default [noStructuralDuplicate];
