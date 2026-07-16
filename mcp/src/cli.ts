#!/usr/bin/env node
import { loadIndex, searchComponents } from "./docs.js";
import { runDoctor } from "./installers/doctor.js";
import { runSetup } from "./installers/setup.js";
import { buildIndex } from "./indexer.js";
import { GENERATED_DIR, hasRepoSource } from "./paths.js";

const USAGE = `rfdui — @rfdtech/components AI tooling

Usage:
  rfdui setup           Detect installed AI tools (Claude Code, Cursor, Codex, OpenCode) and wire up
                         the MCP server + a shared skill doc for each.
  rfdui doctor           Report whether the index, MCP, and each AI tool are configured correctly.
  rfdui index            Rebuild the generated docs index (only works inside the repo checkout).
  rfdui mcp              Run the MCP server directly over stdio.
  rfdui search <query>   Lexical search over components from the terminal.
  rfdui update           Rebuild the index (if possible) and re-run setup.
`;

async function main() {
  const [, , cmd, ...rest] = process.argv;

  switch (cmd) {
    case "index": {
      if (!hasRepoSource) {
        console.error("`rfdui index` only works inside the gsl-components repo checkout (no source found).");
        process.exitCode = 1;
        return;
      }
      const result = await buildIndex(GENERATED_DIR);
      console.log(`Index built: ${JSON.stringify(result, null, 2)}`);
      return;
    }

    case "search": {
      const query = rest.join(" ").trim();
      if (!query) {
        console.error("Usage: rfdui search <query>");
        process.exitCode = 1;
        return;
      }
      const idx = await loadIndex();
      const results = searchComponents(idx, query);
      if (results.length === 0) {
        console.log(`No components matched "${query}".`);
        return;
      }
      for (const r of results) {
        console.log(`${r.slug.padEnd(24)} ${r.name}${r.description ? ` — ${r.description}` : ""}`);
      }
      return;
    }

    case "doctor":
      await runDoctor();
      return;

    case "setup":
      await runSetup();
      return;

    case "update":
      if (hasRepoSource) {
        const result = await buildIndex(GENERATED_DIR);
        console.log(`Index rebuilt: ${JSON.stringify(result)}`);
      }
      await runSetup();
      return;

    case "mcp":
      // Delegate to the server entry point (same process, same stdio streams).
      await import("./index.js");
      return;

    default:
      console.log(USAGE);
      if (cmd && cmd !== "help" && cmd !== "--help") process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
