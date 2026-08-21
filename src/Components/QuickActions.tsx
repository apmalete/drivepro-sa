import {
  Button,
  Stack,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <Stack spacing={2}>
      {/* ======================================
          ADD STUDENT
      ======================================= */}

      <Button
        variant="contained"
        fullWidth
        onClick={() => navigate("/students")}
      >
        ➕ Add Student
      </Button>

      {/* ======================================
          NEW PAYMENT
      ======================================= */}

      <Button
        variant="contained"
        color="success"
        fullWidth
        onClick={() => navigate("/payments")}
      >
        💳 New Payment
      </Button>

      {/* ======================================
          BOOK LESSON
      ======================================= */}

      <Button
        variant="contained"
        color="secondary"
        fullWidth
        onClick={() => navigate("/lessons")}
      >
        📅 Book Lesson
      </Button>

      {/* ======================================
          ADD VEHICLE
      ======================================= */}

      <Button
        variant="contained"
        color="warning"
        fullWidth
        onClick={() => navigate("/vehicles")}
      >
        🚗 Add Vehicle
      </Button>

      {/* ======================================
          ADD INSTRUCTOR
      ======================================= */}

      <Button
        variant="contained"
        color="info"
        fullWidth
        onClick={() => navigate("/instructors")}
      >
        👨‍🏫 Add Instructor
      </Button>

      {/* ======================================
          VIEW REPORTS
      ======================================= */}

      <Button
        variant="outlined"
        fullWidth
        onClick={() => navigate("/reports")}
      >
        📊 View Reports
      </Button>
    </Stack>
  );
}