// CSS custom-utility rules: a utility that reads a token must survive the token being absent.
import fs from 'node:fs';
import path from 'node:path';

import { ROOT, read, rel } from '../lib/core.mjs';

/**
 * Every `.css` file under `src/`, base layer included. The harness hands each rule only
 * `allFiles()`, which excludes both `src/core` and non-TS files, but the utility this rule
 * protects (`gap-body` in `src/core/styles/theme.css`) lives in the base layer. Like the
 * invalidation map, this is a repo-wide question, so the scan is too.
 */
function cssFiles() {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (/node_modules|dist|coverage/.test(full)) continue;
      if (entry.isDirectory()) walk(full);
      else if (full.endsWith('.css')) out.push(full);
    }
  };
  const src = path.join(ROOT, 'src');
  if (fs.existsSync(src)) walk(src);
  return out;
}

/** Every `--token:` definition across the scanned CSS. A token defined here is a promise the
 * repo itself keeps, so reading it without a fallback cannot silently delete the declaration. */
function definedTokens(files) {
  const defined = new Set();
  for (const f of files) {
    for (const m of read(f).matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1]);
  }
  return defined;
}

/** The `@utility <name> { ... }` blocks in a stylesheet, with balanced braces so nested rules
 * (`&::-webkit-scrollbar`) do not cut the block short. Returns name, body and start line. */
function utilityBlocks(src) {
  const blocks = [];
  const re = /@utility\s+([\w-]+)\s*\{/g;
  let m;
  while ((m = re.exec(src))) {
    let depth = 1;
    let i = re.lastIndex;
    while (i < src.length && depth > 0) {
      if (src[i] === '{') depth += 1;
      else if (src[i] === '}') depth -= 1;
      i += 1;
    }
    blocks.push({
      name: m[1],
      body: src.slice(re.lastIndex, i - 1),
      startLine: src.slice(0, m.index).split('\n').length,
    });
  }
  return blocks;
}

/**
 * Every `var(--x)` / `var(--x, fallback)` in a block body, with balanced parens so a nested
 * fallback chain (`var(--a, var(--b, 1rem))`) reads as one use. A comma at the top paren level
 * is the fallback; anything without one is reported with its line offset inside the body.
 */
function varUses(body) {
  const out = [];
  let idx = 0;
  while (true) {
    const at = body.indexOf('var(', idx);
    if (at === -1) break;
    let depth = 1;
    let i = at + 4;
    let topComma = false;
    while (i < body.length && depth > 0) {
      const ch = body[i];
      if (ch === '(') depth += 1;
      else if (ch === ')') depth -= 1;
      else if (ch === ',' && depth === 1) topComma = true;
      i += 1;
    }
    const name = body.slice(at + 4, i - 1).match(/^\s*(--[\w-]+)/)?.[1] ?? null;
    out.push({ name, hasFallback: topComma, lineOffset: body.slice(0, at).split('\n').length - 1 });
    idx = i;
  }
  return out;
}

/** A custom utility that reads a CSS variable supplies a fallback, so an undefined token cannot
 * silently delete the declaration. */
export const cssVarNeedsFallback = {
  id: 'css-var-needs-fallback',
  doc: 'A custom utility that reads a CSS variable supplies a fallback, so an undefined token cannot silently delete the declaration.',
  why: '`gap-body` read `--gsl-app-layout-body-gap`, nothing ever defined it, the declaration was discarded as invalid, and every full width section on every page rendered flush with no gap while the page rule that was written to catch this reported clean. Tokens the repo defines itself are exempt: that promise is kept here, so only a token nobody defines needs the fallback.',
  check() {
    const files = cssFiles();
    const defined = definedTokens(files);
    const out = [];
    for (const f of files) {
      const src = read(f);
      for (const block of utilityBlocks(src)) {
        for (const use of varUses(block.body)) {
          if (!use.name || use.hasFallback || defined.has(use.name)) continue;
          const line = block.startLine + use.lineOffset;
          out.push({
            file: rel(f),
            line,
            message: `var(${use.name}) has no fallback and ${use.name} is not defined in the repo CSS: an undefined token makes the whole declaration invalid, so this line does nothing. Use var(${use.name}, <fallback>)`,
            snippet: read(f).split('\n')[line - 1]?.trim(),
          });
        }
      }
    }
    return out;
  },
};

export default [cssVarNeedsFallback];
