import { Navigate } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import useAuth from "./useAuth.js";

const FORBIDDEN_MESSAGE =
  "Vous n\u2019avez pas le droit d\u2019acc\u00e9der \u00e0 cette fonctionnalit\u00e9. Veuillez contacter votre administrateur";

function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <section className="dashboard-page">
        <Card className="dashboard-card">
          <h1>Acces refuse</h1>
          <p>{FORBIDDEN_MESSAGE}</p>
        </Card>
      </section>
    );
  }

  return children;
}

export default ProtectedRoute;
