// Rules that need to see JSX structure. These are the ones a regex cannot do.
import { ast, attrText, getAttr, hasAttr, jsxName, lineOf, rel, ts, visit } from '../lib/core.mjs';

const HPAD = /\bpx-\d+|\bp-\d+|\bpl-\d+|\bpr-\d+/;

/**
 * Surfaces that own their padding. A padded wrapper INSIDE one of these is the bug, and a padded
 * one of these inside another is double padding by construction.
 */
const SELF_PADDING = new Set([
  'CardHeader',
  'TableContent',
  'RecordListItem',
  'DialogContent',
  'ModalContent',
  'SheetBody',
  'PopupBody',
  'DetailPanel',
]);

/**
 * `.clet-card` ships `padding: 16px`. Nothing inside a Card adds horizontal padding on top of it,
 * CardHeader included. The old exemption for CardHeader came from a doc example that predated
 * anyone checking what Card actually renders.
 */
const SANCTIONED_OWNER = new Set();

function classOf(node) {
  return attrText(getAttr(node, 'className')) ?? '';
}

const isEl = (n) => ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n);
/** `-mx-2 px-2` cancels out: it bleeds a hover background wider without moving the text. */
function cancelsOut(cls) {
  const pad = cls.match(/\bpx-(\d+)\b/);
  const neg = cls.match(/-mx-(\d+)\b/);
  return Boolean(pad && neg && pad[1] === neg[1]);
}

const padded = (n) => {
  const cls = classOf(n);
  return HPAD.test(cls) && !cancelsOut(cls);
};

export const cardPaddingChain = {
  id: 'card-padding-chain',
  doc: 'CLAUDE.md: PADDING STACKS. ui-patterns §24a/§24b.',
  why: 'Only ONE element on the path from a Card down to the text may carry horizontal padding.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isJsxElement(node) || jsxName(node) !== 'Card') return;

        // `.clet-card` already pads 16px, so a p-*/px-* on the Card doubles it.
        if (padded(node)) {
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: `<Card> adds ${classOf(node).match(HPAD)?.[0]} on top of the 16px it already has`,
            snippet: classOf(node).slice(0, 70),
          });
        }

        // Walk every root-to-leaf path below the Card, counting padding as it accumulates.
        const walk = (n, ancestors) => {
          n.forEachChild((child) => {
            if (!isEl(child)) {
              walk(child, ancestors);
              return;
            }
            const name = jsxName(child);
            const owns = SELF_PADDING.has(name);
            const next = [...ancestors];

            if (padded(child) && !SANCTIONED_OWNER.has(name)) {
              next.push({ name, cls: classOf(child), line: lineOf(src, child.getStart()) });
            }

            // A component that pads itself, sitting under something already padded, is the sum bug.
            if (owns && ancestors.length) {
              out.push({
                file: rel(f),
                line: lineOf(src, child.getStart()),
                message: `<${name}> pads itself but sits inside padded <${ancestors.at(-1).name}> (${ancestors.at(-1).cls.match(HPAD)?.[0]})`,
                snippet: classOf(child).slice(0, 70),
              });
            }
            // The Card already pays 16px, so ANY horizontal padding below it stacks on that.
            if (next.length === 1 && next[0] === undefined) {
              /* unreachable, keeps shape */
            }
            if (next.length >= 1) {
              const inner = next.at(-1);
              const outer = next.length > 1 ? next.at(-2) : { name: 'Card', cls: 'p-4 (built in)' };
              out.push({
                file: rel(f),
                line: inner.line,
                message: `padding stacks: <${outer.name}> ${outer.cls.match(HPAD)?.[0] ?? '16px built in'} then <${inner.name}> ${inner.cls.match(HPAD)?.[0]}`,
                snippet: inner.cls.slice(0, 70),
              });
              return;
            }
            if (false) {
              const [outer, inner] = next.slice(-2);
              out.push({
                file: rel(f),
                line: inner.line,
                message: `padding stacks: <${outer.name}> ${outer.cls.match(HPAD)?.[0]} then <${inner.name}> ${inner.cls.match(HPAD)?.[0]}`,
                snippet: inner.cls.slice(0, 70),
              });
              return; // one report per path, not one per descendant
            }
            walk(child, next);
          });
        };
        walk(node, []);
      });
    }
    // Same finding can surface from nested Cards, keep one per file:line.
    const seen = new Set();
    return out.filter((f) => {
      const k = `${f.file}:${f.line}:${f.message}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  },
};

export const listGapSmell = {
  id: 'list-gap-instead-of-divider',
  // A smell, not a hard rule: a <ul> of chips or Detail blocks legitimately uses gap.
  severity: 'warn',
  doc: 'CLAUDE.md padding section: a gap-* on a list container is a smell, rows need divide-y.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isJsxElement(node)) return;
        if (!['ul', 'ol'].includes(jsxName(node))) return;
        const cls = classOf(node);
        // Only a COLUMN of rows wants a divider. A horizontal list, a stepper or a row of chips,
        // is separated by space by definition and `divide-y` would draw a line down its side.
        if (!/\bflex-col\b/.test(cls)) return;
        if (/\bgap-\d/.test(cls) && !/divide-y/.test(cls)) {
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: 'list uses gap-* with no divide-y',
            snippet: cls.slice(0, 70),
          });
        }
      });
    }
    return out;
  },
};

export const cardBordered = {
  id: 'card-bordered',
  doc: 'ui-patterns: every Card takes bordered.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'Card') return;
        if (!hasAttr(node, 'bordered') && !hasAttr(node, 'loading')) {
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: '<Card> without bordered',
          });
        }
      });
    }
    return out;
  },
};

export const destructiveVariant = {
  id: 'destructive-button-variant',
  doc: 'ui-patterns §4: a destructive BUTTON is primary-destructive, never destructive.',
  why: '`destructive` renders transparent with red text and reads as a link.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!isEl(node)) return;
        const name = jsxName(node);
        // TableRowAction.variant is a separate union with no primary-destructive.
        if (!['Button', 'ReasonDialog', 'ReasonPopup'].includes(name)) return;
        const key = name === 'Button' ? 'variant' : 'confirmVariant';
        if (attrText(getAttr(node, key)) === 'destructive') {
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: `${name} ${key}="destructive", use primary-destructive`,
          });
        }
      });
    }
    return out;
  },
};

export const inlineOptionsArray = {
  id: 'memoized-options',
  doc: 'ui-patterns rule 9: options arrays must be memoized, never inlined.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      // A fixture array handed to a test harness has no re-render cost to save.
      if (/\.test\.tsx$/.test(f)) continue;
      const src = ast(f);
      visit(src, (node) => {
        if (!isEl(node)) return;
        const attr = getAttr(node, 'options');
        if (!attr?.initializer || !ts.isJsxExpression(attr.initializer)) return;
        const e = attr.initializer.expression;
        if (!e) return;
        // `[...alreadyMemoised]` is a required copy for a readonly prop, not a fresh computation.
        if (
          ts.isArrayLiteralExpression(e) &&
          e.elements.length === 1 &&
          ts.isSpreadElement(e.elements[0])
        )
          return;
        const isInline =
          ts.isArrayLiteralExpression(e) ||
          (ts.isCallExpression(e) && /\.map$/.test(e.expression.getText()));
        if (isInline) {
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: `inline options= on <${jsxName(node)}>, hoist or useMemo`,
          });
        }
      });
    }
    return out;
  },
};

export const pageButtonSize = {
  id: 'page-buttons-not-small',
  doc: 'ui-patterns §8b: page-level buttons are never size="sm".',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isJsxElement(node) || jsxName(node) !== 'SectionActions') return;
        visit(node, (child) => {
          if (!isEl(child) || jsxName(child) !== 'Button') return;
          if (attrText(getAttr(child, 'size')) === 'sm') {
            out.push({
              file: rel(f),
              line: lineOf(src, child.getStart()),
              message: 'size="sm" on a page-level action inside SectionActions',
            });
          }
        });
      });
    }
    return out;
  },
};

export const nativeControls = {
  id: 'no-native-controls',
  doc: 'ui-patterns rule 27 and the native date/time/file rule.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!isEl(node)) return;
        const name = jsxName(node);
        if (['input', 'select', 'textarea'].includes(name)) {
          // The kit control depends on the input's TYPE. Naming it makes the finding actionable
          // instead of pointing every native input at `Input`, which is a text box and cannot
          // stand in for a checkbox, a radio or a file picker.
          const type = name === 'input' ? (attrText(getAttr(node, 'type')) ?? 'text') : null;
          const swap = {
            checkbox: 'Checkbox',
            radio: 'RadioGroup',
            file: 'UploadField',
            date: 'DateSelector',
            time: 'TimeSelector',
          }[type ?? ''];
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: swap ? `native <input type="${type}">, use ${swap}` : `native <${name}>`,
          });
        }
        if (name === 'Input') {
          const t = attrText(getAttr(node, 'type'));
          if (['date', 'time', 'file'].includes(t)) {
            out.push({
              file: rel(f),
              line: lineOf(src, node.getStart()),
              message: `Input type="${t}", use DateSelector / TimeSelector / UploadField`,
            });
          }
        }
      });
    }
    return out;
  },
};

export const filterAllOption = {
  id: 'filter-uses-FilterDropdown',
  doc: 'CLAUDE.md: every filter can be widened back to "all", use FilterDropdown.',
  why: 'A bare Dropdown inside TableFilter cannot be cleared without Reset, which clears everything.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isJsxElement(node) || jsxName(node) !== 'TableFilter') return;
        visit(node, (child) => {
          if (isEl(child) && jsxName(child) === 'Dropdown') {
            out.push({
              file: rel(f),
              line: lineOf(src, child.getStart()),
              message: 'bare <Dropdown> inside <TableFilter>, use <FilterDropdown>',
            });
          }
        });
      });
    }
    return out;
  },
};

export const filterVariantThreshold = {
  id: 'filter-overflow-threshold',
  doc: 'ui-patterns §8b: 3+ filters go behind variant="popover".',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isJsxElement(node) || jsxName(node) !== 'TableFilter') return;
        if (attrText(getAttr(node, 'variant')) !== 'spread') return;
        let count = 0;
        visit(node, (child) => {
          if (
            isEl(child) &&
            /^(FilterDropdown|Dropdown|Combobox|DateRangeSelector)$/.test(jsxName(child))
          ) {
            count += 1;
          }
        });
        if (count > 2) {
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: `${count} filters on variant="spread", 3+ must be "popover"`,
          });
        }
      });
    }
    return out;
  },
};

// From the starter side only. Records-archive had dropped this rule; nothing replaced it, so it
// comes across verbatim.
export const filterNameRequired = {
  id: 'filter-needs-name',
  doc: 'Every control inside a TableFilter carries name. The name is the URL/state key the table synchronises on, so a control without one filters nothing that survives a reload or a share.',
  check(files) {
    const out = [];
    const CONTROLS =
      /^(FilterDropdown|Dropdown|Combobox|Input|DateSelector|DateRangeSelector|TimeSelector|Select)$/;
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isJsxElement(node) || jsxName(node) !== 'TableFilter') return;
        visit(node, (child) => {
          if (!isEl(child) || !CONTROLS.test(jsxName(child))) return;
          if (getAttr(child, 'name')) return;
          out.push({
            file: rel(f),
            line: lineOf(src, child.getStart()),
            message: `<${jsxName(child)}> inside <TableFilter> has no name, add name="<field>" so the filter survives a reload`,
          });
        });
      });
    }
    return out;
  },
};

export const workflowActionsFiltered = {
  id: 'workflow-actions-not-filtered',
  doc: 'CLAUDE.md: never filter an action out of WorkflowActions to render it yourself.',
  why: 'An escaped action sits outside the overflow budget, so the budget is a lie.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'WorkflowActions') return;
        const text = getAttr(node, 'actions')?.initializer?.getText() ?? '';
        if (/\.filter\s*\(/.test(text)) {
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: 'actions={...filter(...)}, every transition stays in the component',
          });
        }
      });
    }
    return out;
  },
};

/** The page-level action slot. A detail page has exactly one action cluster and it sits here. */
const ACTION_SLOT_HOSTS = new Set(['DetailShell', 'FormPage', 'RegisterPage', 'SplitQueue']);
/** Two controls is the budget, so a slot that skips WorkflowActions still may not exceed it. */
const HAND_ROLLED_BUDGET = 2;
/** Content that renders elsewhere on the screen, so its buttons are not part of the cluster. */
const OVERLAY_SURFACES = new Set([
  'PopupContent',
  'PopoverContent',
  'DialogContent',
  'ModalContent',
  'SheetContent',
  'SheetBody',
]);

export const pageActionsSingleCluster = {
  id: 'page-actions-single-cluster',
  doc: 'CLAUDE.md: the page action slot is ONE cluster, and WorkflowActions owns it.',
  why: 'A Button beside WorkflowActions sits outside the overflow budget, so the page shows three, four or five page-level actions and the budget means nothing.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!isEl(node) || !ACTION_SLOT_HOSTS.has(jsxName(node))) return;
        const slot = getAttr(node, 'actions');
        if (!slot?.initializer) return;

        const buttons = [];
        let cluster = false;
        // An overlay opened FROM the slot is its own surface, its Cancel and Confirm are not page actions.
        const walk = (n) => {
          if (isEl(n)) {
            const name = jsxName(n);
            if (OVERLAY_SURFACES.has(name)) return;
            if (name === 'WorkflowActions') cluster = true;
            if (name === 'Button') buttons.push(n);
          }
          n.forEachChild(walk);
        };
        walk(slot.initializer);

        if (cluster && buttons.length) {
          out.push({
            file: rel(f),
            line: lineOf(src, buttons[0].getStart()),
            message: `${buttons.length} <Button> beside <WorkflowActions>, every page action goes in the actions array`,
          });
          return;
        }
        if (!cluster && buttons.length > HAND_ROLLED_BUDGET) {
          out.push({
            file: rel(f),
            line: lineOf(src, buttons[HAND_ROLLED_BUDGET].getStart()),
            message: `${buttons.length} page-level buttons, past ${HAND_ROLLED_BUDGET} they belong in <WorkflowActions>`,
          });
        }
      });
    }
    return out;
  },
};

/** `Popup` is the 350px centred confirmation card. An overflow menu is a `Popover` with the kit's menu classes. */
export const overflowMenuIsPopover = {
  id: 'overflow-menu-is-popover',
  doc: 'CLAUDE.md: the More actions menu uses the library popover menu, never Popup.',
  why: '.clet-popup is 24px padding, a 24px gap and centred text at a fixed 350px, which is why a hand-built action menu inside it looks wrong.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isJsxElement(node) || jsxName(node) !== 'PopupBody') return;
        let items = 0;
        visit(node, (child) => {
          if (!isEl(child)) return;
          const name = jsxName(child);
          if (name === 'button' || name === 'Button') items += 1;
        });
        if (items > HAND_ROLLED_BUDGET) {
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: `${items} buttons in a <PopupBody>, an action menu is a Popover with clet-popover--menu`,
          });
        }
      });
    }
    return out;
  },
};

/**
 * Keep it in step with `MAX_ACTION_LABEL_CHARS` in `src/components/shared/ActionsMenu.tsx`. The
 * component truncates past this; the rule is what stops a label reaching that state at all.
 */
const MENU_LABEL_MAX = 24;

/**
 * Root identifier of a call chain: `X.filter(a).slice(b).map(c)` -> `X`. Peels `CallExpression`
 * and `PropertyAccessExpression` layers until an `Identifier` is left, or gives up.
 */
function rootIdentifierName(node) {
  let cur = node;
  while (ts.isCallExpression(cur) || ts.isPropertyAccessExpression(cur)) {
    cur = cur.expression;
  }
  return ts.isIdentifier(cur) ? cur.text : null;
}

export const menuActionLabelLength = {
  id: 'menu-action-label-length',
  doc: 'CLAUDE.md: an actions-menu label is short enough that it can never wrap.',
  why: 'The menu is a fixed width, so a long label wraps onto a second line and centres the overflow under the icon. That is the wrapping the shared ActionsMenu exists to end, and a cap is the only way it stays ended.',
  check(files) {
    const out = [];
    const tsFiles = files.filter((x) => x.endsWith('.tsx') || x.endsWith('.ts'));

    // Not every menu keeps the label and its trigger on the same object. A hand-rolled,
    // data-driven menu instead declares `{ ..., label, ... }` as a plain data array and wires the
    // click or select handler separately at the `.map()` call site, in this file or another one
    // that imports the array. Collect the NAME of every array whose elements end up under a
    // click/select handler, across the whole file set, so the object-literal pass below can still
    // catch a label kept off the action shape's own onSelect/onClick property.
    const mappedAsMenu = new Set();
    for (const f of tsFiles) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isCallExpression(node)) return;
        if (!ts.isPropertyAccessExpression(node.expression)) return;
        if (node.expression.name.text !== 'map') return;
        const rootName = rootIdentifierName(node.expression.expression);
        if (!rootName) return;
        const callback = node.arguments[0];
        if (!callback) return;
        let hasHandler = false;
        visit(callback, (n) => {
          if (hasHandler) return;
          if (isEl(n) && (getAttr(n, 'onClick') || getAttr(n, 'onSelect'))) {
            hasHandler = true;
            return;
          }
          if (
            ts.isObjectLiteralExpression(n) &&
            n.properties.some(
              (p) =>
                p.name &&
                ts.isIdentifier(p.name) &&
                (p.name.text === 'onSelect' || p.name.text === 'onClick'),
            )
          ) {
            hasHandler = true;
          }
        });
        if (hasHandler) mappedAsMenu.add(rootName);
      });
    }

    for (const f of tsFiles) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isObjectLiteralExpression(node)) return;
        const names = node.properties.map((p) =>
          p.name && ts.isIdentifier(p.name) ? p.name.text : null,
        );
        if (!names.includes('label')) return;

        // The action shape: something to show and something to run. `onClick` covers the kit's
        // own `TableRowAction`/`TableBulkAction`, which render in the same kebab menu. Failing
        // that, this object still counts if it is a data element of an array collected above.
        const declaredArrayName =
          ts.isArrayLiteralExpression(node.parent) &&
          ts.isVariableDeclaration(node.parent.parent) &&
          ts.isIdentifier(node.parent.parent.name)
            ? node.parent.parent.name.text
            : null;
        const isMappedMenuData = declaredArrayName != null && mappedAsMenu.has(declaredArrayName);

        if (!names.includes('onSelect') && !names.includes('onClick') && !isMappedMenuData) return;

        const labelProp = node.properties.find(
          (p) => p.name && ts.isIdentifier(p.name) && p.name.text === 'label',
        );
        if (!labelProp || !ts.isPropertyAssignment(labelProp)) return;

        // A ternary label carries two strings and both have to fit.
        visit(labelProp.initializer, (n) => {
          if (!ts.isStringLiteral(n) && !ts.isNoSubstitutionTemplateLiteral(n)) return;
          if (n.text.length <= MENU_LABEL_MAX) return;
          out.push({
            file: rel(f),
            line: lineOf(src, n.getStart()),
            message: `action label "${n.text}" is ${n.text.length} chars, the cap is ${MENU_LABEL_MAX}`,
          });
        });
      });
    }
    return out;
  },
};

export const inlineStyle = {
  id: 'no-inline-style',
  doc: 'ui-patterns rule 26.',
  why: 'Static inline styles belong in Tailwind. A data-driven fill is the sanctioned exception.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!isEl(node)) return;
        const attr = getAttr(node, 'style');
        if (!attr?.initializer || !ts.isJsxExpression(attr.initializer)) return;
        const e = attr.initializer.expression;
        if (!e || !ts.isObjectLiteralExpression(e)) return;
        const allStatic = e.properties.every(
          (p) =>
            ts.isPropertyAssignment(p) &&
            (ts.isStringLiteral(p.initializer) || ts.isNumericLiteral(p.initializer)),
        );
        if (allStatic && e.properties.length) {
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: 'static inline style, use a Tailwind arbitrary value',
          });
        }
      });
    }
    return out;
  },
};

/**
 * The library gives every Table slot a fixed vocabulary. Anything else in the slot is a naked
 * primitive standing in for a mechanism the library already owns, so these rules are ALLOWLISTS:
 * name what belongs, deny everything else.
 */
const SLOT_ALLOWLIST = {
  // Search hard left, actions hard right, and nothing else. STRICTER THAN THE LIBRARY on purpose:
  // its own `date-range-filter` example puts TableFilter straight into TableHeader. This estate
  // nests it under TableActions so every register's header has the same two-slot shape.
  // `RecordsSearchField` is this repo's controlled search field, standing in for `TableSearch`,
  // which the kit gives no way to clear from outside.
  TableHeader: ['TableSearch', 'RecordsSearchField', 'TableActions'],
  // Dropdown is allowed here and only here: the library's own table-actions example does it,
  // and a server-side sort is an action-area control, not a filter.
  // The last three are this repo's own thin wrappers: the toolbar composes kit parts,
  // SavedFilterSaveButton renders a kit `Button`, and ControlDashboardExport re-exports the kit's
  // `ExportButton`. Verified in the source, not taken on the wrapper's word.
  TableActions: [
    'TableFilter',
    'Dropdown',
    'Button',
    'ExportButton',
    'BulkImportModal',
    'Popup',
    'PopupTrigger',
    // The kit's overflow menu surface (ui-patterns SKILL.md line 830: "the overflow menu is a
    // Popover, never a Popup"), used to group more-than-two result-acting toolbar controls behind
    // one trigger. `Popup` and `PopupTrigger` were allowed here before the surface the standard
    // actually sanctions was.
    'Popover',
    'ControlDashboardFilterToolbar',
    'SavedFilterSaveButton',
    'RecordsSearchExport',
  ],
  // FilterDropdownField and FilterMultiSelectField are this repo's own thin wrappers over
  // Dropdown and Combobox, so they carry the same vocabulary as the parts they render.
  TableFilter: [
    'FilterDropdown',
    'FilterDropdownField',
    'FilterMultiSelectField',
    'DateRangeSelector',
    'DateSelector',
    'Combobox',
    'Input',
  ],
  TableFooter: ['TablePagination', 'TableBulkActions'],
};

export const tableSlotVocabulary = {
  id: 'table-slot-vocabulary',
  doc: 'ui-patterns §1/§3: a Table slot only takes the library parts made for it.',
  why: 'A bare Dropdown in TableHeader is a hand-rolled control standing in for a library mechanism.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isJsxElement(node)) return;
        const slot = jsxName(node);
        const allowed = SLOT_ALLOWLIST[slot];
        if (!allowed) return;
        // Direct children, but seen THROUGH `{cond ? <X/> : null}` and `{cond && <X/>}`:
        // a conditional does not change what the slot renders, only whether it renders.
        const direct = [];
        const unwrap = (n) => {
          if (isEl(n)) {
            direct.push(n);
            return;
          }
          if (ts.isJsxExpression(n) || ts.isParenthesizedExpression(n)) {
            if (n.expression) unwrap(n.expression);
            return;
          }
          if (ts.isConditionalExpression(n)) {
            unwrap(n.whenTrue);
            unwrap(n.whenFalse);
            return;
          }
          if (ts.isBinaryExpression(n)) {
            unwrap(n.right);
            return;
          }
          if (ts.isJsxFragment(n)) {
            n.children.forEach(unwrap);
            return;
          }
          // A `.map(...)` renders whatever the callback returns.
          if (ts.isCallExpression(n)) {
            n.arguments.forEach((a) => {
              if (ts.isArrowFunction(a) && a.body) unwrap(a.body);
            });
          }
        };
        node.children.forEach(unwrap);

        for (const child of direct) {
          const name = jsxName(child);
          if (allowed.includes(name)) continue;
          out.push({
            file: rel(f),
            line: lineOf(src, child.getStart()),
            message: `<${name}> is not allowed in <${slot}>, only ${allowed.join(', ')}`,
            snippet: `<${slot}> ... <${name}>`,
          });
        }
      });
    }
    return out;
  },
};

// RETIRED: `sort-uses-column-not-dropdown`.
// It assumed the library's TableColumn.sortable was the right answer. It is not, for this app:
// a register fetches ONE page, so column sort would reorder only the rows already on screen and
// silently lie about the register's order. The sort is server-side on purpose. Where it may sit
// is enforced by `table-slot-vocabulary` instead, which is the rule that actually held up.

/**
 * Filter controls that own their own line each are the single most common sprawl in these apps.
 * `TableFilter` defaults to a popover that collapses them behind one trigger. `variant="spread"`
 * opts out and lays them inline, which reads fine for one or two and badly past that. Two is the
 * same ceiling CLAUDE.md sets for every other repeated affordance.
 *
 * Count DIRECT CHILDREN, not a whitelist of kit control names. Several repos wrap each filter in a
 * local component (`FilterDropdownField`, `FilterSelect`), and a name whitelist silently misses
 * every one of them. One child of a TableFilter is one filter, whatever it is called.
 */
function directJsxChildren(node) {
  const kids = node.children ?? [];
  const out = [];
  for (const k of kids) {
    if (ts.isJsxElement(k) || ts.isJsxSelfClosingElement(k)) out.push(k);
    // `{flag && <Field/>}` and `{items.map(...)}` still occupy a slot in the row.
    else if (ts.isJsxExpression(k) && k.expression) {
      let found = false;
      visit(k, (d) => {
        if (!found && (ts.isJsxElement(d) || ts.isJsxSelfClosingElement(d))) {
          out.push(d);
          found = true;
        }
      });
    }
  }
  return out;
}

export const filtersGroupedPastTwo = {
  id: 'filters-grouped-past-two',
  doc: 'CLAUDE.md section 8b: more than two of anything groups into the kit overflow. A TableFilter carrying variant="spread" with more than two filters must drop the variant and use the default popover.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isJsxElement(node)) return;
        if (jsxName(node) !== 'TableFilter') return;
        if (attrText(getAttr(node, 'variant')) !== 'spread') return;
        const count = directJsxChildren(node).length;
        if (count > 2) {
          out.push({
            file: rel(f),
            line: lineOf(src, node.getStart()),
            message: `${count} filters spread inline, drop variant="spread" so they group into the popover`,
            snippet: `<TableFilter variant="spread"> with ${count} filters`,
          });
        }
      });
    }
    return out;
  },
};

/**
 * The rail's own footer already renders the CLET wordmark, so a brand at the top that also says
 * CLET says it twice and tells the reader nothing about which system they are in. The brand names
 * the SYSTEM: "Service Desk", "GRC", "Website CMS", "Records & Archive".
 */
const ORG_WORDS = /^(clet|gsl|rfd)$/i;

export const sidebarBrandNamesTheSystem = {
  id: 'sidebar-brand-names-the-system',
  doc: 'CLAUDE.md: SidebarBrand names the system, not the organisation. SidebarFooter already renders the CLET wordmark bottom-left.',
  check(files) {
    const out = [];
    for (const f of files.filter((x) => x.endsWith('.tsx'))) {
      const src = ast(f);
      visit(src, (node) => {
        if (!isEl(node) || jsxName(node) !== 'SidebarBrand') return;
        const title = attrText(getAttr(node, 'title'));
        const texts = [];
        if (title) texts.push(title);
        visit(node, (d) => {
          if (ts.isJsxText(d)) {
            const s = d.getText().trim();
            if (s) texts.push(s);
          }
        });
        for (const raw of texts) {
          const words = raw.trim().split(/\s+/);
          const bad = ORG_WORDS.test(raw.trim()) || (words.length > 1 && ORG_WORDS.test(words[0]));
          if (bad) {
            out.push({
              file: rel(f),
              line: lineOf(src, node.getStart()),
              message: `SidebarBrand reads "${raw.trim()}", name the system instead. The footer already shows the CLET wordmark`,
              snippet: raw.trim(),
            });
            break;
          }
        }
      });
    }
    return out;
  },
};

export default [
  cardPaddingChain,
  listGapSmell,
  cardBordered,
  destructiveVariant,
  inlineOptionsArray,
  pageButtonSize,
  nativeControls,
  filterAllOption,
  filterVariantThreshold,
  filterNameRequired,
  workflowActionsFiltered,
  pageActionsSingleCluster,
  overflowMenuIsPopover,
  menuActionLabelLength,
  inlineStyle,
  tableSlotVocabulary,
  filtersGroupedPastTwo,
  sidebarBrandNamesTheSystem,
];
