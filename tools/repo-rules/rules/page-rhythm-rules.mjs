// A page's vertical rhythm is set once, by one named thing. Three spellings of it is how a metric
// row ends up sitting a different distance from the card under it on every screen.
import { ast, jsxName, lineOf, rel, ts, visit } from '../lib/core.mjs';
import { isEl } from '../lib/components.mjs';

/** The two shells that carry the app's own vertical rhythm. Either is a correct page root. */
const RHYTHM_SHELLS = new Set(['PageSection', 'DetailShell']);

/** The one class that names the rhythm. `gap-6` and friends are a number somebody typed, and a number cannot be changed in one place. */
const RHYTHM_CLASS = 'gap-body';

function isPage(file) {
  return /\/pages\/[A-Za-z0-9]+\.tsx$/.test(file);
}

/** The element a component hands back, skipping parentheses and any fragment wrapper. */
function returnedRoot(node) {
  let expression = node;
  while (expression && ts.isParenthesizedExpression(expression)) expression = expression.expression;
  if (!expression) return null;
  if (ts.isJsxFragment(expression)) {
    return expression.children.find((child) => isEl(child)) ?? null;
  }
  return isEl(expression) ? expression : null;
}

function classesOf(node) {
  const el = ts.isJsxSelfClosingElement(node) ? node : node.openingElement;
  const attr = el?.attributes?.properties?.find(
    (p) => ts.isJsxAttribute(p) && p.name.getText() === 'className',
  );
  if (!attr?.initializer) return '';
  return attr.initializer.getText();
}

const pageRootSetsRhythm = {
  id: 'page-root-sets-rhythm',
  doc: 'A page returns `PageSection`, `DetailShell`, or an element carrying `gap-body`, so every screen spaces its sections the same way.',
  why: 'Vertical rhythm spelled three ways is three different gaps. This app already had `PageSection` on some pages, a hand-rolled `flex flex-col gap-body` on twenty, and a bare `gap-6` on one, which is why a row of metric cards sits a different distance from the card beneath it depending on which screen you are looking at. A literal gap number on a page root cannot be changed in one place, which is the whole argument for a token.',
  check(files) {
    const out = [];
    for (const f of files.filter(isPage)) {
      const src = ast(f);
      let flagged = false;
      visit(src, (node) => {
        if (flagged) return;
        // Only the component's own top-level return, not a branch inside a helper.
        if (!ts.isReturnStatement(node) || !node.expression) return;
        const root = returnedRoot(node.expression);
        if (!root) return;
        const name = jsxName(root);
        if (RHYTHM_SHELLS.has(name)) {
          flagged = true;
          return;
        }
        const classes = classesOf(root);
        if (classes.includes(RHYTHM_CLASS)) {
          flagged = true;
          return;
        }
        // A root with no gap at all, or one with a literal number, is the finding.
        if (!/gap-/.test(classes)) return;
        out.push({
          file: rel(f),
          line: lineOf(src, root.getStart(src)),
          message: `page root spaces its sections with ${classes.match(/gap-[a-z0-9[\]]+/)?.[0] ?? 'a literal gap'} instead of PageSection, DetailShell or gap-body`,
        });
        flagged = true;
      });
    }
    return out;
  },
};

// A metric strip is itself a section: what follows it sits in its own PageSection, or the numbers touch the thing they describe with no gap at all. This earns its keep because MetricCards renders no bottom margin and flex parents with an unset gap token collapse to zero.
const metricCardsNeedSectionGap = {
  id: 'section-gap-after-metric-cards',
  doc: 'On a page with `<MetricCards>`, everything after the strip sits inside its own `<PageSection>`, and so does the strip: a metric row is a section, not a block that happens to carry margin.',
  why: 'MetricCards renders no bottom margin, so a strip followed by a bare Tabs or Table sat flush against it: the numbers touched the thing they describe, with no gap at all. The fix is the kit section wrapper, which carries the body-gap token, so the spacing is the page rhythm rather than a number somebody typed next to one strip and forgot next to the next.',
  check(files) {
    const out = [];
    for (const f of files.filter(isPage)) {
      const src = ast(f);
      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'MetricCards') return;
        if (!ts.isJsxElement(node) || !node.parent) return;
        // The element the strip sits in: its following siblings are what the strip needs a gap to.
        const parent = node.parent;
        if (!ts.isJsxElement(parent)) return;
        const children = parent.children.filter((child) => isEl(child));
        const index = children.indexOf(node);
        if (index === -1) return;
        for (const sibling of children.slice(index + 1)) {
          const name = jsxName(sibling);
          if (name === 'PageSection') break;
          out.push({
            file: rel(f),
            line: lineOf(src, sibling.getStart(src)),
            message: `<MetricCards> is a section and so is what follows it: wrap the strip and what comes after in <PageSection>, or the two render with no gap between them`,
          });
          return;
        }
        // The strip fills its own PageSection alone, so the section itself is what needs a gap to whatever comes next: a lone strip section followed by a bare card is the same flush defect one level up.
        if (children.length !== 1 || jsxName(parent) !== 'PageSection') return;
        const grand = parent.parent;
        if (!grand || !ts.isJsxElement(grand)) return;
        const aunts = grand.children.filter((child) => isEl(child));
        for (const sibling of aunts.slice(aunts.indexOf(parent) + 1)) {
          if (jsxName(sibling) === 'PageSection') break;
          out.push({
            file: rel(f),
            line: lineOf(src, sibling.getStart(src)),
            message: `a <PageSection> holding only <MetricCards> is followed by a bare element: wrap what follows in <PageSection>, or the strip renders with no gap above it`,
          });
          return;
        }
      });
    }
    return out;
  },
};

export default [pageRootSetsRhythm, metricCardsNeedSectionGap];
