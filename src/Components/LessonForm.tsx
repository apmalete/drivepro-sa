import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
} from "@mui/material";

// ==========================================
// LESSON TYPE
// ==========================================

export interface Lesson {
  id?: number;
  student: string;
  instructor: string;
  vehicle: string;
  lesson_date: string;
  lesson_time: string;
  status: string;
}

// ==========================================
// STUDENT TYPE
// ==========================================

interface Student {
  id?: number;
  fullname: string;
}

// ==========================================
// INSTRUCTOR TYPE
// ==========================================

interface Instructor {
  id?: number;
  name: string;
}

// ==========================================
// VEHICLE TYPE
// ==========================================

interface Vehicle {
  id?: number;
  registration: string;
  make: string;
  model: string;
}

// ==========================================
// PROPS
// ==========================================

interface LessonFormProps {
  open?: boolean;
  lesson?: Lesson | null;
  student?: Student | null;
  students: Student[];
  instructors: Instructor[];
  vehicles: Vehicle[];
  onClose?: () => void;
  onSave: (lesson: Lesson) => Promise<void>;
}

// ==========================================
// LESSON FORM
// ==========================================

export default function LessonForm({
  open = true,
  lesson = null,
  student = null,
  students,
  instructors,
  vehicles,
  onClose = () => {},
  onSave,
}: LessonFormProps) {
  const [selectedStudent, setSelectedStudent] =
    useState("");

  const [instructor, setInstructor] =
    useState("");

  const [vehicle, setVehicle] =
    useState("");

  const [lessonDate, setLessonDate] =
    useState("");

  const [lessonTime, setLessonTime] =
    useState("");

  const [status, setStatus] =
    useState("Booked");

  const [saving, setSaving] =
    useState(false);

  // ==========================================
  // LOAD LESSON / STUDENT
  // ==========================================

  useEffect(() => {
    if (!open) {
      return;
    }

    // EDIT EXISTING LESSON
    if (lesson) {
      setSelectedStudent(lesson.student);
      setInstructor(lesson.instructor);
      setVehicle(lesson.vehicle);
      setLessonDate(lesson.lesson_date);
      setLessonTime(lesson.lesson_time);
      setStatus(lesson.status);

      return;
    }

    // NEW LESSON FROM STUDENT PROFILE
    if (student) {
      setSelectedStudent(student.fullname);
    } else {
      setSelectedStudent("");
    }

    setInstructor("");
    setVehicle("");
    setLessonDate("");
    setLessonTime("");
    setStatus("Booked");
  }, [open, lesson, student]);

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setSelectedStudent("");
    setInstructor("");
    setVehicle("");
    setLessonDate("");
    setLessonTime("");
    setStatus("Booked");
  };

  // ==========================================
  // CLOSE FORM
  // ==========================================

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ==========================================
  // SAVE / UPDATE LESSON
  // ==========================================

  const handleSubmit = async () => {
    if (
      !selectedStudent ||
      !instructor ||
      !vehicle ||
      !lessonDate ||
      !lessonTime
    ) {
      alert(
        "Please complete all lesson fields."
      );

      return;
    }

    setSaving(true);

    try {
      const lessonData: Lesson = {
        ...(lesson?.id
          ? { id: lesson.id }
          : {}),

        student: selectedStudent,

        instructor,

        vehicle,

        lesson_date: lessonDate,

        lesson_time: lessonTime,

        status,
      };

      await onSave(lessonData);

      resetForm();

      onClose();
    } catch (error) {
      console.error(
        "Save lesson error:",
        error
      );

      alert(
        "Failed to save lesson."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // FORM
  // ==========================================

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
    >
      {/* =====================================
          TITLE
      ====================================== */}

      <DialogTitle>
        {lesson
          ? "✏️ Edit Driving Lesson"
          : "📅 Book Driving Lesson"}
      </DialogTitle>

      {/* =====================================
          CONTENT
      ====================================== */}

      <DialogContent sx={{ pt: 2 }}>
        <Grid
          container
          spacing={2}
        >

          {/* =================================
              STUDENT
          ================================== */}

          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              label="Select Student"
              value={selectedStudent}
              onChange={(e) =>
                setSelectedStudent(
                  e.target.value
                )
              }
              disabled={Boolean(
                student && !lesson
              )}
            >
              <MenuItem value="">
                Select Student
              </MenuItem>

              {students.map((item) => (
                <MenuItem
                  key={item.id}
                  value={item.fullname}
                >
                  {item.fullname}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* =================================
              INSTRUCTOR
          ================================== */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              select
              fullWidth
              label="Instructor"
              value={instructor}
              onChange={(e) =>
                setInstructor(
                  e.target.value
                )
              }
            >
              <MenuItem value="">
                Select Instructor
              </MenuItem>

              {instructors.map((item) => (
                <MenuItem
                  key={item.id}
                  value={item.name}
                >
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* =================================
              VEHICLE
          ================================== */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              select
              fullWidth
              label="Vehicle"
              value={vehicle}
              onChange={(e) =>
                setVehicle(
                  e.target.value
                )
              }
            >
              <MenuItem value="">
                Select Vehicle
              </MenuItem>

              {vehicles.map((item) => (
                <MenuItem
                  key={item.id}
                  value={item.registration}
                >
                  {item.registration} -{" "}
                  {item.make}{" "}
                  {item.model}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* =================================
              DATE
          ================================== */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              fullWidth
              type="date"
              label="Lesson Date"
              value={lessonDate}
              onChange={(e) =>
                setLessonDate(
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

          {/* =================================
              TIME
          ================================== */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              fullWidth
              type="time"
              label="Lesson Time"
              value={lessonTime}
              onChange={(e) =>
                setLessonTime(
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

          {/* =================================
              STATUS
          ================================== */}

          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              label="Status"
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
            >
              <MenuItem value="Booked">
                Booked
              </MenuItem>

              <MenuItem value="Completed">
                Completed
              </MenuItem>

              <MenuItem value="Cancelled">
                Cancelled
              </MenuItem>
            </TextField>
          </Grid>

        </Grid>
      </DialogContent>

      {/* =====================================
          BUTTONS
      ====================================== */}

      <DialogActions>

        <Button
          onClick={handleClose}
          color="inherit"
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : lesson
              ? "💾 Update Lesson"
              : "💾 Save Lesson"}
        </Button>

      </DialogActions>
    </Dialog>
  );
}