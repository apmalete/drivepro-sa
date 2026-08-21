import db from "../database/database.js";

// =====================================================
// GET SCHOOL ID FROM AUTHENTICATED USER
// =====================================================

const getSchoolId = (req) => {
  const schoolId =
    Number(req.user?.school_id);

  if (!schoolId) {
    return null;
  }

  return schoolId;
};

// =====================================================
// GET ALL INSTRUCTORS
// =====================================================

export const getInstructors = (req, res) => {

  const schoolId =
    getSchoolId(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });
  }

  db.all(
    `
    SELECT *
    FROM instructors
    WHERE school_id = ?
    ORDER BY name
    `,
    [schoolId],
    (err, rows) => {

      if (err) {

        console.error(
          "GET INSTRUCTORS ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json(rows || []);
    }
  );
};

// =====================================================
// ADD INSTRUCTOR
// =====================================================

export const addInstructor = (req, res) => {

  const schoolId =
    getSchoolId(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });
  }

  const {
    name,
    phone,
    licence,
    experience,
    status,
  } = req.body;

  db.run(
    `
    INSERT INTO instructors
    (
      name,
      phone,
      licence,
      experience,
      status,
      school_id
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      name,
      phone,
      licence,
      experience,
      status || "Active",
      schoolId,
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

      res.json({
        success: true,
        id: this.lastID,
        message:
          "Instructor added successfully",
      });
    }
  );
};

// =====================================================
// UPDATE INSTRUCTOR
// =====================================================

export const updateInstructor = (req, res) => {

  const { id } =
    req.params;

  const schoolId =
    getSchoolId(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });
  }

  const {
    name,
    phone,
    licence,
    experience,
    status,
  } = req.body;

  db.run(
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
      status,
      id,
      schoolId,
    ],
    function (err) {

      if (err) {

        console.error(
          "UPDATE INSTRUCTOR ERROR:",
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
            "Instructor not found for this school.",
        });
      }

      res.json({
        success: true,
        message:
          "Instructor updated successfully",
      });
    }
  );
};

// =====================================================
// DELETE INSTRUCTOR
// =====================================================

export const deleteInstructor = (req, res) => {

  const { id } =
    req.params;

  const schoolId =
    getSchoolId(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });
  }

  db.run(
    `
    DELETE FROM instructors
    WHERE id = ?
      AND school_id = ?
    `,
    [
      id,
      schoolId,
    ],
    function (err) {

      if (err) {

        console.error(
          "DELETE INSTRUCTOR ERROR:",
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
            "Instructor not found for this school.",
        });
      }

      res.json({
        success: true,
        message:
          "Instructor deleted successfully",
      });
    }
  );
};