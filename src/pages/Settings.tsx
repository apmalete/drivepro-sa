import { useEffect, useState } from "react";
import axios from "axios";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";

// ==========================================
// SETTINGS TYPE
// ==========================================

interface SettingsData {
  id?: number;
  schoolName: string;
  phone: string;
  email: string;
  address: string;
  registrationNumber: string;
  defaultLessonDuration: number;
  defaultLessonPrice: number;
}

// ==========================================
// DEFAULT SETTINGS
// ==========================================

const defaultSettings: SettingsData = {
  schoolName: "DrivePro-SA",
  phone: "",
  email: "",
  address: "",
  registrationNumber: "",
  defaultLessonDuration: 60,
  defaultLessonPrice: 0,
};

// ==========================================
// SETTINGS PAGE
// ==========================================

export default function Settings() {
  const [settings, setSettings] =
    useState<SettingsData>(defaultSettings);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  // ========================================
  // LOAD SETTINGS
  // ========================================

  const loadSettings = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.get(
        "http://localhost:5000/settings"
      );

      if (response.data) {
        setSettings({
          ...defaultSettings,
          ...response.data,
        });
      }
    } catch (error: any) {
      console.error(
        "Error loading settings:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to load settings."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD WHEN PAGE OPENS
  // ========================================

  useEffect(() => {
    loadSettings();
  }, []);

  // ========================================
  // HANDLE CHANGE
  // ========================================

  const handleChange = (
    field: keyof SettingsData,
    value: string | number
  ) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ========================================
  // SAVE SETTINGS
  // ========================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      await axios.put(
        "http://localhost:5000/settings",
        settings
      );

      setMessage(
        "Settings saved successfully."
      );
    } catch (error: any) {
      console.error(
        "Error saving settings:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: "1200px",
        mx: "auto",
      }}
    >
      {/* ====================================
          HEADER
      ===================================== */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h4"
            fontWeight="bold"
          >
            ⚙️ Settings
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Manage your driving school
            information and default settings.
          </Typography>
        </CardContent>
      </Card>

      {/* ====================================
          MESSAGES
      ===================================== */}

      {message && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
        >
          {message}
        </Alert>
      )}

      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {errorMessage}
        </Alert>
      )}

      {/* ====================================
          SCHOOL INFORMATION
      ===================================== */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            🏫 Driving School Information
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {/* SCHOOL NAME */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                fullWidth
                label="Driving School Name"
                value={settings.schoolName}
                onChange={(e) =>
                  handleChange(
                    "schoolName",
                    e.target.value
                  )
                }
              />
            </Grid>

            {/* REGISTRATION */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                fullWidth
                label="Business / Registration Number"
                value={
                  settings.registrationNumber
                }
                onChange={(e) =>
                  handleChange(
                    "registrationNumber",
                    e.target.value
                  )
                }
              />
            </Grid>

            {/* PHONE */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                fullWidth
                label="Phone Number"
                value={settings.phone}
                onChange={(e) =>
                  handleChange(
                    "phone",
                    e.target.value
                  )
                }
              />
            </Grid>

            {/* EMAIL */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                fullWidth
                type="email"
                label="Email Address"
                value={settings.email}
                onChange={(e) =>
                  handleChange(
                    "email",
                    e.target.value
                  )
                }
              />
            </Grid>

            {/* ADDRESS */}

            <Grid
              size={{
                xs: 12,
              }}
            >
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Business Address"
                value={settings.address}
                onChange={(e) =>
                  handleChange(
                    "address",
                    e.target.value
                  )
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ====================================
          LESSON SETTINGS
      ===================================== */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            🚗 Lesson Settings
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {/* LESSON DURATION */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                fullWidth
                type="number"
                label="Default Lesson Duration (minutes)"
                value={
                  settings.defaultLessonDuration
                }
                onChange={(e) =>
                  handleChange(
                    "defaultLessonDuration",
                    Number(e.target.value)
                  )
                }
                inputProps={{
                  min: 15,
                }}
              />
            </Grid>

            {/* LESSON PRICE */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                fullWidth
                type="number"
                label="Default Lesson Price (R)"
                value={
                  settings.defaultLessonPrice
                }
                onChange={(e) =>
                  handleChange(
                    "defaultLessonPrice",
                    Number(e.target.value)
                  )
                }
                inputProps={{
                  min: 0,
                  step: 50,
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ====================================
          SAVE
      ===================================== */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save Settings"}
        </Button>
      </Box>
    </Box>
  );
}