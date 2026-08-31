import db from "../database/database.js";

// ======================================
// SCHOOL DATABASE COLUMN HELPER
// ======================================
//
// This application has existed with two
// versions of the schools table:
//
// OLD / RAILWAY:
//   name
//   schoolName
//
// CURRENT / LOCAL:
//   schoolName
//
// This helper checks the actual database
// before running INSERT / UPDATE queries.
// ======================================

const getSchoolColumns = (callback) => {
  db.all(
    `PRAGMA table_info(schools)`,
    [],
    (err, rows) => {
      if (err) {
        console.error(
          "SCHOOLS COLUMN CHECK ERROR:",
          err.message
        );

        return callback(err);
      }

      const columns = new Set(
        (rows || []).map(
          (row) => row.name
        )
      );

      callback(null, columns);
    }
  );
};


// ======================================
// GET SCHOOL NAME SQL EXPRESSION
// ======================================
//
// Always return the API field as
// "schoolName", regardless of whether
// the database has:
//
//   schoolName
//
// or:
//
//   name
//
// or both.
// ======================================

const getSchoolNameExpression = (
  columns
) => {

  if (
    columns.has("schoolName") &&
    columns.has("name")
  ) {
    return `
      COALESCE(
        NULLIF(schoolName, ''),
        name
      ) AS schoolName
    `;
  }

  if (
    columns.has("schoolName")
  ) {
    return `
      schoolName AS schoolName
    `;
  }

  if (
    columns.has("name")
  ) {
    return `
      name AS schoolName
    `;
  }

  throw new Error(
    "Schools table has neither schoolName nor name column."
  );
};


// ======================================
// GET ALL SCHOOLS
// ======================================

export const getSchools = (
  req,
  res
) => {

  getSchoolColumns(
    (columnError, columns) => {

      if (columnError) {
        return res.status(500).json({
          success: false,
          message: columnError.message,
        });
      }

      let schoolNameExpression;

      try {
        schoolNameExpression =
          getSchoolNameExpression(
            columns
          );
      } catch (error) {
        console.error(
          "GET SCHOOLS COLUMN ERROR:",
          error.message
        );

        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }

      db.all(
        `
        SELECT
          id,
          ${schoolNameExpression},
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

          res.json(rows || []);
        }
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

  const { id } = req.params;

  getSchoolColumns(
    (columnError, columns) => {

      if (columnError) {
        return res.status(500).json({
          success: false,
          message: columnError.message,
        });
      }

      let schoolNameExpression;

      try {
        schoolNameExpression =
          getSchoolNameExpression(
            columns
          );
      } catch (error) {
        console.error(
          "GET SCHOOL COLUMN ERROR:",
          error.message
        );

        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }

      db.get(
        `
        SELECT
          id,
          ${schoolNameExpression},
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

          res.json(school);
        }
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

  const cleanSchoolName =
    String(schoolName).trim();

  const cleanStatus =
    status === "Inactive"
      ? "Inactive"
      : "Active";

  // ====================================
  // CHECK DATABASE COLUMNS
  // ====================================

  getSchoolColumns(
    (columnError, columns) => {

      if (columnError) {
        return res.status(500).json({
          success: false,
          message: columnError.message,
        });
      }

      // ==================================
      // BUILD INSERT COLUMNS
      // ==================================

      const insertColumns = [];
      const insertValues = [];

      // ----------------------------------
      // LEGACY `name`
      // ----------------------------------

      if (
        columns.has("name")
      ) {
        insertColumns.push("name");
        insertValues.push(
          cleanSchoolName
        );
      }

      // ----------------------------------
      // CURRENT `schoolName`
      // ----------------------------------

      if (
        columns.has("schoolName")
      ) {
        insertColumns.push(
          "schoolName"
        );

        insertValues.push(
          cleanSchoolName
        );
      }

      // ----------------------------------
      // Other fields
      // ----------------------------------

      if (
        columns.has("phone")
      ) {
        insertColumns.push("phone");
        insertValues.push(
          phone || ""
        );
      }

      if (
        columns.has("email")
      ) {
        insertColumns.push("email");
        insertValues.push(
          email || ""
        );
      }

      if (
        columns.has("address")
      ) {
        insertColumns.push("address");
        insertValues.push(
          address || ""
        );
      }

      if (
        columns.has(
          "registrationNumber"
        )
      ) {
        insertColumns.push(
          "registrationNumber"
        );

        insertValues.push(
          registrationNumber || ""
        );
      }

      if (
        columns.has("status")
      ) {
        insertColumns.push("status");

        insertValues.push(
          cleanStatus
        );
      }

      // ==================================
      // SAFETY CHECK
      // ==================================

      if (
        !columns.has("name") &&
        !columns.has("schoolName")
      ) {
        console.error(
          "ADD SCHOOL ERROR: schools table has no name/schoolName column."
        );

        return res.status(500).json({
          success: false,
          message:
            "Schools database is missing the school name column.",
        });
      }

      // ==================================
      // CREATE PLACEHOLDERS
      // ==================================

      const placeholders =
        insertValues
          .map(() => "?")
          .join(", ");

      // ==================================
      // INSERT SCHOOL
      // ==================================

      db.run(
        `
        INSERT INTO schools
        (
          ${insertColumns.join(", ")}
        )
        VALUES
        (
          ${placeholders}
        )
        `,
        insertValues,
        function (err) {

          if (err) {
            console.error(
              "ADD SCHOOL ERROR:",
              err.message
            );

            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }

          res.status(201).json({
            success: true,
            message:
              "School added successfully.",
            id: this.lastID,
          });
        }
      );
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

  const { id } = req.params;

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

  const cleanSchoolName =
    String(schoolName).trim();

  const cleanStatus =
    status === "Inactive"
      ? "Inactive"
      : "Active";

  // ====================================
  // CHECK DATABASE COLUMNS
  // ====================================

  getSchoolColumns(
    (columnError, columns) => {

      if (columnError) {
        return res.status(500).json({
          success: false,
          message: columnError.message,
        });
      }

      // ==================================
      // BUILD UPDATE SET CLAUSES
      // ==================================

      const setClauses = [];
      const updateValues = [];

      // ----------------------------------
      // LEGACY `name`
      // ----------------------------------

      if (
        columns.has("name")
      ) {
        setClauses.push(
          "name = ?"
        );

        updateValues.push(
          cleanSchoolName
        );
      }

      // ----------------------------------
      // CURRENT `schoolName`
      // ----------------------------------

      if (
        columns.has("schoolName")
      ) {
        setClauses.push(
          "schoolName = ?"
        );

        updateValues.push(
          cleanSchoolName
        );
      }

      // ----------------------------------
      // Other fields
      // ----------------------------------

      if (
        columns.has("phone")
      ) {
        setClauses.push(
          "phone = ?"
        );

        updateValues.push(
          phone || ""
        );
      }

      if (
        columns.has("email")
      ) {
        setClauses.push(
          "email = ?"
        );

        updateValues.push(
          email || ""
        );
      }

      if (
        columns.has("address")
      ) {
        setClauses.push(
          "address = ?"
        );

        updateValues.push(
          address || ""
        );
      }

      if (
        columns.has(
          "registrationNumber"
        )
      ) {
        setClauses.push(
          "registrationNumber = ?"
        );

        updateValues.push(
          registrationNumber || ""
        );
      }

      if (
        columns.has("status")
      ) {
        setClauses.push(
          "status = ?"
        );

        updateValues.push(
          cleanStatus
        );
      }

      // ==================================
      // SAFETY CHECK
      // ==================================

      if (
        setClauses.length === 0
      ) {
        return res.status(500).json({
          success: false,
          message:
            "No valid school columns were found.",
        });
      }

      // ==================================
      // ADD ID
      // ==================================

      updateValues.push(id);

      // ==================================
      // UPDATE SCHOOL
      // ==================================

      db.run(
        `
        UPDATE schools
        SET
          ${setClauses.join(", ")}
        WHERE id = ?
        `,
        updateValues,
        function (err) {

          if (err) {
            console.error(
              "UPDATE SCHOOL ERROR:",
              err.message
            );

            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }

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
            success: true,
            message:
              "School updated successfully.",
          });
        }
      );
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

  const { id } = req.params;

  const { status } = req.body;

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
          message: err.message,
        });
      }

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
        success: true,
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

  const { id } = req.params;

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
          message: err.message,
        });
      }

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
        success: true,
        message:
          "School deleted successfully.",
      });
    }
  );
};