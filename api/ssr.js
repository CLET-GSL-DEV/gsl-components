import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(__dirname, "../demo/dist/client");

export default async function handler(req, res) {
  try {
    const template = fs.readFileSync(
      path.join(clientDir, "index.html"),
      "utf-8",
    );

    const mod = await import(
      path.resolve(__dirname, "../demo/dist/server/entry-server.js")
    );

    const appHtml = mod.render(req.url);
    const html = template.replace("<!--ssr-outlet-->", appHtml);

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(html);
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html");
    res.end(`<pre>${e.stack || e.message}</pre>`);
  }
}
