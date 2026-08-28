import axios from "axios";
import { clearSession, getAccessToken, getRefreshToken, saveSession } from "../auth/auth";

const baseURL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080/api/v1"
).replace(/\/$/, "");

const client = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

let refreshPromise = null;

client.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const accessToken = await refreshPromise;

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return client(originalRequest);
    } catch (refreshError) {
      clearSession();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  }
);

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("Refresh token is unavailable");
  }

  const response = await axios.post(`${baseURL}/auth/refresh`, {
    refreshToken
  });

  const data = response.data;

  saveSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: {
      name: data.name,
      email: data.email
    }
  });

  return data.accessToken;
}

export default client;
