#!/usr/bin/env node
// Auto-wires AI coding tools (Claude Code, Cursor, Codex, OpenCode) with the
// @rfdtech/components MCP server + skill doc, so `npm install` alone is
// enough to get MCP-aware, real-component-first UI generation — no manual
// `npx rfdui setup` step required. Set RFDUI_SKIP_SETUP to skip (e.g. in CI).
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skip = process.env.RFDUI_SKIP_SETUP;
if (skip && skip !== "0" && skip.toLowerCase() !== "false") {
  process.exit(0);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.join(__dirname, "..", "dist", "mcp", "cli.js");

// Unbuilt checkout (e.g. a contributor's `npm install` before `npm run
// build` has produced dist/) — nothing to run yet, and that's fine.
if (!existsSync(cliPath)) {
  process.exit(0);
}

// npm sets INIT_CWD to the directory the top-level `npm install` was run
// from. process.cwd() during a dependency's postinstall is the package's
// own folder inside node_modules — the wrong place to write .claude/,
// .cursor/, etc. Always target the consumer's actual project root.
const targetDir = process.env.INIT_CWD || process.cwd();

try {
  spawnSync(process.execPath, [cliPath, "setup"], {
    cwd: targetDir,
    stdio: "inherit",
  });
} catch {
  // Never fail `npm install` over optional AI-tool setup.
}

process.exit(0);
