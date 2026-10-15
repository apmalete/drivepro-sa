import db from "./server/database/database.js";

db.all(
  "SELECT id, username, fullname, role, status, school_id, LENGTH(password) AS password_length FROM users WHERE school_id=2 ORDER BY id",
  (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.table(rows);
    }
  }
);
