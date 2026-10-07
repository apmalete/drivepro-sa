import db from "../database/database.js";

// =====================================================
// ROLE HELPERS
// =====================================================

const getRole = (req) => {
  return String(req.user?.role || "")
    .trim()
    .toLowerCase();
};

const isSystemAdministrator = (req) => {
  const role = getRole(req);

  return (
    role === "system administrator" ||
    String(req.user?.username || "").trim().toLowerCase() === "admin"
  );
};

const isSchoolAdministrator = (req) => {
  const role = getRole(req);

  return (
    role === "administrator" ||
    role === "admin" ||
    role === "school administrator" ||
    role === "school admin"
  );
};

const isReceptionist = (req) => {
  return getRole(req) === "receptionist";
};

const isInstructor = (req) => {
  return getRole(req) === "instructor";
};

// =====================================================
// GET SCHOOL ID
// =====================================================

const getSchoolId = (req) => {
  const schoolId = Number(req.user?.school_id);

  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    return null;
  }

  return schoolId;
};

// =====================================================
// GET INSTRUCTORS
//
// SYSTEM ADMINISTRATOR
// -> All instructors
//
// SCHOOL ADMINISTRATOR
// -> All instructors in own school
//
// RECEPTIONIST
// -> All instructors in own school
//
// INSTRUCTOR
// -> Only own instructor profile
//
// STUDENT
// -> Not allowed
// =====================================================

export const getInstructors = (req, res) => {
  // ===================================================
  // SYSTEM ADMINISTRATOR
  // ===================================================

  if (isSystemAdministrator(req)) {
    return db.all(
      `
      SELECT *
      FROM instructors
      ORDER BY school_id, name
      `,
      [],
      (err, rows) => {
        if (err) {
          console.error(
            "GET ALL INSTRUCTORS ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        return res.json(rows || []);
      }
    );
  }

  // ===================================================
  // SCHOOL ADMINISTRATOR OR RECEPTIONIST
  //
  // Both need to see instructors in order to make
  // lesson bookings.
  // ===================================================

  if (isSchoolAdministrator(req) || isReceptionist(req)) {
    const schoolId = getSchoolId(req);

    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: "School information not found.",
      });
    }

    return db.all(
      `
      SELECT *
      FROM instructors
      WHERE school_id = ?
        AND LOWER(TRIM(COALESCE(status, 'Active'))) != 'inactive'
      ORDER BY name
      `,
      [schoolId],
      (err, rows) => {
        if (err) {
          console.error(
            "GET SCHOOL INSTRUCTORS ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        return res.json(rows || []);
      }
    );
  }

  // ===================================================
  // INSTRUCTOR
  //
  // Instructor only sees own profile.
  // ===================================================

  if (isInstructor(req)) {
    const schoolId = getSchoolId(req);
    const userId = Number(req.user?.id);

    if (!schoolId || !userId) {
      return res.status(403).json({
        success: false,
        message:
          "Instructor account information not found.",
      });
    }

    return db.all(
      `
      SELECT *
      FROM instructors
      WHERE user_id = ?
        AND school_id = ?
      LIMIT 1
      `,
      [userId, schoolId],
      (err, rows) => {
        if (err) {
          console.error(
            "GET OWN INSTRUCTOR PROFILE ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        return res.json(rows || []);
      }
    );
  }

  // ===================================================
  // ALL OTHER ROLES
  // ===================================================

  return res.status(403).json({
    success: false,
    message:
      "You are not authorised to view instructor profiles.",
  });
};

// =====================================================
// ADD INSTRUCTOR
//
// ONLY:
// - System Administrator
// - School Administrator
//
// RECEPTIONIST CANNOT ADD INSTRUCTORS.
// =====================================================

export const addInstructor = (req, res) => {
  if (
    !isSystemAdministrator(req) &&
    !isSchoolAdministrator(req)
  ) {
    return res.status(403).json({
      success: false,
      message:
        "You are not authorised to add instructors.",
    });
  }

  const {
    name,
    phone,
    licence,
    experience,
    status,
    school_id,
  } = req.body;

  let targetSchoolId;

  // ---------------------------------------------------
  // SYSTEM ADMINISTRATOR
  // ---------------------------------------------------

  if (isSystemAdministrator(req)) {
    targetSchoolId =
      Number(school_id) ||
      getSchoolId(req);
  }

  // ---------------------------------------------------
  // SCHOOL ADMINISTRATOR
  // ---------------------------------------------------

  if (isSchoolAdministrator(req)) {
    targetSchoolId = getSchoolId(req);
  }

  if (!targetSchoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

  if (!name || !phone || !licence || !experience) {
    return res.status(400).json({
      success: false,
      message:
        "Please complete all instructor fields.",
    });
  }

  // ---------------------------------------------------
  // FIND EXISTING INSTRUCTOR USER ACCOUNT
  // ---------------------------------------------------

  db.get(
    `
    SELECT id
    FROM users
    WHERE school_id = ?
      AND LOWER(TRIM(fullname)) =
          LOWER(TRIM(?))
      AND LOWER(TRIM(role)) = 'instructor'
    LIMIT 1
    `,
    [targetSchoolId, name],
    (userErr, userRow) => {
      if (userErr) {
        console.error(
          "FIND INSTRUCTOR USER ERROR:",
          userErr.message
        );

        return res.status(500).json({
          success: false,
          message: userErr.message,
        });
      }

      const linkedUserId = userRow?.id || null;

      db.run(
        `
        INSERT INTO instructors
        (
          name,
          phone,
          licence,
          experience,
          status,
          school_id,
          user_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          name,
          phone,
          licence,
          experience,
          status || "Active",
          targetSchoolId,
          linkedUserId,
        ],
        function (err) {
          if (err) {
            console.error(
              "ADD INSTRUCTOR ERROR:",
              err.message
            );

            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }

          return res.json({
            success: true,
            id: this.lastID,
            message:
              "Instructor added successfully",
            user_id: linkedUserId,
          });
        }
      );
    }
  );
};

// =====================================================
// UPDATE INSTRUCTOR
//
// ONLY:
// - System Administrator
// - School Administrator
//
// RECEPTIONIST CANNOT EDIT INSTRUCTORS.
// =====================================================

export const updateInstructor = (req, res) => {
  if (
    !isSystemAdministrator(req) &&
    !isSchoolAdministrator(req)
  ) {
    return res.status(403).json({
      success: false,
      message:
        "You are not authorised to edit instructors.",
    });
  }

  const { id } = req.params;

  const {
    name,
    phone,
    licence,
    experience,
    status,
  } = req.body;

  if (!name || !phone || !licence || !experience) {
    return res.status(400).json({
      success: false,
      message:
        "Please complete all instructor fields.",
    });
  }

  // ===================================================
  // SYSTEM ADMINISTRATOR
  // ===================================================

  if (isSystemAdministrator(req)) {
    return db.run(
      `
      UPDATE instructors
      SET
        name = ?,
        phone = ?,
        licence = ?,
        experience = ?,
        status = ?
      WHERE id = ?
      `,
      [
        name,
        phone,
        licence,
        experience,
        status || "Active",
        id,
      ],
      function (err) {
        if (err) {
          console.error(
            "SYSTEM ADMIN UPDATE INSTRUCTOR ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message: "Instructor not found.",
          });
        }

        return res.json({
          success: true,
          message:
            "Instructor updated successfully",
        });
      }
    );
  }

  // ===================================================
  // SCHOOL ADMINISTRATOR
  // ===================================================

  const schoolId = getSchoolId(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

  return db.run(
    `
    UPDATE instructors
    SET
      name = ?,
      phone = ?,
      licence = ?,
      experience = ?,
      status = ?
    WHERE id = ?
      AND school_id = ?
    `,
    [
      name,
      phone,
      licence,
      experience,
      status || "Active",
      id,
      schoolId,
    ],
    function (err) {
      if (err) {
        console.error(
          "SCHOOL ADMIN UPDATE INSTRUCTOR ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Instructor not found for your school.",
        });
      }

      return res.json({
        success: true,
        message:
          "Instructor updated successfully",
      });
    }
  );
};

// =====================================================
// DELETE INSTRUCTOR
//
// ONLY:
// - System Administrator
// - School Administrator
// =====================================================

export const deleteInstructor = (req, res) => {
  if (
    !isSystemAdministrator(req) &&
    !isSchoolAdministrator(req)
  ) {
    return res.status(403).json({
      success: false,
      message:
        "You are not authorised to delete instructors.",
    });
  }

  const { id } = req.params;

  // ===================================================
  // SYSTEM ADMINISTRATOR
  // ===================================================

  if (isSystemAdministrator(req)) {
    return db.run(
      `
      DELETE FROM instructors
      WHERE id = ?
      `,
      [id],
      function (err) {
        if (err) {
          console.error(
            "SYSTEM ADMIN DELETE INSTRUCTOR ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message: "Instructor not found.",
          });
        }

        return res.json({
          success: true,
          message:
            "Instructor deleted successfully",
        });
      }
    );
  }

  // ===================================================
  // SCHOOL ADMINISTRATOR
  // ===================================================

  const schoolId = getSchoolId(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

  return db.run(
    `
    DELETE FROM instructors
    WHERE id = ?
      AND school_id = ?
    `,
    [id, schoolId],
    function (err) {
      if (err) {
        console.error(
          "SCHOOL ADMIN DELETE INSTRUCTOR ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Instructor not found for your school.",
        });
      }

      return res.json({
        success: true,
        message:
          "Instructor deleted successfully",
      });
    }
  );
};