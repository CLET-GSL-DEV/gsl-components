// Rules that need to follow a value across a file: where options came from, whether a
// mutation was given toasts. Still deterministic, just more than one line of context.
import { callSites, enclosingComponentName } from '../lib/components.mjs';
import { ast, getAttr, jsxName, lineOf, read, rel, ts, visit } from '../lib/core.mjs';

/**
 * Both halves of the contract, not one.
 *
 * This rule shipped enforcing `onError` alone, and that is exactly half a rule: it proved a
 * failure would be reported and said nothing about a success. A verify action walked through the
 * resulting gap. An officer pressed the button, the archive re-derived every checksum, and the
 * screen said nothing at all, which is the same thing a dead button says.
 *
 * The accepted shapes are deliberately narrow, because a false alarm on a blocking gate is paid
 * for with a `rules-allow` and the rule then means nothing:
 *
 *   ACCEPTED  `onSuccess:` present in the resolved toast config, reached directly or through
 *             `...spread`, `toast: someConst`, the `{ toast }` shorthand, or a local factory.
 *   ACCEPTED  an explicit `onSuccess: []`, which is the opt-out for a mutation whose result is
 *             already on screen (an in-place row edit, an optimistic toggle) and where a toast
 *             would be noise. It is typed, it is visible in review, and unlike a `rules-allow` on
 *             this id it leaves the `onError` half of the rule still enforced at that site.
 *   SKIPPED   a hand-rolled `toast()` in the component. `no-hand-rolled-toast` already rejects
 *             that shape, so honouring it here would make the two rules contradict each other.
 *   SKIPPED   `useWorkflowAction.ts` and `src/core/api-client/`, the same two exemptions the
 *             `onError` half already carries and for the same reasons.
 *
 * Note that the id cannot carry two severities, so shipping this half advisory would have meant
 * demoting the `onError` half with it.
 */
export const mutationToasts = {
  id: 'mutation-has-toasts',
  doc: 'error-handling skill: every mutation raises both toasts.',
  why: 'A mutation that reports nothing is indistinguishable from a dead button, either way.',
  check(files) {
    const out = [];
    for (const f of files) {
      // useWorkflowAction wraps the toast config, so its call sites are already compliant.
      if (/useWorkflowAction\.ts$/.test(f)) continue;
      // src/core/api-client IS the toast layer, it cannot route through itself.
      if (/src\/core\/api-client\//.test(f)) continue;
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isCallExpression(node)) return;
        if (node.expression.getText() !== 'useMutationEndpoint') return;
        const opts = node.arguments[1];
        const text = opts?.getText() ?? '';
        // `{ toast }` shorthand names the same config as `{ toast: toast }`.
        if (!/toast\s*:/.test(text) && !/\{\s*toast\s*\}/.test(text)) {
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: 'useMutationEndpoint with no toast config',
          });
          return;
        }
        // A spread config carries its handlers from a const, possibly through another spread.
        const fileText = read(f);
        const bodyOf = (name) => {
          const m = fileText.match(
            new RegExp(`(?:const|let)\\s+${name}\\s*=\\s*(\\{[\\s\\S]*?\\n\\s*\\};)`),
          );
          return m ? m[1] : '';
        };
        // A toast config is often built by a small local factory, so that seven mutations on one
        // screen do not each repeat the same four lines. Follow the factory into its body: without
        // this arm every factory-built config reads as having no handlers at all.
        const factoryBodyOf = (name) => {
          const arrow = fileText.match(
            new RegExp(
              `(?:const|let)\\s+${name}\\s*=\\s*\\([^)]*\\)\\s*(?::[^=]+)?=>\\s*\\(?([\\s\\S]*?\\n\\s*\\}\\)?;)`,
            ),
          );
          if (arrow) return arrow[1];
          const fn = fileText.match(
            new RegExp(`function\\s+${name}\\s*\\([^)]*\\)[\\s\\S]*?\\n\\}`),
          );
          return fn ? fn[0] : '';
        };
        // One traversal, asked twice. Passing the key in rather than hard-coding `onError` is the
        // whole extension: the success half is then reached by exactly the same references the
        // error half already followed, so neither can resolve a config the other cannot.
        const resolves = (key, chunk, depth = 0) => {
          if (depth > 3 || !chunk) return false;
          if (new RegExp(`${key}\\s*:`).test(chunk)) return true;
          // Follow `...spread`, a bare `toast: someConst`, and the shorthand `{ toast }`, which
          // is the same reference written without its key and was previously invisible here.
          const refs = [...chunk.matchAll(/\.\.\.(\w+)/g)].map((m) => m[1]);
          const direct = chunk.match(/toast\s*:\s*(\w+)\s*[,}]/);
          if (direct) refs.push(direct[1]);
          if (/\{\s*toast\s*\}/.test(chunk)) refs.push('toast');
          const called = [...chunk.matchAll(/toast\s*:\s*(\w+)\s*\(/g)].map((m) => m[1]);
          return (
            refs.some((name) => resolves(key, bodyOf(name), depth + 1)) ||
            called.some((name) => resolves(key, factoryBodyOf(name), depth + 1))
          );
        };
        if (!resolves('onError', text)) {
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: 'mutation toast config has no onError',
          });
        }
        if (!resolves('onSuccess', text)) {
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message:
              'mutation toast config has no onSuccess, so the action completes in silence. ' +
              'Write `onSuccess: []` if the screen already reports it.',
          });
        }
      });
    }
    return out;
  },
};

export const handRolledToast = {
  id: 'no-hand-rolled-toast',
  doc: 'error-handling skill.',
  why: 'Toasts belong on the endpoint hook, never in a callback.',
  check(files) {
    const out = [];
    for (const f of files) {
      const src = ast(f);
      let usesToastHook = false;
      visit(src, (node) => {
        if (ts.isCallExpression(node) && node.expression.getText() === 'useToast')
          usesToastHook = true;
      });
      if (!usesToastHook) continue;
      if (/src\/core\/api-client\//.test(f)) continue;
      // A toast reporting a plain async helper, a file download for instance, has no endpoint
      // hook to move onto. Only flag a file that actually has a mutation to attach to.
      const hasMutation = /useMutationEndpoint\(/.test(read(f));
      if (!hasMutation) continue;
      read(f)
        .split('\n')
        .forEach((line, i) => {
          if (/^\s*toast\(\{/.test(line)) {
            out.push({
              file: rel(f),
              line: i + 1,
              message: 'hand-rolled toast() call, move it to the endpoint hook toast config',
            });
          }
        });
    }
    return out;
  },
};

export const fetchedSelectIsCombobox = {
  id: 'fetched-list-is-combobox',
  doc: "ui-patterns §6: if you had to fetch it, it's a Combobox.",
  why: 'An unbounded fetched list in an unsearchable Dropdown is unusable once it grows.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const text = read(f);
      const src = ast(f);

      // Names bound to a query result in this file.
      const fetched = new Set();
      visit(src, (node) => {
        if (!ts.isVariableDeclaration(node) || !node.initializer || !node.name) return;
        const init = node.initializer.getText();
        if (/use(Query|Panel)(Endpoint|List|Query)\(|\.data\?\.data|useUserOptions\(/.test(init)) {
          fetched.add(node.name.getText());
        }
      });
      if (!fetched.size) return out;

      // A `kind: 'select'` whose options trace back to one of those names.
      visit(src, (node) => {
        if (!ts.isObjectLiteralExpression(node)) return;
        const kind = node.properties.find(
          (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'kind',
        );
        if (!kind || !/['"]select['"]/.test(kind.initializer.getText())) return;
        const opts = node.properties.find(
          (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'options',
        );
        if (!opts) return;
        const optText = opts.initializer.getText();
        const source = [...fetched].find((n) => optText.includes(n));
        // A memo over fetched data counts too.
        const viaMemo =
          /Options$/.test(optText) &&
          new RegExp(`${optText}\\s*=\\s*useMemo`).test(text) &&
          [...fetched].some((n) => new RegExp(`${optText}[\\s\\S]{0,400}${n}`).test(text));
        if (source || viaMemo) {
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: `kind: 'select' fed by fetched data (${source ?? optText}), use 'combobox'`,
          });
        }
      });
    }
    return out;
  },
};

export const tableInsideCard = {
  id: 'table-inside-card',
  doc: 'ui-patterns rule 10: every table lives inside a <Card bordered>.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isJsxElement(node) || jsxName(node) !== 'Table') return;
        let p = node.parent;
        let inCard = false;
        while (p) {
          // DetailPanel and SectionCard both render a <Card bordered>, so they satisfy it too.
          if (
            (ts.isJsxElement(p) || ts.isJsxSelfClosingElement(p)) &&
            ['Card', 'DetailPanel', 'SectionCard'].includes(jsxName(p))
          ) {
            inCard = true;
            break;
          }
          p = p.parent;
        }
        // A table component need not carry the card itself, and the ones that did were the
        // card-in-card `no-card-in-card` now reports: the section that mounts them already draws
        // one. So a bare Table is correct exactly when every call site supplies the card, and that
        // answer is at the call sites rather than in this file. This rule used to read one file and
        // so demanded a Card here, which is what put the second border on the taxonomy editor.
        if (!inCard) {
          const owner = enclosingComponentName(node);
          const sites = owner ? callSites(files, owner) : [];
          if (sites.length && sites.every((site) => site.insideCard)) return;
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: sites.length
              ? `<Table> not in a Card, and <${owner}> is mounted outside one at ${rel(sites.find((s) => !s.insideCard).file)}`
              : '<Table> not wrapped in a <Card bordered>',
          });
        }
      });
    }
    return out;
  },
};

export const identifierColumn = {
  id: 'no-identifier-column',
  doc: 'ui-patterns §8b: a reference lives in a RecordCell, never in its own column.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isObjectLiteralExpression(node)) return;
        const acc = node.properties.find(
          (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'accessorFn',
        );
        const header = node.properties.find(
          (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'header',
        );
        if (!acc || !header) return;
        const body = acc.initializer.getText();
        if (/RecordCell/.test(body)) return;
        // `name || ref` shows the name and only falls back, that is the fix, not the defect.
        const nameFirst = body.match(/\b\w+\.(\w*(?:name|label|title|period|purpose))\b/i);
        const refAt = body.search(/\b\w+\.\w*_ref\b/);
        if (nameFirst && body.indexOf(nameFirst[0]) < refAt) return;
        // A column whose whole body is a *_ref read is a bare identifier column.
        if (/\b\w+\.\w*_ref\b/.test(body) && body.length < 160) {
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message:
              'table column renders a bare reference, compose it into RecordCell or show the name',
          });
        }
      });
    }
    return out;
  },
};

export default [
  mutationToasts,
  handRolledToast,
  fetchedSelectIsCombobox,
  tableInsideCard,
  identifierColumn,
];
