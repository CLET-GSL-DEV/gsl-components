import { Navigate, Route, Routes } from "react-router-dom";
import { DemoPage } from "./pages/DemoPage";
import { DocsPage } from "./pages/DocsPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<DemoPage />} />
      <Route path="/docs" element={<Navigate to="/docs/getting-started" replace />} />
      <Route path="/docs/:componentId" element={<DocsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
