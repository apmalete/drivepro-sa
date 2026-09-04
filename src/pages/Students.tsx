import { useEffect, useState } from "react";

import {
  Container,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import StudentTable from "../Components/StudentTable";
import StudentForm from "../Components/StudentForm";
import StudentProfile from "../Components/StudentProfile";
import PaymentForm from "../Components/PaymentForm";
import LessonForm from "../Components/LessonForm";

import type { Student } from "../types/Student";
import type { Payment } from "../types/Payment";
import type { Lesson } from "../Components/LessonForm";

import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "../services/studentService";

import {
  addPayment,
} from "../services/paymentService";

import {
  addLesson,
} from "../services/lessonService";

import api from "../services/api";

// ==========================================
// EMPTY PAYMENT
// ==========================================

const emptyPayment: Payment = {
  receiptNo: "",
  studentId: 0,
  studentName: "",
  studentNumber: "",
  courseFee: 0,
  amountPaid: 0,
  balance: 0,
  paymentDate: new Date()
    .toISOString()
    .split("T")[0],
  paymentMethod: "Cash",
  amount: 0,
  reference: "",
  notes: "",
};

// ==========================================
// LESSON SUPPORT TYPES
// ==========================================

type Instructor = {
  id?: number;
  name: string;
};

type Vehicle = {
  id?: number;
  registration: string;
  make: string;
  model: string;
};

// ==========================================
// STUDENT VIEW TYPES
// ==========================================

type StudentView = "all" | "learners" | "licences";

// ==========================================
// STUDENTS PAGE
// ==========================================

export default function Students() {
  const [students, setStudents] =
    useState<Student[]>([]);

  const [instructors, setInstructors] =
    useState<Instructor[]>([]);

  const [vehicles, setVehicles] =
    useState<Vehicle[]>([]);

  const [open, setOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [paymentOpen, setPaymentOpen] =
    useState(false);

  const [lessonOpen, setLessonOpen] =
    useState(false);

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [lessonStudent, setLessonStudent] =
    useState<Student | null>(null);

  const [payment, setPayment] =
    useState<Payment>(emptyPayment);

  const [studentView, setStudentView] =
    useState<StudentView>("all");

  // ==========================================
  // LOAD STUDENTS
  // ==========================================

  const loadStudents = async () => {
    try {
      const data = await getStudents();

      setStudents(data);
    } catch (error) {
      console.error(
        "Error loading students:",
        error
      );
    }
  };

  // ==========================================
  // LOAD INSTRUCTORS
  // ==========================================

  const loadInstructors = async () => {
    try {
      const response = await api.get(
        "/instructors"
      );

      setInstructors(response.data);
    } catch (error) {
      console.error(
        "Error loading instructors:",
        error
      );
    }
  };

  // ==========================================
  // LOAD VEHICLES
  // ==========================================

  const loadVehicles = async () => {
    try {
      const response = await api.get(
        "/vehicles"
      );

      setVehicles(response.data);
    } catch (error) {
      console.error(
        "Error loading vehicles:",
        error
      );
    }
  };

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    loadStudents();
    loadInstructors();
    loadVehicles();
  }, []);

  // ==========================================
  // ADD STUDENT
  // ==========================================

  const handleAdd = () => {
    setSelectedStudent(null);
    setOpen(true);
  };

  // ==========================================
  // VIEW STUDENT
  // ==========================================

  const handleView = (
    student: Student
  ) => {
    setSelectedStudent(student);
    setProfileOpen(true);
  };

  // ==========================================
  // EDIT STUDENT
  // ==========================================

  const handleEdit = (
    student: Student
  ) => {
    setSelectedStudent(student);
    setOpen(true);
  };

  // ==========================================
  // DELETE STUDENT
  // ==========================================

  const handleDelete = async (
    student: Student
  ) => {
    if (!student.id) {
      return;
    }

    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete ${student.fullname}?`
      );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteStudent(
        student.id
      );

      alert(
        "Student deleted successfully."
      );

      await loadStudents();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to delete student."
      );
    }
  };

  // ==========================================
  // SAVE STUDENT
  // ==========================================

  const handleSave = async (
    student: Student
  ) => {
    try {
      if (student.id) {
        await updateStudent(
          student.id,
          student
        );

        alert(
          "Student updated successfully."
        );
      } else {
        await addStudent(student);

        alert(
          "Student added successfully."
        );
      }

      setOpen(false);
      setSelectedStudent(null);

      await loadStudents();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to save student."
      );
    }
  };

  // ==========================================
  // OPEN NEW PAYMENT
  // ==========================================

  const handleNewPayment = (
    student: Student
  ) => {
    setProfileOpen(false);

    const newPayment: Payment = {
      ...emptyPayment,

      receiptNo: `REC${Date.now()}`,

      studentId:
        student.id || 0,

      studentName:
        student.fullname,

      studentNumber:
        student.studentNo,

      courseFee:
        Number(student.courseFee),

      amountPaid:
        Number(student.amountPaid),

      balance:
        Number(student.balance),

      paymentDate:
        new Date()
          .toISOString()
          .split("T")[0],
    };

    setPayment(newPayment);

    setPaymentOpen(true);
  };

  // ==========================================
  // OPEN BOOK LESSON
  // ==========================================

  const handleBookLesson = (
    student: Student
  ) => {
    setProfileOpen(false);

    setLessonStudent(student);

    setLessonOpen(true);
  };

  // ==========================================
  // CLOSE LESSON FORM
  // ==========================================

  const handleCloseLesson = () => {
    setLessonOpen(false);
    setLessonStudent(null);
  };

  // ==========================================
  // SAVE LESSON
  // ==========================================

  const handleSaveLesson = async (
    lesson: Lesson
  ) => {
    try {
      await addLesson(lesson);

      alert(
        "Lesson booked successfully."
      );

      handleCloseLesson();
    } catch (error) {
      console.error(
        "Lesson booking error:",
        error
      );

      alert(
        "Failed to book lesson."
      );

      throw error;
    }
  };

  // ==========================================
  // PAYMENT FORM CHANGE
  // ==========================================

  const handlePaymentChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    if (name === "amount") {
      const amount =
        Number(value);

      setPayment((previous) => ({
        ...previous,

        amount,

        balance:
          previous.courseFee -
          (
            previous.amountPaid +
            amount
          ),
      }));

      return;
    }

    setPayment((previous) => ({
      ...previous,

      [name]: value,
    }));
  };

  // ==========================================
  // SAVE PAYMENT
  // ==========================================

  const handleSavePayment =
    async () => {
      try {
        if (!payment.studentId) {
          alert(
            "Please select a student."
          );

          return;
        }

        if (payment.amount <= 0) {
          alert(
            "Please enter a valid payment amount."
          );

          return;
        }

        await addPayment(payment);

        alert(
          "Payment saved successfully."
        );

        setPaymentOpen(false);

        setPayment(emptyPayment);

        await loadStudents();
      } catch (error) {
        console.error(
          "Payment error:",
          error
        );

        alert(
          "Failed to save payment."
        );
      }
    };

  // ==========================================
  // CHANGE STUDENT VIEW
  // ==========================================

  const handleViewChange = (
    _event: React.SyntheticEvent,
    newValue: StudentView
  ) => {
    setStudentView(newValue);
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <Container
      maxWidth="xl"
      sx={{ mt: 4 }}
    >
      <Paper sx={{ p: 3 }}>

        {/* PAGE TITLE */}

        <Typography
          variant="h4"
          gutterBottom
        >
          ?? Student Management
        </Typography>

        {/* STUDENT SECTIONS */}

        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mb: 3,
          }}
        >
          <Tabs
            value={studentView}
            onChange={handleViewChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              value="all"
              label={`ALL STUDENTS (${students.length})`}
            />

            <Tab
              value="learners"
              label={`LEARNERS (${
                students.filter(
                  (student) =>
                    (student.learnerStatus || "Not Applicable") !==
                    "Not Applicable"
                ).length
              })`}
            />

            <Tab
              value="licences"
              label={`LICENCES (${
                students.filter(
                  (student) =>
                    (student.licenceStatus || "Not Applicable") !==
                    "Not Applicable"
                ).length
              })`}
            />
          </Tabs>
        </Box>

        {/* ADD STUDENT */}

        <Button
          variant="contained"
          startIcon={
            <AddIcon />
          }
          sx={{ mb: 3 }}
          onClick={handleAdd}
        >
          Add Student
        </Button>

        {/* STUDENT TABLE */}

        <StudentTable
          students={students}
          view={studentView}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* STUDENT FORM */}

        <StudentForm
          open={open}
          student={
            selectedStudent
          }
          onClose={() => {
            setOpen(false);
            setSelectedStudent(
              null
            );
          }}
          onSave={handleSave}
        />

        {/* STUDENT PROFILE */}

        <StudentProfile
          open={profileOpen}
          student={
            selectedStudent
          }
          onClose={() => {
            setProfileOpen(false);
            setSelectedStudent(
              null
            );
          }}
          onNewPayment={
            handleNewPayment
          }
          onBookLesson={
            handleBookLesson
          }
        />

        {/* PAYMENT FORM */}

        <PaymentForm
          open={paymentOpen}
          payment={payment}
          students={students}
          onClose={() => {
            setPaymentOpen(false);
            setPayment(
              emptyPayment
            );
          }}
          onChange={
            handlePaymentChange
          }
          onSave={
            handleSavePayment
          }
        />

        {/* LESSON FORM */}

        <LessonForm
          open={lessonOpen}
          student={lessonStudent}
          students={students}
          instructors={instructors}
          vehicles={vehicles}
          onClose={
            handleCloseLesson
          }
          onSave={
            handleSaveLesson
          }
        />

      </Paper>
    </Container>
  );
}

