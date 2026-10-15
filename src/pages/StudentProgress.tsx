
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

// Use the configured production API URL.
// If the frontend and backend share the same domain, use relative URLs.
const API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const skills = [
  "Moving off and stopping",
  "Gear control",
  "Turning and observation",
  "Reversing",
  "Parking",
  "Mirrors and signalling",
];

const statuses = [
  "Not Assessed",
  "Needs Practice",
  "Improving",
  "Competent",
];

type Student = {
  id: number;
  studentNo?: string | number;
  fullname: string;
};

type SkillProgress = {
  status: string;
  comments: string;
};

type Assessment = {
  skill: string;
  status?: string;
  comments?: string;
};

function getList<T>(data: any, keys: string[] = []): T[] {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

export default function StudentProgress() {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [progress, setProgress] = useState<Record<string, SkillProgress>>({});
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "info" | "warning"
  >("info");

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token || ""}`,
  };

  useEffect(() => {
    let cancelled = false;

    const loadStudents = async () => {
      setLoadingStudents(true);
      setMessage("");

      if (!token) {
        setStudents([]);
        setMessage("Your session has expired. Please log in again.");
        setMessageType("error");
        setLoadingStudents(false);
        return;
      }

      try {
        const response = await axios.get(`${API}/students`, { headers });

        const list = getList<Student>(response.data, [
          "students",
          "data",
        ]).filter(
          (student) =>
            student &&
            Number.isFinite(Number(student.id)) &&
            String(student.fullname || "").trim()
        );

        if (!cancelled) {
          setStudents(list);

          if (list.length === 0) {
            setMessage(
              "No students were returned for this school. Please check the school's registered students and account access."
            );
            setMessageType("warning");
          }
        }
      } catch (error) {
        console.error("Could not load students:", error);

        if (!cancelled) {
          setStudents([]);

          if (axios.isAxiosError(error) && error.response?.status === 401) {
            setMessage("Your session has expired. Please log in again.");
          } else if (
            axios.isAxiosError(error) &&
            error.response?.status === 403
          ) {
            setMessage(
              "Your account cannot access the student list. Check your school assignment and permissions."
            );
          } else {
            setMessage(
              "Could not load students from the server. Please try again."
            );
          }

          setMessageType("error");
        }
      } finally {
        if (!cancelled) setLoadingStudents(false);
      }
    };

    loadStudents();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    const loadProgress = async () => {
      if (!studentId) {
        setProgress({});
        return;
      }

      setLoadingProgress(true);
      setMessage("");

      const emptyProgress: Record<string, SkillProgress> = {};

      skills.forEach((skill) => {
        emptyProgress[skill] = {
          status: "Not Assessed",
          comments: "",
        };
      });

      try {
        const response = await axios.get(
          `${API}/student-progress/student/${studentId}`,
          { headers }
        );

        const assessments = getList<Assessment>(response.data, [
          "assessments",
          "progress",
          "data",
        ]);

        assessments.forEach((assessment) => {
          if (skills.includes(assessment.skill)) {
            emptyProgress[assessment.skill] = {
              status: statuses.includes(assessment.status || "")
                ? assessment.status!
                : "Not Assessed",
              comments: assessment.comments || "",
            };
          }
        });

        if (!cancelled) {
          setProgress(emptyProgress);
          setMessage(
            assessments.length
              ? "Saved assessment information loaded."
              : "No saved assessments found for this student yet."
          );
          setMessageType("info");
        }
      } catch (error) {
        console.error("Could not load student progress:", error);

        if (!cancelled) {
          setProgress(emptyProgress);
          setMessage(
            "Could not load assessments. Please check your access and try again."
          );
          setMessageType("error");
        }
      } finally {
        if (!cancelled) setLoadingProgress(false);
      }
    };

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [studentId, token]);

  const updateSkill = (
    skill: string,
    field: "status" | "comments",
    value: string
  ) => {
    setProgress((previous) => ({
      ...previous,
      [skill]: {
        ...(previous[skill] || {
          status: "Not Assessed",
          comments: "",
        }),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!studentId) {
      setMessage("Please select a student first.");
      setMessageType("error");
      return;
    }

    if (!token) {
      setMessage("Your session has expired. Please log in again.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      for (const skill of skills) {
        const item = progress[skill] || {
          status: "Not Assessed",
          comments: "",
        };

        await axios.post(
          `${API}/student-progress`,
          {
            student_id: Number(studentId),
            skill,
            status: item.status,
            comments: item.comments,
          },
          { headers }
        );
      }

      setMessage("All assessments saved successfully.");
      setMessageType("success");
    } catch (error) {
      console.error("Could not save assessments:", error);

      const errorMessage =
        axios.isAxiosError(error) &&
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Could not save all assessments. Please try again.";

      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const competentCount = skills.filter(
    (skill) => progress[skill]?.status === "Competent"
  ).length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Student Progress
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Select a registered student to view or update driving assessments.
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="student-select-label">
            Select Student
          </InputLabel>

          <Select
            labelId="student-select-label"
            value={studentId}
            label="Select Student"
            onChange={(event) => setStudentId(event.target.value)}
            disabled={loadingStudents || students.length === 0}
          >
            {students.map((student) => (
              <MenuItem key={student.id} value={String(student.id)}>
                {student.fullname} — Student No. {student.studentNo || "N/A"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loadingStudents && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {message && !studentId && (
          <Alert severity={messageType} sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}

        {!loadingStudents && students.length === 0 && (
          <Button
            sx={{ mt: 1 }}
            onClick={() => window.location.reload()}
          >
            Retry loading students
          </Button>
        )}
      </Paper>

      {studentId && (
        <>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Competent skills: {competentCount} of {skills.length}
          </Typography>

          {loadingProgress ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: "grid", gap: 2 }}>
              {skills.map((skill) => (
                <Paper key={skill} sx={{ p: 2 }}>
                  <Typography fontWeight="bold" sx={{ mb: 2 }}>
                    {skill}
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id={`status-${skill}`}>
                      Assessment Status
                    </InputLabel>

                    <Select
                      labelId={`status-${skill}`}
                      value={progress[skill]?.status || "Not Assessed"}
                      label="Assessment Status"
                      onChange={(event) =>
                        updateSkill(skill, "status", event.target.value)
                      }
                    >
                      {statuses.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Instructor Comments"
                    value={progress[skill]?.comments || ""}
                    onChange={(event) =>
                      updateSkill(skill, "comments", event.target.value)
                    }
                  />
                </Paper>
              ))}
            </Box>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleSave}
            disabled={saving || loadingProgress}
            sx={{ mt: 3 }}
          >
            {saving ? "Saving..." : "Save Assessments"}
          </Button>

          {message && (
            <Alert severity={messageType} sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}
        </>
      )}
    </Box>
  );
}
