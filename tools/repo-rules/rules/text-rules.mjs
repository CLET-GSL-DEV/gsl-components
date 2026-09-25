// Rules that read source as text. Cheap, exact, and the ones that catch the most drift.
import { read, rel } from '../lib/core.mjs';

const isComment = (l) => /^\s*(\/\/|\*|\/\*)/.test(l);

// A dash carrying prose is fine. A dash standing alone is a null value wearing a costume.
// Padding makes it a separator (a dash inside `join(' ... ')`); only the unpadded literal is a value.
const DASH_LITERAL = /(['"`])[\u2014\u2013]+\1/;
const DASH_JSX_TEXT = />\s*(?:[\u2014\u2013-]+|&mdash;|&ndash;|&#x?(?:2014|2013|8212|8211);)\s*</i;
const DASH_ONLY_LINE = /^\s*[\u2014\u2013]+\s*$/;

export const noDashPlaceholder = {
  id: 'no-dash-placeholder',
  doc: 'CLAUDE.md: an empty value reads "N/A", never a bare dash.',
  why: 'A lone dash in a cell reads as a stray minus sign, and never says whether the value is absent or zero.',
  check(files) {
    const out = [];
    for (const f of files) {
      read(f)
        .split('\n')
        .forEach((line, i) => {
          if (isComment(line)) return;
          if (!DASH_LITERAL.test(line) && !DASH_JSX_TEXT.test(line) && !DASH_ONLY_LINE.test(line))
            return;
          out.push({
            file: rel(f),
            line: i + 1,
            message: 'bare dash placeholder, use N/A',
            snippet: line.trim(),
          });
        });
    }
    return out;
  },
};

// From the starter side only. The starter also carried a `no-em-dash` here; it is NOT brought
// across, because records-archive already ships a stricter `no-em-dash` in ai-copy-rules.mjs and
// two rules cannot share an id. The starter version exempted a line containing a bare quoted dash;
// `no-dash-placeholder` above bans that same literal outright, so nothing is lost.
export const oneLineComments = {
  id: 'one-line-comments',
  doc: 'CLAUDE.md: NO ESSAY COMMENTS. ONE LINE, OR NOTHING.',
  why: 'Multi-line comment blocks are the clearest tell that a file was written by a model.',
  check(files) {
    const out = [];
    for (const f of files) {
      const lines = read(f).split('\n');
      let i = 0;
      while (i < lines.length) {
        const s = lines[i].trim();
        if (s.startsWith('/*') && !s.includes('*/')) {
          const start = i;
          while (i < lines.length && !lines[i].includes('*/')) i += 1;
          out.push({
            file: rel(f),
            line: start + 1,
            message: `block comment spans ${i - start + 1} lines`,
            snippet: s,
          });
          i += 1;
          continue;
        }
        // Three or more stacked `//` lines is a paragraph wearing a disguise.
        if (s.startsWith('//') && !s.startsWith('///')) {
          const start = i;
          while (i < lines.length && lines[i].trim().startsWith('//')) i += 1;
          if (i - start >= 3) {
            out.push({
              file: rel(f),
              line: start + 1,
              message: `${i - start} stacked line comments`,
              snippet: s,
            });
          }
          continue;
        }
        i += 1;
      }
    }
    return out;
  },
};

export const noHardcodedFallbacks = {
  id: 'no-hardcoded-fallbacks',
  doc: 'CLAUDE.md: No Hardcoded Fallbacks.',
  why: 'A fallback makes a broken integration look like a working screen.',
  check(files) {
    const out = [];
    // Only fallbacks standing in for FETCHED data. A default page size or dialog message is config.
    const pattern =
      /(data|rows|results|items|list|options|scales?|criteria|records)\s*\)?\s*\?\?\s*\[?\s*(DEFAULT|MOCK|SAMPLE|FALLBACK|PLACEHOLDER|STUB|SEED)[A-Z_]*/i;
    for (const f of files) {
      read(f)
        .split('\n')
        .forEach((line, i) => {
          if (isComment(line)) return;
          if (pattern.test(line)) {
            out.push({
              file: rel(f),
              line: i + 1,
              message: 'fallback constant behind ??',
              snippet: line.trim(),
            });
          }
        });
    }
    return out;
  },
};

export const noEmoji = {
  id: 'no-emoji',
  doc: 'frontend-architecture rule 3: no emojis in code, docs, comments or commits.',
  why: 'Use a lucide-react icon in UI, and a word in a comment.',
  check(files) {
    const out = [];
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
    for (const f of files) {
      read(f)
        .split('\n')
        .forEach((line, i) => {
          if (emoji.test(line)) {
            out.push({ file: rel(f), line: i + 1, message: 'emoji', snippet: line.trim() });
          }
        });
    }
    return out;
  },
};

export const envOnlyInConfig = {
  id: 'env-only-in-config',
  doc: 'frontend-architecture §7: no file touches import.meta.env except config/env.ts.',
  why: 'Every env var is declared once, per app, behind a zod schema.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (/config\/env\.ts$/.test(f) || /src\/core\/api-client\/env\.ts$/.test(f)) continue;
      read(f)
        .split('\n')
        .forEach((line, i) => {
          if (line.includes('import.meta.env')) {
            out.push({
              file: rel(f),
              line: i + 1,
              message: 'import.meta.env outside config/env.ts',
              snippet: line.trim(),
            });
          }
        });
    }
    return out;
  },
};

export const noPageSkeletonForSections = {
  id: 'loading-per-section',
  doc: 'CLAUDE.md: Loading is per section, never per page.',
  why: 'One card in flight must not blank the page around it.',
  check(files) {
    const out = [];
    for (const f of files) {
      // A route guard is page-level by definition: it runs before a page is chosen, so there is no
      // section to load inside and `PageSkeleton` is the only honest thing it can render. The rule
      // is about a page blanking its own cards, which is `src/modules`, not `src/routes`.
      if (/src\/routes\//.test(f)) continue;
      // A detail/form page may block on its own record via the kit shells, never via a bare return.
      read(f)
        .split('\n')
        .forEach((line, i) => {
          if (/return\s+<PageSkeleton\s*\/>/.test(line)) {
            out.push({
              file: rel(f),
              line: i + 1,
              message: 'page-level loading guard, use DetailShell/FormPage loading or PanelState',
              snippet: line.trim(),
            });
          }
          // `animate-pulse` skeleton ROWS are sanctioned for lists and tables, they mirror the
          // content that is coming. A spinner is not: the library ships LogoLoader.
          if (/animate-spin/.test(line) && !isComment(line)) {
            out.push({
              file: rel(f),
              line: i + 1,
              message: 'hand-rolled spinner, use LogoLoader or Button loading',
              snippet: line.trim(),
            });
          }
        });
    }
    return out;
  },
};

export const noCodemodArtifacts = {
  id: 'no-truncated-comment',
  doc: 'CLAUDE.md: NEVER SED, AWK OR REGEX-CODEMOD A SOURCE FILE.',
  why: 'A comment ending on a dangling function word is the signature of a regex sweep that cut mid-sentence.',
  check(files) {
    const out = [];
    const dangling = /\b(the|a|an|of|to|in|and|or|for|with|that|which|by|from|its)\.\s*(\*\/)?$/i;
    for (const f of files) {
      read(f)
        .split('\n')
        .forEach((line, i) => {
          const s = line.trim();
          if (!s.startsWith('//') && !s.startsWith('/**')) return;
          if (s.startsWith('///')) return;
          // Only flag when it also looks like a marker, those are the ones worth losing sleep over.
          if (dangling.test(s) && /(BACKEND NOTE|DEV-WORKAROUND|TODO|BUG|NOTE):/i.test(s)) {
            out.push({
              file: rel(f),
              line: i + 1,
              message: 'marker comment cut mid-sentence',
              snippet: s,
            });
          }
        });
    }
    return out;
  },
};

// `CenteredMessage` was a local <p> that rendered a wait as small grey text. It shipped on the
// OIDC callback, where the user stares at it for the whole code exchange, and it looked broken.
// The repo already has one loader; a second one is drift, so the name is banned outright.
export const noCenteredMessage = {
  id: 'no-centered-message',
  doc: 'CLAUDE.md: waits render with the shared PageSkeleton, never a local centered-text component.',
  why: 'A one-off centered <p> is an unbranded loader that reads as a broken page, and it splits the loading treatment in two.',
  check(files) {
    const out = [];
    const name = /\bCenteredMessage\b/;
    for (const f of files) {
      read(f)
        .split('\n')
        .forEach((line, i) => {
          if (!name.test(line)) return;
          out.push({
            file: rel(f),
            line: i + 1,
            message:
              'CenteredMessage is banned, use <PageSkeleton /> from @core/ui or a @rfdtech/components loading prop',
            snippet: line.trim(),
          });
        });
    }
    return out;
  },
};

export default [
  noDashPlaceholder,
  oneLineComments,
  noHardcodedFallbacks,
  noEmoji,
  envOnlyInConfig,
  noPageSkeletonForSections,
  noCodemodArtifacts,
  noCenteredMessage,
];
