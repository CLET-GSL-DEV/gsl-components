import { Navigate, Route, Routes } from "react-router-dom";
import { DemoLayout } from "./components/DemoLayout";
import { DemoPage } from "./pages/DemoPage";
import { MembersPage } from "./pages/MembersPage";
import { DocsPage } from "./pages/DocsPage";

export function App() {
  return (
    <Routes>
      <Route element={<DemoLayout />}>
        <Route index element={<DemoPage />} />
        <Route path="/members" element={<MembersPage />} />
      </Route>
      <Route path="/docs" element={<Navigate to="/docs/getting-started" replace />} />
      <Route path="/docs/:componentId" element={<DocsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
