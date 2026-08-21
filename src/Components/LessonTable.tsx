import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  Stack,
  Typography,
} from "@mui/material";

// ==========================================
// LESSON TYPE
// ==========================================

type Lesson = {
  id?: number;
  student: string;
  instructor: string;
  vehicle: string;
  lesson_date: string;
  lesson_time: string;
  status: string;
};

// ==========================================
// PROPS
// ==========================================

type LessonTableProps = {
  lessons: Lesson[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

// ==========================================
// LESSON TABLE
// ==========================================

function LessonTable({
  lessons,
  onEdit,
  onDelete,
}: LessonTableProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        width: "100%",
        overflowX: "auto",
      }}
    >
      <Table>
        {/* =====================================
            TABLE HEADER
        ====================================== */}

        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Student</strong>
            </TableCell>

            <TableCell>
              <strong>Instructor</strong>
            </TableCell>

            <TableCell>
              <strong>Vehicle</strong>
            </TableCell>

            <TableCell>
              <strong>Date</strong>
            </TableCell>

            <TableCell>
              <strong>Time</strong>
            </TableCell>

            <TableCell>
              <strong>Status</strong>
            </TableCell>

            <TableCell align="center">
              <strong>Actions</strong>
            </TableCell>
          </TableRow>
        </TableHead>

        {/* =====================================
            TABLE BODY
        ====================================== */}

        <TableBody>
          {lessons.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                align="center"
              >
                <Typography
                  sx={{
                    py: 3,
                  }}
                >
                  📅 No lessons found.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            lessons.map((lesson) => (
              <TableRow
                key={lesson.id}
                hover
              >
                {/* STUDENT */}

                <TableCell>
                  {lesson.student}
                </TableCell>

                {/* INSTRUCTOR */}

                <TableCell>
                  {lesson.instructor}
                </TableCell>

                {/* VEHICLE */}

                <TableCell>
                  {lesson.vehicle}
                </TableCell>

                {/* DATE */}

                <TableCell>
                  {lesson.lesson_date}
                </TableCell>

                {/* TIME */}

                <TableCell>
                  {lesson.lesson_time}
                </TableCell>

                {/* STATUS */}

                <TableCell>
                  {lesson.status}
                </TableCell>

                {/* ACTIONS */}

                <TableCell align="center">
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                  >
                    {/* EDIT */}

                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      disabled={
                        lesson.id === undefined
                      }
                      onClick={() => {
                        if (
                          lesson.id !== undefined
                        ) {
                          onEdit(lesson.id);
                        }
                      }}
                    >
                      ✏️ Edit
                    </Button>

                    {/* DELETE */}

                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      disabled={
                        lesson.id === undefined
                      }
                      onClick={() => {
                        if (
                          lesson.id !== undefined
                        ) {
                          onDelete(lesson.id);
                        }
                      }}
                    >
                      🗑️ Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default LessonTable;