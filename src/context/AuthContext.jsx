import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi
} from "../api/auth";

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

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const storedUser =
      tokenStore.getUser();

    const accessToken =
      tokenStore.getAccessToken();

    const refreshToken =
      tokenStore.getRefreshToken();

    if (
      storedUser &&
      accessToken &&
      refreshToken
    ) {
      setUser(storedUser);
    } else {
      tokenStore.clear();
      setUser(null);
    }

    setLoading(false);

    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener(
      "careerlife:logout",
      handleLogout
    );

    return () => {
      window.removeEventListener(
        "careerlife:logout",
        handleLogout
      );
    };
  }, []);

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
      name: data.name,
      email: data.email
    };

    tokenStore.setUser(
      currentUser
    );

    setUser(currentUser);

    return currentUser;
  };

  const register = async (
    name,
    email,
    password
  ) => {
    const data =
      await registerApi(
        name,
        email,
        password
      );

    applySession(data);

    return data;
  };

  const login = async (
    email,
    password
  ) => {
    const data =
      await loginApi(
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
        await logoutApi(
          refreshToken
        );
      }
    } finally {
      tokenStore.clear();
      setUser(null);

      window.dispatchEvent(
        new Event(
          "careerlife:logout"
        )
      );
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated:
        Boolean(
          tokenStore.getAccessToken() &&
          tokenStore.getRefreshToken()
        ),
      register,
      login,
      logout
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
