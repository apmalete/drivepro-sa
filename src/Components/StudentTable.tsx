import { useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  IconButton,
  Chip,
  TextField,
  Box,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import type { Student } from "../types/Student";

export type StudentView = "all" | "learners" | "licences";

interface StudentTableProps {
  students: Student[];
  view?: StudentView;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export default function StudentTable({
  students,
  view = "all",
  onView,
  onEdit,
  onDelete,
}: StudentTableProps) {
  const [search, setSearch] = useState("");

  const studentsForView = students.filter((student) => {
    if (view === "learners") {
      const learnerStatus = student.learnerStatus || "Not Applicable";
      return learnerStatus !== "Not Applicable";
    }

    if (view === "licences") {
      const licenceStatus = student.licenceStatus || "Not Applicable";
      return licenceStatus !== "Not Applicable";
    }

    return true;
  });

  const filteredStudents = studentsForView.filter((student) => {
    const value = search.toLowerCase();

    return (
      (student.studentNo || "").toLowerCase().includes(value) ||
      (student.fullname || "").toLowerCase().includes(value) ||
      (student.phone || "").toLowerCase().includes(value) ||
      (student.learnerNumber || "").toLowerCase().includes(value) ||
      (student.learnerCode || "").toLowerCase().includes(value) ||
      (student.learnerStatus || "").toLowerCase().includes(value) ||
      (student.licenceCode || "").toLowerCase().includes(value) ||
      (student.licenceStatus || "").toLowerCase().includes(value) ||
      (student.status || "").toLowerCase().includes(value)
    );
  });

  const getStatusColor = (
    status: string
  ): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case "Active":
      case "Complete":
        return "success";

      case "Inactive":
        return "error";

      default:
        return "default";
    }
  };

  const getEmptyMessage = () => {
    if (view === "learners") {
      return "No learners found.";
    }

    if (view === "licences") {
      return "No licence students found.";
    }

    return "No students found.";
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label={
            view === "learners"
              ? "Search Learners"
              : view === "licences"
                ? "Search Licence Students"
                : "Search Students"
          }
          placeholder="Search by student number, name, phone, learner number or licence code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Paper elevation={3}>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Student No</b>
              </TableCell>

              <TableCell>
                <b>Full Name</b>
              </TableCell>

              <TableCell>
                <b>Phone</b>
              </TableCell>

              {(view === "all" || view === "learners") && (
                <>
                  <TableCell>
                    <b>Learner No</b>
                  </TableCell>

                  <TableCell>
                    <b>Learner Code</b>
                  </TableCell>

                  <TableCell>
                    <b>Learner Status</b>
                  </TableCell>
                </>
              )}

              {(view === "all" || view === "licences") && (
                <>
                  <TableCell>
                    <b>Licence Code</b>
                  </TableCell>

                  <TableCell>
                    <b>Licence Status</b>
                  </TableCell>
                </>
              )}

              {view === "all" && (
                <TableCell>
                  <b>Status</b>
                </TableCell>
              )}

              <TableCell align="center">
                <b>Actions</b>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    view === "all"
                      ? 10
                      : view === "learners"
                        ? 8
                        : 7
                  }
                  align="center"
                >
                  {getEmptyMessage()}
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    {student.studentNo || "-"}
                  </TableCell>

                  <TableCell>
                    {student.fullname}
                  </TableCell>

                  <TableCell>
                    {student.phone}
                  </TableCell>

                  {(view === "all" || view === "learners") && (
                    <>
                      <TableCell>
                        {student.learnerNumber || "-"}
                      </TableCell>

                      <TableCell>
                        {student.learnerCode || "-"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            student.learnerStatus ||
                            "Not Applicable"
                          }
                          color={getStatusColor(
                            student.learnerStatus ||
                              "Not Applicable"
                          )}
                          size="small"
                        />
                      </TableCell>
                    </>
                  )}

                  {(view === "all" || view === "licences") && (
                    <>
                      <TableCell>
                        {student.licenceCode || "-"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            student.licenceStatus ||
                            "Not Applicable"
                          }
                          color={getStatusColor(
                            student.licenceStatus ||
                              "Not Applicable"
                          )}
                          size="small"
                        />
                      </TableCell>
                    </>
                  )}

                  {view === "all" && (
                    <TableCell>
                      <Chip
                        label={
                          student.status || "Active"
                        }
                        color={
                          student.status === "Active"
                            ? "success"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                  )}

                  <TableCell align="center">
                    <IconButton
                      color="info"
                      onClick={() => onView(student)}
                      title="View Student"
                    >
                      <VisibilityIcon />
                    </IconButton>

                    <IconButton
                      color="primary"
                      onClick={() => onEdit(student)}
                      title="Edit Student"
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => onDelete(student)}
                      title="Delete Student"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}









