// The detail-page template as checks. Every detail page mounts DetailLayout, so a page
// that drifts is a finding here instead of a review comment. See docs/DETAIL-PAGE-CONTRACT.md.
import { ast, getAttr, jsxName, lineOf, rel, ts, visit } from '../lib/core.mjs';

const isEl = (n) => ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n);

// A detail page: a tsx file under a module pages/ dir whose JSX mounts DetailLayout.
function detailLayouts(f) {
  if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) return [];
  if (!/\/src\/modules\/[^/]+\/pages\//.test(f)) return [];
  const found = [];
  visit(ast(f), (n) => {
    if (isEl(n) && jsxName(n) === 'DetailLayout') found.push(n);
  });
  return found;
}

// A *Detail.tsx page renders the template, never a hand-rolled stack of Cards.
// Exemption is by file-name suffix alone: no route-table lookup, a page file says Detail.
export const detailUsesLayout = {
  id: 'detail-uses-layout',
  doc: 'DETAIL-PAGE-CONTRACT: a *Detail.tsx page renders DetailLayout.',
  why: 'A detail page built from bare Cards skips breadcrumbs, the stepper slot and the rail.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      if (!/\/src\/modules\/[^/]+\/pages\/[^/]*Detail\.tsx$/.test(f)) continue;
      if (detailLayouts(f).length) continue;
      out.push({ file: rel(f), line: 1, message: 'no <DetailLayout> in a *Detail.tsx page' });
    }
    return out;
  },
};

const BACK_TARGETS = new Set(['Button', 'Link', 'BreadcrumbLink', 'a']);

// The visible text of an element: JsxText plus plain string literals inside it.
function shownTexts(node) {
  const texts = [];
  visit(node, (d) => {
    if (ts.isJsxText(d)) {
      const s = d.getText().trim();
      if (s) texts.push(s);
    } else if (ts.isStringLiteral(d) || ts.isNoSubstitutionTemplateLiteral(d)) {
      if (d.text.trim()) texts.push(d.text.trim());
    }
  });
  return texts;
}

export const detailNoBackButton = {
  id: 'detail-no-back-button',
  doc: 'DETAIL-PAGE-CONTRACT rule 1: breadcrumbs, never a back button.',
  why: 'The breadcrumb trail already names the way back, a button beside it says it twice.',
  check(files) {
    const out = [];
    for (const f of files) {
      const layouts = detailLayouts(f);
      if (!layouts.length) continue;
      const src = ast(f);
      for (const layout of layouts) {
        visit(layout, (d) => {
          if (!isEl(d) || !BACK_TARGETS.has(jsxName(d))) return;
          if (shownTexts(d).some((t) => t.startsWith('Back to'))) {
            out.push({
              file: rel(f),
              line: lineOf(src, d.getStart()),
              message: `<${jsxName(d)}> reads "Back to ...", the breadcrumbs already go back`,
            });
          }
        });
      }
    }
    return out;
  },
};

const STEPPER_ELS = new Set(['Stepper', 'Step', 'LifecycleTracker']);

export const detailStepperIsTopLevel = {
  id: 'detail-stepper-is-top-level',
  doc: 'DETAIL-PAGE-CONTRACT rule 2: the stepper is the stepper prop, never page content.',
  why: 'A stepper in the narrow rail cannot scale past three steps.',
  check(files) {
    const out = [];
    for (const f of files) {
      const layouts = detailLayouts(f);
      if (!layouts.length) continue;
      const src = ast(f);
      for (const layout of layouts) {
        // Everything inside the stepper prop is the sanctioned slot, at any depth.
        const allowed = new Set();
        const stepper = getAttr(layout, 'stepper');
        if (stepper?.initializer) {
          visit(stepper.initializer, (d) => {
            if (isEl(d) && STEPPER_ELS.has(jsxName(d))) allowed.add(d);
          });
        }
        visit(layout, (d) => {
          if (!isEl(d) || !STEPPER_ELS.has(jsxName(d)) || allowed.has(d)) return;
          out.push({
            file: rel(f),
            line: lineOf(src, d.getStart()),
            message: `<${jsxName(d)}> inside DetailLayout content, pass it to the stepper prop`,
          });
        });
      }
    }
    return out;
  },
};

// TypeScript already requires the icon prop, so this is a second line of defence for the day
// the type is widened by a future edit. It will usually report nothing, and that is fine.
export const detailFieldHasIcon = {
  id: 'detail-field-has-icon',
  doc: 'DETAIL-PAGE-CONTRACT rule 4: every DetailField carries an icon.',
  why: 'The icon column keeps labels aligned, a field without one shifts its row.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!detailLayouts(f).length) continue;
      const src = ast(f);
      visit(src, (d) => {
        if (!isEl(d) || jsxName(d) !== 'DetailField') return;
        if (getAttr(d, 'icon')) return;
        out.push({ file: rel(f), line: lineOf(src, d.getStart()), message: '<DetailField> without icon' });
      });
    }
    return out;
  },
};

const REF_PROP = /^(reference|\w*_ref)$/i;

export const detailReferenceNotInHeader = {
  id: 'detail-reference-not-in-header',
  severity: 'warn',
  doc: 'DETAIL-PAGE-CONTRACT rule 3: the reference is a DetailField, never a chip in the header.',
  why: 'Heuristic, so warn: a *_ref or reference value in the header belongs in Details as a field.',
  check(files) {
    const out = [];
    for (const f of files) {
      const layouts = detailLayouts(f);
      if (!layouts.length) continue;
      const src = ast(f);
      for (const layout of layouts) {
        // The template names the slot header; title is the contract doc word for the same slot.
        for (const slot of ['header', 'title']) {
          const attr = getAttr(layout, slot);
          if (!attr?.initializer) continue;
          let hit = null;
          visit(attr.initializer, (d) => {
            if (hit || !ts.isPropertyAccessExpression(d)) return;
            if (!REF_PROP.test(d.name.text)) return;
            // A label constant such as MODULE.detail.reference is a word, not a record value.
            const obj = d.expression.getText();
            if (obj === 'MODULE' || /\.detail$/.test(obj)) return;
            hit = d;
          });
          if (hit) {
            out.push({
              file: rel(f),
              line: lineOf(src, hit.getStart()),
              message: `header renders ${hit.getText()}, the reference belongs in Details as a field`,
            });
            break;
          }
        }
      }
    }
    return out;
  },
};

const ASIDE_OK = new Set(['AsideSection', 'Card']);

// Direct JSX children, seen through conditionals, fragments and map callbacks.
function directChildren(node) {
  const out = [];
  const unwrap = (n) => {
    if (!n) return;
    if (isEl(n)) {
      out.push(n);
      return;
    }
    if (ts.isJsxFragment(n)) {
      n.children.forEach(unwrap);
      return;
    }
    if (ts.isJsxExpression(n)) {
      if (n.expression) unwrap(n.expression);
      return;
    }
    if (ts.isParenthesizedExpression(n)) {
      unwrap(n.expression);
      return;
    }
    if (ts.isConditionalExpression(n)) {
      unwrap(n.whenTrue);
      unwrap(n.whenFalse);
      return;
    }
    // `{ready && <AsideSection/>}` still occupies a slot in the rail.
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      unwrap(n.right);
      return;
    }
    // `{items.map(() => <AsideSection/>)}` renders whatever the callback returns.
    if (ts.isCallExpression(n)) {
      for (const a of n.arguments) {
        if (ts.isArrowFunction(a)) unwrap(a.body);
      }
    }
  };
  (node.children ?? []).forEach(unwrap);
  return out;
}

export const detailAsideSectionsAreCards = {
  id: 'detail-aside-sections-are-cards',
  doc: 'DETAIL-PAGE-CONTRACT rule 5: every rail section is a card.',
  why: 'Bare text in the rail renders with no surface, floating on the page background.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!detailLayouts(f).length) continue;
      const src = ast(f);
      visit(src, (d) => {
        if (!isEl(d) || jsxName(d) !== 'DetailAside' || !ts.isJsxElement(d)) return;
        for (const child of d.children ?? []) {
          // Bare text with no surface is the exact defect this rule exists for.
          if (ts.isJsxText(child) && child.getText().trim()) {
            out.push({
              file: rel(f),
              line: lineOf(src, child.getStart()),
              message: 'text directly in <DetailAside>, wrap it in <AsideSection>',
            });
          }
        }
        for (const child of directChildren(d)) {
          if (ASIDE_OK.has(jsxName(child))) continue;
          out.push({
            file: rel(f),
            line: lineOf(src, child.getStart()),
            message: `<${jsxName(child)}> directly in <DetailAside>, wrap it in <AsideSection>`,
          });
        }
      });
    }
    return out;
  },
};

export default [
  detailUsesLayout,
  detailNoBackButton,
  detailStepperIsTopLevel,
  detailFieldHasIcon,
  detailReferenceNotInHeader,
  detailAsideSectionsAreCards,
];
