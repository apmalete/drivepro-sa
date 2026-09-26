import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import api from "../services/api";

// =====================================================
// TYPES
// =====================================================

type Student = {
  id?: number;
  fullname: string;
};

type TestBooking = {
  id?: number;
  student_id: number;
  student_name: string;
  test_type: string;
  booking_date: string;
  booking_time: string;
  test_centre: string;
  booking_reference: string;
  status: string;
  reminder_sent?: number;
  day_reminder_sent?: number;
  school_id?: number;
};

// =====================================================
// GET LOGGED-IN USER SCHOOL
// =====================================================

const getSchoolId = (): number => {
  try {
    const userData =
      localStorage.getItem("user");

    if (!userData) {
      return 1;
    }

    const user =
      JSON.parse(userData);

    return Number(
      user?.school_id || 1
    );

  } catch (error) {

    console.error(
      "ERROR READING USER SCHOOL:",
      error
    );

    return 1;
  }
};

// =====================================================
// EMPTY FORM
// =====================================================

const emptyBooking: TestBooking = {
  student_id: 0,
  student_name: "",
  test_type: "Learner's Licence",
  booking_date: "",
  booking_time: "",
  test_centre: "",
  booking_reference: "",
  status: "Pending",
};

// =====================================================
// COMPONENT
// =====================================================

function TestBookings() {

  // ===================================================
  // TEST BOOKINGS
  // ===================================================

  const [bookings, setBookings] =
    useState<TestBooking[]>([]);

  // ===================================================
  // STUDENTS
  // ===================================================

  const [students, setStudents] =
    useState<Student[]>([]);

  // ===================================================
  // FORM
  // ===================================================

  const [formOpen, setFormOpen] =
    useState(false);

  const [selectedBooking, setSelectedBooking] =
    useState<TestBooking | null>(null);

  const [formData, setFormData] =
    useState<TestBooking>(
      emptyBooking
    );

  // ===================================================
  // LOAD DATA
  // ===================================================

  useEffect(() => {
    loadBookings();
    loadStudents();
  }, []);

  // ===================================================
  // LOAD TEST BOOKINGS
  // ===================================================

  async function loadBookings() {

    try {

      const schoolId =
        getSchoolId();

      const response =
        await api.get(
          "/test-bookings",
          {
            params: {
              school_id:
                schoolId,
            },
          }
        );

      setBookings(
        response.data || []
      );

    } catch (error) {

      console.error(
        "Error loading test bookings:",
        error
      );

    }
  }

  // ===================================================
  // LOAD STUDENTS
  // ===================================================

  async function loadStudents() {

    try {

      const schoolId =
        getSchoolId();

      const response =
        await api.get(
          "/students",
          {
            params: {
              school_id:
                schoolId,
            },
          }
        );

      setStudents(
        response.data || []
      );

    } catch (error) {

      console.error(
        "Error loading students:",
        error
      );

    }
  }

  // ===================================================
  // OPEN NEW BOOKING
  // ===================================================

  function handleAddBooking() {

    setSelectedBooking(
      null
    );

    setFormData({
      ...emptyBooking,
    });

    setFormOpen(true);
  }

  // ===================================================
  // EDIT BOOKING
  // ===================================================

  function handleEditBooking(
    booking: TestBooking
  ) {

    setSelectedBooking(
      booking
    );

    setFormData({
      ...booking,
    });

    setFormOpen(true);
  }

  // ===================================================
  // CLOSE FORM
  // ===================================================

  function handleCloseForm() {

    setFormOpen(false);

    setSelectedBooking(
      null
    );

    setFormData({
      ...emptyBooking,
    });
  }

  // ===================================================
  // FORM CHANGE
  // ===================================================

  function handleChange(
    field: keyof TestBooking,
    value: string | number
  ) {

    setFormData(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

    // ===============================================
    // WHEN STUDENT CHANGES
    // ===============================================

    if (
      field === "student_id"
    ) {

      const student =
        students.find(
          (item) =>
            Number(item.id) ===
            Number(value)
        );

      setFormData(
        (previous) => ({
          ...previous,

          student_id:
            Number(value),

          student_name:
            student?.fullname || "",
        })
      );
    }
  }

  // ===================================================
  // SAVE BOOKING
  // ===================================================

  async function handleSaveBooking() {

    try {

      const schoolId =
        getSchoolId();

      // =============================================
      // VALIDATION
      // =============================================

      if (
        !formData.student_id
      ) {

        alert(
          "Please select a student."
        );

        return;
      }

      if (
        !formData.test_type
      ) {

        alert(
          "Please select the test type."
        );

        return;
      }

      if (
        !formData.booking_date
      ) {

        alert(
          "Please select the test date."
        );

        return;
      }

      if (
        !formData.booking_time
      ) {

        alert(
          "Please select the test time."
        );

        return;
      }

      // =============================================
      // DATA TO SEND
      // =============================================

      const bookingData = {
        student_id:
          formData.student_id,

        student_name:
          formData.student_name,

        test_type:
          formData.test_type,

        booking_date:
          formData.booking_date,

        booking_time:
          formData.booking_time,

        test_centre:
          formData.test_centre,

        booking_reference:
          formData.booking_reference,

        status:
          formData.status,

        school_id:
          schoolId,
      };

      // =============================================
      // UPDATE
      // =============================================

      if (
        selectedBooking?.id
      ) {

        await api.put(
          `/test-bookings/${selectedBooking.id}`,
          bookingData
        );

        alert(
          "Test booking updated successfully."
        );

      }

      // =============================================
      // ADD
      // =============================================

      else {

        await api.post(
          "/test-bookings",
          bookingData
        );

        alert(
          "Test booking added successfully."
        );
      }

      // =============================================
      // CLOSE
      // =============================================

      handleCloseForm();

      // =============================================
      // REFRESH
      // =============================================

      await loadBookings();

    } catch (error: any) {

      console.error(
        "Error saving test booking:",
        error
      );

      const message =
        error?.response?.data?.message ||
        "Failed to save test booking.";

      alert(message);
    }
  }

  // ===================================================
  // UPDATE STATUS
  // ===================================================

  async function handleStatusChange(
    booking: TestBooking,
    status: string
  ) {

    try {

      await api.patch(
        `/test-bookings/${booking.id}/status`,
        {
          status,
          school_id:
            getSchoolId(),
        }
      );

      await loadBookings();

    } catch (error) {

      console.error(
        "Error updating booking status:",
        error
      );

      alert(
        "Failed to update booking status."
      );
    }
  }

  // ===================================================
  // DELETE BOOKING
  // ===================================================

  async function handleDeleteBooking(
    id: number
  ) {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this test booking?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await api.delete(
        `/test-bookings/${id}`,
        {
          params: {
            school_id:
              getSchoolId(),
          },
        }
      );

      alert(
        "Test booking deleted successfully."
      );

      await loadBookings();

    } catch (error) {

      console.error(
        "Error deleting test booking:",
        error
      );

      alert(
        "Failed to delete test booking."
      );
    }
  }

  // ===================================================
  // FORMAT DATE
  // ===================================================

  function formatDate(
    date: string
  ) {

    if (!date) {
      return "";
    }

    const parts =
      date.split("-");

    if (
      parts.length !== 3
    ) {
      return date;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  // ===================================================
  // PAGE
  // ===================================================

  return (

    <Box
      sx={{
        p: 3,
        maxWidth: "1400px",
        mx: "auto",
      }}
    >

      {/* =========================================
          PAGE HEADER
      ========================================== */}

      <Paper
        sx={{
          p: 3,
          mb: 3,
        }}
      >

        <Box
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            flexWrap:
              "wrap",
            gap: 2,
          }}
        >

          <Typography
            variant="h4"
            fontWeight="bold"
          >
            📝 Test Bookings
          </Typography>

          <Button
            variant="contained"
            startIcon={
              <AddIcon />
            }
            onClick={
              handleAddBooking
            }
          >
            New Test Booking
          </Button>

        </Box>

      </Paper>

      {/* =========================================
          BOOKING LIST
      ========================================== */}

      <Paper
        sx={{
          p: 3,
        }}
      >

        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            mb: 3,
          }}
        >
          📋 Test Booking List
        </Typography>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell>
                <strong>Student</strong>
              </TableCell>

              <TableCell>
                <strong>Test Type</strong>
              </TableCell>

              <TableCell>
                <strong>Date</strong>
              </TableCell>

              <TableCell>
                <strong>Time</strong>
              </TableCell>

              <TableCell>
                <strong>Test Centre</strong>
              </TableCell>

              <TableCell>
                <strong>Reference</strong>
              </TableCell>

              <TableCell>
                <strong>Status</strong>
              </TableCell>

              <TableCell>
                <strong>Actions</strong>
              </TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {bookings.length === 0 ? (

              <TableRow>

                <TableCell
                  colSpan={8}
                  align="center"
                >

                  <Typography
                    sx={{
                      py: 4,
                    }}
                  >
                    No test bookings found.
                  </Typography>

                </TableCell>

              </TableRow>

            ) : (

              bookings.map(
                (booking) => (

                  <TableRow
                    key={
                      booking.id
                    }
                  >

                    <TableCell>
                      {
                        booking.student_name
                      }
                    </TableCell>

                    <TableCell>
                      {
                        booking.test_type
                      }
                    </TableCell>

                    <TableCell>
                      {
                        formatDate(
                          booking.booking_date
                        )
                      }
                    </TableCell>

                    <TableCell>
                      {
                        booking.booking_time
                      }
                    </TableCell>

                    <TableCell>
                      {
                        booking.test_centre ||
                        "-"
                      }
                    </TableCell>

                    <TableCell>
                      {
                        booking.booking_reference ||
                        "-"
                      }
                    </TableCell>

                    <TableCell>

                      <TextField
                        select
                        size="small"
                        value={
                          booking.status ||
                          "Pending"
                        }
                        onChange={(event) =>
                          handleStatusChange(
                            booking,
                            event.target.value
                          )
                        }
                        sx={{
                          minWidth: 130,
                        }}
                      >

                        <MenuItem value="Pending">
                          Pending
                        </MenuItem>

                        <MenuItem value="Confirmed">
                          Confirmed
                        </MenuItem>

                        <MenuItem value="Completed">
                          Completed
                        </MenuItem>

                        <MenuItem value="Cancelled">
                          Cancelled
                        </MenuItem>

                      </TextField>

                    </TableCell>

                    <TableCell>

                      <Button
                        size="small"
                        startIcon={
                          <EditIcon />
                        }
                        onClick={() =>
                          handleEditBooking(
                            booking
                          )
                        }
                        sx={{
                          mr: 1,
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        startIcon={
                          <DeleteIcon />
                        }
                        onClick={() =>
                          handleDeleteBooking(
                            booking.id!
                          )
                        }
                      >
                        Delete
                      </Button>

                    </TableCell>

                  </TableRow>

                )
              )

            )}

          </TableBody>

        </Table>

      </Paper>

      {/* =========================================
          TEST BOOKING FORM
      ========================================== */}

      <Dialog
        open={formOpen}
        onClose={
          handleCloseForm
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>

          {selectedBooking
            ? "Edit Test Booking"
            : "New Test Booking"}

        </DialogTitle>

        <DialogContent>

          <Box
            sx={{
              display: "flex",
              flexDirection:
                "column",
              gap: 2,
              mt: 1,
            }}
          >

            {/* STUDENT */}

            <TextField
              select
              fullWidth
              label="Student"
              value={
                formData.student_id ||
                ""
              }
              onChange={(event) =>
                handleChange(
                  "student_id",
                  Number(
                    event.target.value
                  )
                )
              }
            >

              <MenuItem value="">
                Select Student
              </MenuItem>

              {students.map(
                (student) => (

                  <MenuItem
                    key={
                      student.id
                    }
                    value={
                      student.id
                    }
                  >
                    {
                      student.fullname
                    }
                  </MenuItem>

                )
              )}

            </TextField>

            {/* TEST TYPE */}

            <TextField
              select
              fullWidth
              label="Test Type"
              value={
                formData.test_type
              }
              onChange={(event) =>
                handleChange(
                  "test_type",
                  event.target.value
                )
              }
            >

              <MenuItem value="Learner's Licence">
                Learner's Licence
              </MenuItem>

              <MenuItem value="Driving Licence">
                Driving Licence
              </MenuItem>

            </TextField>

            {/* DATE */}

            <TextField
              fullWidth
              type="date"
              label="Test Date"
              value={
                formData.booking_date
              }
              onChange={(event) =>
                handleChange(
                  "booking_date",
                  event.target.value
                )
              }
              InputLabelProps={{
                shrink: true,
              }}
            />

            {/* TIME */}

            <TextField
              fullWidth
              type="time"
              label="Test Time"
              value={
                formData.booking_time
              }
              onChange={(event) =>
                handleChange(
                  "booking_time",
                  event.target.value
                )
              }
              InputLabelProps={{
                shrink: true,
              }}
            />

            {/* TEST CENTRE */}

            <TextField
              fullWidth
              label="Test Centre"
              value={
                formData.test_centre
              }
              onChange={(event) =>
                handleChange(
                  "test_centre",
                  event.target.value
                )
              }
              placeholder="Example: Pretoria Test Centre"
            />

            {/* BOOKING REFERENCE */}

            <TextField
              fullWidth
              label="Booking Reference"
              value={
                formData.booking_reference
              }
              onChange={(event) =>
                handleChange(
                  "booking_reference",
                  event.target.value
                )
              }
              placeholder="Optional"
            />

            {/* STATUS */}

            <TextField
              select
              fullWidth
              label="Status"
              value={
                formData.status
              }
              onChange={(event) =>
                handleChange(
                  "status",
                  event.target.value
                )
              }
            >

              <MenuItem value="Pending">
                Pending
              </MenuItem>

              <MenuItem value="Confirmed">
                Confirmed
              </MenuItem>

              <MenuItem value="Completed">
                Completed
              </MenuItem>

              <MenuItem value="Cancelled">
                Cancelled
              </MenuItem>

            </TextField>

          </Box>

        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >

          <Button
            onClick={
              handleCloseForm
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSaveBooking
            }
          >
            {selectedBooking
              ? "Update Booking"
              : "Save Booking"}
          </Button>

        </DialogActions>

      </Dialog>

    </Box>
  );
}

export default TestBookings;