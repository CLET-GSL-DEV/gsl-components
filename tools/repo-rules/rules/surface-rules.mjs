// Eight layout rules, each from a defect found by reviewing real screens. None of them is visible
// to typecheck, and all of them are visible in a screenshot weeks later, which is the gap a
// deterministic rule exists to close: a second surface drawn inside a card, a second pill strip
// stacked under the first, a tab strip with nothing declared between it and the content it
// switches, a notice stranded at the foot of the page, a page repeating the identity the header
// already states, a table whose rows do nothing, a hand-rolled row list doing a table's job, and
// a second role switcher letting two places disagree about who you are.
import { CARD_SURFACES, hasAncestor, isEl } from '../lib/components.mjs';
import { ast, getAttr, hasAttr, jsxName, lineOf, rel, ts, visit } from '../lib/core.mjs';

/** The element's className when it is a plain string literal, else null. A `cn(...)` call is skipped rather than guessed at. */
function literalClassName(node) {
  const attr = getAttr(node, 'className');
  if (!attr?.initializer || !ts.isStringLiteral(attr.initializer)) return null;
  return attr.initializer.text;
}

/** Overlays render in a portal, so a walk looking for surfaces inside a card stops at one. */
const OWN_SURFACE_STOPS = new Set(['Modal', 'Dialog', 'Sheet', 'Popover']);

/** The text a `label` or `aria-label` string literal carries, or null when it is not a plain string. */
function attrLiteralText(node, name) {
  const attr = getAttr(node, name);
  if (!attr?.initializer || !ts.isStringLiteral(attr.initializer)) return null;
  return attr.initializer.text;
}

/** The JSX expression a top-level function of the file hands back, in source order. */
function returnedExpressions(body) {
  if (ts.isBlock(body)) {
    return body.statements
      .filter((st) => ts.isReturnStatement(st) && st.expression)
      .map((st) => st.expression);
  }
  return [body];
}

/** The element a return hands back, skipping parentheses, or null. */
function returnedElement(expression) {
  let e = expression;
  while (e && ts.isParenthesizedExpression(e)) e = e.expression;
  return e && isEl(e) ? e : null;
}

/**
 * What a page's top-level return hands back, skipping parentheses: the element itself, or the
 * fragment whose children sit at the page's top level.
 */
function returnedContainer(expression) {
  let e = expression;
  while (e && ts.isParenthesizedExpression(e)) e = e.expression;
  if (!e) return null;
  if (ts.isJsxFragment(e) || isEl(e)) return e;
  return null;
}

/** The body of every function declared at the top level of a file. */
function functionBodies(src) {
  const bodies = [];
  for (const statement of src.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.body) bodies.push(statement.body);
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (!decl.initializer) continue;
        if (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer)) {
          if (decl.initializer.body) bodies.push(decl.initializer.body);
        }
      }
    }
  }
  return bodies;
}

/** Files that hold a screen: one folder per feature, then `pages`. */
function isPage(f) {
  return /^src[/\\]features[/\\][^/\\]+[/\\]pages[/\\]/.test(rel(f));
}

/** The nearest card surface `node` sits inside, or null. */
function nearestCard(node) {
  let p = node.parent;
  while (p) {
    if (isEl(p) && CARD_SURFACES.has(jsxName(p))) return p;
    p = p.parent;
  }
  return null;
}

/** The element a `.map` callback hands back, skipping parentheses, or null. */
function callbackRoot(cb) {
  if (!cb || (!ts.isArrowFunction(cb) && !ts.isFunctionExpression(cb))) return null;
  const body = cb.body;
  if (ts.isBlock(body)) {
    for (const st of body.statements) {
      if (ts.isReturnStatement(st) && st.expression) return returnedElement(st.expression);
    }
    return null;
  }
  return returnedElement(body);
}

/** The JSX text among an element's siblings: the text that visually labels it. */
function siblingText(node) {
  const parent = node.parent;
  if (!parent || !parent.children) return '';
  return parent.children
    .filter((c) => ts.isJsxText(c))
    .map((c) => c.getText())
    .join(' ');
}

/** The JSX text anywhere inside an element, stopping at a nested switcher control. */
function innerText(node) {
  let text = '';
  const walk = (n) => {
    n.forEachChild((child) => {
      if (ts.isJsxText(child)) {
        text += ` ${child.getText()}`;
        return;
      }
      if (isEl(child) && SWITCHER_CONTROLS.has(jsxName(child))) return;
      walk(child);
    });
  };
  walk(node);
  return text;
}

const SWITCHER_CONTROLS = new Set(['Dropdown', 'Select', 'Combobox']);

export const handrolledCardSurface = {
  id: 'no-handrolled-card-surface',
  doc: 'A `div` styled as a card, border plus rounding, never sits inside a `Card` or `CardContent`.',
  why: 'The kit card already draws the border and the radius. A grid of bordered, rounded tiles inside it draws both again one inset in, and `no-card-in-card` walks straight past it because the inner surface is a div, not a Card.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);

      visit(src, (node) => {
        if (!isEl(node)) return;
        const name = jsxName(node);
        if (name !== 'Card' && name !== 'CardContent') return;

        // Walk below the card surface. A nested card surface reports its own descendants through
        // its own pass here, so each styled div is reported once, by its nearest surface. An
        // overlay is its own surface and stops the walk entirely.
        const walk = (n) => {
          n.forEachChild((child) => {
            if (!isEl(child)) {
              walk(child);
              return;
            }
            const childName = jsxName(child);
            if (OWN_SURFACE_STOPS.has(childName)) return;
            if (childName === 'Card' || childName === 'CardContent') return;
            if (childName === 'div') {
              const cls = literalClassName(child);
              if (cls !== null && cls.includes('border') && cls.includes('rounded')) {
                out.push({
                  file: rel(f),
                  line: lineOf(src, child.getStart()),
                  message:
                    'a `div` styled as a card sits inside a `Card`. Two surfaces around one idea. Use the `Table` component for rows, or drop the border and rounding and let the outer card be the surface.',
                });
              }
            }
            walk(child);
          });
        };
        walk(node);
      });
    }
    return out;
  },
};

export const stackedPillTabs = {
  id: 'no-stacked-pill-tabs',
  doc: 'One pill tab strip per screen. A second level of navigation uses a different `Tabs` variant.',
  why: 'Two pill strips stacked read as two copies of the same control at the same altitude, and the reader cannot tell which strip drives which panel.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);
      const pills = [];

      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'Tabs') return;
        const attr = getAttr(node, 'variant');
        if (!attr?.initializer || !ts.isStringLiteral(attr.initializer)) return;
        if (attr.initializer.text !== 'pill') return;
        pills.push(node);
      });

      for (const el of pills.slice(1)) {
        out.push({
          file: rel(f),
          line: lineOf(src, el.getStart()),
          message:
            'a second pill tab strip stacked under the first. One pill strip per screen: a second level uses a different `Tabs` variant so the two read as different altitudes.',
        });
      }
    }
    return out;
  },
};

export const tabsContentGap = {
  id: 'tabs-content-gap',
  doc: 'A `Tabs` strip followed by content declares the spacing between them, an `mb-` on the strip or a `gap-` on the container.',
  why: 'With no declared gap the strip lands wherever the browser puts it, flush on the panel it switches, and every screen drifts by whatever each author typed last.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      const src = ast(f);

      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'Tabs') return;
        const parent = node.parent;
        if (!parent?.children) return;
        const siblings = parent.children;
        // The next element sibling, skipping whitespace-only text. Real text between the strip and
        // what follows means the strip does not directly precede content, so nothing to judge.
        let next = null;
        for (let i = siblings.indexOf(node) + 1; i < siblings.length && !next; i++) {
          const sib = siblings[i];
          if (ts.isJsxText(sib)) {
            if (sib.getText().trim() === '') continue;
            break;
          }
          if (isEl(sib)) next = sib;
          else break;
        }
        if (!next) return;

        const own = literalClassName(node);
        if (own !== null && own.includes('mb-')) return;
        // The closest enclosing element that declares a className at all is the container whose
        // job the spacing is. One built by `cn(...)` is skipped rather than guessed at.
        let enclosing = null;
        for (let p = parent; p && enclosing === null; p = p.parent) {
          if (!isEl(p)) continue;
          const cls = literalClassName(p);
          if (cls !== null) enclosing = cls;
        }
        if (enclosing !== null && (enclosing.includes('gap-') || enclosing.includes('space-y-'))) {
          return;
        }
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message:
            'no declared spacing between the tab strip and the content it switches. Give the container a `gap-` or the strip an `mb-`.',
        });
      });
    }
    return out;
  },
};

export const noticeNotLastChild = {
  id: 'notice-not-last-child',
  doc: 'A `Notice` is never the last element child of a page root. It sits above the content it qualifies.',
  why: 'A notice explains the thing it sits above. Pushed under everything else it reads as an afterthought unplugged from whatever it qualifies, and on a long page the reader reaches it after the content it was written for.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      if (!isPage(f)) continue;
      const src = ast(f);
      let reported = false;

      for (const body of functionBodies(src)) {
        if (reported) break;
        for (const expression of returnedExpressions(body)) {
          const container = returnedContainer(expression);
          if (!container?.children) continue;
          const elementChildren = container.children.filter(isEl);
          const last = elementChildren[elementChildren.length - 1];
          if (!last || jsxName(last) !== 'Notice') continue;
          out.push({
            file: rel(f),
            line: lineOf(src, last.getStart()),
            message:
              'a `Notice` is the last thing on the page. A notice explains the thing it sits above, so it belongs before the content it qualifies, not stranded under it.',
          });
          reported = true;
          break;
        }
      }
    }
    return out;
  },
};

export const roleTextInCopy = {
  id: 'no-role-text-in-copy',
  doc: 'Page copy never restates the signed-in identity. The header states it once.',
  why: 'A page that repeats "signed in as" or "viewing as" is telling the reader something the chrome already says, and the two statements drift apart the moment one of them is edited.',
  check(files) {
    const patterns = [/signed in as/i, /viewing as/i];
    const matched = (text) => patterns.some((p) => p.test(text));
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      if (!/^src[/\\]features[/\\]/.test(rel(f))) continue;
      const src = ast(f);

      visit(src, (node) => {
        if (ts.isJsxText(node)) {
          const text = node.getText();
          if (text.trim() !== '' && matched(text)) {
            out.push({
              file: rel(f),
              line: lineOf(src, node.getStart()),
              message:
                'the signed-in identity is stated by the header, once. A page that repeats it is telling the reader something the chrome already says.',
            });
          }
          return;
        }
        if (ts.isStringLiteral(node) && matched(node.text)) {
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message:
              'the signed-in identity is stated by the header, once. A page that repeats it is telling the reader something the chrome already says.',
          });
        }
      });
    }
    return out;
  },
};

export const rowClickNavigates = {
  id: 'row-click-navigates',
  doc: 'A `Table` carries `onRowClick` or `selectable`. A row either opens its record or joins a bulk action.',
  why: 'A table whose rows do nothing when clicked trains the reader to stop clicking rows, and then the tables that do navigate stop being discovered.',
  severity: 'warn',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      if (!/^src[/\\]features[/\\]/.test(rel(f))) continue;
      const src = ast(f);

      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'Table') return;
        if (hasAttr(node, 'onRowClick') || hasAttr(node, 'selectable')) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message:
            'a table whose rows do nothing when clicked and which offers no bulk selection. Give the row a click that opens the record, or make the table selectable because there are bulk actions.',
        });
      });
    }
    return out;
  },
};

export const listOfRowsIsATable = {
  id: 'list-of-rows-is-a-table',
  doc: 'A `.map` of `border-b` rows is a hand-rolled table. The page\'s primary list uses the `Table` component.',
  why: 'Bordered rows sorted by hand have no sort, no empty state and no column alignment, and the moment the list grows past a screenful the kit table it should have been is missed.',
  severity: 'warn',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      // Scoped to pages on purpose: the test is whether the list is the page's primary content,
      // which only a page can answer. A small bordered list inside a dashboard panel is correct.
      if (!isPage(f)) continue;
      const src = ast(f);

      // Cards sitting directly under a returned page root: the page's primary surfaces.
      const topLevelCards = new Set();
      for (const body of functionBodies(src)) {
        for (const expression of returnedExpressions(body)) {
          const container = returnedContainer(expression);
          if (!container?.children) continue;
          for (const child of container.children) {
            if (isEl(child) && CARD_SURFACES.has(jsxName(child))) topLevelCards.add(child);
          }
        }
      }
      if (!topLevelCards.size) continue;

      const reported = new Set();
      visit(src, (node) => {
        if (!ts.isCallExpression(node)) return;
        if (!ts.isPropertyAccessExpression(node.expression)) return;
        if (node.expression.name.text !== 'map' || reported.has(node)) return;
        const row = callbackRoot(node.arguments[0]);
        if (!row) return;
        const cls = literalClassName(row);
        if (cls === null || !cls.includes('border-b')) return;
        // Rows the kit table already lays out are a table's rows, not a hand-rolled list.
        if (hasAncestor(node, new Set(['Table']))) return;
        const card = nearestCard(node);
        if (!card || !topLevelCards.has(card)) return;
        reported.add(node);
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: "a hand-rolled list of bordered rows doing a table's job. Use the `Table` component.",
        });
      });
    }
    return out;
  },
};

export const duplicateRoleSwitcher = {
  id: 'no-duplicate-role-switcher',
  doc: 'A `Dropdown`, `Select` or `Combobox` phrased as an identity switch, "viewing as", "switch role", "acting as", "sign in as", "view this app as", "as another role" or "signed-in role", never renders on a page. The header carries the identity switcher. A field that records somebody\'s project role is not a switcher and never was one.',
  why: 'The rule is about a control that changes WHO YOU ARE, not a field that records somebody\'s role. A second identity switcher lets two places disagree about who you are, and each one extra is one more control to keep in step when the identity changes.',
  check(files) {
    const roleSwitcher =
      /viewing as|switch role|acting as|sign(ed)? in as|view this app as|as another role|signed[- ]in role/i;
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      if (!/^src[/\\]features[/\\]/.test(rel(f))) continue;
      const src = ast(f);

      visit(src, (node) => {
        if (!isEl(node)) return;
        if (!SWITCHER_CONTROLS.has(jsxName(node))) return;
        const hits = [];
        for (const attrName of ['label', 'aria-label']) {
          const text = attrLiteralText(node, attrName);
          if (text !== null && roleSwitcher.test(text)) hits.push(`${attrName}="${text}"`);
        }
        const inside = innerText(node);
        if (roleSwitcher.test(inside)) hits.push('its own text');
        const around = siblingText(node);
        if (roleSwitcher.test(around)) hits.push('the text beside it');
        if (!hits.length) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message:
            'a control that switches which identity you are viewing as. The header already carries one, so a second lets two places disagree about who you are.',
        });
      });
    }
    return out;
  },
};

export default [
  handrolledCardSurface,
  stackedPillTabs,
  tabsContentGap,
  noticeNotLastChild,
  roleTextInCopy,
  rowClickNavigates,
  listOfRowsIsATable,
  duplicateRoleSwitcher,
];
