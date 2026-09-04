import db from "../database/database.js";

// ======================================
// GET SETTINGS
// ======================================

export const getSettings = (req, res) => {
  db.get(
    `
    SELECT
      id,
      schoolName,
      phone,
      email,
      address,
      registrationNumber,
      defaultLessonDuration,
      defaultLessonPrice,
      lessonDuration,
      lessonPrice
    FROM settings
    WHERE id = 1
    LIMIT 1
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

      // ======================================
      // DEFAULT SETTINGS
      // ======================================

      const settings = {
        id: 1,
        schoolName: "DrivePro-SA",
        phone: "",
        email: "",
        address: "",
        registrationNumber: "",
        defaultLessonDuration: 60,
        defaultLessonPrice: 0,
        lessonDuration: 60,
        lessonPrice: 0,
      };

      // ======================================
      // RETURN DATABASE SETTINGS
      // ======================================

      if (row) {
        settings.id = row.id || 1;

        settings.schoolName =
          row.schoolName || "DrivePro-SA";

        settings.phone =
          row.phone || "";

        settings.email =
          row.email || "";

        settings.address =
          row.address || "";

        settings.registrationNumber =
          row.registrationNumber || "";

        settings.defaultLessonDuration =
          Number(
            row.defaultLessonDuration
          ) || 60;

        settings.defaultLessonPrice =
          Number(
            row.defaultLessonPrice
          ) || 0;

        settings.lessonDuration =
          Number(
            row.lessonDuration
          ) || 60;

        settings.lessonPrice =
          Number(
            row.lessonPrice
          ) || 0;
      }

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

  // ======================================
  // VALIDATE SCHOOL NAME
  // ======================================

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

  // ======================================
  // PREPARE VALUES
  // ======================================

  const schoolNameValue =
    String(schoolName).trim();

  const phoneValue =
    phone == null
      ? ""
      : String(phone).trim();

  const emailValue =
    email == null
      ? ""
      : String(email).trim();

  const addressValue =
    address == null
      ? ""
      : String(address).trim();

  const registrationNumberValue =
    registrationNumber == null
      ? ""
      : String(
          registrationNumber
        ).trim();

  const lessonDurationValue =
    Number(
      defaultLessonDuration
    ) || 60;

  const lessonPriceValue =
    Number(
      defaultLessonPrice
    ) || 0;

  // ======================================
  // UPDATE EXISTING SETTINGS RECORD
  // ======================================

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
      schoolNameValue,
      phoneValue,
      emailValue,
      addressValue,
      registrationNumberValue,
      lessonDurationValue,
      lessonPriceValue,
    ],
    function (err) {
      if (err) {
        console.error(
          "UPDATE SETTINGS ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to save settings.",
          error: err.message,
        });
      }

      // ======================================
      // IF NO RECORD EXISTS, CREATE ONE
      // ======================================

      if (this.changes === 0) {
        db.run(
          `
          INSERT INTO settings
          (
            id,
            schoolName,
            phone,
            email,
            address,
            registrationNumber,
            defaultLessonDuration,
            defaultLessonPrice,
            lessonDuration,
            lessonPrice
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            1,
            schoolNameValue,
            phoneValue,
            emailValue,
            addressValue,
            registrationNumberValue,
            lessonDurationValue,
            lessonPriceValue,
            60,
            0,
          ],
          (insertErr) => {
            if (insertErr) {
              console.error(
                "INSERT SETTINGS ERROR:",
                insertErr.message
              );

              return res.status(500).json({
                success: false,
                message:
                  "Failed to save settings.",
                error:
                  insertErr.message,
              });
            }

            return res.json({
              success: true,
              message:
                "Settings saved successfully.",
            });
          }
        );

        return;
      }

      // ======================================
      // SUCCESS
      // ======================================

      res.json({
        success: true,
        message:
          "Settings saved successfully.",
      });
    }
  );
};