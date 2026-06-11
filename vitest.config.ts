import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    pool: "forks",
  },
  resolve: {
    alias: {
      "@gsl/components": resolve(__dirname, "src/index.ts"),
    },
  },
});
