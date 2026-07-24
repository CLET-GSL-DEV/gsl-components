import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface InstallResult {
  name: string;
  changed: boolean;
  detail: string;
}

export async function readJsonIfExists(filePath: string): Promise<Record<string, unknown> | null> {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

/** Absolute path to this package's own compiled server entry (dist/mcp/index.js,
 * one level up from dist/mcp/installers/). Resolved from where THIS module is
 * actually loaded from, so it's correct no matter how the host project's package
 * manager lays out node_modules.
 *
 * `npx -y components-mcp` used to be used here, on the theory that npx would
 * resolve the already-installed local bin. That's false in non-hoisted/strict
 * node_modules layouts (e.g. a pnpm workspace where nothing at the repo root
 * directly depends on @rfdtech/components) — npx finds no local bin and silently
 * installs an unrelated same-named package from the npm registry instead. A
 * direct `node <absolute path>` has no such ambiguity. */
const SERVER_ENTRY_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "index.js");

/** The MCP server identity every installer wires up, consistently named across tools. */
export const MCP_SERVER_NAME = "rfdtech-ui";
export const MCP_SERVER_COMMAND = { command: "node", args: [SERVER_ENTRY_PATH] };

/** Merge `{ mcpServers: { "rfdtech-ui": {...} } }` into an existing config object without touching anything else. */
export function mergeMcpServers(existing: Record<string, unknown> | null): {
  data: Record<string, unknown>;
  changed: boolean;
} {
  const data = existing && typeof existing === "object" ? { ...existing } : {};
  const servers = { ...(data.mcpServers as Record<string, unknown> | undefined) };
  const already = JSON.stringify(servers[MCP_SERVER_NAME]) === JSON.stringify(MCP_SERVER_COMMAND);
  servers[MCP_SERVER_NAME] = MCP_SERVER_COMMAND;
  data.mcpServers = servers;
  return { data, changed: !already };
}

/** Append `marker`-tagged content to a markdown file once; no-op if already present. */
export async function appendPointerOnce(
  filePath: string,
  marker: string,
  block: string,
  fallbackHeading: string
): Promise<boolean> {
  if (existsSync(filePath)) {
    const content = await readFile(filePath, "utf8");
    if (content.includes(marker)) return false;
    await writeFile(filePath, content.replace(/\s*$/, "") + "\n\n" + block, "utf8");
    return true;
  }
  await writeFile(filePath, `# ${fallbackHeading}\n\n${block}`, "utf8");
  return true;
}
