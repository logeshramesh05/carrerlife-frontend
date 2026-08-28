import axios from "axios";
import { tokenStore } from "./tokenStore";

const baseURL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080/api/v1"
).replace(/\/+$/, "");

const authClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: false
});

export const register = async (
  name,
  email,
  password
) => {
  const response = await authClient.post(
    "/auth/register",
    {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    }
  );

  const data = response.data;

  if (
    !data?.accessToken ||
    !data?.refreshToken
  ) {
    throw new Error(
      "Registration succeeded but authentication tokens were not returned"
    );
  }

  return data;
};

export const login = async (
  email,
  password
) => {
  const response = await authClient.post(
    "/auth/login",
    {
      email: email.trim().toLowerCase(),
      password
    }
  );

  return response.data;
};

export const refresh = async (
  refreshToken
) => {
  const response = await authClient.post(
    "/auth/refresh",
    {
      refreshToken
    }
  );

  return response.data;
};

export const logout = async (
  refreshToken
) => {
  const response = await authClient.post(
    "/auth/logout",
    {
      refreshToken
    }
  );

  return response.data;
};
