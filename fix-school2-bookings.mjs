import db from "./server/database/database.js";

console.log("=== FIXING SCHOOL 2 TEST BOOKING INSTRUCTORS ===");

db.run(`
  UPDATE test_bookings
  SET
    instructor_id = 11,
    instructor_name = 'Kgopotso'
  WHERE school_id = 2
    AND student_id = 10
`, (err) => {

  if (err) {
    console.error("TSHEPO UPDATE ERROR:", err);
    return;
  }

  console.log("✅ Tshepo bookings assigned to Kgopotso.");

  db.run(`
    UPDATE test_bookings
    SET
      instructor_id = 9,
      instructor_name = 'Majozi'
    WHERE school_id = 2
      AND student_id = 9
  `, (err2) => {

    if (err2) {
      console.error("LESGO UPDATE ERROR:", err2);
      return;
    }

    console.log("✅ LESGO bookings assigned to Majozi.");

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
    `, [], (err3, rows) => {

      if (err3) {
        console.error("VERIFY ERROR:", err3);
        return;
      }

      console.log("=== UPDATED SCHOOL 2 BOOKINGS ===");
      console.table(rows);
    });
  });
});
