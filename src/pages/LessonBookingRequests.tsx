
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import api from "../services/api";

interface RequestedLesson {
  lesson_number?: number;
  requested_date?: string;
  requested_time?: string;
  date?: string;
  time?: string;
}

interface BookingRequest {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  requested_date: string;
  requested_time: string;
  preferred_instructor_id?: number | null;
  preferred_instructor_name: string | null;
  customer_notes: string | null;
  status: "Pending" | "Contacted" | "Rejected" | "Scheduled";
  lesson_id?: number | null;
  lesson_count: number;
  total_price: number;
  service_code?: string;
  service_name?: string;
  service_price?: number;
  lesson_schedule?: string | RequestedLesson[] | null;
  created_at: string;
}

interface Instructor {
  id: number;
  name: string;
  status?: string;
}

interface Vehicle {
  id: number;
  registration: string;
  make?: string;
  model?: string;
  status?: string;
}

interface SessionAssignment {
  instructorId: string;
  vehicleId: string;
  lessonDate: string;
  lessonTime: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const getErrorMessage = (err: unknown, fallback: string): string => {
  const error = err as ApiError;
  return error?.response?.data?.message || fallback;
};

const localDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatPrice = (price: number | null | undefined): string =>
  `R${Number(price || 0).toFixed(2)}`;

const getRequestedLessons = (
  schedule: BookingRequest["lesson_schedule"]
): RequestedLesson[] => {
  if (!schedule) return [];

  if (Array.isArray(schedule)) return schedule;

  try {
    const parsed: unknown = JSON.parse(schedule);
    return Array.isArray(parsed) ? (parsed as RequestedLesson[]) : [];
  } catch {
    return [];
  }
};

const formatDate = (date: string | undefined): string => {
  if (!date) return "Not provided";

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  return date;
};

export default function LessonBookingRequests() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [schedulingId, setSchedulingId] = useState<number | null>(null);
  const [activeRequest, setActiveRequest] =
    useState<BookingRequest | null>(null);
  const [sessionAssignments, setSessionAssignments] =
    useState<SessionAssignment[]>([]);
  const [dialogError, setDialogError] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/lesson-booking-requests");
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Could not load lesson booking requests.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  async function updateStatus(
    requestId: number,
    status: "Pending" | "Contacted" | "Rejected"
  ) {
    setUpdatingId(requestId);
    setError("");
    setNotice("");

    try {
      await api.patch(
        `/lesson-booking-requests/${requestId}/status`,
        { status }
      );

      setNotice(`Request #${requestId} updated to ${status}.`);
      await loadRequests();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not update this request."));
    } finally {
      setUpdatingId(null);
    }
  }

  async function openScheduleDialog(request: BookingRequest) {
    setActiveRequest(request);
    setDialogError("");
    setError("");
    setNotice("");
    setLoadingOptions(true);

    const requestedLessons = getRequestedLessons(request.lesson_schedule);
    const count = Math.max(1, Number(request.lesson_count || 1));

    setSessionAssignments(
      Array.from({ length: count }, (_, index) => {
        const requested = requestedLessons[index];

        return {
          instructorId:
            index === 0 && request.preferred_instructor_id
              ? String(request.preferred_instructor_id)
              : "",
          vehicleId: "",
          lessonDate:
            requested?.requested_date ??
            requested?.date ??
            (index === 0 ? request.requested_date || "" : ""),
          lessonTime:
            requested?.requested_time ??
            requested?.time ??
            (index === 0 ? request.requested_time || "" : ""),
        };
      })
    );

    try {
      const [instructorResponse, vehicleResponse] = await Promise.all([
        api.get("/instructors"),
        api.get("/vehicles"),
      ]);

      const instructorRows: Instructor[] = Array.isArray(instructorResponse.data)
        ? instructorResponse.data
        : [];

      const vehicleRows: Vehicle[] = Array.isArray(vehicleResponse.data)
        ? vehicleResponse.data
        : [];

      setInstructors(
        instructorRows.filter(
          (item) =>
            String(item.status || "Active").trim().toLowerCase() !==
            "inactive"
        )
      );

      setVehicles(
        vehicleRows.filter(
          (item) =>
            String(item.status || "Available").trim().toLowerCase() ===
            "available"
        )
      );
    } catch (err: unknown) {
      setDialogError(
        getErrorMessage(err, "Could not load instructors and vehicles.")
      );
    } finally {
      setLoadingOptions(false);
    }
  }

  function updateSessionAssignment(
    index: number,
    field: keyof SessionAssignment,
    value: string
  ) {
    setSessionAssignments((previous) =>
      previous.map((session, i) =>
        i === index ? { ...session, [field]: value } : session
      )
    );
  }

  async function scheduleLesson() {
    if (!activeRequest) return;

    const expectedCount = Math.max(
      1,
      Number(activeRequest.lesson_count || 1)
    );

    if (sessionAssignments.length !== expectedCount) {
      setDialogError(
        `This package requires ${expectedCount} lesson assignments.`
      );
      return;
    }

    if (
      sessionAssignments.some(
        (session) =>
          !session.instructorId ||
          !session.vehicleId ||
          !session.lessonDate ||
          !session.lessonTime
      )
    ) {
      setDialogError(
        "Select an instructor, vehicle, date and time for every lesson."
      );
      return;
    }

    if (
      sessionAssignments.some(
        (session) => session.lessonDate < localDate()
      )
    ) {
      setDialogError(
        "Every lesson must be scheduled for today or a future date."
      );
      return;
    }

    setSchedulingId(activeRequest.id);
    setDialogError("");
    setError("");

    try {
      // IMPORTANT: The backend expects session_assignments, not sessions.
      const response = await api.post(
        `/lesson-booking-requests/${activeRequest.id}/schedule`,
        {
          session_assignments: sessionAssignments.map((session) => ({
            instructor_id: Number(session.instructorId),
            vehicle_id: Number(session.vehicleId),
            lesson_date: session.lessonDate,
            lesson_time: session.lessonTime,
          })),
        }
      );

      setNotice(
        response.data?.message ||
          `Request #${activeRequest.id} scheduled successfully.`
      );

      setActiveRequest(null);
      await loadRequests();
    } catch (err: unknown) {
      setDialogError(
        getErrorMessage(err, "Could not schedule the lessons.")
      );
    } finally {
      setSchedulingId(null);
    }
  }

  const renderRequestedSchedule = (request: BookingRequest) => {
    const lessons = getRequestedLessons(request.lesson_schedule);
    const lessonCount = Number(request.lesson_count || 1);

    if (lessons.length > 0) {
      return (
        <Box sx={{ mt: 1 }}>
          {lessons.map((lesson, index) => (
            <Paper
              key={`${request.id}-lesson-${index}`}
              variant="outlined"
              sx={{ p: 1, mb: 1, bgcolor: "background.default" }}
            >
              <Typography variant="body2" fontWeight={700}>
                Lesson {lesson.lesson_number ?? index + 1}
              </Typography>

              <Typography variant="body2">
                Date: {formatDate(lesson.requested_date ?? lesson.date)}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Time: {lesson.requested_time ?? lesson.time ?? "Not provided"}
              </Typography>
            </Paper>
          ))}

          {lessons.length < lessonCount && (
            <Typography variant="caption" color="warning.main">
              Only {lessons.length} of {lessonCount} requested sessions
              were returned by the server.
            </Typography>
          )}
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2">
          First preferred date: {formatDate(request.requested_date)}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          First preferred time: {request.requested_time || "Not provided"}
        </Typography>

        {lessonCount > 1 && (
          <Typography
            variant="caption"
            color="warning.main"
            display="block"
            sx={{ mt: 1 }}
          >
            Full schedule unavailable. Confirm the remaining dates and times
            with the customer.
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1500, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Public Lesson Requests
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Review lesson packages and each customer's preferred dates and
            times before confirming availability.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={() => void loadRequests()}
          disabled={loading}
        >
          Refresh requests
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {notice && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {notice}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography>
          Total requests: <strong>{requests.length}</strong>
        </Typography>

        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
          Package requests must be fully scheduled before being marked
          Scheduled.
        </Typography>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
          <CircularProgress />
        </Box>
      ) : requests.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6">No booking requests found</Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            New requests for your driving school will appear here.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Contact details</TableCell>
                <TableCell>Requested package and preferred schedule</TableCell>
                <TableCell>Preferred instructor</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Update status</TableCell>
                <TableCell>Schedule</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {requests.map((request) => {
                const lessonCount = Number(request.lesson_count || 1);

                return (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {request.customer_name}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Request #{request.id}
                      </Typography>

                      {request.lesson_id && (
                        <Typography
                          display="block"
                          variant="caption"
                          color="success.main"
                        >
                          Lesson #{request.lesson_id}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography>{request.customer_phone}</Typography>

                      {request.customer_email && (
                        <Typography variant="body2" color="text.secondary">
                          {request.customer_email}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={{ minWidth: 260 }}>
                      {request.service_name && (
                        <Typography fontWeight={700} sx={{ mb: 1 }}>
                          {request.service_name}
                        </Typography>
                      )}

                      <Typography fontWeight={700}>
                        {lessonCount}{" "}
                        {lessonCount === 1 ? "lesson" : "lessons"}
                      </Typography>

                      <Typography color="success.main" fontWeight={700}>
                        Total: {formatPrice(request.total_price)}
                      </Typography>

                      {renderRequestedSchedule(request)}
                    </TableCell>

                    <TableCell>
                      {request.preferred_instructor_name || "Any available"}
                    </TableCell>

                    <TableCell sx={{ minWidth: 150, maxWidth: 240 }}>
                      {request.customer_notes || "—"}
                    </TableCell>

                    <TableCell>{request.status}</TableCell>

                    <TableCell sx={{ minWidth: 145 }}>
                      <Select
                        fullWidth
                        size="small"
                        value={request.status}
                        disabled={
                          updatingId === request.id ||
                          request.status === "Scheduled"
                        }
                        onChange={(event) =>
                          void updateStatus(
                            request.id,
                            event.target.value as
                              | "Pending"
                              | "Contacted"
                              | "Rejected"
                          )
                        }
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Contacted">Contacted</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>

                        {request.status === "Scheduled" && (
                          <MenuItem value="Scheduled">Scheduled</MenuItem>
                        )}
                      </Select>
                    </TableCell>

                    <TableCell sx={{ minWidth: 150 }}>
                      <Button
                        variant="contained"
                        size="small"
                        disabled={
                          request.status === "Rejected" ||
                          request.status === "Scheduled" ||
                          schedulingId === request.id
                        }
                        onClick={() => void openScheduleDialog(request)}
                      >
                        {request.status === "Scheduled"
                          ? "Scheduled"
                          : "Schedule lessons"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={Boolean(activeRequest)}
        onClose={() => {
          if (schedulingId === null) {
            setActiveRequest(null);
            setDialogError("");
          }
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Schedule package lessons</DialogTitle>

        <DialogContent>
          {activeRequest && (
            <Box sx={{ pt: 1, display: "grid", gap: 2 }}>
              <Typography>
                Learner: <strong>{activeRequest.customer_name}</strong>
              </Typography>

              <Typography color="text.secondary" variant="body2">
                Phone: {activeRequest.customer_phone}
              </Typography>

              <Paper variant="outlined" sx={{ p: 2 }}>
                {activeRequest.service_name && (
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    Package: {activeRequest.service_name}
                  </Typography>
                )}

                <Typography fontWeight={700}>
                  {Number(activeRequest.lesson_count || 1)}{" "}
                  {Number(activeRequest.lesson_count || 1) === 1
                    ? "lesson"
                    : "lessons"}
                </Typography>

                <Typography color="success.main" fontWeight={700}>
                  Total: {formatPrice(activeRequest.total_price)}
                </Typography>

                <Typography variant="body2" fontWeight={700} sx={{ mt: 2 }}>
                  Customer's preferred dates and times
                </Typography>

                {renderRequestedSchedule(activeRequest)}
              </Paper>

              <Alert severity="info">
                Select an instructor, vehicle, date and time for every session.
                Confirm availability before scheduling the package.
              </Alert>

              {dialogError && (
                <Alert severity="error">{dialogError}</Alert>
              )}

              {loadingOptions ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {instructors.length === 0 && (
                    <Alert severity="warning">
                      No active instructors were found.
                    </Alert>
                  )}

                  {vehicles.length === 0 && (
                    <Alert severity="warning">
                      No available vehicles were found.
                    </Alert>
                  )}

                  {sessionAssignments.map((session, index) => (
                    <Paper
                      key={`${activeRequest.id}-assignment-${index}`}
                      variant="outlined"
                      sx={{ p: 2, display: "grid", gap: 2 }}
                    >
                      <Typography fontWeight={700}>
                        Lesson {index + 1} of {sessionAssignments.length}
                      </Typography>

                      <FormControl fullWidth required>
                        <InputLabel id={`instructor-label-${index}`}>
                          Instructor
                        </InputLabel>

                        <Select
                          labelId={`instructor-label-${index}`}
                          label="Instructor"
                          value={session.instructorId}
                          onChange={(event) =>
                            updateSessionAssignment(
                              index,
                              "instructorId",
                              event.target.value
                            )
                          }
                        >
                          {instructors.map((instructor) => (
                            <MenuItem
                              key={instructor.id}
                              value={String(instructor.id)}
                            >
                              {instructor.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth required>
                        <InputLabel id={`vehicle-label-${index}`}>
                          Vehicle
                        </InputLabel>

                        <Select
                          labelId={`vehicle-label-${index}`}
                          label="Vehicle"
                          value={session.vehicleId}
                          onChange={(event) =>
                            updateSessionAssignment(
                              index,
                              "vehicleId",
                              event.target.value
                            )
                          }
                        >
                          {vehicles.map((vehicle) => (
                            <MenuItem
                              key={vehicle.id}
                              value={String(vehicle.id)}
                            >
                              {vehicle.registration}
                              {vehicle.make ? ` - ${vehicle.make}` : ""}
                              {vehicle.model ? ` ${vehicle.model}` : ""}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <TextField
                        label="Lesson date"
                        type="date"
                        value={session.lessonDate}
                        onChange={(event) =>
                          updateSessionAssignment(
                            index,
                            "lessonDate",
                            event.target.value
                          )
                        }
                        inputProps={{ min: localDate() }}
                        InputLabelProps={{ shrink: true }}
                        required
                        fullWidth
                      />

                      <TextField
                        label="Lesson time"
                        type="time"
                        value={session.lessonTime}
                        onChange={(event) =>
                          updateSessionAssignment(
                            index,
                            "lessonTime",
                            event.target.value
                          )
                        }
                        InputLabelProps={{ shrink: true }}
                        required
                        fullWidth
                      />
                    </Paper>
                  ))}
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              if (schedulingId === null) {
                setActiveRequest(null);
                setDialogError("");
              }
            }}
            disabled={schedulingId !== null}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() => void scheduleLesson()}
            disabled={
              loadingOptions ||
              schedulingId !== null ||
              instructors.length === 0 ||
              vehicles.length === 0 ||
              sessionAssignments.length === 0
            }
          >
            {schedulingId !== null
              ? "Scheduling..."
              : "Schedule all lessons"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
