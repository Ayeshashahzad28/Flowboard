import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { DataProvider, useData } from "./context/DataContext";
import Login from "./components/Auth/Login";
import Navbar from "./components/Navbar";
import BoardView from "./components/Board/BoardView";
import AnalyticsDashboard from "./components/Analytics/AnalyticsDashboard";
import UserManagementPanel from "./components/Users/UserManagementPanel";
import Toasts from "./components/Toasts";
import { can } from "./utils/permissions";

function AuthedApp() {
  const { currentUser } = useAuth();
  const { tasks, toasts, dismissToast } = useData();
  const [view, setView] = useState("board");

  const resolvedView =
    view === "team" && !can(currentUser.role, "manageUsers")
      ? "board"
      : view;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Navbar view={resolvedView} setView={setView} />

      <main id="main-content" className="app-main">
        {resolvedView === "board" && <BoardView />}
        {resolvedView === "analytics" && <AnalyticsDashboard tasks={tasks} />}
        {resolvedView === "team" && <UserManagementPanel />}
      </main>

      <Toasts toasts={toasts} onDismiss={dismissToast} />

      <footer className="app-footer">
        &copy; 2026 Flowboard. All Rights Reserved.
      </footer>
    </div>
  );
}

function Gate() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Login />;
  return (
    <DataProvider>
      <AuthedApp />
    </DataProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ThemeProvider>
  );
}
