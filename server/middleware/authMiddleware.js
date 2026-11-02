
import jwt from "jsonwebtoken";

// =====================================================
// JWT SECRET
// =====================================================

const JWT_SECRET = process.env.JWT_SECRET;

// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

export const authenticateUser = (req, res, next) => {
  try {
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        success: false,
        message: "Authentication service is not configured.",
      });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication format.",
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing.",
      });
    }

    // Verify only the expected signing algorithm.
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      !decoded ||
      !Number.isInteger(Number(decoded.id)) ||
      Number(decoded.id) <= 0 ||
      !decoded.role
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    req.user = decoded;

    return next();
  } catch (error) {
    console.error("AUTHENTICATION ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

// =====================================================
// SYSTEM ADMINISTRATOR ONLY
// =====================================================

export const requireSystemAdministrator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "System Administrator") {
    return res.status(403).json({
      success: false,
      message: "System Administrator access required.",
    });
  }

  return next();
};

// =====================================================
// ADMINISTRATOR OR SYSTEM ADMINISTRATOR
// =====================================================

export const requireAdministrator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const allowedRoles = [
    "Administrator",
    "System Administrator",
  ];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Administrator access required.",
    });
  }

  return next();
};

// =====================================================
// INSTRUCTOR ONLY
// =====================================================

export const requireInstructor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "Instructor") {
    return res.status(403).json({
      success: false,
      message: "Instructor access required.",
    });
  }

  return next();
};

// =====================================================
// STUDENT ONLY
// =====================================================

export const requireStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Student access required.",
    });
  }

  if (req.user.role !== "Student") {
    return res.status(403).json({
      success: false,
      message: "Student access required.",
    });
  }

  return next();
};

// =====================================================
// INSTRUCTOR OR ADMINISTRATOR
// =====================================================

export const requireInstructorOrAdministrator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const allowedRoles = [
    "Instructor",
    "Administrator",
    "System Administrator",
  ];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Instructor or administrator access required.",
    });
  }

  return next();
};

// =====================================================
// STUDENT OR ADMINISTRATOR
// =====================================================

export const requireStudentOrAdministrator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const allowedRoles = [
    "Student",
    "Administrator",
    "System Administrator",
  ];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Student or administrator access required.",
    });
  }

  return next();
};

// =====================================================
// SETTINGS ADMINISTRATOR ACCESS
// =====================================================

export const requireSettingsAdministrator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const allowedRoles = [
    "Admin",
    "Administrator",
    "System Administrator",
  ];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Administrator access required to manage school settings.",
    });
  }

  const schoolId = Number(req.user.school_id);

  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    return res.status(403).json({
      success: false,
      message: "Your account is not linked to a valid school.",
    });
  }

  return next();
};
