// Two lists on one screen is a tab strip somebody did not build, and a status a reader picks from a
// dropdown is a tab strip somebody hid.
import { ast, jsxName, lineOf, read, rel, ts, visit } from '../lib/core.mjs';
import { isEl } from '../lib/components.mjs';

/** The kit's table body. One per screen area a reader is looking at. */
const TABLE = 'TableContent';

/** A page file, which is where this judgement belongs: a component rendering one table is fine wherever it lives. */
function isPage(file) {
  return /\/pages\/[A-Za-z0-9]+\.tsx$/.test(file);
}

/** A page OR a shared register view. Scoping the status rule to `/pages/` alone made it blind to five registers, because a table shared by a portfolio page and a project tab lives in `components/` and its filters go with it. The rule passed on those screens by seeing nothing, which is not the same as passing. */
function isRegisterSurface(file) {
  return isPage(file) || (/\/components\/[A-Za-z0-9]+\.tsx$/.test(file) && read(file).includes(TABLE));
}

function countRendered(src, name) {
  let total = 0;
  visit(src, (node) => {
    if (isEl(node) && jsxName(node) === name) total += 1;
  });
  return total;
}

const tablesShareOneTabStrip = {
  id: 'tables-share-one-tab-strip',
  doc: 'A page rendering more than one table puts each one behind a tab, never stacked down the screen.',
  why: 'Two tables stacked on one page is a tab strip nobody built: the reader scrolls past the first to find the second, neither has room, and the page has no single subject. Where the second table is genuinely part of the first screen it belongs behind a tab, which is what the pages that got this right already do.',
  check(files) {
    const out = [];
    for (const f of files.filter(isPage)) {
      const src = ast(f);
      const tables = countRendered(src, TABLE);
      if (tables < 2) continue;
      const panels = countRendered(src, 'TabsContent');
      if (panels >= tables) continue;
      out.push({
        file: rel(f),
        line: 1,
        message: `renders ${tables} tables behind ${panels} tab panels: put each table in its own <TabsContent> so the page has one subject at a time`,
      });
    }
    return out;
  },
};

/** A control that offers a fixed set of statuses to choose between. */
const STATUS_PICKER = /^(FilterDropdown|Combobox|Dropdown|Select)$/;

/** Reads like a status rather than a free-text or reference filter. */
const STATUS_NAME = /status|state|stage|phase/i;

const statusFilterIsTabs = {
  id: 'status-filter-is-tabs',
  doc: 'A list page filters by status with a tab strip, not a dropdown, when the statuses are few.',
  why: 'A status is the first cut a reader makes on a register, and hiding it inside a dropdown costs two clicks and shows no counts. As a tab strip it is one click and the reader can see how the work is distributed before touching anything. Past about five the strip stops fitting and a dropdown is right, so this reports and the author either converts it or silences it here with the count as the reason.',
  check(files) {
    const out = [];
    for (const f of files.filter(isRegisterSurface)) {
      const text = read(f);
      if (!text.includes(TABLE)) continue;
      if (text.includes('<Tabs')) continue;
      const src = ast(f);
      visit(src, (node) => {
        if (!isEl(node) || !STATUS_PICKER.test(jsxName(node) ?? '')) return;
        const attrs = node.attributes?.properties ?? [];
        const named = attrs.some((a) => {
          if (!ts.isJsxAttribute(a) || !a.initializer) return false;
          const key = a.name.getText();
          if (key !== 'name' && key !== 'label' && key !== 'aria-label') return false;
          return STATUS_NAME.test(a.initializer.getText());
        });
        if (!named) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart(src)),
          message:
            'a status filter on a list page reads better as a tab strip with counts than as a dropdown: convert it, or silence this line with the number of statuses as the reason if there are too many to fit',
        });
      });
    }
    return out;
  },
};

export default [tablesShareOneTabStrip, statusFilterIsTabs];
