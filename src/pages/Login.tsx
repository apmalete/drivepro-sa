import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import logo from "../assets/drivepro-logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/login",
        {
          username,
          password,
        }
      );

      if (res.data.success) {

        // ========================================
        // SAVE LOGIN STATUS
        // ========================================

        localStorage.setItem(
          "loggedIn",
          "true"
        );

        // ========================================
        // SAVE JWT TOKEN
        // ========================================

        localStorage.setItem(
          "token",
          res.data.token
        );

        // ========================================
        // SAVE USER
        // ========================================

        localStorage.setItem(
          "user",
          JSON.stringify(res.data.user)
        );

        // ========================================
        // GO TO DASHBOARD
        // ========================================

        navigate("/dashboard");
      }

    } catch (err: any) {

      console.error(
        "LOGIN ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Login failed. Please check your username and password."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg,#0f172a,#1e3a8a)",
        padding: 20,
      }}
    >
      <form
        onSubmit={login}
        style={{
          width: 450,
          background: "#ffffff",
          borderRadius: 18,
          padding: 35,
          boxShadow:
            "0 15px 40px rgba(0,0,0,0.35)",
          textAlign: "center",
        }}
      >
        <img
          src={logo}
          alt="DrivePro-SA Logo"
          style={{
            width: 280,
            marginBottom: 20,
          }}
        />

        <h2
          style={{
            color: "#1e40af",
            marginBottom: 8,
          }}
        >
          Welcome Back
        </h2>

        <p
          style={{
            color: "#666",
            marginBottom: 30,
          }}
        >
          Sign in to continue
        </p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          style={{
            width: "100%",
            padding: 14,
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ccc",
            marginBottom: 15,
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: "100%",
            padding: 14,
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ccc",
            marginBottom: 20,
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 15,
            fontSize: 18,
            borderRadius: 8,
            border: "none",
            background: "#1565c0",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading
            ? "Logging in..."
            : "LOGIN"}
        </button>

        <div
          style={{
            marginTop: 25,
            fontSize: 13,
            color: "#666",
          }}
        >
          DrivePro-SA Driving School
          Management System
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "#999",
          }}
        >
          Version 1.0
        </div>
      </form>
    </div>
  );
}