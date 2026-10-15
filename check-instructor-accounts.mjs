import db from "./server/database/database.js";

console.log("=== LOCAL INSTRUCTOR ACCOUNTS ===");

db.all(`
  SELECT
    id,
    fullname,
    username,
    role,
    status,
    school_id,
    LENGTH(password) AS password_length
  FROM users
  WHERE LOWER(role) LIKE '%instructor%'
  ORDER BY id
`, [], (err, rows) => {

  if (err) {
    console.error("ERROR:", err);
    return;
  }

  console.table(rows);
});
