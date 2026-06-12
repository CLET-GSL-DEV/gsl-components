import type { IncomingMessage, ServerResponse } from "http";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { resolve } from "path";

const mockMeAppsResponse = {
  success: true,
  message: "Available systems retrieved.",
  data: {
    apps: [
      {
        system_id: "gov-portal",
        system_name: "Governance Portal",
        system_code: "GOV-123456",
        frontend_url: "http://178.105.154.224:3001",
        role: "registrar",
        permissions: ["cases:review"],
      },
      {
        system_id: "finance-hub",
        system_name: "Finance Hub",
        system_code: "FIN-654321",
        frontend_url: "http://178.105.154.224:3002",
        role: "analyst",
        permissions: ["reports:read"],
      },
      {
        system_id: "hr-suite",
        system_name: "HR Suite",
        system_code: "HR-112233",
        frontend_url: "",
        role: "viewer",
        permissions: ["employees:read"],
      },
    ],
  },
  meta: {
    count: 3,
  },
};

function mockMeAppsPlugin(): Plugin {
  return {
    name: "mock-me-apps",
    configureServer(server) {
      server.middlewares.use(
        (
          req: IncomingMessage,
          res: ServerResponse,
          next: (err?: Error) => void,
        ) => {
          if (req.url !== "/v1/me/apps" || req.method !== "GET") {
            next();
            return;
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(mockMeAppsResponse));
        },
      );
    },
  };
}

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [
            rehypePrettyCode,
            {
              theme: "github-light",
              keepBackground: false,
            },
          ],
        ],
      }),
    },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    mockMeAppsPlugin(),
  ],
  root: "demo",
  resolve: {
    alias: {
      "@rfdtech/components": resolve(__dirname, "src/index.ts"),
    },
  },
  server: {
    port: 5173,
  },
});
