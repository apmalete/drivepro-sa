import db from "../database/database.js";

// ======================================
// GET ALL SCHOOLS
// ======================================

export const getSchools = (req, res) => {

  db.all(
    `
    SELECT
      id,
      schoolName,
      phone,
      email,
      address,
      registrationNumber,
      status,
      created_at
    FROM schools
    ORDER BY id DESC
    `,
    [],
    (err, rows) => {

      if (err) {

        console.error(
          "GET SCHOOLS ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json(
        rows || []
      );
    }
  );
};


// ======================================
// GET ONE SCHOOL
// ======================================

export const getSchool = (
  req,
  res
) => {

  const { id } =
    req.params;

  db.get(
    `
    SELECT
      id,
      schoolName,
      phone,
      email,
      address,
      registrationNumber,
      status,
      created_at
    FROM schools
    WHERE id = ?
    `,
    [id],
    (err, school) => {

      if (err) {

        console.error(
          "GET SCHOOL ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (!school) {

        return res.status(404).json({
          success: false,
          message:
            "School not found.",
        });
      }

      res.json(
        school
      );
    }
  );
};


// ======================================
// ADD SCHOOL
// ======================================

export const addSchool = (
  req,
  res
) => {

  const {
    schoolName,
    phone,
    email,
    address,
    registrationNumber,
    status,
  } = req.body;


  // ====================================
  // VALIDATION
  // ====================================

  if (
    !schoolName ||
    !String(schoolName).trim()
  ) {

    return res.status(400).json({
      success: false,
      message:
        "School name is required.",
    });
  }


  // ====================================
  // INSERT SCHOOL
  // ====================================

  db.run(
    `
    INSERT INTO schools
    (
      schoolName,
      phone,
      email,
      address,
      registrationNumber,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      String(
        schoolName
      ).trim(),

      phone || "",

      email || "",

      address || "",

      registrationNumber || "",

      status === "Inactive"
        ? "Inactive"
        : "Active",
    ],
    function (err) {

      if (err) {

        console.error(
          "ADD SCHOOL ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message:
            err.message,
        });
      }

      res.status(201).json({

        success:
          true,

        message:
          "School added successfully.",

        id:
          this.lastID,

      });

    }
  );
};


// ======================================
// UPDATE SCHOOL
// ======================================

export const updateSchool = (
  req,
  res
) => {

  const {
    id,
  } = req.params;

  const {
    schoolName,
    phone,
    email,
    address,
    registrationNumber,
    status,
  } = req.body;


  // ====================================
  // VALIDATION
  // ====================================

  if (
    !schoolName ||
    !String(schoolName).trim()
  ) {

    return res.status(400).json({
      success: false,
      message:
        "School name is required.",
    });
  }


  // ====================================
  // PROTECT SCHOOL 1
  // ====================================

  if (
    Number(id) === 1 &&
    status === "Inactive"
  ) {

    return res.status(403).json({
      success: false,
      message:
        "The main School 1 cannot be deactivated.",
    });
  }


  // ====================================
  // UPDATE SCHOOL
  // ====================================

  db.run(
    `
    UPDATE schools
    SET
      schoolName = ?,
      phone = ?,
      email = ?,
      address = ?,
      registrationNumber = ?,
      status = ?
    WHERE id = ?
    `,
    [
      String(
        schoolName
      ).trim(),

      phone || "",

      email || "",

      address || "",

      registrationNumber || "",

      status === "Inactive"
        ? "Inactive"
        : "Active",

      id,
    ],
    function (err) {

      if (err) {

        console.error(
          "UPDATE SCHOOL ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message:
            err.message,
        });
      }


      // ==================================
      // SCHOOL NOT FOUND
      // ==================================

      if (
        this.changes === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "School not found.",
        });
      }


      res.json({

        success:
          true,

        message:
          "School updated successfully.",

      });

    }
  );
};


// ======================================
// ACTIVATE / DEACTIVATE SCHOOL
// ======================================

export const updateSchoolStatus = (
  req,
  res
) => {

  const {
    id,
  } = req.params;

  const {
    status,
  } = req.body;


  // ====================================
  // VALIDATE STATUS
  // ====================================

  if (
    status !== "Active" &&
    status !== "Inactive"
  ) {

    return res.status(400).json({
      success: false,
      message:
        "Status must be Active or Inactive.",
    });
  }


  // ====================================
  // PROTECT SCHOOL 1
  // ====================================

  if (
    Number(id) === 1 &&
    status === "Inactive"
  ) {

    return res.status(403).json({
      success: false,
      message:
        "The main School 1 cannot be deactivated.",
    });
  }


  // ====================================
  // UPDATE STATUS
  // ====================================

  db.run(
    `
    UPDATE schools
    SET status = ?
    WHERE id = ?
    `,
    [
      status,
      id,
    ],
    function (err) {

      if (err) {

        console.error(
          "UPDATE SCHOOL STATUS ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message:
            err.message,
        });
      }


      // ==================================
      // SCHOOL NOT FOUND
      // ==================================

      if (
        this.changes === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "School not found.",
        });
      }


      // ==================================
      // SUCCESS
      // ==================================

      res.json({

        success:
          true,

        message:
          `School ${status.toLowerCase()} successfully.`,

      });

    }
  );
};


// ======================================
// DELETE SCHOOL
// ======================================

export const deleteSchool = (
  req,
  res
) => {

  const {
    id,
  } = req.params;


  // ====================================
  // PROTECT SCHOOL 1
  // ====================================

  if (
    Number(id) === 1
  ) {

    return res.status(403).json({
      success: false,
      message:
        "The main School 1 cannot be deleted.",
    });
  }


  // ====================================
  // DELETE SCHOOL
  // ====================================

  db.run(
    `
    DELETE FROM schools
    WHERE id = ?
    `,
    [id],
    function (err) {

      if (err) {

        console.error(
          "DELETE SCHOOL ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message:
            err.message,
        });
      }


      // ==================================
      // SCHOOL NOT FOUND
      // ==================================

      if (
        this.changes === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "School not found.",
        });
      }


      // ==================================
      // SUCCESS
      // ==================================

      res.json({

        success:
          true,

        message:
          "School deleted successfully.",

      });

    }
  );
};