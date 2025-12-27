import Card from "../components/ui/Card.jsx";

function DashboardPage() {
  const token = localStorage.getItem("ebank_token");
  const role = localStorage.getItem("ebank_role");
  const isLoggedIn = Boolean(token);

  return (
    <section className="dashboard-page">
      <Card className="dashboard-card">
        <h1>Dashboard</h1>
        <p>Bienvenue sur EBANK. Les donnees clients seront visibles ici bientot.</p>
        <div className="dashboard-status">
          <span className={`status-pill ${isLoggedIn ? "status-pill--ok" : "status-pill--muted"}`}>
            {isLoggedIn ? "Connecte" : "Hors ligne"}
          </span>
          <span className="status-text">Role: {role || "Inconnu"}</span>
        </div>
      </Card>
    </section>
  );
}

export default DashboardPage;
