// A KPI row is read as one row, so its captions are one line each.
//
// The metric cards sit side by side and the eye reads across them: label, big number, caption. A
// caption that wraps pushes its own card taller than its neighbours, the numbers stop sharing a
// baseline, and a row that was a single glance becomes four ragged boxes. The kit clamps at two
// lines, so nothing overflows; it just quietly misaligns.
//
// MEASURED, not guessed: at the 222px caption width this app renders at 4 columns, in the app's
// own font and type ramp, prose wraps at 44 characters. 43 is the last length that stays on one
// line, so the cap is 42 and the spare character absorbs a caption full of wide glyphs.
//
// When one line genuinely cannot carry the point, the caption keeps the short version and the long
// one moves to `hint`, which the grid renders as the card's hover text. That is the fix, not a
// suppression.
import { isEl } from '../lib/components.mjs';
import { ast, attrText, getAttr, jsxName, lineOf, rel, ts, visit } from '../lib/core.mjs';

/** Measured in the browser against the rendered card: 44 wraps, 43 fits, 42 leaves margin. */
const MAX = 42;

/** The string value of an object-literal property, or null when it is not a plain string. */
function propString(node, name) {
  const prop = node.properties?.find(
    (p) => ts.isPropertyAssignment(p) && p.name?.getText().replace(/['"]/g, '') === name,
  );
  if (!prop) return null;
  const value = prop.initializer;
  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
    return { text: value.text, node: prop };
  }
  return null;
}

function hasProp(node, name) {
  return Boolean(
    node.properties?.some(
      (p) => ts.isPropertyAssignment(p) && p.name?.getText().replace(/['"]/g, '') === name,
    ),
  );
}

/**
 * Every metric caption is one line.
 *
 * Catches both shapes this repo writes: a `<MetricCard description="…">` in JSX, and the item and
 * definition objects a metric grid is built from, which are recognised by carrying a `label` and a
 * `description` beside a `value` or a `key`.
 */
export const metricCaptionOneLine = {
  id: 'metric-caption-one-line',
  doc: `A metric card caption is at most ${MAX} characters, so it never wraps to a second line.`,
  why: 'A wrapped caption makes its card taller than its neighbours and breaks the row baseline.',
  check(files) {
    const out = [];
    const report = (file, src, node, text, where) => {
      if (text.length <= MAX) return;
      out.push({
        file: rel(file),
        line: lineOf(src, node.getStart()),
        message: `${where} caption is ${text.length} characters, ${text.length - MAX} over the one-line budget: shorten it, or move the detail to \`hint\``,
        snippet: text,
      });
    };

    for (const f of files) {
      if (!/\.tsx?$/.test(f) || /\.test\.tsx?$/.test(f)) continue;
      const src = ast(f);

      visit(src, (node) => {
        if (isEl(node) && jsxName(node) === 'MetricCard') {
          const description = getAttr(node, 'description');
          const text = attrText(description);
          if (description && text) report(f, src, description, text, '<MetricCard>');
          return;
        }

        if (!ts.isObjectLiteralExpression(node)) return;
        // A metric item or definition: a caption under a label, beside a value or a key.
        if (!hasProp(node, 'label')) return;
        if (!hasProp(node, 'value') && !hasProp(node, 'key')) return;
        const description = propString(node, 'description');
        if (!description) return;
        report(f, src, description.node, description.text, 'metric');
      });
    }
    return out;
  },
};

export default [metricCaptionOneLine];
