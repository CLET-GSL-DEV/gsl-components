#!/usr/bin/env node
// Runs after `tsc -p mcp/tsconfig.json` (as part of the root package's
// `npm run build`, or standalone via `mcp`'s own `npm run build`). Bundles
// the two things a published install needs that don't come from compiling
// src/**: the hand-authored skill doc, and a fresh generated docs index
// built from the live repo source (since neither travels with the published
// npm tarball otherwise — see mcp/src/paths.ts for the dev/published split).
//
// The MCP/CLI compile into <repo>/dist/mcp — the same `dist/` the root
// @rfdtech/components package already publishes — so the MCP server and CLI
// ship as part of that one package instead of a separate one.
import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mcpRoot = path.resolve(__dirname, ".."); // mcp/
const repoRoot = path.resolve(mcpRoot, ".."); // repo root
const distMcpDir = path.join(repoRoot, "dist", "mcp");

await mkdir(path.join(distMcpDir, "skill"), { recursive: true });
await cp(path.join(mcpRoot, "skill"), path.join(distMcpDir, "skill"), { recursive: true });

const { buildIndex } = await import(path.join(distMcpDir, "indexer.js"));
const result = await buildIndex(path.join(distMcpDir, "generated"));

console.log(`[prepare-dist] bundled skill/ and generated/ into dist/mcp/ (${JSON.stringify(result)})`);
