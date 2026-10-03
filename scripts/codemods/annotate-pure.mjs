#!/usr/bin/env node
// Marks top-level forwardRef / memo / createContext calls as pure, so a
// consumer's bundler can drop the components an app never imports.
//
//   node scripts/codemods/annotate-pure.mjs          write annotations
//   node scripts/codemods/annotate-pure.mjs --check  write nothing, exit 1 if any is missing
//
// AST based (TypeScript compiler API): only a VariableStatement directly under
// the SourceFile is considered. The only edits are inserting the annotation at
// the call's start, or collapsing a repeated one to a single copy. Running it
// twice changes nothing; --check also fails on a repeated annotation.
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const SRC = join(ROOT, "src");
const ANNOTATION = "/* @__PURE__ */ ";
const PURE_CALLEES = new Set(["forwardRef", "memo", "createContext"]);
const check = process.argv.includes("--check");

function isSkipped(name) {
	return (
		name.endsWith(".test.ts") ||
		name.endsWith(".test.tsx") ||
		name.endsWith(".test-d.ts") ||
		name.endsWith(".d.ts")
	);
}

function walk(dir, out = []) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			walk(full, out);
		} else if (/\.tsx?$/.test(entry) && !isSkipped(entry)) {
			out.push(full);
		}
	}
	return out;
}

function unwrap(node) {
	let current = node;
	while (
		current &&
		(ts.isAsExpression(current) ||
			ts.isSatisfiesExpression(current) ||
			ts.isParenthesizedExpression(current))
	) {
		current = current.expression;
	}
	return current;
}

function isPureCallee(expression) {
	if (ts.isIdentifier(expression)) {
		return PURE_CALLEES.has(expression.text);
	}
	return (
		ts.isPropertyAccessExpression(expression) &&
		ts.isIdentifier(expression.expression) &&
		expression.expression.text === "React" &&
		PURE_CALLEES.has(expression.name.text)
	);
}

// The trivia between `=` and the call. ts.getLeadingCommentRanges skips a
// comment that sits on the same line as the `=`, so the raw slice is read.
function pureCount(text, call, sourceFile) {
	const trivia = text.slice(call.getFullStart(), call.getStart(sourceFile));
	return trivia.split("@__PURE__").length - 1;
}

// One edit per site: insert the annotation when it is missing, or collapse a
// repeated annotation run directly before the call down to exactly one.
function editsIn(path, text) {
	const kind = path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
	const sourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, kind);
	const edits = [];

	for (const statement of sourceFile.statements) {
		if (!ts.isVariableStatement(statement)) continue;
		for (const declaration of statement.declarationList.declarations) {
			const call = unwrap(declaration.initializer);
			if (!call || !ts.isCallExpression(call) || !isPureCallee(call.expression)) continue;

			const start = call.getStart(sourceFile);
			const count = pureCount(text, call, sourceFile);
			if (count === 1) continue;
			if (count === 0) {
				edits.push({ from: start, to: start, text: ANNOTATION });
				continue;
			}

			let from = start;
			while (text.slice(from - ANNOTATION.length, from) === ANNOTATION) {
				from -= ANNOTATION.length;
			}
			if (from === start) {
				throw new Error(`${relative(ROOT, path)}: repeated @__PURE__ not directly before the call`);
			}
			edits.push({ from, to: start, text: ANNOTATION });
		}
	}

	return edits;
}

let total = 0;
for (const path of walk(SRC)) {
	const text = readFileSync(path, "utf8");
	const edits = editsIn(path, text);
	if (edits.length === 0) continue;

	total += edits.length;
	console.log(`${relative(ROOT, path)}: ${edits.length}`);
	if (check) continue;

	let next = text;
	for (const edit of [...edits].sort((a, b) => b.from - a.from)) {
		next = next.slice(0, edit.from) + edit.text + next.slice(edit.to);
	}
	writeFileSync(path, next);
}

console.log(`total: ${total}`);
if (check && total > 0) {
	console.error("Missing or repeated @__PURE__ annotations. Run: node scripts/codemods/annotate-pure.mjs");
	process.exit(1);
}
