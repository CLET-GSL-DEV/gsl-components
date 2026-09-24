// A table cell shows a date a person can read, never the string the fixture stored.
import { isEl } from '../lib/components.mjs';
import { ast, jsxName, lineOf, read, rel, ts, visit } from '../lib/core.mjs';

/** A field name that holds a date or a timestamp, by the camelCase convention the fixtures and the API use. */
const DATE_FIELD = /[a-z0-9](?:Date|At|Timestamp)$|^(?:date|timestamp|deadline)$/;

/** The cell component that exists for exactly this, so a value flowing into it is already handled. */
const DATE_CELL = 'DateCell';

/** Every component that turns a date value into something a person reads. `DateDisplay` is the base layer's, `DateCell` is the table cell built on top of it, and a rule naming only one of them fires on a repo that uses the other and calls correct code a defect. */
const DATE_SURFACES = new Set([DATE_CELL, 'DateDisplay']);

/** A literal ISO datetime, which reads as machine output wherever it is rendered. */
const ISO_LITERAL = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

/** The column definitions in a file: an object literal carrying `id` and `header` plus a renderer. */
function columnRenderers(src) {
  const out = [];
  visit(src, (node) => {
    if (!ts.isObjectLiteralExpression(node)) return;
    const named = (name) =>
      node.properties.find(
        (p) => ts.isPropertyAssignment(p) && p.name?.getText().replace(/['"]/g, '') === name,
      );
    if (!named('id') || !named('header')) return;
    for (const key of ['cell', 'accessorFn']) {
      const prop = named(key);
      if (prop) out.push(prop.initializer);
    }
  });
  return out;
}

/** Comparisons that make a date a test rather than something on screen. */
const COMPARISONS = new Set([
  ts.SyntaxKind.EqualsEqualsToken,
  ts.SyntaxKind.EqualsEqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsToken,
  ts.SyntaxKind.ExclamationEqualsEqualsToken,
  ts.SyntaxKind.LessThanToken,
  ts.SyntaxKind.LessThanEqualsToken,
  ts.SyntaxKind.GreaterThanToken,
  ts.SyntaxKind.GreaterThanEqualsToken,
]);

/** Whether the value is only ever tested, never rendered. `??` and `||` are excluded: their left side IS the value. */
function usedAsCondition(node) {
  const p = node.parent;
  if (!p) return false;
  if (ts.isBinaryExpression(p)) {
    if (COMPARISONS.has(p.operatorToken.kind)) return true;
    if (p.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && p.left === node) {
      return true;
    }
  }
  if (ts.isPrefixUnaryExpression(p) && p.operator === ts.SyntaxKind.ExclamationToken) return true;
  if (ts.isConditionalExpression(p) && p.condition === node) return true;
  return false;
}

/** Whether a value is consumed rather than printed: any call formats it, and DateCell renders it properly. */
function alreadyHandled(node, root) {
  let p = node.parent;
  while (p && p !== root.parent) {
    // Any enclosing call consumes the raw value rather than printing it, local helpers included, which is the conservative reading.
    if (ts.isCallExpression(p)) return true;
    if (isEl(p) && DATE_SURFACES.has(jsxName(p))) return true;
    p = p.parent;
  }
  return false;
}

/** A date value rendered straight into a cell, with no formatting between the fixture and the screen. */
export const noRawIsoInACell = {
  id: 'no-raw-iso-in-a-cell',
  doc: `A table cell never renders a raw ISO datetime: a date value goes through this repo's date surface (${[...DATE_SURFACES].map((n) => `<${n}>`).join(' or ')}) or a formatter.`,
  why: '"2026-05-04T11:00:00.000Z" in a column is the fixture leaking onto the screen, and it is unreadable next to the columns that were formatted.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!/\.tsx?$/.test(f) || /\.test\.tsx?$/.test(f)) continue;
      const src = ast(f);
      const lines = read(f).split('\n');
      const seen = new Set();

      const report = (node, message) => {
        const line = lineOf(src, node.getStart());
        const key = `${line}:${message}`;
        if (seen.has(key)) return;
        seen.add(key);
        out.push({ file: rel(f), line, message, snippet: lines[line - 1]?.trim() });
      };

      for (const renderer of columnRenderers(src)) {
        visit(renderer, (node) => {
          if (ts.isStringLiteral(node) && ISO_LITERAL.test(node.text)) {
            report(
              node,
              `a literal ISO datetime in a column renderer: render it through ${[...DATE_SURFACES].map((n) => `<${n}>`).join(' or ')}`,
            );
            return;
          }
          if (!ts.isPropertyAccessExpression(node)) return;
          if (!DATE_FIELD.test(node.name.text)) return;
          if (usedAsCondition(node) || alreadyHandled(node, renderer)) return;
          report(
            node,
            `\`${node.getText()}\` is rendered raw in a cell, so the column prints the stored ISO string: pass it to ${[...DATE_SURFACES].map((n) => `<${n}>`).join(' or ')}`,
          );
        });
      }
    }
    return out;
  },
};

export default [noRawIsoInACell];
