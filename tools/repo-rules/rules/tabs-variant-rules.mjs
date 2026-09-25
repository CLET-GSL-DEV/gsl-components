// One pill strip per file: the first tab strip is the pill strip, a later strip is a line strip,
// and "default" is a value the kit ships that this app does not choose.
import { isEl } from '../lib/components.mjs';
import { ast, attrText, getAttr, jsxName, lineOf, read, rel, visit } from '../lib/core.mjs';

/** Read from node_modules/@rfdtech/components/dist/types/tabs.d.ts: `TabsVariant = "default" | "pill" | "line"`. */
const TABS_VARIANTS = new Set(['default', 'pill', 'line']);

const PRIMARY = 'pill';
const SECONDARY = 'line';

/** The allowed variants for a strip, by position: the first strip is the pill strip, a later one may also be a pill as a peer. */
const allowedFor = (first) => (first ? [PRIMARY] : [PRIMARY, SECONDARY]);

/** The rule this repo standardised on, checked against the installed union so a typo cannot pass as a choice. */
export const tabsVariantPill = {
  id: 'tabs-variant-pill',
  doc: 'The first <Tabs> in a file carries variant="pill". A later strip carries variant="line", so it reads as a level below the pill strip, or variant="pill" as a peer. "default" is a real value but not this app\'s; "panel" is not in TabsVariant at all.',
  why: 'One tab shape across the app: one pill strip per file, and a second level uses line so the two altitudes stay readable. A variant outside the union silently falls back to the default.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);
      const lines = read(f).split('\n');

      const strips = [];
      visit(src, (node) => {
        // Scoped to <Tabs> by the AST, not by grepping `variant=`: TableContent legitimately takes variant="panel" and sits in these same files.
        if (!isEl(node) || jsxName(node) !== 'Tabs') return;
        strips.push(node);
      });
      strips.sort((a, b) => a.getStart() - b.getStart());

      strips.forEach((node, index) => {
        const first = index === 0;
        // Which case was hit, in the rule's own words: the primary strip, or a level below it.
        const expectation = first
          ? `the primary tab strip carries variant="${PRIMARY}"`
          : `a second tab strip carries variant="${SECONDARY}", so it reads as a level below the pill strip above it`;
        const allowed = allowedFor(first);
        const line = lineOf(src, node.getStart());
        const snippet = lines[line - 1]?.trim();

        const attr = getAttr(node, 'variant');
        if (!attr) {
          out.push({
            file: rel(f),
            line,
            message: `<Tabs> has no variant, so it renders the "default" strip: ${expectation}`,
            snippet,
          });
          return;
        }

        const value = attrText(attr);
        if (allowed.includes(value)) return;

        const attrLine = lineOf(src, attr.getStart());
        if (value === null) {
          out.push({
            file: rel(f),
            line: attrLine,
            message: `<Tabs variant> is computed, so it can render a strip that is not ${allowed.map((v) => `"${v}"`).join(' or ')}: pass the literal. ${expectation.charAt(0).toUpperCase()}${expectation.slice(1)}`,
            snippet,
          });
          return;
        }

        const unreal = !TABS_VARIANTS.has(value);
        out.push({
          file: rel(f),
          line: attrLine,
          message: unreal
            ? `variant="${value}" is not a TabsVariant at all (the union is ${[...TABS_VARIANTS].map((v) => `"${v}"`).join(' | ')}), so the strip falls back to the default: ${expectation}`
            : first
              ? `${expectation}, not variant="${value}"`
              : `variant="${value}" is not this app's tab strip: ${expectation}`,
          snippet,
        });
      });
    }
    return out;
  },
};

export default [tabsVariantPill];
