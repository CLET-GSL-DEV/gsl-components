// A row of statistics is a kit component, in one variant, holding four cards.
import { isEl } from '../lib/components.mjs';
import { ast, attrText, getAttr, jsxName, lineOf, read, rel, ts, visit } from '../lib/core.mjs';

/** From dist/types/metric-card.d.ts: MetricCardVariant = "default" | "outline" | "bordered" | "soft". */
const METRIC_VARIANTS = new Set(['default', 'outline', 'bordered', 'soft']);

const REQUIRED_VARIANT = 'soft';

/** The row this app wants: four cards, no more and no fewer. */
const ROW_SIZE = 4;

/** A single tailwind class token that turns the element into a grid. */
const GRID_DISPLAY = /^(?:[\w-]+:)*grid$/;

/** A single tailwind class token that gives that grid its column count, at any breakpoint. */
const COLUMN_TOKEN = /^(?:[\w-]+:)*grid-cols-\d/;

/** The type ramp a hand-rolled KPI tile uses for its big number. */
const BIG_NUMBER = /(^|\s)(text-2xl|text-3xl|text-4xl|text-5xl)(\s|$)/;

/** Direct JSX element children of an element, ignoring whitespace text. */
function elementChildren(node) {
  if (!ts.isJsxElement(node)) return [];
  return node.children.filter((child) => isEl(child));
}

/** Direct children that are `{...}` expressions, which is where a `.map()` of cards hides. */
function expressionChildren(node) {
  if (!ts.isJsxElement(node)) return [];
  return node.children.filter((child) => ts.isJsxExpression(child) && child.expression);
}

/** Whether a subtree renders any element named `name`. */
function rendersAnywhere(node, name) {
  let found = false;
  visit(node, (n) => {
    if (!found && isEl(n) && jsxName(n) === name) found = true;
  });
  return found;
}

/** Whether a subtree carries a className with a big-number type size, the tell of a hand-rolled tile. */
function hasBigNumber(node) {
  let found = false;
  visit(node, (n) => {
    if (found || !isEl(n)) return;
    const text = attrText(getAttr(n, 'className'));
    if (text && BIG_NUMBER.test(text)) found = true;
  });
  return found;
}

/** A `div` laying out columns whose children are statistics: the hand-rolled KPI band. */
function kpiBand(node) {
  if (!ts.isJsxElement(node) || jsxName(node) !== 'div') return null;
  const className = attrText(getAttr(node, 'className'));
  if (!className) return null;
  const classes = className.split(/\s+/);
  if (!classes.some((c) => GRID_DISPLAY.test(c)) || !classes.some((c) => COLUMN_TOKEN.test(c))) {
    return null;
  }

  const children = elementChildren(node);
  const cards = children.filter((child) => jsxName(child) === 'MetricCard');
  if (cards.length >= 2) return { kind: 'MetricCard', children, cards };

  const tiles = children.filter((child) => jsxName(child) === 'Card' && hasBigNumber(child));
  if (tiles.length >= 2) return { kind: 'Card', children, cards: tiles };

  return null;
}

/** The length of a module-scope array literal, so `SKELETON_CARDS.map(...)` can still be counted. */
function arrayLengthByName(src) {
  const lengths = new Map();
  for (const statement of src.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const decl of statement.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
      let init = decl.initializer;
      while (ts.isAsExpression(init) || ts.isSatisfiesExpression(init)) init = init.expression;
      if (ts.isArrayLiteralExpression(init)) lengths.set(decl.name.text, init.elements.length);
    }
  }
  return lengths;
}

/** How many cards a row renders, or null when a `.map()` over runtime data makes it unknowable. */
function countCards(node, lengths) {
  let total = elementChildren(node).filter((child) => jsxName(child) === 'MetricCard').length;

  for (const child of expressionChildren(node)) {
    const expression = child.expression;
    if (!ts.isCallExpression(expression)) return null;
    if (!ts.isPropertyAccessExpression(expression.expression)) return null;
    if (expression.expression.name.text !== 'map') return null;
    const source = expression.expression.expression;
    if (!ts.isIdentifier(source)) return null;
    const length = lengths.get(source.text);
    if (length === undefined) return null;
    const body = expression.arguments[0];
    if (!body || !rendersAnywhere(body, 'MetricCard')) return null;
    total += length;
  }

  return total;
}

/** A row of statistics is the kit's MetricCards, not a grid div someone laid out by hand. */
export const metricCardsFromTheKit = {
  id: 'metric-cards-from-the-kit',
  doc: 'A row of statistics is <MetricCards> wrapping <MetricCard> from @rfdtech/components, never a hand-rolled grid div.',
  why: 'MetricCards is the kit layout container for the row: a local grid re-invents its gaps, breakpoints and card sizing, and drifts from every other row in the app.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);
      const lines = read(f).split('\n');

      visit(src, (node) => {
        const band = kpiBand(node);
        if (!band) return;
        const line = lineOf(src, node.getStart());
        out.push({
          file: rel(f),
          line,
          message:
            band.kind === 'MetricCard'
              ? `a grid div holding ${band.cards.length} <MetricCard>: wrap them in <MetricCards> and drop the grid classes`
              : `a grid div holding ${band.cards.length} hand-rolled statistic tiles: use <MetricCards> with <MetricCard label value>`,
          snippet: lines[line - 1]?.trim(),
        });
      });
    }
    return out;
  },
};

/** One metric card look across the app, with the two older variants ruled out. */
export const metricCardVariantSoft = {
  id: 'metric-card-variant-soft',
  doc: 'Every <MetricCard> carries variant="soft". "outline" and "bordered" are ruled out, and the unset default is not the intended card.',
  why: '"soft" is the kit\'s current preferred metric card: borderless on a shadow lift, carrying the same corner radius as the Card component so a row of metrics and the card beneath them read as one system, with a brand watermark clipped by the card\'s own overflow. "outline" and "bordered" are the older looks, and no variant at all is the "default" card, which is a different shape again.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);
      const lines = read(f).split('\n');

      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'MetricCard') return;
        const attr = getAttr(node, 'variant');
        const line = lineOf(src, node.getStart());
        const snippet = lines[line - 1]?.trim();

        if (!attr) {
          out.push({
            file: rel(f),
            line,
            message: `<MetricCard> has no variant, so it renders the "default" card: add variant="${REQUIRED_VARIANT}"`,
            snippet,
          });
          return;
        }

        const literal = attrText(attr);
        if (literal === REQUIRED_VARIANT) return;

        if (literal !== null) {
          out.push({
            file: rel(f),
            line: lineOf(src, attr.getStart()),
            message: METRIC_VARIANTS.has(literal)
              ? `variant="${literal}" is ruled out: use variant="${REQUIRED_VARIANT}"`
              : `variant="${literal}" is not a MetricCardVariant: use variant="${REQUIRED_VARIANT}"`,
            snippet,
          });
          return;
        }

        // A computed variant is judged on the literals it can produce, so `cond ? 'outline' : 'default'` is caught without evaluating the condition.
        const produced = new Set();
        visit(attr, (n) => {
          if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) produced.add(n.text);
        });
        const wrong = [...produced].filter((v) => v !== REQUIRED_VARIANT);
        if (!produced.size || wrong.length) {
          out.push({
            file: rel(f),
            line: lineOf(src, attr.getStart()),
            message: wrong.length
              ? `a computed variant that can render ${wrong.map((v) => `"${v}"`).join(' or ')}: every card is variant="${REQUIRED_VARIANT}"`
              : `a computed variant, so the card can render something other than "${REQUIRED_VARIANT}": pass the literal`,
            snippet,
          });
        }
      });
    }
    return out;
  },
};

/** Four numbers, always: the row is a fixed shape, not whatever the data happened to supply. */
export const metricCardsRowOfFour = {
  id: 'metric-cards-row-of-four',
  doc: `A statistics row holds exactly ${ROW_SIZE} <MetricCard>: a minimum of ${ROW_SIZE} and a maximum of ${ROW_SIZE}.`,
  why: 'Four is the row width the layout is built for; three leaves a hole at the end of the row and five wraps one card onto a line of its own.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);
      const lines = read(f).split('\n');
      const lengths = arrayLengthByName(src);

      visit(src, (node) => {
        const isKitRow = isEl(node) && jsxName(node) === 'MetricCards';
        const band = isKitRow ? null : kpiBand(node);
        if (!isKitRow && !band) return;
        if (band && band.kind !== 'MetricCard') return;

        // A `.map()` over runtime data has no statically knowable length, so it is left alone rather than guessed at.
        const count = countCards(node, lengths);
        if (count === null || count === ROW_SIZE) return;

        const line = lineOf(src, node.getStart());
        out.push({
          file: rel(f),
          line,
          message: `${isKitRow ? '<MetricCards>' : 'this statistics row'} holds ${count} ${count === 1 ? 'card' : 'cards'}, not ${ROW_SIZE}`,
          snippet: lines[line - 1]?.trim(),
        });
      });
    }
    return out;
  },
};

export default [metricCardsFromTheKit, metricCardVariantSoft, metricCardsRowOfFour];
