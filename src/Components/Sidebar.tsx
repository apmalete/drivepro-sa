import { useState } from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  Box,
  Typography,
  IconButton,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

// =====================================================
// SIDEBAR
// =====================================================

export default function Sidebar() {

  const navigate = useNavigate();

  // ===================================================
  // MOBILE MENU
  // ===================================================

 const [mobileOpen, setMobileOpen] =
    useState(false);

  // ===================================================
  // GET USER
  // ===================================================

  const storedUser =
    localStorage.getItem("user");

  let user: any = null;

  try {

    user =
      storedUser
        ? JSON.parse(storedUser)
        : null;

  } catch {

    user = null;

  }

  // ===================================================
  // ROLE
  // ===================================================

  const role =
    String(
      user?.role || ""
    )
      .trim()
      .toLowerCase();

  const isStudent =
    role === "student";

  const isInstructor =
    role === "instructor";

  const isReceptionist =
    role === "receptionist";

  const isAdministrator =
    role === "administrator" ||
    role === "admin" ||
    role === "system administrator";

  // ===================================================
  // CLOSE MOBILE MENU
  // ===================================================

  const closeMobileMenu = () => {

    setMobileOpen(false);

  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "loggedIn"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "token"
    );

    sessionStorage.clear();

    navigate(
      "/",
      {
        replace: true,
      }
    );

  };

  // ===================================================
  // NAVIGATION STYLE
  // ===================================================

  const getNavStyle = ({
    isActive,
  }: {
    isActive: boolean;
  }) => {

    return {

      display: "flex",

      alignItems: "center",

      gap: "12px",

      textDecoration: "none",

      color: "#fff",

      padding: "14px 20px",

      marginBottom: "6px",

      borderRadius: "8px",

      fontSize: "18px",

      fontWeight: 500,

      backgroundColor:
        isActive
          ? "#2867e8"
          : "transparent",

      transition:
        "background-color 0.2s ease",

    };

  };

  // ===================================================
  // RETURN
  // ===================================================

  return (

    <>

      {/* =================================================
          MOBILE MENU BUTTON
      ================================================= */}

      <Box
        sx={{
          display: {
            xs: "block",
            md: "none",
          },

          position: "fixed",

          top: 12,

          left: 12,

          zIndex: 1500,
        }}
      >

        <IconButton
          onClick={() =>
            setMobileOpen(true)
          }
          sx={{
            backgroundColor: "#233f8f",

            color: "#fff",

            width: 46,

            height: 46,

            boxShadow:
              "0 3px 10px rgba(0,0,0,0.25)",

            "&:hover": {
              backgroundColor: "#1b3273",
            },
          }}
        >

          <MenuIcon />

        </IconButton>

      </Box>

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileOpen && (

        <Box
          onClick={closeMobileMenu}
          sx={{
            display: {
              xs: "block",
              md: "none",
            },

            position: "fixed",

            inset: 0,

            backgroundColor:
              "rgba(0,0,0,0.45)",

            zIndex: 1299,
          }}
        />

      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Box
        sx={{

          width: {
            xs: mobileOpen ? 285 : 0,
            md: 300,
          },

          minWidth: {
            xs: mobileOpen ? 285 : 0,
            md: 300,
          },

          minHeight: "100vh",

          height: {
            xs: "100vh",
            md: "auto",
          },

          position: {
            xs: "fixed",
            md: "static",
          },

          top: 0,

          left: 0,

          zIndex: 1400,

          overflowY: "auto",

          overflowX: "hidden",

          backgroundColor: "#233f8f",

          color: "#fff",

          padding: {
            xs: mobileOpen ? "20px" : 0,
            md: "24px",
          },

          boxSizing: "border-box",

          display: "flex",

          flexDirection: "column",

          transition:
            "width 0.25s ease, min-width 0.25s ease, padding 0.25s ease",

          boxShadow: {
            xs: mobileOpen
              ? "4px 0 15px rgba(0,0,0,0.25)"
              : "none",

            md: "none",
          },

        }}
      >

        {/* =================================================
            MOBILE CLOSE BUTTON
        ================================================= */}

        <Box
          sx={{
            display: {
              xs: "flex",
              md: "none",
            },

            justifyContent: "flex-end",

            mb: 1,
          }}
        >

          <IconButton
            onClick={closeMobileMenu}
            sx={{
              color: "#fff",
            }}
          >

            <CloseIcon />

          </IconButton>

        </Box>

        {/* =========================================
            LOGO / TITLE
        ========================================== */}

        <Box
          sx={{
            textAlign: "center",

            mb: 3,

            minWidth: 245,
          }}
        >

          <Typography
            variant="h5"
            fontWeight="bold"
          >
            🚗 DrivePro-SA
          </Typography>

          <Typography
            variant="body2"
            sx={{
              opacity: 0.8,

              mt: 0.5,
            }}
          >
            Driving School Management
          </Typography>

        </Box>

        {/* =========================================
            STUDENT MENU
        ========================================== */}

        {isStudent && (

          <>

            {/* STUDENT DASHBOARD */}

            <NavLink
              to="/student-dashboard"
              style={getNavStyle}
              onClick={closeMobileMenu}
            >
              🏠
              <span>
                Dashboard
              </span>
            </NavLink>

            {/* STUDENT LESSONS */}

            <NavLink
              to="/student-lessons"
              style={getNavStyle}
              onClick={closeMobileMenu}
            >
              📅
              <span>
                My Lessons
              </span>
            </NavLink>

            {/* STUDENT TEST BOOKINGS */}

            <NavLink
              to="/student-test-bookings"
              style={getNavStyle}
              onClick={closeMobileMenu}
            >
              📝
              <span>
                My Tests
              </span>
            </NavLink>

            {/* STUDENT PROFILE */}

            <NavLink
              to="/student-profile"
              style={getNavStyle}
              onClick={closeMobileMenu}
            >
              👤
              <span>
                My Profile
              </span>
            </NavLink>

            {/* STUDENT PAYMENTS */}

            <NavLink
              to="/student-payments"
              style={getNavStyle}
              onClick={closeMobileMenu}
            >
              💳
              <span>
                My Payments
              </span>
            </NavLink>

          </>

        )}

        {/* =========================================
            ADMIN / RECEPTIONIST / INSTRUCTOR MENU
        ========================================== */}

        {!isStudent && (

          <>

            {/* DASHBOARD */}

            <NavLink
              to="/dashboard"
              style={getNavStyle}
              onClick={closeMobileMenu}
            >
              🏠
              <span>
                Dashboard
              </span>
            </NavLink>

            {/* STUDENTS */}

            {(
              isAdministrator ||
              isReceptionist ||
              isInstructor
            ) && (

              <NavLink
                to="/students"
                style={getNavStyle}
                onClick={closeMobileMenu}
              >
                🎓
                <span>
                  Students
                </span>
              </NavLink>

            )}

            {/* LESSON BOOKINGS */}

            {(
              isAdministrator ||
              isReceptionist ||
              isInstructor
            ) && (

              <NavLink
                to="/lessons"
                style={getNavStyle}
                onClick={closeMobileMenu}
              >
                📅
                <span>
                  Lesson Bookings
                </span>
              </NavLink>

            )}

            {/* TEST BOOKINGS */}

            {(
              isAdministrator ||
              isReceptionist ||
              isInstructor
            ) && (

              <NavLink
                to="/test-bookings"
                style={getNavStyle}
                onClick={closeMobileMenu}
              >
                📝
                <span>
                  Test Bookings
                </span>
              </NavLink>

            )}

            {/* VEHICLES */}

            {(
              isAdministrator ||
              isReceptionist ||
              isInstructor
            ) && (

              <NavLink
                to="/vehicles"
                style={getNavStyle}
                onClick={closeMobileMenu}
              >
                🚗
                <span>
                  Vehicles
                </span>
              </NavLink>

            )}

            {/* INSTRUCTORS */}

            {(
              isAdministrator ||
              isReceptionist
            ) && (

              <NavLink
                to="/instructors"
                style={getNavStyle}
                onClick={closeMobileMenu}
              >
                👨‍🏫
                <span>
                  Instructors
                </span>
              </NavLink>

            )}

            {/* PAYMENTS */}

            {(
              isAdministrator ||
              isReceptionist
            ) && (

              <NavLink
                to="/payments"
                style={getNavStyle}
                onClick={closeMobileMenu}
              >
                💳
                <span>
                  Payments
                </span>
              </NavLink>

            )}

            {/* REPORTS */}

            {(
              isAdministrator ||
              isReceptionist
            ) && (

              <NavLink
                to="/reports"
                style={getNavStyle}
                onClick={closeMobileMenu}
              >
                📊
                <span>
                  Reports
                </span>
              </NavLink>

            )}

            {/* USERS */}

            {isAdministrator && (

              <NavLink
                to="/users"
                style={getNavStyle}
                onClick={closeMobileMenu}
              >
                👥
                <span>
                  Users
                </span>
              </NavLink>

            )}

            {/* SCHOOLS */}

            {role ===
              "system administrator" && (

              <NavLink
                to="/schools"
                style={getNavStyle}
                onClick={closeMobileMenu}
              >
                🏫
                <span>
                  Schools
                </span>
              </NavLink>

            )}

            {/* SETTINGS */}

            {isAdministrator && (

              <NavLink
                to="/settings"
                style={getNavStyle}
                onClick={closeMobileMenu}
              >
                ⚙️
                <span>
                  Settings
                </span>
              </NavLink>

            )}

          </>

        )}

        {/* =========================================
            USER INFORMATION
        ========================================== */}

        <Box
          sx={{
            mt: "auto",

            pt: 3,

            minWidth: 245,
          }}
        >

          <Box
            sx={{
              backgroundColor:
                "rgba(255,255,255,0.12)",

              borderRadius: "10px",

              padding: "16px",

              mb: 2,
            }}
          >

            <Typography
              fontWeight="bold"
            >
              👤{" "}
              {user?.fullname ||
                user?.username ||
                "User"}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 1,

                opacity: 0.9,
              }}
            >
              Username:{" "}
              {user?.username || "-"}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.5,

                opacity: 0.9,
              }}
            >
              Role:{" "}
              {user?.role || "-"}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.5,

                opacity: 0.9,
              }}
            >
              School ID:{" "}
              {user?.school_id || "-"}
            </Typography>

          </Box>

          {/* =======================================
              LOGOUT
          ======================================== */}

          <Box
            component="button"
            onClick={handleLogout}
            sx={{
              width: "100%",

              border: "none",

              borderRadius: "8px",

              padding: "14px",

              backgroundColor: "#e82323",

              color: "#fff",

              fontSize: "17px",

              fontWeight: "bold",

              cursor: "pointer",

              "&:hover": {
                backgroundColor:
                  "#c91d1d",
              },
            }}
          >
            🚪 Logout
          </Box>

        </Box>

      </Box>

    </>
  );
}