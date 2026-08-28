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

    if (storedUser && accessToken) {
      setUser(storedUser);
    } else {
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
    tokenStore.setSession(data);

    const currentUser = {
      name: data.name,
      email: data.email
    };

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
          tokenStore.getAccessToken()
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
