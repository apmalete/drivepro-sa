import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Divider,
  Typography,
  Grid,
} from "@mui/material";

import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import api from "../services/api";

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
// FORMAT DATE
// =====================================================

const formatDate = (
  value?: string
) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-ZA",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
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
    case "confirmed":
      return "success";

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

export default function StudentTestBookings() {
  const [bookings, setBookings] =
    useState<TestBooking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ===================================================
  // LOAD TEST BOOKINGS
  // ===================================================

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const meResponse =
        await api.get("/me");

      const profile =
        meResponse.data?.profile ||
        meResponse.data?.student ||
        meResponse.data;

      const studentId =
        Number(profile?.id);

      if (!studentId) {
        setError(
          "Student profile could not be found."
        );
        return;
      }

      const response =
        await api.get(
          `/test-bookings/student/${studentId}`
        );

      setBookings(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "STUDENT TEST BOOKING ERROR:",
        err
      );

      setError(
        "Unable to load your test bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // LOAD
  // ===================================================

  useEffect(() => {
    loadBookings();
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
          title="My Test Bookings"
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
                📝 My Test Bookings
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                View your learner's and
                driver's licence test bookings.
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
              ) : bookings.length === 0 ? (
                <Typography
                  color="text.secondary"
                  sx={{ py: 4 }}
                >
                  You currently have no
                  test bookings.
                </Typography>
              ) : (
                <Grid
                  container
                  spacing={2}
                >
                  {bookings.map(
                    (booking) => (
                      <Grid
                        key={
                          booking.id
                        }
                        size={{
                          xs: 12,
                          md: 6,
                        }}
                      >
                        <Card
                          variant="outlined"
                        >
                          <CardContent>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                            >
                              {booking.test_type ||
                                "Driving Test"}
                            </Typography>

                            <Divider
                              sx={{
                                my: 2,
                              }}
                            />

                            <Typography
                              sx={{
                                mb: 1,
                              }}
                            >
                              <strong>
                                Date:
                              </strong>{" "}
                              {formatDate(
                                booking.booking_date
                              )}
                            </Typography>

                            <Typography
                              sx={{
                                mb: 1,
                              }}
                            >
                              <strong>
                                Time:
                              </strong>{" "}
                              {booking.booking_time ||
                                "-"}
                            </Typography>

                            <Typography
                              sx={{
                                mb: 1,
                              }}
                            >
                              <strong>
                                Test Centre:
                              </strong>{" "}
                              {booking.test_centre ||
                                "-"}
                            </Typography>

                            <Typography
                              sx={{
                                mb: 1,
                              }}
                            >
                              <strong>
                                Reference:
                              </strong>{" "}
                              {booking.booking_reference ||
                                "-"}
                            </Typography>

                            <Chip
                              label={
                                booking.status ||
                                "Pending"
                              }
                              color={getStatusColor(
                                booking.status
                              )}
                              size="small"
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  )}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}