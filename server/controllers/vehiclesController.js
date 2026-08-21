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
// GET ALL VEHICLES
// =====================================================

export const getVehicles = (req, res) => {

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
    FROM vehicles
    WHERE school_id = ?
    ORDER BY id DESC
    `,
    [schoolId],
    (err, rows) => {

      if (err) {

        console.error(
          "GET VEHICLES ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json(rows || []);
    }
  );
};

// =====================================================
// ADD VEHICLE
// =====================================================

export const addVehicle = (req, res) => {

  const schoolId =
    getSchoolId(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });
  }

  console.log(
    "========== POST VEHICLE RECEIVED =========="
  );

  console.log(req.body);

  const {
    registration,
    make,
    model,
    year,
    transmission,
    fuel,
    status,
  } = req.body;

  db.run(
    `
    INSERT INTO vehicles
    (
      registration,
      make,
      model,
      year,
      transmission,
      fuel,
      status,
      school_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      registration,
      make,
      model,
      year,
      transmission,
      fuel,
      status || "Available",
      schoolId,
    ],
    function (err) {

      if (err) {

        console.error(
          "INSERT VEHICLE ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      console.log(
        "Vehicle saved successfully"
      );

      res.json({
        success: true,
        id: this.lastID,
        message:
          "Vehicle added successfully",
      });
    }
  );
};

// =====================================================
// UPDATE VEHICLE
// =====================================================

export const updateVehicle = (req, res) => {

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
    registration,
    make,
    model,
    year,
    transmission,
    fuel,
    status,
  } = req.body;

  db.run(
    `
    UPDATE vehicles
    SET
      registration = ?,
      make = ?,
      model = ?,
      year = ?,
      transmission = ?,
      fuel = ?,
      status = ?
    WHERE id = ?
      AND school_id = ?
    `,
    [
      registration,
      make,
      model,
      year,
      transmission,
      fuel,
      status,
      id,
      schoolId,
    ],
    function (err) {

      if (err) {

        console.error(
          "UPDATE VEHICLE ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (this.changes === 0) {

        return res.status(404).json({
          success: false,
          error:
            "Vehicle not found for this school.",
        });
      }

      res.json({
        success: true,
        changes: this.changes,
        message:
          "Vehicle updated successfully",
      });
    }
  );
};

// =====================================================
// DELETE VEHICLE
// =====================================================

export const deleteVehicle = (req, res) => {

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
    DELETE FROM vehicles
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
          "DELETE VEHICLE ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (this.changes === 0) {

        return res.status(404).json({
          success: false,
          error:
            "Vehicle not found for this school.",
        });
      }

      res.json({
        success: true,
        deleted: this.changes,
        message:
          "Vehicle deleted successfully",
      });
    }
  );
};