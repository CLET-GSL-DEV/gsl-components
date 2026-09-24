// How big a component has got, measured on the component itself rather than on the file around it.
// A file may legitimately hold four small components; one component holding four screens may not.
import { ast, lineOf, rel, ts, visit } from '../lib/core.mjs';

const isSrc = (f) => /\/src\//.test(f) && !/\.(test|spec)\.tsx?$/.test(f);

/** SonarSource S138 ships 200 as its TypeScript default for lines in a function. That is the outer bound. */
const MAX_BODY_LINES = 200;

/** ESLint's own max-lines-per-function default is 50. It was set for plain functions, so it is applied here to the NON-markup half of the body: the logic the component runs before it returns anything. */
const MAX_LOGIC_LINES = 50;

/** eslint-plugin-react's jsx-max-depth ships NO default, so no published number exists. This one is measured against this repo: p95 of every component here is 8 and the deepest is 10. */
const MAX_JSX_DEPTH = 8;

function isJsxNode(n) {
  return ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n);
}

/** Deepest run of nested JSX elements in a body. */
function jsxDepth(body) {
  let max = 0;
  const walk = (n, depth) => {
    const next = ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) ? depth + 1 : depth;
    if (next > max) max = next;
    n.forEachChild((child) => walk(child, next));
  };
  walk(body, 0);
  return max;
}

/** Lines the body spends on markup, so the rest can be counted as logic. */
function markupLines(src, body) {
  const lines = new Set();
  visit(body, (n) => {
    if (!isJsxNode(n) && !ts.isJsxText(n)) return;
    const from = lineOf(src, n.getStart());
    const to = lineOf(src, n.getEnd());
    for (let i = from; i <= to; i += 1) lines.add(i);
  });
  return lines.size;
}

/** Every component a file declares: a capitalised function whose body contains JSX. */
function componentsIn(file) {
  const src = ast(file);
  const found = [];
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
    if (!fn || !fn.body || !name || !/^[A-Z]/.test(name)) return;
    if (!ts.isBlock(fn.body)) return;

    let hasJsx = false;
    visit(fn.body, (n) => {
      if (isJsxNode(n)) hasJsx = true;
    });
    if (!hasJsx) return;

    const from = lineOf(src, fn.body.getStart());
    const to = lineOf(src, fn.body.getEnd());
    const total = to - from + 1;
    found.push({
      name,
      line: lineOf(src, node.getStart()),
      total,
      logic: total - markupLines(src, fn.body),
      depth: jsxDepth(fn.body),
    });
  });
  return { src, found };
}

export const componentTooLarge = {
  id: 'component-too-large',
  doc: 'A component stays small enough to read in one go, measured on its own body and not on its file.',
  severity: 'warn',
  why: "This is a WARNING, not a gate, and deliberately so: the two published thresholds disagree by a factor of four, and react.dev publishes no component-size number at all. SonarSource S138 allows 200 lines in a TypeScript function; ESLint max-lines-per-function allows 50. Both are used here, on different halves of the body: 200 for the whole thing, and ESLint's 50 for the logic the component runs before it returns markup, because 50 was chosen for plain functions and JSX inflates a line count without adding a decision. File length is not measured, because a file holding four small components is fine and a single component holding four screens is not.",
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx') && isSrc(x))) {
      const { found } = componentsIn(f);
      for (const c of found) {
        const reasons = [];
        if (c.total > MAX_BODY_LINES)
          reasons.push(
            `${c.total} lines of body, over the ${MAX_BODY_LINES} SonarSource S138 allows`,
          );
        if (c.logic > MAX_LOGIC_LINES)
          reasons.push(
            `${c.logic} lines of non-markup logic, over the ${MAX_LOGIC_LINES} ESLint max-lines-per-function allows`,
          );
        if (c.depth > MAX_JSX_DEPTH)
          reasons.push(
            `JSX nested ${c.depth} deep, over this repo's measured 95th percentile of ${MAX_JSX_DEPTH}`,
          );
        if (!reasons.length) continue;
        out.push({
          file: rel(f),
          line: c.line,
          message: `\`${c.name}\`: ${reasons.join('; ')}. Lift a section into its own component`,
        });
      }
    }
    return out;
  },
};

export default [componentTooLarge];
