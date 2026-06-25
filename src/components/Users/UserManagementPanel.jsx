import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { ROLES, roleColor } from "../../utils/permissions";

export default function UserManagementPanel() {
  const { users, currentUser, changeUserRole, removeUser } = useAuth();
  const { onlineUsers } = useData();
  const onlineIds = new Set(onlineUsers.map((u) => u.id));

  return (
    <div className="team-panel">
      <h1 className="view-title">Team</h1>
      <p className="view-subtitle">
        Owners control who can edit the board and who can only view it.
      </p>

      <div className="team-table">
        <div className="team-table__row team-table__row--head">
          <span>Member</span>
          <span>Status</span>
          <span>Role</span>
          <span>Actions</span>
        </div>
        {users.map((u) => (
          <div key={u.id} className="team-table__row">
            <div className="team-table__user">
              <Avatar name={u.name} color={u.color} size={32} />
              <div>
                <div className="team-table__name">
                  {u.name}
                  {u.id === currentUser.id && " (you)"}
                </div>
                <div className="team-table__username">@{u.username}</div>
              </div>
            </div>
            <span
              className={`status-dot-row ${onlineIds.has(u.id) ? "is-online" : ""}`}
            >
              <span className="status-dot" aria-hidden="true" />{" "}
              {onlineIds.has(u.id) ? "Online" : "Offline"}
            </span>
            <Badge tone="role" style={{ "--role-color": roleColor(u.role) }}>
              {u.role}
            </Badge>
            <div className="team-table__actions">
              <select
                value={u.role}
                disabled={u.id === currentUser.id}
                onChange={(e) => changeUserRole(u.id, e.target.value)}
                aria-label={`Change role for ${u.name}`}
              >
                {Object.values(ROLES).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn--ghost btn--small"
                disabled={u.id === currentUser.id}
                onClick={() => {
                  if (window.confirm(`Remove ${u.name} from the workspace?`))
                    removeUser(u.id);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
