import { Link, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth.js";

function Layout({ children }) {
  const navigate = useNavigate();
  const { isAuthenticated, role, logout } = useAuth();
  const roleLabel = role || "INCONNU";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <nav className="app-nav">
        <span className="app-brand">EBANK</span>
        {!isAuthenticated ? (
          <Link to="/login" className="app-link">
            Login
          </Link>
        ) : (
          <>
            <Link to="/dashboard" className="app-link">
              Dashboard
            </Link>
            <Link to="/change-password" className="app-link">
              Changer mot de passe
            </Link>
            {role === "CLIENT" ? (
              <Link to="/transfers/new" className="app-link">
                Nouveau virement
              </Link>
            ) : null}
            {role === "AGENT_GUICHET" ? (
              <>
                <Link to="/customers/new" className="app-link">
                  Ajouter client
                </Link>
                <Link to="/accounts/new" className="app-link">
                  Nouveau compte
                </Link>
              </>
            ) : null}
            <span className="status-pill status-pill--ok">Connecte ({roleLabel})</span>
            <Link to="/login" className="app-link" onClick={handleLogout}>
              Logout
            </Link>
          </>
        )}
      </nav>

      <main className="app-main">{children}</main>
    </div>
  );
}

export default Layout;
