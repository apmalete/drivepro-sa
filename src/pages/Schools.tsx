
import { useEffect, useState } from "react";

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
  Stack,
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import api from "../services/api";

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
  logo?: string;
  booking_code?: string | null;
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
  logo: "",
};

// ==========================================
// LOGO HELPERS
// ==========================================

const allowedLogoTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

function getLogoUrl(logo?: string): string {
  if (!logo) return "";

  if (/^https?:\/\//i.test(logo)) {
    return logo;
  }

  const baseURL =
    api.defaults.baseURL || "http://localhost:5000";

  const origin = baseURL
    .replace(/\/api\/?$/i, "")
    .replace(/\/+$/, "");

  return `${origin}${logo.startsWith("/") ? logo : `/${logo}`}`;
}

// ==========================================
// BOOKING LINK HELPERS
// ==========================================

function getBookingUrl(bookingCode?: string | null): string {
  if (!bookingCode) return "";

  // Use the current website domain automatically.
  // Local development uses localhost.
  // Production uses drivepro-sa.co.za.
  const origin = window.location.origin.replace(/\/+$/, "");

  return `${origin}/book-lesson/${encodeURIComponent(bookingCode)}`;
}

async function copyBookingLink(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    alert("Booking link copied successfully.");
  } catch (error) {
    console.error("COPY BOOKING LINK ERROR:", error);
    alert("Could not copy the booking link. Please copy it manually.");
  }
}

function openBookingLink(url: string) {
  if (!url) return;

  window.open(url, "_blank", "noopener,noreferrer");
}

function shareBookingLink(school: School) {
  const url = getBookingUrl(school.booking_code);

  if (!url) {
    alert("This school does not have a booking code.");
    return;
  }

  const text = `Book your driving lessons with ${school.schoolName} using this link: ${url}`;

  window.open(
    `https://wa.me/?text=${encodeURIComponent(text)}`,
    "_blank",
    "noopener,noreferrer"
  );
}

// ==========================================
// PAGE
// ==========================================

export default function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [school, setSchool] = useState<School>({ ...emptySchool });
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");

  // ========================================
  // LOAD SCHOOLS ON PAGE OPEN
  // ========================================

  useEffect(() => {
    void loadSchools();
  }, []);

  // ========================================
  // LOAD SCHOOLS
  // ========================================

  async function loadSchools() {
    try {
      setLoading(true);

      const response = await api.get<School[]>("/schools");

      setSchools(response.data || []);
    } catch (error) {
      console.error("GET SCHOOLS ERROR:", error);
      alert("Failed to load schools.");
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // RESET LOGO SELECTION
  // ========================================

  function resetLogo() {
    setLogoFile(null);
    setLogoPreview("");
  }

  // ========================================
  // OPEN ADD FORM
  // ========================================

  function handleAdd() {
    setSchool({ ...emptySchool });
    setEditingId(null);
    resetLogo();
    setOpen(true);
  }

  // ========================================
  // OPEN EDIT FORM
  // ========================================

  function handleEdit(selectedSchool: School) {
    setSchool({ ...selectedSchool });
    setEditingId(selectedSchool.id ?? null);
    setLogoFile(null);
    setLogoPreview(getLogoUrl(selectedSchool.logo));
    setOpen(true);
  }

  // ========================================
  // HANDLE TEXT FIELD CHANGES
  // ========================================

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setSchool((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ========================================
  // SELECT SCHOOL LOGO
  // ========================================

  function handleLogoChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) return;

    if (!allowedLogoTypes.includes(file.type)) {
      alert("Please select a PNG, JPG/JPEG, or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("The logo must be 2 MB or smaller.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  // ========================================
  // SAVE SCHOOL
  // ========================================

  async function handleSave() {
    if (!school.schoolName.trim()) {
      alert("School name is required.");
      return;
    }

    try {
      setSaving(true);

      let schoolToSave: School = {
        ...school,
        schoolName: school.schoolName.trim(),
      };

      // Upload a newly selected logo first.
      if (logoFile) {
        const formData = new FormData();
        formData.append("logo", logoFile);

        const uploadResponse = await api.post(
          "/upload/school-logo",
          formData
        );

        if (!uploadResponse.data?.path) {
          throw new Error("The server did not return the logo path.");
        }

        schoolToSave = {
          ...schoolToSave,
          logo: uploadResponse.data.path,
        };
      }

      if (editingId !== null) {
        await api.put(`/schools/${editingId}`, schoolToSave);
        alert("School updated successfully.");
      } else {
        await api.post("/schools", schoolToSave);
        alert("School added successfully.");
      }

      setOpen(false);
      setSchool({ ...emptySchool });
      setEditingId(null);
      resetLogo();

      await loadSchools();
    } catch (error: any) {
      console.error("SAVE SCHOOL ERROR:", error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save school."
      );
    } finally {
      setSaving(false);
    }
  }

  // ========================================
  // CHANGE SCHOOL STATUS
  // ========================================

  async function handleStatusChange(id: number, status: string) {
    try {
      await api.patch(`/schools/${id}/status`, { status });
      await loadSchools();
    } catch (error) {
      console.error("UPDATE SCHOOL STATUS ERROR:", error);
      alert("Failed to update school status.");
    }
  }

  // ========================================
  // CLOSE DIALOG
  // ========================================

  function handleClose() {
    if (saving) return;

    setOpen(false);
    setSchool({ ...emptySchool });
    setEditingId(null);
    resetLogo();
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold">
                🏫 School Management
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Manage all driving schools registered on DrivePro-SA.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
            >
              Add School
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* SCHOOL TABLE */}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 1250 }}>
          <TableHead>
            <TableRow>
              <TableCell><strong>Logo</strong></TableCell>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>School Name</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Registration No.</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Booking Link</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {schools.map((item) => {
              const bookingUrl = getBookingUrl(item.booking_code);

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.logo ? (
                      <Box
                        component="img"
                        src={getLogoUrl(item.logo)}
                        alt={`${item.schoolName} logo`}
                        sx={{
                          width: 48,
                          height: 48,
                          objectFit: "contain",
                          borderRadius: 1,
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No logo
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.schoolName}</TableCell>
                  <TableCell>{item.phone || "-"}</TableCell>
                  <TableCell>{item.email || "-"}</TableCell>
                  <TableCell>{item.registrationNumber || "-"}</TableCell>

                  <TableCell>
                    <FormControl size="small">
                      <InputLabel>Status</InputLabel>

                      <Select
                        value={item.status || "Active"}
                        label="Status"
                        onChange={(e) =>
                          handleStatusChange(item.id!, e.target.value)
                        }
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>

                  {/* SCHOOL-SPECIFIC BOOKING LINK */}

                  <TableCell sx={{ minWidth: 300 }}>
                    {bookingUrl ? (
                      <Stack spacing={1}>
                        <Typography
                          variant="caption"
                          sx={{
                            overflowWrap: "anywhere",
                            color: "text.secondary",
                          }}
                        >
                          {bookingUrl}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Tooltip title="Copy booking link">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ContentCopyIcon />}
                              onClick={() => void copyBookingLink(bookingUrl)}
                            >
                              Copy
                            </Button>
                          </Tooltip>

                          <Tooltip title="Open booking page">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<OpenInNewIcon />}
                              onClick={() => openBookingLink(bookingUrl)}
                            >
                              Open
                            </Button>
                          </Tooltip>

                          <Tooltip title="Share booking link on WhatsApp">
                            <Button
                              size="small"
                              color="success"
                              variant="outlined"
                              startIcon={<WhatsAppIcon />}
                              onClick={() => shareBookingLink(item)}
                            >
                              Share
                            </Button>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    ) : (
                      <Typography
                        variant="body2"
                        color="error"
                      >
                        No booking code available
                      </Typography>
                    )}
                  </TableCell>

                  {/* SCHOOL ACTIONS */}

                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {!loading && schools.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No schools found.
                </TableCell>
              </TableRow>
            )}

            {loading && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Loading schools...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ADD / EDIT SCHOOL DIALOG */}

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingId !== null
            ? "Edit Driving School"
            : "Add Driving School"}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="School Name"
            name="schoolName"
            value={school.schoolName}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={school.phone}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={school.email}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Address"
            name="address"
            value={school.address}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={2}
          />

          <TextField
            fullWidth
            label="Registration Number"
            name="registrationNumber"
            value={school.registrationNumber}
            onChange={handleChange}
            margin="normal"
          />

          {/* SCHOOL LOGO UPLOAD */}

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              Driving School Logo
            </Typography>

            {logoPreview && (
              <Box
                component="img"
                src={logoPreview}
                alt="School logo preview"
                sx={{
                  display: "block",
                  width: 120,
                  height: 120,
                  objectFit: "contain",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 1,
                  mb: 2,
                }}
              />
            )}

            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
            >
              {logoFile ? "Choose Another Logo" : "Choose Logo"}

              <input
                hidden
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoChange}
              />
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              PNG, JPG/JPEG, or WebP. Maximum file size: 2 MB.
            </Typography>

            {logoFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {logoFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingId !== null
                ? "Update School"
                : "Add School"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
