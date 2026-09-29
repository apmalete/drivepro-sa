import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Divider,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import api from "../services/api";
import { getStudentLessons, type Lesson } from "../services/lessonService";

// =====================================================
// FORMAT DATE
// =====================================================

const formatDate = (value?: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// =====================================================
// STATUS COLOR
// =====================================================

const getStatusColor = (
  status?: string
):
  | "success"
  | "error"
  | "primary"
  | "warning"
  | "default" => {
  switch (
    String(status || "")
      .toLowerCase()
      .trim()
  ) {
    case "completed":
      return "success";

    case "cancelled":
      return "error";

    case "booked":
      return "primary";

    case "pending":
      return "warning";

    default:
      return "default";
  }
};

// =====================================================
// PAGE
// =====================================================

export default function StudentLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===================================================
  // LOAD STUDENT LESSONS
  // ===================================================

  const loadLessons = async () => {
    try {
      setLoading(true);
      setError("");

      // -----------------------------------------------
      // GET LOGGED-IN USER
      // -----------------------------------------------

      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        setError(
          "Student information could not be found."
        );
        return;
      }

      const user =
        JSON.parse(storedUser);

      // -----------------------------------------------
      // GET STUDENT PROFILE
      // -----------------------------------------------

      const meResponse =
        await api.get("/me");

      const profile =
        meResponse.data?.profile ||
        meResponse.data?.student ||
        meResponse.data;

      const studentName =
        profile?.fullname ||
        user?.fullname ||
        "";

      if (!studentName) {
        setError(
          "Student name could not be found."
        );
        return;
      }

      // -----------------------------------------------
      // GET ONLY THIS STUDENT'S LESSONS
      // -----------------------------------------------

      const data =
        await getStudentLessons(
          studentName
        );

      setLessons(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "STUDENT LESSONS ERROR:",
        err
      );

      setError(
        "Unable to load your lessons."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // LOAD WHEN PAGE OPENS
  // ===================================================

  useEffect(() => {
    loadLessons();
  }, []);

  // ===================================================
  // PAGE
  // ===================================================

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f4f6f9",
      }}
    >
      <Sidebar />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <Header
          title="My Lessons"
        />

        <Box
          sx={{
            p: {
              xs: 2,
              md: 4,
            },
          }}
        >
          <Card>
            <CardContent>
              <Typography
                variant="h5"
                fontWeight="bold"
              >
                📅 My Lessons
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                View your scheduled and completed
                driving lessons.
              </Typography>

              <Divider
                sx={{ my: 3 }}
              />

              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent:
                      "center",
                    p: 5,
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography
                  color="error"
                >
                  {error}
                </Typography>
              ) : lessons.length === 0 ? (
                <Typography
                  color="text.secondary"
                  sx={{ py: 4 }}
                >
                  You currently have no
                  lessons booked.
                </Typography>
              ) : (
                <TableContainer
                  component={Paper}
                  elevation={0}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>
                            Date
                          </strong>
                        </TableCell>

                        <TableCell>
                          <strong>
                            Time
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
                      {lessons.map(
                        (lesson) => (
                          <TableRow
                            key={
                              lesson.id
                            }
                          >
                            <TableCell>
                              {formatDate(
                                lesson.lesson_date
                              )}
                            </TableCell>

                            <TableCell>
                              {lesson.lesson_time ||
                                "-"}
                            </TableCell>

                            <TableCell>
                              {lesson.instructor ||
                                "-"}
                            </TableCell>

                            <TableCell>
                              {lesson.vehicle ||
                                "-"}
                            </TableCell>

                            <TableCell>
                              <Chip
                                label={
                                  lesson.status ||
                                  "Booked"
                                }
                                color={getStatusColor(
                                  lesson.status
                                )}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}