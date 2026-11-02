
import db from "../database/database.js";

// Read the global DrivePro-SA logo setting.
export const getAppLogo = (req, res) => {
  db.get(
    "SELECT value FROM app_settings WHERE key = ?",
    ["appLogo"],
    (err, row) => {
      if (err) {
        console.error("GET APP LOGO ERROR:", err.message);
        return res.status(500).json({
          success: false,
          message: "Failed to load the main logo.",
        });
      }

      return res.json({
        success: true,
        appLogo: row?.value || "",
      });
    }
  );
};

// Save the uploaded main logo path.
export const saveAppLogo = (req, res) => {
  const appLogo = req.body?.appLogo;

  if (
    typeof appLogo !== "string" ||
    !appLogo.startsWith("/uploads/app/")
  ) {
    return res.status(400).json({
      success: false,
      message: "A valid main logo path is required.",
    });
  }

  db.run(
    `INSERT INTO app_settings (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    ["appLogo", appLogo],
    function (err) {
      if (err) {
        console.error("SAVE APP LOGO ERROR:", err.message);
        return res.status(500).json({
          success: false,
          message: "Failed to save the main logo.",
        });
      }

      return res.json({
        success: true,
        message: "Main DrivePro-SA logo saved successfully.",
        appLogo,
      });
    }
  );
};
