import { Link } from "react-router-dom";

function Layout({ children }) {
  return (
    <div className="app-shell">
      <nav className="app-nav">
        <span className="app-brand">EBANK</span>
        <Link to="/login" className="app-link">
          Login
        </Link>
        <Link to="/dashboard" className="app-link">
          Dashboard
        </Link>
        {/* later we'll show menus based on roles (CLIENT / AGENT_GUICHET) */}
      </nav>

      <main className="app-main">{children}</main>
    </div>
  );
}

export default Layout;
