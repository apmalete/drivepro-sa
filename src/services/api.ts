import axios from "axios";

// =====================================================
// DRIVEPRO-SA API
// =====================================================

// =====================================================
// DETERMINE BACKEND URL
// =====================================================

const hostname =
  window.location.hostname;

const API_URL =
  hostname === "localhost" ||
  hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://drivepro-sa-production.up.railway.app";

console.log(
  "========================================"
);

console.log(
  "🚗 DRIVEPRO-SA API"
);

console.log(
  "Frontend hostname:",
  hostname
);

console.log(
  "Backend API:",
  API_URL
);

console.log(
  "========================================"
);

// =====================================================
// AXIOS INSTANCE
// =====================================================

const api = axios.create({
  baseURL: API_URL,

  headers: {
    "Content-Type":
      "application/json",
  },

  timeout: 15000,
});

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

api.interceptors.request.use(
  (config) => {

    console.log(
      "➡️ API REQUEST:"
    );

    console.log(
      "Method:",
      config.method
    );

    console.log(
      "URL:",
      `${config.baseURL}${config.url}`
    );

    console.log(
      "Data:",
      config.data
    );

    const token =
      localStorage.getItem(
        "token"
      );

    if (token) {

      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {

    console.error(
      "❌ API REQUEST ERROR:",
      error
    );

    return Promise.reject(
      error
    );
  }
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
  (response) => {

    console.log(
      "✅ API RESPONSE:"
    );

    console.log(
      "Status:",
      response.status
    );

    console.log(
      "URL:",
      response.config.url
    );

    console.log(
      "Data:",
      response.data
    );

    return response;
  },

  (error) => {

    console.error(
      "❌ API RESPONSE ERROR:"
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Status:",
      error.response?.status
    );

    console.error(
      "Response:",
      error.response?.data
    );

    console.error(
      "URL:",
      error.config?.url
    );

    // =============================================
    // UNAUTHORIZED
    // =============================================

    if (
      error.response?.status ===
      401
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

      window.location.href =
        "/";
    }

    return Promise.reject(
      error
    );
  }
);

export default api;