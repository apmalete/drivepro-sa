import db from "./server/database/database.js";

const sql = `
SELECT
  tb.id,
  tb.student_id,
  tb.student_name,
  tb.instructor_id,
  tb.instructor_name,
  tb.school_id,
  s.instructor AS student_instructor,
  i.id AS profile_id,
  i.name AS profile_name,
  i.user_id
FROM test_bookings tb
LEFT JOIN students s ON s.id = tb.student_id
LEFT JOIN instructors i ON i.id = tb.instructor_id
WHERE tb.id IN (4, 5)
`;

db.all(sql, (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.table(rows);
  }
});
