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
  Avatar,
  Stack,
} from "@mui/material";

import type { Student } from "../types/Student";
import api from "../services/api";

interface Props {
  open: boolean;
  student?: Student | null;
  onClose: () => void;
  onSave: (student: Student) => void;
}

const emptyStudent: Student = {
  studentNo: "",
  fullname: "",
  idNumber: "",
  gender: "Male",
  phone: "",
  email: "",
  address: "",
  learnerNumber: "",
  learnerCode: "",
  learnerStatus: "Active",
  licenceCode: "Code B",
  licenceStatus: "Not Applicable",
  instructor: "",
  vehicle: "",
  courseFee: 0,
  amountPaid: 0,
  balance: 0,
  photo: "",
  status: "Active",
};

// =====================================================
// GET LOGGED-IN USER
// =====================================================

const getLoggedInUser = () => {
  try {
    const userData =
      localStorage.getItem("user");

    if (!userData) {
      return null;
    }

    return JSON.parse(userData);
  } catch (error) {
    console.error(
      "ERROR READING LOGGED-IN USER:",
      error
    );

    return null;
  }
};

// =====================================================
// GET SCHOOL ID
// =====================================================

const getSchoolId = (): number => {
  const user =
    getLoggedInUser();

  const schoolId =
    Number(user?.school_id);

  if (
    Number.isInteger(schoolId) &&
    schoolId > 0
  ) {
    return schoolId;
  }

  return 0;
};

// =====================================================
// STUDENT FORM
// =====================================================

export default function StudentForm({
  open,
  student,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] =
    useState<Student>(
      emptyStudent
    );

  const [uploading, setUploading] =
    useState(false);

  // ===================================================
  // LOAD STUDENT
  // ===================================================

  useEffect(() => {
    if (student) {
      setForm({
        ...student,
        school_id:
          Number(
            student.school_id ||
            getSchoolId()
          ),
      });
    } else {
      setForm({
        ...emptyStudent,
        school_id:
          getSchoolId(),
      });
    }
  }, [student, open]);

  // ===================================================
  // HANDLE CHANGE
  // ===================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]:
        name === "courseFee" ||
        name === "amountPaid" ||
        name === "balance"
          ? Number(value)
          : value,
    }));
  };

  // ===================================================
  // PHOTO UPLOAD
  // ===================================================

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (
      !e.target.files?.length
    ) {
      return;
    }

    const file =
      e.target.files[0];

    const formData =
      new FormData();

    formData.append(
      "photo",
      file
    );

    try {
      setUploading(true);

      const response =
        await api.post(
          "/upload/student-photo",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      setForm((prev) => ({
        ...prev,

        photo:
          response.data.path,
      }));
    } catch (error) {
      console.error(
        "PHOTO UPLOAD ERROR:",
        error
      );

      alert(
        "Photo upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  // ===================================================
  // SAVE STUDENT
  // ===================================================

  const handleSave = () => {
    const schoolId =
      getSchoolId();

    // ===============================================
    // CHECK SCHOOL
    // ===============================================

    if (!schoolId) {
      alert(
        "School information was not found. Please log out and log in again."
      );

      return;
    }

    // ===============================================
    // CHECK REQUIRED INFORMATION
    // ===============================================

    if (
      !form.fullname.trim()
    ) {
      alert(
        "Please enter the student's full name."
      );

      return;
    }

    if (
      !form.studentNo.trim()
    ) {
      alert(
        "Please enter the student number."
      );

      return;
    }

    // ===============================================
    // CREATE FINAL STUDENT
    // ===============================================

    const studentToSave: Student = {
      ...form,

      school_id:
        schoolId,
    };

    console.log(
      "SAVING STUDENT:",
      {
        fullname:
          studentToSave.fullname,

        studentNo:
          studentToSave.studentNo,

        school_id:
          studentToSave.school_id,

        learnerCode:
          studentToSave.learnerCode,

        learnerStatus:
          studentToSave.learnerStatus,

        licenceStatus:
          studentToSave.licenceStatus,
      }
    );
    // ===============================================
    // SEND TO PARENT
    // ===============================================

    onSave(
      studentToSave
    );
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        {student
          ? "Edit Student"
          : "Add Student"}
      </DialogTitle>

      <DialogContent>
        <Grid
          container
          spacing={2}
          sx={{ mt: 1 }}
        >

          {/* =========================================
              PHOTO
          ========================================== */}

          <Grid
            size={{
              xs: 12,
              md: 3,
            }}
          >
            <Stack
              spacing={2}
              alignItems="center"
            >
              <Avatar
                src={
                  form.photo
                    ? `${api.defaults.baseURL}${form.photo}`
                    : ""
                }
                sx={{
                  width: 140,
                  height: 140,
                }}
              />

              <Button
                variant="contained"
                component="label"
                disabled={uploading}
              >
                {uploading
                  ? "Uploading..."
                  : "Choose Photo"}

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={
                    handlePhotoUpload
                  }
                />
              </Button>
            </Stack>
          </Grid>

          {/* =========================================
              STUDENT INFORMATION
          ========================================== */}

          <Grid
            size={{
              xs: 12,
              md: 9,
            }}
          >
            <Grid
              container
              spacing={2}
            >

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Student Number"
                  name="studentNo"
                  value={
                    form.studentNo
                  }
                  onChange={
                    handleChange
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullname"
                  value={
                    form.fullname
                  }
                  onChange={
                    handleChange
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="ID Number"
                  name="idNumber"
                  value={
                    form.idNumber
                  }
                  onChange={
                    handleChange
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  select
                  fullWidth
                  label="Gender"
                  name="gender"
                  value={
                    form.gender
                  }
                  onChange={
                    handleChange
                  }
                >
                  <MenuItem value="Male">
                    Male
                  </MenuItem>

                  <MenuItem value="Female">
                    Female
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={
                    form.phone
                  }
                  onChange={
                    handleChange
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={
                    form.email
                  }
                  onChange={
                    handleChange
                  }
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={
                    form.address
                  }
                  onChange={
                    handleChange
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Learner Number"
                  name="learnerNumber"
                  value={
                    form.learnerNumber
                  }
                  onChange={
                    handleChange
                  }
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  select
                  fullWidth
                  label="Learner Code"
                  name="learnerCode"
                  value={
                    form.learnerCode
                  }
                  onChange={
                    handleChange
                  }
                >
                  <MenuItem value="">
                    Select Learner Code
                  </MenuItem>

                  <MenuItem value="Code 8">
                    Code 8
                  </MenuItem>

                  <MenuItem value="Code 10">
                    Code 10
                  </MenuItem>

                  <MenuItem value="EC">
                    EC
                  </MenuItem>
                </TextField>
              </Grid>


              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  select
                  fullWidth
                  label="Learner Status"
                  name="learnerStatus"
                  value={
                    form.learnerStatus
                  }
                  onChange={
                    handleChange
                  }
                >
                  <MenuItem value="Not Applicable">
                    Not Applicable
                  </MenuItem>

                  <MenuItem value="Active">
                    Active
                  </MenuItem>

                  <MenuItem value="Complete">
                    Complete
                  </MenuItem>

                  <MenuItem value="Inactive">
                    Inactive
                  </MenuItem>
                </TextField>
              </Grid>


              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  select
                  fullWidth
                  label="Licence Code"
                  name="licenceCode"
                  value={
                    form.licenceCode
                  }
                  onChange={
                    handleChange
                  }
                >
                  <MenuItem value="Code B">
                    Code B
                  </MenuItem>

                  <MenuItem value="Code C1">
                    Code C1
                  </MenuItem>

                  <MenuItem value="Code EC1">
                    Code EC1
                  </MenuItem>

                  <MenuItem value="Code EC">
                    Code EC
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  select
                  fullWidth
                  label="Licence Status"
                  name="licenceStatus"
                  value={
                    form.licenceStatus
                  }
                  onChange={
                    handleChange
                  }
                >
                  <MenuItem value="Not Applicable">
                    Not Applicable
                  </MenuItem>

                  <MenuItem value="Active">
                    Active
                  </MenuItem>

                  <MenuItem value="Complete">
                    Complete
                  </MenuItem>

                  <MenuItem value="Inactive">
                    Inactive
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Instructor"
                  name="instructor"
                  value={
                    form.instructor
                  }
                  onChange={
                    handleChange
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Vehicle"
                  name="vehicle"
                  value={
                    form.vehicle
                  }
                  onChange={
                    handleChange
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <TextField
                  fullWidth
                  type="number"
                  label="Course Fee"
                  name="courseFee"
                  value={
                    form.courseFee
                  }
                  onChange={
                    handleChange
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <TextField
                  fullWidth
                  type="number"
                  label="Amount Paid"
                  name="amountPaid"
                  value={
                    form.amountPaid
                  }
                  onChange={
                    handleChange
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <TextField
                  fullWidth
                  type="number"
                  label="Balance"
                  name="balance"
                  value={
                    form.balance
                  }
                  onChange={
                    handleChange
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                }}
              >
                <TextField
                  select
                  fullWidth
                  label="Status"
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleChange
                  }
                >
                  <MenuItem value="Active">
                    Active
                  </MenuItem>

                  <MenuItem value="Completed">
                    Completed
                  </MenuItem>

                  <MenuItem value="Inactive">
                    Inactive
                  </MenuItem>
                </TextField>
              </Grid>

            </Grid>
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          color="inherit"
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={
            handleSave
          }
          disabled={
            uploading
          }
        >
          Save Student
        </Button>
      </DialogActions>
    </Dialog>
  );
}




