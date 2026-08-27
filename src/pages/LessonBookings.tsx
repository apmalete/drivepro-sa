import { useEffect, useState } from "react";

import {
  Button,
  Paper,
  Typography,
  Box,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import LessonForm from "../Components/LessonForm";
import LessonCalendar from "../Components/LessonCalendar";
import LessonTable from "../Components/LessonTable";

import type { Lesson } from "../Components/LessonForm";

import api from "../services/api";

// ==========================================
// TYPES
// ==========================================

type Student = {
  id?: number;
  fullname: string;
};

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
// GET LOGGED-IN USER SCHOOL
// ==========================================

const getSchoolId = (): number => {
  try {
    const userData =
      localStorage.getItem("user");

    if (!userData) {
      return 1;
    }

    const user = JSON.parse(userData);

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

// ==========================================
// COMPONENT
// ==========================================

function LessonBookings() {
  // ==========================================
  // LESSONS
  // ==========================================

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  // ==========================================
  // STUDENTS
  // ==========================================

  const [students, setStudents] =
    useState<Student[]>([]);

  // ==========================================
  // INSTRUCTORS
  // ==========================================

  const [instructors, setInstructors] =
    useState<Instructor[]>([]);

  // ==========================================
  // VEHICLES
  // ==========================================

  const [vehicles, setVehicles] =
    useState<Vehicle[]>([]);

  // ==========================================
  // LESSON FORM
  // ==========================================

  const [lessonFormOpen, setLessonFormOpen] =
    useState(false);

  const [selectedLesson, setSelectedLesson] =
    useState<Lesson | null>(null);

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    loadLessons();
    loadStudents();
    loadInstructors();
    loadVehicles();
  }, []);

  // ==========================================
  // LOAD LESSONS
  // ==========================================

  async function loadLessons() {
    try {
      const schoolId =
        getSchoolId();

      const response =
        await api.get(
          "/lessons",
          {
            params: {
              school_id: schoolId,
            },
          }
        );

      setLessons(
        response.data
      );
    } catch (error) {
      console.error(
        "Error loading lessons:",
        error
      );
    }
  }

  // ==========================================
  // LOAD STUDENTS
  // ==========================================

  async function loadStudents() {
    try {
      const schoolId =
        getSchoolId();

      const response =
        await api.get(
          "/students",
          {
            params: {
              school_id: schoolId,
            },
          }
        );

      setStudents(
        response.data
      );
    } catch (error) {
      console.error(
        "Error loading students:",
        error
      );
    }
  }

  // ==========================================
  // LOAD INSTRUCTORS
  // ==========================================

  async function loadInstructors() {
    try {
      const schoolId =
        getSchoolId();

      const response =
        await api.get(
          "/instructors",
          {
            params: {
              school_id: schoolId,
            },
          }
        );

      setInstructors(
        response.data
      );
    } catch (error) {
      console.error(
        "Error loading instructors:",
        error
      );
    }
  }

  // ==========================================
  // LOAD VEHICLES
  // ==========================================

  async function loadVehicles() {
    try {
      const schoolId =
        getSchoolId();

      const response =
        await api.get(
          "/vehicles",
          {
            params: {
              school_id: schoolId,
            },
          }
        );

      console.log(
        "SCHOOL ID:",
        schoolId
      );

      console.log(
        "VEHICLES RECEIVED:",
        response.data
      );

      setVehicles(
        response.data
      );
    } catch (error) {
      console.error(
        "Error loading vehicles:",
        error
      );
    }
  }

  // ==========================================
  // OPEN NEW LESSON
  // ==========================================

  function handleAddLesson() {
    setSelectedLesson(null);

    setLessonFormOpen(true);
  }

  // ==========================================
  // SAVE NEW OR UPDATED LESSON
  // ==========================================

  async function handleLessonSave(
    lesson: Lesson
  ) {
    try {
      const schoolId =
        getSchoolId();

      // ======================================
      // UPDATE EXISTING LESSON
      // ======================================

      if (lesson.id) {
        await api.put(
          `/lessons/${lesson.id}`,
          {
            ...lesson,
            school_id: schoolId,
          }
        );

        alert(
          "Lesson updated successfully."
        );
      }

      // ======================================
      // ADD NEW LESSON
      // ======================================

      else {
        await api.post(
          "/lessons",
          {
            ...lesson,
            school_id: schoolId,
          }
        );

        alert(
          "Lesson booked successfully."
        );
      }

      // ======================================
      // CLOSE FORM
      // ======================================

      setLessonFormOpen(false);

      setSelectedLesson(null);

      // ======================================
      // REFRESH LESSONS
      // ======================================

      await loadLessons();

    } catch (error: any) {
      console.error(
        "Error saving lesson:",
        error
      );

      const message =
        error?.response?.data?.message ||
        "Failed to save lesson.";

      alert(message);

      throw error;
    }
  }

  // ==========================================
  // EDIT LESSON
  // ==========================================

  function editLesson(
    id: number
  ) {
    const lesson =
      lessons.find(
        (item) =>
          item.id === id
      );

    if (!lesson) {
      alert(
        "Lesson could not be found."
      );

      return;
    }

    setSelectedLesson(
      lesson
    );

    setLessonFormOpen(
      true
    );
  }

  // ==========================================
  // DELETE LESSON
  // ==========================================

  async function deleteLesson(
    id: number
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this lesson?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const schoolId =
        getSchoolId();

      await api.delete(
        `/lessons/${id}`,
        {
          params: {
            school_id: schoolId,
          },
        }
      );

      alert(
        "Lesson deleted successfully."
      );

      await loadLessons();

    } catch (error) {
      console.error(
        "Error deleting lesson:",
        error
      );

      alert(
        "Failed to delete lesson."
      );
    }
  }

  // ==========================================
  // CALENDAR EVENTS
  // ==========================================

  const calendarEvents =
    lessons.map((lesson) => {
      const start =
        new Date(
          `${lesson.lesson_date}T${lesson.lesson_time}`
        );

      const end =
        new Date(start);

      end.setHours(
        end.getHours() + 1
      );

      return {
        id: lesson.id ?? 0,

        title:
          `${lesson.student} - ${lesson.instructor}`,

        start,

        end,
      };
    });

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: "1400px",
        mx: "auto",
      }}
    >

      {/* =====================================
          PAGE HEADER
      ====================================== */}

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
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >

          <Typography
            variant="h4"
            fontWeight="bold"
          >
            📅 Lesson Bookings
          </Typography>

          <Button
            variant="contained"
            startIcon={
              <AddIcon />
            }
            onClick={
              handleAddLesson
            }
          >
            Book New Lesson
          </Button>

        </Box>

      </Paper>

      {/* =====================================
          CALENDAR
      ====================================== */}

      <Paper
        sx={{
          p: 3,
          mb: 4,
        }}
      >

        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            mb: 3,
          }}
        >
          📅 Lesson Calendar
        </Typography>

        <LessonCalendar
          lessons={
            calendarEvents
          }
        />

      </Paper>

      {/* =====================================
          LESSON LIST
      ====================================== */}

      <Paper
        sx={{
          p: 3,
          mb: 4,
        }}
      >

        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            mb: 3,
          }}
        >
          📋 Lesson List
        </Typography>

        <LessonTable
          lessons={
            lessons
          }
          onEdit={
            editLesson
          }
          onDelete={
            deleteLesson
          }
        />

      </Paper>

      {/* =====================================
          LESSON FORM
      ====================================== */}

      <LessonForm
        open={
          lessonFormOpen
        }

        lesson={
          selectedLesson
        }

        students={
          students
        }

        instructors={
          instructors
        }

        vehicles={
          vehicles
        }

        onClose={() => {
          setLessonFormOpen(
            false
          );

          setSelectedLesson(
            null
          );
        }}

        onSave={
          handleLessonSave
        }
      />

    </Box>
  );
}

export default LessonBookings;