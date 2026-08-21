import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from "@mui/material";

// ==========================================
// TYPES
// ==========================================

interface OutstandingStudent {
  id: number;
  studentNo: string;
  fullname: string;
  balance: number;
}

interface CancelledLesson {
  student: string;
  instructor: string;
  vehicle: string;
  lesson_time: string;
  status: string;
}

interface UnavailableVehicle {
  id: number;
  registration: string;
  make: string;
  model: string;
  status: string;
}

interface InactiveInstructor {
  id: number;
  name: string;
  phone: string;
  status: string;
}

interface DashboardAlertsData {
  success: boolean;
  outstandingStudents: OutstandingStudent[];
  cancelledLessons: CancelledLesson[];
  unavailableVehicles: UnavailableVehicle[];
  inactiveInstructors: InactiveInstructor[];
}

// ==========================================
// PROPS
// ==========================================

interface DashboardAlertsProps {
  alerts: DashboardAlertsData | null;
}

// ==========================================
// COMPONENT
// ==========================================

export default function DashboardAlerts({
  alerts,
}: DashboardAlertsProps) {

  // ========================================
  // LOADING
  // ========================================

  if (!alerts) {
    return null;
  }

  // ========================================
  // CHECK IF THERE ARE ALERTS
  // ========================================

  const hasAlerts =
    alerts.outstandingStudents.length > 0 ||
    alerts.cancelledLessons.length > 0 ||
    alerts.unavailableVehicles.length > 0 ||
    alerts.inactiveInstructors.length > 0;

  // ========================================
  // NO ALERTS
  // ========================================

  if (!hasAlerts) {
    return (
      <Card>
        <CardContent>
          <Alert severity="success">
            <strong>
              Everything looks good.
            </strong>{" "}
            There are currently no dashboard
            alerts.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <Card>
      <CardContent>

        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ mb: 3 }}
        >
          🔔 Dashboard Alerts
        </Typography>

        {/* ==================================
            OUTSTANDING STUDENTS
        =================================== */}

        {alerts.outstandingStudents.length >
          0 && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="warning">
              <strong>
                Students with outstanding
                balances
              </strong>
            </Alert>

            <Box sx={{ mt: 2 }}>
              {alerts.outstandingStudents.map(
                (student) => (
                  <Box
                    key={student.id}
                    sx={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      p: 1.5,
                      mb: 1,
                      borderRadius: 1,
                      backgroundColor:
                        "#fff8e1",
                    }}
                  >
                    <Box>
                      <Typography
                        fontWeight="bold"
                      >
                        {student.fullname}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Student No:{" "}
                        {student.studentNo}
                      </Typography>
                    </Box>

                    <Chip
                      label={`R ${Number(
                        student.balance
                      ).toFixed(2)}`}
                      color="warning"
                    />
                  </Box>
                )
              )}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* ==================================
            CANCELLED LESSONS
        =================================== */}

        {alerts.cancelledLessons.length >
          0 && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="error">
              <strong>
                Cancelled lessons today
              </strong>
            </Alert>

            <Box sx={{ mt: 2 }}>
              {alerts.cancelledLessons.map(
                (lesson, index) => (
                  <Box
                    key={`${lesson.student}-${lesson.lesson_time}-${index}`}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      borderRadius: 1,
                      backgroundColor:
                        "#ffebee",
                    }}
                  >
                    <Typography
                      fontWeight="bold"
                    >
                      {lesson.lesson_time} —{" "}
                      {lesson.student}
                    </Typography>

                    <Typography
                      variant="body2"
                    >
                      Instructor:{" "}
                      {lesson.instructor}
                    </Typography>

                    <Typography
                      variant="body2"
                    >
                      Vehicle:{" "}
                      {lesson.vehicle}
                    </Typography>
                  </Box>
                )
              )}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* ==================================
            UNAVAILABLE VEHICLES
        =================================== */}

        {alerts.unavailableVehicles.length >
          0 && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="info">
              <strong>
                Vehicles unavailable
              </strong>
            </Alert>

            <Box sx={{ mt: 2 }}>
              {alerts.unavailableVehicles.map(
                (vehicle) => (
                  <Box
                    key={vehicle.id}
                    sx={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      p: 1.5,
                      mb: 1,
                      borderRadius: 1,
                      backgroundColor:
                        "#e3f2fd",
                    }}
                  >
                    <Box>
                      <Typography
                        fontWeight="bold"
                      >
                        {vehicle.make}{" "}
                        {vehicle.model}
                      </Typography>

                      <Typography
                        variant="body2"
                      >
                        Registration:{" "}
                        {vehicle.registration}
                      </Typography>
                    </Box>

                    <Chip
                      label={vehicle.status}
                      color="info"
                      size="small"
                    />
                  </Box>
                )
              )}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* ==================================
            INACTIVE INSTRUCTORS
        =================================== */}

        {alerts.inactiveInstructors.length >
          0 && (
          <Box>
            <Alert severity="warning">
              <strong>
                Inactive instructors
              </strong>
            </Alert>

            <Box sx={{ mt: 2 }}>
              {alerts.inactiveInstructors.map(
                (instructor) => (
                  <Box
                    key={instructor.id}
                    sx={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      p: 1.5,
                      mb: 1,
                      borderRadius: 1,
                      backgroundColor:
                        "#fff8e1",
                    }}
                  >
                    <Box>
                      <Typography
                        fontWeight="bold"
                      >
                        {instructor.name}
                      </Typography>

                      <Typography
                        variant="body2"
                      >
                        Phone:{" "}
                        {instructor.phone}
                      </Typography>
                    </Box>

                    <Chip
                      label={instructor.status}
                      color="warning"
                      size="small"
                    />
                  </Box>
                )
              )}
            </Box>
          </Box>
        )}

      </CardContent>
    </Card>
  );
}