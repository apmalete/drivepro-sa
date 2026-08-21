import { useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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

interface StudentTableProps {
  students: Student[];
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export default function StudentTable({
  students,
  onView,
  onEdit,
  onDelete,
}: StudentTableProps) {
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter((student) => {
    const value = search.toLowerCase();

    return (
      student.studentNo.toLowerCase().includes(value) ||
      student.fullname.toLowerCase().includes(value) ||
      student.phone.toLowerCase().includes(value) ||
      student.licenceCode.toLowerCase().includes(value) ||
      student.status.toLowerCase().includes(value)
    );
  });

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Search Students"
          placeholder="Search by student number, name, phone or licence code..."
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

              <TableCell>
                <b>Licence Code</b>
              </TableCell>

              <TableCell>
                <b>Status</b>
              </TableCell>

              <TableCell align="center">
                <b>Actions</b>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.studentNo}</TableCell>

                  <TableCell>{student.fullname}</TableCell>

                  <TableCell>{student.phone}</TableCell>

                  <TableCell>{student.licenceCode}</TableCell>

                  <TableCell>
                    <Chip
                      label={student.status}
                      color={
                        student.status === "Active"
                          ? "success"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>

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
      </Paper>
    </>
  );
}