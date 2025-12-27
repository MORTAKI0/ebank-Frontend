import http from "./http.js";

export function changePassword({ oldPassword, newPassword }) {
  return http.post("/api/auth/change-password", {
    oldPassword,
    newPassword,
  });
}
