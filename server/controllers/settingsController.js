import db from "../database/database.js";

// ======================================
// GET SETTINGS
// ======================================

export const getSettings = (req, res) => {
  db.get(
    `
    SELECT *
    FROM settings
    WHERE id = 1
    `,
    [],
    (err, row) => {
      if (err) {
        console.error(
          "GET SETTINGS ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (!row) {
        return res.json({
          id: 1,
          schoolName: "DrivePro-SA",
          phone: "",
          email: "",
          address: "",
          registrationNumber: "",
          defaultLessonDuration: 60,
          defaultLessonPrice: 0,
        });
      }

      res.json(row);
    }
  );
};

// ======================================
// UPDATE SETTINGS
// ======================================

export const updateSettings = (req, res) => {
  const {
    schoolName,
    phone,
    email,
    address,
    registrationNumber,
    defaultLessonDuration,
    defaultLessonPrice,
  } = req.body;

  if (
    !schoolName ||
    !String(schoolName).trim()
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Driving school name is required.",
    });
  }

  db.run(
    `
    UPDATE settings
    SET
      schoolName = ?,
      phone = ?,
      email = ?,
      address = ?,
      registrationNumber = ?,
      defaultLessonDuration = ?,
      defaultLessonPrice = ?
    WHERE id = 1
    `,
    [
      String(schoolName).trim(),
      phone || "",
      email || "",
      address || "",
      registrationNumber || "",
      Number(defaultLessonDuration) || 60,
      Number(defaultLessonPrice) || 0,
    ],
    function (err) {
      if (err) {
        console.error(
          "UPDATE SETTINGS ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        message:
          "Settings saved successfully.",
      });
    }
  );
};