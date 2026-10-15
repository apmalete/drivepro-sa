
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  IconButton,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";

import logo from "../assets/drivepro-logo.png";

export default function Sidebar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  let user: {
    fullname?: string;
    username?: string;
    role?: string;
    school_id?: number | string;
  } | null = null;

  try {
    const storedUser = localStorage.getItem("user");
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const role = String(user?.role || "").trim().toLowerCase();

  const isStudent = role === "student";
  const isInstructor = role === "instructor";
  const isReceptionist = role === "receptionist";

  const isAdministrator =
    role === "administrator" ||
    role === "admin" ||
    role === "system administrator";

  const closeMobileMenu = () => setMobileOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  const getNavStyle = ({ isActive }: { isActive: boolean }) => ({
    display: "flex",
    alignItems: "center",
    gap: "13px",
    textDecoration: "none",
    color: "#FFFFFF",
    padding: "12px 15px",
    marginBottom: "5px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: isActive ? 700 : 500,
    backgroundColor: isActive ? "#2867E8" : "transparent",
    boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.12)" : "none",
    transition: "background-color 0.2s ease",
  });

  const renderLink = (
    to: string,
    label: string,
    icon: React.ReactNode
  ) => (
    <NavLink
      key={to}
      to={to}
      end={to === "/dashboard" || to === "/student-dashboard"}
      style={getNavStyle}
      onClick={closeMobileMenu}
    >
      <Box
        component="span"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 23,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <span>{label}</span>
    </NavLink>
  );

  const sidebarContent = (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 3,
          px: 0.5,
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="DrivePro-SA logo"
          sx={{
            width: 56,
            height: 56,
            objectFit: "contain",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            p: "4px",
            boxSizing: "border-box",
            flexShrink: 0,
          }}
        />

        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: "#FFFFFF", fontWeight: 800, fontSize: "19px", lineHeight: 1.2 }}>
            DrivePro-SA
          </Typography>
          <Typography sx={{ color: "#CBD5E1", fontSize: "11px", mt: 0.5, lineHeight: 1.4 }}>
            Driving School Management
          </Typography>
        </Box>
      </Box>

      <Typography
        sx={{
          color: "#AFC5F4",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "1.4px",
          px: 1.5,
          mb: 1,
        }}
      >
        MAIN MENU
      </Typography>

      {isStudent ? (
        <>
          {renderLink("/student-dashboard", "Dashboard", <DashboardRoundedIcon />)}
          {renderLink("/student-lessons", "My Lessons", <CalendarMonthRoundedIcon />)}
          {renderLink("/student-test-bookings", "My Tests", <AssignmentRoundedIcon />)}
          {renderLink("/learner-licence-test", "Learner's Licence Practice", <QuizRoundedIcon />)}
          {renderLink("/student-profile", "My Profile", <PersonRoundedIcon />)}
          {renderLink("/student-payments", "My Payments", <PaymentsRoundedIcon />)}
        </>
      ) : (
        <>
          {renderLink("/dashboard", "Dashboard", <DashboardRoundedIcon />)}

          {(isAdministrator || isReceptionist || isInstructor) && (
            <>
              {renderLink("/students", "Students", <SchoolRoundedIcon />)}
              {renderLink("/student-progress", "Student Progress", <TrendingUpRoundedIcon />)}
              {renderLink("/lessons", "Lesson Bookings", <CalendarMonthRoundedIcon />)}
              {renderLink("/test-bookings", "Test Bookings", <AssignmentRoundedIcon />)}
              {renderLink("/vehicles", "Vehicles", <DirectionsCarRoundedIcon />)}
            </>
          )}

          {(isAdministrator || isReceptionist) && (
            <>
              {renderLink("/instructors", "Instructors", <GroupsRoundedIcon />)}
              {renderLink("/payments", "Payments", <PaymentsRoundedIcon />)}
              {renderLink("/reports", "Reports", <BarChartRoundedIcon />)}
            </>
          )}

          {isAdministrator && (
            <>
              {renderLink("/users", "Users", <PeopleRoundedIcon />)}
              {renderLink("/settings", "Settings", <SettingsRoundedIcon />)}
            </>
          )}

          {role === "system administrator" &&
            renderLink("/schools", "Schools", <SchoolRoundedIcon />)}
        </>
      )}

      <Box sx={{ mt: "auto", pt: 3 }}>
        <Box
          sx={{
            backgroundColor: "rgba(255,255,255,0.09)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "12px",
            p: 1.75,
            mb: 1.5,
            overflowWrap: "anywhere",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                color: "#233F8F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PersonRoundedIcon />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "13px" }}>
                {user?.fullname || user?.username || "User"}
              </Typography>
              <Typography sx={{ color: "#CBD5E1", fontSize: "11px", textTransform: "capitalize" }}>
                {user?.role || "User"}
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ color: "#CBD5E1", fontSize: "11px" }}>
            Username: {user?.username || "-"}
          </Typography>
          <Typography sx={{ color: "#CBD5E1", fontSize: "11px", mt: 0.5 }}>
            School ID: {user?.school_id ?? "-"}
          </Typography>
        </Box>

        <Box
          component="button"
          onClick={handleLogout}
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "10px",
            py: 1.4,
            px: 2,
            backgroundColor: "#DC2626",
            color: "#FFFFFF",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            "&:hover": { backgroundColor: "#B91C1C" },
          }}
        >
          <LogoutRoundedIcon fontSize="small" />
          Logout
        </Box>
      </Box>
    </>
  );

  return (
    <>
      {!mobileOpen && (
        <Box
          sx={{
            display: { xs: "block", md: "none" },
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 1500,
          }}
        >
          <IconButton
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
            sx={{
              backgroundColor: "#233F8F",
              color: "#FFFFFF",
              width: 46,
              height: 46,
              boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
              "&:hover": { backgroundColor: "#1B3273" },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {mobileOpen && (
        <Box
          onClick={closeMobileMenu}
          sx={{
            display: { xs: "block", md: "none" },
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15,23,42,0.55)",
            zIndex: 1299,
          }}
        />
      )}

      <Box
        component="aside"
        sx={{
          width: { xs: mobileOpen ? 285 : 0, md: 285 },
          minWidth: { xs: mobileOpen ? 285 : 0, md: 285 },
          height: "100vh",
          minHeight: "100vh",
          position: { xs: "fixed", md: "sticky" },
          top: 0,
          left: 0,
          zIndex: 1400,
          overflowY: "auto",
          overflowX: "hidden",
          backgroundColor: "#172554",
          backgroundImage: "linear-gradient(180deg, #172554 0%, #233F8F 100%)",
          color: "#FFFFFF",
          p: { xs: mobileOpen ? 2.5 : 0, md: 2.5 },
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "width 0.25s ease, min-width 0.25s ease, padding 0.25s ease",
          boxShadow: {
            xs: mobileOpen ? "4px 0 15px rgba(0,0,0,0.25)" : "none",
            md: "2px 0 12px rgba(15,23,42,0.08)",
          },
          ...(mobileOpen
            ? {}
            : {
                "@media (max-width:899.95px)": {
                  visibility: "hidden",
                  padding: 0,
                },
              }),
        }}
      >
        <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "flex-end", mb: 1 }}>
          <IconButton
            aria-label="Close navigation menu"
            onClick={closeMobileMenu}
            sx={{ color: "#FFFFFF" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {sidebarContent}
      </Box>
    </>
  );
}
