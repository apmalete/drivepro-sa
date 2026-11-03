
import "dotenv/config";

import express from "express";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import cors from "cors";
import fs from "fs";

import db from "./database/database.js";
import "./studentProgressDatabase.js";

import {
  isWhatsAppConfigured,
  sendDriveProTestMessage,
} from "./services/whatsappService.js";

import whatsappWebhook from "./services/whatsappWebhook.js";

import {
  startWhatsAppReminderScheduler,
} from "./services/whatsappReminderScheduler.js";

import {
  authenticateUser,
  requireSystemAdministrator,
  requireAdministrator,
  requireSettingsAdministrator,
} from "./middleware/authMiddleware.js";

import { getMe } from "./controllers/meController.js";

import {
  getDashboard,
  getTodayLessons,
  getDashboardAlerts,
} from "./controllers/dashboardController.js";

import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "./controllers/studentsController.js";

import {
  getStudentProgress,
  addStudentProgress,
} from "./controllers/studentProgressController.js";

import {
  getLessons,
  getStudentLessons,
  addLesson,
  updateLesson,
  deleteLesson,
} from "./controllers/lessonsController.js";

import {
  getTestBookings,
  getStudentTestBookings,
  addTestBooking,
  updateTestBooking,
  updateTestBookingStatus,
  deleteTestBooking,
} from "./controllers/testBookingsController.js";

import {
  getInstructors,
  addInstructor,
  updateInstructor,
  deleteInstructor,
} from "./controllers/instructorsController.js";

import {
  getVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
} from "./controllers/vehiclesController.js";

import {
  getPayments,
  getStudentPayments,
  addPayment,
  updatePayment,
  deletePayment,
} from "./controllers/paymentsController.js";

import {
  loginUser,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
} from "./controllers/usersController.js";

import { getFinancialReport } from "./controllers/reportController.js";

import {
  getSettings,
  updateSettings,
  getLessonPackagePrices,
  updateLessonPackagePrices,
  getFixedLessonPackages,
  updateFixedLessonPackages,
} from "./controllers/settingsController.js";

import {
  getAppLogo,
  saveAppLogo,
} from "./controllers/appLogoController.js";

import {
  getSchools,
  getSchool,
  addSchool,
  updateSchool,
  updateSchoolStatus,
  deleteSchool,
} from "./controllers/schoolsController.js";

import {
  getPublicBookingSchools,
  getPublicBookingInstructors,
  getPublicBookingPricing,
  createPublicLessonRequest,
  getLessonBookingRequests,
  updateLessonBookingRequestStatus,
  scheduleLessonFromRequest,
} from "./controllers/publicBookingController.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================================
// UPLOAD STORAGE
// LOCAL: server/uploads
// RAILWAY: /app/data/uploads (persistent volume)
// =====================================================

const uploadRoot =
  process.env.NODE_ENV === "production"
    ? "/app/data/uploads"
    : path.join(__dirname, "uploads");

const studentUploadDirectory = path.join(uploadRoot, "students");
const schoolLogoUploadDirectory = path.join(uploadRoot, "schools");
const appLogoUploadDirectory = path.join(uploadRoot, "app");

for (const directory of [
  uploadRoot,
  studentUploadDirectory,
  schoolLogoUploadDirectory,
  appLogoUploadDirectory,
]) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://10.91.17.61:5173",
      "https://drivepro-sa-production.up.railway.app",
      "https://drivepro-sa.co.za",
      "https://www.drivepro-sa.co.za",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

// =====================================================
// WHATSAPP WEBHOOK
// IMPORTANT: Must be before express.json()
// =====================================================

app.use("/webhooks/whatsapp", whatsappWebhook);

app.use(express.json());

// Serve uploaded files from the selected storage directory.
// Public URLs remain /uploads/...
app.use("/uploads", express.static(uploadRoot));

const frontendPath = path.join(__dirname, "..", "dist");

app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.get("/test", (req, res) => {
  res.json({ success: true, message: "Server Working" });
});

// =====================================================
// WHATSAPP
// =====================================================

app.get("/whatsapp/status", authenticateUser, (req, res) => {
  res.json({
    success: true,
    configured: isWhatsAppConfigured(),
    message: isWhatsAppConfigured()
      ? "WhatsApp is configured."
      : "WhatsApp access token is not configured yet.",
  });
});

app.post("/whatsapp/test", authenticateUser, async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    if (!isWhatsAppConfigured()) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp is not configured.",
      });
    }

    const result = await sendDriveProTestMessage(phoneNumber);

    return res.json({
      success: true,
      message: "WhatsApp test message sent.",
      result,
    });
  } catch (error) {
    console.error("WHATSAPP TEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send WhatsApp test message.",
    });
  }
});

// =====================================================
// FRONTEND ROUTING
// =====================================================

app.use((req, res, next) => {
  if (
    req.method === "GET" &&
    req.headers["sec-fetch-dest"] === "document" &&
    req.accepts("html")
  ) {
    return res.sendFile(path.join(frontendPath, "index.html"));
  }

  next();
});

// =====================================================
// DASHBOARD
// =====================================================

app.get("/dashboard", authenticateUser, getDashboard);
app.get("/dashboard/today-lessons", authenticateUser, getTodayLessons);
app.get("/dashboard/alerts", authenticateUser, getDashboardAlerts);

// =====================================================
// USERS AND LOGIN
// =====================================================

app.post("/login", loginUser);
app.get("/me", authenticateUser, getMe);

app.get(
  "/users",
  authenticateUser,
  requireAdministrator,
  getUsers
);

app.post(
  "/users",
  authenticateUser,
  requireAdministrator,
  addUser
);

app.put(
  "/users/:id",
  authenticateUser,
  requireAdministrator,
  updateUser
);

app.delete(
  "/users/:id",
  authenticateUser,
  requireAdministrator,
  deleteUser
);

// =====================================================
// SETTINGS
// =====================================================

app.get("/settings", authenticateUser, requireSettingsAdministrator, getSettings);
app.put("/settings", authenticateUser, requireSettingsAdministrator, updateSettings);

app.get(
  "/settings/lesson-package-prices",
  authenticateUser,
  requireSettingsAdministrator,
  getLessonPackagePrices
);

app.get(
  "/settings/fixed-lesson-packages",
  authenticateUser,
  requireSettingsAdministrator,
  getFixedLessonPackages
);

app.put(
  "/settings/fixed-lesson-packages",
  authenticateUser,
  requireSettingsAdministrator,
  updateFixedLessonPackages
);

app.put(
  "/settings/lesson-package-prices",
  authenticateUser,
  requireSettingsAdministrator,
  updateLessonPackagePrices
);

// =====================================================
// APPLICATION LOGO
// =====================================================

app.get("/app-logo", authenticateUser, getAppLogo);

app.put(
  "/app-logo",
  authenticateUser,
  requireSystemAdministrator,
  saveAppLogo
);

// =====================================================
// LOGO FOR AUTHENTICATED USER'S SCHOOL
// =====================================================

app.get("/my-school-logo", authenticateUser, (req, res) => {
  const user = req.user;
  const role = String(user?.role || "").trim().toLowerCase();
  const schoolId = Number(user?.school_id);

  if (role === "system administrator") {
    return res.json({
      success: true,
      logo: "",
    });
  }

  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    return res.status(403).json({
      success: false,
      message: "User is not assigned to a valid school.",
    });
  }

  db.get(
    "SELECT logo FROM schools WHERE id = ?",
    [schoolId],
    (err, school) => {
      if (err) {
        console.error("MY SCHOOL LOGO ERROR:", err.message);

        return res.status(500).json({
          success: false,
          message: "Could not load the school logo.",
        });
      }

      return res.json({
        success: true,
        logo: school?.logo || "",
      });
    }
  );
});

// =====================================================
// SCHOOLS
// =====================================================

app.get("/schools", authenticateUser, requireSystemAdministrator, getSchools);
app.get("/schools/:id", authenticateUser, requireSystemAdministrator, getSchool);
app.post("/schools", authenticateUser, requireSystemAdministrator, addSchool);
app.put("/schools/:id", authenticateUser, requireSystemAdministrator, updateSchool);
app.patch("/schools/:id/status", authenticateUser, requireSystemAdministrator, updateSchoolStatus);
app.delete("/schools/:id", authenticateUser, requireSystemAdministrator, deleteSchool);

// =====================================================
// STUDENTS
// =====================================================

app.get("/students", authenticateUser, getStudents);
app.post("/students", authenticateUser, addStudent);
app.put("/students/:id", authenticateUser, updateStudent);
app.delete("/students/:id", authenticateUser, deleteStudent);

// =====================================================
// STUDENT PROGRESS
// =====================================================

app.get("/student-progress/student/:studentId", authenticateUser, getStudentProgress);
app.post("/student-progress", authenticateUser, addStudentProgress);

// =====================================================
// LESSONS
// =====================================================

app.get("/lessons", authenticateUser, getLessons);
app.get("/lessons/student/:studentName", authenticateUser, getStudentLessons);
app.post("/lessons", authenticateUser, addLesson);
app.put("/lessons/:id", authenticateUser, updateLesson);
app.delete("/lessons/:id", authenticateUser, deleteLesson);

// =====================================================
// PUBLIC LESSON BOOKING
// =====================================================

app.get("/public/booking/schools", getPublicBookingSchools);

app.get(
  "/public/booking/schools/:schoolId/instructors",
  getPublicBookingInstructors
);

app.get(
  "/public/booking/schools/:schoolId/pricing",
  getPublicBookingPricing
);

const resolvePublicBookingCode = (req, res, next) => {
  const bookingCode = String(req.params.bookingCode || "").trim();

  if (!/^[a-f0-9]{24}$/.test(bookingCode)) {
    return res.status(404).json({
      success: false,
      message: "This driving school booking link is invalid.",
    });
  }

  db.get(
    `SELECT id
     FROM schools
     WHERE booking_code = ?
       AND LOWER(TRIM(status)) = 'active'
     LIMIT 1`,
    [bookingCode],
    (err, school) => {
      if (err) {
        console.error("BOOKING CODE LOOKUP ERROR:", err.message);

        return res.status(500).json({
          success: false,
          message: "Could not verify this booking link.",
        });
      }

      if (!school) {
        return res.status(404).json({
          success: false,
          message: "This driving school booking link is invalid or inactive.",
        });
      }

      req.publicBookingSchoolId = school.id;
      req.params.schoolId = String(school.id);

      next();
    }
  );
};

app.get(
  "/public/booking/link/:bookingCode/instructors",
  resolvePublicBookingCode,
  getPublicBookingInstructors
);

app.get(
  "/public/booking/link/:bookingCode/pricing",
  resolvePublicBookingCode,
  getPublicBookingPricing
);

app.post(
  "/public/booking/link/:bookingCode/requests",
  resolvePublicBookingCode,
  (req, res, next) => {
    req.body = {
      ...(req.body || {}),
      school_id: req.publicBookingSchoolId,
    };

    return createPublicLessonRequest(req, res, next);
  }
);

app.post(
  "/public/booking/schools/:schoolId/requests",
  (req, res, next) => {
    const routeSchoolId = Number(req.params.schoolId);

    if (!Number.isInteger(routeSchoolId) || routeSchoolId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid driving school ID.",
      });
    }

    const submittedSchoolId = req.body?.school_id;

    if (
      submittedSchoolId !== undefined &&
      submittedSchoolId !== null &&
      Number(submittedSchoolId) !== routeSchoolId
    ) {
      return res.status(403).json({
        success: false,
        message: "The selected school does not match this booking link.",
      });
    }

    req.body = {
      ...(req.body || {}),
      school_id: routeSchoolId,
    };

    return createPublicLessonRequest(req, res, next);
  }
);

app.post("/public/booking/requests", createPublicLessonRequest);

// =====================================================
// ADMINISTRATIVE BOOKING REQUESTS
// =====================================================

app.get(
  "/lesson-booking-requests",
  authenticateUser,
  getLessonBookingRequests
);

app.patch(
  "/lesson-booking-requests/:id/status",
  authenticateUser,
  updateLessonBookingRequestStatus
);

app.post(
  "/lesson-booking-requests/:id/schedule",
  authenticateUser,
  scheduleLessonFromRequest
);

// =====================================================
// TEST BOOKINGS
// =====================================================

app.get("/test-bookings", authenticateUser, getTestBookings);
app.get("/test-bookings/student/:studentId", authenticateUser, getStudentTestBookings);
app.post("/test-bookings", authenticateUser, addTestBooking);
app.put("/test-bookings/:id", authenticateUser, updateTestBooking);
app.patch("/test-bookings/:id/status", authenticateUser, updateTestBookingStatus);
app.delete("/test-bookings/:id", authenticateUser, deleteTestBooking);

// =====================================================
// INSTRUCTORS
// =====================================================

app.get("/instructors", authenticateUser, getInstructors);
app.post("/instructors", authenticateUser, addInstructor);
app.put("/instructors/:id", authenticateUser, updateInstructor);
app.delete("/instructors/:id", authenticateUser, deleteInstructor);

// =====================================================
// VEHICLES
// =====================================================

app.get("/vehicles", authenticateUser, getVehicles);
app.post("/vehicles", authenticateUser, addVehicle);
app.put("/vehicles/:id", authenticateUser, updateVehicle);
app.delete("/vehicles/:id", authenticateUser, deleteVehicle);

// =====================================================
// PAYMENTS
// =====================================================

app.get("/payments", authenticateUser, getPayments);
app.get("/payments/student/:studentId", authenticateUser, getStudentPayments);
app.post("/payments", authenticateUser, addPayment);
app.put("/payments/:id", authenticateUser, updatePayment);
app.delete("/payments/:id", authenticateUser, deletePayment);

// =====================================================
// REPORTS
// =====================================================

app.get("/reports/financial", authenticateUser, getFinancialReport);

// =====================================================
// STUDENT PHOTO UPLOAD
// =====================================================

const studentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, studentUploadDirectory),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1000000)}${extension}`
    );
  },
});

const uploadStudentPhoto = multer({
  storage: studentStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// =====================================================
// LOGO FILE TYPES
// =====================================================

const allowedLogoTypes = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/webp", ".webp"],
]);

const makeLogoUpload = (directory) =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, directory),
      filename: (req, file, cb) => {
        const extension = allowedLogoTypes.get(file.mimetype);

        cb(
          null,
          `${Date.now()}-${Math.round(Math.random() * 1000000)}${extension}`
        );
      },
    }),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!allowedLogoTypes.has(file.mimetype)) {
        return cb(
          new Error("Please upload a PNG, JPG, JPEG, or WebP logo.")
        );
      }

      cb(null, true);
    },
  });

const uploadSchoolLogo = makeLogoUpload(schoolLogoUploadDirectory);
const uploadAppLogo = makeLogoUpload(appLogoUploadDirectory);

// =====================================================
// SCHOOL LOGO UPLOAD
// =====================================================

app.post(
  "/upload/school-logo",
  authenticateUser,
  requireSystemAdministrator,
  uploadSchoolLogo.single("logo"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No logo file was uploaded.",
      });
    }

    return res.json({
      success: true,
      filename: req.file.filename,
      path: `/uploads/schools/${req.file.filename}`,
    });
  }
);

// =====================================================
// MAIN APP LOGO UPLOAD
// =====================================================

app.post(
  "/upload/app-logo",
  authenticateUser,
  requireSystemAdministrator,
  uploadAppLogo.single("logo"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No main logo file was uploaded.",
      });
    }

    return res.json({
      success: true,
      filename: req.file.filename,
      path: `/uploads/app/${req.file.filename}`,
    });
  }
);

// =====================================================
// STUDENT PHOTO ROUTE
// =====================================================

app.post(
  "/upload/student-photo",
  authenticateUser,
  uploadStudentPhoto.single("photo"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    return res.json({
      success: true,
      filename: req.file.filename,
      path: `/uploads/students/${req.file.filename}`,
    });
  }
);

// =====================================================
// UPLOAD ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "The file is too large. Please use an image within the size limit."
        : err.message;

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (
    err.message ===
    "Please upload a PNG, JPG, JPEG, or WebP logo."
  ) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  console.error("SERVER ERROR:", err);

  return res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
});

// =====================================================
// 404
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
  console.log("WhatsApp configured: " + isWhatsAppConfigured());
  console.log("Upload storage directory: " + uploadRoot);
  console.log("Production storage: " + (process.env.NODE_ENV === "production"));
  startWhatsAppReminderScheduler();
});
