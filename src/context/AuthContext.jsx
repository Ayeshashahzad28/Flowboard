import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { KEYS, readJSON, writeJSON } from "../utils/storage";
import { seedUsers, AVATAR_PALETTE } from "../utils/seedData";
import { makeId } from "../utils/id";
import { ROLES } from "../utils/permissions";

const AuthContext = createContext(null);

function ensureUsersSeeded() {
  const existing = readJSON(KEYS.USERS, null);
  if (existing && Array.isArray(existing) && existing.length > 0)
    return existing;
  const seeded = seedUsers();
  writeJSON(KEYS.USERS, seeded);
  return seeded;
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => ensureUsersSeeded());
  const [currentUserId, setCurrentUserId] = useState(null);
  const [authError, setAuthError] = useState("");

  // Keep in sync if another tab changes the user list or session.
  useEffect(() => {
    const handler = (e) => {
      if (e.key === KEYS.USERS) setUsers(readJSON(KEYS.USERS, []));
      if (e.key === KEYS.SESSION)
        setCurrentUserId(readJSON(KEYS.SESSION, null));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const persistUsers = useCallback((next) => {
    setUsers(next);
    writeJSON(KEYS.USERS, next);
  }, []);

  const login = useCallback(
    (username, password) => {
      setAuthError("");
      const found = users.find(
        (u) =>
          u.username.toLowerCase() === username.trim().toLowerCase() &&
          u.password === password,
      );
      if (!found) {
        setAuthError("Incorrect username or password.");
        return false;
      }
      setCurrentUserId(found.id);
      writeJSON(KEYS.SESSION, found.id);
      return true;
    },
    [users],
  );

  const logout = useCallback(() => {
    setCurrentUserId(null);
    writeJSON(KEYS.SESSION, null);
  }, []);

  const register = useCallback(
    ({ name, username, password }) => {
      setAuthError("");
      const clean = username.trim().toLowerCase();
      if (!name.trim() || !clean || !password) {
        setAuthError("Name, username and password are all required.");
        return false;
      }
      if (users.some((u) => u.username.toLowerCase() === clean)) {
        setAuthError("That username is already taken.");
        return false;
      }
      const color = AVATAR_PALETTE[users.length % AVATAR_PALETTE.length];
      const newUser = {
        id: makeId("user"),
        username: clean,
        password,
        name: name.trim(),
        role: ROLES.VIEWER,
        color,
      };
      const next = [...users, newUser];
      persistUsers(next);
      setCurrentUserId(newUser.id);
      writeJSON(KEYS.SESSION, newUser.id);
      return true;
    },
    [users, persistUsers],
  );

  const changeUserRole = useCallback(
    (userId, role) => {
      const next = users.map((u) => (u.id === userId ? { ...u, role } : u));
      persistUsers(next);
    },
    [users, persistUsers],
  );

  const removeUser = useCallback(
    (userId) => {
      const next = users.filter((u) => u.id !== userId);
      persistUsers(next);
    },
    [users, persistUsers],
  );

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || null,
    [users, currentUserId],
  );

  const value = useMemo(
    () => ({
      users,
      currentUser,
      authError,
      login,
      logout,
      register,
      changeUserRole,
      removeUser,
      setAuthError,
    }),
    [
      users,
      currentUser,
      authError,
      login,
      logout,
      register,
      changeUserRole,
      removeUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
