import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { existsSync, readdirSync } from "fs";
import { resolve } from "path";
import { libInjectCss } from "vite-plugin-lib-inject-css";

const target = process.env.BUILD_TARGET || "default";

const configs: Record<string, () => ReturnType<typeof defineConfig>> = {
	default: () =>
		defineConfig({
			plugins: [react(), libInjectCss()],
			// Relative base: a `?no-inline` asset is emitted as a file and
			// referenced as new URL("x", import.meta.url), which the consuming
			// app's bundler resolves. Without it the URL is root-absolute.
			base: "./",
			build: {
				lib: {
					entry: resolve(__dirname, "src/index.ts"),
					name: "GslComponents",
					formats: ["es", "cjs"],
					fileName: (format: string) =>
						format === "es" ? "index.js" : "index.cjs",
				},
				rollupOptions: {
					external: (id: string) =>
						id === "react" ||
						id === "react-dom" ||
						id === "react/jsx-runtime" ||
						id === "react-hook-form" ||
						id.startsWith("react-hook-form/") ||
						id.startsWith("@radix-ui/") ||
						id === "lucide-react" ||
						id.startsWith("lucide-react/") ||
						id === "@phosphor-icons/react" ||
						id.startsWith("@phosphor-icons/react/") ||
						id === "lottie-react" ||
						id.startsWith("lottie-react/") ||
						id === "lottie-web" ||
						id.startsWith("lottie-web/") ||
						id === "react-router-dom" ||
						id.startsWith("react-router-dom/") ||
						id === "react-router" ||
						id.startsWith("react-router/") ||
						id === "papaparse" ||
						id.startsWith("papaparse/") ||
						id === "read-excel-file" ||
						id.startsWith("read-excel-file/") ||
						id === "write-excel-file" ||
						id.startsWith("write-excel-file/"),
					output: {
						globals: {
							react: "React",
							"react-dom": "ReactDOM",
							"react/jsx-runtime": "jsxRuntime",
						},
						assetFileNames: "[name][extname]",
					},
				},
			},
		}),

	next: () =>
		defineConfig({
			plugins: [react(), libInjectCss()],
			// Relative base: a `?no-inline` asset is emitted as a file and
			// referenced as new URL("x", import.meta.url), which the consuming
			// app's bundler resolves. Without it the URL is root-absolute.
			base: "./",
			build: {
				outDir: "dist",
				emptyOutDir: false,
				lib: {
					entry: resolve(__dirname, "src/next-index.ts"),
					name: "GslComponentsNext",
					formats: ["es", "cjs"],
					fileName: (format: string) =>
						format === "es" ? "next.js" : "next.cjs",
				},
				rollupOptions: {
					external: (id: string) =>
						id === "react" ||
						id === "react-dom" ||
						id === "react/jsx-runtime" ||
						id === "@phosphor-icons/react" ||
						id.startsWith("@phosphor-icons/react/") ||
						id === "lottie-react" ||
						id.startsWith("lottie-react/") ||
						id === "lottie-web" ||
						id.startsWith("lottie-web/") ||
						id === "next/navigation" ||
						id === "next/link" ||
						id.startsWith("next/") ||
						id === "papaparse" ||
						id.startsWith("papaparse/") ||
						id === "read-excel-file" ||
						id.startsWith("read-excel-file/") ||
						id === "write-excel-file" ||
						id.startsWith("write-excel-file/"),
					output: {
						globals: {
							react: "React",
							"react-dom": "ReactDOM",
							"react/jsx-runtime": "jsxRuntime",
						},
						assetFileNames: (info: { name?: string }) => {
							if (info.name === "next") {
								return "next.css";
							}
							return "[name][extname]";
						},
						manualChunks: () => "next",
					},
				},
				cssCodeSplit: false,
			},
		}),

	// Per-component ESM entries (`@rfdtech/components/<dir>`). One output file
	// per source module, every package external, no CSS: apps import
	// style.css (or components.css) once, as with the root entry.
	modules: () =>
		defineConfig({
			plugins: [react()],
			base: "./",
			build: {
				outDir: "dist/modules",
				emptyOutDir: true,
				cssCodeSplit: false,
				lib: {
					entry: {
						...Object.fromEntries(
							readdirSync(resolve(__dirname, "src/components"))
								.filter((dir) =>
									existsSync(resolve(__dirname, "src/components", dir, "index.ts")),
								)
								.map((dir) => [
									`components/${dir}/index`,
									resolve(__dirname, "src/components", dir, "index.ts"),
								]),
						),
						"react-router": resolve(__dirname, "src/react-router.ts"),
					},
					formats: ["es"],
				},
				rollupOptions: {
					external: (id: string) =>
						!id.startsWith(".") &&
						!id.startsWith("/") &&
						!id.startsWith("\0") &&
						!/^[A-Za-z]:[\\/]/.test(id),
					output: {
						preserveModules: true,
						preserveModulesRoot: "src",
						entryFileNames: "[name].js",
						assetFileNames: "[name][extname]",
					},
				},
			},
		}),
};

const configFn = configs[target];
if (!configFn) {
	throw new Error(
		`Unknown BUILD_TARGET: ${target}. Expected "default", "next" or "modules".`,
	);
}

export default configFn();
