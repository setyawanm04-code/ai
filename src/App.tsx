import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import Shell from "./components/Shell";
import Dashboard from "./pages/Dashboard";
import ProjectsList from "./pages/projects/ProjectsList";
import ProjectOverview from "./pages/projects/ProjectOverview";
import IdeaLab from "./pages/IdeaLab";
import ProductPlanner from "./pages/ProductPlanner";
import UIUXStudio from "./pages/UIUXStudio";
import Tasks from "./pages/Tasks";
import Bugs from "./pages/Bugs";
import CodeStudio from "./pages/CodeStudio";
import Testing from "./pages/Testing";
import DatabaseStudio from "./pages/DatabaseStudio";
import Security from "./pages/Security";
import Documentation from "./pages/Documentation";
import Deployment from "./pages/Deployment";
import Portfolio from "./pages/Portfolio";
import Learning from "./pages/Learning";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Shell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<ProjectsList />} />
        <Route path="projects/:projectId" element={<ProjectOverview />} />
        <Route path="idea-lab" element={<IdeaLab />} />
        <Route path="planner" element={<ProductPlanner />} />
        <Route path="uiux" element={<UIUXStudio />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="bugs" element={<Bugs />} />
        <Route path="code" element={<CodeStudio />} />
        <Route path="testing" element={<Testing />} />
        <Route path="database" element={<DatabaseStudio />} />
        <Route path="security" element={<Security />} />
        <Route path="docs" element={<Documentation />} />
        <Route path="deployment" element={<Deployment />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="learning" element={<Learning />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
