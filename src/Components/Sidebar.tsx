import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

// ==========================================
// SIDEBAR
// ==========================================

function Sidebar() {
  const navigate = useNavigate();

  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down("md")
  );

  const [mobileOpen, setMobileOpen] =
    useState(false);

  // ==========================================
  // GET LOGGED-IN USER
  // ==========================================

  const storedUser =
    localStorage.getItem("user");

  let currentUser: {
    fullname?: string;
    username?: string;
    role?: string;
    school_id?: number;
  } = {};

  try {
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error(
      "Error reading logged-in user:",
      error
    );
  }

  // ==========================================
  // USER ROLE
  // ==========================================

  const role = String(
    currentUser.role || ""
  )
    .trim()
    .toLowerCase();

  // ==========================================
  // SYSTEM ADMINISTRATOR
  // ==========================================

  const isSystemAdministrator =
    role === "system administrator";

  // ==========================================
  // SCHOOL ADMINISTRATOR
  // ==========================================

  const isAdministrator =
    role === "administrator" ||
    role === "admin";

  // ==========================================
  // ADMINISTRATOR ACCESS
  // ==========================================

  const hasAdministratorAccess =
    isSystemAdministrator ||
    isAdministrator;

  // ==========================================
  // RECEPTIONIST
  // ==========================================

  const isReceptionist =
    role === "receptionist";

  // ==========================================
  // INSTRUCTOR
  // ==========================================

  const isInstructor =
    role === "instructor";

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  // ==========================================
  // CLOSE MOBILE MENU
  // ==========================================

  const closeMobileMenu = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // ==========================================
  // NAVIGATION STYLE
  // ==========================================

  const linkStyle = ({
    isActive,
  }: {
    isActive: boolean;
  }) => ({
    display: "block",
    color: "white",
    textDecoration: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    marginBottom: "5px",
    background: isActive
      ? "#2563eb"
      : "transparent",
    fontWeight: isActive
      ? "bold"
      : "normal",
  });

  // ==========================================
  // SIDEBAR CONTENT
  // ==========================================

  const sidebarContent = (
    <Box
      sx={{
        width: 250,
        background: "#1e3a8a",
        color: "white",

        // MOBILE SCROLL FIX
        height: "100dvh",
        minHeight: 0,
        overflowY: "auto",

        padding: "20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ======================================
          APPLICATION TITLE
      ======================================= */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "white",
          }}
        >
          🚗 DrivePro-SA
        </Typography>

        {isMobile && (
          <IconButton
            onClick={() =>
              setMobileOpen(false)
            }
            sx={{
              color: "white",
            }}
            aria-label="Close menu"
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <hr />

      {/* ======================================
          DASHBOARD
          ALL ROLES
      ======================================= */}

      <NavLink
        to="/dashboard"
        style={linkStyle}
        onClick={closeMobileMenu}
      >
        🏠 Dashboard
      </NavLink>

      {/* ======================================
          STUDENTS
          ALL ROLES
      ======================================= */}

      <NavLink
        to="/students"
        style={linkStyle}
        onClick={closeMobileMenu}
      >
        🎓 Students
      </NavLink>

      {/* ======================================
          LESSON BOOKINGS
          ALL ROLES
      ======================================= */}

      <NavLink
        to="/lessons"
        style={linkStyle}
        onClick={closeMobileMenu}
      >
        📅 Lesson Bookings
      </NavLink>

      {/* ======================================
          INSTRUCTORS
          ADMINISTRATOR / RECEPTIONIST
      ======================================= */}

      {(hasAdministratorAccess ||
        isReceptionist) && (
        <NavLink
          to="/instructors"
          style={linkStyle}
          onClick={closeMobileMenu}
        >
          👨‍🏫 Instructors
        </NavLink>
      )}

      {/* ======================================
          VEHICLES
          ALL ROLES
      ======================================= */}

      <NavLink
        to="/vehicles"
        style={linkStyle}
        onClick={closeMobileMenu}
      >
        🚗 Vehicles
      </NavLink>

      {/* ======================================
          PAYMENTS
          ADMINISTRATOR / RECEPTIONIST
      ======================================= */}

      {(hasAdministratorAccess ||
        isReceptionist) && (
        <NavLink
          to="/payments"
          style={linkStyle}
          onClick={closeMobileMenu}
        >
          💳 Payments
        </NavLink>
      )}

      {/* ======================================
          REPORTS
          ADMINISTRATOR / RECEPTIONIST
      ======================================= */}

      {(hasAdministratorAccess ||
        isReceptionist) && (
        <NavLink
          to="/reports"
          style={linkStyle}
          onClick={closeMobileMenu}
        >
          📊 Reports
        </NavLink>
      )}

      {/* ======================================
          USERS
          ADMINISTRATOR
      ======================================= */}

      {hasAdministratorAccess && (
        <NavLink
          to="/users"
          style={linkStyle}
          onClick={closeMobileMenu}
        >
          👥 Users
        </NavLink>
      )}

      {/* ======================================
          SCHOOLS
          SYSTEM ADMINISTRATOR ONLY
      ======================================= */}

      {isSystemAdministrator && (
        <NavLink
          to="/schools"
          style={linkStyle}
          onClick={closeMobileMenu}
        >
          🏫 Schools
        </NavLink>
      )}

      {/* ======================================
          SETTINGS
          ADMINISTRATOR
      ======================================= */}

      {hasAdministratorAccess && (
        <NavLink
          to="/settings"
          style={linkStyle}
          onClick={closeMobileMenu}
        >
          ⚙️ Settings
        </NavLink>
      )}

      {/* ======================================
          USER INFORMATION
      ======================================= */}

      <Box
        sx={{
          // IMPORTANT:
          // Do not use marginTop: "auto"
          // because it can push Logout below
          // the mobile viewport.
          marginTop: "20px",
          flexShrink: 0,
        }}
      >
        <hr />

        <Box
          sx={{
            padding: "12px",
            marginBottom: "10px",
            background:
              "rgba(255,255,255,0.10)",
            borderRadius: "8px",
          }}
        >
          {/* FULL NAME */}

          <Box
            sx={{
              fontWeight: "bold",
              fontSize: "15px",
              marginBottom: "5px",
            }}
          >
            👤{" "}
            {currentUser.fullname ||
              "User"}
          </Box>

          {/* USERNAME */}

          <Box
            sx={{
              fontSize: "12px",
              opacity: 0.85,
              marginBottom: "3px",
            }}
          >
            Username:{" "}
            {currentUser.username ||
              "Unknown"}
          </Box>

          {/* ROLE */}

          <Box
            sx={{
              fontSize: "12px",
              opacity: 0.85,
            }}
          >
            Role:{" "}
            {currentUser.role ||
              "User"}
          </Box>

          {/* SCHOOL */}

          {currentUser.school_id && (
            <Box
              sx={{
                fontSize: "12px",
                opacity: 0.85,
                marginTop: "3px",
              }}
            >
              School ID:{" "}
              {currentUser.school_id}
            </Box>
          )}
        </Box>

        {/* ====================================
            LOGOUT
        ===================================== */}

        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "12px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "5px",
          }}
        >
          🚪 Logout
        </button>
      </Box>
    </Box>
  );

  // ==========================================
  // MOBILE
  // ==========================================

  if (isMobile) {
    return (
      <>
        <IconButton
          onClick={() =>
            setMobileOpen(true)
          }
          sx={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 1300,
            background: "#1e3a8a",
            color: "white",
            "&:hover": {
              background: "#2563eb",
            },
            boxShadow: 2,
          }}
          aria-label="Open menu"
        >
          <MenuIcon />
        </IconButton>

        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={() =>
            setMobileOpen(false)
          }
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              background: "#1e3a8a",
              color: "white",
              overflow: "hidden",
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      </>
    );
  }

  // ==========================================
  // DESKTOP
  // ==========================================

  return sidebarContent;
}

export default Sidebar;