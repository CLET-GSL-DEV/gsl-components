#!/usr/bin/env node
// Replace em and en dashes everywhere EXCEPT inside string and JSX-text literals.
//
//   node tools/repo-rules/codemods/strip-dashes.mjs --dry
//   node tools/repo-rules/codemods/strip-dashes.mjs --write
//
// A regex sweep over whole files is banned by CLAUDE.md and would be wrong here anyway: a dash
// inside a string literal is UI copy, and the right replacement there is a human's call.
//
// So the protected set is computed from the AST (every string, template and JSX text node) and
// everything outside it, which is comments, is rewritten. Protecting literals rather than
// enumerating comments is the safer direction: a comment the scanner misses is a missed fix,
// but a literal it misses is mangled user-facing copy.
import fs from 'node:fs';
import process from 'node:process';

import { allFiles, ast, rel, ts, visit } from '../lib/core.mjs';

const WRITE = process.argv.includes('--write');
const DASH = /[\u2014\u2013]/;

/**
 * A spaced dash between words becomes `, `. Anything else degrades to a plain hyphen, so no
 * line is left reading as a typo.
 */
function rewrite(text) {
  return text
    .replace(/(\S) [\u2014\u2013] (\S)/g, '$1, $2')
    .replace(/(\S)[\u2014\u2013] /g, '$1, ')
    .replace(/[\u2014\u2013]/g, '-');
}

let changedFiles = 0;
const protectedHits = [];

for (const file of allFiles()) {
  const src = fs.readFileSync(file, 'utf8');
  if (!DASH.test(src)) continue;

  const protectedRanges = [];
  visit(ast(file), (node) => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node) ||
      ts.isJsxText(node) ||
      ts.isRegularExpressionLiteral(node)
    ) {
      protectedRanges.push([node.getStart(), node.getEnd()]);
    }
  });

  const isProtected = (i) => protectedRanges.some(([s, e]) => i >= s && i < e);

  let out = '';
  let cursor = 0;
  let changed = false;
  for (let i = 0; i < src.length; i += 1) {
    if (!DASH.test(src[i])) continue;
    if (isProtected(i)) {
      const line = src.slice(0, i).split('\n').length;
      protectedHits.push(`${rel(file)}:${line}  ${src.split('\n')[line - 1].trim().slice(0, 90)}`);
      continue;
    }
    // Rewrite the whole line the dash sits on, so the spacing rules see their context.
    const lineStart = src.lastIndexOf('\n', i) + 1;
    let lineEnd = src.indexOf('\n', i);
    if (lineEnd === -1) lineEnd = src.length;
    if (lineStart < cursor) continue;
    out += src.slice(cursor, lineStart) + rewrite(src.slice(lineStart, lineEnd));
    cursor = lineEnd;
    changed = true;
  }
  out += src.slice(cursor);

  if (changed) {
    changedFiles += 1;
    if (WRITE) fs.writeFileSync(file, out);
  }
}

console.log(`${WRITE ? 'rewrote' : 'would rewrite'} ${changedFiles} files`);
if (protectedHits.length) {
  const uniq = [...new Set(protectedHits)];
  console.log(`\n${uniq.length} dashes inside string/JSX literals, left for a human:`);
  for (const line of uniq) console.log('  ' + line);
}
