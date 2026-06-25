import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const DEMO_ACCOUNTS = [
  {
    username: "owner",
    password: "owner123",
    label: "Owner",
    sub: "Full control",
  },
  {
    username: "editor",
    password: "editor123",
    label: "Editor",
    sub: "Can edit & move tasks",
  },
  {
    username: "viewer",
    password: "viewer123",
    label: "Viewer",
    sub: "Read-only access",
  },
];

export default function Login() {
  const { login, register, authError, setAuthError } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", username: "", password: "" });

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) {
      alert("Please fill the required fields (username and password).");
      return;
    }
    if (mode === "login") {
      login(form.username, form.password);
    } else {
      register(form);
    }
  };

  const fillDemo = (acc) => {
    setAuthError("");
    setForm({ name: "", username: acc.username, password: acc.password });
  };

  const isFormValid =
    form.username.trim() !== "" &&
    form.password.trim() !== "" &&
    (mode === "login" || form.name.trim() !== "");

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-mark" aria-hidden="true">
            FB
          </div>
          <div>
            <h1 className="auth-title">Flowboard</h1>
            <p className="auth-subtitle">
              Real-time collaborative project boards
            </p>
          </div>
        </div>

        <div
          className="auth-tabs"
          role="tablist"
          aria-label="Authentication mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={`auth-tab ${mode === "login" ? "is-active" : ""}`}
            onClick={() => {
              setMode("login");
              setAuthError("");
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            className={`auth-tab ${mode === "register" ? "is-active" : ""}`}
            onClick={() => {
              setMode("register");
              setAuthError("");
            }}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {mode === "register" && (
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange("name")}
                required
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={handleChange("username")}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange("password")}
              required
            />
          </div>

          {authError && (
            <p className="auth-error" role="alert">
              {authError}
            </p>
          )}

          <button type="submit" className="btn btn--primary btn--block">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
          {mode === "register" && (
            <p className="auth-hint">
              New accounts start as <strong>Viewer</strong>. Ask an Owner to
              upgrade your role from the Team panel.
            </p>
          )}
        </form>

        <div className="auth-demo">
          <p className="auth-demo__label">Or try a demo role</p>
          <div className="auth-demo__grid">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.username}
                type="button"
                className="demo-card"
                onClick={() => fillDemo(acc)}
              >
                <span className="demo-card__role">{acc.label}</span>
                <span className="demo-card__sub">{acc.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className="auth-footer">
        &copy; 2026 Flowboard. All Rights Reserved.
      </footer>
    </div>
  );
}
