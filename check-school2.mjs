import db from "./server/database/database.js";

console.log("=== SCHOOL 2 STUDENTS / INSTRUCTORS ===");

db.all(`
  SELECT
    s.id,
    s.fullname,
    s.instructor,
    s.school_id,
    i.id AS instructor_id,
    i.name AS instructor_name,
    i.user_id
  FROM students s
  LEFT JOIN instructors i
    ON i.school_id = s.school_id
   AND LOWER(TRIM(i.name)) = LOWER(TRIM(s.instructor))
  WHERE s.school_id = 2
  ORDER BY s.id
`, [], (err, rows) => {

  if (err) {
    console.error("STUDENT QUERY ERROR:", err);
    return;
  }

  console.table(rows);

  console.log("=== SCHOOL 2 TEST BOOKINGS ===");

  db.all(`
    SELECT
      id,
      student_id,
      student_name,
      instructor_id,
      instructor_name,
      booking_date,
      booking_time,
      school_id
    FROM test_bookings
    WHERE school_id = 2
    ORDER BY id
  `, [], (err2, rows2) => {

    if (err2) {
      console.error("BOOKING QUERY ERROR:", err2);
      return;
    }

    console.table(rows2);
  });
});
