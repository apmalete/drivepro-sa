
import { useCallback, useEffect, useState } from "react";

import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import UpcomingOutlinedIcon from "@mui/icons-material/UpcomingOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";

import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import QuickActions from "../Components/QuickActions";

import {
  getDashboard,
  getTodaysLessons,
} from "../services/dashboardService";

// =====================================================
// TYPES
// =====================================================

interface DashboardData {
  totalStudents: number;
  totalInstructors: number;
  totalVehicles: number;
  totalLessons: number;
  todayLessons: number;
  bookedLessons: number;
  completedLessons: number;
  cancelledLessons: number;
  upcomingLessons: number;
  monthlyIncome: number;
  outstandingBalance: number;
}

interface TodaysLesson {
  student: string;
  instructor: string;
  vehicle: string;
  lesson_time: string;
  status: string;
}

interface CurrentUser {
  fullname?: string;
  username?: string;
  role?: string;
  school_id?: number;
}

// =====================================================
// DESIGN COLOURS
// =====================================================

const COLORS = {
  navy: "#163568",
  blue: "#2864D7",
  background: "#F4F7FB",
  white: "#FFFFFF",
  text: "#1D2939",
  muted: "#667085",
  border: "#E4EAF2",
  green: "#16845B",
  orange: "#C77716",
  red: "#D14343",
  purple: "#7555C9",
};

// =====================================================
// STATISTIC CARD
// =====================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
  description?: string;
}

function StatCard({
  title,
  value,
  icon,
  accent,
  description,
}: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        minWidth: 0,
        minHeight: 145,
        height: "100%",
        boxSizing: "border-box",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 3,
        backgroundColor: COLORS.white,
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(22,53,104,0.08)",
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={1.5}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: COLORS.muted,
              fontWeight: 500,
              lineHeight: 1.5,
              mb: 1.5,
              overflowWrap: "normal",
              wordBreak: "normal",
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: COLORS.text,
              fontSize: { xs: "1.4rem", md: "1.7rem" },
              fontWeight: 750,
              lineHeight: 1.35,
              overflowWrap: "anywhere",
            }}
          >
            {value}
          </Typography>

          {description && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: COLORS.muted,
                mt: 1,
                lineHeight: 1.5,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2.5,
            color: accent,
            backgroundColor: `${accent}14`,
            "& .MuiSvgIcon-root": { fontSize: 24 },
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

// =====================================================
// DASHBOARD
// =====================================================

function Dashboard() {
  const [currentUser, setCurrentUser] = useState<CurrentUser>({});

  const [dashboard, setDashboard] = useState<DashboardData>({
    totalStudents: 0,
    totalInstructors: 0,
    totalVehicles: 0,
    totalLessons: 0,
    todayLessons: 0,
    bookedLessons: 0,
    completedLessons: 0,
    cancelledLessons: 0,
    upcomingLessons: 0,
    monthlyIncome: 0,
    outstandingBalance: 0,
  });

  const [todaysLessons, setTodaysLessons] =
    useState<TodaysLesson[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // READ LOGGED-IN USER

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser) as CurrentUser);
      }
    } catch (error) {
      console.error("Error reading logged-in user:", error);
    }
  }, []);

  const role = String(currentUser.role || "")
    .trim()
    .toLowerCase();

  const isRestrictedRole =
    role.includes("instructor") || role.includes("student");

  const displayName =
    currentUser.fullname?.trim() ||
    currentUser.username?.trim() ||
    "there";

  // LOAD DASHBOARD DATA

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [dashboardData, lessonData] = await Promise.all([
        getDashboard(),
        getTodaysLessons(),
      ]);

      setDashboard(dashboardData);
      setTodaysLessons(lessonData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setErrorMessage(
        "We could not load the latest dashboard information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAllData();
  }, [loadAllData]);

  // FORMATTING

  const formatMoney = (amount: number) =>
    `R ${Number(amount || 0).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const today = new Date().toLocaleDateString("en-ZA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getStatusColor = (
    status: string
  ): "success" | "error" | "primary" | "warning" | "default" => {
    switch (String(status || "").trim().toLowerCase()) {
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      case "booked":
        return "primary";
      case "upcoming":
        return "warning";
      default:
        return "default";
    }
  };

  // STATISTICS

  const mainStats = [
    {
      title: "Total Students",
      value: dashboard.totalStudents,
      icon: <PeopleAltOutlinedIcon />,
      accent: COLORS.blue,
    },
    {
      title: "Instructors",
      value: dashboard.totalInstructors,
      icon: <SchoolOutlinedIcon />,
      accent: COLORS.purple,
    },
    {
      title: "Vehicles",
      value: dashboard.totalVehicles,
      icon: <DirectionsCarOutlinedIcon />,
      accent: COLORS.green,
    },
    {
      title: "Total Lessons",
      value: dashboard.totalLessons,
      icon: <CalendarMonthOutlinedIcon />,
      accent: COLORS.orange,
    },
  ];

  const lessonStats = [
    {
      title: "Today's Lessons",
      value: dashboard.todayLessons,
      icon: <EventAvailableOutlinedIcon />,
      accent: COLORS.blue,
    },
    {
      title: "Booked Lessons",
      value: dashboard.bookedLessons,
      icon: <CalendarMonthOutlinedIcon />,
      accent: COLORS.purple,
    },
    {
      title: "Completed",
      value: dashboard.completedLessons,
      icon: <CheckCircleOutlineIcon />,
      accent: COLORS.green,
    },
    {
      title: "Cancelled",
      value: dashboard.cancelledLessons,
      icon: <CancelOutlinedIcon />,
      accent: COLORS.red,
    },
    {
      title: "Upcoming",
      value: dashboard.upcomingLessons,
      icon: <UpcomingOutlinedIcon />,
      accent: COLORS.orange,
    },
  ];

  const headingSx = {
    color: COLORS.navy,
    fontWeight: 700,
    lineHeight: 1.4,
    mb: 2,
  };

  // PAGE

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: COLORS.background,
      }}
    >
      <Sidebar />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header title="DrivePro-SA Dashboard" />

        <Box
          component="main"
          sx={{
            p: { xs: 2, sm: 3, lg: 4 },
            width: "100%",
            maxWidth: 1800,
            mx: "auto",
            boxSizing: "border-box",
          }}
        >
          {/* WELCOME SECTION */}

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: "space-between",
              gap: 2,
              mb: 4,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                alignItems="flex-start"
                spacing={1}
                sx={{ mb: 1 }}
              >
                <DashboardIcon
                  sx={{
                    color: COLORS.blue,
                    fontSize: 29,
                    flexShrink: 0,
                    mt: 0.5,
                  }}
                />

                <Typography
                  variant="h4"
                  sx={{
                    color: COLORS.navy,
                    fontWeight: 750,
                    fontSize: {
                      xs: "1.55rem",
                      sm: "1.8rem",
                      lg: "2rem",
                    },
                    lineHeight: 1.3,
                    overflowWrap: "anywhere",
                  }}
                >
                  Welcome, {displayName}
                </Typography>
              </Stack>

              <Typography
                sx={{ color: COLORS.muted, mb: 1, lineHeight: 1.6 }}
              >
                Here is an overview of your driving school.
              </Typography>

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <CalendarMonthOutlinedIcon
                  sx={{ fontSize: 18, color: COLORS.blue }}
                />

                <Typography variant="body2" sx={{ color: COLORS.muted }}>
                  {today}
                </Typography>
              </Stack>
            </Box>

            <Button
              variant="outlined"
              startIcon={
                loading ? (
                  <CircularProgress size={17} />
                ) : (
                  <RefreshIcon />
                )
              }
              onClick={() => void loadAllData()}
              disabled={loading}
              sx={{
                alignSelf: { xs: "flex-start", md: "center" },
                flexShrink: 0,
                borderColor: COLORS.border,
                color: COLORS.navy,
                backgroundColor: COLORS.white,
                borderRadius: 2,
                px: 2.5,
                py: 1,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  borderColor: COLORS.blue,
                  backgroundColor: "#EEF4FF",
                },
              }}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </Box>

          {/* ERROR MESSAGE */}

          {errorMessage && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                border: "1px solid #F1B6B6",
                borderRadius: 2,
                backgroundColor: "#FFF5F5",
              }}
            >
              <Typography color="error">{errorMessage}</Typography>

              <Button
                size="small"
                onClick={() => void loadAllData()}
                sx={{ mt: 1, textTransform: "none" }}
              >
                Try again
              </Button>
            </Paper>
          )}

          {/* SCHOOL OVERVIEW */}

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={headingSx}>
              School Overview
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(4, minmax(0, 1fr))",
                },
                gap: 2,
                alignItems: "stretch",
              }}
            >
              {mainStats.map((stat) => (
                <Box key={stat.title} sx={{ minWidth: 0 }}>
                  <StatCard {...stat} />
                </Box>
              ))}
            </Box>
          </Box>

          {/* LESSON STATISTICS */}

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={headingSx}>
              Lesson Statistics
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                  xl: "repeat(3, minmax(0, 1fr))",
                  "@media (min-width:1600px)": {
                    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                  },
                },
                gap: 2,
                alignItems: "stretch",
              }}
            >
              {lessonStats.map((stat) => (
                <Box key={stat.title} sx={{ minWidth: 0 }}>
                  <StatCard {...stat} />
                </Box>
              ))}
            </Box>
          </Box>

          {/* FINANCIAL OVERVIEW */}

          {!isRestrictedRole && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={headingSx}>
                Financial Overview
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    md: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 2,
                  alignItems: "stretch",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <StatCard
                    title="Monthly Income"
                    value={formatMoney(dashboard.monthlyIncome)}
                    icon={<PaymentsOutlinedIcon />}
                    accent={COLORS.green}
                    description="Income recorded for the month"
                  />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <StatCard
                    title="Outstanding Balance"
                    value={formatMoney(dashboard.outstandingBalance)}
                    icon={<AccountBalanceWalletOutlinedIcon />}
                    accent={COLORS.orange}
                    description="Payments still outstanding"
                  />
                </Box>
              </Box>
            </Box>
          )}

          {/* TODAY'S LESSONS AND QUICK ACTIONS */}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                lg: "minmax(0, 1.8fr) minmax(260px, 1fr)",
              },
              gap: 3,
              alignItems: "start",
            }}
          >
            {/* TODAY'S LESSONS */}

            <Paper
              elevation={0}
              sx={{
                minWidth: 0,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 3,
                overflow: "hidden",
                backgroundColor: COLORS.white,
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{ minWidth: 0 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 42,
                      height: 42,
                      flexShrink: 0,
                      borderRadius: 2,
                      color: COLORS.blue,
                      backgroundColor: "#EEF4FF",
                    }}
                  >
                    <AccessTimeOutlinedIcon />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: COLORS.navy,
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        lineHeight: 1.4,
                      }}
                    >
                      Today's Lessons
                    </Typography>

                    <Typography variant="caption" sx={{ color: COLORS.muted }}>
                      Scheduled driving sessions
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  label={todaysLessons.length}
                  size="small"
                  sx={{
                    flexShrink: 0,
                    color: COLORS.blue,
                    backgroundColor: "#EEF4FF",
                    fontWeight: 700,
                  }}
                />
              </Box>

              <Divider sx={{ borderColor: COLORS.border }} />

              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <Table
                  size="small"
                  sx={{
                    width: "100%",
                    minWidth: 650,
                    tableLayout: "auto",
                    "& .MuiTableCell-root": {
                      borderColor: COLORS.border,
                      py: 1.5,
                      px: 1.5,
                    },
                  }}
                >
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#F8FAFD" }}>
                      {["Time", "Student", "Instructor", "Vehicle", "Status"].map(
                        (heading) => (
                          <TableCell key={heading}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: COLORS.muted,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: 0.3,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {heading}
                            </Typography>
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {todaysLessons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <CalendarMonthOutlinedIcon
                            sx={{ fontSize: 36, color: "#98A2B3", mb: 1 }}
                          />

                          <Typography
                            sx={{ color: COLORS.text, fontWeight: 600 }}
                          >
                            No lessons scheduled
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{ color: COLORS.muted, mt: 0.5 }}
                          >
                            Today's lessons will appear here.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      todaysLessons.map((lesson, index) => (
                        <TableRow
                          key={`${lesson.student}-${lesson.lesson_time}-${index}`}
                          hover
                        >
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            <Typography
                              variant="body2"
                              sx={{ color: COLORS.text, fontWeight: 600 }}
                            >
                              {lesson.lesson_time || "—"}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {lesson.student || "—"}
                          </TableCell>

                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {lesson.instructor || "—"}
                          </TableCell>

                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {lesson.vehicle || "—"}
                          </TableCell>

                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            <Chip
                              label={lesson.status || "Unknown"}
                              color={getStatusColor(lesson.status)}
                              size="small"
                              variant="outlined"
                              sx={{
                                "& .MuiChip-label": { whiteSpace: "nowrap" },
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Paper>

            {/* QUICK ACTIONS */}

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                minWidth: 0,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 3,
                backgroundColor: COLORS.white,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ mb: 2.5 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 42,
                    height: 42,
                    flexShrink: 0,
                    borderRadius: 2,
                    color: COLORS.orange,
                    backgroundColor: "#FFF5E8",
                  }}
                >
                  <BoltOutlinedIcon />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: COLORS.navy,
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      lineHeight: 1.4,
                    }}
                  >
                    Quick Actions
                  </Typography>

                  <Typography variant="caption" sx={{ color: COLORS.muted }}>
                    Common tasks
                  </Typography>
                </Box>
              </Stack>

              <QuickActions />
            </Paper>
          </Box>

          {/* FOOTER */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 4,
              pb: 1,
              textAlign: "center",
            }}
          >
            <Typography variant="caption" sx={{ color: COLORS.muted }}>
              DrivePro-SA · Driving School Management
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
