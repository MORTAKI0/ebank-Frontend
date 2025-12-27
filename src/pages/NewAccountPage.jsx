import { useState } from "react";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Card from "../components/ui/Card.jsx";
import Alert from "../components/ui/Alert.jsx";
import { createAccount } from "../api/accounts.api.js";

const DEFAULT_ERROR_MESSAGE = "Une erreur est survenue. Veuillez reessayer.";
const REQUIRED_FIELDS_MESSAGE = "Veuillez renseigner tous les champs.";
const INVALID_RIB_MESSAGE = "Le RIB doit contenir entre 10 et 34 caracteres alphanumeriques.";
const SUCCESS_TEXT_STYLE = { color: "#166534" };

function normalizeRib(value) {
  return value.replace(/\s+/g, "");
}

function isValidRib(value) {
  return value.length >= 10 && value.length <= 34 && /^[A-Za-z0-9]+$/.test(value);
}

function buildSuccessMessage({ rib, id }) {
  return `Compte cree: RIB ${rib}, ID ${id}.`;
}

function NewAccountPage() {
  const [identityRef, setIdentityRef] = useState("");
  const [rib, setRib] = useState("");
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

    const trimmedIdentityRef = identityRef.trim();
    const normalizedRib = normalizeRib(rib);

    if (!trimmedIdentityRef || !normalizedRib) {
      setErrorMessage(REQUIRED_FIELDS_MESSAGE);
      return;
    }

    if (!isValidRib(normalizedRib)) {
      setErrorMessage(INVALID_RIB_MESSAGE);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createAccount({
        rib: normalizedRib,
        identityRef: trimmedIdentityRef,
      });
      const { id, rib: createdRib } = response?.data ?? {};
      const ribValue = createdRib || normalizedRib;

      setSuccessMessage(buildSuccessMessage({ rib: ribValue, id }));
      setIdentityRef("");
      setRib("");
    } catch (error) {
      const status = error?.response?.status;
      const apiMessage = error?.response?.data?.message;

      if (status === 400 || status === 404 || status === 409) {
        setErrorMessage(apiMessage || DEFAULT_ERROR_MESSAGE);
      } else if (status !== 401) {
        setErrorMessage(DEFAULT_ERROR_MESSAGE);
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
          <h1>Nouveau compte bancaire</h1>
          <p>Associez un compte a un client existant.</p>
        </div>

        {errorMessage ? <Alert>{errorMessage}</Alert> : null}
        {successMessage ? (
          <Alert variant="success">
            <span style={SUCCESS_TEXT_STYLE}>{successMessage}</span>
          </Alert>
        ) : null}

        <form className="login-form" onSubmit={handleSubmit}>
          <Input
            label="Reference identite"
            name="identityRef"
            type="text"
            value={identityRef}
            onChange={(event) => setIdentityRef(event.target.value)}
            autoComplete="off"
            required
          />
          <Input
            label="RIB"
            name="rib"
            type="text"
            value={rib}
            onChange={(event) => setRib(event.target.value)}
            autoComplete="off"
            required
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creation..." : "Creer le compte"}
          </Button>
        </form>
      </Card>
    </section>
  );
}

export default NewAccountPage;
