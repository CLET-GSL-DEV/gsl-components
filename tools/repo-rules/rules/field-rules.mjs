// FieldError is a verdict, not a caption.
//
// It renders in the error tone, so a reader takes anything inside it as something they got wrong.
// Rendered unconditionally it says a form is broken before the form has been touched, which is how
// two ordinary helper sentences ended up in error red on the availability search.
import { ast, jsxName, lineOf, rel, ts, visit } from '../lib/core.mjs';

const isEl = (n) => ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n);

/** True when some ancestor gates this node on a value, so it only renders when there is an error. */
function guardedByAncestor(node) {
  for (let n = node.parent; n; n = n.parent) {
    if (ts.isConditionalExpression(n)) return true;
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return true;
    // A guard lives inside the same expression container; past the enclosing component there is none.
    if (ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n)) return false;
  }
  return false;
}

/**
 * True when the children are an expression rather than fixed words. `{errors.name?.message}` is the
 * idiomatic form and it renders nothing when there is no error, so it is already conditional: the
 * guard is in the value, not in an ancestor. Only fixed words are unconditional by construction.
 */
function guardedByItsOwnChildren(node) {
  // `<FieldError />` takes its message from the surrounding Field context and renders nothing when
  // there is no error, so it is conditional by construction.
  if (ts.isJsxSelfClosingElement(node)) return true;
  if (!ts.isJsxElement(node)) return false;
  return node.children.some((child) => ts.isJsxExpression(child) && child.expression);
}

export const fieldErrorNeedsAPredicate = {
  id: 'field-error-needs-a-predicate',
  doc: 'A <FieldError> is conditional: gated by an ancestor, or holding an error value rather than fixed words.',
  why: 'It carries the error tone, so an unconditional one tells the reader they have made a mistake before they have entered anything. Guidance that is always true is a description and belongs in <FieldDescription>.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);
      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'FieldError') return;
        if (guardedByAncestor(node) || guardedByItsOwnChildren(node)) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: '<FieldError> renders unconditionally, so it reads as a validation failure. Gate it on the error, or use <FieldDescription> if it is guidance',
        });
      });
    }
    return out;
  },
};

export default [fieldErrorNeedsAPredicate];
