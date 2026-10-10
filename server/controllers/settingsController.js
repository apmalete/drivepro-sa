import db from "../database/database.js";

// Get settings for the authenticated user's school.
export const getSettings = (req, res) => {
  const schoolId = Number(req.user?.school_id);

  if (!Number.isInteger(schoolId) || schoolId < 1) {
    return res.status(403).json({
      success: false,
      message: "Your account is not linked to a valid school.",
    });
  }

  db.get(
    `SELECT id, schoolName, phone, email, address,
            registrationNumber, defaultLessonDuration,
            defaultLessonPrice, lessonDuration, lessonPrice
     FROM settings
     WHERE school_id = ?
     ORDER BY id
     LIMIT 1`,
    [schoolId],
    (err, row) => {
      if (err) {
        console.error("GET SETTINGS ERROR:", err.message);
        return res.status(500).json({
          success: false,
          message: "Failed to load school settings.",
        });
      }

      if (!row) {
        return res.json({
          id: null,
          school_id: schoolId,
          schoolName: "DrivePro-SA",
          phone: "",
          email: "",
          address: "",
          registrationNumber: "",
          defaultLessonDuration: 60,
          defaultLessonPrice: 0,
          lessonDuration: 60,
          lessonPrice: 0,
        });
      }

      return res.json({
        id: row.id,
        school_id: schoolId,
        schoolName: row.schoolName || "DrivePro-SA",
        phone: row.phone || "",
        email: row.email || "",
        address: row.address || "",
        registrationNumber: row.registrationNumber || "",
        defaultLessonDuration: Number(row.defaultLessonDuration) || 60,
        defaultLessonPrice: Number(row.defaultLessonPrice) || 0,
        lessonDuration: Number(row.lessonDuration) || 60,
        lessonPrice: Number(row.lessonPrice) || 0,
      });
    }
  );
};

// Update settings for the authenticated user's school only.
export const updateSettings = (req, res) => {
  const schoolId = Number(req.user?.school_id);

  if (!Number.isInteger(schoolId) || schoolId < 1) {
    return res.status(403).json({
      success: false,
      message: "Your account is not linked to a valid school.",
    });
  }

  const {
    schoolName,
    phone,
    email,
    address,
    registrationNumber,
    defaultLessonDuration,
    defaultLessonPrice,
  } = req.body || {};

  if (typeof schoolName !== "string" || !schoolName.trim()) {
    return res.status(400).json({
      success: false,
      message: "School name is required.",
    });
  }

  const duration = Number(defaultLessonDuration);
  const price = Number(defaultLessonPrice);

  if (
    !Number.isFinite(duration) ||
    duration <= 0 ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid lesson duration and lesson price.",
    });
  }

  const values = [
    schoolName.trim(),
    typeof phone === "string" ? phone.trim() : "",
    typeof email === "string" ? email.trim() : "",
    typeof address === "string" ? address.trim() : "",
    typeof registrationNumber === "string"
      ? registrationNumber.trim()
      : "",
    duration,
    price,
  ];

  // Find this school's record; never use a client-supplied school ID.
  db.get(
    `SELECT id FROM settings
     WHERE school_id = ?
     ORDER BY id
     LIMIT 1`,
    [schoolId],
    (findErr, row) => {
      if (findErr) {
        console.error("FIND SETTINGS ERROR:", findErr.message);
        return res.status(500).json({
          success: false,
          message: "Failed to find school settings.",
        });
      }

      if (row) {
        db.run(
          `UPDATE settings
           SET schoolName = ?,
               phone = ?,
               email = ?,
               address = ?,
               registrationNumber = ?,
               defaultLessonDuration = ?,
               defaultLessonPrice = ?
           WHERE id = ? AND school_id = ?`,
          [...values, row.id, schoolId],
          function (updateErr) {
            if (updateErr) {
              console.error("UPDATE SETTINGS ERROR:", updateErr.message);
              return res.status(500).json({
                success: false,
                message: "Failed to update school settings.",
              });
            }

            return res.json({
              success: true,
              message: "School settings updated successfully.",
            });
          }
        );

        return;
      }

      // Create a separate record for a school without settings yet.
      db.run(
        `INSERT INTO settings (
           schoolName, phone, email, address, registrationNumber,
           defaultLessonDuration, defaultLessonPrice,
           lessonDuration, lessonPrice, school_id
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [...values, 60, 0, schoolId],
        function (insertErr) {
          if (insertErr) {
            console.error("INSERT SETTINGS ERROR:", insertErr.message);
            return res.status(500).json({
              success: false,
              message: "Failed to create school settings.",
            });
          }

          return res.json({
            success: true,
            message: "School settings created successfully.",
          });
        }
      );
    }
  );
};
