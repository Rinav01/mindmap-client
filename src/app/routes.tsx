import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import EditorPage from "../pages/Editor/EditorPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import LandingPage from "../pages/Landing/LandingPage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage view="recent" />} />
          <Route path="/starred" element={<DashboardPage view="starred" />} />
          <Route path="/all" element={<DashboardPage view="all" />} />
          <Route path="/trash" element={<DashboardPage view="trash" />} />
          <Route path="/editor/:id" element={<EditorPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
