import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { GENERATED_DIR, hasRepoSource } from "../paths.js";
import * as claude from "./claude.js";
import * as cursor from "./cursor.js";
import * as codex from "./codex.js";
import * as opencode from "./opencode.js";

export async function runDoctor(cwd: string = process.cwd()): Promise<void> {
  console.log("Checking AI setup...\n");

  const metaPath = path.join(GENERATED_DIR, "index.meta.json");
  if (existsSync(metaPath)) {
    const meta = JSON.parse(await readFile(metaPath, "utf8")) as {
      componentCount: number;
      exampleCount: number;
      ruleCount: number;
      tokenCount: number;
    };
    console.log(
      `✓ Index found — ${meta.componentCount} components, ${meta.exampleCount} examples, ` +
        `${meta.ruleCount} rules, ${meta.tokenCount} tokens`
    );
  } else if (hasRepoSource) {
    console.log("✗ Index missing — run `rfdui index` (or just start the MCP server, which builds it automatically)");
  } else {
    console.log("✗ No bundled index found in this install — the package may be corrupt; try reinstalling");
  }

  const tools = [
    { name: "Claude Code", ok: claude.detect(cwd) },
    { name: "Cursor", ok: cursor.detect(cwd) },
    { name: "Codex", ok: codex.detect() },
    { name: "OpenCode", ok: opencode.detect(cwd) },
  ];
  for (const t of tools) {
    console.log(`${t.ok ? "✓" : "•"} ${t.name}${t.ok ? " detected" : " not detected"}`);
  }

  console.log(
    hasRepoSource
      ? "\n✓ Running inside the gsl-components repo — index rebuilds automatically when source changes."
      : "\n• Running as an installed package — serving the bundled index snapshot (no live rebuild)."
  );
  console.log("\nRun `rfdui setup` to (re)configure detected tools.");
}
