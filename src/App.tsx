
import type { ReactNode } from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Settings from "./pages/Settings";
import LearnerLicenceTest from "./pages/LearnerLicenceTest";
import Sidebar from "./Components/Sidebar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentProgress from "./pages/StudentProgress";
import Lessons from "./pages/LessonBookings";
import LessonBookingRequests from "./pages/LessonBookingRequests";
import TestBookings from "./pages/TestBookings";
import Instructors from "./pages/Instructors";
import Vehicles from "./pages/Vehicles";
import Users from "./pages/Users";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Schools from "./pages/Schools";
import PublicLessonBooking from "./pages/PublicLessonBooking";

import StudentDashboard from "./pages/StudentDashboard";
import StudentLessons from "./pages/StudentLessons";
import StudentTestBookings from "./pages/StudentTestBookings";
import StudentProfile from "./pages/StudentProfile";
import StudentPayments from "./pages/StudentPayments";

type UserRole =
  | "Administrator"
  | "Admin"
  | "System Administrator"
  | "Receptionist"
  | "Instructor"
  | "Student";

interface CurrentUser {
  role?: string;
  school_id?: number | string;
  schoolId?: number | string;
  [key: string]: unknown;
}

const getCurrentUser = (): CurrentUser | null => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as CurrentUser;
  } catch (error) {
    console.error("ERROR READING USER:", error);
    return null;
  }
};

const getUserRole = (role?: string): string =>
  String(role || "").trim().toLowerCase();

const isLoggedIn = (): boolean =>
  localStorage.getItem("loggedIn") === "true" &&
  getCurrentUser() !== null;

function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RoleRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
}) {
  const user = getCurrentUser();

  if (localStorage.getItem("loggedIn") !== "true" || !user) {
    return <Navigate to="/" replace />;
  }

  const currentRole = getUserRole(user.role);

  const hasPermission = allowedRoles.some(
    (allowedRole) => getUserRole(allowedRole) === currentRole
  );

  if (!hasPermission) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

function StudentRoute({ children }: { children: ReactNode }) {
  const user = getCurrentUser();

  if (localStorage.getItem("loggedIn") !== "true" || !user) {
    return <Navigate to="/" replace />;
  }

  if (getUserRole(user.role) !== "student") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        background: "#f5f7fb",
      }}
    >
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />

      <Route path="/student-dashboard" element={
        <StudentRoute><StudentLayout><StudentDashboard /></StudentLayout></StudentRoute>
      } />

      <Route path="/student-lessons" element={
        <StudentRoute><StudentLayout><StudentLessons /></StudentLayout></StudentRoute>
      } />

      <Route path="/student-test-bookings" element={
        <StudentRoute><StudentLayout><StudentTestBookings /></StudentLayout></StudentRoute>
      } />

      <Route path="/student-profile" element={
        <StudentRoute><StudentLayout><StudentProfile /></StudentLayout></StudentRoute>
      } />

      <Route path="/student-payments" element={
        <StudentRoute><StudentLayout><StudentPayments /></StudentLayout></StudentRoute>
      } />

      <Route path="/student-progress" element={
        <RoleRoute allowedRoles={[
          "System Administrator", "Administrator", "Admin",
          "Instructor", "Receptionist"
        ]}>
          <StudentProgress />
        </RoleRoute>
      } />

      <Route path="/students" element={
        <RoleRoute allowedRoles={[
          "System Administrator", "Administrator", "Admin",
          "Receptionist", "Instructor"
        ]}>
          <Students />
        </RoleRoute>
      } />

      <Route path="/lessons" element={
        <RoleRoute allowedRoles={[
          "System Administrator", "Administrator", "Admin",
          "Receptionist", "Instructor"
        ]}>
          <Lessons />
        </RoleRoute>
      } />

      <Route path="/lesson-booking-requests" element={
        <RoleRoute allowedRoles={[
          "System Administrator", "Administrator", "Admin",
          "Receptionist"
        ]}>
          <LessonBookingRequests />
        </RoleRoute>
      } />

      <Route path="/test-bookings" element={
        <RoleRoute allowedRoles={[
          "System Administrator", "Administrator", "Admin",
          "Receptionist", "Instructor"
        ]}>
          <TestBookings />
        </RoleRoute>
      } />

      <Route path="/instructors" element={
        <RoleRoute allowedRoles={[
          "System Administrator", "Administrator", "Admin",
          "Receptionist"
        ]}>
          <Instructors />
        </RoleRoute>
      } />

      <Route path="/vehicles" element={
        <RoleRoute allowedRoles={[
          "System Administrator", "Administrator", "Admin",
          "Receptionist", "Instructor"
        ]}>
          <Vehicles />
        </RoleRoute>
      } />

      <Route path="/users" element={
        <RoleRoute allowedRoles={[
          "System Administrator", "Administrator", "Admin"
        ]}>
          <Users />
        </RoleRoute>
      } />

      <Route path="/payments" element={
        <RoleRoute allowedRoles={[
          "System Administrator", "Administrator", "Admin",
          "Receptionist"
        ]}>
          <Payments />
        </RoleRoute>
      } />

      <Route path="/reports" element={
        <RoleRoute allowedRoles={[
          "System Administrator", "Administrator", "Admin",
          "Receptionist"
        ]}>
          <Reports />
        </RoleRoute>
      } />

      <Route path="/schools" element={
        <RoleRoute allowedRoles={["System Administrator"]}>
          <Schools />
        </RoleRoute>
      } />

      <Route path="/settings" element={
        <RoleRoute allowedRoles={[
          "System Administrator", "Administrator", "Admin"
        ]}>
          <Settings />
        </RoleRoute>
      } />

      <Route path="/learner-licence-test" element={
        <RoleRoute allowedRoles={[
          "System Administrator", "Administrator", "Admin",
          "Instructor", "Receptionist", "Student"
        ]}>
          <LearnerLicenceTest />
        </RoleRoute>
      } />

      {/* PUBLIC BOOKING: ALL SCHOOLS */}
      <Route
        path="/book-lesson"
        element={<PublicLessonBooking />}
      />

      {/* PUBLIC BOOKING: ONE SPECIFIC SCHOOL */}
      <Route path="/book-lesson/:bookingCode" element={<PublicLessonBooking />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
