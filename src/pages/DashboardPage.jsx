import Card from "../components/ui/Card.jsx";
import useAuth from "../auth/useAuth.js";

function DashboardPage() {
  const { role, isAuthenticated } = useAuth();

  return (
    <section className="dashboard-page">
      <Card className="dashboard-card">
        <h1>Dashboard</h1>
        <p>Bienvenue sur EBANK. Les donnees clients seront visibles ici bientot.</p>
        <div className="dashboard-status">
          <span className={`status-pill ${isAuthenticated ? "status-pill--ok" : "status-pill--muted"}`}>
            {isAuthenticated ? "Connecte" : "Hors ligne"}
          </span>
          <span className="status-text">Role: {role || "Inconnu"}</span>
        </div>
      </Card>
    </section>
  );
}

export default DashboardPage;
