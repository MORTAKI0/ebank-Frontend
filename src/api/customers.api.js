import http from "./http.js";

export function createCustomer(payload) {
  return http.post("/api/customers", payload);
}
