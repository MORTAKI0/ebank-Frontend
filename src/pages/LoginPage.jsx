import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import http from "../api/http.js";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Card from "../components/ui/Card.jsx";
import Alert from "../components/ui/Alert.jsx";
import useAuth from "../auth/useAuth.js";

const DEFAULT_ERROR_MESSAGE = "Une erreur est survenue. Veuillez reessayer.";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionMessage, setSessionMessage] = useState(location.state?.message || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSessionMessage(location.state.message);
    }
  }, [location.state?.message]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSessionMessage("");

    try {
      console.log("[LOGIN] submitting", { username: username.trim() });
      const response = await http.post("/api/auth/login", {
        username: username.trim(),
        password,
      });

      const { token, role } = response.data ?? {};

      if (!token || !role) {
        throw new Error("Invalid login response");
      }

      console.log("[LOGIN] success", { role });
      login({ token, role });
      navigate("/dashboard");
    } catch (error) {
      console.log("[LOGIN] error", error?.response?.data || error?.message);
      const apiMessage = error?.response?.data?.message;
      if (error?.response?.status !== 401) {
        setErrorMessage(apiMessage || DEFAULT_ERROR_MESSAGE);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayMessage = sessionMessage || errorMessage;

  return (
    <section className="login-page">
      <Card className="login-card">
        <div className="login-header">
          <span className="login-kicker">EBANK</span>
          <h1>Connexion</h1>
          <p>Accedez a votre espace securise en quelques secondes.</p>
        </div>

        {displayMessage ? <Alert>{displayMessage}</Alert> : null}

        <form className="login-form" onSubmit={handleSubmit}>
          <Input
            label="Nom d'utilisateur"
            name="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
          <Input
            label="Mot de passe"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      </Card>
    </section>
  );
}

export default LoginPage;
