import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { App } from "./App";
import { ThemeProvider } from "./components/ThemeToggle";

export function render(url: string): string {
  return renderToString(
    <ThemeProvider defaultTheme="system" storageKey="gsl-theme">
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </ThemeProvider>,
  );
}
