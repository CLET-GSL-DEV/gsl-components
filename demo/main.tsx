import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  setRouterAdapter,
  useReactRouterAdapter,
} from "@rfdtech/components";
import { routes } from "./App";
import "./demo.css";

// Explicit init: the library's module-load side effect can be tree-shaken
// out of the demo bundle, leaving the registry unconfigured (prod blank
// page: "RouterAdapter not configured"). Calling it here guarantees it runs.
setRouterAdapter(useReactRouterAdapter);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={createBrowserRouter(routes)} />,
);
