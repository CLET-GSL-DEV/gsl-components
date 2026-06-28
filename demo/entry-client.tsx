import { StrictMode } from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { ThemeProvider } from "./components/ThemeToggle";
import "./demo.css";

const root = document.getElementById("root")!;

// SSR pages have pre-rendered content (actual elements, not just the
// <!--ssr-outlet--> comment). SPA pages only have the empty outlet comment.
const hasSSR = Array.from(root.childNodes).some(
  (n) => n.nodeType !== Node.COMMENT_NODE,
);

const app = (
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="gsl-theme">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);

if (hasSSR) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
