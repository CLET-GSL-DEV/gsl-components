// Where a page's action sits, and what the bands around it may be.
//
// Three patterns from one real screen: a CardHeader holding nothing but a button, a page whose
// only action is a secondary button, and a Tabs strip glued to the card it filters. All three are
// invisible to typecheck and to a code review that reads the tree, and all three are obvious in a
// screenshot weeks later. A layout defect that a rule can see should fail the commit, not the demo.
import { CARD_SURFACES, hasAncestor, isEl } from '../lib/components.mjs';
import { ast, getAttr, jsxName, lineOf, rel, ts, visit } from '../lib/core.mjs';

/** Button variants that understate an action. The kit's default, no variant, is primary. */
const NON_PRIMARY_VARIANTS = new Set(['secondary', 'outline', 'ghost', 'tertiary']);

/** Containers whose buttons belong to that component, never to the page around it. */
const NOT_PAGE_LEVEL = new Set(['Modal', 'Dialog', 'TableActions', 'TableHeader', 'Notice', 'Form']);

/** The element's className when it is a plain string literal, else null. A `cn(...)` call is skipped rather than guessed at. */
function literalClassName(node) {
  const attr = getAttr(node, 'className');
  if (!attr?.initializer || !ts.isStringLiteral(attr.initializer)) return null;
  return attr.initializer.text;
}

/** True when a CardTitle or a CardDescription sits anywhere in the element's subtree, however deep, outside a CardActions. A self-closing title counts; a nested one counts the same. */
function holdsTitle(node) {
  for (const child of node.children) {
    if (!isEl(child)) continue;
    const name = jsxName(child);
    if (name === 'CardTitle' || name === 'CardDescription') return true;
    if (name !== 'CardActions' && ts.isJsxElement(child) && holdsTitle(child)) return true;
  }
  return false;
}

/** One line each. */
export const cardHeaderHoldsOnlyActions = {
  id: 'card-header-holds-only-actions',
  doc: 'CLAUDE.md / ui-patterns: a CardHeader holds a title or a description, never an actions-only band.',
  why: 'A header that exists to hold a button is a band of chrome pushing the content down, and the action it holds belongs beside the tabs or in the table itself.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);

      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'CardHeader') return;
        // A self-closing header has no children at all, so it cannot be an actions-only band.
        if (!ts.isJsxElement(node)) return;
        // Whitespace-only text between children is not content, so element children only.
        const names = node.children.filter(isEl).map(jsxName);
        if (!names.includes('CardActions')) return;
        // A title wrapped in a layout div, title over subtitle, is still a title, so the search
        // descends. It stops at a CardActions boundary: what the actions contain is not the
        // header's other half.
        if (names.includes('CardTitle') || names.includes('CardDescription')) return;
        if (holdsTitle(node)) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message:
            "CardHeader holds only actions and no title, so it is a band that exists to hold a button. Move the action beside the tabs or into the table's own actions, and delete the header.",
        });
      });
    }
    return out;
  },
};

export const solePageActionIsPrimary = {
  id: 'sole-page-action-is-primary',
  doc: 'CLAUDE.md / ui-patterns: the only action on a page is the page call to action, so it is primary.',
  why: 'A page with one action states its whole purpose with that button. Rendering it secondary tells the reader the page itself is an afterthought.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      if (!/^src[/\\]features[/\\][^/\\]+[/\\]pages[/\\]/.test(rel(f))) continue;
      const src = ast(f);

      const pageButtons = [];
      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'Button') return;
        // A button inside a form, a dialog or a table band belongs to that component, not to the page.
        if (hasAncestor(node, NOT_PAGE_LEVEL, { stopAtOverlay: false })) return;
        pageButtons.push(node);
      });
      if (pageButtons.length !== 1) continue;

      const attr = getAttr(pageButtons[0], 'variant');
      // No variant is the kit default, primary, and fine. An expression variant is skipped rather than guessed at.
      if (!attr?.initializer || !ts.isStringLiteral(attr.initializer)) continue;
      const variant = attr.initializer.text;
      if (!NON_PRIMARY_VARIANTS.has(variant)) continue;
      out.push({
        file: rel(f),
        line: lineOf(src, pageButtons[0].getStart()),
        message: `the only action on this page is a \`${variant}\` button. A page's single call to action is the primary one, so drop the variant or give the page a real primary action.`,
      });
    }
    return out;
  },
};

export const tabsSeparatedFromCard = {
  id: 'tabs-separated-from-card',
  doc: 'CLAUDE.md / ui-patterns: a Tabs strip sitting flush on the card it filters declares no separation.',
  why: 'A pill strip glued to the card border reads as one merged band, and the reader cannot tell where the selector ends and the surface it selects begins.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);

      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'Tabs') return;
        const parent = node.parent;
        if (!ts.isJsxElement(parent)) return;
        const siblings = parent.children;
        // The immediately following sibling, skipping whitespace-only text and nothing else: any
        // real content between the strip and the card means they are not adjacent.
        let next = null;
        for (let i = siblings.indexOf(node) + 1; i < siblings.length && !next; i++) {
          const sib = siblings[i];
          if (ts.isJsxText(sib)) {
            if (sib.getText().trim() === '') continue;
            break;
          }
          if (isEl(sib)) next = sib;
          else break;
        }
        if (!next || !CARD_SURFACES.has(jsxName(next))) return;

        // Declared separation is either on the strip itself, an mb-, or on the closest enclosing
        // element that declares a className at all, a gap- or space-y-.
        const own = literalClassName(node);
        if (own !== null && own.includes('mb-')) return;
        let enclosing = null;
        for (let p = parent; p && enclosing === null; p = p.parent) {
          if (!isEl(p)) continue;
          const cls = literalClassName(p);
          if (cls !== null) enclosing = cls;
        }
        if (enclosing !== null && (enclosing.includes('gap-') || enclosing.includes('space-y-'))) {
          return;
        }
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message:
            'a `Tabs` strip sits directly on the `Card` it filters with no declared separation. Give the container a `gap-` or the strip an `mb-`.',
        });
      });
    }
    return out;
  },
};

export default [cardHeaderHoldsOnlyActions, solePageActionIsPrimary, tabsSeparatedFromCard];
