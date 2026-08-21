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
// SCHOOL ADMINISTRATOR OR SYSTEM ADMIN
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