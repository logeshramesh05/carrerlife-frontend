import axios from "axios";
import { tokenStore } from "./tokenStore";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const client = axios.create({
  baseURL,
  timeout: 30000,
});

const refreshClient = axios.create({
  baseURL,
  timeout: 15000,
});

let refreshPromise = null;

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) throw new Error("Refresh token unavailable");

    refreshPromise = refreshClient
      .post("/auth/refresh", { refreshToken })
      .then(({ data }) => {
        tokenStore.setTokens(data);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const clearSession = () => {
  tokenStore.clear();
  window.dispatchEvent(new Event("careerlife:logout"));
};

client.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();
  const isAuthRequest = config.url?.startsWith("/auth/");

  if (token && !isAuthRequest) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isAuthRequest = original?.url?.startsWith("/auth/");

    if (!isUnauthorized || !original || original._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${accessToken}`;
      return client(original);
    } catch (refreshError) {
      clearSession();

      if (!["/login", "/register", "/docs", "/"].includes(window.location.pathname)) {
        window.location.assign("/login");
      }

      return Promise.reject(refreshError);
    }
  }
);

export default client;
