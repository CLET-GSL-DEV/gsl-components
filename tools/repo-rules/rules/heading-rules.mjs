// A screen says each thing once. The page title and the card under it are not two chances to name
// the same list.
import {
  CARD_SURFACES,
  OVERLAY_SURFACES,
  TABLE_SURFACES,
  enclosingCard,
  exportedCardComponents,
  exportedComponentsRendering,
  isEl,
  resolveLocalImport,
} from '../lib/components.mjs';
import { ast, attrText, getAttr, jsxName, lineOf, rel, ts, visit } from '../lib/core.mjs';

/** Words that carry no meaning of their own when comparing two headings. */
const NOISE = new Set([
  'a',
  'administration',
  'all',
  'an',
  'and',
  'management',
  'monitor',
  'of',
  'the',
  'view',
]);

/** The meaningful words in a heading, lowercased and stripped of noise. */
function significantWords(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !NOISE.has(word)),
  );
}

/**
 * A card directly under a page title does not repeat that title.
 *
 * "Taxonomy Administration" above a card headed "Taxonomy versions" reads as two headings for one
 * thing, and the second earns none of the vertical space it takes. Either the card is the whole
 * page, in which case it needs no title of its own, or it holds one part of the page and its
 * title should say which part.
 *
 * Compared on meaningful words, so "Transfer Queue" over "Transfer queue records" is caught while
 * "Records" over "Version history" is not.
 */
export const noDuplicateHeading = {
  id: 'no-duplicate-heading',
  doc: 'A SectionCard title does not restate the PageHeader title above it.',
  why: 'Two headings for one thing, and the second earns none of the space it takes.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);

      let pageTitle = null;
      visit(src, (node) => {
        if (pageTitle) return;
        if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) return;
        if (jsxName(node) !== 'PageHeader') return;
        pageTitle = attrText(getAttr(node, 'title'));
      });
      if (!pageTitle) continue;

      const pageWords = significantWords(pageTitle);
      if (pageWords.size === 0) continue;

      visit(src, (node) => {
        if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) return;
        if (jsxName(node) !== 'SectionCard') return;
        const cardTitle = attrText(getAttr(node, 'title'));
        if (!cardTitle) return;

        const cardWords = significantWords(cardTitle);
        if (cardWords.size === 0) return;

        // Every meaningful word of the card title already said in the page title.
        const restates = [...cardWords].every((word) => pageWords.has(word));
        if (!restates) return;

        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: `SectionCard title "${cardTitle}" restates the page title "${pageTitle}"`,
        });
      });
    }
    return out;
  },
};

/** The page title written in this file, or null when the file renders no page header. */
function pageHeaderTitle(src) {
  let title = null;
  let found = false;
  visit(src, (node) => {
    if (found || !isEl(node) || jsxName(node) !== 'PageHeader') return;
    found = true;
    title = attrText(getAttr(node, 'title'));
  });
  return found ? (title ?? '(dynamic)') : null;
}

/** Whether `node` is rendered from a `.map()`, i.e. one of many rather than the only one. */
function insideList(node) {
  let p = node.parent;
  while (p) {
    if (
      ts.isCallExpression(p) &&
      ts.isPropertyAccessExpression(p.expression) &&
      (p.expression.name.text === 'map' || p.expression.name.text === 'flatMap')
    ) {
      return true;
    }
    p = p.parent;
  }
  return false;
}

/**
 * Walk the page's JSX, skipping overlay subtrees, calling `fn` with every element.
 *
 * Overlay content is portalled: a card or a table inside a dialog is not on the page behind it.
 */
function walkPage(src, fn) {
  const walk = (node) => {
    node.forEachChild((child) => {
      if (isEl(child) && OVERLAY_SURFACES.has(jsxName(child))) return;
      if (isEl(child) && fn(child) === false) return; // `false` means do not descend
      walk(child);
    });
  };
  walk(src);
}

/**
 * Every card surface this page puts on screen.
 *
 * A locally-imported component whose rendered root is a card counts as one, because a page that
 * mounts `<FixityAlertsSection />` beside its own card really does show two cards.
 */
function pageCards(src) {
  const cards = [];
  walkPage(src, (el) => {
    const name = jsxName(el);
    if (CARD_SURFACES.has(name)) {
      cards.push({ name, node: el, wrapper: null });
      return true;
    }
    if (/^[A-Z]/.test(name)) {
      const wrapperFile = resolveLocalImport(src, name);
      if (wrapperFile && exportedCardComponents(wrapperFile).has(name)) {
        cards.push({ name, node: el, wrapper: wrapperFile });
      }
    }
    return true;
  });
  return cards;
}

/**
 * Every table this page puts on screen, as the element that mounts it.
 *
 * A table reached through a local wrapper counts: `<AuditEventsTable />` is a table to the reader
 * however many files it takes to render.
 */
function pageTables(src) {
  const tables = [];
  walkPage(src, (el) => {
    const name = jsxName(el);
    if (TABLE_SURFACES.has(name)) {
      tables.push(el);
      return false; // a Table's own TableContent is the same table
    }
    if (/^[A-Z]/.test(name)) {
      const wrapperFile = resolveLocalImport(src, name);
      if (wrapperFile && exportedComponentsRendering(wrapperFile, TABLE_SURFACES).has(name)) {
        tables.push(el);
        return false;
      }
    }
    return true;
  });
  return tables;
}

/** The heading a raw `<Card>` writes in its own `CardHeader`, as a node, or null. */
function cardTitleNode(card) {
  let title = null;
  visit(card, (node) => {
    if (title || !isEl(node)) return;
    if (jsxName(node) === 'CardTitle') title = node;
  });
  return title;
}

/** The text of a `CardTitle`, best effort. */
function cardTitleText(node) {
  return (node.children ?? [])
    .map((child) => (ts.isJsxText(child) ? child.text : ''))
    .join('')
    .trim();
}

/**
 * A card carries a heading of its own only when there is a SECOND thing on the page to tell it
 * apart from.
 *
 * Two shapes are caught, and they are the same mistake seen from two sides:
 *
 *   1. THE ONLY CARD. The page header sits directly above it and already says what the screen is.
 *      "Export Console / Generate PKI-signed export packages" stacked on "Export queue /
 *      Registrar-initiated certified exports" is four lines of chrome above an empty table.
 *
 *   2. THE ONLY TABLE. A page whose one table lives in a titled card is naming that table twice:
 *      the page is about the list, and the card header repeats it in different words. "Taxonomy
 *      Administration" over "Version history / Every version, published and draft" tells the
 *      reader nothing the page title and the columns did not.
 *
 * A card header earns its space when a sibling card, or a second table, needs telling apart from
 * it. Otherwise drop `title` and `description`; if the card heading says something truer than the
 * page title, that sentence belongs in the `PageHeader`, not in a second heading block under it.
 *
 * Sibling of `no-duplicate-heading`, which catches a card title that restates the page title word
 * for word. This one does not care whether the words match: with nothing to disambiguate, the
 * second heading is redundant however it is phrased.
 *
 * Deliberate exception: `// rules-allow: redundant-card-header <why this card must be named>`.
 */
export const redundantCardHeader = {
  id: 'redundant-card-header',
  doc: "A card carries no title or description when it is the page's only card, or holds the page's only table.",
  why: 'The page header already named it; a second heading block just pushes the content down.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);

      const pageTitle = pageHeaderTitle(src);
      if (!pageTitle) continue;

      // Every card counts towards "is this the only one", including a card a local wrapper
      // renders: `<MyRegistrationsTable />` is a second card on the screen even though its
      // `SectionCard` is written in another file.
      const cards = pageCards(src);
      const tables = pageTables(src);

      // The card that holds the page's only table, when there is exactly one table.
      const soleTableCard = tables.length === 1 ? enclosingCard(tables[0]) : null;
      const soleCard = cards.length === 1 && !insideList(cards[0].node) ? cards[0].node : null;

      // Only a card written in THIS file can be reported: the heading of a wrapper's own card is
      // that file's business, and the wrapper may be mounted on other pages too.
      for (const card of cards.filter((c) => !c.wrapper && !insideList(c.node))) {
        const isSoleCard = card.node === soleCard;
        const isSoleTableCard = card.node === soleTableCard;
        if (!isSoleCard && !isSoleTableCard) continue;

        const title = getAttr(card.node, 'title');
        const description = getAttr(card.node, 'description');
        const inlineTitle = title || description ? null : cardTitleNode(card.node);
        if (!title && !description && !inlineTitle) continue;

        const target = inlineTitle ?? card.node;
        const heading = inlineTitle ? cardTitleText(inlineTitle) : attrText(title);
        const named = heading ? `"${heading}"` : 'a heading of its own';
        const dropped =
          title || inlineTitle ? (description ? 'title and description' : 'title') : 'description';
        const because = isSoleTableCard
          ? 'holds the only table on the page'
          : 'is the only card on the page';

        out.push({
          file: rel(f),
          line: lineOf(src, target.getStart()),
          message: `<${card.name}> ${because} and carries ${named}: drop the ${dropped}, "${pageTitle}" already names this screen`,
        });
      }
    }
    return out;
  },
};

export default [noDuplicateHeading, redundantCardHeader];
