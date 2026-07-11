import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { GENERATED_DIR, SOURCE, hasRepoSource } from "./paths.js";

// ───────────────────────── MDX meta ─────────────────────────

export interface PageMeta {
  title: string;
  description?: string;
  category?: string;
  keywords: string[];
  since?: string;
  status?: string;
  related: string[];
  import?: string;
}

function quoted(key: string, block: string): string | undefined {
  return block.match(new RegExp(`${key}:\\s*["']([^"']*)["']`))?.[1];
}

function quotedArray(key: string, block: string): string[] {
  const m = block.match(new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\]`));
  if (!m) return [];
  return [...m[1].matchAll(/["']([^"']*)["']/g)].map((x) => x[1]);
}

function parseMeta(source: string): PageMeta {
  const block = source.match(/export const meta\s*=\s*{([\s\S]*?)};/)?.[1] ?? "";
  return {
    title: quoted("title", block) ?? "",
    description: quoted("description", block),
    category: quoted("category", block),
    keywords: quotedArray("keywords", block),
    since: quoted("since", block),
    status: quoted("status", block),
    related: quotedArray("related", block),
    import: quoted("import", block),
  };
}

/** Everything from the first top-level heading onward — drops the meta block and import statements. */
function stripMetaAndImports(source: string): string {
  const heading = source.match(/^#\s+.+$/m);
  if (!heading || heading.index === undefined) return source.trim();
  return source.slice(heading.index).trim();
}

function extractHeadings(body: string): string[] {
  return [...body.matchAll(/^#{1,3}\s+(.+)$/gm)].map((m) => m[1].trim());
}

// ───────────────────────── examples ─────────────────────────

const RAW_IMPORT_RE =
  /import\s+(\w+)\s+from\s+["']\.\.\/previews\/examples\/([^"']+)\?raw["'];?/g;

interface RawExampleRef {
  importName: string;
  file: string;
}

function extractRawImports(source: string): RawExampleRef[] {
  return [...source.matchAll(RAW_IMPORT_RE)].map((m) => ({
    importName: m[1],
    file: m[2],
  }));
}

function extractUsedComponents(source: string): string[] {
  const used = new Set<string>();
  const re = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+["']@rfdtech\/components["'];?/g;
  for (const m of source.matchAll(re)) {
    for (const raw of m[1].split(",")) {
      const name = raw.trim().split(/\s+as\s+/)[0].trim();
      if (name) used.add(name);
    }
  }
  return [...used].sort();
}

function titleFromExampleFile(file: string): string {
  const base = file.replace(/\.example\.tsx$/, "");
  return base
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// ───────────────────────── rules ─────────────────────────

interface Rule {
  id: string;
  title: string;
  severity: "do" | "dont" | "info" | string;
  components: string[];
  body: string;
}

async function buildRules(): Promise<{
  rulesByCategory: Record<string, Rule[]>;
  componentToRuleIds: Record<string, string[]>;
}> {
  const rulesByCategory: Record<string, Rule[]> = {};
  const componentToRuleIds: Record<string, string[]> = {};
  if (!existsSync(SOURCE.rules)) return { rulesByCategory, componentToRuleIds };

  const files = (await readdir(SOURCE.rules)).filter((f) => f.endsWith(".md")).sort();
  for (const file of files) {
    const category = file.replace(/\.md$/, "");
    const raw = await readFile(path.join(SOURCE.rules, file), "utf8");
    const blocks = raw.split("===RULE===").slice(1); // [0] is the "# Title" preamble
    const rules: Rule[] = [];

    for (const rawBlock of blocks) {
      const block = rawBlock.replace(/^\n/, "");
      const headerEnd = block.indexOf("\n\n");
      const headerPart = headerEnd === -1 ? block : block.slice(0, headerEnd);
      const body = headerEnd === -1 ? "" : block.slice(headerEnd + 2).trim();

      const fields: Record<string, string> = {};
      for (const line of headerPart.split("\n")) {
        const idx = line.indexOf(":");
        if (idx === -1) continue;
        fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      }
      if (!fields.id) continue;

      const components = (fields.components ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const rule: Rule = {
        id: fields.id,
        title: fields.title ?? "",
        severity: fields.severity ?? "info",
        components,
        body,
      };
      rules.push(rule);

      for (const c of components) {
        (componentToRuleIds[c] ??= []).push(rule.id);
      }
    }

    rulesByCategory[category] = rules;
  }

  return { rulesByCategory, componentToRuleIds };
}

// ───────────────────────── tokens ─────────────────────────

// Mirrors scripts/generate-theme-tokens.mjs's `classify()` so tokens.json's
// "group" field lines up with the same value-type buckets gslTheme() enforces
// at the type level (color/length/shadow/zIndex/opacity/duration/misc).
function classifyToken(cssVar: string): string {
  const local = cssVar.replace(/^--gsl-/, "");
  if (/radius/.test(local)) return "length";
  if (/shadow/.test(local)) return "shadow";
  if (/^z(-|$)/.test(local)) return "zIndex";
  if (/font/.test(local)) return "font";
  if (/opacity/.test(local)) return "opacity";
  if (/(size|gap|width|height|padding|margin|px$|py$|-px-|-py-)/.test(local)) return "length";
  if (/(duration|transition|delay|stagger)/.test(local)) return "duration";
  if (
    /(color|^bg$|-bg$|bg-|background|border|accent|track|success|warning|error|primary|surface|hover|overlay|text|focus|current)/.test(
      local
    )
  )
    return "color";
  return "misc";
}

interface TokenRegistryEntry {
  /** PascalCase component key (e.g. "AppHeader"), or undefined for global tokens. */
  component?: string;
  cssVar: string;
}

/**
 * Parses src/generated/components.theme.ts — the file gslTheme() itself is
 * typed against — for the authoritative list of every overridable token.
 * This is what makes tokens.json/get_tokens() match the real runtime API
 * surface (including ~70+ component-scoped tokens like --gsl-card-padding
 * that never appear in the 3 global theme CSS files).
 */
async function readTokenRegistry(): Promise<TokenRegistryEntry[]> {
  if (!existsSync(SOURCE.generatedTheme)) return [];
  const source = await readFile(SOURCE.generatedTheme, "utf8");
  const entries: TokenRegistryEntry[] = [];

  const globalBlock = source.match(/export const GSL_GLOBAL_TOKEN_VARS[^{]*\{([\s\S]*?)\n\};/)?.[1] ?? "";
  for (const m of globalBlock.matchAll(/^\s{2}\w+:\s*"(--gsl-[\w-]+)",\s*$/gm)) {
    entries.push({ cssVar: m[1] });
  }

  const componentSection =
    source.match(/export const GSL_COMPONENT_TOKEN_VARS[\s\S]*?=\s*\{([\s\S]*)\n\};\s*$/)?.[1] ?? "";
  for (const compMatch of componentSection.matchAll(/^\s{2}(\w+):\s*\{([\s\S]*?)\n\s{2}\},\s*$/gm)) {
    const [, component, body] = compMatch;
    for (const m of body.matchAll(/^\s{4}\w+:\s*"(--gsl-[\w-]+)",\s*$/gm)) {
      entries.push({ component, cssVar: m[1] });
    }
  }

  return entries;
}

/** "AppHeader" -> "app-header" — inverse of generate-theme-tokens.mjs's toPascalCase(). */
function pascalToKebab(pascal: string): string {
  return pascal.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

async function readComponentCssValues(slug: string): Promise<Map<string, string>> {
  const values = new Map<string, string>();
  const stylesDir = path.join(SOURCE.componentsDir, slug, "styles");
  if (!existsSync(stylesDir)) return values;
  for (const file of await readdir(stylesDir)) {
    if (!file.endsWith(".css")) continue;
    const css = await readFile(path.join(stylesDir, file), "utf8");
    for (const m of css.matchAll(/(--gsl-[\w-]+)\s*:\s*([^;]+);/g)) {
      if (!values.has(m[1])) values.set(m[1], m[2].trim()); // first declaration = base value
    }
  }
  return values;
}

export interface TokenOutEntry {
  group: string;
  scope: "global" | "component";
  component?: string;
  base?: string;
  light?: string;
  dark?: string;
}

async function buildTokens(): Promise<Record<string, TokenOutEntry>> {
  const tokens: Record<string, TokenOutEntry> = {};

  // Global token VALUES (unchanged: base/light/dark theme CSS).
  const globalValues: Record<string, Record<string, string>> = {};
  const files: Record<string, string> = { base: "base.css", light: "light.css", dark: "dark.css" };
  for (const [theme, file] of Object.entries(files)) {
    const p = path.join(SOURCE.themeDir, file);
    if (!existsSync(p)) continue;
    const css = await readFile(p, "utf8");
    for (const m of css.matchAll(/(--gsl-[\w-]+)\s*:\s*([^;]+);/g)) {
      (globalValues[m[1]] ??= {})[theme] = m[2].trim();
    }
  }

  const registry = await readTokenRegistry();
  const byComponent = new Map<string, string[]>();

  for (const entry of registry) {
    if (!entry.component) {
      tokens[entry.cssVar] = {
        group: classifyToken(entry.cssVar),
        scope: "global",
        ...globalValues[entry.cssVar],
      };
      continue;
    }
    const list = byComponent.get(entry.component) ?? [];
    list.push(entry.cssVar);
    byComponent.set(entry.component, list);
  }

  // Component-scoped VALUES: each component's own styles/*.css (fallback
  // registry when a token isn't declared where expected — best-effort, first
  // declaration wins; a component may set the same token again in a media
  // query for a responsive override, which this doesn't capture separately).
  for (const [component, cssVars] of byComponent) {
    const slug = pascalToKebab(component);
    const cssValues = await readComponentCssValues(slug);
    for (const cssVar of cssVars) {
      tokens[cssVar] = {
        group: classifyToken(cssVar),
        scope: "component",
        component: slug,
        ...(cssValues.has(cssVar) ? { base: cssValues.get(cssVar)! } : {}),
      };
    }
  }

  return tokens;
}

// ───────────────────────── build ─────────────────────────

export interface BuildResult {
  componentCount: number;
  exampleCount: number;
  ruleCount: number;
  tokenCount: number;
}

export async function buildIndex(outDir: string = GENERATED_DIR): Promise<BuildResult> {
  if (!hasRepoSource) {
    throw new Error(
      "buildIndex() requires live repo source (demo/docs, src/types) which isn't present — " +
        "this looks like a published install; it should only ever read the bundled generated/ snapshot."
    );
  }

  await mkdir(outDir, { recursive: true });

  const pageFiles = (await readdir(SOURCE.pages)).filter((f) => f.endsWith(".mdx")).sort();
  const exampleFiles = (await readdir(SOURCE.examples)).filter((f) => f.endsWith(".example.tsx"));

  const pageSources = new Map<string, string>();
  for (const file of pageFiles) {
    pageSources.set(file.replace(/\.mdx$/, ""), await readFile(path.join(SOURCE.pages, file), "utf8"));
  }

  const pageImports = new Map<string, RawExampleRef[]>();
  const globalImported = new Set<string>();
  for (const [slug, src] of pageSources) {
    const imports = extractRawImports(src);
    pageImports.set(slug, imports);
    imports.forEach((i) => globalImported.add(i.file));
  }

  const exampleSourceCache = new Map<string, string>();
  async function getExampleSource(file: string): Promise<string> {
    if (!exampleSourceCache.has(file)) {
      try {
        exampleSourceCache.set(file, await readFile(path.join(SOURCE.examples, file), "utf8"));
      } catch {
        exampleSourceCache.set(file, `// Could not read ${file}`);
      }
    }
    return exampleSourceCache.get(file)!;
  }

  const { rulesByCategory, componentToRuleIds } = await buildRules();
  const tokens = await buildTokens();

  const components: Record<string, unknown> = {};
  const examplesOut: Record<string, unknown[]> = {};
  const searchEntries: unknown[] = [];
  let exampleCount = 0;

  for (const [slug, src] of pageSources) {
    const meta = parseMeta(src);
    const docsBody = stripMetaAndImports(src);
    const headings = extractHeadings(docsBody);

    // Hybrid example ownership: explicit `?raw` imports are authoritative;
    // a `<slug>*` glob only fills in files no page has claimed (avoids the
    // form/form-field inversion and similar cross-page naming collisions).
    const importsForSlug = pageImports.get(slug) ?? [];
    const importNameByFile = new Map(importsForSlug.map((i) => [i.file, i.importName]));
    const owned = new Set<string>(importsForSlug.map((i) => i.file));
    for (const file of exampleFiles) {
      if (file.startsWith(slug) && !globalImported.has(file)) owned.add(file);
    }

    const exampleList = await Promise.all(
      [...owned].sort().map(async (file) => {
        const source = await getExampleSource(file);
        return {
          file,
          importName: importNameByFile.get(file),
          title: titleFromExampleFile(file),
          components: extractUsedComponents(source),
          source,
        };
      })
    );
    examplesOut[slug] = exampleList;
    exampleCount += exampleList.length;

    const typesPath = path.join(SOURCE.types, `${slug}.ts`);
    const types = existsSync(typesPath) ? await readFile(typesPath, "utf8") : null;

    const ruleIds = componentToRuleIds[slug] ?? [];

    components[slug] = {
      meta: { slug, ...meta },
      docs: docsBody,
      headings,
      types,
      examples: exampleList,
      ruleIds,
    };

    searchEntries.push({
      slug,
      name: meta.title || slug,
      category: meta.category,
      keywords: meta.keywords,
      description: meta.description,
      headings,
    });
  }

  await writeFile(path.join(outDir, "components.json"), JSON.stringify(components, null, 2));
  await writeFile(path.join(outDir, "examples.json"), JSON.stringify(examplesOut, null, 2));
  await writeFile(path.join(outDir, "search.json"), JSON.stringify(searchEntries, null, 2));
  await writeFile(path.join(outDir, "rules.json"), JSON.stringify(rulesByCategory, null, 2));
  await writeFile(path.join(outDir, "tokens.json"), JSON.stringify(tokens, null, 2));

  const builtFrom: Record<string, number> = {};
  for (const dir of [SOURCE.pages, SOURCE.examples, SOURCE.types, SOURCE.rules, SOURCE.themeDir]) {
    if (!existsSync(dir)) continue;
    for (const file of await readdir(dir)) {
      const filePath = path.join(dir, file);
      const info = await stat(filePath);
      if (info.isFile()) builtFrom[filePath] = info.mtimeMs;
    }
  }

  // The generated token registry drives buildTokens() identity/grouping —
  // track it so editing component CSS + regenerating it (or forgetting to)
  // is visible to the staleness check, not just the 3 global theme files.
  if (existsSync(SOURCE.generatedTheme)) {
    builtFrom[SOURCE.generatedTheme] = (await stat(SOURCE.generatedTheme)).mtimeMs;
  }

  // Component-scoped token VALUES come from each component's own styles/*.css
  // — track those too, so a value-only CSS edit (no registry change) still
  // triggers a rebuild.
  if (existsSync(SOURCE.componentsDir)) {
    for (const entry of await readdir(SOURCE.componentsDir)) {
      const stylesDir = path.join(SOURCE.componentsDir, entry, "styles");
      if (!existsSync(stylesDir)) continue;
      for (const file of await readdir(stylesDir)) {
        if (!file.endsWith(".css")) continue;
        const filePath = path.join(stylesDir, file);
        builtFrom[filePath] = (await stat(filePath)).mtimeMs;
      }
    }
  }

  const ruleCount = Object.values(rulesByCategory).reduce((n, rs) => n + rs.length, 0);
  const result: BuildResult = {
    componentCount: Object.keys(components).length,
    exampleCount,
    ruleCount,
    tokenCount: Object.keys(tokens).length,
  };

  await writeFile(
    path.join(outDir, "index.meta.json"),
    JSON.stringify({ builtAt: Date.now(), builtFrom, ...result }, null, 2)
  );

  return result;
}

// Runnable directly: `tsx src/indexer.ts` (dev) or `node dist/indexer.js` (build).
if (import.meta.url === `file://${process.argv[1]}`) {
  buildIndex()
    .then((result) => {
      console.log(`Index built: ${JSON.stringify(result)}`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
