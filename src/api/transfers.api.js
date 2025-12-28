import http from "./http.js";

export async function createTransfer(payload) {
  const { data } = await http.post("/api/transfers", payload);
  return data;
}
