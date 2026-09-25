// A control that fires a request tells the user it is working, and stops them firing it twice.
import { ast, getAttr, jsxName, lineOf, read, rel, ts, visit } from '../lib/core.mjs';

/** `isPending` on a mutation from the endpoint factory, however the caller named it. */
const PENDING = /\b(\w*[Mm]utation)\.isPending\b/g;

/**
 * A button wired to a mutation carries `loading`, not just `disabled`.
 *
 * `disabled={m.isPending}` greys the control and stops the double submit, but the screen then
 * says nothing at all for the length of the request: no spinner, no label change, nothing to
 * distinguish a slow save from a dead button. `Button` ships `loading` and renders its own
 * spinner, so the fix is one prop.
 */
export const buttonLoadingState = {
  id: 'button-loading-state',
  doc: 'A Button gated on a mutation`s isPending sets `loading`, not only `disabled`.',
  why: 'disabled alone greys the control and reports nothing for the length of the request.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      if (/\.test\.tsx$/.test(f)) continue;
      const text = read(f);
      if (!/isPending/.test(text)) continue;
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) return;
        if (jsxName(node) !== 'Button') return;

        const disabled = getAttr(node, 'disabled');
        if (!disabled?.initializer) return;
        const disabledText = disabled.initializer.getText();
        if (!/isPending/.test(disabledText)) return;

        // `loading` present in any form satisfies it; the value is the caller's business.
        if (getAttr(node, 'loading')) return;

        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: 'Button disabled on isPending but has no `loading` prop',
        });
      });
    }
    return out;
  },
};

/**
 * A free-text box is never the fallback when a picker has nothing to offer.
 *
 * `departments.length > 0 ? <Dropdown/> : <Input placeholder="directorate code"/>` looks
 * defensive and is the opposite: the one moment the reference list is unavailable is the moment a
 * typed id is most likely to be wrong, and nothing downstream can tell it was typed. A disabled
 * picker that says why is the honest answer.
 */
export const noTypedIdFallback = {
  id: 'no-typed-id-fallback',
  doc: 'A picker with an empty list degrades to a disabled picker, never a free-text id box.',
  why: 'A typed id is least trustworthy exactly when the reference list could not be loaded.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      if (/\.test\.tsx$/.test(f)) continue;
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isConditionalExpression(node)) return;
        const whenTrue = node.whenTrue.getText();
        const whenFalse = node.whenFalse.getText();
        // A picker on one arm and a bare Input on the other.
        const picks = /<(Dropdown|Combobox|SelectField|ComboboxField)\b/.test(whenTrue);
        const types = /<Input\b/.test(whenFalse);
        if (!picks || !types) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: 'picker falls back to a free-text Input, use a disabled picker with a reason',
        });
      });
    }
    return out;
  },
};

/**
 * A field holding a set of values is a multi-select, not a comma-separated string.
 *
 * `records.ingest, records.read` in a text box makes the user responsible for the separator, the
 * whitespace and the spelling, and gives them nothing to remove one entry with.
 */
export const noCommaSeparatedList = {
  id: 'no-comma-separated-list',
  doc: 'A multi-value field is a multiple Combobox, never a comma-separated text Input.',
  why: 'A text box makes the user own the separator and gives them no way to remove one entry.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      if (/\.test\.tsx$/.test(f)) continue;
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) return;
        if (jsxName(node) !== 'Input') return;
        const placeholder = getAttr(node, 'placeholder');
        const text =
          placeholder?.initializer && ts.isStringLiteral(placeholder.initializer)
            ? placeholder.initializer.text
            : '';
        // A placeholder that demonstrates its own separator is the tell.
        if (!/\w,\s*\w/.test(text)) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: `Input placeholder "${text}" is a comma-separated list, use a multiple Combobox`,
        });
      });
    }
    return out;
  },
};

/**
 * A list that had to be fetched is picked from a Combobox, never a Dropdown.
 *
 * `Dropdown` has no search. A fetched list has no ceiling: record types, directorates, users and
 * taxonomy versions all grow, and the control that was fine against four seeded rows is unusable
 * against two hundred real ones. `Combobox` is the same shape plus a filter box.
 *
 * The existing `fetched-list-is-combobox` only ever inspected `kind: 'select'` config objects,
 * which this repo does not use, so it reported nothing while every real site went unchecked.
 */
export const fetchedDropdownIsCombobox = {
  id: 'fetched-dropdown-is-combobox',
  doc: 'ui-patterns: if the list was fetched, it is a Combobox. Dropdown has no search.',
  why: 'A fetched list has no ceiling, and Dropdown cannot be searched once it grows.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      if (/\.test\.tsx$/.test(f)) continue;
      const text = read(f);
      const src = ast(f);

      // Every local name that carries, or is derived from, a query result.
      const fetched = new Set();
      let grew = true;
      while (grew) {
        grew = false;
        visit(src, (node) => {
          if (!ts.isVariableDeclaration(node) || !node.initializer || !node.name) return;
          const name = node.name.getText();
          if (fetched.has(name)) return;
          const init = node.initializer.getText();
          const isQuery =
            /use(Query|Mutation)Endpoint\(|usePagedRows\(|unwrapList\(|\.data\b/.test(init) ||
            [...fetched].some((n) => new RegExp(`\\b${n}\\b`).test(init));
          if (isQuery) {
            fetched.add(name);
            grew = true;
          }
        });
      }
      if (!fetched.size) continue;

      visit(src, (node) => {
        if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) return;
        const name = jsxName(node);
        // `FilterDropdownField` keeps its historical name but renders a searchable `Combobox`,
        // so it already satisfies this rule at every call site.
        if (name !== 'Dropdown' && name !== 'SelectField') return;
        const opts = getAttr(node, 'options');
        if (!opts?.initializer) return;
        const optText = opts.initializer.getText();
        const source = [...fetched].find((n) => new RegExp(`\\b${n}\\b`).test(optText));
        if (!source) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: `<${name}> options come from fetched \`${source}\`, use a Combobox`,
        });
      });
    }
    return out;
  },
};

/**
 * A table keeps its own chrome when it is empty. It is never swapped for a sentence.
 *
 * `QueryState isEmpty` replaces everything inside it, so an empty register loses its column
 * headers, its filters, its search box and its pagination, and the screen becomes a paragraph
 * floating in a card. The reader cannot tell an empty result from a broken page, and cannot clear
 * the filter that emptied it because the control went with it.
 *
 * `TableContent` already renders an empty state in place, under the real headers, via `emptyText`
 * and `emptyIcon`. Use those and let the table render.
 */
export const tableKeepsItsChrome = {
  id: 'table-keeps-its-chrome',
  doc: 'Never wrap a Table in QueryState isEmpty. Use TableContent emptyText so the table renders.',
  why: 'Swapping the table for a sentence takes the filters and pagination away with it.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      if (/\.test\.tsx$/.test(f)) continue;
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isJsxElement(node) || jsxName(node) !== 'QueryState') return;
        const isEmpty = getAttr(node, 'isEmpty');
        if (!isEmpty?.initializer) return;

        // `isEmpty={rows.length === 0}` says a list came back empty, which is the table's own
        // business. `isEmpty={!record}` says the reference resolved to nothing, which is a
        // not-found for the whole page. The second is correct where it stands, and any table
        // further down it is incidental, so only a length test is a candidate here.
        if (!/\.length\b/.test(isEmpty.initializer.getText())) return;
        // `TableContent`, not `Table`. `TableContent` is the part that owns `emptyText`, so it is
        // the only shape where the fix this rule names actually exists. A bare `Table` used as a
        // pagination shell around a list of cards has no empty slot to move the message into, and
        // flagging it would be telling the author to use a prop that is not there.
        let hasTableContent = false;
        visit(node, (child) => {
          if (
            (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) &&
            jsxName(child) === 'TableContent'
          ) {
            hasTableContent = true;
          }
        });
        if (!hasTableContent) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: 'QueryState isEmpty hides a Table, use TableContent emptyText instead',
        });
      });
    }
    return out;
  },
};

export default [
  buttonLoadingState,
  noTypedIdFallback,
  noCommaSeparatedList,
  fetchedDropdownIsCombobox,
  tableKeepsItsChrome,
];
