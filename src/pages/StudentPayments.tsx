import { useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
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
import api from "../services/api";

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
// MONEY
// =====================================================

const formatMoney = (value?: number) => {
  return `R${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// =====================================================
// DATE
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
// PAGE
// =====================================================

export default function StudentPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ===================================================
  // LOAD PAYMENTS
  // ===================================================

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      // ===============================================
      // GET CURRENT STUDENT PROFILE
      // ===============================================

      const meResponse = await api.get("/me");

      const profile =
        meResponse.data?.profile ||
        meResponse.data?.student ||
        meResponse.data;

      // ===============================================
      // GET STUDENT ID
      // ===============================================

      const studentId = Number(profile?.id);

      if (!studentId) {
        setError("Student profile could not be found.");
        return;
      }

      // ===============================================
      // GET SCHOOL ID
      // ===============================================

      let schoolId = Number(profile?.school_id);

      // ===============================================
      // FALLBACK TO LOGGED-IN USER
      // ===============================================

      if (!schoolId) {
        try {
          const storedUser = localStorage.getItem("user");

          if (storedUser) {
            const user = JSON.parse(storedUser);

            schoolId = Number(user?.school_id);
          }
        } catch (userError) {
          console.error(
            "ERROR READING STORED USER:",
            userError
          );
        }
      }

      // ===============================================
      // VALIDATE SCHOOL
      // ===============================================

      if (!schoolId) {
        setError("School information could not be found.");
        return;
      }

      console.log("LOADING STUDENT PAYMENTS:", {
        studentId,
        schoolId,
      });

      // ===============================================
      // GET PAYMENTS
      // ===============================================

      const response = await api.get(
        `/payments/student/${studentId}`,
        {
          params: {
            school_id: schoolId,
          },
        }
      );

      console.log(
        "STUDENT PAYMENTS RESPONSE:",
        response.data
      );

      // ===============================================
      // SAVE PAYMENTS
      // ===============================================

      setPayments(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "STUDENT PAYMENTS ERROR:",
        err
      );

      setError("Unable to load your payments.");
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // LOAD WHEN PAGE OPENS
  // ===================================================

  useEffect(() => {
    loadPayments();
  }, []);

  // ===================================================
  // TOTAL PAID
  // ===================================================

  const totalPaid = payments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0
  );

  // ===================================================
  // PAGE
  // ===================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f4f6f9",
      }}
    >
      {/* ===========================================
          HEADER
      ============================================ */}

      <Header title="My Payments" />

      {/* ===========================================
          CONTENT
      ============================================ */}

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
            {/* =====================================
                TITLE
            ====================================== */}

            <Typography
              variant="h5"
              fontWeight="bold"
            >
              💳 My Payments
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 1,
              }}
            >
              View your payment history.
            </Typography>

            <Divider
              sx={{
                my: 3,
              }}
            />

            {/* =====================================
                TOTAL PAID
            ====================================== */}

            <Card
              variant="outlined"
              sx={{
                mb: 3,
                maxWidth: 350,
              }}
            >
              <CardContent>
                <Typography color="text.secondary">
                  Total Paid
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight="bold"
                >
                  {formatMoney(totalPaid)}
                </Typography>
              </CardContent>
            </Card>

            {/* =====================================
                LOADING
            ====================================== */}

            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  p: 5,
                }}
              >
                <CircularProgress />
              </Box>
            ) : error ? (
              /* ===================================
                 ERROR
              ==================================== */

              <Typography color="error">
                {error}
              </Typography>
            ) : payments.length === 0 ? (
              /* ===================================
                 NO PAYMENTS
              ==================================== */

              <Typography
                color="text.secondary"
                sx={{
                  py: 4,
                }}
              >
                No payments found.
              </Typography>
            ) : (
              /* ===================================
                 PAYMENT TABLE
              ==================================== */

              <TableContainer
                component={Paper}
                elevation={0}
              >
                <Table>
                  {/* =================================
                      TABLE HEADER
                  ================================== */}

                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Date</strong>
                      </TableCell>

                      <TableCell>
                        <strong>Receipt</strong>
                      </TableCell>

                      <TableCell>
                        <strong>Method</strong>
                      </TableCell>

                      <TableCell>
                        <strong>Reference</strong>
                      </TableCell>

                      <TableCell align="right">
                        <strong>Amount</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  {/* =================================
                      TABLE BODY
                  ================================== */}

                  <TableBody>
                    {payments.map(
                      (payment, index) => (
                        <TableRow
                          key={
                            payment.id ??
                            index
                          }
                        >
                          {/* DATE */}

                          <TableCell>
                            {formatDate(
                              payment.paymentDate
                            )}
                          </TableCell>

                          {/* RECEIPT */}

                          <TableCell>
                            {payment.receiptNo ||
                              "-"}
                          </TableCell>

                          {/* METHOD */}

                          <TableCell>
                            {payment.paymentMethod ||
                              "-"}
                          </TableCell>

                          {/* REFERENCE */}

                          <TableCell>
                            {payment.reference ||
                              "-"}
                          </TableCell>

                          {/* AMOUNT */}

                          <TableCell align="right">
                            <strong>
                              {formatMoney(
                                payment.amount
                              )}
                            </strong>
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
  );
}