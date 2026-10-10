import jwt from "jsonwebtoken";

// ==========================================
// JWT SECRET
// ==========================================

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "drivepro-sa-secret-key-change-later";


// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

export const authenticateUser = (
  req,
  res,
  next
) => {

  try {

    // ========================================
    // GET AUTHORIZATION HEADER
    // ========================================

    const authHeader =
      req.headers.authorization;


    // ========================================
    // CHECK HEADER
    // ========================================

    if (!authHeader) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });

    }


    // ========================================
    // CHECK BEARER
    // ========================================

    if (
      !authHeader.startsWith(
        "Bearer "
      )
    ) {

      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication format.",
      });

    }


    // ========================================
    // GET TOKEN
    // ========================================

    const token =
      authHeader.substring(7);


    // ========================================
    // VERIFY TOKEN
    // ========================================

    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      );


    // ========================================
    // STORE USER
    // ========================================

    req.user =
      decoded;


    // ========================================
    // CONTINUE
    // ========================================

    next();

  } catch (error) {

    console.error(
      "AUTHENTICATION ERROR:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired authentication token.",
    });

  }

};


// ==========================================
// SYSTEM ADMINISTRATOR ONLY
// ==========================================

export const requireSystemAdministrator = (
  req,
  res,
  next
) => {

  if (!req.user) {

    return res.status(401).json({
      success: false,
      message:
        "Authentication required.",
    });

  }


  if (
    req.user.role !==
    "System Administrator"
  ) {

    return res.status(403).json({
      success: false,
      message:
        "System Administrator access required.",
    });

  }


  next();

};


// ==========================================
// ADMINISTRATOR OR SYSTEM ADMINISTRATOR
// ==========================================

export const requireAdministrator = (
  req,
  res,
  next
) => {

  if (!req.user) {

    return res.status(401).json({
      success: false,
      message:
        "Authentication required.",
    });

  }


  if (
    req.user.role !==
      "Administrator" &&
    req.user.role !==
      "System Administrator"
  ) {

    return res.status(403).json({
      success: false,
      message:
        "Administrator access required.",
    });

  }


  next();

};


// ==========================================
// INSTRUCTOR ONLY
// ==========================================

export const requireInstructor = (
  req,
  res,
  next
) => {

  if (!req.user) {

    return res.status(401).json({
      success: false,
      message:
        "Authentication required.",
    });

  }


  if (
    req.user.role !==
    "Instructor"
  ) {

    return res.status(403).json({
      success: false,
      message:
        "Instructor access required.",
    });

  }


  next();

};


// ==========================================
// STUDENT ONLY
// ==========================================

export const requireStudent = (
  req,
  res,
  next
) => {

  if (!req.user) {

    return res.status(401).json({
      success: false,
      message:
        "Student access required.",
    });

  }


  if (
    req.user.role !==
    "Student"
  ) {

    return res.status(403).json({
      success: false,
      message:
        "Student access required.",
    });

  }


  next();

};


// ==========================================
// INSTRUCTOR OR ADMINISTRATOR
// ==========================================

export const requireInstructorOrAdministrator = (
  req,
  res,
  next
) => {

  if (!req.user) {

    return res.status(401).json({
      success: false,
      message:
        "Authentication required.",
    });

  }


  const allowedRoles = [
    "Instructor",
    "Administrator",
    "System Administrator",
  ];


  if (
    !allowedRoles.includes(
      req.user.role
    )
  ) {

    return res.status(403).json({
      success: false,
      message:
        "Instructor or administrator access required.",
    });

  }


  next();

};


// ==========================================
// STUDENT OR ADMINISTRATOR
// ==========================================

export const requireStudentOrAdministrator = (
  req,
  res,
  next
) => {

  if (!req.user) {

    return res.status(401).json({
      success: false,
      message:
        "Authentication required.",
    });

  }


  const allowedRoles = [
    "Student",
    "Administrator",
    "System Administrator",
  ];


  if (
    !allowedRoles.includes(
      req.user.role
    )
  ) {

    return res.status(403).json({
      success: false,
      message:
        "Student or administrator access required.",
    });

  }


  next();

};
// ==========================================
// SETTINGS ADMINISTRATOR ACCESS
// ==========================================

export const requireSettingsAdministrator = (
  req,
  res,
  next
) => {
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

  if (!Number.isInteger(Number(req.user.school_id)) ||
      Number(req.user.school_id) < 1) {
    return res.status(403).json({
      success: false,
      message: "Your account is not linked to a valid school.",
    });
  }

  next();
};
