import logo from "../assets/drivepro-logo.png";

type HeaderProps = {
  title: string;
};

function Header({ title }: HeaderProps) {
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

  return (
    <div
      style={{
        height: "85px",
        background: "#1E3A8A",
        color: "white",
        display: "flex",
        justifyContent:
          "space-between",
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
          }}
        />

        <div>
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

export default Header;