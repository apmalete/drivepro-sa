import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

console.log("***** DATABASE.JS LOADED *****");

sqlite3.verbose();

// ======================================
// SERVER DIRECTORY
// ======================================

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

// ======================================
// DATABASE PATH
// ======================================
//
// LOCAL:
//   server/drivepro.db
//
// RAILWAY:
//   /app/data/drivepro.db
//
// The Railway path is the persistent
// volume we created.
// ======================================

const databasePath =
  process.env.NODE_ENV === "production"
    ? "/app/data/drivepro.db"
    : path.join(
        __dirname,
        "..",
        "drivepro.db"
      );

console.log(
  "DATABASE PATH:",
  databasePath
);

// ======================================
// DATABASE CONNECTION
// ======================================

const db =
  new sqlite3.Database(
    databasePath,
    (err) => {

      if (err) {

        console.error(
          "Database connection failed:",
          err.message
        );

      } else {

        console.log(
          "Database Connected"
        );

      }

    }
  );

// ======================================
// CREATE STUDENTS TABLE
// ======================================

db.run(
  `
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentNo TEXT UNIQUE,
    fullname TEXT NOT NULL,
    idNumber TEXT,
    gender TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    learnerNumber TEXT,
    licenceCode TEXT,
    instructor TEXT,
    vehicle TEXT,
    courseFee REAL DEFAULT 0,
    amountPaid REAL DEFAULT 0,
    balance REAL DEFAULT 0,
    photo TEXT,
    status TEXT DEFAULT 'Active',
    school_id INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "STUDENTS TABLE ERROR:",
        err.message
      );

    } else {

      console.log(
        "Students table ready"
      );

    }

  }
);

// ======================================
// CREATE USERS TABLE
// ======================================

db.run(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    school_id INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "USERS TABLE ERROR:",
        err.message
      );

    } else {

      console.log(
        "Users table ready"
      );

    }

  }
);

// ======================================
// CREATE SCHOOLS TABLE
// ======================================
//
// IMPORTANT:
// These column names match the
// schoolsController and usersController.
// ======================================

db.run(
  `
  CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schoolName TEXT NOT NULL,
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    registrationNumber TEXT DEFAULT '',
    status TEXT DEFAULT 'Active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "SCHOOLS TABLE ERROR:",
        err.message
      );

    } else {

      console.log(
        "Schools table ready"
      );

    }

  }
);

// ======================================
// CREATE INSTRUCTORS TABLE
// ======================================

db.run(
  `
  CREATE TABLE IF NOT EXISTS instructors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    licence TEXT NOT NULL,
    experience TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    school_id INTEGER DEFAULT 1
  )
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "INSTRUCTORS TABLE ERROR:",
        err.message
      );

    } else {

      console.log(
        "Instructors table ready"
      );

    }

  }
);

// ======================================
// CREATE VEHICLES TABLE
// ======================================

db.run(
  `
  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    transmission TEXT NOT NULL,
    fuel TEXT NOT NULL,
    status TEXT DEFAULT 'Available',
    school_id INTEGER DEFAULT 1
  )
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "VEHICLES TABLE ERROR:",
        err.message
      );

    } else {

      console.log(
        "Vehicles table ready"
      );

    }

  }
);

// ======================================
// CREATE LESSONS TABLE
// ======================================

db.run(
  `
  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student TEXT NOT NULL,
    instructor TEXT NOT NULL,
    vehicle TEXT NOT NULL,
    lesson_date TEXT NOT NULL,
    lesson_time TEXT NOT NULL,
    status TEXT DEFAULT 'Booked',
    school_id INTEGER DEFAULT 1
  )
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "LESSONS TABLE ERROR:",
        err.message
      );

    } else {

      console.log(
        "Lessons table ready"
      );

    }

  }
);

// ======================================
// CREATE PAYMENTS TABLE
// ======================================

db.run(
  `
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receiptNo TEXT UNIQUE NOT NULL,
    studentId INTEGER NOT NULL,
    studentName TEXT NOT NULL,
    paymentDate TEXT NOT NULL,
    paymentMethod TEXT NOT NULL,
    amount REAL NOT NULL,
    reference TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    school_id INTEGER DEFAULT 1
  )
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "PAYMENTS TABLE ERROR:",
        err.message
      );

    } else {

      console.log(
        "Payments table ready"
      );

    }

  }
);

// ======================================
// CREATE SETTINGS TABLE
// ======================================
//
// These columns match the
// settingsController.
// ======================================

db.run(
  `
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schoolName TEXT NOT NULL DEFAULT 'DrivePro-SA',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    registrationNumber TEXT DEFAULT '',
    defaultLessonDuration INTEGER DEFAULT 60,
    defaultLessonPrice REAL DEFAULT 0,
    lessonDuration INTEGER DEFAULT 60,
    lessonPrice REAL DEFAULT 0
  )
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "SETTINGS TABLE ERROR:",
        err.message
      );

    } else {

      console.log(
        "Settings table ready"
      );

    }

  }
);

// ======================================
// STUDENTS INDEXES
// ======================================

db.run(
  `
  CREATE INDEX IF NOT EXISTS idx_students_school
  ON students(school_id)
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "STUDENTS SCHOOL INDEX ERROR:",
        err.message
      );

    }

  }
);

db.run(
  `
  CREATE INDEX IF NOT EXISTS idx_students_status
  ON students(status)
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "STUDENTS STATUS INDEX ERROR:",
        err.message
      );

    }

  }
);

// ======================================
// USERS INDEXES
// ======================================

db.run(
  `
  CREATE INDEX IF NOT EXISTS idx_users_school
  ON users(school_id)
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "USERS SCHOOL INDEX ERROR:",
        err.message
      );

    }

  }
);

db.run(
  `
  CREATE INDEX IF NOT EXISTS idx_users_username
  ON users(username)
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "USERS USERNAME INDEX ERROR:",
        err.message
      );

    }

  }
);

// ======================================
// LESSON INDEXES
// ======================================

db.run(
  `
  CREATE INDEX IF NOT EXISTS idx_lessons_student
  ON lessons(student)
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "LESSONS STUDENT INDEX ERROR:",
        err.message
      );

    }

  }
);

db.run(
  `
  CREATE INDEX IF NOT EXISTS idx_lessons_instructor
  ON lessons(instructor)
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "LESSONS INSTRUCTOR INDEX ERROR:",
        err.message
      );

    }

  }
);

db.run(
  `
  CREATE INDEX IF NOT EXISTS idx_lessons_date
  ON lessons(lesson_date)
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "LESSONS DATE INDEX ERROR:",
        err.message
      );

    }

  }
);

// ======================================
// PAYMENTS INDEX
// ======================================

db.run(
  `
  CREATE INDEX IF NOT EXISTS idx_payments_student
  ON payments(studentId)
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "PAYMENTS STUDENT INDEX ERROR:",
        err.message
      );

    }

  }
);

// ======================================
// DEFAULT SCHOOL
// ======================================

db.run(
  `
  INSERT OR IGNORE INTO schools
  (
    id,
    schoolName,
    phone,
    email,
    address,
    registrationNumber,
    status
  )
  VALUES
  (
    1,
    'DrivePro-SA',
    '',
    '',
    '',
    '',
    'Active'
  )
  `,
  [],
  (err) => {

    if (err) {

      console.error(
        "DEFAULT SCHOOL ERROR:",
        err.message
      );

    } else {

      console.log(
        "Default school ready"
      );

    }

  }
);

// ======================================
// DEFAULT ADMIN
// ======================================

const setupDefaultAdmin = () => {

  db.run(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullname TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      school_id INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    `,
    [],
    (tableErr) => {

      if (tableErr) {

        console.error(
          "DEFAULT ADMIN TABLE ERROR:",
          tableErr.message
        );

        return;

      }

      console.log(
        "Users table confirmed for admin setup"
      );

      db.get(
        `
        SELECT id
        FROM users
        WHERE username = ?
        LIMIT 1
        `,
        ["admin"],
        (err, row) => {

          if (err) {

            console.error(
              "DEFAULT ADMIN CHECK ERROR:",
              err.message
            );

            return;

          }

          if (row) {

            db.run(
              `
              UPDATE users
              SET
                fullname = ?,
                password = ?,
                role = ?,
                status = ?,
                school_id = ?
              WHERE username = ?
              `,
              [
                "Administrator",
                "1234",
                "System Administrator",
                "Active",
                1,
                "admin"
              ],
              (updateErr) => {

                if (updateErr) {

                  console.error(
                    "DEFAULT ADMIN UPDATE ERROR:",
                    updateErr.message
                  );

                  return;

                }

                console.log(
                  "Default admin account updated"
                );

              }
            );

            return;

          }

          db.run(
            `
            INSERT INTO users
            (
              fullname,
              username,
              password,
              role,
              status,
              school_id
            )
            VALUES
            (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?
            )
            `,
            [
              "Administrator",
              "admin",
              "1234",
              "System Administrator",
              "Active",
              1
            ],
            (insertErr) => {

              if (insertErr) {

                console.error(
                  "DEFAULT ADMIN INSERT ERROR:",
                  insertErr.message
                );

                return;

              }

              console.log(
                "Default admin account created"
              );

            }
          );

        }
      );

    }
  );

};

// ======================================
// RUN DEFAULT ADMIN SETUP
// ======================================

setupDefaultAdmin();

// ======================================
// DATABASE READY CHECK
// ======================================

db.serialize(() => {

  db.get(
    `SELECT COUNT(*) AS count FROM users`,
    [],
    (err, row) => {

      if (err) {

        console.error(
          "DATABASE READY CHECK ERROR:",
          err.message
        );

        return;

      }

      console.log(
        `Users in database: ${row.count}`
      );

    }
  );

  db.get(
    `SELECT COUNT(*) AS count FROM students`,
    [],
    (err, row) => {

      if (err) {

        console.error(
          "STUDENTS READY CHECK ERROR:",
          err.message
        );

        return;

      }

      console.log(
        `Students in database: ${row.count}`
      );

    }
  );

  db.get(
    `SELECT COUNT(*) AS count FROM schools`,
    [],
    (err, row) => {

      if (err) {

        console.error(
          "SCHOOLS READY CHECK ERROR:",
          err.message
        );

        return;

      }

      console.log(
        `Schools in database: ${row.count}`
      );

    }
  );

});

// ======================================
// EXPORT DATABASE
// ======================================

export default db;