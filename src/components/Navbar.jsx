import Avatar from "./common/Avatar";
import Badge from "./common/Badge";
import ThemeSwitcher from "./ThemeSwitcher";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { roleColor, can } from "../utils/permissions";
import { BOT_PERSONAS } from "../utils/seedData";

export default function Navbar({ view, setView }) {
  const { currentUser, logout } = useAuth();
  const { onlineUsers, stopAllRunningTimersForUser } = useData();

  const handleLogout = () => {
    stopAllRunningTimersForUser(currentUser.id);
    logout();
  };

  const others = onlineUsers.filter((u) => u.id !== currentUser.id);

  return (
    <header className="navbar">
      <div className="navbar__left">
        <div className="brand-mark" aria-hidden="true">
          FB
        </div>
        <span className="brand-name">Flowboard</span>
      </div>

      <nav className="navbar__tabs" aria-label="Primary">
        <button
          className={`navbar__tab ${view === "board" ? "is-active" : ""}`}
          onClick={() => setView("board")}
          aria-current={view === "board"}
        >
          Board
        </button>
        <button
          className={`navbar__tab ${view === "analytics" ? "is-active" : ""}`}
          onClick={() => setView("analytics")}
          aria-current={view === "analytics"}
        >
          Analytics
        </button>
        {can(currentUser.role, "manageUsers") && (
          <button
            className={`navbar__tab ${view === "team" ? "is-active" : ""}`}
            onClick={() => setView("team")}
            aria-current={view === "team"}
          >
            Team
          </button>
        )}
      </nav>

      <div className="navbar__right">
        <div
          className="presence-stack"
          aria-label={`${others.length} other teammate(s) online`}
        >
          {others.slice(0, 4).map((u) => (
            <Avatar
              key={u.id}
              name={u.name}
              color={u.color}
              size={26}
              ring="var(--success)"
              title={`${u.name} · online`}
            />
          ))}
          {BOT_PERSONAS.map((b) => (
            <Avatar
              key={b.id}
              name={b.name}
              color={b.color}
              size={26}
              ring="var(--warning)"
              title={`${b.name} · simulated collaborator`}
            />
          ))}
        </div>

        <ThemeSwitcher />

        <div className="navbar__user">
          <Avatar name={currentUser.name} color={currentUser.color} size={30} />
          <div className="navbar__user-meta">
            <span className="navbar__user-name">{currentUser.name}</span>
            <Badge
              tone="role"
              className="role-badge"
              style={{ "--role-color": roleColor(currentUser.role) }}
            >
              {currentUser.role}
            </Badge>
          </div>
        </div>
        <button type="button" className="btn btn--ghost" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
