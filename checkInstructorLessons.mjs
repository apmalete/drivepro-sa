import db from "./server/database/database.js";

setTimeout(() => {
  const sql = `
  SELECT
    u.id AS user_id,
    u.username,
    u.fullname,
    u.role,
    u.school_id,
    i.id AS instructor_id,
    i.name AS instructor_name,
    i.user_id AS linked_user_id,
    l.id AS lesson_id,
    l.student,
    l.instructor AS lesson_instructor,
    l.school_id AS lesson_school_id,
    l.lesson_date,
    l.lesson_time,
    l.status
  FROM users u
  LEFT JOIN instructors i
    ON i.user_id = u.id
  LEFT JOIN lessons l
    ON l.school_id = u.school_id
    AND LOWER(TRIM(l.instructor)) = LOWER(TRIM(i.name))
  WHERE LOWER(TRIM(u.role)) = 'instructor'
  ORDER BY u.id, l.id;
  `;

  db.all(sql, [], (error, rows) => {
    if (error) {
      console.error("DATABASE ERROR:", error);
    } else {
      console.table(rows);
    }

    process.exit();
  });
}, 3000);
