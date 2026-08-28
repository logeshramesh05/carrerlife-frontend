import {
  createContext,
  useContext,
  useState
} from "react";

import * as authApi from "../api/auth";
import { tokenStore } from "../api/tokenStore";

const AuthContext =
  createContext(null);

export function AuthProvider({
  children
}) {
  const [user, setUser] =
    useState(() =>
      tokenStore.getUser()
    );

  const applySession = (data) => {
    if (
      !data?.accessToken ||
      !data?.refreshToken
    ) {
      throw new Error(
        "Authentication tokens were not returned by the server"
      );
    }

    tokenStore.setTokens(data);

    const currentUser = {
      email: data.email,
      name: data.name
    };

    tokenStore.setUser(
      currentUser
    );

    setUser(currentUser);
  };

  const login = async (
    email,
    password
  ) => {
    const data =
      await authApi.login(
        email,
        password
      );

    applySession(data);

    return data;
  };

  const register = async (
    name,
    email,
    password
  ) => {
    const data =
      await authApi.register(
        name,
        email,
        password
      );

    applySession(data);

    return data;
  };

  const logout = async () => {
    const refreshToken =
      tokenStore.getRefreshToken();

    try {
      if (refreshToken) {
        await authApi.logout(
          refreshToken
        );
      }
    } finally {
      tokenStore.clear();
      setUser(null);

      window.dispatchEvent(
        new Event("careerlife:logout")
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);
