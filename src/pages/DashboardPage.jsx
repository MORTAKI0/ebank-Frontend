import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Alert from "../components/ui/Alert.jsx";
import Table from "../components/ui/Table.jsx";
import useAuth from "../auth/useAuth.js";
import {
  getAccountDashboard,
  getAccountTransactions,
  getMyAccounts,
} from "../api/dashboard.api.js";

const PAGE_SIZE = 10;
const DEFAULT_ERROR_MESSAGE = "Une erreur est survenue. Veuillez reessayer.";
const NO_ACCOUNTS_MESSAGE = "Aucun compte disponible.";
const SESSION_EXPIRED_MESSAGE = "Votre session a expiree. Veuillez vous reconnecter.";

const moneyFormatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const TRANSACTION_COLUMNS = [
  { key: "date", label: "Date" },
  { key: "label", label: "Label" },
  { key: "type", label: "Type" },
  { key: "amount", label: "Montant" },
];

function formatDate(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return "-";
  }
  return moneyFormatter.format(amount);
}

function resolveErrorMessage(error) {
  const status = error?.response?.status;
  if (status === 401) {
    return SESSION_EXPIRED_MESSAGE;
  }
  return DEFAULT_ERROR_MESSAGE;
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
    (account) => String(account.id) === normalizedDefaultId
  );
  const selectedAccount = defaultAccount || accounts[0];
  const selectedId = selectedAccount?.id;
  return selectedId !== null && selectedId !== undefined ? String(selectedId) : "";
}

function getStatusClass(status) {
  if (status === "OPEN") {
    return "status-pill status-pill--ok";
  }
  return "status-pill status-pill--muted";
}

function DashboardPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [dashboardAccount, setDashboardAccount] = useState(null);
  const [lastTransactions, setLastTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

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
          setSelectedAccountId("");
          setDashboardAccount(null);
          setLastTransactions([]);
          setTransactions([]);
          setTotalPages(1);
          return;
        }

        const initialId = pickInitialAccountId(accountList, data?.defaultAccountId);
        setSelectedAccountId(initialId);
        setPage(0);
      } catch (error) {
        if (!isActive) {
          return;
        }
        setErrorMessage(resolveErrorMessage(error));
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

  useEffect(() => {
    if (role !== "CLIENT" || !selectedAccountId) {
      return undefined;
    }

    let isActive = true;

    const loadDashboard = async () => {
      setIsLoadingDashboard(true);
      setErrorMessage("");

      try {
        const data = await getAccountDashboard(selectedAccountId);
        if (!isActive) {
          return;
        }

        setDashboardAccount(data?.account || null);
        setLastTransactions(Array.isArray(data?.lastTransactions) ? data.lastTransactions : []);
      } catch (error) {
        if (!isActive) {
          return;
        }
        setErrorMessage(resolveErrorMessage(error));
        setDashboardAccount(null);
        setLastTransactions([]);
      } finally {
        if (isActive) {
          setIsLoadingDashboard(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, [role, selectedAccountId]);

  useEffect(() => {
    if (role !== "CLIENT" || !selectedAccountId) {
      return undefined;
    }

    let isActive = true;

    const loadTransactions = async () => {
      setIsLoadingTransactions(true);
      setErrorMessage("");

      try {
        const data = await getAccountTransactions(selectedAccountId, page, PAGE_SIZE);
        if (!isActive) {
          return;
        }

        setTransactions(Array.isArray(data?.content) ? data.content : []);
        const nextTotalPages =
          typeof data?.totalPages === "number" ? Math.max(data.totalPages, 1) : 1;
        setTotalPages(nextTotalPages);
      } catch (error) {
        if (!isActive) {
          return;
        }
        setErrorMessage(resolveErrorMessage(error));
      } finally {
        if (isActive) {
          setIsLoadingTransactions(false);
        }
      }
    };

    loadTransactions();

    return () => {
      isActive = false;
    };
  }, [role, selectedAccountId, page]);

  const accountOptions = useMemo(
    () =>
      accounts
        .map((account) => {
          const id = account?.id;
          if (id === null || id === undefined) {
            return null;
          }
          const rib = account?.rib || `Compte ${id}`;
          const statusSuffix = account?.status ? ` - ${account.status}` : "";
          return { id: String(id), label: `${rib}${statusSuffix}` };
        })
        .filter(Boolean),
    [accounts]
  );

  const selectedAccount = useMemo(
    () => accounts.find((account) => String(account?.id) === selectedAccountId) || null,
    [accounts, selectedAccountId]
  );

  const summaryAccount = dashboardAccount || selectedAccount;
  const displayRib = summaryAccount?.rib || "-";
  const displayBalance = formatMoney(summaryAccount?.amount);
  const displayStatus = summaryAccount?.status || "-";
  const statusClassName = getStatusClass(summaryAccount?.status);

  const safeTotalPages = Math.max(totalPages || 1, 1);
  const canGoPrevious = page > 0;
  const canGoNext = page + 1 < safeTotalPages;

  const displayedTransactions =
    page === 0 && transactions.length === 0 && lastTransactions.length > 0
      ? lastTransactions
      : transactions;

  const tableRows = useMemo(() => {
    if (isLoadingTransactions && displayedTransactions.length === 0) {
      return [{ kind: "loading" }];
    }
    if (!isLoadingTransactions && displayedTransactions.length === 0) {
      return [{ kind: "empty" }];
    }
    return displayedTransactions;
  }, [isLoadingTransactions, displayedTransactions]);

  const operationsTitle = page === 0 ? "10 dernieres operations" : "Historique des operations";
  const operationsSubtitle =
    page === 0
      ? "Liste des dernieres transactions enregistrees."
      : "Toutes les operations de ce compte.";

  const handleAccountChange = (event) => {
    const nextId = event.target.value;
    setSelectedAccountId(nextId);
    setPage(0);
    setTransactions([]);
    setLastTransactions([]);
    setDashboardAccount(null);
    setTotalPages(1);
  };

  if (role !== "CLIENT") {
    return (
      <section className="dashboard-page">
        <Card className="dashboard-card">
          <h1>Tableau de bord</h1>
          <p>Dashboard agent: bientot.</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <Card className="dashboard-card">
        <div>
          <h1>Tableau de bord</h1>
          <p>Consultez vos comptes et vos operations en un coup d'oeil.</p>
        </div>

        {errorMessage ? <Alert>{errorMessage}</Alert> : null}
        {isLoadingAccounts ? <p>Chargement des comptes...</p> : null}

        {!isLoadingAccounts && accountOptions.length === 0 && !errorMessage ? (
          <p className="status-text">{NO_ACCOUNTS_MESSAGE}</p>
        ) : null}

        {accountOptions.length > 0 ? (
          <div className="login-form">
            {accountOptions.length > 1 ? (
              <label className="ui-input">
                <span className="ui-input__label">Compte</span>
                <select
                  className="ui-input__control"
                  value={selectedAccountId}
                  onChange={handleAccountChange}
                >
                  {accountOptions.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="status-text">Compte: {accountOptions[0]?.label}</div>
            )}

            <div className="dashboard-status">
              <div>
                <div className="status-text">RIB</div>
                <div>{displayRib}</div>
              </div>
              <div>
                <div className="status-text">Solde</div>
                <div>{displayBalance}</div>
              </div>
              <div>
                <div className="status-text">Statut</div>
                {displayStatus === "-" ? (
                  <span className="status-text">-</span>
                ) : (
                  <span className={statusClassName}>{displayStatus}</span>
                )}
              </div>
            </div>

            {isLoadingDashboard ? <p>Chargement du compte...</p> : null}

            <Button
              type="button"
              onClick={() => navigate("/transfers/new")}
              disabled={!selectedAccountId}
            >
              Nouveau virement
            </Button>
          </div>
        ) : null}

        {accountOptions.length > 0 ? (
          <div className="login-form">
            <div>
              <h2>{operationsTitle}</h2>
              <p className="status-text">{operationsSubtitle}</p>
            </div>

            <Table
              columns={TRANSACTION_COLUMNS}
              rows={tableRows}
              renderRow={(row, index, cellStyle) => {
                if (row?.kind === "loading") {
                  return (
                    <tr key="loading">
                      <td
                        colSpan={TRANSACTION_COLUMNS.length}
                        style={{ ...cellStyle, textAlign: "center", color: "var(--text-muted)" }}
                      >
                        Chargement des operations...
                      </td>
                    </tr>
                  );
                }
                if (row?.kind === "empty") {
                  return (
                    <tr key="empty">
                      <td
                        colSpan={TRANSACTION_COLUMNS.length}
                        style={{ ...cellStyle, textAlign: "center", color: "var(--text-muted)" }}
                      >
                        Aucune operation.
                      </td>
                    </tr>
                  );
                }

                const key = row?.id ?? row?.reference ?? `${row?.createdAt ?? "row"}-${index}`;

                return (
                  <tr key={key}>
                    <td style={cellStyle}>{formatDate(row?.createdAt)}</td>
                    <td style={cellStyle}>{row?.label || "-"}</td>
                    <td style={cellStyle}>{row?.transactionType || "-"}</td>
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatMoney(row?.amount)}
                    </td>
                  </tr>
                );
              }}
            />

            <div className="dashboard-status" style={{ justifyContent: "space-between" }}>
              <Button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={!canGoPrevious || isLoadingTransactions}
                style={{ width: "auto" }}
              >
                Precedent
              </Button>
              <span className="status-text">
                Page {page + 1} / {safeTotalPages}
              </span>
              <Button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, safeTotalPages - 1))}
                disabled={!canGoNext || isLoadingTransactions}
                style={{ width: "auto" }}
              >
                Suivant
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </section>
  );
}

export default DashboardPage;

