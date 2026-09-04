import { useMediaQuery, useTheme } from "@mui/material";
import logo from "../assets/drivepro-logo.png";

type HeaderProps = {
  title: string;
};

function Header({ title }: HeaderProps) {
  // ==========================================
  // RESPONSIVE SCREEN SIZE
  // ==========================================

  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down("md")
  );

  // ==========================================
  // GET LOGGED-IN USER
  // ==========================================

  let user: {
    fullname?: string;
    username?: string;
    role?: string;
  } = {};

  try {
    user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch (error) {
    console.error(
      "Error reading logged-in user:",
      error
    );
  }

  // ==========================================
  // TODAY
  // ==========================================

  const today =
    new Date().toLocaleDateString(
      "en-ZA",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  // ==========================================
  // USER INITIAL
  // ==========================================

  const userInitial =
    user?.fullname
      ? user.fullname
          .charAt(0)
          .toUpperCase()
      : user?.username
      ? user.username
          .charAt(0)
          .toUpperCase()
      : "A";

  // ==========================================
  // DESKTOP HEADER
  // ==========================================

  if (!isMobile) {
    return (
      <div
        style={{
          height: "85px",
          background: "#1E3A8A",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 30px",
          boxShadow:
            "0 4px 10px rgba(0,0,0,0.25)",
          boxSizing: "border-box",
        }}
      >
        {/* ======================================
            LEFT SIDE
        ======================================= */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            minWidth: 0,
          }}
        >
          <img
            src={logo}
            alt="DrivePro-SA Logo"
            style={{
              width: "70px",
              height: "70px",
              objectFit: "contain",
              background: "white",
              borderRadius: "10px",
              padding: "4px",
              boxSizing: "border-box",
              flexShrink: 0,
            }}
          />

          <div
            style={{
              minWidth: 0,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              {title}
            </h2>

            <small
              style={{
                color: "#dbeafe",
                fontSize: "13px",
              }}
            >
              {today}
            </small>
          </div>
        </div>

        {/* ======================================
            RIGHT SIDE
        ======================================= */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* USER AVATAR */}

          <div
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              background: "#ffffff",
              color: "#1E3A8A",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: "18px",
              flexShrink: 0,
            }}
          >
            {userInitial}
          </div>

          {/* USER DETAILS */}

          <div>
            <strong
              style={{
                fontSize: "15px",
              }}
            >
              {user?.fullname ||
                user?.username ||
                "Administrator"}
            </strong>

            <br />

            <small
              style={{
                color: "#dbeafe",
                fontSize: "12px",
              }}
            >
              Username:{" "}
              {user?.username ||
                "admin"}
            </small>

            <br />

            <small
              style={{
                color: "#bfdbfe",
                fontSize: "12px",
              }}
            >
              Role:{" "}
              {user?.role ||
                "Administrator"}
            </small>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MOBILE HEADER
  // ==========================================

  return (
    <div
      style={{
        minHeight: "82px",
        width: "100%",
        background: "#1E3A8A",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding:
          "8px 12px 8px 68px",
        boxShadow:
          "0 4px 10px rgba(0,0,0,0.25)",
        boxSizing: "border-box",
        gap: "8px",
      }}
    >
      {/* ======================================
          MOBILE LEFT SIDE
      ======================================= */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          minWidth: 0,
          flex: 1,
        }}
      >
        {/* LOGO */}

        <img
          src={logo}
          alt="DrivePro-SA Logo"
          style={{
            width: "52px",
            height: "52px",
            objectFit: "contain",
            background: "white",
            borderRadius: "8px",
            padding: "3px",
            boxSizing: "border-box",
            flexShrink: 0,
          }}
        />

        {/* TITLE + DATE */}

        <div
          style={{
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              lineHeight: "1.15",
              fontWeight: 700,
              whiteSpace: "normal",
              overflowWrap: "break-word",
            }}
          >
            {title}
          </h2>

          <small
            style={{
              display: "block",
              color: "#dbeafe",
              fontSize: "10px",
              lineHeight: "1.2",
              marginTop: "4px",
              whiteSpace: "normal",
            }}
          >
            {today}
          </small>
        </div>
      </div>

      {/* ======================================
          MOBILE USER
      ======================================= */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {/* USER AVATAR */}

        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "#ffffff",
            color: "#1E3A8A",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            fontSize: "17px",
          }}
        >
          {userInitial}
        </div>
      </div>
    </div>
  );
}

export default Header;