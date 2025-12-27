import { useState } from "react";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Card from "../components/ui/Card.jsx";
import Alert from "../components/ui/Alert.jsx";
import { createCustomer } from "../api/customers.api.js";

const DEFAULT_ERROR_MESSAGE = "Une erreur est survenue. Veuillez reessayer.";
const REQUIRED_FIELDS_MESSAGE = "Veuillez renseigner tous les champs.";
const INVALID_EMAIL_MESSAGE = "Veuillez saisir une adresse email valide.";
const DEFAULT_SUCCESS_MESSAGE = "Client cr\u00e9\u00e9 avec succ\u00e8s. Identifiants envoy\u00e9s par email.";
const SUCCESS_TEXT_STYLE = { color: "#166534" };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildSuccessMessage = (username) =>
  `Client cr\u00e9\u00e9: login ${username}. Mot de passe envoy\u00e9 par email.`;

function NewCustomerPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [identityRef, setIdentityRef] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [postalAddress, setPostalAddress] = useState("");
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

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      identityRef: identityRef.trim(),
      birthDate,
      email: email.trim(),
      postalAddress: postalAddress.trim(),
    };

    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.identityRef ||
      !payload.birthDate ||
      !payload.email ||
      !payload.postalAddress
    ) {
      setErrorMessage(REQUIRED_FIELDS_MESSAGE);
      return;
    }

    if (payload.email && !EMAIL_REGEX.test(payload.email)) {
      setErrorMessage(INVALID_EMAIL_MESSAGE);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createCustomer(payload);
      const { username, login } = response?.data ?? {};
      const customerLogin = username || login;

      setSuccessMessage(
        customerLogin ? buildSuccessMessage(customerLogin) : DEFAULT_SUCCESS_MESSAGE
      );
      setFirstName("");
      setLastName("");
      setIdentityRef("");
      setBirthDate("");
      setEmail("");
      setPostalAddress("");
    } catch (error) {
      const status = error?.response?.status;
      const apiMessage = error?.response?.data?.message;

      if (status === 409 || status === 400) {
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
          <h1>Ajouter client</h1>
          <p>Renseignez les informations du client.</p>
        </div>

        {errorMessage ? <Alert>{errorMessage}</Alert> : null}
        {successMessage ? (
          <Alert variant="success">
            <span style={SUCCESS_TEXT_STYLE}>{successMessage}</span>
          </Alert>
        ) : null}

        <form className="login-form" onSubmit={handleSubmit}>
          <Input
            label="Prenom"
            name="firstName"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
            required
          />
          <Input
            label="Nom"
            name="lastName"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
            required
          />
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
            label="Date de naissance"
            name="birthDate"
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            autoComplete="bday"
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <Input
            label="Adresse postale"
            name="postalAddress"
            type="text"
            value={postalAddress}
            onChange={(event) => setPostalAddress(event.target.value)}
            autoComplete="street-address"
            required
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creation..." : "Creer le client"}
          </Button>
        </form>
      </Card>
    </section>
  );
}

export default NewCustomerPage;
