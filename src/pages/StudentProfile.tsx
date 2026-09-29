import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  Typography,
} from "@mui/material";

import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import api from "../services/api";

// =====================================================
// STUDENT PROFILE
// =====================================================

interface StudentProfileData {
  id?: number;
  studentNo?: number | string;
  fullname?: string;
  idNumber?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  learnerNumber?: number | string;
  learnerCode?: string;
  learnerStatus?: string;
  licenceCode?: string;
  licenceStatus?: string;
  instructor?: string;
  vehicle?: string;
  courseFee?: number;
  amountPaid?: number;
  balance?: number;
  status?: string;
}

// =====================================================
// MONEY
// =====================================================

const formatMoney = (
  value?: number
) => {
  return `R${Number(
    value || 0
  ).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// =====================================================
// PAGE
// =====================================================

export default function StudentProfile() {
  const [student, setStudent] =
    useState<StudentProfileData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ===================================================
  // LOAD PROFILE
  // ===================================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/me");

      const profile =
        response.data?.profile ||
        response.data?.student ||
        response.data;

      setStudent(
        profile || null
      );
    } catch (err) {
      console.error(
        "STUDENT PROFILE ERROR:",
        err
      );

      setError(
        "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
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
          title="My Profile"
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
                👤 My Profile
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
              ) : !student ? (
                <Typography>
                  Student profile not found.
                </Typography>
              ) : (
                <Grid
                  container
                  spacing={3}
                >
                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <Typography>
                      <strong>
                        Full Name:
                      </strong>{" "}
                      {student.fullname ||
                        "-"}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <Typography>
                      <strong>
                        Student Number:
                      </strong>{" "}
                      {student.studentNo ||
                        "-"}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <Typography>
                      <strong>
                        ID Number:
                      </strong>{" "}
                      {student.idNumber ||
                        "-"}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <Typography>
                      <strong>
                        Gender:
                      </strong>{" "}
                      {student.gender ||
                        "-"}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <Typography>
                      <strong>
                        Phone:
                      </strong>{" "}
                      {student.phone ||
                        "-"}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <Typography>
                      <strong>
                        Email:
                      </strong>{" "}
                      {student.email ||
                        "-"}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography>
                      <strong>
                        Address:
                      </strong>{" "}
                      {student.address ||
                        "-"}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <Typography>
                      <strong>
                        Learner Number:
                      </strong>{" "}
                      {student.learnerNumber ||
                        "-"}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <Typography>
                      <strong>
                        Learner Code:
                      </strong>{" "}
                      {student.learnerCode ||
                        "-"}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <Typography>
                      <strong>
                        Licence Code:
                      </strong>{" "}
                      {student.licenceCode ||
                        "-"}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <Typography>
                      <strong>
                        Licence Status:
                      </strong>{" "}
                      {student.licenceStatus ||
                        "-"}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <Typography>
                      <strong>
                        Instructor:
                      </strong>{" "}
                      {student.instructor ||
                        "-"}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <Typography>
                      <strong>
                        Vehicle:
                      </strong>{" "}
                      {student.vehicle ||
                        "-"}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <Card
                      variant="outlined"
                    >
                      <CardContent>
                        <Typography
                          color="text.secondary"
                        >
                          Course Fee
                        </Typography>

                        <Typography
                          variant="h6"
                          fontWeight="bold"
                        >
                          {formatMoney(
                            student.courseFee
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <Card
                      variant="outlined"
                    >
                      <CardContent>
                        <Typography
                          color="text.secondary"
                        >
                          Amount Paid
                        </Typography>

                        <Typography
                          variant="h6"
                          fontWeight="bold"
                        >
                          {formatMoney(
                            student.amountPaid
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <Card
                      variant="outlined"
                    >
                      <CardContent>
                        <Typography
                          color="text.secondary"
                        >
                          Balance
                        </Typography>

                        <Typography
                          variant="h6"
                          fontWeight="bold"
                        >
                          {formatMoney(
                            student.balance
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography>
                      <strong>
                        Status:
                      </strong>{" "}
                      <Chip
                        label={
                          student.status ||
                          "Active"
                        }
                        color="success"
                        size="small"
                      />
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}