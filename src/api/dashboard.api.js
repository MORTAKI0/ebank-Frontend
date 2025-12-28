import http from "./http.js";

export async function getMyAccounts() {
  const { data } = await http.get("/api/me/accounts");
  return data;
}

export async function getAccountDashboard(accountId) {
  const { data } = await http.get(`/api/accounts/${accountId}/dashboard`);
  return data;
}

export async function getAccountTransactions(accountId, page = 0, size = 10) {
  const { data } = await http.get(`/api/accounts/${accountId}/transactions`, {
    params: { page, size },
  });
  return data;
}
