import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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

/** The MCP server identity every installer wires up, consistently named across tools. */
export const MCP_SERVER_NAME = "rfdtech-ui";
export const MCP_SERVER_COMMAND = { command: "npx", args: ["-y", "@rfdtech/components-mcp"] };

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
