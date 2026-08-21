import { useEffect, useState } from "react";
import axios from "axios";

import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";


// ==========================================
// SCHOOL TYPE
// ==========================================

type School = {
  id?: number;
  schoolName: string;
  phone: string;
  email: string;
  address: string;
  registrationNumber: string;
  status: string;
};


// ==========================================
// EMPTY SCHOOL
// ==========================================

const emptySchool: School = {
  schoolName: "",
  phone: "",
  email: "",
  address: "",
  registrationNumber: "",
  status: "Active",
};


// ==========================================
// API
// ==========================================

const API =
  "http://localhost:5000/schools";


// ==========================================
// PAGE
// ==========================================

export default function Schools() {

  // ========================================
  // STATE
  // ========================================

  const [schools, setSchools] =
    useState<School[]>([]);

  const [school, setSchool] =
    useState<School>(emptySchool);

  const [open, setOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(false);


  // ========================================
  // LOAD SCHOOLS
  // ========================================

  useEffect(() => {
    loadSchools();
  }, []);


  async function loadSchools() {

    try {

      setLoading(true);

      const response =
        await axios.get(API);

      setSchools(
        response.data
      );

    } catch (error) {

      console.error(
        "GET SCHOOLS ERROR:",
        error
      );

      alert(
        "Failed to load schools."
      );

    } finally {

      setLoading(false);
    }
  }


  // ========================================
  // OPEN ADD FORM
  // ========================================

  function handleAdd() {

    setSchool({
      ...emptySchool,
    });

    setEditingId(null);

    setOpen(true);
  }


  // ========================================
  // OPEN EDIT FORM
  // ========================================

  function handleEdit(
    selectedSchool: School
  ) {

    setSchool({
      ...selectedSchool,
    });

    setEditingId(
      selectedSchool.id ?? null
    );

    setOpen(true);
  }


  // ========================================
  // HANDLE CHANGE
  // ========================================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement
    >
  ) {

    const {
      name,
      value,
    } = e.target;

    setSchool({
      ...school,
      [name]: value,
    });
  }


  // ========================================
  // SAVE SCHOOL
  // ========================================

  async function handleSave() {

    if (
      !school.schoolName.trim()
    ) {

      alert(
        "School name is required."
      );

      return;
    }


    try {

      if (editingId) {

        await axios.put(
          `${API}/${editingId}`,
          school
        );

        alert(
          "School updated successfully."
        );

      } else {

        await axios.post(
          API,
          school
        );

        alert(
          "School added successfully."
        );
      }


      setOpen(false);

      setSchool(
        emptySchool
      );

      setEditingId(null);

      await loadSchools();

    } catch (error: any) {

      console.error(
        "SAVE SCHOOL ERROR:",
        error
      );

      alert(
        error?.response?.data?.message ||
        "Failed to save school."
      );
    }
  }


  // ========================================
  // CHANGE STATUS
  // ========================================

  async function handleStatusChange(
    id: number,
    status: string
  ) {

    try {

      await axios.patch(
        `${API}/${id}/status`,
        {
          status,
        }
      );

      await loadSchools();

    } catch (error) {

      console.error(
        "UPDATE SCHOOL STATUS ERROR:",
        error
      );

      alert(
        "Failed to update school status."
      );
    }
  }


  // ========================================
  // PAGE
  // ========================================

  return (

    <Box
      sx={{
        p: 3,
      }}
    >

      {/* ====================================
          HEADER
      ==================================== */}

      <Card
        sx={{
          mb: 3,
        }}
      >

        <CardContent>

          <Box
            sx={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >

            <Box>

              <Typography
                variant="h4"
                fontWeight="bold"
              >
                🏫 School Management
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,
                }}
              >
                Manage all driving schools
                registered on DrivePro-SA.
              </Typography>

            </Box>


            <Button
              variant="contained"
              startIcon={
                <AddIcon />
              }
              onClick={
                handleAdd
              }
            >
              Add School
            </Button>

          </Box>

        </CardContent>

      </Card>


      {/* ====================================
          SCHOOL TABLE
      ==================================== */}

      <TableContainer
        component={Paper}
      >

        <Table>

          <TableHead>

            <TableRow>

              <TableCell>
                <strong>ID</strong>
              </TableCell>

              <TableCell>
                <strong>School Name</strong>
              </TableCell>

              <TableCell>
                <strong>Phone</strong>
              </TableCell>

              <TableCell>
                <strong>Email</strong>
              </TableCell>

              <TableCell>
                <strong>Registration No.</strong>
              </TableCell>

              <TableCell>
                <strong>Status</strong>
              </TableCell>

              <TableCell>
                <strong>Actions</strong>
              </TableCell>

            </TableRow>

          </TableHead>


          <TableBody>

            {schools.map(
              (item) => (

                <TableRow
                  key={item.id}
                >

                  <TableCell>
                    {item.id}
                  </TableCell>

                  <TableCell>
                    {item.schoolName}
                  </TableCell>

                  <TableCell>
                    {item.phone ||
                      "-"}
                  </TableCell>

                  <TableCell>
                    {item.email ||
                      "-"}
                  </TableCell>

                  <TableCell>
                    {
                      item.registrationNumber ||
                      "-"
                    }
                  </TableCell>

                  <TableCell>

                    <FormControl
                      size="small"
                    >

                      <InputLabel>
                        Status
                      </InputLabel>

                      <Select
                        value={
                          item.status
                        }
                        label="Status"
                        onChange={(e) =>
                          handleStatusChange(
                            item.id!,
                            e.target.value
                          )
                        }
                        sx={{
                          minWidth:
                            120,
                        }}
                      >

                        <MenuItem value="Active">
                          Active
                        </MenuItem>

                        <MenuItem value="Inactive">
                          Inactive
                        </MenuItem>

                      </Select>

                    </FormControl>

                  </TableCell>

                  <TableCell>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={
                        <EditIcon />
                      }
                      onClick={() =>
                        handleEdit(
                          item
                        )
                      }
                    >
                      Edit
                    </Button>

                  </TableCell>

                </TableRow>

              )
            )}


            {!loading &&
              schools.length === 0 && (

                <TableRow>

                  <TableCell
                    colSpan={7}
                    align="center"
                  >
                    No schools found.
                  </TableCell>

                </TableRow>

              )}

          </TableBody>

        </Table>

      </TableContainer>


      {/* ====================================
          ADD / EDIT DIALOG
      ==================================== */}

      <Dialog
        open={open}
        onClose={() =>
          setOpen(false)
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>

          {editingId
            ? "Edit Driving School"
            : "Add Driving School"}

        </DialogTitle>


        <DialogContent>

          <TextField
            fullWidth
            label="School Name"
            name="schoolName"
            value={
              school.schoolName
            }
            onChange={
              handleChange
            }
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={
              school.phone
            }
            onChange={
              handleChange
            }
            margin="normal"
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            value={
              school.email
            }
            onChange={
              handleChange
            }
            margin="normal"
          />

          <TextField
            fullWidth
            label="Address"
            name="address"
            value={
              school.address
            }
            onChange={
              handleChange
            }
            margin="normal"
            multiline
            rows={2}
          />

          <TextField
            fullWidth
            label="Registration Number"
            name="registrationNumber"
            value={
              school.registrationNumber
            }
            onChange={
              handleChange
            }
            margin="normal"
          />

        </DialogContent>


        <DialogActions>

          <Button
            onClick={() =>
              setOpen(false)
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
            {editingId
              ? "Update School"
              : "Add School"}
          </Button>

        </DialogActions>

      </Dialog>

    </Box>
  );
}