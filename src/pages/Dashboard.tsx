import { useEffect, useState } from "react";

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
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";

import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import DashboardCard from "../Components/DashboardCard";
import QuickActions from "../Components/QuickActions";

import {
  getDashboard,
  getTodaysLessons,
} from "../services/dashboardService";

// ==========================================
// DASHBOARD DATA
// ==========================================

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

// ==========================================
// TODAY'S LESSON
// ==========================================

interface TodaysLesson {
  student: string;
  instructor: string;
  vehicle: string;
  lesson_time: string;
  status: string;
}

// ==========================================
// DASHBOARD
// ==========================================

function Dashboard() {
  // ==========================================
  // DASHBOARD STATE
  // ==========================================

  const [dashboard, setDashboard] =
    useState<DashboardData>({
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

  // ==========================================
  // TODAY'S LESSONS
  // ==========================================

  const [todaysLessons, setTodaysLessons] =
    useState<TodaysLesson[]>([]);

  // ==========================================
  // LOADING
  // ==========================================

  const [loading, setLoading] =
    useState(false);

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  const loadDashboard = async () => {
    try {
      const data = await getDashboard();

      setDashboard(data);
    } catch (error) {
      console.error(
        "Error loading dashboard:",
        error
      );
    }
  };

  // ==========================================
  // LOAD TODAY'S LESSONS
  // ==========================================

  const loadTodaysLessons = async () => {
    try {
      const data =
        await getTodaysLessons();

      setTodaysLessons(data);
    } catch (error) {
      console.error(
        "Error loading today's lessons:",
        error
      );
    }
  };

  // ==========================================
  // LOAD ALL DATA
  // ==========================================

  const loadAllData = async () => {
    setLoading(true);

    try {
      await Promise.all([
        loadDashboard(),
        loadTodaysLessons(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD WHEN DASHBOARD OPENS
  // ==========================================

  useEffect(() => {
    loadAllData();
  }, []);

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatMoney = (
    amount: number
  ) => {
    return `R ${Number(
      amount || 0
    ).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ==========================================
  // TODAY'S DATE
  // ==========================================

  const today =
    new Date().toLocaleDateString(
      "en-ZA",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

  // ==========================================
  // STATUS COLOUR
  // ==========================================

  const getStatusColor = (
    status: string
  ) => {
    switch (
      status.toLowerCase()
    ) {
      case "completed":
        return "success";

      case "cancelled":
        return "error";

      case "booked":
        return "primary";

      default:
        return "default";
    }
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f4f6f9",
      }}
    >
      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN AREA */}

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* HEADER */}

        <Header
          title="DrivePro-SA Dashboard"
        />

        {/* CONTENT */}

        <Box
          sx={{
            p: {
              xs: 2,
              md: 4,
            },
          }}
        >
          {/* =================================
              WELCOME
          ================================== */}

          <Box
            sx={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: {
                xs: "flex-start",
                md: "center",
              },
              flexDirection: {
                xs: "column",
                md: "row",
              },
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight="bold"
              >
                Welcome Back 👋
              </Typography>

              <Typography
                sx={{
                  color: "#666",
                  mt: 1,
                }}
              >
                Here is an overview of
                your driving school.
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#888",
                  mt: 1,
                }}
              >
                📅 {today}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={
                loading ? (
                  <CircularProgress
                    size={18}
                  />
                ) : (
                  <RefreshIcon />
                )
              }
              onClick={loadAllData}
              disabled={loading}
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </Button>
          </Box>

          {/* =================================
              MAIN DASHBOARD CARDS
          ================================== */}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            <DashboardCard
              title="👨‍🎓 Total Students"
              value={
                dashboard.totalStudents
              }
            />

            <DashboardCard
              title="👨‍🏫 Instructors"
              value={
                dashboard.totalInstructors
              }
            />

            <DashboardCard
              title="🚗 Vehicles"
              value={
                dashboard.totalVehicles
              }
            />

            <DashboardCard
              title="📅 Total Lessons"
              value={
                dashboard.totalLessons
              }
            />
          </Box>

          {/* =================================
              LESSON STATISTICS
          ================================== */}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(5, 1fr)",
              },
              gap: 2,
              mt: 3,
            }}
          >
            <DashboardCard
              title="📆 Today's Lessons"
              value={
                dashboard.todayLessons
              }
            />

            <DashboardCard
              title="📌 Booked Lessons"
              value={
                dashboard.bookedLessons
              }
            />

            <DashboardCard
              title="✅ Completed Lessons"
              value={
                dashboard.completedLessons
              }
            />

            <DashboardCard
              title="❌ Cancelled Lessons"
              value={
                dashboard.cancelledLessons
              }
            />

            <DashboardCard
              title="🔜 Upcoming Lessons"
              value={
                dashboard.upcomingLessons
              }
            />
          </Box>

          {/* =================================
              FINANCIAL STATISTICS
          ================================== */}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
              },
              gap: 2,
              mt: 3,
            }}
          >
            <DashboardCard
              title="💰 Monthly Income"
              value={formatMoney(
                dashboard.monthlyIncome
              )}
            />

            <DashboardCard
              title="💳 Outstanding Balance"
              value={formatMoney(
                dashboard.outstandingBalance
              )}
            />
          </Box>

          {/* =================================
              LOWER SECTION
          ================================== */}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "2fr 1fr",
              },
              gap: 3,
              mt: 4,
            }}
          >
            {/* =================================
                TODAY'S LESSONS
            ================================== */}

            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight="bold"
                >
                  📅 Today's Lessons
                </Typography>

                <Chip
                  label={`${todaysLessons.length} Lesson${
                    todaysLessons.length ===
                    1
                      ? ""
                      : "s"
                  }`}
                  color="primary"
                  size="small"
                />
              </Box>

              <Box
                sx={{
                  overflowX: "auto",
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>
                          Time
                        </strong>
                      </TableCell>

                      <TableCell>
                        <strong>
                          Student
                        </strong>
                      </TableCell>

                      <TableCell>
                        <strong>
                          Instructor
                        </strong>
                      </TableCell>

                      <TableCell>
                        <strong>
                          Vehicle
                        </strong>
                      </TableCell>

                      <TableCell>
                        <strong>
                          Status
                        </strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {todaysLessons.length ===
                    0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          align="center"
                          sx={{
                            py: 5,
                          }}
                        >
                          <Typography
                            color="text.secondary"
                          >
                            📅 No lessons
                            scheduled
                            for today.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      todaysLessons.map(
                        (
                          lesson,
                          index
                        ) => (
                          <TableRow
                            key={`${lesson.student}-${lesson.lesson_time}-${index}`}
                            hover
                          >
                            <TableCell>
                              <strong>
                                {
                                  lesson.lesson_time
                                }
                              </strong>
                            </TableCell>

                            <TableCell>
                              {
                                lesson.student
                              }
                            </TableCell>

                            <TableCell>
                              {
                                lesson.instructor
                              }
                            </TableCell>

                            <TableCell>
                              {
                                lesson.vehicle
                              }
                            </TableCell>

                            <TableCell>
                              <Chip
                                label={
                                  lesson.status
                                }
                                color={
                                  getStatusColor(
                                    lesson.status
                                  )
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        )
                      )
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Paper>

            {/* =================================
                QUICK ACTIONS
            ================================== */}

            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ mb: 2 }}
              >
                ⚡ Quick Actions
              </Typography>

              <QuickActions />
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
