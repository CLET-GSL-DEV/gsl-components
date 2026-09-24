// Filters on the left, search on the right, and never a register you cannot filter.
import { isEl } from '../lib/components.mjs';
import { ast, attrText, getAttr, jsxName, lineOf, read, rel, visit } from '../lib/core.mjs';

/** Verified in dist/index.css: `.clet-table--soft .clet-table__header-bar{flex-direction:row-reverse}` and `.clet-table--soft .clet-table__actions{margin-right:auto;margin-left:0}`, against a plain `.clet-table__header-bar{display:flex}` with `.clet-table__actions{margin-left:auto}`, so only the soft table puts the first-written child on the right and TableActions on the left. */
const REVERSING_VARIANT = 'soft';

/** The filter controls this repo composes into a table header. */
const FILTER_CONTROLS = new Set(['TableFilter', 'FilterDropdown', 'FilterDropdownField']);

/**
 * The search controls this repo composes into a table header.
 *
 * `RecordsSearchField` is here for the same reason `jsx-rules.mjs` already names it in the
 * `TableHeader` slot allowlist: it is this repo's controlled search field, standing in for
 * `TableSearch`, which the kit gives no way to clear from outside. Recognising a local filter
 * wrapper by convention while demanding the kit part by name on the search side was an asymmetry,
 * not a standard: it made this rule blind to a register with a complete header and reported it as
 * one with none.
 */
const SEARCH_CONTROLS = new Set(['TableSearch', 'RecordsSearchField']);

/** A name that is a filter control by convention, minus the empty state that shares the word. */
function isFilterControl(name) {
  if (FILTER_CONTROLS.has(name)) return true;
  return /Filter/.test(name) && !/^Filtered/.test(name);
}

/** A name that is the header's search control. */
function isSearchControl(name) {
  return SEARCH_CONTROLS.has(name);
}

/** The first descendant element named `name`, or null. */
function findElement(root, name) {
  let found = null;
  visit(root, (n) => {
    if (found || !isEl(n) || jsxName(n) !== name) return;
    found = n;
  });
  return found;
}

/** The first descendant element matching `predicate`, or null. */
function findElementBy(root, predicate) {
  let found = null;
  visit(root, (n) => {
    if (found || !isEl(n) || !predicate(jsxName(n))) return;
    found = n;
  });
  return found;
}

/**
 * The composed tables in a file, each with the header parts it carries.
 *
 * A `<Table>` holding no `<TableContent>` is skipped: it is a pagination shell, not a register.
 * `Search.tsx` renders one so `TablePagination` has a Table context to read while the results
 * themselves are cards, and there is nothing in it to search or filter. `table-page-has-filters`
 * already keys off `TableContent` for exactly this reason, so this is the two rules agreeing on
 * what a register is rather than each answering it differently.
 */
function tableCompositions(src) {
  const out = [];
  visit(src, (node) => {
    if (!isEl(node) || jsxName(node) !== 'Table') return;
    if (!findElement(node, 'TableContent')) return;
    const header = findElement(node, 'TableHeader');
    out.push({
      node,
      header,
      variant: attrText(getAttr(node, 'variant')),
      search: header ? findElementBy(header, isSearchControl) : null,
      actions: header ? findElement(header, 'TableActions') : null,
      filter: header ? findElementBy(header, isFilterControl) : null,
    });
  });
  return out;
}

/** One table header shape: the filters on the left, the search on the right. */
export const tableHeaderSearchRightFiltersLeft = {
  id: 'table-header-search-right-filters-left',
  doc: 'A table header puts the filters on the LEFT and the search on the RIGHT: <Table variant="soft"> with the search control written before <TableActions>, and both present.',
  why: 'The header bar is row-reverse only under variant="soft", so a default table renders search-left/filters-right and reversing the JSX order under soft moves them back the wrong way.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);
      const lines = read(f).split('\n');

      for (const table of tableCompositions(src)) {
        const line = lineOf(src, table.node.getStart());
        const reasons = [];

        if (!table.header) {
          reasons.push('no <TableHeader> at all');
        } else {
          if (!table.search) reasons.push('no <TableSearch> or <RecordsSearchField>');
          if (!table.filter) reasons.push('no filter control');
          if (table.variant !== REVERSING_VARIANT) {
            reasons.push(
              `<Table> is not variant="${REVERSING_VARIANT}", so the header bar runs left to right and the search sits on the LEFT with the filters pushed right`,
            );
          } else if (
            table.search &&
            table.actions &&
            table.actions.getStart() < table.search.getStart()
          ) {
            reasons.push(
              '<TableActions> is written before <TableSearch>, and the soft header is row-reverse, so that renders the filters on the RIGHT',
            );
          }
        }

        if (!reasons.length) continue;
        out.push({
          file: rel(f),
          line,
          message: `table header is not filters-left/search-right: ${reasons.join('; ')}`,
          snippet: lines[line - 1]?.trim(),
        });
      }
    }
    return out;
  },
};

/** A register you cannot narrow is a register you have to read all of. */
export const tablePageHasFilters = {
  id: 'table-page-has-filters',
  doc: 'Every file rendering a <TableContent> also renders a filter control (<TableFilter>, <FilterDropdown> or a local *Filter* field).',
  why: 'A search box narrows by one string. Without a filter the reader has no way to ask the register a question it can answer, and every register here is long enough to need one.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);
      const lines = read(f).split('\n');

      let firstTable = null;
      let hasFilter = false;
      visit(src, (node) => {
        if (!isEl(node)) return;
        const name = jsxName(node);
        if (name === 'TableContent' && !firstTable) firstTable = node;
        if (isFilterControl(name)) hasFilter = true;
      });

      if (!firstTable || hasFilter) continue;
      const line = lineOf(src, firstTable.getStart());
      out.push({
        file: rel(f),
        line,
        message: 'renders a <TableContent> with no filter control anywhere in the file',
        snippet: lines[line - 1]?.trim(),
      });
    }
    return out;
  },
};

export default [tableHeaderSearchRightFiltersLeft, tablePageHasFilters];
