import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import {
  type InstallResult,
  appendPointerOnce,
  mergeMcpServers,
  readJsonIfExists,
  writeJson,
} from "./util.js";

export function detect(cwd: string): boolean {
  return existsSync(path.join(cwd, ".claude")) || existsSync(path.join(cwd, ".mcp.json"));
}

export async function install(cwd: string, skillSourcePath: string): Promise<InstallResult> {
  const mcpJsonPath = path.join(cwd, ".mcp.json");
  const existing = await readJsonIfExists(mcpJsonPath);
  const { data, changed: mcpChanged } = mergeMcpServers(existing);
  await writeJson(mcpJsonPath, data);

  const skillDir = path.join(cwd, ".claude", "skills", "rfdtech-ui");
  await mkdir(skillDir, { recursive: true });
  const skillDest = path.join(skillDir, "SKILL.md");
  const skillSource = await readFile(skillSourcePath, "utf8");
  const skillChanged = !existsSync(skillDest) || (await readFile(skillDest, "utf8")) !== skillSource;
  await copyFile(skillSourcePath, skillDest);

  const claudeMdChanged = await appendPointerOnce(
    path.join(cwd, "CLAUDE.md"),
    "rfdtech-ui",
    "<!-- rfdtech-ui -->\nBefore writing UI code, see `.claude/skills/rfdtech-ui/SKILL.md` for " +
      "`@rfdtech/components` conventions (search components, use authoritative types, follow the rules).\n",
    "Project notes"
  );

  const changed = mcpChanged || skillChanged || claudeMdChanged;
  return {
    name: "Claude Code",
    changed,
    detail:
      `.mcp.json${mcpChanged ? " (updated)" : " (already set)"}, ` +
      `.claude/skills/rfdtech-ui/SKILL.md${skillChanged ? " (updated)" : " (already set)"}, ` +
      `CLAUDE.md${claudeMdChanged ? " (updated)" : " (already set)"}`,
  };
}
