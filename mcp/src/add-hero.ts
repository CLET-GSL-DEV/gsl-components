// Second half of the 2.4 migration: inserts the HeroBanner into the pages the
// agent identified as the app's main dashboards. The mechanical migration
// only reports candidates; this command is what actually writes them, because
// the choice of pages and of the signed-in user's name source is a decision,
// not a pattern.
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  LIBRARY,
  loadTypeScript,
  type MigrateChange,
  type MigrateNote,
  type TsApi,
  type TsIdentifier,
  type TsImportDeclaration,
  type TsJsxElement,
  type TsJsxElementWithChildren,
  type TsNamedImports,
  type TsNode,
  type TsSourceFile,
} from "./migrate.js";

export interface AddHeroOptions {
  /** Repo root. Resolves TypeScript and the candidate walk. */
  root: string;
  /** Dashboard files to update. Empty lists the candidates instead. */
  files: string[];
  /**
   * How to choose which dashboards get a hero:
   * `"files"` (default) uses `files` verbatim; `"auto"` picks the app's main
   * landing dashboard when that is unambiguous and reports the rest;
   * `"all"` writes every candidate. `auto`/`all` only ever touch route-level
   * dashboard pages.
   */
  mode?: "files" | "auto" | "all";
  /** Apply the edits. When false the run only reports what it would do. */
  write: boolean;
  /** Expression for the name, e.g. `useSessionStore((s) => s.user?.displayName)`. */
  nameExpr?: string;
  /** Greeting line. Defaults to the component's own ("Good morning,"). */
  greeting?: string;
  /** Custom artwork paths. Omit for the eight bundled presets. */
  images: string[];
  /** Extra named imports to add, as `Name:module`. */
  imports: string[];
}

export interface AddHeroResult {
  filesScanned: number;
  filesChanged: number;
  changes: MigrateChange[];
  notes: MigrateNote[];
  /** Files that look like dashboards, when no `--file` was given. */
  candidates: Array<{ file: string; metricCards: number }>;
}

interface Edit {
  start: number;
  end: number;
  text: string;
}

/** Leading whitespace of the line the position sits on. */
function lineIndentAt(text: string, position: number): string {
  const lineStart = text.lastIndexOf("\n", position - 1) + 1;
  const prefix = text.slice(lineStart, position);
  return /^\s*/.exec(prefix)?.[0] ?? "";
}

/** The JSX a return statement hands back, parenthesized or bare. */
function returnedJsx(ts: TsApi, node: TsNode): TsNode | null {
  const statement = node as TsNode & { expression?: TsNode };
  if (!statement.expression) return null;
  let expression = statement.expression;
  if (ts.isJsxElement(expression) || ts.isJsxSelfClosingElement(expression)) {
    return expression;
  }
  // ParenthesizedExpression is not part of the sliced API: unwrap by shape.
  const inner = (expression as { expression?: TsNode }).expression;
  if (inner) {
    expression = inner;
    if (ts.isJsxElement(expression) || ts.isJsxSelfClosingElement(expression)) {
      return expression;
    }
  }
  return null;
}

function elementTagName(ts: TsApi, node: TsNode): string | null {
  if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) return null;
  const tag = ts.isJsxElement(node)
    ? (node as TsJsxElementWithChildren).openingElement.tagName
    : (node as TsJsxElement).tagName;
  return ts.isIdentifier(tag) ? (tag as TsIdentifier).text : null;
}

/** Every element tag inside a subtree, for the SectionHeader signal. */
function collectTags(ts: TsApi, node: TsNode, tags: Set<string>): void {
  const tag = elementTagName(ts, node);
  if (tag) tags.add(tag);
  ts.forEachChild(node, (child) => collectTags(ts, child, tags));
}

/** Element children of a JSX element, whitespace text dropped. */
function elementChildren(ts: TsApi, node: TsNode): TsNode[] {
  if (!ts.isJsxElement(node)) return [];
  const children = (node as TsJsxElementWithChildren).children;
  return children.filter(
    (child) => ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child),
  );
}

function countDescendants(ts: TsApi, node: TsNode): number {
  let count = 0;
  ts.forEachChild(node, (child) => {
    count += 1 + countDescendants(ts, child);
  });
  return count;
}

/**
 * The page's own return: the tree holding the SectionHeader, else the largest
 * tree in the file. Nested helpers return early and small, which keeps them out.
 */
function findPageJsx(ts: TsApi, source: TsSourceFile): TsNode | null {
  const returns: TsNode[] = [];
  const walk = (node: TsNode): void => {
    if ((node as { kind?: number }).kind !== undefined) {
      const jsx = returnedJsx(ts, node);
      if (jsx) returns.push(jsx);
    }
    ts.forEachChild(node, walk);
  };
  walk(source);
  if (returns.length === 0) return null;

  for (const candidate of returns) {
    const tags = new Set<string>();
    collectTags(ts, candidate, tags);
    const hasTitle = [...tags].some(
      (tag) => tag === "SectionHeader" || /Header$/.test(tag),
    );
    if (hasTitle) return candidate;
  }
  return returns.reduce((largest, candidate) =>
    countDescendants(ts, candidate) > countDescendants(ts, largest)
      ? candidate
      : largest,
  );
}

function findImport(
  ts: TsApi,
  source: TsSourceFile,
  module: string,
): TsImportDeclaration | null {
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const specifier = (statement as TsImportDeclaration).moduleSpecifier;
    if (ts.isStringLiteral(specifier) && specifier.text === module) {
      return statement as TsImportDeclaration;
    }
  }
  return null;
}

function usesIdentifier(text: string, name: string): boolean {
  // Good enough for import dedupe: a whole-word hit anywhere in the file.
  return new RegExp(`\\b${name}\\b`).test(text);
}

function quoteFor(text: string): string {
  return text.includes("from '") ? "'" : '"';
}

/** `ROUTE_PATHS = { overview: '/overview', … }` -> name -> path. */
async function readRouteConstants(
  root: string,
  all: string[],
): Promise<Map<string, string>> {
  const constants = new Map<string, string>();
  for (const file of all) {
    if (!/constants\/routes?\.(ts|tsx)$/.test(file)) continue;
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/(\w+):\s*['"](\/[^'"]*)['"]/g)) {
      constants.set(match[1], match[2]);
    }
  }
  return constants;
}

/** Resolve a relative import specifier against the files we know about. */
function resolveRelative(
  fromFile: string,
  specifier: string,
  all: string[],
): string | null {
  if (!specifier.startsWith(".")) return null;
  const base = path.resolve(path.dirname(fromFile), specifier);
  for (const suffix of ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]) {
    const candidate = `${base}${suffix}`;
    if (all.includes(candidate)) return candidate;
  }
  return null;
}

/** MetricCard mentions in a file and in the local modules it imports. */
async function metricMentions(
  file: string,
  all: string[],
  depth = 1,
): Promise<number> {
  const text = await readFile(file, "utf8");
  let count = (text.match(/MetricCard/g) ?? []).length;
  if (depth <= 0) return count;
  for (const match of text.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    const imported = resolveRelative(file, match[1], all);
    if (imported) count += await metricMentions(imported, all, depth - 1);
  }
  return count;
}

/**
 * Every route entry across the app's route modules: route path -> page file.
 * Handles both `import('./pages/X')` lazy entries and `element: <X/>` static
 * ones, and resolves `ROUTE_PATHS.<name>` against the constants file.
 */
async function collectRouteEntries(
  root: string,
  all: string[],
): Promise<Map<string, string>> {
  const constants = await readRouteConstants(root, all);
  const entries = new Map<string, string>();
  for (const file of all) {
    if (!/routes?\.(ts|tsx)$/.test(file) && !/routes?\//.test(file)) continue;
    const text = await readFile(file, "utf8");
    const pathMatches = [
      ...text.matchAll(
        /path:\s*(?:ROUTE_PATHS\.(\w+)|['"]([^'"]+)['"])/g,
      ),
    ];
    for (const match of pathMatches) {
      const routePath = match[1] ? constants.get(match[1]) : match[2];
      if (!routePath) continue;
      const tail = text.slice(match.index ?? 0, (match.index ?? 0) + 260);
      const lazy = tail.match(/import\(\s*['"]([^'"]+)['"]\s*\)/);
      if (lazy) {
        const target = resolveRelative(file, lazy[1], all);
        if (target) entries.set(routePath.replace(/^\//, ""), target);
      }
    }
  }
  return entries;
}

/**
 * The app's dashboards, and which of them is the landing one the hero belongs
 * on. Landing paths come from what the app returns for a role (`'/overview'`
 * and friends, or `ROUTE_PATHS.x`), and the route table maps those paths back
 * to their page files.
 */
export async function detectDashboards(
  root: string,
  all: string[],
): Promise<{ main: string[]; candidates: Array<{ file: string; metricCards: number }> }> {
  const routeEntries = await collectRouteEntries(root, all);
  const routeFiles = new Set([...routeEntries.values()]);
  const scope =
    routeFiles.size > 0
      ? all.filter((file) => routeFiles.has(file))
      : await routePageFiles(root, all);

  const candidates: Array<{ file: string; metricCards: number }> = [];
  for (const file of scope) {
    const text = await readFile(file, "utf8");
    if (text.includes("<HeroBanner")) continue;
    // MetricCards often live one import away (a `<XMetrics/>` child), so count
    // the page and its local modules. The page itself need not import the
    // library for that to be true.
    const metricCards = await metricMentions(file, all);
    // A route page that renders metric cards is a dashboard. The title block
    // is not required to be the library's SectionHeader: apps bring their own
    // (`<OverviewHeader/>`), so requiring one would miss real dashboards.
    if (metricCards > 0) {
      candidates.push({ file: file.replace(`${root}/`, ""), metricCards });
    }
  }

  // Landing/redirect paths the app itself names.
  const constants = await readRouteConstants(root, all);
  const landingPaths = new Set<string>();
  for (const file of all) {
    if (!/\.(ts|tsx)$/.test(file)) continue;
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/return\s+['"](\/[a-z0-9\-/]*)['"]/g)) {
      landingPaths.add(match[1]);
    }
    if (/landing|role/i.test(file)) {
      for (const match of text.matchAll(/return\s+ROUTE_PATHS\.(\w+)/g)) {
        const resolved = constants.get(match[1]);
        if (resolved) landingPaths.add(resolved);
      }
    }
    for (const match of text.matchAll(/<Navigate[^>]*to=\{?['"](\/[a-z0-9\-/]*)['"]/g)) {
      landingPaths.add(match[1]);
    }
  }

  const main: string[] = [];
  for (const routePath of landingPaths) {
    const file = routeEntries.get(routePath.replace(/^\//, ""));
    if (file) {
      const relative = file.replace(`${root}/`, "");
      if (candidates.some((candidate) => candidate.file === relative)) {
        main.push(relative);
      }
    }
  }

  candidates.sort((a, b) => b.metricCards - a.metricCards);
  return { main: [...new Set(main)], candidates };
}

/**
 * Page components the router lazily imports: the app's dashboards are route
 * components, so this keeps helper components in the same file, and module
 * sub-pages nobody lands on first, out of the candidate list.
 */
async function routePageFiles(
  root: string,
  all: string[],
): Promise<string[]> {
  const routeFiles = all.filter((file) =>
    /src\/routes\/.*\.(ts|tsx)$/.test(file),
  );
  const pages = new Set<string>();
  for (const file of routeFiles) {
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      const specifier = match[1];
      const base = specifier.startsWith("@/")
        ? path.join(root, "src", specifier.slice(2))
        : specifier.startsWith(".")
          ? path.join(path.dirname(file), specifier)
          : null;
      if (!base) continue;
      for (const suffix of ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]) {
        const candidate = `${base}${suffix}`;
        if (all.includes(candidate)) {
          pages.add(candidate);
          break;
        }
      }
    }
  }
  return [...pages];
}

/**
 * Detection reads more than it rewrites: `constants/routes.ts` and the role
 * landing map are plain `.ts` files, and the migration's own source walk
 * deliberately stops at `.tsx` (it parses as JSX). This walk exists only so the
 * route table and landing paths are visible.
 */
async function collectDetectionFiles(root: string): Promise<string[]> {
  const found: string[] = [];
  const skip = new Set(["node_modules", "dist", "build", "coverage", ".git"]);

  async function walk(dir: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (skip.has(entry.name)) continue;
        await walk(full);
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        found.push(full);
      }
    }
  }

  const rootStat = await stat(root);
  if (rootStat.isFile()) return [root];
  await walk(root);
  return found.sort();
}

export async function runAddHero(
  options: AddHeroOptions,
): Promise<AddHeroResult> {
  const root = path.resolve(options.root);
  const ts = await loadTypeScript(root);
  const changes: MigrateChange[] = [];
  const notes: MigrateNote[] = [];
  let filesChanged = 0;
  let filesScanned = 0;

  let files = options.files.map((file) =>
    path.isAbsolute(file) ? file : path.join(root, file),
  );

  const mode = options.mode ?? "files";

  // Hero targets: the route-level dashboard pages, split into the app's main
  // landing dashboard (where the hero belongs) and the rest.
  if (files.length === 0 && mode === "files") {
    const all = await collectDetectionFiles(root);
    const routePages = await routePageFiles(root, all);
    const scope = routePages.length > 0 ? routePages : all;
    const candidates: Array<{ file: string; metricCards: number }> = [];
    for (const file of scope) {
      const text = await readFile(file, "utf8");
      if (text.includes("<HeroBanner")) continue;
      // MetricCard can sit in the page or one import away (a `<XMetrics/>`
      // child, a local StatLink), so follow one hop rather than requiring the
      // tag in the page file.
      const metricCards = await metricMentions(file, all);
      if (metricCards > 0) {
        candidates.push({ file: file.replace(`${root}/`, ""), metricCards });
      }
    }
    candidates.sort((a, b) => b.metricCards - a.metricCards);
    notes.push({
      file: root,
      line: 1,
      message:
        "No --file given, so nothing was written. Ask before choosing: (1) which of these " +
        "files are the app's main dashboards, (2) where the signed-in user's name comes from " +
        "(pass it as --name-expr), (3) custom artwork or the bundled presets (--images). " +
        "Then re-run with one --file per dashboard and --write.",
    });
    return { filesScanned: all.length, filesChanged: 0, changes, notes, candidates };
  }

  if (files.length === 0 && (mode === "auto" || mode === "all")) {
    const all = await collectDetectionFiles(root);
    const detected = await detectDashboards(root, all);
    const listed = detected.candidates.map((candidate) => candidate.file);
    const chosen =
      mode === "all"
        ? listed
        : detected.main.length === 1
          ? detected.main
          : [];

    if (chosen.length === 0) {
      notes.push({
        file: root,
        line: 1,
        message:
          detected.main.length === 0
            ? "No landing dashboard could be identified from the router, so no hero was " +
              "written. Name the pages with --file, or re-run with --hero all if every " +
              "candidate should get one. Candidates: " +
              listed.join(", ")
            : "More than one landing dashboard matches, so this is a decision: " +
              detected.main.join(", ") +
              ". Re-run with --file for the ones that should get a hero, or --hero all.",
      });
    }
    files = chosen.map((file) => path.join(root, file));
  }

  for (const file of files) {
    filesScanned += 1;
    const text = await readFile(file, "utf8");
    const relative = file.replace(`${root}/`, "");

    if (text.includes("<HeroBanner")) {
      notes.push({
        file: relative,
        line: 1,
        message: "Already renders a HeroBanner, skipped.",
      });
      continue;
    }

    const source = ts.createSourceFile(
      file,
      text,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const lineOf = (position: number) =>
      source.getLineAndCharacterOfPosition(position).line + 1;

    const page = findPageJsx(ts, source);
    if (!page) {
      notes.push({
        file: relative,
        line: 1,
        message: "No JSX return found, so there is nowhere to put a hero.",
      });
      continue;
    }

    const edits: Edit[] = [];
    const quote = quoteFor(text);

    // Where the hero lands: under the page title when there is one, else the
    // first thing in the page's own tree.
    let insertAt = page.getStart(source);
    let placement = "at the top of the page";
    // A sibling of the SectionHeader is indented like it; a first child of the
    // page tree is indented one level in.
    let sibling = false;
    const children = elementChildren(ts, page);
    const firstTag = children.length > 0 ? elementTagName(ts, children[0]) : null;

    if (
      children.length > 0 &&
      firstTag !== null &&
      (firstTag === "SectionHeader" || /Header$/.test(firstTag))
    ) {
      insertAt = children[0].getEnd();
      placement = `under the ${firstTag}`;
      sibling = true;
    } else if (children.length > 0 && firstTag === "PageSection") {
      const inner = elementChildren(ts, children[0]);
      if (inner.length > 0 && elementTagName(ts, inner[0]) === "SectionHeader") {
        insertAt = children[0].getEnd();
        placement = "under the SectionHeader (page section)";
        sibling = true;
      } else {
        insertAt = ts.isJsxElement(page) ? page.openingElement.getEnd() : page.getEnd();
      }
    } else if (ts.isJsxElement(page)) {
      insertAt = page.openingElement.getEnd();
    }

    const indent = sibling
      ? lineIndentAt(text, insertAt)
      : `${lineIndentAt(text, insertAt)}  `;

    // Props: name is required by the component; the source is the agent's call.
    const props: string[] = [];
    if (options.nameExpr) {
      props.push(`name={${options.nameExpr}}`);
    } else {
      props.push(`name="Welcome"`);
      notes.push({
        file: relative,
        line: lineOf(insertAt),
        message:
          "Hero inserted with a placeholder name. Pass --name-expr with the app's own " +
          "signed-in user (for example the auth store's display name) and re-run.",
      });
    }
    if (options.greeting) props.push(`greeting=${quote}${options.greeting}${quote}`);

    const imageImports: string[] = [];
    if (options.images.length > 0) {
      const entries = options.images.map((image, index) => {
        const name = `heroImage${index + 1}`;
        imageImports.push(`import ${name} from ${quote}${image}${quote};`);
        return `{ src: ${name} }`;
      });
      props.push(`images={[${entries.join(", ")}]}`);
    }

    edits.push({
      start: insertAt,
      end: insertAt,
      text: `\n${indent}<HeroBanner ${props.join(" ")} />`,
    });

    // Imports: HeroBanner into the library statement, plus anything the name
    // expression needs.
    let missingLibImport = false;
    const libImport = findImport(ts, source, LIBRARY);
    if (libImport) {
      const named = libImport.importClause?.namedBindings;
      const already = named && ts.isNamedImports(named)
        ? (named as TsNamedImports).elements.some(
            (element) => element.name.text === "HeroBanner",
          )
        : false;
      if (!already && named && ts.isNamedImports(named)) {
        const elements = (named as TsNamedImports).elements;
        const last = elements[elements.length - 1];
        const multiline = text.slice(libImport.getStart(source), libImport.getEnd()).includes("\n");
        const specifierIndent = multiline
          ? lineIndentAt(text, last.getStart(source))
          : "";
        edits.push({
          start: last.getEnd(),
          end: last.getEnd(),
          text: multiline ? `,\n${specifierIndent}HeroBanner` : ", HeroBanner",
        });
      }
    } else {
      // The page may not import the library at all (its metrics live in a
      // child component). Add the statement rather than refusing.
      notes.push({
        file: relative,
        line: 1,
        message: `Added a new ${LIBRARY} import for HeroBanner.`,
      });
      missingLibImport = true;
    }

    const extraLines: string[] = [];
    if (missingLibImport) {
      extraLines.push(`import { HeroBanner } from ${quote}${LIBRARY}${quote};`);
    }
    for (const entry of options.imports) {
      const separator = entry.indexOf(":");
      if (separator < 1) continue;
      const name = entry.slice(0, separator).trim();
      const module = entry.slice(separator + 1).trim();
      if (!name || !module) continue;
      if (usesIdentifier(text, name)) continue;
      extraLines.push(`import { ${name} } from ${quote}${module}${quote};`);
    }
    for (const line of imageImports) {
      if (!text.includes(line.trim())) extraLines.push(line);
    }

    if (extraLines.length > 0) {
      const statements = source.statements.filter((statement) =>
        ts.isImportDeclaration(statement),
      );
      const anchor = statements[statements.length - 1];
      if (anchor) {
        edits.push({
          start: anchor.getEnd(),
          end: anchor.getEnd(),
          text: `\n${extraLines.join("\n")}`,
        });
      }
    }

    let next = text;
    for (const edit of edits.sort((a, b) => b.start - a.start)) {
      next = next.slice(0, edit.start) + edit.text + next.slice(edit.end);
    }

    if (next !== text) {
      filesChanged += 1;
      changes.push({
        file: relative,
        line: lineOf(insertAt),
        component: "HeroBanner",
        description: `HeroBanner inserted ${placement}`,
      });
      const gapSignal = /className="[^"]*\bgap-|\bgap-body\b/.test(text);
      if (!gapSignal) {
        notes.push({
          file: relative,
          line: lineOf(insertAt),
          message:
            "The page's root does not look like a gap-spaced stack, so check the hero's " +
            "spacing against the section below it.",
        });
      }
      if (options.write) await writeFile(file, next, "utf8");
    }
  }

  return { filesScanned, filesChanged, changes, notes, candidates: [] };
}
