import axios from "axios";
import { tokenStore } from "./tokenStore";

const baseURL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080/api/v1"
).replace(/\/+$/, "");

const client = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: false
});

const refreshClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: false
});

let refreshPromise = null;

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    const refreshToken =
      tokenStore.getRefreshToken();

    if (!refreshToken) {
      throw new Error(
        "Refresh token unavailable"
      );
    }

    refreshPromise = refreshClient
      .post("/auth/refresh", {
        refreshToken
      })
      .then(({ data }) => {
        if (
          !data?.accessToken ||
          !data?.refreshToken
        ) {
          throw new Error(
            "Invalid refresh response"
          );
        }

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

  window.dispatchEvent(
    new Event("careerlife:logout")
  );
};

client.interceptors.request.use(
  (config) => {
    const accessToken =
      tokenStore.getAccessToken();

    config.headers =
      config.headers || {};

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  }
);

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original =
      error.config;

    if (
      !original ||
      error.response?.status !== 401 ||
      original._retry
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const accessToken =
        await refreshAccessToken();

      original.headers =
        original.headers || {};

      original.headers.Authorization =
        `Bearer ${accessToken}`;

      return client(original);
    } catch (refreshError) {
      clearSession();

      const publicRoutes = [
        "/",
        "/login",
        "/register",
        "/docs"
      ];

      if (
        !publicRoutes.includes(
          window.location.pathname
        )
      ) {
        window.location.assign(
          "/login"
        );
      }

      return Promise.reject(
        refreshError
      );
    }
  }
);

export default client;
