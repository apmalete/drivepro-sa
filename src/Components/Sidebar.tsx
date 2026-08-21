import { NavLink, useNavigate } from "react-router-dom";

// ==========================================
// SIDEBAR
// ==========================================

function Sidebar() {

  const navigate = useNavigate();

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

      currentUser =
        JSON.parse(
          storedUser
        );

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

  const role =
    String(
      currentUser.role || ""
    )
      .trim()
      .toLowerCase();


  // ==========================================
  // SYSTEM ADMINISTRATOR
  // ==========================================

  const isSystemAdministrator =
    role ===
      "system administrator";


  // ==========================================
  // SCHOOL ADMINISTRATOR
  // ==========================================

  const isAdministrator =
    role ===
      "administrator" ||
    role ===
      "admin";


  // ==========================================
  // ADMINISTRATOR OR SYSTEM ADMINISTRATOR
  // ==========================================

  const hasAdministratorAccess =
    isSystemAdministrator ||
    isAdministrator;


  // ==========================================
  // RECEPTIONIST
  // ==========================================

  const isReceptionist =
    role ===
    "receptionist";


  // ==========================================
  // INSTRUCTOR
  // ==========================================

  const isInstructor =
    role ===
    "instructor";


  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {

    localStorage.removeItem(
      "loggedIn"
    );

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/");

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

    padding:
      "10px 15px",

    borderRadius:
      "6px",

    marginBottom:
      "5px",

    background:
      isActive
        ? "#2563eb"
        : "transparent",

    fontWeight:
      isActive
        ? "bold"
        : "normal",

  });


  // ==========================================
  // SIDEBAR
  // ==========================================

  return (

    <div
      style={{
        width: "250px",
        background: "#1e3a8a",
        color: "white",
        height: "100vh",
        padding: "20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >

      {/* ======================================
          APPLICATION TITLE
      ======================================= */}

      <h2
        style={{
          marginTop: 0,
          marginBottom: 15,
        }}
      >
        🚗 DrivePro-SA
      </h2>

      <hr />


      {/* ======================================
          DASHBOARD
          ALL ROLES
      ======================================= */}

      <NavLink
        to="/dashboard"
        style={linkStyle}
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
      >
        📅 Lesson Bookings
      </NavLink>


      {/* ======================================
          INSTRUCTORS
          SYSTEM ADMIN
          ADMIN
          RECEPTIONIST
      ======================================= */}

      {(hasAdministratorAccess ||
        isReceptionist) && (

        <NavLink
          to="/instructors"
          style={linkStyle}
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
      >
        🚗 Vehicles
      </NavLink>


      {/* ======================================
          PAYMENTS
          SYSTEM ADMIN
          ADMIN
          RECEPTIONIST
      ======================================= */}

      {(hasAdministratorAccess ||
        isReceptionist) && (

        <NavLink
          to="/payments"
          style={linkStyle}
        >
          💳 Payments
        </NavLink>

      )}


      {/* ======================================
          REPORTS
          SYSTEM ADMIN
          ADMIN
          RECEPTIONIST
      ======================================= */}

      {(hasAdministratorAccess ||
        isReceptionist) && (

        <NavLink
          to="/reports"
          style={linkStyle}
        >
          📊 Reports
        </NavLink>

      )}


      {/* ======================================
          USERS
          SYSTEM ADMIN
          SCHOOL ADMIN
      ======================================= */}

      {hasAdministratorAccess && (

        <NavLink
          to="/users"
          style={linkStyle}
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
        >
          🏫 Schools
        </NavLink>

      )}


      {/* ======================================
          SETTINGS
          SYSTEM ADMIN
          SCHOOL ADMIN
      ======================================= */}

      {hasAdministratorAccess && (

        <NavLink
          to="/settings"
          style={linkStyle}
        >
          ⚙️ Settings
        </NavLink>

      )}


      {/* ======================================
          USER INFORMATION
      ======================================= */}

      <div
        style={{
          marginTop: "auto",
        }}
      >

        <hr />


        <div
          style={{
            padding: "12px",
            marginBottom: "10px",
            background:
              "rgba(255,255,255,0.10)",
            borderRadius: "8px",
          }}
        >

          {/* FULL NAME */}

          <div
            style={{
              fontWeight: "bold",
              fontSize: "15px",
              marginBottom: "5px",
            }}
          >
            👤{" "}
            {currentUser.fullname ||
              "User"}
          </div>


          {/* USERNAME */}

          <div
            style={{
              fontSize: "12px",
              opacity: 0.85,
              marginBottom: "3px",
            }}
          >
            Username:{" "}
            {currentUser.username ||
              "Unknown"}
          </div>


          {/* ROLE */}

          <div
            style={{
              fontSize: "12px",
              opacity: 0.85,
            }}
          >
            Role:{" "}
            {currentUser.role ||
              "User"}
          </div>


          {/* SCHOOL */}

          {currentUser.school_id && (

            <div
              style={{
                fontSize: "12px",
                opacity: 0.85,
                marginTop: "3px",
              }}
            >
              School ID:{" "}
              {currentUser.school_id}
            </div>

          )}

        </div>


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
          }}
        >
          🚪 Logout
        </button>

      </div>

    </div>

  );

}

export default Sidebar;