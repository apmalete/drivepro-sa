import Settings from "./pages/Settings";
import type { ReactNode } from "react";

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ==========================================
// PAGES
// ==========================================

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Lessons from "./pages/LessonBookings";
import Instructors from "./pages/Instructors";
import Vehicles from "./pages/Vehicles";
import Users from "./pages/Users";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Schools from "./pages/Schools";

// ==========================================
// USER ROLE TYPE
// ==========================================

type UserRole =
  | "Administrator"
  | "Admin"
  | "System Administrator"
  | "Receptionist"
  | "Instructor";

// ==========================================
// GET LOGGED-IN USER
// ==========================================

const getCurrentUser = () => {

  const storedUser =
    localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {

    return JSON.parse(
      storedUser
    );

  } catch (error) {

    console.error(
      "ERROR READING USER:",
      error
    );

    return null;
  }
};

// ==========================================
// NORMALIZE ROLE
// ==========================================

const getUserRole = (
  role?: string
): string => {

  return String(
    role || ""
  )
    .trim()
    .toLowerCase();

};

// ==========================================
// PROTECTED ROUTE
// ==========================================

function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {

  const loggedIn =
    localStorage.getItem(
      "loggedIn"
    );

  const user =
    getCurrentUser();

  if (
    loggedIn !== "true" ||
    !user
  ) {

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }

  return <>{children}</>;
}

// ==========================================
// ROLE PROTECTED ROUTE
// ==========================================

function RoleRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
}) {

  const loggedIn =
    localStorage.getItem(
      "loggedIn"
    );

  const user =
    getCurrentUser();

  // ========================================
  // NOT LOGGED IN
  // ========================================

  if (
    loggedIn !== "true" ||
    !user
  ) {

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }

  // ========================================
  // GET CURRENT ROLE
  // ========================================

  const currentRole =
    getUserRole(
      user.role
    );

  // ========================================
  // CHECK PERMISSION
  // ========================================

  const hasPermission =
    allowedRoles.some(
      (allowedRole) =>
        getUserRole(
          allowedRole
        ) === currentRole
    );

  // ========================================
  // ACCESS DENIED
  // ========================================

  if (!hasPermission) {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );

  }

  return <>{children}</>;
}

// ==========================================
// APP
// ==========================================

export default function App() {

  return (

    <Routes>

      {/* =====================================
          LOGIN
      ====================================== */}

      <Route
        path="/"
        element={
          <Login />
        }
      />


      {/* =====================================
          DASHBOARD
          ALL LOGGED-IN USERS
      ====================================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />


      {/* =====================================
          STUDENTS
          SYSTEM ADMIN
          ADMIN
          RECEPTIONIST
          INSTRUCTOR
      ====================================== */}

      <Route
        path="/students"
        element={
          <RoleRoute
            allowedRoles={[
              "System Administrator",
              "Administrator",
              "Admin",
              "Receptionist",
              "Instructor",
            ]}
          >
            <Students />
          </RoleRoute>
        }
      />


      {/* =====================================
          LESSONS
          SYSTEM ADMIN
          ADMIN
          RECEPTIONIST
          INSTRUCTOR
      ====================================== */}

      <Route
        path="/lessons"
        element={
          <RoleRoute
            allowedRoles={[
              "System Administrator",
              "Administrator",
              "Admin",
              "Receptionist",
              "Instructor",
            ]}
          >
            <Lessons />
          </RoleRoute>
        }
      />


      {/* =====================================
          INSTRUCTORS
          SYSTEM ADMIN
          ADMIN
          RECEPTIONIST
      ====================================== */}

      <Route
        path="/instructors"
        element={
          <RoleRoute
            allowedRoles={[
              "System Administrator",
              "Administrator",
              "Admin",
              "Receptionist",
            ]}
          >
            <Instructors />
          </RoleRoute>
        }
      />


      {/* =====================================
          VEHICLES
          SYSTEM ADMIN
          ADMIN
          RECEPTIONIST
          INSTRUCTOR
      ====================================== */}

      <Route
        path="/vehicles"
        element={
          <RoleRoute
            allowedRoles={[
              "System Administrator",
              "Administrator",
              "Admin",
              "Receptionist",
              "Instructor",
            ]}
          >
            <Vehicles />
          </RoleRoute>
        }
      />


      {/* =====================================
          USERS
          SYSTEM ADMIN
          SCHOOL ADMINISTRATOR
      ====================================== */}

      <Route
        path="/users"
        element={
          <RoleRoute
            allowedRoles={[
              "System Administrator",
              "Administrator",
              "Admin",
            ]}
          >
            <Users />
          </RoleRoute>
        }
      />


      {/* =====================================
          PAYMENTS
          SYSTEM ADMIN
          ADMIN
          RECEPTIONIST
      ====================================== */}

      <Route
        path="/payments"
        element={
          <RoleRoute
            allowedRoles={[
              "System Administrator",
              "Administrator",
              "Admin",
              "Receptionist",
            ]}
          >
            <Payments />
          </RoleRoute>
        }
      />


      {/* =====================================
          REPORTS
          SYSTEM ADMIN
          ADMIN
          RECEPTIONIST
      ====================================== */}

      <Route
        path="/reports"
        element={
          <RoleRoute
            allowedRoles={[
              "System Administrator",
              "Administrator",
              "Admin",
              "Receptionist",
            ]}
          >
            <Reports />
          </RoleRoute>
        }
      />


      {/* =====================================
          SCHOOLS
          SYSTEM ADMINISTRATOR ONLY
      ====================================== */}

      <Route
        path="/schools"
        element={
          <RoleRoute
            allowedRoles={[
              "System Administrator",
            ]}
          >
            <Schools />
          </RoleRoute>
        }
      />


      {/* =====================================
          SETTINGS
          SYSTEM ADMIN
          SCHOOL ADMINISTRATOR
      ====================================== */}

      <Route
        path="/settings"
        element={
          <RoleRoute
            allowedRoles={[
              "System Administrator",
              "Administrator",
              "Admin",
            ]}
          >
            <Settings />
          </RoleRoute>
        }
      />


      {/* =====================================
          CATCH ALL
      ====================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>

  );
}