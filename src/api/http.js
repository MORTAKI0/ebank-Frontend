import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const http = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let authHandlers = {
  getToken: null,
  onUnauthorized: null,
};

export function setAuthHandlers(handlers) {
  authHandlers = {
    ...authHandlers,
    ...handlers,
  };
}

console.log("[HTTP] client loaded", baseURL);

http.interceptors.request.use((config) => {
  const token = authHandlers.getToken?.();
  if (token) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  console.log("[HTTP]", config.method?.toUpperCase(), config.baseURL + config.url, config.data);
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      authHandlers.onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export default http;
