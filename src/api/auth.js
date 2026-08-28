import client from "./client";

export const register = (
  name,
  email,
  password
) =>
  client
    .post("/auth/register", {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    })
    .then((response) => response.data);

export const login = (
  email,
  password
) =>
  client
    .post("/auth/login", {
      email: email.trim().toLowerCase(),
      password
    })
    .then((response) => response.data);

export const refresh = (
  refreshToken
) =>
  client
    .post("/auth/refresh", {
      refreshToken
    })
    .then((response) => response.data);

export const logout = (
  refreshToken
) =>
  client
    .post("/auth/logout", {
      refreshToken
    })
    .then((response) => response.data);
