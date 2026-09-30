import Settings from "./pages/Settings";
import type { ReactNode } from "react";

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ==========================================
// COMPONENTS
// ==========================================

import Sidebar from "./Components/Sidebar";

// ==========================================
// PAGES
// ==========================================

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Lessons from "./pages/LessonBookings";
import TestBookings from "./pages/TestBookings";
import Instructors from "./pages/Instructors";
import Vehicles from "./pages/Vehicles";
import Users from "./pages/Users";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Schools from "./pages/Schools";

import StudentDashboard from "./pages/StudentDashboard";
import StudentLessons from "./pages/StudentLessons";
import StudentTestBookings from "./pages/StudentTestBookings";
import StudentProfile from "./pages/StudentProfile";
import StudentPayments from "./pages/StudentPayments";

// ==========================================
// USER ROLE TYPE
// ==========================================

type UserRole =
  | "Administrator"
  | "Admin"
  | "System Administrator"
  | "Receptionist"
  | "Instructor"
  | "Student";

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
    return JSON.parse(storedUser);
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
  return String(role || "")
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
    localStorage.getItem("loggedIn");

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
    localStorage.getItem("loggedIn");

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

  const currentRole =
    getUserRole(user.role);

  const hasPermission =
    allowedRoles.some(
      (allowedRole) =>
        getUserRole(
          allowedRole
        ) === currentRole
    );

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
// STUDENT ROUTE
// ==========================================

function StudentRoute({
  children,
}: {
  children: ReactNode;
}) {
  const loggedIn =
    localStorage.getItem("loggedIn");

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

  const role =
    getUserRole(user.role);

  if (role !== "student") {
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
// STUDENT PORTAL LAYOUT
// ==========================================

function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        background: "#f5f7fb",
      }}
    >
      {/* =====================================
          STUDENT SIDEBAR
      ====================================== */}

      <Sidebar />

      {/* =====================================
          STUDENT PAGE CONTENT
      ====================================== */}

      <main
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
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
        element={<Login />}
      />

      {/* =====================================
          NORMAL DASHBOARD
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
          STUDENT DASHBOARD
      ====================================== */}

      <Route
        path="/student-dashboard"
        element={
          <StudentRoute>
            <StudentLayout>
              <StudentDashboard />
            </StudentLayout>
          </StudentRoute>
        }
      />

      {/* =====================================
          STUDENT LESSONS
      ====================================== */}

      <Route
        path="/student-lessons"
        element={
          <StudentRoute>
            <StudentLayout>
              <StudentLessons />
            </StudentLayout>
          </StudentRoute>
        }
      />

      {/* =====================================
          STUDENT TEST BOOKINGS
      ====================================== */}

      <Route
        path="/student-test-bookings"
        element={
          <StudentRoute>
            <StudentLayout>
              <StudentTestBookings />
            </StudentLayout>
          </StudentRoute>
        }
      />

      {/* =====================================
          STUDENT PROFILE
      ====================================== */}

      <Route
        path="/student-profile"
        element={
          <StudentRoute>
            <StudentLayout>
              <StudentProfile />
            </StudentLayout>
          </StudentRoute>
        }
      />

      {/* =====================================
          STUDENT PAYMENTS
      ====================================== */}

      <Route
        path="/student-payments"
        element={
          <StudentRoute>
            <StudentLayout>
              <StudentPayments />
            </StudentLayout>
          </StudentRoute>
        }
      />

      {/* =====================================
          STUDENTS
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
          TEST BOOKINGS
      ====================================== */}

      <Route
        path="/test-bookings"
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
            <TestBookings />
          </RoleRoute>
        }
      />

      {/* =====================================
          INSTRUCTORS
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