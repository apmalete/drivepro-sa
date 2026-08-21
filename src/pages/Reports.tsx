import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import PrintIcon from "@mui/icons-material/Print";

import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ==========================================
// REPORT TYPES
// ==========================================

interface PaymentMethodReport {
  paymentMethod: string;
  amount: number;
  count: number;
}

interface InstructorReport {
  instructor: string;
  totalLessons: number;
  completedLessons: number;
  bookedLessons: number;
  cancelledLessons: number;
}

interface VehicleReport {
  vehicle: string;
  totalLessons: number;
  completedLessons: number;
  bookedLessons: number;
  cancelledLessons: number;
}

interface FinancialReport {
  success: boolean;

  startDate: string;
  endDate: string;

  // Financial
  totalIncome: number;
  totalPayments: number;
  outstandingBalance: number;

  // Students
  totalStudents: number;
  newStudents: number;
  activeStudents: number;
  studentsWithBalance: number;

  // Lessons
  totalLessons: number;
  completedLessons: number;
  bookedLessons: number;
  cancelledLessons: number;

  // Breakdown
  paymentMethods: PaymentMethodReport[];
  instructors: InstructorReport[];
  vehicles: VehicleReport[];
}

// ==========================================
// LOCAL DATE FORMAT
// ==========================================

function getLocalDate(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ==========================================
// REPORTS PAGE
// ==========================================

export default function Reports() {
  // ========================================
  // TODAY
  // ========================================

  const today = new Date();

  const firstDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  // ========================================
  // STATE
  // ========================================

  const [startDate, setStartDate] =
    useState(
      getLocalDate(firstDay)
    );

  const [endDate, setEndDate] =
    useState(
      getLocalDate(today)
    );

  const [report, setReport] =
    useState<FinancialReport | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  // ========================================
  // LOAD REPORT
  // ========================================

  const loadReport = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setReport(null);

      // ======================================
      // VALIDATE DATES
      // ======================================

      if (!startDate || !endDate) {
        setErrorMessage(
          "Please select both a start date and an end date."
        );

        return;
      }

      if (startDate > endDate) {
        setErrorMessage(
          "Start date cannot be after the end date."
        );

        return;
      }

      console.log(
        "Loading financial report:",
        startDate,
        endDate
      );

      // ======================================
      // API
      // ======================================

    const userData =
  localStorage.getItem("user");

let schoolId = 1;

try {
  if (userData) {
    const user = JSON.parse(userData);

    schoolId =
      Number(user?.school_id) || 1;
  }
} catch (error) {
  console.error(
    "ERROR READING USER SCHOOL:",
    error
  );
}

const response =
  await axios.get<FinancialReport>(
    "http://localhost:5000/reports/financial",
    {
      params: {
        school_id: schoolId,
        startDate,
        endDate,
      },
    }
  );

      console.log(
        "Financial report response:",
        response.data
      );

      setReport(response.data);
    } catch (error: any) {
      console.error(
        "ERROR LOADING FINANCIAL REPORT:",
        error
      );

      const serverMessage =
        error?.response?.data?.message;

      const status =
        error?.response?.status;

      if (serverMessage) {
        setErrorMessage(
          `Server error ${
            status || ""
          }: ${serverMessage}`
        );
      } else if (error?.message) {
        setErrorMessage(
          `Could not load report: ${error.message}`
        );
      } else {
        setErrorMessage(
          "Could not connect to the DrivePro-SA server."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD WHEN PAGE OPENS
  // ========================================

  useEffect(() => {
    loadReport();
  }, []);

  // ========================================
  // PRINT
  // ========================================

  const handlePrint = () => {
  if (!report) {
    alert("Please generate the report first.");
    return;
  }

  const doc = new jsPDF();

  // ==========================================
  // HEADER
  // ==========================================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);

  doc.text("DRIVEPRO-SA", 105, 20, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);

  doc.text("Financial & Operations Report", 105, 29, {
    align: "center",
  });

  doc.line(20, 35, 190, 35);

  // ==========================================
  // REPORT PERIOD
  // ==========================================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  doc.text("Report Period", 20, 47);

  doc.setFont("helvetica", "normal");

  doc.text(
    `${report.startDate} to ${report.endDate}`,
    20,
    55
  );

  // ==========================================
  // FINANCIAL SUMMARY
  // ==========================================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);

  doc.text("Financial Summary", 20, 70);

  autoTable(doc, {
    startY: 75,

    head: [
      [
        "Total Income",
        "Number of Payments",
        "Outstanding Balance",
      ],
    ],

    body: [
      [
        money(report.totalIncome),
        String(report.totalPayments),
        money(report.outstandingBalance),
      ],
    ],

    theme: "grid",

    styles: {
      fontSize: 10,
      halign: "center",
      valign: "middle",
    },

    headStyles: {
      fontStyle: "bold",
    },
  });

  // ==========================================
  // STUDENT SUMMARY
  // ==========================================

  const studentY =
    (doc as any).lastAutoTable.finalY + 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);

  doc.text("Student Summary", 20, studentY);

  autoTable(doc, {
    startY: studentY + 5,

    head: [
      [
        "Total Students",
      ],
    ],

    body: [
      [
        String(report.totalStudents),
      ],
    ],

    theme: "grid",

    styles: {
      fontSize: 10,
      halign: "center",
    },

    headStyles: {
      fontStyle: "bold",
    },
  });

  // ==========================================
  // LESSON SUMMARY
  // ==========================================

  const lessonY =
    (doc as any).lastAutoTable.finalY + 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);

  doc.text("Lesson Summary", 20, lessonY);

  autoTable(doc, {
    startY: lessonY + 5,

    head: [
      [
        "Total Lessons",
        "Completed",
        "Booked",
        "Cancelled",
      ],
    ],

    body: [
      [
        String(report.totalLessons),
        String(report.completedLessons),
        String(report.bookedLessons),
        String(report.cancelledLessons),
      ],
    ],

    theme: "grid",

    styles: {
      fontSize: 10,
      halign: "center",
    },

    headStyles: {
      fontStyle: "bold",
    },
  });

  // ==========================================
  // FOOTER
  // ==========================================

  const pageHeight =
    doc.internal.pageSize.getHeight();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  doc.text(
    "DrivePro-SA - Driving School Management System",
    105,
    pageHeight - 15,
    {
      align: "center",
    }
  );

  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-ZA")}`,
    105,
    pageHeight - 9,
    {
      align: "center",
    }
  );

  // ==========================================
  // SAVE PDF
  // ==========================================

  const fileName =
    `DrivePro-SA-Report-${report.startDate}-to-${report.endDate}.pdf`;

  doc.save(fileName);
};

  // ========================================
  // MONEY FORMAT
  // ========================================

  const money = (
    value: number | string | undefined
  ) => {
    return `R ${Number(
      value || 0
    ).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ========================================
  // PAGE
  // ========================================

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: "1400px",
        mx: "auto",
      }}
    >
      {/* ====================================
          HEADER
      ===================================== */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight="bold"
              >
                📊 Reports
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                DrivePro-SA financial,
                student and lesson reports
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              disabled={!report}
            >
              Print Report
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ====================================
          REPORT PERIOD
      ===================================== */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            📅 Report Period
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid
            container
            spacing={2}
          >
            {/* START DATE */}

            <Grid
              size={{
                xs: 12,
                md: 5,
              }}
            >
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(
                    e.target.value
                  )
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Grid>

            {/* END DATE */}

            <Grid
              size={{
                xs: 12,
                md: 5,
              }}
            >
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(
                    e.target.value
                  )
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Grid>

            {/* GENERATE */}

            <Grid
              size={{
                xs: 12,
                md: 2,
              }}
            >
              <Button
                fullWidth
                variant="contained"
                sx={{
                  height: "56px",
                }}
                onClick={loadReport}
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : "Generate"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ====================================
          ERROR MESSAGE
      ===================================== */}

      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          <strong>
            Report Error:
          </strong>{" "}
          {errorMessage}
        </Alert>
      )}

      {/* ====================================
          LOADING
      ===================================== */}

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "center",
            py: 5,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* ====================================
          REPORT RESULTS
      ===================================== */}

      {!loading && report && (
        <>
          {/* ==================================
              FINANCIAL SUMMARY
          =================================== */}

          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            💰 Financial Summary
          </Typography>

          <Grid
            container
            spacing={2}
            sx={{ mb: 4 }}
          >
            {/* TOTAL INCOME */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 4,
              }}
            >
              <Card>
                <CardContent>
                  <Typography
                    color="text.secondary"
                  >
                    Total Income
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mt: 1 }}
                  >
                    {money(
                      report.totalIncome
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* NUMBER OF PAYMENTS */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 4,
              }}
            >
              <Card>
                <CardContent>
                  <Typography
                    color="text.secondary"
                  >
                    Number of Payments
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mt: 1 }}
                  >
                    {report.totalPayments}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* OUTSTANDING */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 4,
              }}
            >
              <Card>
                <CardContent>
                  <Typography
                    color="text.secondary"
                  >
                    Outstanding Balance
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mt: 1 }}
                  >
                    {money(
                      report.outstandingBalance
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ==================================
              STUDENT SUMMARY
          =================================== */}

          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            👨‍🎓 Student Summary
          </Typography>

          <Grid
            container
            spacing={2}
            sx={{ mb: 4 }}
          >
            {/* TOTAL */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <Card>
                <CardContent>
                  <Typography
                    color="text.secondary"
                  >
                    Total Students
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mt: 1 }}
                  >
                    {report.totalStudents}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* NEW */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <Card>
                <CardContent>
                  <Typography
                    color="text.secondary"
                  >
                    New Students
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mt: 1 }}
                  >
                    {report.newStudents}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    During selected period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* ACTIVE */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <Card>
                <CardContent>
                  <Typography
                    color="text.secondary"
                  >
                    Active Students
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mt: 1 }}
                  >
                    {report.activeStudents}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* WITH BALANCE */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <Card>
                <CardContent>
                  <Typography
                    color="text.secondary"
                  >
                    Students With Balance
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mt: 1 }}
                  >
                    {
                      report.studentsWithBalance
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ==================================
              LESSON SUMMARY
          =================================== */}

          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            📅 Lesson Summary
          </Typography>

          <Grid
            container
            spacing={2}
            sx={{ mb: 4 }}
          >
            {/* TOTAL */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <Card>
                <CardContent>
                  <Typography
                    color="text.secondary"
                  >
                    Total Lessons
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mt: 1 }}
                  >
                    {report.totalLessons}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* COMPLETED */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <Card>
                <CardContent>
                  <Typography
                    color="text.secondary"
                  >
                    Completed
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mt: 1 }}
                  >
                    {report.completedLessons}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* BOOKED */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <Card>
                <CardContent>
                  <Typography
                    color="text.secondary"
                  >
                    Booked
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mt: 1 }}
                  >
                    {report.bookedLessons}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* CANCELLED */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <Card>
                <CardContent>
                  <Typography
                    color="text.secondary"
                  >
                    Cancelled
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mt: 1 }}
                  >
                    {report.cancelledLessons}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ==================================
              PAYMENT METHOD BREAKDOWN
          =================================== */}

          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            💳 Payment Method Breakdown
          </Typography>

          <TableContainer
            component={Paper}
            sx={{ mb: 4 }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>
                      Payment Method
                    </strong>
                  </TableCell>

                  <TableCell align="right">
                    <strong>
                      Number of Payments
                    </strong>
                  </TableCell>

                  <TableCell align="right">
                    <strong>
                      Total Amount
                    </strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {report.paymentMethods
                  .length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      align="center"
                    >
                      No payments for
                      selected period
                    </TableCell>
                  </TableRow>
                ) : (
                  report.paymentMethods.map(
                    (item) => (
                      <TableRow
                        key={
                          item.paymentMethod
                        }
                      >
                        <TableCell>
                          {item.paymentMethod ||
                            "Not specified"}
                        </TableCell>

                        <TableCell align="right">
                          {item.count}
                        </TableCell>

                        <TableCell align="right">
                          {money(
                            item.amount
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ==================================
              INSTRUCTOR PERFORMANCE
          =================================== */}

          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            👨‍🏫 Instructor Performance
          </Typography>

          <TableContainer
            component={Paper}
            sx={{ mb: 4 }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>
                      Instructor
                    </strong>
                  </TableCell>

                  <TableCell align="right">
                    <strong>
                      Total
                    </strong>
                  </TableCell>

                  <TableCell align="right">
                    <strong>
                      Completed
                    </strong>
                  </TableCell>

                  <TableCell align="right">
                    <strong>
                      Booked
                    </strong>
                  </TableCell>

                  <TableCell align="right">
                    <strong>
                      Cancelled
                    </strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {report.instructors
                  .length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                    >
                      No instructor
                      lessons for
                      selected period
                    </TableCell>
                  </TableRow>
                ) : (
                  report.instructors.map(
                    (item) => (
                      <TableRow
                        key={
                          item.instructor
                        }
                      >
                        <TableCell>
                          {item.instructor ||
                            "Not specified"}
                        </TableCell>

                        <TableCell align="right">
                          {
                            item.totalLessons
                          }
                        </TableCell>

                        <TableCell align="right">
                          {
                            item.completedLessons
                          }
                        </TableCell>

                        <TableCell align="right">
                          {
                            item.bookedLessons
                          }
                        </TableCell>

                        <TableCell align="right">
                          {
                            item.cancelledLessons
                          }
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ==================================
              VEHICLE USAGE
          =================================== */}

          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            🚗 Vehicle Usage
          </Typography>

          <TableContainer
            component={Paper}
            sx={{ mb: 4 }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>
                      Vehicle
                    </strong>
                  </TableCell>

                  <TableCell align="right">
                    <strong>
                      Total
                    </strong>
                  </TableCell>

                  <TableCell align="right">
                    <strong>
                      Completed
                    </strong>
                  </TableCell>

                  <TableCell align="right">
                    <strong>
                      Booked
                    </strong>
                  </TableCell>

                  <TableCell align="right">
                    <strong>
                      Cancelled
                    </strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {report.vehicles
                  .length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                    >
                      No vehicle lessons
                      for selected
                      period
                    </TableCell>
                  </TableRow>
                ) : (
                  report.vehicles.map(
                    (item) => (
                      <TableRow
                        key={
                          item.vehicle
                        }
                      >
                        <TableCell>
                          {item.vehicle ||
                            "Not specified"}
                        </TableCell>

                        <TableCell align="right">
                          {
                            item.totalLessons
                          }
                        </TableCell>

                        <TableCell align="right">
                          {
                            item.completedLessons
                          }
                        </TableCell>

                        <TableCell align="right">
                          {
                            item.bookedLessons
                          }
                        </TableCell>

                        <TableCell align="right">
                          {
                            item.cancelledLessons
                          }
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ==================================
              REPORT PERIOD
          =================================== */}

          <Box
            sx={{
              mt: 4,
              p: 2,
              backgroundColor:
                "#f5f5f5",
              borderRadius: 2,
            }}
          >
            <Typography>
              <strong>
                Report Period:
              </strong>{" "}
              {report.startDate} to{" "}
              {report.endDate}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}