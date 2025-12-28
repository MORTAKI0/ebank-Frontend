import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Alert from "../components/ui/Alert.jsx";
import useAuth from "../auth/useAuth.js";
import { getMyAccounts } from "../api/dashboard.api.js";
import { createTransfer } from "../api/transfers.api.js";

const DEFAULT_ERROR_MESSAGE = "Une erreur est survenue. Veuillez reessayer.";
const NO_ACCOUNTS_MESSAGE = "Aucun compte disponible.";
const INVALID_AMOUNT_MESSAGE = "Montant invalide. Utilisez 2 decimales maximum.";
const INVALID_RIB_MESSAGE = "RIB destinataire requis.";
const INVALID_ACCOUNT_MESSAGE = "Selectionnez un compte source.";

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return "-";
  }
  return amount.toFixed(2);
}

function buildAccountLabel(account) {
  const id = account?.id ?? "-";
  const rib = account?.rib || `Compte ${id}`;
  const balance = formatMoney(account?.amount);
  if (balance === "-") {
    return rib;
  }
  return `${rib} - solde ${balance}`;
}

function pickInitialAccountId(accounts, defaultAccountId) {
  if (!Array.isArray(accounts) || accounts.length === 0) {
    return "";
  }

  const normalizedDefaultId =
    defaultAccountId !== null && defaultAccountId !== undefined
      ? String(defaultAccountId)
      : "";
  const defaultAccount = accounts.find(
    (account) => String(account?.id) === normalizedDefaultId
  );
  const selectedAccount = defaultAccount || accounts[0];
  const selectedId = selectedAccount?.id;
  return selectedId !== null && selectedId !== undefined ? String(selectedId) : "";
}

function isValidAmount(value) {
  if (!value) {
    return false;
  }
  const normalized = value.trim();
  if (!normalized) {
    return false;
  }
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return false;
  }
  const amount = Number(normalized);
  if (!Number.isFinite(amount)) {
    return false;
  }
  return amount > 0;
}

function NewTransferPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [fromAccountId, setFromAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [toRib, setToRib] = useState("");
  const [motif, setMotif] = useState("");
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successResponse, setSuccessResponse] = useState(null);

  useEffect(() => {
    if (role !== "CLIENT") {
      return undefined;
    }

    let isActive = true;

    const loadAccounts = async () => {
      setIsLoadingAccounts(true);
      setErrorMessage("");

      try {
        const data = await getMyAccounts();
        if (!isActive) {
          return;
        }

        const accountList = Array.isArray(data?.accounts) ? data.accounts : [];
        setAccounts(accountList);

        if (accountList.length === 0) {
          setFromAccountId("");
          return;
        }

        const initialId = pickInitialAccountId(accountList, data?.defaultAccountId);
        setFromAccountId(initialId);
      } catch (error) {
        if (!isActive) {
          return;
        }
        setErrorMessage(error?.response?.data?.message || DEFAULT_ERROR_MESSAGE);
      } finally {
        if (isActive) {
          setIsLoadingAccounts(false);
        }
      }
    };

    loadAccounts();

    return () => {
      isActive = false;
    };
  }, [role]);

  const accountOptions = useMemo(
    () =>
      accounts
        .map((account) => {
          const id = account?.id;
          if (id === null || id === undefined) {
            return null;
          }
          return { id: String(id), label: buildAccountLabel(account) };
        })
        .filter(Boolean),
    [accounts]
  );

  const selectedAccount = useMemo(
    () => accounts.find((account) => String(account?.id) === fromAccountId) || null,
    [accounts, fromAccountId]
  );

  const singleAccountLabel = selectedAccount
    ? buildAccountLabel(selectedAccount)
    : accountOptions[0]?.label || "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setSuccessResponse(null);

    if (!fromAccountId) {
      setErrorMessage(INVALID_ACCOUNT_MESSAGE);
      return;
    }

    if (!toRib.trim()) {
      setErrorMessage(INVALID_RIB_MESSAGE);
      return;
    }

    if (!isValidAmount(amount)) {
      setErrorMessage(INVALID_AMOUNT_MESSAGE);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fromAccountId: Number(fromAccountId),
        amount: amount.trim(),
        toRib: toRib.trim(),
      };
      const trimmedMotif = motif.trim();
      if (trimmedMotif) {
        payload.motif = trimmedMotif;
      }

      const data = await createTransfer(payload);
      setSuccessResponse(data || null);
      setAmount("");
      setToRib("");
      setMotif("");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || DEFAULT_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="dashboard-page">
      <Card className="dashboard-card">
        <div>
          <h1>Nouveau virement</h1>
          <p>Envoyez un virement depuis votre compte.</p>
        </div>

        {errorMessage ? <Alert>{errorMessage}</Alert> : null}
        {isLoadingAccounts ? <p>Chargement des comptes...</p> : null}

        {!isLoadingAccounts && accountOptions.length === 0 ? (
          <p className="status-text">{NO_ACCOUNTS_MESSAGE}</p>
        ) : null}

        {successResponse ? (
          <div className="login-form">
            <div className="dashboard-status">
              <span className="status-pill status-pill--ok">Virement effectue</span>
              <span className="status-text">
                ID virement: {successResponse?.transferId ?? "-"}
              </span>
              <span className="status-text">
                Nouveau solde: {formatMoney(successResponse?.newBalance)}
              </span>
            </div>
            <Button type="button" onClick={() => navigate("/dashboard")} style={{ width: "auto" }}>
              Retour au dashboard
            </Button>
          </div>
        ) : null}

        {accountOptions.length > 0 ? (
          <form className="login-form" onSubmit={handleSubmit}>
            {accountOptions.length > 1 ? (
              <label className="ui-input">
                <span className="ui-input__label">Compte source</span>
                <select
                  className="ui-input__control"
                  value={fromAccountId}
                  onChange={(event) => setFromAccountId(event.target.value)}
                >
                  {accountOptions.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <Input label="Compte source" value={singleAccountLabel} readOnly disabled />
            )}

            <Input
              label="Montant"
              name="amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
            <Input
              label="RIB destinataire"
              name="toRib"
              type="text"
              value={toRib}
              onChange={(event) => setToRib(event.target.value)}
              required
            />
            <Input
              label="Motif (optionnel)"
              name="motif"
              type="text"
              value={motif}
              onChange={(event) => setMotif(event.target.value)}
            />

            <Button type="submit" disabled={isSubmitting || isLoadingAccounts || !fromAccountId}>
              {isSubmitting ? "Envoi en cours..." : "Valider virement"}
            </Button>
          </form>
        ) : null}
      </Card>
    </section>
  );
}

export default NewTransferPage;
