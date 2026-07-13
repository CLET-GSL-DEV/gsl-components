import type { RouteRecord } from "vite-react-ssg";
import { ClientOnly } from "vite-react-ssg";
import { Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeToggle";
import { DemoLayout } from "./components/DemoLayout";
import { DemoLayout2 } from "./components/DemoLayout2";
import { DemoPage } from "./pages/DemoPage";
import { Dashboard2Page } from "./pages/Dashboard2Page";
import { DocsPage } from "./pages/DocsPage";
import { getAllDocSlugs } from "./docs/registry";

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: (
      <ThemeProvider defaultTheme="system" storageKey="gsl-theme">
        <Outlet />
      </ThemeProvider>
    ),
    children: [
      {
        // Current (new design system) — the main dashboard
        element: <DemoLayout2 />,
        children: [{ index: true, element: <Dashboard2Page /> }],
      },
      {
        // Previous version, unchanged, reachable via the version switcher
        element: <DemoLayout />,
        children: [{ path: "legacy", element: <DemoPage /> }],
      },
      {
        path: "docs",
        element: (
          <ClientOnly>
            {() => <Navigate to="/docs/getting-started" replace />}
          </ClientOnly>
        ),
      },
      {
        path: "docs/:componentId",
        element: <DocsPage />,
        getStaticPaths: () => getAllDocSlugs().map((slug) => `docs/${slug}`),
      },
      {
        path: "*",
        element: <ClientOnly>{() => <Navigate to="/" replace />}</ClientOnly>,
      },
    ],
  },
];
