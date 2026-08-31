import db from "../database/database.js";

// ======================================
// GET SETTINGS
// ======================================

export const getSettings = (req, res) => {
  db.all(
    `
    SELECT setting_key, setting_value
    FROM settings
    WHERE school_id = 1
    `,
    [],
    (err, rows) => {
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

      // Default settings
      const settings = {
        id: 1,
        schoolName: "DrivePro-SA",
        phone: "",
        email: "",
        address: "",
        registrationNumber: "",
        defaultLessonDuration: 60,
        defaultLessonPrice: 0,
      };

      // Convert database key/value rows
      // into the format expected by the frontend
      rows.forEach((row) => {
        if (row.setting_key === "schoolName") {
          settings.schoolName = row.setting_value;
        }

        if (row.setting_key === "phone") {
          settings.phone = row.setting_value;
        }

        if (row.setting_key === "email") {
          settings.email = row.setting_value;
        }

        if (row.setting_key === "address") {
          settings.address = row.setting_value;
        }

        if (row.setting_key === "registrationNumber") {
          settings.registrationNumber =
            row.setting_value;
        }

        if (row.setting_key === "defaultLessonDuration") {
          settings.defaultLessonDuration =
            Number(row.setting_value) || 60;
        }

        if (row.setting_key === "defaultLessonPrice") {
          settings.defaultLessonPrice =
            Number(row.setting_value) || 0;
        }
      });

      res.json(settings);
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

  const settingsToSave = {
    schoolName: String(schoolName).trim(),
    phone: phone || "",
    email: email || "",
    address: address || "",
    registrationNumber:
      registrationNumber || "",
    defaultLessonDuration:
      Number(defaultLessonDuration) || 60,
    defaultLessonPrice:
      Number(defaultLessonPrice) || 0,
  };

  const entries = Object.entries(
    settingsToSave
  );

  db.serialize(() => {
    const stmt = db.prepare(
      `
      INSERT INTO settings
      (
        setting_key,
        setting_value,
        school_id,
        updated_at
      )
      VALUES (?, ?, 1, CURRENT_TIMESTAMP)

      ON CONFLICT(setting_key)
      DO UPDATE SET
        setting_value = excluded.setting_value,
        updated_at = CURRENT_TIMESTAMP
      `
    );

    let errorOccurred = false;

    entries.forEach(
      ([key, value]) => {
        stmt.run(
          key,
          String(value),
          (err) => {
            if (err && !errorOccurred) {
              errorOccurred = true;

              console.error(
                "UPDATE SETTINGS ERROR:",
                err.message
              );
            }
          }
        );
      }
    );

    stmt.finalize((err) => {
      if (err) {
        console.error(
          "FINALIZE SETTINGS ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (errorOccurred) {
        return res.status(500).json({
          success: false,
          message: "Failed to save settings.",
        });
      }

      res.json({
        success: true,
        message:
          "Settings saved successfully.",
      });
    });
  });
};