const ACCESS_TOKEN_KEY =
  "careerlife_access_token";

const REFRESH_TOKEN_KEY =
  "careerlife_refresh_token";

const USER_KEY =
  "careerlife_user";

export const tokenStore = {
  getAccessToken() {
    return localStorage.getItem(
      ACCESS_TOKEN_KEY
    );
  },

  getRefreshToken() {
    return localStorage.getItem(
      REFRESH_TOKEN_KEY
    );
  },

  getUser() {
    const value =
      localStorage.getItem(USER_KEY);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  },

  setTokens(data) {
    if (data?.accessToken) {
      localStorage.setItem(
        ACCESS_TOKEN_KEY,
        data.accessToken
      );
    }

    if (data?.refreshToken) {
      localStorage.setItem(
        REFRESH_TOKEN_KEY,
        data.refreshToken
      );
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
      );
    }
  },

  setSession(data) {
    this.setTokens(data);

    if (data?.name || data?.email) {
      this.setUser({
        name: data.name,
        email: data.email
      });
    }
  },

  clear() {
    localStorage.removeItem(
      ACCESS_TOKEN_KEY
    );

    localStorage.removeItem(
      REFRESH_TOKEN_KEY
    );

    localStorage.removeItem(
      USER_KEY
    );
  }
};
