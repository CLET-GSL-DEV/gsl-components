#!/usr/bin/env node
import { loadIndex, searchComponents } from "./docs.js";
import { runDoctor } from "./installers/doctor.js";
import { runSetup } from "./installers/setup.js";
import { buildIndex } from "./indexer.js";
import { runAddHero } from "./add-hero.js";
import { runMigrate } from "./migrate.js";
import { GENERATED_DIR, hasRepoSource } from "./paths.js";

const USAGE = `rfdui — @rfdtech/components AI tooling

Usage:
  rfdui setup           Detect installed AI tools (Claude Code, Cursor, Codex, OpenCode) and wire up
                         the MCP server + a shared skill doc for each.
  rfdui doctor           Report whether the index, MCP, and each AI tool are configured correctly.
  rfdui index            Rebuild the generated docs index (only works inside the repo checkout).
  rfdui mcp              Run the MCP server directly over stdio.
  rfdui search <query>   Lexical search over components from the terminal.
  rfdui update           Rebuild the index (if possible) and re-run setup.
  rfdui migrate          Move AppLayout/AppHeader/Sidebar onto the 2.4 layout shell,
                         and (by default) put the HeroBanner on the landing dashboard.
  rfdui add-hero         Insert HeroBanner into the dashboard files you name.

Migrate options:
  --write                Apply the edits. Without it the run only reports them.
  --preserve             Keep the pre-2.3 look instead of adopting the new shell
                         (AppLayout -> "panel", the brand header -> "primary").
  --path <dir>           Directory or file to migrate. Defaults to the working directory.
`;

function parseMigrateArgs(rest: string[]): {
  root: string;
  write: boolean;
  preserve: boolean;
  hero: "auto" | "all" | "none";
  heroFiles: string[];
  heroNameExpr?: string;
  heroGreeting?: string;
  heroImages: string[];
  heroImports: string[];
} {
  let root = process.cwd();

  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i] === "--path") {
      const value = rest[i + 1];
      if (!value) throw new Error("--path needs a directory or file.");
      root = value;
      i += 1;
    }
  }

  let hero: "auto" | "all" | "none" = "auto";
  const heroFiles: string[] = [];
  const heroImages: string[] = [];
  const heroImports: string[] = [];
  let heroNameExpr: string | undefined;
  let heroGreeting: string | undefined;

  for (let i = 0; i < rest.length; i += 1) {
    const flag = rest[i];
    const value = rest[i + 1];
    if (flag === "--hero") {
      if (!value || !["auto", "all", "none"].includes(value)) {
        throw new Error("--hero needs auto, all or none.");
      }
      hero = value as "auto" | "all" | "none";
      i += 1;
    } else if (flag === "--hero-file") {
      if (!value) throw new Error("--hero-file needs a path.");
      heroFiles.push(value);
      i += 1;
    } else if (flag === "--hero-name-expr") {
      if (!value) throw new Error("--hero-name-expr needs an expression.");
      heroNameExpr = value;
      i += 1;
    } else if (flag === "--hero-greeting") {
      if (!value) throw new Error("--hero-greeting needs a string.");
      heroGreeting = value;
      i += 1;
    } else if (flag === "--hero-images") {
      if (!value) throw new Error("--hero-images needs a comma-separated list.");
      heroImages.push(...value.split(",").map((entry) => entry.trim()).filter(Boolean));
      i += 1;
    } else if (flag === "--hero-import") {
      if (!value) throw new Error("--hero-import needs Name:module.");
      heroImports.push(value);
      i += 1;
    }
  }

  return {
    root,
    write: rest.includes("--write"),
    preserve: rest.includes("--preserve"),
    hero,
    heroFiles,
    heroNameExpr,
    heroGreeting,
    heroImages,
    heroImports,
  };
}


function parseAddHeroArgs(rest: string[]): {
  root: string;
  files: string[];
  write: boolean;
  nameExpr?: string;
  greeting?: string;
  images: string[];
  imports: string[];
} {
  let root = process.cwd();
  const files: string[] = [];
  const images: string[] = [];
  const imports: string[] = [];
  let nameExpr: string | undefined;
  let greeting: string | undefined;

  for (let i = 0; i < rest.length; i += 1) {
    const flag = rest[i];
    const value = rest[i + 1];
    if (flag === "--path") {
      if (!value) throw new Error("--path needs a directory.");
      root = value;
      i += 1;
    } else if (flag === "--file") {
      if (!value) throw new Error("--file needs a path.");
      files.push(value);
      i += 1;
    } else if (flag === "--name-expr") {
      if (!value) throw new Error("--name-expr needs an expression.");
      nameExpr = value;
      i += 1;
    } else if (flag === "--greeting") {
      if (!value) throw new Error("--greeting needs a string.");
      greeting = value;
      i += 1;
    } else if (flag === "--images") {
      if (!value) throw new Error("--images needs a comma-separated list.");
      images.push(...value.split(",").map((entry) => entry.trim()).filter(Boolean));
      i += 1;
    } else if (flag === "--import") {
      if (!value) throw new Error("--import needs Name:module.");
      imports.push(value);
      i += 1;
    }
  }

  return { root, files, write: rest.includes("--write"), nameExpr, greeting, images, imports };
}

async function main() {
  const [, , cmd, ...rest] = process.argv;

  switch (cmd) {
    case "index": {
      if (!hasRepoSource) {
        console.error("`rfdui index` only works inside the gsl-components repo checkout (no source found).");
        process.exitCode = 1;
        return;
      }
      const result = await buildIndex(GENERATED_DIR);
      console.log(`Index built: ${JSON.stringify(result, null, 2)}`);
      return;
    }

    case "search": {
      const query = rest.join(" ").trim();
      if (!query) {
        console.error("Usage: rfdui search <query>");
        process.exitCode = 1;
        return;
      }
      const idx = await loadIndex();
      const results = searchComponents(idx, query);
      if (results.length === 0) {
        console.log(`No components matched "${query}".`);
        return;
      }
      for (const r of results) {
        console.log(`${r.slug.padEnd(24)} ${r.name}${r.description ? ` — ${r.description}` : ""}`);
      }
      return;
    }

    case "doctor":
      await runDoctor();
      return;

    case "setup":
      await runSetup();
      return;

    case "update":
      if (hasRepoSource) {
        const result = await buildIndex(GENERATED_DIR);
        console.log(`Index rebuilt: ${JSON.stringify(result)}`);
      }
      await runSetup();
      return;

    case "migrate": {
      const options = parseMigrateArgs(rest);
      const result = await runMigrate(options);

      for (const change of result.changes) {
        console.log(`${change.file}:${change.line}  ${change.description}`);
      }

      if (result.notes.length > 0) {
        console.log("");
        console.log("Needs a look:");
        for (const note of result.notes) {
          console.log(`${note.file}:${note.line}  ${note.message}`);
        }
      }

      console.log("");
      const mode = options.preserve ? "preserve" : "adopt";
      console.log(
        `${result.changes.length} change(s) across ${result.filesChanged} file(s), ` +
          `${result.filesScanned} scanned (${mode} mode).`,
      );

      // The hero pass rides along: same command, so a migration cannot finish
      // silently missing the one thing the mechanical pass never writes.
      if (!options.preserve && options.hero !== "none") {
        const heroResult = await runAddHero({
          root: options.root,
          files: options.heroFiles,
          mode: options.heroFiles.length > 0 ? "files" : options.hero,
          write: options.write,
          nameExpr: options.heroNameExpr,
          greeting: options.heroGreeting,
          images: options.heroImages,
          imports: options.heroImports,
        });

        console.log("");
        console.log("Hero banner:");
        for (const change of heroResult.changes) {
          console.log(`${change.file}:${change.line}  ${change.description}`);
        }
        for (const note of heroResult.notes) {
          console.log(`${note.file}:${note.line}  ${note.message}`);
        }
        console.log(
          `${heroResult.changes.length} hero(s) across ${heroResult.filesChanged} file(s).`,
        );
      }

      if (!options.write && result.filesChanged > 0) {
        console.log("Nothing was written. Re-run with --write to apply.");
      }
      return;
    }

    case "add-hero": {
      const options = parseAddHeroArgs(rest);
      const result = await runAddHero(options);

      for (const change of result.changes) {
        console.log(`${change.file}:${change.line}  ${change.description}`);
      }

      if (result.candidates.length > 0) {
        console.log("Dashboard candidates:");
        for (const candidate of result.candidates) {
          console.log(`  ${candidate.file}  (${candidate.metricCards} MetricCards)`);
        }
      }

      if (result.notes.length > 0) {
        console.log("");
        console.log("Needs a look:");
        for (const note of result.notes) {
          console.log(`${note.file}:${note.line}  ${note.message}`);
        }
      }

      console.log("");
      console.log(
        `${result.changes.length} hero(s) across ${result.filesChanged} file(s), ` +
          `${result.filesScanned} scanned.`,
      );
      if (!options.write && result.filesChanged > 0) {
        console.log("Nothing was written. Re-run with --write to apply.");
      }
      return;
    }

    case "mcp":
      // Delegate to the server entry point (same process, same stdio streams).
      await import("./index.js");
      return;

    default:
      console.log(USAGE);
      if (cmd && cmd !== "help" && cmd !== "--help") process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
