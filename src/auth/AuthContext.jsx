import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthHandlers } from "../api/http.js";

const STORAGE_KEYS = {
  token: "ebank_token",
  role: "ebank_role",
};

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token) || "");
  const [role, setRole] = useState(() => localStorage.getItem(STORAGE_KEYS.role) || "");
  const tokenRef = useRef(token);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const login = useCallback(({ token: nextToken, role: nextRole }) => {
    localStorage.setItem(STORAGE_KEYS.token, nextToken);
    localStorage.setItem(STORAGE_KEYS.role, nextRole);
    setToken(nextToken);
    setRole(nextRole);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.role);
    setToken("");
    setRole("");
  }, []);

  const handleUnauthorized = useCallback(() => {
    logout();
    navigate("/login", {
      replace: true,
      state: { message: "Session invalide, veuillez s\u2019authentifier" },
    });
  }, [logout, navigate]);

  useEffect(() => {
    setAuthHandlers({
      getToken: () => tokenRef.current,
      onUnauthorized: handleUnauthorized,
    });
  }, [handleUnauthorized]);

  const value = useMemo(
    () => ({
      token,
      role,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, role, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
