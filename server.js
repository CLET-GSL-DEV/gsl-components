import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function serveStaticFile(res, filePath) {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return false;
    const ext = path.extname(filePath);
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";
    const content = fs.readFileSync(filePath);
    res.statusCode = 200;
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", stat.size);
    res.end(content);
    return true;
  } catch {
    return false;
  }
}

function isDocsRoute(url) {
  const { pathname } = new URL(url, "http://localhost");
  return pathname.startsWith("/docs");
}

async function handleRequest(req, res, vite) {
  const url = req.url || "/";

  try {
    let template;

    if (!isProduction && vite) {
      template = fs.readFileSync(
        path.resolve(__dirname, "demo/index.html"),
        "utf-8",
      );
      template = await vite.transformIndexHtml(url, template);
    } else {
      template = fs.readFileSync(
        path.resolve(__dirname, "demo/dist/client/index.html"),
        "utf-8",
      );
    }

    // Only SSR for /docs routes. Everything else is SPA.
    if (isDocsRoute(url)) {
      let render;
      if (!isProduction && vite) {
        const mod = await vite.ssrLoadModule("/entry-server.tsx");
        render = mod.render;
      } else {
        const mod = await import(
          path.resolve(__dirname, "demo/dist/server/entry-server.js")
        );
        render = mod.render;
      }
      const appHtml = render(url);
      template = template.replace("<!--ssr-outlet-->", appHtml);
    } else {
      template = template.replace("<!--ssr-outlet-->", "");
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(template);
  } catch (e) {
    if (!isProduction && vite) {
      vite.ssrFixStacktrace(e);
    }
    console.error(e);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html");
    res.end(`<pre>${e.stack || e.message}</pre>`);
  }
}

async function createServer() {
  let vite = null;
  if (!isProduction) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
      configFile: path.resolve(__dirname, "vite.demo.config.ts"),
    });
  }

  const server = http.createServer((req, res) => {
    if (!isProduction && vite) {
      vite.middlewares(req, res, () => {
        handleRequest(req, res, vite);
      });
    } else {
      const clientDir = path.resolve(__dirname, "demo/dist/client");
      const url = new URL(req.url || "/", "http://localhost");
      const pathname = url.pathname;

      // Serve static assets (JS, CSS, images) — never serve index.html
      // directly. index.html is the SSR/SPA template.
      if (pathname !== "/" && pathname !== "/index.html") {
        const filePath = path.join(clientDir, pathname);
        if (serveStaticFile(res, filePath)) return;
      }

      handleRequest(req, res, null);
    }
  });

  const port = process.env.PORT || 5173;
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer();
