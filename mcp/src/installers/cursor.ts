import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { type InstallResult, mergeMcpServers, readJsonIfExists, writeJson } from "./util.js";

export function detect(cwd: string): boolean {
  return existsSync(path.join(cwd, ".cursor"));
}

export async function install(cwd: string, skillSourcePath: string): Promise<InstallResult> {
  const mcpJsonPath = path.join(cwd, ".cursor", "mcp.json");
  const existing = await readJsonIfExists(mcpJsonPath);
  const { data, changed: mcpChanged } = mergeMcpServers(existing);
  await writeJson(mcpJsonPath, data);

  const rulesDir = path.join(cwd, ".cursor", "rules");
  await mkdir(rulesDir, { recursive: true });
  const rulesPath = path.join(rulesDir, "rfdtech-ui.mdc");
  const skill = await readFile(skillSourcePath, "utf8");
  const mdc =
    `---\ndescription: GSL (@rfdtech/components) usage rules\nglobs: ["**/*.tsx", "**/*.ts"]\n` +
    `alwaysApply: false\n---\n\n${skill}`;
  const rulesChanged = !existsSync(rulesPath) || (await readFile(rulesPath, "utf8")) !== mdc;
  await writeFile(rulesPath, mdc, "utf8");

  const changed = mcpChanged || rulesChanged;
  return {
    name: "Cursor",
    changed,
    detail:
      `.cursor/mcp.json${mcpChanged ? " (updated)" : " (already set)"}, ` +
      `.cursor/rules/rfdtech-ui.mdc${rulesChanged ? " (updated)" : " (already set)"}`,
  };
}
