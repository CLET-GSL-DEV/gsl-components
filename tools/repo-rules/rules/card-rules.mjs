// One surface, one border.
//
// A Card draws a border, a radius and 16px of padding. Putting a second Card inside the first
// draws all three again, one inset from the other, and the reader gets two frames around one idea
// with a dead gutter between them. It is the most visible way a screen stops looking designed, and
// it is almost never deliberate: it happens when a page wraps a section in a `SectionCard` and the
// component it mounts already had a `Card` of its own.
//
// That second card is usually in a DIFFERENT FILE from the first, which is why this rule follows a
// local import to see what the imported component really renders.
import {
  CARD_SURFACES,
  OVERLAY_SURFACES,
  enclosingCard,
  exportedCardComponents,
  exportedRootComponents,
  isEl,
  resolveLocalImport,
} from '../lib/components.mjs';
import { ast, jsxName, lineOf, rel, ts, visit } from '../lib/core.mjs';

export const noCardInCard = {
  id: 'no-card-in-card',
  doc: 'CLAUDE.md / ui-patterns: one surface, one border. A Card never contains another Card.',
  why: 'Two borders around one idea, with the inner padding stacked on the outer 16px.',
  check(files) {
    const out = [];
    // A wrapper reported once, however many pages mount it inside a card.
    const seen = new Set();

    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);

      visit(src, (node) => {
        if (!isEl(node) || !CARD_SURFACES.has(jsxName(node))) return;
        const outer = jsxName(node);

        // Walk below this card, stopping at an overlay (a dialog is its own surface) and at a
        // nested card already reported, so one bad nesting is one finding rather than one per leaf.
        const walk = (n) => {
          n.forEachChild((child) => {
            if (!isEl(child)) {
              walk(child);
              return;
            }
            const name = jsxName(child);
            if (OVERLAY_SURFACES.has(name)) return;

            if (CARD_SURFACES.has(name)) {
              out.push({
                file: rel(f),
                line: lineOf(src, child.getStart()),
                message: `<${name}> inside <${outer}>: two borders around one section`,
              });
              return; // its own children are that card's problem, not this one's
            }

            // A local wrapper. Follow it once: the second card is written in its file.
            if (/^[A-Z]/.test(name) && !seen.has(`${f}:${name}`)) {
              seen.add(`${f}:${name}`);
              const wrapperFile = resolveLocalImport(src, name);
              const cardLine = wrapperFile
                ? exportedCardComponents(wrapperFile).get(name)
                : undefined;
              if (cardLine) {
                out.push({
                  file: rel(wrapperFile),
                  line: cardLine,
                  message: `<${name}> renders its own Card but is mounted inside <${outer}> at ${rel(f)}:${lineOf(src, child.getStart())}`,
                });
                return;
              }
            }

            walk(child);
          });
        };
        walk(node);
      });
    }
    return out;
  },
};

/**
 * A tab strip sits ABOVE the card, never inside it.
 *
 * Pill tabs choose WHICH records the card shows. They are not part of the card's content, so
 * nesting them makes the card appear to contain its own selector and puts the tab bar on top of
 * the panel it is supposed to be switching. The reader sees a card header, then a row of pills,
 * then a table header, then a search box: four bands of chrome before the first row of data.
 *
 * The shape that passes: `<Tabs>` wraps the section, `<TabsList>` is the first thing inside it,
 * and the `<Card bordered>` sits under the strip holding the table alone.
 *
 * A card that genuinely switches panes inside itself is the deliberate exception, and says so:
 * `// rules-allow: tabs-above-card <why these tabs belong inside this card>`.
 */
export const tabsAboveCard = {
  id: 'tabs-above-card',
  doc: 'CLAUDE.md / ui-patterns: a Tabs strip sits above the card it filters, never inside it.',
  why: 'The strip chooses what the card shows, so it is not part of the card content.',
  check(files) {
    const out = [];
    // A wrapper reported once, however many cards mount it.
    const seen = new Set();

    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);

      visit(src, (node) => {
        if (!isEl(node)) return;
        const name = jsxName(node);

        if (name === 'Tabs') {
          const card = enclosingCard(node);
          if (!card) return;
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: `<Tabs> inside <${jsxName(card)}>: the strip filters the card, so it belongs above it`,
          });
          return;
        }

        // A local wrapper whose root is a Tabs strip, mounted inside a card.
        if (!/^[A-Z]/.test(name) || CARD_SURFACES.has(name) || OVERLAY_SURFACES.has(name)) return;
        if (!enclosingCard(node)) return;
        const key = `${f}:${name}`;
        if (seen.has(key)) return;
        seen.add(key);
        const wrapperFile = resolveLocalImport(src, name);
        if (!wrapperFile) return;
        const tabsLine = exportedRootComponents(wrapperFile, new Set(['Tabs'])).get(name);
        if (!tabsLine) return;
        out.push({
          file: rel(wrapperFile),
          line: tabsLine,
          message: `<${name}> is a Tabs strip but is mounted inside a card at ${rel(f)}:${lineOf(src, node.getStart())}`,
        });
      });
    }
    return out;
  },
};

export default [noCardInCard, tabsAboveCard];
