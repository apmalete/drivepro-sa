import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
  Chip,
  Divider,
  Button,
} from "@mui/material";

import Header from "../Components/Header";
import api from "../services/api";
import { getLessons, type Lesson } from "../services/lessonService";

// =====================================================
// STUDENT PROFILE
// =====================================================

interface StudentProfile {
  id?: number;
  studentNo?: number | string;
  fullname?: string;
  idNumber?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  learnerNumber?: number | string;
  licenceCode?: string;
  licenceStatus?: string;
  instructor?: string;
  vehicle?: string;
  courseFee?: number;
  amountPaid?: number;
  balance?: number;
  status?: string;
  school_id?: number;
  learnerStatus?: string;
  learnerCode?: string;
}

// =====================================================
// TEST BOOKING
// =====================================================

interface TestBooking {
  id?: number;
  student_id?: number;
  student_name?: string;
  test_type?: string;
  booking_date?: string;
  booking_time?: string;
  test_centre?: string;
  booking_reference?: string;
  status?: string;
}

// =====================================================
// PAYMENT
// =====================================================

interface Payment {
  id?: number;
  receiptNo?: string;
  studentId?: number;
  studentName?: string;
  paymentDate?: string;
  paymentMethod?: string;
  amount?: number;
  reference?: string;
  notes?: string;
}

// =====================================================
// HELPERS
// =====================================================

const formatMoney = (value: number | undefined) => {
  return `R${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

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
// COMPONENT
// =====================================================

export default function StudentDashboard() {
  const [student, setStudent] =
    useState<StudentProfile | null>(null);

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [testBookings, setTestBookings] =
    useState<TestBooking[]>([]);

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ===================================================
  // RETURN TO LOGIN / LOGOUT
  // ===================================================

  const handleBackToLogin = () => {
    // Remove authentication information
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedIn");

    // Clear any session information
    sessionStorage.clear();

    // Return to DrivePro-SA login page
    window.location.href = "/";
  };

  // ===================================================
  // LOAD STUDENT INFORMATION
  // ===================================================

  const loadStudentDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // -----------------------------------------------
      // GET LOGGED-IN STUDENT PROFILE
      // -----------------------------------------------

      const meResponse =
        await api.get("/me");

      const profile =
        meResponse.data?.profile ||
        meResponse.data?.student ||
        meResponse.data;

      setStudent(profile || null);

      // -----------------------------------------------
      // GET STUDENT LESSONS
      // -----------------------------------------------

      try {
        const lessonData =
          await getLessons();

        setLessons(
          Array.isArray(lessonData)
            ? lessonData
            : []
        );
      } catch (lessonError) {
        console.error(
          "STUDENT LESSON ERROR:",
          lessonError
        );

        setLessons([]);
      }

      // -----------------------------------------------
      // STUDENT ID
      // -----------------------------------------------

      const studentId =
        Number(profile?.id);

      // -----------------------------------------------
      // GET TEST BOOKINGS
      // -----------------------------------------------

      if (studentId) {
        try {
          const testResponse =
            await api.get(
              `/test-bookings/student/${studentId}`
            );

          setTestBookings(
            Array.isArray(testResponse.data)
              ? testResponse.data
              : []
          );
        } catch (testError) {
          console.error(
            "STUDENT TEST ERROR:",
            testError
          );

          setTestBookings([]);
        }

        // ---------------------------------------------
        // GET PAYMENTS
        // ---------------------------------------------

        try {
          const paymentResponse =
            await api.get(
              `/payments/student/${studentId}`
            );

          setPayments(
            Array.isArray(paymentResponse.data)
              ? paymentResponse.data
              : []
          );
        } catch (paymentError) {
          console.error(
            "STUDENT PAYMENT ERROR:",
            paymentError
          );

          setPayments([]);
        }
      }
    } catch (err) {
      console.error(
        "STUDENT DASHBOARD ERROR:",
        err
      );

      setError(
        "Unable to load your student information."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // LOAD ON START
  // ===================================================

  useEffect(() => {
    loadStudentDashboard();
  }, []);

  // ===================================================
  // LESSON STATISTICS
  // ===================================================

  const completedLessons =
    useMemo(
      () =>
        lessons.filter(
          (lesson) =>
            String(
              lesson.status || ""
            ).toLowerCase() ===
            "completed"
        ),
      [lessons]
    );

  const cancelledLessons =
    useMemo(
      () =>
        lessons.filter(
          (lesson) =>
            String(
              lesson.status || ""
            ).toLowerCase() ===
            "cancelled"
        ),
      [lessons]
    );

  // ===================================================
  // UPCOMING LESSONS
  // ===================================================

  const upcomingLessons =
    useMemo(() => {
      const now = new Date();

      return lessons
        .filter((lesson) => {
          if (
            String(
              lesson.status || ""
            ).toLowerCase() ===
            "cancelled"
          ) {
            return false;
          }

          const dateTime = new Date(
            `${lesson.lesson_date}T${lesson.lesson_time || "00:00"}`
          );

          return dateTime >= now;
        })
        .sort((a, b) => {
          const dateA = new Date(
            `${a.lesson_date}T${a.lesson_time || "00:00"}`
          ).getTime();

          const dateB = new Date(
            `${b.lesson_date}T${b.lesson_time || "00:00"}`
          ).getTime();

          return dateA - dateB;
        });
    }, [lessons]);

  const nextLesson =
    upcomingLessons[0];

  // ===================================================
  // PAYMENT TOTAL
  // ===================================================

  const paymentTotal =
    payments.reduce(
      (total, payment) =>
        total +
        Number(payment.amount || 0),
      0
    );

  const courseFee =
    Number(
      student?.courseFee || 0
    );

  const amountPaid =
    Number(
      student?.amountPaid ||
        paymentTotal ||
        0
    );

  const balance =
    Number(
      student?.balance ??
        Math.max(
          courseFee - amountPaid,
          0
        )
    );

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "#f5f7fb",
        }}
      >
        <Header title="Student Dashboard" />

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "#f5f7fb",
        }}
      >
        <Header title="Student Dashboard" />

        <Box sx={{ p: 4 }}>
          <Card>
            <CardContent>
              <Typography
                color="error"
                variant="h6"
              >
                {error}
              </Typography>

              <Button
                sx={{ mt: 2 }}
                variant="contained"
                onClick={loadStudentDashboard}
              >
                Try Again
              </Button>

              {/* BACK TO LOGIN */}

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleBackToLogin}
                  sx={{
                    minWidth: 240,
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                >
                  Take me back to login page
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  // ===================================================
  // DASHBOARD
  // ===================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f5f7fb",
      }}
    >
      <Header title="Student Dashboard" />

      <Box
        sx={{
          p: {
            xs: 2,
            md: 4,
          },
        }}
      >
        {/* ============================================
            WELCOME
        ============================================= */}

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#374151",
            }}
          >
            Welcome Back{" "}
            {student?.fullname || "Student"} 👋
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "#6b7280",
            }}
          >
            Here is your personal
            driving-school overview.
          </Typography>
        </Box>

        {/* ============================================
            SUMMARY CARDS
        ============================================= */}

        <Grid
          container
          spacing={2}
          sx={{ mb: 3 }}
        >
          {/* UPCOMING */}

          <Grid
            size={{ xs: 12, sm: 6, md: 3 }}
          >
            <Card
              sx={{
                height: "100%",
                borderTop:
                  "5px solid #2563eb",
              }}
            >
              <CardContent>
                <Typography
                  color="text.secondary"
                >
                  📅 Upcoming Lessons
                </Typography>

                <Typography
                  variant="h3"
                  sx={{
                    mt: 1,
                    fontWeight: 700,
                    color: "#2563eb",
                  }}
                >
                  {upcomingLessons.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* COMPLETED */}

          <Grid
            size={{ xs: 12, sm: 6, md: 3 }}
          >
            <Card
              sx={{
                height: "100%",
                borderTop:
                  "5px solid #16a34a",
              }}
            >
              <CardContent>
                <Typography
                  color="text.secondary"
                >
                  ✅ Completed Lessons
                </Typography>

                <Typography
                  variant="h3"
                  sx={{
                    mt: 1,
                    fontWeight: 700,
                    color: "#16a34a",
                  }}
                >
                  {completedLessons.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* CANCELLED */}

          <Grid
            size={{ xs: 12, sm: 6, md: 3 }}
          >
            <Card
              sx={{
                height: "100%",
                borderTop:
                  "5px solid #dc2626",
              }}
            >
              <CardContent>
                <Typography
                  color="text.secondary"
                >
                  ❌ Cancelled Lessons
                </Typography>

                <Typography
                  variant="h3"
                  sx={{
                    mt: 1,
                    fontWeight: 700,
                    color: "#dc2626",
                  }}
                >
                  {cancelledLessons.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* BALANCE */}

          <Grid
            size={{ xs: 12, sm: 6, md: 3 }}
          >
            <Card
              sx={{
                height: "100%",
                borderTop:
                  "5px solid #7c3aed",
              }}
            >
              <CardContent>
                <Typography
                  color="text.secondary"
                >
                  💰 Outstanding Balance
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    mt: 2,
                    fontWeight: 700,
                    color: "#7c3aed",
                  }}
                >
                  {formatMoney(balance)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ============================================
            PROFILE + NEXT LESSON
        ============================================= */}

        <Grid
          container
          spacing={3}
        >
          {/* PROFILE */}

          <Grid
            size={{ xs: 12, md: 5 }}
          >
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  👤 My Profile
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Typography>
                  <strong>Name:</strong>{" "}
                  {student?.fullname || "-"}
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  <strong>Phone:</strong>{" "}
                  {student?.phone || "-"}
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  <strong>Email:</strong>{" "}
                  {student?.email || "-"}
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  <strong>Licence Code:</strong>{" "}
                  {student?.licenceCode ||
                    student?.learnerCode ||
                    "-"}
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  <strong>Instructor:</strong>{" "}
                  {student?.instructor || "-"}
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  <strong>Vehicle:</strong>{" "}
                  {student?.vehicle || "-"}
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  <strong>Status:</strong>{" "}
                  <Chip
                    label={
                      student?.status ||
                      "Active"
                    }
                    size="small"
                    color="success"
                  />
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* NEXT LESSON */}

          <Grid
            size={{ xs: 12, md: 7 }}
          >
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  📅 My Next Lesson
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {nextLesson ? (
                  <>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: "#1e3a8a",
                      }}
                    >
                      {formatDate(
                        nextLesson.lesson_date
                      )}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: "18px",
                      }}
                    >
                      🕐{" "}
                      {nextLesson.lesson_time ||
                        "-"}
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      👨‍🏫 Instructor:{" "}
                      {nextLesson.instructor ||
                        "-"}
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      🚗 Vehicle:{" "}
                      {nextLesson.vehicle ||
                        "-"}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={
                          nextLesson.status ||
                          "Booked"
                        }
                        color="primary"
                      />
                    </Box>
                  </>
                ) : (
                  <Typography
                    color="text.secondary"
                  >
                    You currently have no
                    upcoming lessons.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* PAYMENT SUMMARY */}

          <Grid
            size={{ xs: 12, md: 6 }}
          >
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  💳 My Payments
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Typography>
                  Course Fee:{" "}
                  <strong>
                    {formatMoney(courseFee)}
                  </strong>
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  Amount Paid:{" "}
                  <strong>
                    {formatMoney(amountPaid)}
                  </strong>
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color:
                      balance > 0
                        ? "#dc2626"
                        : "#16a34a",
                    fontWeight: 700,
                  }}
                >
                  Balance:{" "}
                  {formatMoney(balance)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* TEST BOOKINGS */}

          <Grid
            size={{ xs: 12, md: 6 }}
          >
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  📝 My Test Bookings
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {testBookings.length === 0 ? (
                  <Typography
                    color="text.secondary"
                  >
                    No test bookings found.
                  </Typography>
                ) : (
                  testBookings
                    .slice(0, 3)
                    .map((test) => (
                      <Box
                        key={test.id}
                        sx={{
                          mb: 2,
                          p: 2,
                          background:
                            "#f8fafc",
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {test.test_type ||
                            "Driving Test"}
                        </Typography>

                        <Typography>
                          📅{" "}
                          {formatDate(
                            test.booking_date
                          )}
                        </Typography>

                        <Typography>
                          🕐{" "}
                          {test.booking_time ||
                            "-"}
                        </Typography>

                        <Typography>
                          📍{" "}
                          {test.test_centre ||
                            "-"}
                        </Typography>

                        <Chip
                          sx={{ mt: 1 }}
                          size="small"
                          label={
                            test.status ||
                            "Pending"
                          }
                        />
                      </Box>
                    ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* RECENT LESSONS */}

          <Grid
            size={{ xs: 12 }}
          >
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  📚 My Recent Lessons
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {lessons.length === 0 ? (
                  <Typography
                    color="text.secondary"
                  >
                    No lessons found.
                  </Typography>
                ) : (
                  lessons
                    .slice(0, 5)
                    .map((lesson) => (
                      <Box
                        key={lesson.id}
                        sx={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems: "center",
                          gap: 2,
                          py: 1.5,
                          borderBottom:
                            "1px solid #e5e7eb",
                          flexWrap: "wrap",
                        }}
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 600,
                            }}
                          >
                            {formatDate(
                              lesson.lesson_date
                            )}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {lesson.lesson_time}{" "}
                            •{" "}
                            {lesson.instructor}{" "}
                            •{" "}
                            {lesson.vehicle}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label={
                            lesson.status ||
                            "Booked"
                          }
                        />
                      </Box>
                    ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* ============================================
              BACK TO LOGIN
          ============================================= */}

          <Grid
            size={{ xs: 12 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 2,
                mb: 3,
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={handleBackToLogin}
                sx={{
                  minWidth: 240,
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: "none",
                  py: 1.2,
                }}
              >
                Take me back to login page
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}