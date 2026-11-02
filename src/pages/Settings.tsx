
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../services/api";

interface SettingsData {
  id?: number | null;
  school_id?: number;
  schoolName: string;
  phone: string;
  email: string;
  address: string;
  registrationNumber: string;
  defaultLessonDuration: number;
  defaultLessonPrice: number;
}

interface LessonPackagePrice {
  code: string;
  name: string;
  price: number;
  duration: number;
}

interface FixedLessonPackage {
  id?: number;
  service_code: string;
  package_name: string;
  lesson_count: number;
  total_price: number;
  vehicle_code: string;
  included_services: string[];
}

const vehicleOptions = [
  { value: "code8", label: "Code 8" },
  { value: "code10", label: "Code 10" },
  { value: "code14", label: "Code 14" },
];

const serviceOptions = [
  { value: "car_hire", label: "Car hire" },
  { value: "booking", label: "Booking" },
  { value: "issuing", label: "Issuing" },
  { value: "transport", label: "Transport" },
];

const defaultSettings: SettingsData = {
  schoolName: "DrivePro-SA",
  phone: "",
  email: "",
  address: "",
  registrationNumber: "",
  defaultLessonDuration: 60,
  defaultLessonPrice: 0,
};

// Keep the original service codes.
// Only the customer-facing names are changed.
const defaultLessonPackages: LessonPackagePrice[] = [
  {
    code: "manual_k53_test",
    name: "Manual K53 Code Preparation",
    price: 0,
    duration: 60,
  },
  {
    code: "manual_code8_k53",
    name: "Code 8 K53 Preparation",
    price: 0,
    duration: 60,
  },
  {
    code: "manual_code10_k53",
    name: "Code 10 K53 Preparation",
    price: 0,
    duration: 60,
  },
  {
    code: "refresher_own_car",
    name: "Driving Refresher - Own Vehicle",
    price: 0,
    duration: 60,
  },
  {
    code: "learners_test",
    name: "Learner's Licence Test Preparation",
    price: 0,
    duration: 60,
  },
  {
    code: "automatic_code8_refresher",
    name: "Automatic Code 8 K53 Preparation",
    price: 0,
    duration: 60,
  },
];

// Update the old automatically generated package-name prefixes.
// The rest of each package name is preserved.
const legacyServiceNames: Record<string, string> = {
  manual_k53_test: "Manual refresher - K53 test",
  manual_code8_k53: "Manual refresher - Code 8 K53",
  manual_code10_k53: "Manual refresher - Code 10 K53",
  refresher_own_car: "Refresher using own car",
  learners_test: "Learner's test",
  automatic_code8_refresher: "Automatic - Code 8 refresher",
};

const updateLegacyPackageName = (
  packageName: string,
  serviceCode: string
) => {
  const oldName = legacyServiceNames[serviceCode];
  const newName = defaultLessonPackages.find(
    (item) => item.code === serviceCode
  )?.name;

  if (!oldName || !newName) return packageName;

  if (packageName === oldName) return newName;

  if (packageName.startsWith(`${oldName} - `)) {
    return `${newName}${packageName.substring(oldName.length)}`;
  }

  return packageName;
};

const getLogoUrl = (logoPath: string) => {
  if (!logoPath) return "";

  if (/^https?:\/\//i.test(logoPath)) {
    return logoPath;
  }

  const baseURL = (api.defaults.baseURL || "http://localhost:5000")
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");

  return `${baseURL}${logoPath.startsWith("/") ? "" : "/"}${logoPath}`;
};

export default function Settings() {
  const [settings, setSettings] =
    useState<SettingsData>(defaultSettings);

  const [lessonPackages, setLessonPackages] =
    useState<LessonPackagePrice[]>(defaultLessonPackages);

  const [fixedPackages, setFixedPackages] =
    useState<FixedLessonPackage[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const [appLogo, setAppLogo] = useState("");
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // LOAD SETTINGS
  const loadSettings = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [
        settingsResponse,
        logoResponse,
        pricesResponse,
        fixedPackagesResponse,
      ] = await Promise.all([
        api.get("/settings"),
        api.get("/app-logo"),
        api.get("/settings/lesson-package-prices"),
        api.get("/settings/fixed-lesson-packages"),
      ]);

      if (settingsResponse.data) {
        setSettings({
          ...defaultSettings,
          ...settingsResponse.data,
        });
      }

      setAppLogo(logoResponse.data?.appLogo || "");

      const savedPrices = Array.isArray(pricesResponse.data)
        ? pricesResponse.data
        : [];

      setLessonPackages(
        defaultLessonPackages.map((item) => {
          const saved = savedPrices.find(
            (price: any) => price.code === item.code
          );

          return {
            ...item,
            price: saved ? Number(saved.price) : 0,
            duration: saved
              ? Number(
                  saved.duration ??
                  saved.lesson_duration ??
                  60
                )
              : 60,
          };
        })
      );

      const saved = fixedPackagesResponse.data?.packages;

      setFixedPackages(
        Array.isArray(saved)
          ? saved.map((item: any) => {
              let services: string[] = [];

              if (Array.isArray(item.included_services)) {
                services = item.included_services;
              } else if (
                typeof item.included_services === "string"
              ) {
                try {
                  const parsed = JSON.parse(
                    item.included_services
                  );

                  if (Array.isArray(parsed)) {
                    services = parsed;
                  }
                } catch {
                  services = [];
                }
              }

              const serviceCode = String(item.service_code || "");
              const originalName = String(item.package_name || "");

              return {
                id: item.id,
                service_code: serviceCode,
                package_name: updateLegacyPackageName(
                  originalName,
                  serviceCode
                ),
                lesson_count: Number(item.lesson_count) || 5,
                total_price: Number(item.total_price) || 0,
                vehicle_code: String(item.vehicle_code || ""),
                included_services: services,
              };
            })
          : []
      );
    } catch (error: any) {
      console.error("Error loading settings:", error);

      setErrorMessage(
        error?.response?.data?.message ||
        "Failed to load settings. Check your connection and permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // LOGO PREVIEW
  useEffect(() => {
    if (!selectedLogo) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedLogo);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedLogo]);

  // GENERAL SETTINGS
  const handleChange = (
    field: keyof SettingsData,
    value: string | number
  ) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // INDIVIDUAL SERVICE PRICES
  const handleServiceChange = (
    code: string,
    field: "price" | "duration",
    value: string
  ) => {
    const numberValue = value === "" ? 0 : Number(value);

    setLessonPackages((previous) =>
      previous.map((item) =>
        item.code === code
          ? {
              ...item,
              [field]: Number.isFinite(numberValue)
                ? numberValue
                : 0,
            }
          : item
      )
    );
  };

  // PACKAGE DETAILS
  const handleFixedPackageChange = (
    index: number,
    field:
      | "package_name"
      | "lesson_count"
      | "total_price"
      | "vehicle_code",
    value: string | number
  ) => {
    setFixedPackages((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // OPTIONAL PACKAGE SERVICES
  const toggleIncludedService = (
    index: number,
    service: string,
    checked: boolean
  ) => {
    setFixedPackages((previous) =>
      previous.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const current = item.included_services || [];

        return {
          ...item,
          included_services: checked
            ? [...new Set([...current, service])]
            : current.filter((value) => value !== service),
        };
      })
    );
  };

  // ADD PACKAGE FOR A SELECTED VEHICLE
  const addFixedPackage = (
    serviceCode: string,
    vehicleCode: string
  ) => {
    const service = lessonPackages.find(
      (item) => item.code === serviceCode
    );

    const vehicle = vehicleOptions.find(
      (item) => item.value === vehicleCode
    );

    const nextCount =
      fixedPackages.filter(
        (item) =>
          item.service_code === serviceCode &&
          item.vehicle_code === vehicleCode
      ).length + 1;

    setFixedPackages((previous) => [
      ...previous,
      {
        service_code: serviceCode,
        package_name:
          `${service?.name || "Lesson"} - ${vehicle?.label || "Vehicle"} - 5 lessons (${nextCount})`,
        lesson_count: 5,
        total_price: 0,
        vehicle_code: vehicleCode,
        included_services: [],
      },
    ]);
  };

  // REMOVE PACKAGE FROM THE SCREEN
  const removeFixedPackage = (index: number) => {
    setFixedPackages((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  // SAVE ALL SETTINGS
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      if (!settings.schoolName.trim()) {
        setErrorMessage("Please enter the driving school name.");
        return;
      }

      const names = new Set<string>();

      for (const item of fixedPackages) {
        const validVehicle = vehicleOptions.some(
          (vehicle) => vehicle.value === item.vehicle_code
        );

        const validServices =
          Array.isArray(item.included_services) &&
          item.included_services.every((service) =>
            serviceOptions.some(
              (option) => option.value === service
            )
          );

        if (
          !item.package_name.trim() ||
          item.package_name.trim().length > 100 ||
          !lessonPackages.some(
            (service) => service.code === item.service_code
          ) ||
          !Number.isInteger(item.lesson_count) ||
          item.lesson_count < 2 ||
          item.lesson_count > 100 ||
          !Number.isFinite(item.total_price) ||
          item.total_price < 0 ||
          item.total_price > 1000000 ||
          !validVehicle ||
          !validServices
        ) {
          setErrorMessage(
            "Please check the details of the package you created. Every package must have a name, valid vehicle code, lesson count and price."
          );
          return;
        }

        const key =
          `${item.service_code}:${item.package_name.trim().toLowerCase()}`;

        if (names.has(key)) {
          setErrorMessage(
            "Package names must be unique within each service. Please use different names."
          );
          return;
        }

        names.add(key);
      }

      await api.put("/settings", settings);

      await api.put("/settings/lesson-package-prices", {
        prices: lessonPackages.map((item) => ({
          code: item.code,
          price: item.price || 0,
          duration: item.duration || 60,
        })),
      });

      await api.put("/settings/fixed-lesson-packages", {
        packages: fixedPackages.map((item) => ({
          service_code: item.service_code,
          package_name: item.package_name.trim(),
          lesson_count: item.lesson_count,
          total_price: item.total_price || 0,
          vehicle_code: item.vehicle_code,
          included_services: item.included_services || [],
        })),
      });

      setMessage("Settings saved successfully!");

      await loadSettings();
    } catch (error: any) {
      console.error("Error saving settings:", error);

      setErrorMessage(
        error?.response?.data?.message ||
        "Failed to save settings. Check the backend and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // UPLOAD LOGO
  const handleLogoUpload = async () => {
    if (!selectedLogo) {
      setErrorMessage("Please select an image file first.");
      return;
    }

    if (
      !["image/png", "image/jpeg", "image/webp"].includes(
        selectedLogo.type
      )
    ) {
      setErrorMessage(
        "Choose a PNG, JPG, JPEG or WebP image."
      );
      return;
    }

    if (selectedLogo.size > 2 * 1024 * 1024) {
      setErrorMessage(
        "The logo must be 2 MB or smaller."
      );
      return;
    }

    try {
      setLogoUploading(true);
      setMessage("");
      setErrorMessage("");

      const formData = new FormData();
      formData.append("logo", selectedLogo);

      const response = await api.post(
        "/upload/app-logo",
        formData
      );

      const uploadedPath = response.data?.path;

      if (!uploadedPath) {
        throw new Error(
          "The server did not return the uploaded logo path."
        );
      }

      await api.put("/app-logo", {
        appLogo: uploadedPath,
      });

      setAppLogo(uploadedPath);
      setSelectedLogo(null);

      setMessage(
        "Main DrivePro-SA logo uploaded and saved successfully."
      );

      window.dispatchEvent(new Event("appLogoChanged"));
    } catch (error: any) {
      console.error("Logo upload error:", error);

      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload the main logo."
      );
    } finally {
      setLogoUploading(false);
    }
  };

  // LOADING SCREEN
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

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: "1200px",
        mx: "auto",
      }}
    >
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold">
            ⚙️ Settings
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Manage your driving school information, logo, prices and lesson packages.
          </Typography>
        </CardContent>
      </Card>

      {message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {/* MAIN LOGO */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            Main DrivePro-SA Logo
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                width: 180,
                height: 120,
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 1,
              }}
            >
              {(previewUrl || getLogoUrl(appLogo)) ? (
                <Box
                  component="img"
                  src={previewUrl || getLogoUrl(appLogo)}
                  alt="Main DrivePro-SA logo"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Typography color="text.secondary">
                  No saved main logo
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
              >
                Choose Logo
                <input
                  hidden
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      setSelectedLogo(file);
                      setMessage("");
                      setErrorMessage("");
                    }

                    event.target.value = "";
                  }}
                />
              </Button>

              <Typography variant="body2" color="text.secondary">
                PNG, JPG, JPEG or WebP. Maximum 2 MB.
              </Typography>

              {selectedLogo && (
                <Typography variant="body2">
                  {selectedLogo.name}
                </Typography>
              )}

              <Button
                variant="contained"
                onClick={handleLogoUpload}
                disabled={!selectedLogo || logoUploading}
              >
                {logoUploading
                  ? "Uploading..."
                  : "Upload and Save Main Logo"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* SCHOOL INFORMATION */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            🏫 Driving School Information
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Only the driving school name is required. All other information is optional.
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Driving School Name"
                value={settings.schoolName}
                onChange={(e) => handleChange("schoolName", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Business / Registration Number (Optional)"
                value={settings.registrationNumber}
                onChange={(e) => handleChange("registrationNumber", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Phone Number (Optional)"
                value={settings.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="email"
                label="Email Address (Optional)"
                value={settings.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Business Address (Optional)"
                value={settings.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* DEFAULT LESSON SETTINGS */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            🚗 Default Lesson Settings
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            These values can remain at their defaults if your school does not use them.
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Default Lesson Duration (minutes)"
                value={settings.defaultLessonDuration}
                onChange={(e) => handleChange("defaultLessonDuration", Number(e.target.value))}
                slotProps={{
                  htmlInput: { min: 15, max: 480, step: 15 },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Default Lesson Price (R)"
                value={settings.defaultLessonPrice}
                onChange={(e) => handleChange("defaultLessonPrice", Number(e.target.value))}
                slotProps={{
                  htmlInput: { min: 0, max: 1000000, step: 50 },
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* LESSON AND SERVICE PRICES */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            💰 Lesson and Service Prices
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Set individual lesson prices and durations. You can leave unused services at zero.
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {lessonPackages.map((item) => (
              <Grid key={item.code} size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography fontWeight="bold" sx={{ mb: 2 }}>
                      {item.name}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Price per lesson (R)"
                          value={item.price}
                          onChange={(e) => handleServiceChange(item.code, "price", e.target.value)}
                          slotProps={{
                            htmlInput: { min: 0, max: 1000000, step: 1 },
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Duration (minutes)"
                          value={item.duration}
                          onChange={(e) => handleServiceChange(item.code, "duration", e.target.value)}
                          slotProps={{
                            htmlInput: { min: 15, max: 480, step: 15 },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* PACKAGE BUILDER */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            📦 Driving Lesson Package Builder
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Create separate Code 8, Code 10 and Code 14 packages. Each school sets its own package name and price.
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            Choose the correct vehicle code when adding a package. You can include extra services or leave them unchecked for lessons only.
          </Alert>

          <Divider sx={{ mb: 3 }} />

          {lessonPackages.map((service) => {
            const packages = fixedPackages
              .map((item, index) => ({
                ...item,
                originalIndex: index,
              }))
              .filter((item) => item.service_code === service.code);

            return (
              <Box key={service.code} sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {service.name}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {vehicleOptions.map((vehicle) => (
                      <Button
                        key={vehicle.value}
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => addFixedPackage(service.code, vehicle.value)}
                      >
                        Add {vehicle.label}
                      </Button>
                    ))}
                  </Box>
                </Box>

                {packages.length === 0 ? (
                  <Typography color="text.secondary">
                    No packages created. This is optional.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {packages.map((item) => (
                      <Grid key={`${service.code}-${item.originalIndex}`} size={{ xs: 12 }}>
                        <Card variant="outlined">
                          <CardContent>
                            <Grid container spacing={2} alignItems="center">
                              <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                  fullWidth
                                  label="Package name"
                                  value={item.package_name}
                                  onChange={(e) =>
                                    handleFixedPackageChange(
                                      item.originalIndex,
                                      "package_name",
                                      e.target.value
                                    )
                                  }
                                />
                              </Grid>

                              <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                  fullWidth
                                  select
                                  label="Vehicle licence code"
                                  value={item.vehicle_code}
                                  onChange={(e) =>
                                    handleFixedPackageChange(
                                      item.originalIndex,
                                      "vehicle_code",
                                      e.target.value
                                    )
                                  }
                                >
                                  {vehicleOptions.map((vehicle) => (
                                    <MenuItem key={vehicle.value} value={vehicle.value}>
                                      {vehicle.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>

                              <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                  fullWidth
                                  select
                                  label="Number of lessons"
                                  value={item.lesson_count}
                                  onChange={(e) =>
                                    handleFixedPackageChange(
                                      item.originalIndex,
                                      "lesson_count",
                                      Number(e.target.value)
                                    )
                                  }
                                >
                                  {[5, 10, 15].map((count) => (
                                    <MenuItem key={count} value={count}>
                                      {count} lessons
                                    </MenuItem>
                                  ))}

                                  {[5, 10, 15].includes(item.lesson_count) ? null : (
                                    <MenuItem value={item.lesson_count}>
                                      {item.lesson_count} lessons (existing package)
                                    </MenuItem>
                                  )}
                                </TextField>
                              </Grid>

                              <Grid size={{ xs: 12 }}>
                                <Typography fontWeight="bold" sx={{ mb: 1 }}>
                                  Included services (optional)
                                </Typography>

                                <Grid container spacing={1}>
                                  {serviceOptions.map((option) => (
                                    <Grid key={option.value} size={{ xs: 6, sm: 3 }}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={(item.included_services || []).includes(option.value)}
                                            onChange={(e) =>
                                              toggleIncludedService(
                                                item.originalIndex,
                                                option.value,
                                                e.target.checked
                                              )
                                            }
                                          />
                                        }
                                        label={option.label}
                                      />
                                    </Grid>
                                  ))}
                                </Grid>
                              </Grid>

                              <Grid size={{ xs: 12, md: 5 }}>
                                <TextField
                                  fullWidth
                                  type="number"
                                  label="Total package price (R)"
                                  value={item.total_price}
                                  onChange={(e) =>
                                    handleFixedPackageChange(
                                      item.originalIndex,
                                      "total_price",
                                      e.target.value === "" ? 0 : Number(e.target.value)
                                    )
                                  }
                                  slotProps={{
                                    htmlInput: { min: 0, max: 1000000, step: 1 },
                                  }}
                                />
                              </Grid>

                              <Grid
                                size={{ xs: 12, md: 7 }}
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  alignItems: "center",
                                }}
                              >
                                <IconButton
                                  color="error"
                                  aria-label="Remove package"
                                  onClick={() => removeFixedPackage(item.originalIndex)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                <Divider sx={{ mt: 3 }} />
              </Box>
            );
          })}
        </CardContent>
      </Card>

      {/* SAVE BUTTON */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Settings and Prices"}
        </Button>
      </Box>
    </Box>
  );
}
