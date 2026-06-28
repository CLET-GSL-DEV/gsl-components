import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { resolve } from "path";

// Vite's SSR module runner cannot extract named exports from
// react-router-dom (CJS). This plugin rewrites named imports
// to default-import + destructuring, which works reliably.
function reactRouterSSRPlugin() {
  const importRE = /import\s+\{([^}]+)\}\s+from\s+["']react-router-dom["'];?/g;

  return {
    name: "react-router-dom-ssr",
    enforce: "pre" as const,
    transform(code: string, id: string, options?: { ssr?: boolean }) {
      if (!options?.ssr) return;
      if (!importRE.test(code)) return;
      // Reset lastIndex since test() mutated it
      importRE.lastIndex = 0;

      let counter = 0;
      const result = code.replace(importRE, (_match, specifiers: string) => {
        const varName = `_rr${counter++ || ""}`;
        return `import * as ${varName} from "react-router-dom";\nconst { ${specifiers.trim()} } = ${varName} as any;`;
      });

      if (result !== code) {
        return { code: result, map: null };
      }
    },
  };
}

export default defineConfig({
  plugins: [
    reactRouterSSRPlugin(),
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [
            rehypePrettyCode,
            {
              theme: {
                light: "github-light",
                dark: "github-dark",
              },
              keepBackground: false,
            },
          ],
        ],
      }),
    },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
  ],
  root: "demo",
  resolve: {
    alias: {
      "@rfdtech/components": resolve(__dirname, "src/index.ts"),
      demo: resolve(__dirname, "demo"),
    },
  },
  server: {
    port: 5173,
  },
});
