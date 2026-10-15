import db from "./server/database/database.js";

const sql = `
SELECT DISTINCT
  tb.id,
  tb.student_id,
  tb.student_name,
  tb.instructor_id,
  tb.instructor_name,
  s.instructor AS student_instructor,
  i.id AS matched_instructor_id,
  i.name AS matched_instructor_name,
  i.user_id AS matched_user_id
FROM test_bookings tb
INNER JOIN students s
  ON s.id = tb.student_id
 AND s.school_id = tb.school_id
INNER JOIN instructors i
  ON i.school_id = tb.school_id
 AND i.user_id = ?
WHERE tb.school_id = ?
  AND (
    tb.instructor_id = i.id
    OR LOWER(TRIM(i.name)) = LOWER(TRIM(s.instructor))
  )
ORDER BY tb.id
`;

console.log("=== MAJOZI USER 18 ===");
db.all(sql, [18, 2], (err, rows) => {
  if (err) console.error(err);
  else console.table(rows);

  console.log("=== KGOPOTSO USER 6 ===");
  db.all(sql, [6, 2], (err2, rows2) => {
    if (err2) console.error(err2);
    else console.table(rows2);
  });
});
