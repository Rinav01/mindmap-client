import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import EditorPage from "../pages/Editor/EditorPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage view="recent" />} />
        <Route path="/starred" element={<DashboardPage view="starred" />} />
        <Route path="/all" element={<DashboardPage view="all" />} />
        <Route path="/trash" element={<DashboardPage view="trash" />} />
        <Route path="/editor/:id" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
