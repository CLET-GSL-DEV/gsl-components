#!/usr/bin/env node
// `pnpm rules:check` - the executable form of CLAUDE.md.
//
//   pnpm rules:check                 every rule, every file
//   pnpm rules:check --staged        staged files only (the pre-commit path)
//   pnpm rules:check --rule <id>     one rule
//   pnpm rules:check --agent         adds the tier-3 model review (costs tokens)
//   pnpm rules:check --json          machine-readable, for a subagent to consume
//   pnpm rules:check --all           ignore local-exclusions.mjs and run every rule in the tree
//
// Every rule file in `rules/` is registered here, unconditionally, so this file stays identical in
// every repo and a rule added to the template reaches a repo the moment the harness is synced.
// What a repo does NOT yet enforce is named by ID in `local-exclusions.mjs`, which is pinned and
// never synced. Keeping the two apart is what stopped this file conflicting on every sync: it used
// to carry a repo's exclusions as commented-out imports, so the shared registry and one repo's
// debt were the same edit.
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { runAgentRules } from './agent/review.mjs';
import { ROOT, allFiles, stagedFiles, suppressed } from './lib/core.mjs';
import { NOT_REGISTERED_HERE } from './local-exclusions.mjs';
import a11yRules from './rules/a11y-rules.mjs';
import aiCopyRules from './rules/ai-copy-rules.mjs';
import apiRules from './rules/api-rules.mjs';
import cardRules from './rules/card-rules.mjs';
import componentSizeRules from './rules/component-size-rules.mjs';
import cssRules from './rules/css-rules.mjs';
import dateCellRules from './rules/date-cell-rules.mjs';
import detailPageRules from './rules/detail-page-rules.mjs';
import docsRules from './rules/docs-rules.mjs';
import duplicationRules from './rules/duplication-rules.mjs';
import fieldRules from './rules/field-rules.mjs';
import flowRules from './rules/flow-rules.mjs';
import headingRules from './rules/heading-rules.mjs';
import inputRules from './rules/input-rules.mjs';
import invalidationRules from './rules/invalidation-rules.mjs';
import jsxRules from './rules/jsx-rules.mjs';
import kpiRules from './rules/kpi-rules.mjs';
import loaderRules from './rules/loader-rules.mjs';
import memoRules from './rules/memo-rules.mjs';
import metricRules from './rules/metric-rules.mjs';
import mutationUiRules from './rules/mutation-ui-rules.mjs';
import navRules from './rules/nav-rules.mjs';
import overlayRules from './rules/overlay-rules.mjs';
import pageHeaderRules from './rules/page-header-rules.mjs';
import pageRhythmRules from './rules/page-rhythm-rules.mjs';
import qualityRules from './rules/quality-rules.mjs';
import routeRules from './rules/route-rules.mjs';
import shellRules from './rules/shell-rules.mjs';
import tabDestinationRules from './rules/tab-destination-rules.mjs';
import tabRules from './rules/tab-rules.mjs';
import tableHeaderRules from './rules/table-header-rules.mjs';
import tabsVariantRules from './rules/tabs-variant-rules.mjs';
import textRules from './rules/text-rules.mjs';

const ALL_RULES = [
  ...a11yRules,
  ...textRules,
  ...jsxRules,
  ...cardRules,
  ...fieldRules,
  ...flowRules,
  ...routeRules,
  ...inputRules,
  ...aiCopyRules,
  ...pageHeaderRules,
  ...pageRhythmRules,
  ...mutationUiRules,
  ...headingRules,
  ...navRules,
  ...metricRules,
  ...apiRules,
  ...invalidationRules,
  ...qualityRules,
  ...memoRules,
  ...duplicationRules,
  ...componentSizeRules,
  ...cssRules,
  ...tabRules,
  ...tabDestinationRules,
  ...tabsVariantRules,
  ...kpiRules,
  ...tableHeaderRules,
  ...shellRules,
  ...overlayRules,
  ...dateCellRules,
  ...detailPageRules,
  ...loaderRules,
  ...docsRules,
];

// A duplicate id makes `--rule <id>` ambiguous and double-reports the same site, so the merged
// registry refuses to start rather than run in that state.
const seen = new Set();
const duplicates = ALL_RULES.map((r) => r.id).filter((id) =>
  seen.has(id) ? true : (seen.add(id), false),
);
if (duplicates.length) {
  console.error(`Duplicate rule ids in the registry: ${[...new Set(duplicates)].join(', ')}`);
  process.exit(2);
}

// An exclusion naming a rule the registry does not carry is a stale entry, and a stale entry is
// how a rule quietly stops being enforced after somebody renames its id. Say so rather than
// silently matching nothing.
const known = new Set(ALL_RULES.map((r) => r.id));
const unknownExclusions = [...NOT_REGISTERED_HERE.keys()].filter((id) => !known.has(id));
if (unknownExclusions.length) {
  console.error(
    `local-exclusions.mjs names rules that are not in the registry: ${unknownExclusions.join(', ')}`,
  );
  process.exit(2);
}

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const value = (f, d) => (argv.includes(f) ? argv[argv.indexOf(f) + 1] : d);

// `--all` runs the excluded rules too, which is how you re-measure the counts written beside them.
const RULES = has('--all') ? ALL_RULES : ALL_RULES.filter((r) => !NOT_REGISTERED_HERE.has(r.id));

export { ALL_RULES, RULES };

const C = process.stdout.isTTY
  ? {
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      green: '\x1b[32m',
      dim: '\x1b[2m',
      bold: '\x1b[1m',
      off: '\x1b[0m',
    }
  : { red: '', yellow: '', green: '', dim: '', bold: '', off: '' };

async function main() {
  const files = has('--staged') ? stagedFiles() : allFiles();
  const only = value('--rule', null);
  const active = only ? RULES.filter((r) => r.id === only) : RULES;

  if (only && !active.length) {
    console.error(`Unknown rule "${only}". Known: ${RULES.map((r) => r.id).join(', ')}`);
    process.exit(2);
  }
  if (!files.length) {
    if (!has('--json')) console.log('No source files in scope.');
    process.exit(0);
  }

  const results = [];
  let suppressedCount = 0;
  for (const rule of active) {
    let findings = [];
    try {
      findings = rule.check(files) ?? [];
    } catch (error) {
      console.error(`${C.red}rule ${rule.id} crashed:${C.off} ${error.message}`);
      process.exitCode = 2;
    }
    const before = findings.length;
    findings = findings.filter((f) => !suppressed(path.join(ROOT, f.file), f.line, rule.id));
    suppressedCount += before - findings.length;
    if (findings.length) results.push({ rule, findings });
  }

  let agent = null;
  if (has('--agent')) {
    agent = await runAgentRules(files, {
      limit: Number(value('--agent-limit', 40)),
      verbose: has('--verbose'),
    });
  }

  const errors = results.filter((r) => (r.rule.severity ?? 'error') === 'error');
  const warns = results.filter((r) => r.rule.severity === 'warn');
  const total = errors.reduce((n, r) => n + r.findings.length, 0);
  const warnTotal = warns.reduce((n, r) => n + r.findings.length, 0);
  // Agent findings are ADVISORY by default. A model's judgement produces false positives, and a
  // gate that blocks on one teaches people to bypass the gate. --agent-strict makes them block.
  const agentBlocks = has('--agent-strict');
  const agentTotal = agentBlocks ? (agent?.findings.length ?? 0) : 0;
  const agentSeen = agent?.findings.length ?? 0;

  if (has('--json')) {
    console.log(
      JSON.stringify(
        {
          files: files.length,
          total: total + agentTotal,
          rules: results.map((r) => ({ id: r.rule.id, doc: r.rule.doc, findings: r.findings })),
          agent,
        },
        null,
        2,
      ),
    );
    process.exit(total + agentTotal ? 1 : 0);
  }

  // The excluded count is printed on every run on purpose. Debt that is not on screen is debt
  // nobody pays down, and this is the number that says how much of the harness is switched off.
  const excluded = has('--all') ? 0 : NOT_REGISTERED_HERE.size;
  console.log(
    `${C.bold}repo rules${C.off} ${C.dim}${files.length} files, ${active.length} deterministic rules` +
      `${excluded ? `, ${excluded} not registered here (see tools/repo-rules/local-exclusions.mjs)` : ''}${C.off}\n`,
  );

  for (const { rule, findings } of [...errors, ...warns]) {
    const tint = rule.severity === 'warn' ? C.yellow : C.red;
    console.log(
      `${tint}${rule.id}${C.off}  ${C.dim}${findings.length} ${findings.length === 1 ? 'violation' : 'violations'}${C.off}`,
    );
    console.log(`${C.dim}  ${rule.doc}${C.off}`);
    if (rule.why) console.log(`${C.dim}  ${rule.why}${C.off}`);
    for (const f of findings.slice(0, 12)) {
      console.log(`    ${f.file}:${f.line}  ${f.message ?? ''}`);
      if (f.snippet) console.log(`${C.dim}      ${f.snippet.slice(0, 100)}${C.off}`);
    }
    if (findings.length > 12)
      console.log(`${C.dim}    ... and ${findings.length - 12} more${C.off}`);
    console.log();
  }

  if (agent) {
    if (agent.skipped) {
      console.log(`${C.yellow}agent tier skipped${C.off}  ${C.dim}${agent.skipped}${C.off}\n`);
    } else {
      console.log(
        `${C.bold}agent tier${C.off} ${C.dim}${agent.backend}, ${agent.asked} questions, ${agentSeen} flagged${agentBlocks ? '' : ' (advisory)'}${C.off}`,
      );
      for (const f of agent.findings) {
        console.log(`    ${C.yellow}${f.rule}${C.off}  ${f.file}:${f.line}  ${f.message}`);
        console.log(`${C.dim}      ${f.snippet}${C.off}`);
      }
      if (agent.truncated) console.log(`${C.dim}    ${agent.truncated}${C.off}`);
      console.log();
    }
  }

  if (suppressedCount) console.log(`${C.dim}${suppressedCount} suppressed via rules-allow${C.off}`);
  if (warnTotal)
    console.log(`${C.yellow}${warnTotal} warnings${C.off} ${C.dim}(smells, do not block)${C.off}`);
  if (total + agentTotal === 0) {
    console.log(`${C.green}clean${C.off} - every blocking repo rule holds.`);
    process.exit(0);
  }
  console.log(
    `${C.red}${total + agentTotal} blocking violations${C.off} across ${errors.length + (agentTotal ? 1 : 0)} rules.`,
  );
  console.log(`${C.dim}Run one rule at a time: pnpm rules:check --rule <id>${C.off}`);
  process.exit(1);
}

// Run only when this file IS the command. Importing it (the duplicate-id check, a test harness)
// then gets the RULES array without the CLI running and calling process.exit underneath it.
const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exit(2);
  });
}
