import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";

import type { Student } from "../types/Student";
import type { Payment } from "../types/Payment";

import {
  getStudentPayments,
} from "../services/paymentService";

import {
  getStudentLessons,
  type Lesson,
} from "../services/lessonService";

import {
  generateStudentStatement,
} from "../utils/pdfGenerator";

interface Props {
  open: boolean;
  student: Student | null;
  onClose: () => void;
  onNewPayment: (student: Student) => void;
  onBookLesson: (student: Student) => void;
}

export default function StudentProfile({
  open,
  student,
  onClose,
  onNewPayment,
  onBookLesson,
}: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // =========================================
  // LOAD PAYMENT AND LESSON HISTORY
  // =========================================

  useEffect(() => {
    if (open && student?.id) {
      loadPayments(student.id);
      loadLessons(student.fullname);
    }
  }, [open, student]);

  // =========================================
  // LOAD PAYMENTS
  // =========================================

  const loadPayments = async (studentId: number) => {
    try {
      const data = await getStudentPayments(studentId);

      setPayments(data);
    } catch (error) {
      console.error(
        "Error loading student payments:",
        error
      );

      setPayments([]);
    }
  };

  // =========================================
  // LOAD LESSONS
  // =========================================

  const loadLessons = async (studentName: string) => {
    try {
      const data = await getStudentLessons(studentName);

      setLessons(data);
    } catch (error) {
      console.error(
        "Error loading student lessons:",
        error
      );

      setLessons([]);
    }
  };

  // =========================================
  // PRINT STUDENT STATEMENT
  // =========================================

  const handlePrintStatement = () => {
    if (!student) {
      return;
    }

    generateStudentStatement(
      student,
      payments,
      lessons
    );
  };

  // =========================================
  // NO STUDENT
  // =========================================

  if (!student) {
    return null;
  }

  // =========================================
  // PROFILE
  // =========================================

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>
        👨‍🎓 Student Profile
      </DialogTitle>

      <DialogContent>

        {/* ===================================
            PERSONAL INFORMATION
        ==================================== */}

        <Typography
          variant="h6"
          sx={{ mt: 1 }}
        >
          Personal Information
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography>
              <strong>Student No:</strong>{" "}
              {student.studentNo}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography>
              <strong>Full Name:</strong>{" "}
              {student.fullname}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography>
              <strong>ID Number:</strong>{" "}
              {student.idNumber}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography>
              <strong>Gender:</strong>{" "}
              {student.gender}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography>
              <strong>Phone:</strong>{" "}
              {student.phone}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography>
              <strong>Email:</strong>{" "}
              {student.email}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography>
              <strong>Address:</strong>{" "}
              {student.address}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography>
              <strong>Status:</strong>{" "}
              {student.status}
            </Typography>
          </Grid>

        </Grid>

        {/* ===================================
            DRIVING INFORMATION
        ==================================== */}

        <Typography
          variant="h6"
          sx={{ mt: 4 }}
        >
          Driving Information
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography>
              <strong>Learner Number:</strong>{" "}
              {student.learnerNumber}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography>
              <strong>Licence Code:</strong>{" "}
              {student.licenceCode}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography>
              <strong>Instructor:</strong>{" "}
              {student.instructor}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography>
              <strong>Vehicle:</strong>{" "}
              {student.vehicle}
            </Typography>
          </Grid>

        </Grid>

        {/* ===================================
            FINANCIAL INFORMATION
        ==================================== */}

        <Typography
          variant="h6"
          sx={{ mt: 4 }}
        >
          Financial Information
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              variant="outlined"
              sx={{ p: 2 }}
            >
              <Typography variant="body2">
                Course Fee
              </Typography>

              <Typography
                variant="h6"
                sx={{ mt: 1 }}
              >
                R{" "}
                {Number(
                  student.courseFee
                ).toFixed(2)}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              variant="outlined"
              sx={{ p: 2 }}
            >
              <Typography variant="body2">
                Amount Paid
              </Typography>

              <Typography
                variant="h6"
                sx={{ mt: 1 }}
              >
                R{" "}
                {Number(
                  student.amountPaid
                ).toFixed(2)}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              variant="outlined"
              sx={{ p: 2 }}
            >
              <Typography variant="body2">
                Balance
              </Typography>

              <Typography
                variant="h6"
                sx={{ mt: 1 }}
              >
                R{" "}
                {Number(
                  student.balance
                ).toFixed(2)}
              </Typography>
            </Paper>
          </Grid>

        </Grid>

        {/* ===================================
            PAYMENT HISTORY
        ==================================== */}

        <Typography
          variant="h6"
          sx={{ mt: 4 }}
        >
          💳 Payment History
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Paper variant="outlined">
          <Table size="small">

            <TableHead>
              <TableRow>

                <TableCell>
                  <strong>Receipt</strong>
                </TableCell>

                <TableCell>
                  <strong>Date</strong>
                </TableCell>

                <TableCell>
                  <strong>Method</strong>
                </TableCell>

                <TableCell align="right">
                  <strong>Amount</strong>
                </TableCell>

              </TableRow>
            </TableHead>

            <TableBody>

              {payments.length === 0 ? (

                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                  >
                    No payment history found.
                  </TableCell>
                </TableRow>

              ) : (

                payments.map((payment) => (

                  <TableRow
                    key={payment.id}
                  >

                    <TableCell>
                      {payment.receiptNo}
                    </TableCell>

                    <TableCell>
                      {payment.paymentDate}
                    </TableCell>

                    <TableCell>
                      {payment.paymentMethod}
                    </TableCell>

                    <TableCell align="right">
                      R{" "}
                      {Number(
                        payment.amount
                      ).toFixed(2)}
                    </TableCell>

                  </TableRow>

                ))

              )}

            </TableBody>

          </Table>
        </Paper>

        {/* ===================================
            LESSON HISTORY
        ==================================== */}

        <Typography
          variant="h6"
          sx={{ mt: 4 }}
        >
          📅 Lesson History
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Paper variant="outlined">

          <Table size="small">

            <TableHead>
              <TableRow>

                <TableCell>
                  <strong>Date</strong>
                </TableCell>

                <TableCell>
                  <strong>Time</strong>
                </TableCell>

                <TableCell>
                  <strong>Instructor</strong>
                </TableCell>

                <TableCell>
                  <strong>Vehicle</strong>
                </TableCell>

                <TableCell>
                  <strong>Status</strong>
                </TableCell>

              </TableRow>
            </TableHead>

            <TableBody>

              {lessons.length === 0 ? (

                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                  >
                    No lesson history found.
                  </TableCell>
                </TableRow>

              ) : (

                lessons.map((lesson) => (

                  <TableRow
                    key={lesson.id}
                  >

                    <TableCell>
                      {lesson.lesson_date}
                    </TableCell>

                    <TableCell>
                      {lesson.lesson_time}
                    </TableCell>

                    <TableCell>
                      {lesson.instructor}
                    </TableCell>

                    <TableCell>
                      {lesson.vehicle}
                    </TableCell>

                    <TableCell>
                      {lesson.status}
                    </TableCell>

                  </TableRow>

                ))

              )}

            </TableBody>

          </Table>
        </Paper>

      </DialogContent>

      {/* =====================================
          ACTION BUTTONS
      ====================================== */}

      <DialogActions>

        <Button
          variant="contained"
          color="primary"
          onClick={handlePrintStatement}
        >
          🖨 Print Statement
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={() =>
            onNewPayment(student)
          }
        >
          💳 New Payment
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={() =>
            onBookLesson(student)
          }
        >
          📅 Book Lesson
        </Button>

        <Button
          color="inherit"
          onClick={onClose}
        >
          Close
        </Button>

      </DialogActions>

    </Dialog>
  );
}