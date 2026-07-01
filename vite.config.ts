import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { libInjectCss } from "vite-plugin-lib-inject-css";

export default defineConfig({
  plugins: [react(), libInjectCss()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "GslComponents",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
    rollupOptions: {
      external: (id) =>
        id === "react" ||
        id === "react-dom" ||
        id === "react/jsx-runtime" ||
        id === "react-hook-form" ||
        id.startsWith("react-hook-form/") ||
        id.startsWith("@radix-ui/") ||
        id === "react-router-dom" ||
        id.startsWith("react-router-dom/") ||
        id === "react-router" ||
        id.startsWith("react-router/") ||
        id === "lucide-react" ||
        id.startsWith("lucide-react/") ||
        id === "lottie-react" ||
        id.startsWith("lottie-react/") ||
        id === "lottie-web" ||
        id.startsWith("lottie-web/"),
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
});
