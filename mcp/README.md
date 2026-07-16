# MCP server + `rfdui` CLI (dev workspace)

This folder is a **dev workspace**, not an independently published package. The MCP server and
`rfdui` CLI compile into the root [`@rfdtech/components`](../package.json) package's own `dist/`
(`dist/mcp/`) and ship as `bin` entries on that one package — `npm install @rfdtech/components`
gives you the React components *and* the `components-mcp`/`rfdui` binaries in one install, no
second package to publish or install separately.

They let AI coding agents (Claude Code, Cursor, Codex, OpenCode, ...) search, correctly use, and
follow the design rules of `@rfdtech/components` — without inventing APIs or drifting from real
usage conventions.

The library's existing MDX docs (`demo/docs/pages/*.mdx`) are the single source of truth for both
humans and AI. Nothing here hand-maintains a second copy: `src/indexer.ts` **generates** a JSON
knowledge base from the MDX, the real example files, the authoritative `src/types/*.ts` prop/type
source, `demo/docs/rules/*.md`, and `src/styles/theme/*.css` design tokens, and the server/CLI only
ever serve that generated JSON.

## Tools (MCP)

| Tool | What it returns |
|---|---|
| `list_components` | Every doc slug, title, category, description |
| `search_components(query)` | Lexical search — name/keywords/description/headings |
| `get_component(slug)` | Full picture: docs, **every** known example, authoritative types, related rules |
| `get_component_examples(slug)` | Just the example source files |
| `get_component_types(slug)` | Just the raw `src/types/<slug>.ts` source |
| `get_rules(topic?)` | Rules corpus — whole thing, one category, or everything tagged to a component |
| `search_rules(query)` | Free-text search over rules |
| `get_tokens()` | Every `--gsl-*` design token (base/light/dark values) |
| `search_docs(query)` | Full-text search across doc prose + headings |

`search_components`/`search_docs`/`search_rules` are lexical (term overlap), not embeddings — this
is a local, offline server with no network calls.

## Automatic setup on `npm install`

The root package's `postinstall` script (`scripts/postinstall.mjs`) runs `rfdui setup`
automatically after `npm install @rfdtech/components` — no manual step required. It:

- Resolves the consumer's actual project root via `INIT_CWD` (not the package's own folder inside
  `node_modules`), so files land in the right place.
- No-ops silently if `dist/mcp/cli.js` isn't built yet (e.g. a contributor's `npm install` in this
  repo before `npm run build`) and never fails the install if setup itself errors.
- Is skippable with `RFDUI_SKIP_SETUP=1` (or `true`) — e.g. for CI installs that don't want it
  writing files.

Re-running `npm install`, or `rfdui setup`/`rfdui update` directly, is always safe — every writer
merges into existing config instead of overwriting it.

### If the install script gets blocked

`npx rfdui setup` always works manually, regardless of package manager or script-blocking config —
use it any time postinstall didn't run.

- **pnpm** (v8+) ignores build scripts from dependencies by default (`Ignored build scripts:
  @rfdtech/components` in the install output). Fix: `pnpm approve-builds @rfdtech/components`
  (or `pnpm approve-builds` for the interactive picker), then `pnpm install` again. That writes
  `allowBuilds: { "@rfdtech/components": true }` to `pnpm-workspace.yaml` (pnpm 11+ — older pnpm
  uses `onlyBuiltDependencies` instead).
- **npm** runs `postinstall` by default, nothing to approve. A silent no-op usually means
  `ignore-scripts=true` in an `.npmrc` (project/user/global) or `--ignore-scripts` was passed to
  `npm install` — common in locked-down CI. Drop it for a local install, or just run `npx rfdui
  setup` manually.

## CLI (`rfdui`)

```
rfdui setup           Detect installed AI tools and wire up the MCP + a shared skill doc for each
rfdui doctor           Report index freshness + which tools are configured
rfdui index            Rebuild the generated docs index (repo checkout only)
rfdui mcp              Run the MCP server directly over stdio
rfdui search <query>   Lexical search from the terminal
rfdui update           Rebuild the index and re-run setup
```

`rfdui setup` (also invoked automatically by `postinstall`, see above) detects and configures,
idempotently (safe to re-run):

- **Claude Code** (`.claude/` or `.mcp.json` present) — project `.mcp.json`, `.claude/skills/rfdtech-ui/SKILL.md`, a `CLAUDE.md` pointer
- **Cursor** (`.cursor/` present) — `.cursor/mcp.json`, `.cursor/rules/rfdtech-ui.mdc`
- **Codex** (`~/.codex/` present) — a `[mcp_servers.rfdtech-ui]` block in `~/.codex/config.toml`
- **OpenCode** (`opencode.json` or `~/.config/opencode` present) — `opencode.json` mcp entry (verified
  against the documented schema at opencode.ai/docs/mcp-servers), an `AGENTS.md` pointer

It also always writes a cross-tool `.ai/SKILL.md`. All writes merge into existing config rather
than overwriting it.

## Dev vs published

Both the generated JSON (`generated/`, when built standalone here) and any compiled output are
**gitignored** — neither is a hand-maintained second source of truth:

- **Dev** (`npm run dev` in this folder, or the repo-root `.mcp.json` which runs this via `tsx`):
  reads MDX/examples/types/rules/tokens straight from the repo and rebuilds `mcp/generated/*.json`
  automatically on startup whenever any source file is newer than the last build.
- **Published** (`npm install @rfdtech/components`): there is no sibling `demo/`/`src/types` inside
  `node_modules` to index, so the bins only ever read the `dist/mcp/generated/` snapshot bundled at
  publish time — the root `npm run build` compiles this workspace's `src/` into `dist/mcp/` and
  runs the indexer once into `dist/mcp/generated/` before the tarball is packed.

## Scripts

Run from **this** folder for fast iteration on the MCP/CLI themselves:

```
npm run dev      # tsx src/index.ts — MCP server from live source, auto-rebuilding index
npm run index    # tsx src/indexer.ts — rebuild mcp/generated/*.json once
npm run cli      # tsx src/cli.ts — run the CLI from source
npm run build    # tsc -> ../dist/mcp, then bundle generated/ + skill/ into ../dist/mcp
```

Run from the **repo root** to build (or rebuild) everything that actually ships:

```
npm run build       # Vite (components) + tsc (types) + this workspace, all into dist/
npm run build:mcp   # just this workspace, into dist/mcp/ (skips the Vite/component build)
```
