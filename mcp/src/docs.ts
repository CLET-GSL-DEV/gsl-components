import { readFile } from "node:fs/promises";
import path from "node:path";
import { GENERATED_DIR } from "./paths.js";

export interface ExampleEntry {
  file: string;
  importName?: string;
  title: string;
  components: string[];
  source: string;
}

export interface ComponentMeta {
  slug: string;
  title: string;
  description?: string;
  category?: string;
  keywords: string[];
  since?: string;
  status?: string;
  related: string[];
  import?: string;
}

export interface ComponentEntry {
  meta: ComponentMeta;
  docs: string;
  headings: string[];
  types: string | null;
  examples: ExampleEntry[];
  ruleIds: string[];
}

export interface Rule {
  id: string;
  title: string;
  severity: string;
  components: string[];
  body: string;
}

export interface SearchEntry {
  slug: string;
  name: string;
  category?: string;
  keywords: string[];
  description?: string;
  headings: string[];
}

export interface TokenEntry {
  group: string;
  scope: "global" | "component";
  /** Owning component slug, e.g. "card" — only set when scope is "component". */
  component?: string;
  /** Component-scoped tokens' declared default (from that component's own styles/*.css). */
  base?: string;
  light?: string;
  dark?: string;
}

export interface LoadedIndex {
  components: Record<string, ComponentEntry>;
  search: SearchEntry[];
  rules: Record<string, Rule[]>;
  rulesById: Record<string, Rule>;
  tokens: Record<string, TokenEntry>;
  examples: Record<string, ExampleEntry[]>;
}

async function readJson<T>(name: string): Promise<T> {
  const raw = await readFile(path.join(GENERATED_DIR, name), "utf8");
  return JSON.parse(raw) as T;
}

export async function loadIndex(): Promise<LoadedIndex> {
  const [components, search, rules, tokens, examples] = await Promise.all([
    readJson<Record<string, ComponentEntry>>("components.json"),
    readJson<SearchEntry[]>("search.json"),
    readJson<Record<string, Rule[]>>("rules.json"),
    readJson<Record<string, TokenEntry>>("tokens.json"),
    readJson<Record<string, ExampleEntry[]>>("examples.json"),
  ]);

  const rulesById: Record<string, Rule> = {};
  for (const category of Object.values(rules)) {
    for (const rule of category) rulesById[rule.id] = rule;
  }

  return { components, search, rules, rulesById, tokens, examples };
}

export function listSlugs(idx: LoadedIndex): string[] {
  return Object.keys(idx.components).sort();
}

export function getComponent(idx: LoadedIndex, slug: string): ComponentEntry | null {
  return idx.components[slug.trim().toLowerCase()] ?? null;
}

export interface ScoredMatch {
  slug: string;
  name: string;
  category?: string;
  description?: string;
  score: number;
}

/**
 * Lexical ranking over name/slug/keywords/description/headings. No embeddings —
 * this is a local, offline MCP server; ranking is transparent term overlap, not
 * semantic similarity. Good enough for "table pagination" -> Table, "wizard" ->
 * Stepper (via keywords), etc.
 */
export function searchComponents(idx: LoadedIndex, query: string, limit = 8): ScoredMatch[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const scored = idx.search.map((entry) => {
    const slug = entry.slug.toLowerCase();
    const name = (entry.name ?? "").toLowerCase();
    const keywords = (entry.keywords ?? []).map((k) => k.toLowerCase());
    const description = (entry.description ?? "").toLowerCase();
    const headings = (entry.headings ?? []).map((h) => h.toLowerCase());

    let score = 0;
    for (const term of terms) {
      if (slug === term) score += 10;
      if (slug.includes(term)) score += 5;
      if (name.includes(term)) score += 4;
      if (keywords.some((k) => k.includes(term))) score += 3;
      if (description.includes(term)) score += 2;
      if (headings.some((h) => h.includes(term))) score += 1;
    }
    return { entry, score };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => ({
      slug: r.entry.slug,
      name: r.entry.name,
      category: r.entry.category,
      description: r.entry.description,
      score: r.score,
    }));
}

export function searchDocs(
  idx: LoadedIndex,
  query: string,
  limit = 8
): { slug: string; name: string; matchedHeadings: string[]; score: number }[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const results = Object.values(idx.components).map((entry) => {
    const body = entry.docs.toLowerCase();
    const matchedHeadings = entry.headings.filter((h) =>
      terms.some((t) => h.toLowerCase().includes(t))
    );
    let score = 0;
    for (const term of terms) {
      if (body.includes(term)) score += 2;
    }
    score += matchedHeadings.length;
    return { slug: entry.meta.slug, name: entry.meta.title, matchedHeadings, score };
  });

  return results
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** `topic` may be a rules category (e.g. "forms") or a component slug (e.g. "dialog"). */
export function getRules(idx: LoadedIndex, topic?: string): Record<string, Rule[]> {
  if (!topic) return idx.rules;
  const key = topic.trim().toLowerCase();
  if (idx.rules[key]) return { [key]: idx.rules[key] };

  const matched: Rule[] = [];
  for (const rules of Object.values(idx.rules)) {
    matched.push(...rules.filter((r) => r.components.includes(key)));
  }
  return matched.length ? { [key]: matched } : {};
}

export function searchRules(idx: LoadedIndex, query: string, limit = 10): Rule[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const all = Object.values(idx.rules).flat();
  const scored = all.map((rule) => {
    const hay = `${rule.title} ${rule.body} ${rule.components.join(" ")}`.toLowerCase();
    const score = terms.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0);
    return { rule, score };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.rule);
}
