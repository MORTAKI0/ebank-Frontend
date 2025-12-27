import http from "./http.js";

export function createAccount({ rib, identityRef }) {
  return http.post("/api/accounts", { rib, identityRef });
}
