import { useState } from "react";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Card from "../components/ui/Card.jsx";
import Alert from "../components/ui/Alert.jsx";
import { changePassword } from "../api/auth.api.js";

const DEFAULT_ERROR_MESSAGE = "Une erreur est survenue. Veuillez reessayer.";
const REQUIRED_FIELDS_MESSAGE = "Veuillez renseigner tous les champs.";
const MIN_PASSWORD_LENGTH = 8;
const LENGTH_ERROR_MESSAGE = "Le nouveau mot de passe doit contenir au moins 8 caracteres.";
const SUCCESS_MESSAGE = "Votre mot de passe a ete modifie avec succes.";
const SUCCESS_TEXT_STYLE = { color: "#166534" };

function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    if (!oldPassword || !newPassword) {
      setErrorMessage(REQUIRED_FIELDS_MESSAGE);
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(LENGTH_ERROR_MESSAGE);
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ oldPassword, newPassword });
      setSuccessMessage(SUCCESS_MESSAGE);
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      if (error?.response?.status !== 401) {
        setErrorMessage(apiMessage || DEFAULT_ERROR_MESSAGE);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-page">
      <Card className="login-card">
        <div className="login-header">
          <span className="login-kicker">EBANK</span>
          <h1>Changer mot de passe</h1>
          <p>Mettez a jour votre mot de passe pour securiser votre compte.</p>
        </div>

        {errorMessage ? <Alert>{errorMessage}</Alert> : null}
        {successMessage ? (
          <Alert variant="success">
            <span style={SUCCESS_TEXT_STYLE}>{successMessage}</span>
          </Alert>
        ) : null}

        <form className="login-form" onSubmit={handleSubmit}>
          <Input
            label="Ancien mot de passe"
            name="oldPassword"
            type="password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          <Input
            label="Nouveau mot de passe"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Mise a jour..." : "Mettre a jour"}
          </Button>
        </form>
      </Card>
    </section>
  );
}

export default ChangePasswordPage;
