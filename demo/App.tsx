import type { RouteRecord } from "vite-react-ssg";
import { ClientOnly } from "vite-react-ssg";
import { Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeToggle";
import { DemoLayout } from "./components/DemoLayout";
import { DemoLayout2 } from "./components/DemoLayout2";
import { DemoPage } from "./pages/DemoPage";
import { Dashboard2Page } from "./pages/Dashboard2Page";
import { MembersPage } from "./pages/MembersPage";
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
        element: <DemoLayout />,
        children: [
          { index: true, element: <DemoPage /> },
          { path: "members", element: <MembersPage /> },
        ],
      },
      {
        element: <DemoLayout2 />,
        children: [{ path: "dashboard2", element: <Dashboard2Page /> }],
      },
      {
        path: "docs",
        element: <ClientOnly>{() => <Navigate to="/docs/getting-started" replace />}</ClientOnly>,
      },
      {
        path: "docs/:componentId",
        element: <DocsPage />,
        getStaticPaths: () => getAllDocSlugs().map((slug) => `docs/${slug}`),
      },
      { path: "*", element: <ClientOnly>{() => <Navigate to="/" replace />}</ClientOnly> },
    ],
  },
];
