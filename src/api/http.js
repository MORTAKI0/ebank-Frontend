import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const http = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

console.log("[HTTP] client loaded", baseURL);

http.interceptors.request.use((config) => {
  console.log("[HTTP]", config.method?.toUpperCase(), config.baseURL + config.url, config.data);
  return config;
});

export default http;
