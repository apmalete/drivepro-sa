import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

import "./index.css";
import App from "./App";

// =====================================================
// AXIOS AUTHENTICATION
// =====================================================
//
// Automatically attach the logged-in user's JWT token
// to every request sent to the backend.
//
// This fixes 401 Unauthorized errors on:
// Students
// Instructors
// Vehicles
// Lessons
// Payments
// Dashboard
// Users
// etc.
// =====================================================

axios.interceptors.request.use(
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

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================
//
// If the server says the token is invalid or expired,
// clear the login information and return to login.
// =====================================================

axios.interceptors.response.use(
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

      // Don't redirect repeatedly if
      // we're already on the login page.

      if (
        window.location.pathname !== "/"
      ) {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

// =====================================================
// START APPLICATION
// =====================================================

createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);