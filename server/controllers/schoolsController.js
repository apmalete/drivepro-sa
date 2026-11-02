
import db from "../database/database.js";
import { randomBytes } from "crypto";

// ======================================
// SCHOOL DATABASE COLUMN HELPER
// ======================================

const getSchoolColumns = (callback) => {
  db.all("PRAGMA table_info(schools)", [], (err, rows) => {
    if (err) return callback(err);

    callback(
      null,
      new Set((rows || []).map((row) => row.name))
    );
  });
};

// ======================================
// SCHOOL NAME EXPRESSION
// ======================================

const getSchoolNameExpression = (columns) => {
  if (columns.has("schoolName") && columns.has("name")) {
    return `COALESCE(NULLIF(schoolName, ''), name) AS schoolName`;
  }

  if (columns.has("schoolName")) return "schoolName AS schoolName";
  if (columns.has("name")) return "name AS schoolName";

  throw new Error("Schools table has neither schoolName nor name column.");
};

// ======================================
// GET ALL SCHOOLS
// ======================================

export const getSchools = (req, res) => {
  getSchoolColumns((err, columns) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    let nameExpression;

    try {
      nameExpression = getSchoolNameExpression(columns);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    const fields = [
      "id",
      nameExpression,
      ...[
        "phone",
        "email",
        "address",
        "registrationNumber",
        "status",
        "logo",
        "booking_code",
        "created_at",
      ]
        .filter((field) => columns.has(field))
        .map((field) => `"${field}"`),
    ];

    db.all(
      `SELECT ${fields.join(", ")} FROM schools ORDER BY id DESC`,
      [],
      (queryErr, rows) => {
        if (queryErr) {
          return res.status(500).json({
            success: false,
            message: queryErr.message,
          });
        }

        res.json(rows || []);
      }
    );
  });
};

// ======================================
// GET ONE SCHOOL
// ======================================

export const getSchool = (req, res) => {
  const { id } = req.params;

  getSchoolColumns((err, columns) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    let nameExpression;

    try {
      nameExpression = getSchoolNameExpression(columns);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    const fields = [
      "id",
      nameExpression,
      ...[
        "phone",
        "email",
        "address",
        "registrationNumber",
        "status",
        "logo",
        "booking_code",
        "created_at",
      ]
        .filter((field) => columns.has(field))
        .map((field) => `"${field}"`),
    ];

    db.get(
      `SELECT ${fields.join(", ")} FROM schools WHERE id = ?`,
      [id],
      (queryErr, school) => {
        if (queryErr) {
          return res.status(500).json({
            success: false,
            message: queryErr.message,
          });
        }

        if (!school) {
          return res.status(404).json({
            success: false,
            message: "School not found.",
          });
        }

        res.json(school);
      }
    );
  });
};

// ======================================
// ADD SCHOOL
// ======================================

export const addSchool = (req, res) => {
  const {
    schoolName,
    phone,
    email,
    address,
    registrationNumber,
    status,
    logo,
  } = req.body;

  if (!schoolName || !String(schoolName).trim()) {
    return res.status(400).json({
      success: false,
      message: "School name is required.",
    });
  }

  const cleanName = String(schoolName).trim();
  const cleanStatus = status === "Inactive" ? "Inactive" : "Active";

  getSchoolColumns((err, columns) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (!columns.has("booking_code")) {
      return res.status(500).json({
        success: false,
        message: "School booking code column is missing. Run the database migration first.",
      });
    }

    if (!columns.has("name") && !columns.has("schoolName")) {
      return res.status(500).json({
        success: false,
        message: "Schools database is missing the school name column.",
      });
    }

    // Generate a unique, random booking code.
    const bookingCode = randomBytes(12).toString("hex");

    const valuesByColumn = {
      name: cleanName,
      schoolName: cleanName,
      phone: phone || "",
      email: email || "",
      address: address || "",
      registrationNumber: registrationNumber || "",
      status: cleanStatus,
      logo: logo || "",
      booking_code: bookingCode,
    };

    const entries = Object.entries(valuesByColumn).filter(([column]) =>
      columns.has(column)
    );

    const columnNames = entries.map(([column]) => `"${column}"`);
    const values = entries.map(([, value]) => value);
    const placeholders = values.map(() => "?").join(", ");

    db.run(
      `INSERT INTO schools (${columnNames.join(", ")}) VALUES (${placeholders})`,
      values,
      function (insertErr) {
        if (insertErr) {
          console.error("ADD SCHOOL ERROR:", insertErr.message);

          return res.status(500).json({
            success: false,
            message: insertErr.message,
          });
        }

        res.status(201).json({
          success: true,
          message: "School added successfully.",
          id: this.lastID,
        });
      }
    );
  });
};

// ======================================
// UPDATE SCHOOL
// ======================================

export const updateSchool = (req, res) => {
  const { id } = req.params;

  const {
    schoolName,
    phone,
    email,
    address,
    registrationNumber,
    status,
    logo,
  } = req.body;

  if (!schoolName || !String(schoolName).trim()) {
    return res.status(400).json({
      success: false,
      message: "School name is required.",
    });
  }

  if (Number(id) === 1 && status === "Inactive") {
    return res.status(403).json({
      success: false,
      message: "The main School 1 cannot be deactivated.",
    });
  }

  const cleanName = String(schoolName).trim();
  const cleanStatus = status === "Inactive" ? "Inactive" : "Active";

  getSchoolColumns((err, columns) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    const valuesByColumn = {
      name: cleanName,
      schoolName: cleanName,
      phone: phone || "",
      email: email || "",
      address: address || "",
      registrationNumber: registrationNumber || "",
      status: cleanStatus,
    };

    // Do not update booking_code here.
    // Existing school booking links must remain unchanged.

    if (logo !== undefined && columns.has("logo")) {
      valuesByColumn.logo = logo;
    }

    const entries = Object.entries(valuesByColumn).filter(([column]) =>
      columns.has(column)
    );

    const setClauses = entries.map(([column]) => `"${column}" = ?`);
    const values = entries.map(([, value]) => value);

    if (setClauses.length === 0) {
      return res.status(500).json({
        success: false,
        message: "No valid school columns were found.",
      });
    }

    values.push(id);

    db.run(
      `UPDATE schools SET ${setClauses.join(", ")} WHERE id = ?`,
      values,
      function (updateErr) {
        if (updateErr) {
          return res.status(500).json({
            success: false,
            message: updateErr.message,
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message: "School not found.",
          });
        }

        res.json({
          success: true,
          message: "School updated successfully.",
        });
      }
    );
  });
};

// ======================================
// ACTIVATE / DEACTIVATE SCHOOL
// ======================================

export const updateSchoolStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== "Active" && status !== "Inactive") {
    return res.status(400).json({
      success: false,
      message: "Status must be Active or Inactive.",
    });
  }

  if (Number(id) === 1 && status === "Inactive") {
    return res.status(403).json({
      success: false,
      message: "The main School 1 cannot be deactivated.",
    });
  }

  db.run(
    "UPDATE schools SET status = ? WHERE id = ?",
    [status, id],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "School not found.",
        });
      }

      res.json({
        success: true,
        message: `School ${status.toLowerCase()} successfully.`,
      });
    }
  );
};

// ======================================
// DELETE SCHOOL
// ======================================

export const deleteSchool = (req, res) => {
  const { id } = req.params;

  if (Number(id) === 1) {
    return res.status(403).json({
      success: false,
      message: "The main School 1 cannot be deleted.",
    });
  }

  db.run(
    "DELETE FROM schools WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "School not found.",
        });
      }

      res.json({
        success: true,
        message: "School deleted successfully.",
      });
    }
  );
};
