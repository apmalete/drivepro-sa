
import db from "./database/database.js";

// =====================================
// STUDENT PROGRESS DATABASE
// =====================================

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS student_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      instructor_user_id INTEGER NOT NULL,
      school_id INTEGER NOT NULL,
      lesson_id INTEGER,
      skill TEXT NOT NULL CHECK (
        skill IN (
          'Moving off and stopping',
          'Gear control',
          'Turning and observation',
          'Reversing',
          'Parking',
          'Mirrors and signalling'
        )
      ),
      status TEXT NOT NULL CHECK (
        status IN (
          'Not Assessed',
          'Needs Practice',
          'Improving',
          'Competent'
        )
      ),
      comments TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) {
        console.error(
          "STUDENT PROGRESS TABLE ERROR:",
          err.message
        );
        return;
      }

      console.log(
        "Student progress table ready."
      );
    }
  );

  db.run(
    `CREATE INDEX IF NOT EXISTS idx_student_progress_student_school
     ON student_progress (student_id, school_id, created_at)`,
    (err) => {
      if (err) {
        console.error(
          "STUDENT PROGRESS INDEX ERROR:",
          err.message
        );
      }
    }
  );
});
