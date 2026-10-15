import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  Box,
  Typography,
} from "@mui/material";

// =====================================================
// SIDEBAR
// =====================================================

export default function Sidebar() {

  const navigate =
    useNavigate();

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
      backgroundColor: isActive
        ? "#2867e8"
        : "transparent",
      transition:
        "background-color 0.2s ease",
    };

  };

  // ===================================================
  // SIDEBAR
  // ===================================================

  return (
    <Box
      sx={{
        width: 300,
        minHeight: "100vh",
        backgroundColor: "#233f8f",
        color: "#fff",
        padding: "24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >

      {/* =========================================
          LOGO / TITLE
      ========================================== */}

      <Box
        sx={{
          textAlign: "center",
          mb: 3,
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
          >
            🏠
            <span>Dashboard</span>
          </NavLink>

          {/* STUDENT LESSONS */}

          <NavLink
            to="/student-lessons"
            style={getNavStyle}
          >
            📅
            <span>My Lessons</span>
          </NavLink>

          {/* STUDENT TEST BOOKINGS */}

          <NavLink
            to="/student-test-bookings"
            style={getNavStyle}
          >
            📝
            <span>My Tests</span>
          </NavLink>

          {/* STUDENT PROFILE */}

          <NavLink
            to="/student-profile"
            style={getNavStyle}
          >
            👤
            <span>My Profile</span>
          </NavLink>

          {/* STUDENT PAYMENTS */}

          <NavLink
            to="/student-payments"
            style={getNavStyle}
          >
            💳
            <span>My Payments</span>
          </NavLink>

        </>

      )}

      {/* =========================================
          ADMIN / RECEPTIONIST / INSTRUCTOR MENU
      ========================================== */}

      {!isStudent && (

        <>

          {/* =====================================
              DASHBOARD
          ====================================== */}

          <NavLink
            to="/dashboard"
            style={getNavStyle}
          >
            🏠
            <span>Dashboard</span>
          </NavLink>

          {/* =====================================
              STUDENTS
          ====================================== */}

          {(isAdministrator ||
            isReceptionist ||
            isInstructor) && (

            <NavLink
              to="/students"
              style={getNavStyle}
            >
              🎓
              <span>Students</span>
            </NavLink>

          )}

          {/* =====================================
              LESSON BOOKINGS
          ====================================== */}

          {(isAdministrator ||
            isReceptionist ||
            isInstructor) && (

            <NavLink
              to="/lessons"
              style={getNavStyle}
            >
              📅
              <span>Lesson Bookings</span>
            </NavLink>

          )}

          {/* =====================================
              TEST BOOKINGS
          ====================================== */}

          {(isAdministrator ||
            isReceptionist ||
            isInstructor) && (

            <NavLink
              to="/test-bookings"
              style={getNavStyle}
            >
              📝
              <span>Test Bookings</span>
            </NavLink>

          )}

          {/* =====================================
              VEHICLES
          ====================================== */}

          {(isAdministrator ||
            isReceptionist ||
            isInstructor) && (

            <NavLink
              to="/vehicles"
              style={getNavStyle}
            >
              🚗
              <span>Vehicles</span>
            </NavLink>

          )}

          {/* =====================================
              INSTRUCTORS
          ====================================== */}

          {(isAdministrator ||
            isReceptionist) && (

            <NavLink
              to="/instructors"
              style={getNavStyle}
            >
              👨‍🏫
              <span>Instructors</span>
            </NavLink>

          )}

          {/* =====================================
              PAYMENTS
          ====================================== */}

          {(isAdministrator ||
            isReceptionist) && (

            <NavLink
              to="/payments"
              style={getNavStyle}
            >
              💳
              <span>Payments</span>
            </NavLink>

          )}

          {/* =====================================
              REPORTS
          ====================================== */}

          {(isAdministrator ||
            isReceptionist) && (

            <NavLink
              to="/reports"
              style={getNavStyle}
            >
              📊
              <span>Reports</span>
            </NavLink>

          )}

          {/* =====================================
              USERS
          ====================================== */}

          {isAdministrator && (

            <NavLink
              to="/users"
              style={getNavStyle}
            >
              👥
              <span>Users</span>
            </NavLink>

          )}

          {/* =====================================
              SCHOOLS
          ====================================== */}

          {role ===
            "system administrator" && (

            <NavLink
              to="/schools"
              style={getNavStyle}
            >
              🏫
              <span>Schools</span>
            </NavLink>

          )}

          {/* =====================================
              SETTINGS
          ====================================== */}

          {isAdministrator && (

            <NavLink
              to="/settings"
              style={getNavStyle}
            >
              ⚙️
              <span>Settings</span>
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
              backgroundColor: "#c91d1d",
            },
          }}
        >
          🚪 Logout
        </Box>

      </Box>

    </Box>
  );
}