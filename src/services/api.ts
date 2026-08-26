import axios from "axios";

// ==========================================
// DRIVEPRO-SA API
// ==========================================

const api = axios.create({
  baseURL: "https://drivepro-sa-production.up.railway.app",
});

// ==========================================
// ADD JWT TOKEN TO EVERY REQUEST
// ==========================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// HANDLE EXPIRED / INVALID TOKEN
// ==========================================

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {

    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "loggedIn"
      );

      localStorage.removeItem(
        "user"
      );

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;