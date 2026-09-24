// Tier 3: the rules a parser cannot settle, handed to a small model for a yes/no.
//
// Deliberately NOT wired into pre-commit. It costs tokens and seconds per run, and a hook that
// stalls on a network call is a hook people disable. It runs on demand and in CI.
import { execFileSync } from 'node:child_process';

import { read, rel } from '../lib/core.mjs';

/**
 * Backends, cheapest first. `cmd` takes a prompt on stdin and prints one line.
 * Whichever is on PATH wins, override with RULES_AGENT=pi|claude|opencode.
 */
const BACKENDS = {
  opencode: {
    bin: 'opencode',
    args: (m) => ['run', '--model', m],
    model: 'deepseek/deepseek-v4-flash',
  },
  pi: { bin: 'pi', args: (m) => ['--model', m, '--no-tools'], model: 'anthropic/claude-haiku-4-5' },
  claude: { bin: 'claude', args: (m) => ['-p', '--model', m], model: 'haiku' },
};

/**
 * Rules that genuinely need judgement. Each gets ONE narrow question and a snippet, never the
 * whole file: a small model is reliable on "does this string name a backend concept" and
 * unreliable on "audit this page".
 */
export const AGENT_RULES = [
  {
    id: 'copy-is-user-facing',
    doc: 'ui-patterns §8b: never explain a backend limitation or name an internal system on screen.',
    // Only user-visible strings, so only labels files.
    match: (f) => /labels\.ts$/.test(f),
    extract: (text) => [...text.matchAll(/^\s*\w+:\s*'([^']{25,200})',/gm)].map((m) => m[1]),
    question: (s) =>
      `A UI string shown to a government compliance officer. Does it leak an implementation detail ` +
      `(a serializer, an endpoint, a permission codename, an internal system name, "not deployed yet")? ` +
      `Answer exactly VIOLATION or OK, then a short reason.\n\nString: "${s}"`,
  },
  {
    id: 'blocked-reason-in-readers-terms',
    doc: "error-handling skill: blockedReason is written in the reader's terms.",
    match: (f) => /\.tsx$/.test(f),
    extract: (text) =>
      [...text.matchAll(/blockedReason:\s*[^,\n]*?['"]([^'"]{15,200})['"]/g)].map((m) => m[1]),
    question: (s) =>
      `This is the reason text on a disabled button in a compliance app. Does it tell the user what ` +
      `THEY must do, in their words? A backend or model-gate explanation is a violation. ` +
      `Answer exactly VIOLATION or OK, then a short reason.\n\nText: "${s}"`,
  },
  {
    id: 'comment-earns-its-line',
    doc: 'CLAUDE.md: only clean useful comments survive.',
    match: (f) => /\.(ts|tsx)$/.test(f),
    extract: (text) =>
      [
        ...text.matchAll(/^\s*\/\/ (?!TODO|BUG|NOTE|BACKEND NOTE|DEV-WORKAROUND)(.{40,200})$/gm),
      ].map((m) => m[1]),
    question: (s) =>
      `A one-line code comment. Is it NARRATION (history of what the code used to be, restating ` +
      `what the next line does, or defending a choice nobody challenged)? Those are violations. ` +
      `A backend gap, a spec clause, a timing constraint or a security reason is fine. ` +
      `Answer exactly VIOLATION or OK, then a short reason.\n\nComment: "${s}"`,
  },
];

function pickBackend() {
  const forced = process.env.RULES_AGENT;
  const order = forced ? [forced] : ['opencode', 'pi', 'claude'];
  for (const name of order) {
    const b = BACKENDS[name];
    if (!b) continue;
    try {
      execFileSync('command', ['-v', b.bin], { shell: '/bin/bash', stdio: 'ignore' });
      return { name, ...b };
    } catch {
      /* not installed, try the next */
    }
  }
  return null;
}

function ask(backend, prompt) {
  const model = process.env.RULES_AGENT_MODEL || backend.model;
  try {
    const out = execFileSync(backend.bin, backend.args(model), {
      input: prompt,
      encoding: 'utf8',
      timeout: 60_000,
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    return out.trim();
  } catch {
    return '';
  }
}

/** Returns findings in the same shape the deterministic rules use. */
export async function runAgentRules(files, { limit = 40, verbose = false } = {}) {
  const backend = pickBackend();
  if (!backend) {
    return { skipped: 'no agent CLI on PATH (opencode, pi or claude)', findings: [] };
  }

  const findings = [];
  let asked = 0;

  for (const rule of AGENT_RULES) {
    for (const f of files.filter(rule.match)) {
      const text = read(f);
      for (const sample of rule.extract(text)) {
        if (asked >= limit) {
          return {
            findings,
            backend: backend.name,
            asked,
            truncated: `stopped at the ${limit}-question cap, raise it with --agent-limit`,
          };
        }
        asked += 1;
        const answer = ask(backend, rule.question(sample));
        if (verbose) process.stderr.write(`  ${rule.id}: ${answer.slice(0, 60)}\n`);
        if (/^\s*VIOLATION/i.test(answer)) {
          const line = text.split('\n').findIndex((l) => l.includes(sample)) + 1;
          findings.push({
            rule: rule.id,
            file: rel(f),
            line: line || 1,
            message: answer
              .replace(/^\s*VIOLATION[:,\s-]*/i, '')
              .split('\n')[0]
              .slice(0, 160),
            snippet: sample.slice(0, 80),
          });
        }
      }
    }
  }
  return { findings, backend: backend.name, asked };
}
