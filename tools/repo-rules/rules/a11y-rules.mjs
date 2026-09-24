// Accessibility defects that a screenshot cannot show and a review reliably misses.
//
// Every rule here came out of a real finding. The September 2026 audit of the shared component
// library (CLET_SHARED_COMPONENTS_ACCESSIBILITY, WCAG 2.1 AA under Act 1170 s.47) raised seven,
// and working them exposed three more of the same shape that the audit had not reached. The
// pattern in all of them is the same: the markup renders correctly and announces wrongly, so the
// only thing that catches it is a check that reads the tree rather than the pixels.
//
// These run against app code. The library enforces the same contracts on itself with tests
// (contrast-tokens.test.ts, dialog-a11y.test.tsx, accessible-name.test-d.ts), because a token
// value and a TypeScript union are not JSX and an AST rule cannot see them.
import { ast, getAttr, jsxName, lineOf, read, rel, ts, visit } from '../lib/core.mjs';

/** Elements that are already controls. Nesting any of these inside another is the defect. */
const NATIVE_INTERACTIVE = new Set(['button', 'a', 'input', 'select', 'textarea', 'summary']);

/** ARIA roles that make a non-control behave like one. */
const INTERACTIVE_ROLES = new Set([
  'button',
  'link',
  'checkbox',
  'radio',
  'menuitem',
  'option',
  'switch',
  'tab',
]);

/** Kit components that render a control of their own, so they count as interactive descendants. */
const CONTROL_COMPONENTS = new Set([
  'Button',
  'IconButton',
  'Link',
  'Checkbox',
  'Switch',
  'Dropdown',
  'Combobox',
  'DatePicker',
  'DateSelector',
  'DateRangeSelector',
  'TimeSelector',
  'UploadField',
  'Input',
  'Textarea',
]);

const isEl = (n) => ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n);

const attrValue = (node, name) => {
  const attr = getAttr(node, name);
  if (!attr) return undefined;
  if (!attr.initializer) return true;
  if (ts.isStringLiteral(attr.initializer)) return attr.initializer.text;
  if (ts.isJsxExpression(attr.initializer)) {
    const e = attr.initializer.expression;
    if (!e) return undefined;
    if (ts.isStringLiteral(e)) return e.text;
    if (ts.isNoSubstitutionTemplateLiteral(e)) return e.text;
    return '<computed>';
  }
  return undefined;
};

/** Is this element a control, natively or by role? */
function isInteractive(node) {
  const name = jsxName(node);
  if (NATIVE_INTERACTIVE.has(name)) return true;
  if (CONTROL_COMPONENTS.has(name)) return true;
  const role = attrValue(node, 'role');
  if (typeof role === 'string' && INTERACTIVE_ROLES.has(role)) return true;
  return false;
}

/** Every JSX element strictly inside `node`. */
function descendants(node) {
  const out = [];
  visit(node, (child) => {
    if (child !== node && isEl(child)) out.push(child);
  });
  return out;
}

const sourceFiles = (files) =>
  files.filter((f) => /\.tsx$/.test(f) && !/\.test\.tsx$/.test(f));

/**
 * DS-07 and the two siblings found alongside it: the upload dropzone was role="button" +
 * tabIndex wrapping a file input, the Combobox clear icon was a role="button" SVG inside the
 * trigger button, and a bulk-import column card was a role="button" div wrapping a real button.
 */
export const noNestedInteractive = {
  id: 'no-nested-interactive',
  doc: 'A control never contains another control. No <button> inside a <button>, no focusable element inside a role="button", no <a> wrapping a <Button>.',
  why: 'A screen reader announces one control and the user finds two, or finds neither: the inner control is unreachable by keyboard and the outer one announces the inner one\'s text as its own name. It renders fine, which is why it survives review.',
  check(files) {
    const out = [];
    for (const f of sourceFiles(files)) {
      const src = ast(f);
      const lines = read(f).split('\n');
      visit(src, (node) => {
        if (!isEl(node) || !isInteractive(node)) return;
        for (const child of descendants(node)) {
          if (!isInteractive(child)) continue;
          const line = lineOf(src, child.getStart());
          out.push({
            file: rel(f),
            line,
            message: `<${jsxName(child)}> is a control nested inside <${jsxName(node)}>, which is also a control: make them siblings, or make the outer one a plain container`,
            snippet: lines[line - 1]?.trim(),
          });
        }
      });
    }
    return out;
  },
};

/**
 * The half of DS-07 that survives even when nothing is nested: a div dressed as a button.
 */
export const noFauxButton = {
  id: 'no-faux-button',
  doc: 'role="button" and tabIndex do not belong on a <div> or a <span>. Use a real <button type="button">, or the kit\'s Button.',
  why: 'A faux button has to re-implement Enter, Space, disabled, focus order and the announced role, and it never re-implements all five. A real <button> ships them.',
  check(files) {
    const out = [];
    for (const f of sourceFiles(files)) {
      const src = ast(f);
      const lines = read(f).split('\n');
      visit(src, (node) => {
        if (!isEl(node)) return;
        const name = jsxName(node);
        // Only plain host elements: a kit component named Button is not a div.
        if (!/^[a-z]/.test(name) || NATIVE_INTERACTIVE.has(name)) return;
        const role = attrValue(node, 'role');
        const fauxRole = typeof role === 'string' && INTERACTIVE_ROLES.has(role);
        // tabIndex={-1} is the opposite defect: it REMOVES a container from the tab order, which
        // is exactly right for a roving-tabindex listbox or a programmatic focus target. Only a
        // non-negative value puts a container in the tab order as though it were a control.
        const tabIndexAttr = getAttr(node, 'tabIndex');
        const tabIndexValue = tabIndexAttr ? attrValue(node, 'tabIndex') : undefined;
        const entersTabOrder =
          tabIndexAttr !== undefined &&
          !(typeof tabIndexValue === 'string' && tabIndexValue.trim().startsWith('-')) &&
          !/tabIndex=\{\s*-/.test(tabIndexAttr.getText());
        if (!fauxRole && !entersTabOrder) return;
        const line = lineOf(src, node.getStart());
        const what = fauxRole ? `role="${role}"` : 'tabIndex';
        out.push({
          file: rel(f),
          line,
          message: `<${name}> carries ${what}, so it is a control written as a container: use <button type="button"> or the kit's <Button>`,
          snippet: lines[line - 1]?.trim(),
        });
      });
    }
    return out;
  },
};

/**
 * DS-03: a Dropdown whose only text was "10 per page" announced its state and never its purpose.
 * The library now makes the name a type error; this catches the same mistake on anything the
 * types do not cover, and catches double-naming, which the types cannot.
 */
export const pickerNeedsAccessibleName = {
  id: 'picker-needs-accessible-name',
  doc: 'Every Dropdown, Combobox and UploadField carries exactly one of aria-label or aria-labelledby, with a literal value.',
  why: 'These controls display their selected VALUE, never their purpose, so with no name a screen reader says "10 per page, button" and the user never learns which field they are in. Two names is just as bad: aria-labelledby silently wins and the aria-label is dead text.',
  check(files) {
    const PICKERS = new Set(['Dropdown', 'Combobox', 'UploadField']);
    const out = [];
    for (const f of sourceFiles(files)) {
      const src = ast(f);
      const lines = read(f).split('\n');
      visit(src, (node) => {
        if (!isEl(node) || !PICKERS.has(jsxName(node))) return;
        const label = attrValue(node, 'aria-label');
        const labelledby = attrValue(node, 'aria-labelledby');
        const line = lineOf(src, node.getStart());
        const snippet = lines[line - 1]?.trim();
        if (label === undefined && labelledby === undefined) {
          out.push({
            file: rel(f),
            line,
            message: `<${jsxName(node)}> has no accessible name: add aria-label, or aria-labelledby pointing at its visible label`,
            snippet,
          });
          return;
        }
        if (label !== undefined && labelledby !== undefined) {
          out.push({
            file: rel(f),
            line,
            message: `<${jsxName(node)}> carries both aria-label and aria-labelledby: aria-labelledby wins, so the aria-label is never read. Keep one`,
            snippet,
          });
          return;
        }
        const value = label ?? labelledby;
        if (value === true || value === '') {
          out.push({
            file: rel(f),
            line,
            message: `<${jsxName(node)}> has an empty accessible name, which announces the same as having none`,
            snippet,
          });
        }
      });
    }
    return out;
  },
};

/**
 * DS-05: the header search advertised a listbox via aria-controls that was only mounted once you
 * typed, so every page load shipped a reference to an id that did not exist.
 */
export const ariaControlsTargetExists = {
  id: 'aria-controls-target-exists',
  doc: 'An aria-controls / aria-labelledby / aria-describedby id resolves to an id= in the same file.',
  why: 'A dangling IDREF is silently dropped: the relationship the attribute claims simply does not exist at runtime, and nothing renders differently, so it survives every visual check. The usual cause is the target being conditionally mounted.',
  check(files) {
    const IDREF_ATTRS = ['aria-controls', 'aria-labelledby', 'aria-describedby'];
    const out = [];
    for (const f of sourceFiles(files)) {
      const src = ast(f);
      const lines = read(f).split('\n');

      // Every literal id rendered anywhere in the file.
      const declared = new Set();
      visit(src, (node) => {
        if (!isEl(node)) return;
        const id = attrValue(node, 'id');
        if (typeof id === 'string' && id && id !== '<computed>') declared.add(id);
      });

      visit(src, (node) => {
        if (!isEl(node)) return;
        for (const attrName of IDREF_ATTRS) {
          const value = attrValue(node, attrName);
          // Computed ids are the normal case (useId), and cannot be resolved statically.
          if (typeof value !== 'string' || value === '<computed>' || !value) continue;
          for (const id of value.split(/\s+/).filter(Boolean)) {
            if (declared.has(id)) continue;
            const line = lineOf(src, node.getStart());
            out.push({
              file: rel(f),
              line,
              message: `${attrName}="${id}" names an id that is not rendered in this file, so the relationship is dropped at runtime`,
              snippet: lines[line - 1]?.trim(),
            });
          }
        }
      });
    }
    return out;
  },
};

/**
 * DS-04: the Stepper set aria-current="step" on the <li>, while tab focus landed on the <button>
 * inside it, so the control the user actually reached announced nothing.
 */
export const ariaCurrentOnControl = {
  id: 'aria-current-on-control',
  doc: 'aria-current sits on the element that takes focus. If a wrapper carries it and holds a control, the control carries it instead.',
  why: 'A screen reader announces the focused element. State parked on a wrapper the user never lands on is state nobody hears.',
  check(files) {
    const out = [];
    for (const f of sourceFiles(files)) {
      const src = ast(f);
      const lines = read(f).split('\n');
      visit(src, (node) => {
        if (!isEl(node)) return;
        if (getAttr(node, 'aria-current') === undefined) return;
        if (isInteractive(node)) return;
        const inner = descendants(node).filter(isInteractive);
        if (!inner.length) return;
        if (inner.some((child) => getAttr(child, 'aria-current') !== undefined)) return;
        const line = lineOf(src, node.getStart());
        out.push({
          file: rel(f),
          line,
          message: `aria-current is on <${jsxName(node)}>, but <${jsxName(inner[0])}> inside it is what takes focus: move it onto the control`,
          snippet: lines[line - 1]?.trim(),
        });
      });
    }
    return out;
  },
};

export default [
  noNestedInteractive,
  noFauxButton,
  pickerNeedsAccessibleName,
  ariaControlsTargetExists,
  ariaCurrentOnControl,
];
