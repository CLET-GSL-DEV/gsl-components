// Dialog asks a question with two answers. Modal takes information. The split is the content, not the component.
import { isEl } from '../lib/components.mjs';
import { ast, jsxName, lineOf, read, rel, visit } from '../lib/core.mjs';

/** Every kit component that collects information, read from the component list in dist/components. */
const INPUT_BEARING = new Set([
  'Input',
  'Textarea',
  'Combobox',
  'Dropdown',
  'Checkbox',
  'RadioGroup',
  'Switch',
  'UploadField',
  'DateSelector',
  'DateRangeSelector',
  'TimeSelector',
  'PhoneNumberInput',
  'OtpInput',
  'CountrySelector',
  'RoleSelect',
  'Field',
  'Form',
  'Stepper',
]);

/** The host elements that collect information without any kit component involved. */
const INPUT_HOSTS = new Set(['form', 'input', 'textarea', 'select']);

/** A local component that is itself a field, by the name this repo gives them. */
function isLocalField(name) {
  return /^[A-Z]/.test(name) && /(Field|Input|Picker|Select|Upload|Combobox)$/.test(name);
}

/** The first input-bearing thing in a subtree, or null. */
function findInput(node) {
  let found = null;
  visit(node, (n) => {
    if (found || !isEl(n)) return;
    const name = jsxName(n);
    if (INPUT_BEARING.has(name) || INPUT_HOSTS.has(name) || isLocalField(name)) found = { n, name };
  });
  return found;
}

/** How many Buttons a subtree renders. */
function countButtons(node) {
  let total = 0;
  visit(node, (n) => {
    if (isEl(n) && jsxName(n) === 'Button') total += 1;
  });
  return total;
}

/** A Dialog is a yes or no question. The moment it collects anything, it is a Modal. */
export const dialogOnlyForConfirmation = {
  id: 'dialog-only-for-confirmation',
  doc: 'A <Dialog> asks a question with two answers and no fields. Anything that takes information input is a <Modal>, with preventClose.',
  why: 'A Dialog is sized and dismissed like a notice, so a form inside one loses the modal geometry, the close guard and the submit affordances a form needs.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);
      const lines = read(f).split('\n');

      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'Dialog') return;
        const input = findInput(node);
        if (!input) return;
        const line = lineOf(src, node.getStart());
        out.push({
          file: rel(f),
          line,
          message: `<Dialog> containing <${input.name}> at line ${lineOf(src, input.n.getStart())}: a surface that takes input is a <Modal> with preventClose, and the Dialog* parts rename one to one onto Modal*`,
          snippet: lines[line - 1]?.trim(),
        });
      });
    }
    return out;
  },
};

/** The other direction, advisory: a modal that asks nothing is probably a dialog. */
export const modalWithoutInputIsADialog = {
  id: 'modal-without-input-is-a-dialog',
  severity: 'warn',
  doc: 'A <Modal> with no field at all and a two-button footer is probably a <Dialog>.',
  why: 'A modal is a defensible choice for a heavy confirmation, so this does not block: it flags the surfaces worth a second look, not surfaces that are wrong.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);
      const lines = read(f).split('\n');

      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'Modal') return;
        if (findInput(node)) return;
        const buttons = countButtons(node);
        if (buttons > 2) return;
        const line = lineOf(src, node.getStart());
        out.push({
          file: rel(f),
          line,
          message: `<Modal> with no field and ${buttons} ${buttons === 1 ? 'button' : 'buttons'}: if it is a yes or no question, <Dialog> is the component for it`,
          snippet: lines[line - 1]?.trim(),
        });
      });
    }
    return out;
  },
};

export default [dialogOnlyForConfirmation, modalWithoutInputIsADialog];
