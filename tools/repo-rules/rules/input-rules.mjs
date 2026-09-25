// Input and loading-state rules for the single-app shape.
//
// `no-native-controls` (jsx-rules) already bans the raw elements. These cover the next step:
// the right KIT control for the kind of value, and one loading treatment rather than several.
import {
  COMBOBOX_SURFACES,
  declaresProp,
  exportedComponentsRendering,
  isEl,
  resolveLocalImport,
} from '../lib/components.mjs';
import { ast, attrText, getAttr, jsxName, lineOf, read, rel, ts, visit } from '../lib/core.mjs';

/** A field name that names a row in another table rather than free text. */
const REFERENCE_SUFFIX = /(_id|_ref|_code|_reference)$/;

/** Controls that let a value be typed rather than picked. */
const FREE_TEXT_CONTROLS = new Set(['TextField', 'Input']);

/**
 * A value another system owns is PICKED, never typed.
 *
 * A typo in a free-text `*_id` points the record at nothing, and nothing fails until someone
 * opens it. `Combobox`/`ComboboxField` searches the real list, so only a real id can be chosen.
 */
export const idFieldIsPicker = {
  id: 'id-field-is-picker',
  doc: 'A *_id / *_ref / *_code field is a Combobox or Dropdown, never a TextField.',
  why: 'A typo in a typed reference points the record at nothing and fails silently later.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (/\.test\.tsx?$/.test(f)) continue;
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) return;
        const name = jsxName(node);
        if (!FREE_TEXT_CONTROLS.has(name)) return;
        const fieldName = attrText(getAttr(node, 'name'));
        if (!fieldName || !REFERENCE_SUFFIX.test(fieldName)) return;
        // A read-only mirror of a value the RMS generated is display, not entry.
        if (getAttr(node, 'disabled') || getAttr(node, 'readOnly')) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: `<${name} name="${fieldName}"> is a typed reference, use a Combobox`,
        });
      });
    }
    return out;
  },
};

/**
 * One loading treatment: `PageSkeleton` from `@core/ui`, or a kit `loading` prop.
 *
 * A page that invents its own spinner or a bare "Loading…" reads as a different app mid-wait,
 * and none of them announce themselves to a screen reader the way `PageSkeleton` does.
 */
export const loaderIsDotsLoader = {
  id: 'loader-is-dotsloader',
  doc: 'Waits render PageSkeleton or a kit loading prop, never bare text or a raw spinner.',
  why: 'A hand-rolled wait looks like a different app and announces nothing to a screen reader.',
  check(files) {
    const out = [];
    for (const f of files) {
      // The shared loader itself is the one place the markup is allowed to live. Both names are
      // listed because a repo ships one or the other: the starter has only `PageSkeleton`, while a
      // repo that still renders `DotsLoader` would otherwise have the rule report the loader it
      // exists to protect.
      if (/core\/ui\/(DotsLoader|PageSkeleton)\.tsx$/.test(f)) continue;
      if (/\.test\.tsx?$/.test(f)) continue;
      const src = ast(f);
      visit(src, (node) => {
        // A bare `Loading…` / `Loading...` as element text.
        if (ts.isJsxText(node)) {
          const text = node.getText().trim();
          if (/^Loading[.…\s]*$/i.test(text) && text.length) {
            out.push({
              file: rel(f),
              line: lineOf(src, node.getStart()),
              message: 'bare "Loading" text, use PageSkeleton or a kit loading prop',
            });
          }
          return;
        }
        // A hand-rolled spinner element.
        if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
          const cls = attrText(getAttr(node, 'className')) ?? '';
          if (!/\banimate-spin\b/.test(cls)) return;
          // A refresh affordance spins its own icon while refetching; that is the button's
          // busy state, not a page wait.
          if (/Refresh|Rotate|Reload/i.test(jsxName(node))) return;
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: `<${jsxName(node)}> hand-rolled spinner, use PageSkeleton`,
          });
        }
      });
    }
    return out;
  },
};

// From records-archive-frontend: `picker-loading-state`. It was the only rule in that repo's set
// with no counterpart here, and it is the only one of the loading rules that detects the ABSENCE
// of a wait rather than policing the form of one.

/** A flag that says a read is still in flight, however the caller spelled it. */
const LOADING_FLAG = /\b(isLoading|isFetching|isPending|\w*[Ll]oading)\b/;

/** The pickers this rule judges directly. A local wrapper around one is resolved per file. */
const PICKER_SURFACES = new Set(['Combobox', 'ComboboxField']);

/** The hooks a screen reads through. `useMockQuery` is the fixture shim this repo runs on until a backend exists, and it returns the same `isLoading` as the endpoint factory, so a picker fed by it can be in flight exactly the same way. Naming only the real hook would leave this rule dead in every file the repo currently has. */
const READ_HOOKS = new Set(['useQueryEndpoint', 'useMockQuery']);

/** The same set as a source test, for the cheap gate before a file is parsed. */
const READ_HOOK_TEXT = new RegExp([...READ_HOOKS].join('|'));

/** Every identifier written anywhere inside a node. */
function identifiersIn(node) {
  const names = new Set();
  visit(node, (child) => {
    if (ts.isIdentifier(child)) names.add(child.text);
  });
  return names;
}

/**
 * Every local name in `src` that carries, or is derived from, a read hook's result.
 *
 * Seeded from `const q = useQueryEndpoint(...)` and grown to a fixpoint over identifier
 * REFERENCES, not over source text: a `useMemo` that maps `q.data.results` mentions `q` inside its
 * callback, so the option array it produces is reached in one step. Working off identifiers rather
 * than a text match is what stops a name in a comment or a string counting as a data flow.
 */
function queryDerivedNames(src) {
  const derived = new Set();

  // A destructured handle (`const { data } = useQueryEndpoint(...)`) is deliberately NOT seeded:
  // it would put a name as generic as `data` into the set and make every unrelated `data` in the
  // file look fetched.
  visit(src, (node) => {
    if (!ts.isVariableDeclaration(node) || !node.initializer || !ts.isIdentifier(node.name)) return;
    let calls = false;
    visit(node.initializer, (child) => {
      if (
        ts.isCallExpression(child) &&
        ts.isIdentifier(child.expression) &&
        READ_HOOKS.has(child.expression.text)
      ) {
        calls = true;
      }
    });
    if (calls) derived.add(node.name.text);
  });

  let grew = derived.size > 0;
  while (grew) {
    grew = false;
    visit(src, (node) => {
      if (!ts.isVariableDeclaration(node) || !node.initializer || !ts.isIdentifier(node.name)) {
        return;
      }
      const name = node.name.text;
      if (derived.has(name)) return;
      for (const identifier of identifiersIn(node.initializer)) {
        if (identifier !== name && derived.has(identifier)) {
          derived.add(name);
          grew = true;
          return;
        }
      }
    });
  }
  return derived;
}

/**
 * Whether the subtree holding `node` is simply not rendered while the read is in flight.
 *
 * A `QueryState` returns its loading fallback and none of its children while `isLoading` holds, so
 * a picker underneath one never gets the chance to lie. The same is true of a ternary or an `&&`
 * gated on a loading flag. A wait already handled one level up is not a second defect.
 */
function guardedByAncestor(node) {
  let p = node.parent;
  while (p) {
    // Not stopped at an overlay: this is about whether React renders the subtree at all, which a
    // portal does not change.
    if (isEl(p) && jsxName(p) === 'QueryState' && getAttr(p, 'isLoading')) return true;
    if (ts.isConditionalExpression(p) && LOADING_FLAG.test(p.condition.getText())) return true;
    if (
      ts.isBinaryExpression(p) &&
      (p.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
        p.operatorToken.kind === ts.SyntaxKind.BarBarToken) &&
      LOADING_FLAG.test(p.left.getText())
    ) {
      return true;
    }
    p = p.parent;
  }
  return false;
}

/**
 * Whether the component holding `node` returns early while a read is in flight.
 *
 * Only the component's own TOP-LEVEL statements count. Descending into nested functions would let
 * an `if (mutation.isPending) return;` inside a submit handler stand in for a render guard, which
 * is a different thing entirely and silences the whole file.
 */
function guardedByEarlyReturn(node) {
  let fn = node.parent;
  while (
    fn &&
    !ts.isFunctionDeclaration(fn) &&
    !ts.isArrowFunction(fn) &&
    !ts.isFunctionExpression(fn)
  ) {
    fn = fn.parent;
  }
  if (!fn?.body || !ts.isBlock(fn.body)) return false;
  return fn.body.statements.some((statement) => {
    if (!ts.isIfStatement(statement)) return false;
    if (!/\b(isLoading|isFetching|isPending)\b/.test(statement.expression.getText())) return false;
    let returns = false;
    visit(statement.thenStatement, (inner) => {
      if (ts.isReturnStatement(inner)) returns = true;
    });
    return returns;
  });
}

/**
 * A picker fed by a query says it is loading. It never claims the list is empty first.
 *
 * `Combobox` defaults `emptyMessage` to "No results", so a picker populated from an in-flight read
 * tells the user the register is empty. That is not a missing spinner, it is a false statement of
 * fact, and it looks identical to a genuinely empty list, so nobody knows to wait or to retry.
 *
 * The other loading rules all police the FORM of a wait: `loader-is-dotsloader` catches a
 * hand-rolled spinner, `loading-per-section` catches a page skeleton in a feature, and
 * `button-loading-state` catches a button greyed with nothing to say. None of them detects the
 * ABSENCE of a wait, which is how five of these shipped past a clean gate in records-archive.
 *
 * The fix is one attribute: `loading={q.isLoading}`. It renders only inside an OPENED popover, so
 * adding it to a picker whose query is usually warm costs nothing and pays on a cold open.
 */
export const pickerLoadingState = {
  id: 'picker-loading-state',
  doc: 'A Combobox whose options come from a read hook sets `loading`.',
  why: 'Combobox says "No results" by default, so an in-flight read reads as an empty register: the user sees a picker that appears to offer nothing and closes it before the options arrive.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      if (/\.test\.tsx$/.test(f)) continue;
      const text = read(f);
      // The query and the picker have to be visible in the same body for this to be decidable.
      if (!READ_HOOK_TEXT.test(text) || !/<[A-Z]\w*/.test(text)) continue;
      const src = ast(f);
      const derived = queryDerivedNames(src);
      if (!derived.size) continue;

      // A local wrapper that renders a `Combobox` is the same surface to the reader, so it is
      // judged the same way. Whether it already FORWARDS `loading` only changes the advice: the
      // kit control underneath every one of these accepts the prop, so a wrapper that drops it is
      // one line short, not exempt. Exempting it would make hiding a picker behind a thin wrapper
      // the cheapest way to silence this rule.
      const kinds = new Map();
      const pickerKind = (name) => {
        if (PICKER_SURFACES.has(name)) return 'direct';
        if (kinds.has(name)) return kinds.get(name);
        let kind = null;
        const target = resolveLocalImport(src, name);
        if (target && exportedComponentsRendering(target, COMBOBOX_SURFACES).has(name)) {
          kind = declaresProp(target, name, 'loading') ? 'direct' : 'wrapper';
        }
        kinds.set(name, kind);
        return kind;
      };

      visit(src, (node) => {
        if (!isEl(node)) return;
        const name = jsxName(node);
        const kind = pickerKind(name);
        if (!kind) return;

        const options = getAttr(node, 'options');
        if (!options?.initializer) return;
        const source = [...identifiersIn(options.initializer)].find((id) => derived.has(id));
        if (!source) return;

        // Present in any form satisfies it; the value is the caller's business.
        if (getAttr(node, 'loading')) return;
        if (guardedByAncestor(node) || guardedByEarlyReturn(node)) return;

        const fix =
          kind === 'wrapper'
            ? `thread a \`loading\` prop through <${name}> to its Combobox`
            : 'it sets no `loading`';
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: `<${name}> options come from fetched \`${source}\`, ${fix}`,
        });
      });
    }
    return out;
  },
};

export default [idFieldIsPicker, loaderIsDotsLoader, pickerLoadingState];
