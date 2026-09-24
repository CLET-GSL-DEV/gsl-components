// What must never reach a screen, and what must never pad a comment.
//
// Three separate leaks, all of which read as "a model wrote this from the spec, not for a user":
// internal spec ids, backend implementation talk, and dash characters CLAUDE.md bans outright.
import { read, rel } from '../lib/core.mjs';

/** A user-visible string: JSX text, or a prop that renders as words. */
const COPY_PROPS =
  /\b(?:label|title|description|placeholder|message|emptyMessage|hint|heading|tagline|eyebrow|ctaLabel|errorMessage|helpText|subtitle|confirmLabel|cancelLabel|aria-label)\s*[=:]/;

function isCommentLine(trimmed) {
  return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
}

/** Lines that plausibly render to a user. Comments and imports excluded. */
/**
 * A sentence the formatter wrapped is still one sentence.
 *
 * This used to test each line alone, so copy split across a line break escaped every check whenever
 * the offending half did not itself start like copy. "the fleet service exposes no time-series
 * endpoint" shipped to a live dashboard that way: prettier had broken the line before it, and the
 * half carrying the confession began with an interpolation. So a matched line now carries its
 * continuation lines with it, and the match runs against the whole sentence.
 */
function copyLines(text) {
  const out = [];
  const lines = text.split('\n');
  // A prose line need not carry its own tag: prettier puts `<p>` on the line above, so the
  // sentence begins bare. A line that opens with a capitalised word and is not a statement is
  // copy, and BACKEND_TALK is narrow enough that widening the net here costs nothing.
  const isCopyStart = (t) =>
    COPY_PROPS.test(t) ||
    /[>"']\s*[A-Z][a-z]/.test(t) ||
    (/^[A-Z][a-z]/.test(t) && !/^[A-Z][A-Za-z0-9_]*[.(<{]/.test(t) && !/[;{]$/.test(t));
  // A continuation is an ordinary prose line: no tag opening it, no statement shape.
  // A continuation may open with an interpolation: `{DAYS}-day window; ...` is the second half of
  // a sentence, and rejecting every line that starts with a brace is what let the leak through.
  const isContinuation = (t) =>
    t &&
    !isCommentLine(t) &&
    !/^[<}]|^\/>|^import\b|^export\b|^const\b|^return\b|[;{]$/.test(t) &&
    !/^\{\s*\/\*/.test(t) &&
    // The next key of an object literal, or the next JSX attribute, is a new thing and not the rest
    // of this sentence. Without this the join ran on and swallowed `endpoint: ...` from the line
    // below a subtitle, which reported four leaks that were nothing but the word "endpoint".
    !/^[A-Za-z_$][\w$-]*\s*[:=]/.test(t);

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    if (!trimmed || isCommentLine(trimmed)) continue;
    if (/^import\b|^export \*|^from '/.test(trimmed)) continue;
    if (!isCopyStart(trimmed)) continue;

    let joined = trimmed;
    for (let j = i + 1; j < lines.length && j <= i + 4; j += 1) {
      const next = lines[j].trim();
      if (!isContinuation(next) || isCopyStart(next)) break;
      joined += ' ' + next;
    }
    out.push({ line: i + 1, text: lines[i], trimmed: joined });
  }
  return out;
}

/** SRS / system identifiers that mean nothing to the officer reading the screen. */
const SPEC_ID =
  /\b(?:FR-[A-Z]{2}-\d|SRS[- ]?\d|\bS0\d{2}\b|\bSYSTEM[- ]?\d{2}\b|§\s*\d|GAP-\d{3}|DEV-\d{3}|CHG-\d{3})/;

/**
 * A spec id never reaches a screen.
 *
 * `FR-RM-001` and `S004` are how the programme numbers its requirements. To the officer reading
 * the page they are noise, and they tell anyone outside CLET how the system is decomposed.
 */
export const noSpecIdInUi = {
  id: 'no-spec-id-in-ui',
  doc: 'No SRS/system identifiers in user-visible copy: no FR-xx-000, S004, SYSTEM-17, GAP-000.',
  why: 'A requirement number is noise to the officer and leaks how the programme is decomposed.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      for (const { line, trimmed } of copyLines(read(f))) {
        if (!SPEC_ID.test(trimmed)) continue;
        out.push({
          file: rel(f),
          line,
          message: 'spec identifier in user-visible copy',
          snippet: trimmed.slice(0, 80),
        });
      }
    }
    return out;
  },
};

/** Implementation vocabulary the user has no way to act on. */
const BACKEND_TALK =
  /\b(?:endpoint|the backend|backend (?:does|is|has|returned)|API (?:does|is|returned|call)|not implemented (?:yet|in the (?:backend|API))|server (?:does not|doesn't) (?:support|return)|no such (?:endpoint|route)|501|unimplemented)\b/i;

/**
 * The screen says what the user can do, never what the backend lacks.
 *
 * "The backend does not expose this endpoint yet" is an internal status note. The officer cannot
 * act on it, and it is the wrong answer to give them: an empty state or an error is honest and
 * useful, an implementation confession is neither.
 */
export const noBackendLeakInUi = {
  id: 'no-backend-leak-in-ui',
  doc: 'UI copy never mentions endpoints, the backend, or what is unimplemented.',
  why: 'The officer cannot act on an implementation confession; an empty or error state is honest.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (!f.endsWith('.tsx') || /\.test\.tsx$/.test(f)) continue;
      for (const { line, trimmed } of copyLines(read(f))) {
        if (!BACKEND_TALK.test(trimmed)) continue;
        out.push({
          file: rel(f),
          line,
          message: 'backend implementation detail in user-visible copy',
          snippet: trimmed.slice(0, 80),
        });
      }
    }
    return out;
  },
};

/**
 * No em dash, no en dash. Anywhere.
 *
 * The org CLAUDE.md bans both outright: a comma, a colon, two sentences, a middot for a value
 * separator, a hyphen for a range. This is the executable form of that rule.
 */
export const noEmDash = {
  id: 'no-em-dash',
  doc: 'CLAUDE.md: never an em dash or en dash. Use a comma, a colon, or two sentences.',
  why: 'The org bans both outright; a dash is also the single most reliable generated-text tell.',
  check(files) {
    const out = [];
    for (const f of files) {
      const lines = read(f).split('\n');
      for (let i = 0; i < lines.length; i += 1) {
        // Escaped rather than literal so this file passes its own rule.
        const hit = /[\u2014\u2013]/.exec(lines[i]);
        if (!hit) continue;
        out.push({
          file: rel(f),
          line: i + 1,
          message: `${hit[0] === '\u2014' ? 'em' : 'en'} dash`,
          snippet: lines[i].trim().slice(0, 80),
        });
      }
    }
    return out;
  },
};

/**
 * A comment matches the comment density of the file it sits in.
 *
 * The rule is NOT a line count. A file whose own style is thorough prose keeps its prose; a file
 * that carries no comments at all does not suddenly acquire an explanatory block. What reads as
 * generated is the DEVIATION: three stacked lines dropped into a file whose every other comment is
 * a single line, or a paragraph added to a file that had none.
 *
 * So the baseline is the file's own median comment length, and a comment is only flagged when it
 * runs well past what that file already does.
 */
export const commentMatchesFileDensity = {
  id: 'comment-matches-file-density',
  doc: "A comment matches the density of the file it is in. Do not break the file's own pattern.",
  why: 'What reads as generated is the deviation, not the length. Match the file, do not reformat it.',
  check(files) {
    const out = [];
    for (const f of files) {
      const lines = read(f).split('\n');

      // Group consecutive `//` lines into blocks, skipping tool directives.
      const blocks = [];
      let i = 0;
      while (i < lines.length) {
        const isComment = (t) => t.trim().startsWith('//') && !t.trim().startsWith('///');
        if (!isComment(lines[i])) {
          i += 1;
          continue;
        }
        const start = i;
        while (i < lines.length && isComment(lines[i])) i += 1;
        const first = lines[start].trim().replace(/^\/+/, '').trim();
        if (/^(eslint|ts-|@ts-|prettier-|rules-allow|NOSONAR|nosemgrep|SRS ANCHOR)/i.test(first))
          continue;
        blocks.push({ line: start + 1, span: i - start, first });
      }

      // A file needs a few comments before it has a "pattern" worth deviating from.
      if (blocks.length < 3) continue;

      const spans = blocks.map((b) => b.span).sort((a, b) => a - b);
      const median = spans[Math.floor(spans.length / 2)];
      // Flag a block that runs more than double the file's own median AND is genuinely long.
      const ceiling = Math.max(median * 2, median + 2);

      for (const b of blocks) {
        if (b.span <= ceiling || b.span < 3) continue;
        out.push({
          file: rel(f),
          line: b.line,
          message: `${b.span}-line comment in a file whose comments run ${median}, match the file`,
          snippet: b.first.slice(0, 80),
        });
      }
    }
    return out;
  },
};

export default [noSpecIdInUi, noBackendLeakInUi, noEmDash, commentMatchesFileDensity];
