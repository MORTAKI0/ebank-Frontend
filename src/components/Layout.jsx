import { Link } from "react-router-dom";

function Layout({ children }) {
  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#f5f5f5" }}>
      <nav
        style={{
          display: "flex",
          gap: "1rem",
          padding: "1rem 2rem",
          background: "#222",
          color: "#fff",
        }}
      >
        <span style={{ fontWeight: "bold" }}>EBANK</span>
        <Link to="/login" style={{ color: "#fff" }}>
          Login
        </Link>
        <Link to="/dashboard" style={{ color: "#fff" }}>
          Dashboard
        </Link>
        {/* later we’ll show menus based on roles (CLIENT / AGENT_GUICHET) */}
      </nav>

      <main style={{ padding: "2rem" }}>{children}</main>
    </div>
  );
}

export default Layout;
