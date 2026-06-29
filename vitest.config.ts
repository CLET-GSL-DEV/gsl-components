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
      "@rfdtech/components": resolve(__dirname, "src/index.ts"),
      "lottie-react": resolve(__dirname, "src/test/mocks/lottie-react.ts"),
    },
  },
});
