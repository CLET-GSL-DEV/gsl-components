import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { libInjectCss } from "vite-plugin-lib-inject-css";

const target = process.env.BUILD_TARGET || "default";

const configs: Record<string, () => ReturnType<typeof defineConfig>> = {
	default: () =>
		defineConfig({
			plugins: [react(), libInjectCss()],
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
						id === "lottie-react" ||
						id.startsWith("lottie-react/") ||
						id === "lottie-web" ||
						id.startsWith("lottie-web/") ||
						id === "react-router-dom" ||
						id.startsWith("react-router-dom/") ||
						id === "react-router" ||
						id.startsWith("react-router/"),
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
						id === "next/navigation" ||
						id === "next/link" ||
						id.startsWith("next/"),
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
};

const configFn = configs[target];
if (!configFn) {
	throw new Error(
		`Unknown BUILD_TARGET: ${target}. Expected "default" or "next".`,
	);
}

export default configFn();
