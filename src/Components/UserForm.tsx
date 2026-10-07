import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";

import api from "../services/api";

// =====================================================
// USER TYPE
// =====================================================

export interface User {
  id?: number;
  fullname: string;
  username: string;
  password?: string;
  role: string;
  school_id?: number;
  student_id?: number;
  instructor_id?: number;
}

// =====================================================
// SCHOOL TYPE
// =====================================================

interface School {
  id: number;
  schoolName: string;
  status?: string;
}

// =====================================================
// STUDENT PROFILE TYPE
// =====================================================

interface StudentProfile {
  id: number;
  fullname: string;
  studentNo: string;
  phone?: string | null;
  school_id?: number;
  user_id?: number | null;
}

// =====================================================
// INSTRUCTOR PROFILE TYPE
// =====================================================

interface InstructorProfile {
  id: number;
  name: string;
  phone?: string | null;
  licence?: string | null;
  experience?: string | null;
  status?: string | null;
  school_id?: number;
  user_id?: number | null;
}

// =====================================================
// PROPS
// =====================================================

interface Props {
  open: boolean;
  user?: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
}

// =====================================================
// USER FORM
// =====================================================

export default function UserForm({
  open,
  user,
  onClose,
  onSave,
}: Props) {
  // ===================================================
  // STATE
  // ===================================================

  const [schools, setSchools] = useState<School[]>([]);

  const [studentProfiles, setStudentProfiles] =
    useState<StudentProfile[]>([]);

  const [instructorProfiles, setInstructorProfiles] =
    useState<InstructorProfile[]>([]);

  const [loadingStudents, setLoadingStudents] =
    useState(false);

  const [loadingInstructors, setLoadingInstructors] =
    useState(false);

  const [form, setForm] = useState<User>({
    fullname: "",
    username: "",
    password: "",
    role: "Administrator",
    school_id: 1,
    student_id: undefined,
    instructor_id: undefined,
  });

  // ===================================================
  // GET CURRENT LOGGED-IN USER
  // ===================================================

  const getCurrentUser = () => {
    try {
      const userData =
        localStorage.getItem("user");

      if (!userData) {
        return null;
      }

      return JSON.parse(userData);
    } catch (error) {
      console.error(
        "ERROR READING CURRENT USER:",
        error
      );

      return null;
    }
  };

  // ===================================================
  // GET CURRENT SCHOOL ID
  // ===================================================

  const getCurrentSchoolId = (): number => {
    const currentUser =
      getCurrentUser();

    return (
      Number(
        currentUser?.school_id
      ) || 1
    );
  };

  // ===================================================
  // CHECK SYSTEM ADMINISTRATOR
  // ===================================================

  const isSystemAdministrator = (): boolean => {
    const currentUser =
      getCurrentUser();

    if (!currentUser) {
      return false;
    }

    const role =
      String(
        currentUser?.role || ""
      )
        .trim()
        .toLowerCase();

    const username =
      String(
        currentUser?.username || ""
      )
        .trim()
        .toLowerCase();

    if (username === "admin") {
      return true;
    }

    if (
      role ===
      "system administrator"
    ) {
      return true;
    }

    return false;
  };

  // ===================================================
  // LOAD SCHOOLS
  //
  // ONLY SYSTEM ADMINISTRATOR
  // ===================================================

  useEffect(() => {
    if (
      !open ||
      !isSystemAdministrator()
    ) {
      return;
    }

    const loadSchools = async () => {
      try {
        const response =
          await api.get<School[]>(
            "/schools"
          );

        setSchools(
          response.data || []
        );
      } catch (error) {
        console.error(
          "ERROR LOADING SCHOOLS:",
          error
        );
      }
    };

    loadSchools();
  }, [open]);

  // ===================================================
  // LOAD STUDENT PROFILES
  //
  // ONLY WHEN ROLE = STUDENT
  // ===================================================

  useEffect(() => {
    if (
      !open ||
      form.role !== "Student" ||
      !form.school_id
    ) {
      setStudentProfiles([]);
      return;
    }

    const loadStudentProfiles =
      async () => {
        try {
          setLoadingStudents(true);

          const response =
            await api.get<StudentProfile[]>(
              "/students",
              {
                params: {
                  school_id:
                    Number(
                      form.school_id
                    ),
                },
              }
            );

          const students =
            response.data || [];

          const availableStudents =
            students.filter(
              (student) =>
                !student.user_id ||
                student.user_id === user?.id
            );

          setStudentProfiles(
            availableStudents
          );
        } catch (error) {
          console.error(
            "ERROR LOADING STUDENT PROFILES:",
            error
          );

          setStudentProfiles([]);
        } finally {
          setLoadingStudents(false);
        }
      };

    loadStudentProfiles();
  }, [
    open,
    form.role,
    form.school_id,
    user?.id,
  ]);

  // ===================================================
  // LOAD INSTRUCTOR PROFILES
  //
  // ONLY WHEN ROLE = INSTRUCTOR
  // ===================================================

  useEffect(() => {
    if (
      !open ||
      form.role !== "Instructor" ||
      !form.school_id
    ) {
      setInstructorProfiles([]);
      return;
    }

    const loadInstructorProfiles =
      async () => {
        try {
          setLoadingInstructors(true);

          const response =
            await api.get<InstructorProfile[]>(
              "/instructors"
            );

          const instructors =
            response.data || [];

          // =================================================
          // ONLY SHOW:
          //
          // 1. Instructors with no login account
          // 2. The instructor profile already belonging
          //    to the user being edited
          //
          // IMPORTANT:
          // The backend also enforces school permissions.
          // =================================================

          const availableInstructors =
            instructors.filter(
              (instructor) =>
                Number(instructor.school_id) ===
                  Number(form.school_id) &&
                (
                  !instructor.user_id ||
                  instructor.user_id === user?.id
                )
            );

          setInstructorProfiles(
            availableInstructors
          );
        } catch (error) {
          console.error(
            "ERROR LOADING INSTRUCTOR PROFILES:",
            error
          );

          setInstructorProfiles([]);
        } finally {
          setLoadingInstructors(false);
        }
      };

    loadInstructorProfiles();
  }, [
    open,
    form.role,
    form.school_id,
    user?.id,
  ]);

  // ===================================================
  // LOAD USER INTO FORM
  // ===================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    // =================================================
    // EDIT USER
    // =================================================

    if (user) {
      setForm({
        id:
          user.id,

        fullname:
          user.fullname || "",

        username:
          user.username || "",

        password:
          "",

        role:
          user.role ||
          "Administrator",

        school_id:
          Number(
            user.school_id ||
            getCurrentSchoolId()
          ),

        student_id:
          user.student_id
            ? Number(
                user.student_id
              )
            : undefined,

        instructor_id:
          user.instructor_id
            ? Number(
                user.instructor_id
              )
            : undefined,
      });

      return;
    }

    // =================================================
    // ADD USER
    // =================================================

    setForm({
      fullname: "",
      username: "",
      password: "",
      role: "Administrator",
      school_id:
        getCurrentSchoolId(),
      student_id: undefined,
      instructor_id: undefined,
    });
  }, [user, open]);

  // ===================================================
  // HANDLE FORM CHANGE
  // ===================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const {
      name,
      value,
    } = e.target;

    // =================================================
    // ROLE CHANGE
    // =================================================

    if (name === "role") {
      setForm(
        (previous) => ({
          ...previous,

          role: value,

          student_id:
            value === "Student"
              ? previous.student_id
              : undefined,

          instructor_id:
            value === "Instructor"
              ? previous.instructor_id
              : undefined,
        })
      );

      return;
    }

    // =================================================
    // SCHOOL CHANGE
    // =================================================

    if (name === "school_id") {
      setForm(
        (previous) => ({
          ...previous,

          school_id:
            Number(value),

          // School changed.
          // Clear both profile selections.

          student_id:
            undefined,

          instructor_id:
            undefined,

          fullname:
            previous.role === "Student" ||
            previous.role === "Instructor"
              ? ""
              : previous.fullname,
        })
      );

      return;
    }

    // =================================================
    // NORMAL FIELD
    // =================================================

    setForm(
      (previous) => ({
        ...previous,

        [name]:
          name === "student_id" ||
          name === "instructor_id"
            ? value
              ? Number(value)
              : undefined
            : value,
      })
    );
  };

  // ===================================================
  // STUDENT PROFILE SELECTED
  // ===================================================

  const handleStudentProfileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const studentId =
      Number(e.target.value);

    const selectedStudent =
      studentProfiles.find(
        (student) =>
          student.id === studentId
      );

    if (!selectedStudent) {
      return;
    }

    setForm(
      (previous) => ({
        ...previous,

        student_id:
          selectedStudent.id,

        instructor_id:
          undefined,

        // Automatically use exact
        // name from the profile.
        fullname:
          selectedStudent.fullname,
      })
    );
  };

  // ===================================================
  // INSTRUCTOR PROFILE SELECTED
  // ===================================================

  const handleInstructorProfileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const instructorId =
      Number(e.target.value);

    const selectedInstructor =
      instructorProfiles.find(
        (instructor) =>
          instructor.id === instructorId
      );

    if (!selectedInstructor) {
      return;
    }

    setForm(
      (previous) => ({
        ...previous,

        instructor_id:
          selectedInstructor.id,

        student_id:
          undefined,

        // Automatically use exact
        // name from instructor profile.
        fullname:
          selectedInstructor.name,
      })
    );
  };

  // ===================================================
  // SAVE
  // ===================================================

  const handleSave = () => {
    // =================================================
    // FULL NAME
    // =================================================

    if (
      !form.fullname.trim()
    ) {
      alert(
        "Please enter the full name."
      );

      return;
    }

    // =================================================
    // USERNAME
    // =================================================

    if (
      !form.username.trim()
    ) {
      alert(
        "Please enter the username."
      );

      return;
    }

    // =================================================
    // PASSWORD FOR NEW USER
    // =================================================

    if (
      !user &&
      !form.password
    ) {
      alert(
        "Please enter a password."
      );

      return;
    }

    // =================================================
    // ROLE
    // =================================================

    if (!form.role) {
      alert(
        "Please select a role."
      );

      return;
    }

    // =================================================
    // SCHOOL
    // =================================================

    if (!form.school_id) {
      alert(
        "Please select a school."
      );

      return;
    }

    // =================================================
    // STUDENT PROFILE
    // =================================================

    if (
      form.role === "Student" &&
      !form.student_id
    ) {
      alert(
        "Please select the existing student profile for this account."
      );

      return;
    }

    // =================================================
    // INSTRUCTOR PROFILE
    // =================================================

    if (
      form.role === "Instructor" &&
      !form.instructor_id
    ) {
      alert(
        "Please select the existing instructor profile for this account."
      );

      return;
    }

    // =================================================
    // SEND USER
    // =================================================

    onSave({
      ...form,

      school_id:
        Number(
          form.school_id
        ),

      student_id:
        form.role === "Student"
          ? Number(
              form.student_id
            )
          : undefined,

      instructor_id:
        form.role === "Instructor"
          ? Number(
              form.instructor_id
            )
          : undefined,
    });
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      {/* =============================================
          TITLE
      ============================================== */}

      <DialogTitle>
        {user
          ? "Edit User"
          : "Add User"}
      </DialogTitle>

      <DialogContent>

        {/* =========================================
            FULL NAME
        ========================================== */}

        <TextField
          fullWidth
          margin="dense"
          label="Full Name"
          name="fullname"
          value={
            form.fullname
          }
          onChange={
            handleChange
          }
        />

        {/* =========================================
            USERNAME
        ========================================== */}

        <TextField
          fullWidth
          margin="dense"
          label="Username"
          name="username"
          value={
            form.username
          }
          onChange={
            handleChange
          }
        />

        {/* =========================================
            PASSWORD
        ========================================== */}

        <TextField
          fullWidth
          margin="dense"
          label={
            user
              ? "Password (leave blank to keep current)"
              : "Password"
          }
          name="password"
          type="password"
          value={
            form.password
          }
          onChange={
            handleChange
          }
        />

        {/* =========================================
            ROLE
        ========================================== */}

        <TextField
          select
          fullWidth
          margin="dense"
          label="Role"
          name="role"
          value={
            form.role
          }
          onChange={
            handleChange
          }
        >
          <MenuItem
            value="Administrator"
          >
            Administrator
          </MenuItem>

          <MenuItem
            value="Receptionist"
          >
            Receptionist
          </MenuItem>

          <MenuItem
            value="Instructor"
          >
            Instructor
          </MenuItem>

          <MenuItem
            value="Student"
          >
            Student
          </MenuItem>
        </TextField>

        {/* =========================================
            SCHOOL
        ========================================== */}

        <TextField
          select
          fullWidth
          margin="dense"
          label="School"
          name="school_id"
          value={
            form.school_id || ""
          }
          onChange={
            handleChange
          }
        >
          {/* =======================================
              SYSTEM ADMINISTRATOR
              CAN SELECT ANY SCHOOL
          ======================================== */}

          {isSystemAdministrator() ? (
            schools.length > 0 ? (
              schools.map(
                (school) => (
                  <MenuItem
                    key={
                      school.id
                    }
                    value={
                      school.id
                    }
                  >
                    {
                      school.schoolName
                    }
                  </MenuItem>
                )
              )
            ) : (
              <MenuItem
                value=""
                disabled
              >
                No schools available
              </MenuItem>
            )
          ) : (
            /* =====================================
               NORMAL SCHOOL ADMINISTRATOR
               ONLY THEIR SCHOOL
            ====================================== */

            <MenuItem
              value={
                getCurrentSchoolId()
              }
            >
              School{" "}
              {
                getCurrentSchoolId()
              }
            </MenuItem>
          )}
        </TextField>

        {/* =========================================
            INSTRUCTOR PROFILE
            ONLY FOR INSTRUCTOR USERS
        ========================================== */}

        {form.role ===
          "Instructor" && (
          <TextField
            select
            fullWidth
            margin="dense"
            label="Instructor Profile"
            name="instructor_id"
            value={
              form.instructor_id || ""
            }
            onChange={
              handleInstructorProfileChange
            }
            disabled={
              loadingInstructors ||
              instructorProfiles.length === 0
            }
            helperText={
              loadingInstructors
                ? "Loading instructor profiles..."
                : instructorProfiles.length === 0
                ? "No available instructor profiles found for this school."
                : "Select the existing instructor profile for this login account."
            }
          >
            {loadingInstructors ? (
              <MenuItem
                value=""
                disabled
              >
                Loading instructor profiles...
              </MenuItem>
            ) : instructorProfiles.length > 0 ? (
              instructorProfiles.map(
                (instructor) => (
                  <MenuItem
                    key={
                      instructor.id
                    }
                    value={
                      instructor.id
                    }
                  >
                    {
                      instructor.name
                    }

                    {instructor.phone
                      ? ` — ${instructor.phone}`
                      : ""}

                    {instructor.licence
                      ? ` — ${instructor.licence}`
                      : ""}
                  </MenuItem>
                )
              )
            ) : (
              <MenuItem
                value=""
                disabled
              >
                No instructor profiles available
              </MenuItem>
            )}
          </TextField>
        )}

        {/* =========================================
            STUDENT PROFILE
            ONLY FOR STUDENT USERS
        ========================================== */}

        {form.role ===
          "Student" && (
          <TextField
            select
            fullWidth
            margin="dense"
            label="Student Profile"
            name="student_id"
            value={
              form.student_id || ""
            }
            onChange={
              handleStudentProfileChange
            }
            disabled={
              loadingStudents ||
              studentProfiles.length === 0
            }
            helperText={
              loadingStudents
                ? "Loading student profiles..."
                : studentProfiles.length === 0
                ? "No available student profiles found for this school."
                : "Select the existing student profile for this login account."
            }
          >
            {loadingStudents ? (
              <MenuItem
                value=""
                disabled
              >
                Loading student profiles...
              </MenuItem>
            ) : studentProfiles.length > 0 ? (
              studentProfiles.map(
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

                    {" — "}

                    {
                      student.studentNo
                    }

                    {student.phone
                      ? ` — ${student.phone}`
                      : ""}
                  </MenuItem>
                )
              )
            ) : (
              <MenuItem
                value=""
                disabled
              >
                No student profiles available
              </MenuItem>
            )}
          </TextField>
        )}
      </DialogContent>

      {/* =========================================
          ACTIONS
      ========================================== */}

      <DialogActions>
        <Button
          onClick={
            onClose
          }
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={
            handleSave
          }
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}