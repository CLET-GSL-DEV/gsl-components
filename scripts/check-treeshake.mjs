#!/usr/bin/env node
// Proves an app that imports one component does not get the whole library.
// Builds two throwaway fixtures the way a consuming app would (Vite app build,
// minified, packages external) that import Button:
//   A  from the root entry (dist/index.js)
//   B  from its per-component entry (dist/modules/components/button)
// Each fails on a marker found in its JS or on going over its byte budget.
// A keeps the asset URL references the root bundle cannot drop, so it is
// held to a budget and to "no base64, no static heavy imports"; B must carry
// nothing but Button. Run after `pnpm build`.
import { Buffer } from "node:buffer";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

// Base64 payloads and static imports of the on-demand packages.
const HEAVY_MARKERS = [
	";base64,",
	'from "papaparse"',
	'from "read-excel-file',
	'from "write-excel-file',
	'from "lottie-web"',
];

// Anything from another component: B imports Button and nothing else.
const FOREIGN_MARKERS = [
	"hero-1",
	"clet futuristic artwork",
	"adinkra-symbol",
	"clet-sidebar",
	"clet-table",
	"clet-hero-banner",
];

const FIXTURES = [
	{
		name: "A",
		target: join(ROOT, "dist/index.js"),
		markers: HEAVY_MARKERS,
		budget: 250_000,
	},
	{
		name: "B",
		target: join(ROOT, "dist/modules/components/button/index.js"),
		markers: [...HEAVY_MARKERS, ...FOREIGN_MARKERS],
		budget: 5_000,
	},
];

const isExternal = (id) =>
	!id.startsWith(".") &&
	!id.startsWith("/") &&
	!id.startsWith("\0") &&
	!/^[A-Za-z]:[\\/]/.test(id);

const workDir = mkdtempSync(join(tmpdir(), "treeshake-"));
let failed = false;

try {
	for (const { name, target, markers, budget } of FIXTURES) {
		const entry = join(workDir, `${name}.js`);
		writeFileSync(entry, `import { Button } from ${JSON.stringify(target)};\nconsole.log(Button);\n`);

		const result = await build({
			configFile: false,
			logLevel: "silent",
			root: workDir,
			build: {
				write: false,
				minify: true,
				// The app's own small-asset inlining is its choice; measure only
				// what the library ships.
				assetsInlineLimit: 0,
				rollupOptions: { input: entry, external: isExternal },
			},
		});

		const outputs = (Array.isArray(result) ? result : [result]).flatMap((r) => r.output);
		const code = outputs
			.filter((chunk) => chunk.type === "chunk")
			.map((chunk) => chunk.code)
			.join("\n");
		const found = markers.filter((marker) => code.includes(marker));
		const bytes = Buffer.byteLength(code);
		const problems = [...found];
		if (bytes > budget) problems.push(`over budget ${budget}`);

		if (problems.length > 0) {
			failed = true;
			console.log(`${name} ${bytes} bytes FAIL: ${problems.join(", ")}`);
		} else {
			console.log(`${name} ${bytes} bytes ok (budget ${budget})`);
		}
	}
} finally {
	rmSync(workDir, { recursive: true, force: true });
}

process.exit(failed ? 1 : 0);
