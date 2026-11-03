
import { useEffect, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import defaultLogo from "../assets/drivepro-logo.png";
import api from "../services/api";

type HeaderProps = {
  title: string;
};

function Header({ title }: HeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [appLogo, setAppLogo] = useState(defaultLogo);

  useEffect(() => {
    let active = true;

    const loadAppLogo = async () => {
      try {
        let savedLogo = "";

        let user: {
          role?: string;
          school_id?: number | string;
        } | null = null;

        try {
          const storedUser = localStorage.getItem("user");
          user = storedUser ? JSON.parse(storedUser) : null;
        } catch {
          user = null;
        }

        const role = String(user?.role || "")
          .trim()
          .toLowerCase();

        if (role === "system administrator") {
          const response = await api.get("/app-logo");
          savedLogo = response.data?.appLogo || "";
        } else {
          const response = await api.get("/my-school-logo");
          savedLogo = response.data?.logo || "";
        }

        if (!active) return;

        if (!savedLogo) {
          setAppLogo(defaultLogo);
          return;
        }

        const baseURL = (
          api.defaults.baseURL || "http://localhost:5000"
        )
          .replace(/\/api\/?$/, "")
          .replace(/\/$/, "");

        const logoURL = /^https?:\/\//i.test(savedLogo)
          ? savedLogo
          : `${baseURL}${savedLogo.startsWith("/") ? "" : "/"}${savedLogo}`;

        setAppLogo(
          `${logoURL}${logoURL.includes("?") ? "&" : "?"}v=${Date.now()}`
        );
      } catch (error) {
        console.error(
          "Could not load the appropriate logo in Header:",
          error
        );

        if (active) {
          setAppLogo(defaultLogo);
        }
      }
    };

    loadAppLogo();

    const handleLogoChanged = () => {
      loadAppLogo();
    };

    window.addEventListener("appLogoChanged", handleLogoChanged);
    window.addEventListener("schoolLogoChanged", handleLogoChanged);

    return () => {
      active = false;
      window.removeEventListener("appLogoChanged", handleLogoChanged);
      window.removeEventListener("schoolLogoChanged", handleLogoChanged);
    };
  }, []);

  let user: {
    fullname?: string;
    username?: string;
    role?: string;
  } = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (error) {
    console.error("Error reading logged-in user:", error);
  }

  const today = new Date().toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const userInitial = user?.fullname
    ? user.fullname.charAt(0).toUpperCase()
    : user?.username
    ? user.username.charAt(0).toUpperCase()
    : "A";

  const logoImage = (
    <img
      src={appLogo}
      alt="DrivePro-SA Logo"
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = defaultLogo;
      }}
      style={{
        width: isMobile ? "52px" : "70px",
        height: isMobile ? "52px" : "70px",
        objectFit: "contain",
        background: "white",
        borderRadius: isMobile ? "8px" : "10px",
        padding: "4px",
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    />
  );

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
          boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            minWidth: 0,
          }}
        >
          {logoImage}

          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
              {title}
            </h2>
            <small style={{ color: "#dbeafe", fontSize: "13px" }}>
              {today}
            </small>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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

          <div>
            <strong style={{ fontSize: "15px" }}>
              {user?.fullname || user?.username || "Administrator"}
            </strong>
            <br />
            <small style={{ color: "#dbeafe", fontSize: "12px" }}>
              Username: {user?.username || "admin"}
            </small>
            <br />
            <small style={{ color: "#bfdbfe", fontSize: "12px" }}>
              Role: {user?.role || "Administrator"}
            </small>
          </div>
        </div>
      </div>
    );
  }

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
        padding: "8px 12px 8px 68px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
        boxSizing: "border-box",
        gap: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          minWidth: 0,
          flex: 1,
        }}
      >
        {logoImage}

        <div style={{ minWidth: 0, overflow: "hidden" }}>
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
            }}
          >
            {today}
          </small>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
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
