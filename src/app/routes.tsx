import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import EditorPage from "../pages/Editor/EditorPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/editor/:id" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
