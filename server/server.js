import express from "express";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import cors from "cors";
import fs from "fs";

import "./database/database.js";

// =====================================
// AUTHENTICATION
// =====================================

import {
  authenticateUser,
  requireSystemAdministrator,
  requireAdministrator,
} from "./middleware/authMiddleware.js";

// =====================================
// DASHBOARD
// =====================================

import {
  getDashboard,
  getTodayLessons,
  getDashboardAlerts,
} from "./controllers/dashboardController.js";

// =====================================
// STUDENTS
// =====================================

import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "./controllers/studentsController.js";

// =====================================
// LESSONS
// =====================================

import {
  getLessons,
  getStudentLessons,
  addLesson,
  updateLesson,
  deleteLesson,
} from "./controllers/lessonsController.js";

// =====================================
// INSTRUCTORS
// =====================================

import {
  getInstructors,
  addInstructor,
  updateInstructor,
  deleteInstructor,
} from "./controllers/instructorsController.js";

// =====================================
// VEHICLES
// =====================================

import {
  getVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
} from "./controllers/vehiclesController.js";

// =====================================
// PAYMENTS
// =====================================

import {
  getPayments,
  getStudentPayments,
  addPayment,
  updatePayment,
  deletePayment,
} from "./controllers/paymentsController.js";

// =====================================
// USERS
// =====================================

import {
  loginUser,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
} from "./controllers/usersController.js";

// =====================================
// REPORTS
// =====================================

import {
  getFinancialReport,
} from "./controllers/reportController.js";

// =====================================
// SETTINGS
// =====================================

import {
  getSettings,
  updateSettings,
} from "./controllers/settingsController.js";

// =====================================
// SCHOOLS
// =====================================

import {
  getSchools,
  getSchool,
  addSchool,
  updateSchool,
  updateSchoolStatus,
  deleteSchool,
} from "./controllers/schoolsController.js";

// =====================================
// APP
// =====================================

const app = express();

// =====================================
// PATHS
// =====================================

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

// =====================================
// CORS
// =====================================

app.use(
  cors({
    origin: [
  "http://localhost:5173",
  "https://drivepro-sa-production.up.railway.app",
  "https://drivepro-sa.co.za",
  "https://www.drivepro-sa.co.za",
],
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    optionsSuccessStatus: 204,
  })
);

// =====================================
// JSON
// =====================================

app.use(express.json());

// =====================================
// UPLOADS
// =====================================

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);

// =====================================
// FRONTEND
// =====================================

const frontendPath =
  path.join(
    __dirname,
    "..",
    "dist"
  );

app.use(
  express.static(
    frontendPath
  )
);

// =====================================
// HOME
// =====================================

app.get("/", (req, res) => {
  res.sendFile(
    path.join(
      frontendPath,
      "index.html"
    )
  );
});

// =====================================
// TEST
// =====================================

app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Server Working",
  });
});

// =====================================
// DASHBOARD
// =====================================

app.get(
  "/dashboard",
  authenticateUser,
  getDashboard
);

app.get(
  "/dashboard/today-lessons",
  authenticateUser,
  getTodayLessons
);

app.get(
  "/dashboard/alerts",
  authenticateUser,
  getDashboardAlerts
);

// =====================================
// USERS
// =====================================

// LOGIN DOES NOT REQUIRE AUTHENTICATION

app.post(
  "/login",
  loginUser
);

// USERS REQUIRE AUTHENTICATION

app.get(
  "/users",
  authenticateUser,
  getUsers
);

app.post(
  "/users",
  authenticateUser,
  addUser
);

app.put(
  "/users/:id",
  authenticateUser,
  updateUser
);

app.delete(
  "/users/:id",
  authenticateUser,
  deleteUser
);

// =====================================
// SETTINGS
// =====================================

app.get(
  "/settings",
  authenticateUser,
  getSettings
);

app.put(
  "/settings",
  authenticateUser,
  updateSettings
);

// =====================================
// SCHOOLS
// SYSTEM ADMINISTRATOR ONLY
// =====================================

app.get(
  "/schools",
  authenticateUser,
  requireSystemAdministrator,
  getSchools
);

app.get(
  "/schools/:id",
  authenticateUser,
  requireSystemAdministrator,
  getSchool
);

app.post(
  "/schools",
  authenticateUser,
  requireSystemAdministrator,
  addSchool
);

app.put(
  "/schools/:id",
  authenticateUser,
  requireSystemAdministrator,
  updateSchool
);

app.patch(
  "/schools/:id/status",
  authenticateUser,
  requireSystemAdministrator,
  updateSchoolStatus
);

app.delete(
  "/schools/:id",
  authenticateUser,
  requireSystemAdministrator,
  deleteSchool
);

// =====================================
// STUDENTS
// =====================================

app.get(
  "/students",
  authenticateUser,
  getStudents
);

app.post(
  "/students",
  authenticateUser,
  addStudent
);

app.put(
  "/students/:id",
  authenticateUser,
  updateStudent
);

app.delete(
  "/students/:id",
  authenticateUser,
  deleteStudent
);

// =====================================
// LESSONS
// =====================================

app.get(
  "/lessons",
  authenticateUser,
  getLessons
);

app.get(
  "/lessons/student/:studentName",
  authenticateUser,
  getStudentLessons
);

app.post(
  "/lessons",
  authenticateUser,
  addLesson
);

app.put(
  "/lessons/:id",
  authenticateUser,
  updateLesson
);

app.delete(
  "/lessons/:id",
  authenticateUser,
  deleteLesson
);

// =====================================
// INSTRUCTORS
// =====================================

app.get(
  "/instructors",
  authenticateUser,
  getInstructors
);

app.post(
  "/instructors",
  authenticateUser,
  addInstructor
);

app.put(
  "/instructors/:id",
  authenticateUser,
  updateInstructor
);

app.delete(
  "/instructors/:id",
  authenticateUser,
  deleteInstructor
);

// =====================================
// VEHICLES
// =====================================

app.get(
  "/vehicles",
  authenticateUser,
  getVehicles
);

app.post(
  "/vehicles",
  authenticateUser,
  addVehicle
);

app.put(
  "/vehicles/:id",
  authenticateUser,
  updateVehicle
);

app.delete(
  "/vehicles/:id",
  authenticateUser,
  deleteVehicle
);

// =====================================
// PAYMENTS
// =====================================

app.get(
  "/payments",
  authenticateUser,
  getPayments
);

app.get(
  "/payments/student/:studentId",
  authenticateUser,
  getStudentPayments
);

app.post(
  "/payments",
  authenticateUser,
  addPayment
);

app.put(
  "/payments/:id",
  authenticateUser,
  updatePayment
);

app.delete(
  "/payments/:id",
  authenticateUser,
  deletePayment
);

// =====================================
// REPORTS
// =====================================

app.get(
  "/reports/financial",
  authenticateUser,
  getFinancialReport
);

// =====================================
// PHOTO UPLOAD
// =====================================

const studentUploadDirectory =
  path.join(
    __dirname,
    "uploads",
    "students"
  );

if (
  !fs.existsSync(
    studentUploadDirectory
  )
) {
  fs.mkdirSync(
    studentUploadDirectory,
    {
      recursive: true,
    }
  );
}

// =====================================
// MULTER STORAGE
// =====================================

const storage =
  multer.diskStorage({

    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        studentUploadDirectory
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {

      const uniqueName =
        Date.now() +
        "-" +
        Math.round(
          Math.random() *
          1000000
        ) +
        path.extname(
          file.originalname
        );

      cb(
        null,
        uniqueName
      );
    },
  });

const upload =
  multer({
    storage,
  });

// =====================================
// STUDENT PHOTO UPLOAD
// =====================================

app.post(
  "/upload/student-photo",
  authenticateUser,
  upload.single("photo"),
  (req, res) => {

    if (!req.file) {

      return res.status(400).json({
        success: false,
        message:
          "No file uploaded",
      });
    }

    res.json({
      success: true,
      filename:
        req.file.filename,

      path:
        `/uploads/students/${req.file.filename}`,
    });
  }
);

// =====================================
// 404 HANDLER
// =====================================

app.use(
  (req, res) => {

    res.status(404).json({
      success: false,
      message:
        `Route not found: ${req.method} ${req.originalUrl}`,
    });
  }
);

// =====================================
// SERVER
// =====================================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `🚀 Server running on port ${PORT}`
    );
  }
);
