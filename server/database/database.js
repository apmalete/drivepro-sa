
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";

console.log("***** DATABASE.JS LOADED *****");
sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databasePath =
  process.env.NODE_ENV === "production"
    ? "/app/data/drivepro.db"
    : path.join(__dirname, "..", "drivepro.db");

console.log("DATABASE PATH:", databasePath);

const db = new sqlite3.Database(databasePath, (err) => {
  if (err) console.error("DATABASE CONNECTION FAILED:", err.message);
  else console.log("Database Connected");
});

// =====================================================
// ENSURE A COLUMN EXISTS
// =====================================================

const ensureColumn = (table, name, definition, callback) => {
  db.all(`PRAGMA table_info(${table})`, [], (err, columns) => {
    if (err) return callback(err);

    if ((columns || []).some((column) => column.name === name)) {
      return callback(null);
    }

    db.run(
      `ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`,
      [],
      callback
    );
  });
};

// =====================================================
// CREATE TABLES
// =====================================================

const createTables = (callback) => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentNo TEXT,
      fullname TEXT NOT NULL,
      idNumber TEXT,
      gender TEXT,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      learnerNumber TEXT,
      learnerCode TEXT,
      learnerStatus TEXT DEFAULT 'Not Applicable',
      licenceCode TEXT,
      licenceStatus TEXT DEFAULT 'Not Applicable',
      instructor TEXT,
      vehicle TEXT,
      courseFee REAL DEFAULT 0,
      amountPaid REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      photo TEXT,
      status TEXT DEFAULT 'Active',
      school_id INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullname TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      school_id INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schoolName TEXT NOT NULL,
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      address TEXT DEFAULT '',
      registrationNumber TEXT DEFAULT '',
      status TEXT DEFAULT 'Active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS school_logo_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id INTEGER NOT NULL,
      logo_path TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      submitted_by INTEGER,
      reviewed_by INTEGER,
      submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TEXT,
      rejection_reason TEXT
    )`,

    `CREATE TABLE IF NOT EXISTS instructors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      licence TEXT NOT NULL,
      experience TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      school_id INTEGER DEFAULT 1,
      user_id INTEGER
    )`,

    `CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registration TEXT NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      transmission TEXT NOT NULL,
      fuel TEXT NOT NULL,
      status TEXT DEFAULT 'Available',
      school_id INTEGER DEFAULT 1
    )`,

    `CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student TEXT NOT NULL,
      instructor TEXT NOT NULL,
      vehicle TEXT NOT NULL,
      lesson_date TEXT NOT NULL,
      lesson_time TEXT NOT NULL,
      status TEXT DEFAULT 'Booked',
      school_id INTEGER DEFAULT 1
    )`,

    `CREATE TABLE IF NOT EXISTS payments (
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
    )`,

    `CREATE TABLE IF NOT EXISTS settings (
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
    )`,

  `CREATE TABLE IF NOT EXISTS school_lesson_package_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER NOT NULL,
    package_code TEXT NOT NULL,
    package_name TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0 CHECK (price >= 0),
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (school_id, package_code)
  )`,
  `CREATE TABLE IF NOT EXISTS school_fixed_lesson_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER NOT NULL,
    service_code TEXT NOT NULL,
    package_name TEXT NOT NULL,
    lesson_count INTEGER NOT NULL CHECK (lesson_count > 1),
    total_price REAL NOT NULL DEFAULT 0
      CHECK (total_price >= 0),
    is_active INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (school_id, service_code, package_name)
  )`,

`CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
)`,

    `CREATE TABLE IF NOT EXISTS test_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      student_name TEXT NOT NULL,
      test_type TEXT NOT NULL,
      booking_date TEXT NOT NULL,
      booking_time TEXT NOT NULL,
      test_centre TEXT,
      booking_reference TEXT,
      status TEXT DEFAULT 'Pending',
      reminder_sent INTEGER DEFAULT 0,
      day_reminder_sent INTEGER DEFAULT 0,
      school_id INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS lesson_booking_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      requested_date TEXT NOT NULL,
      requested_time TEXT NOT NULL,
      preferred_instructor_id INTEGER,
      customer_notes TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      staff_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  let index = 0;

  const next = (err) => {
    if (err) return callback(err);
    if (index >= tables.length) return callback(null);

    db.run(tables[index++], [], (tableErr) => {
      if (tableErr) {
        console.error("TABLE CREATION ERROR:", tableErr.message);
      }

      next(tableErr);
    });
  };

  next(null);
};

// =====================================================
// MIGRATE SETTINGS TABLE
// =====================================================

const migrateSettingsTable = (callback) => {
  const columns = [
    ["schoolName", "TEXT DEFAULT 'DrivePro-SA'"],
    ["phone", "TEXT DEFAULT ''"],
    ["email", "TEXT DEFAULT ''"],
    ["address", "TEXT DEFAULT ''"],
    ["registrationNumber", "TEXT DEFAULT ''"],
    ["defaultLessonDuration", "INTEGER DEFAULT 60"],
    ["defaultLessonPrice", "REAL DEFAULT 0"],
    ["lessonDuration", "INTEGER DEFAULT 60"],
    ["lessonPrice", "REAL DEFAULT 0"],
    ["school_id", "INTEGER DEFAULT 1"],
    ["created_at", "TEXT"],
    ["updated_at", "TEXT"],
    ["appLogo", "TEXT DEFAULT ''"]
  ];

  let index = 0;

  const next = (err) => {
    if (err) return callback(err);

    if (index >= columns.length) {
      return db.run(
        `INSERT OR IGNORE INTO settings
          (id, schoolName, phone, email, address, registrationNumber,
           defaultLessonDuration, defaultLessonPrice, lessonDuration,
           lessonPrice, school_id)
         VALUES (1, 'DrivePro-SA', '', '', '', '', 60, 0, 60, 0, 1)`,
        [],
        (insertErr) => {
          if (insertErr) return callback(insertErr);

          console.log("Settings migration completed");
          callback(null);
        }
      );
    }

    const [name, definition] = columns[index++];

    ensureColumn("settings", name, definition, (columnErr) => {
      if (!columnErr) {
        console.log(`Settings column ready: ${name}`);
      }

      next(columnErr);
    });
  };

  next(null);
};

// =====================================================
// MIGRATE SCHOOLS TABLE, INCLUDING LOGO
// =====================================================

const migrateSchoolsTable = (callback) => {
  db.all("PRAGMA table_info(schools)", [], (err, columns) => {
    if (err) return callback(err);

    const existing = new Set(
      (columns || []).map((column) => column.name)
    );

    const steps = [];

    if (!existing.has("schoolName")) {
      steps.push((done) =>
        db.run(
          "ALTER TABLE schools ADD COLUMN schoolName TEXT DEFAULT 'DrivePro-SA'",
          [],
          done
        )
      );
    }

    if (existing.has("name")) {
      steps.push((done) =>
        db.run(
          `UPDATE schools
           SET schoolName = name
           WHERE (schoolName IS NULL OR schoolName = '')
             AND name IS NOT NULL`,
          [],
          done
        )
      );
    }

    if (!existing.has("registrationNumber")) {
      steps.push((done) =>
        db.run(
          "ALTER TABLE schools ADD COLUMN registrationNumber TEXT DEFAULT ''",
          [],
          done
        )
      );
    }

    if (!existing.has("status")) {
      steps.push((done) =>
        db.run(
          "ALTER TABLE schools ADD COLUMN status TEXT DEFAULT 'Active'",
          [],
          done
        )
      );
    }

    if (!existing.has("logo")) {
      steps.push((done) =>
        db.run(
          "ALTER TABLE schools ADD COLUMN logo TEXT DEFAULT ''",
          [],
          done
        )
      );
    }

    let index = 0;

    const next = (stepErr) => {
      if (stepErr) {
        console.error("SCHOOLS MIGRATION ERROR:", stepErr.message);
        return callback(stepErr);
      }

      if (index >= steps.length) {
        console.log("Schools migration complete");
        return callback(null);
      }

      steps[index++](next);
    };

    next(null);
  });
};
// =====================================================
// MIGRATE UNIQUE SCHOOL BOOKING CODES
// =====================================================

const migrateSchoolBookingCodes = (callback) => {
  ensureColumn(
    "schools",
    "booking_code",
    "TEXT",
    (columnErr) => {
      if (columnErr) return callback(columnErr);

      db.all(
        "SELECT id, booking_code FROM schools ORDER BY id",
        [],
        (selectErr, schools) => {
          if (selectErr) return callback(selectErr);

          let index = 0;

          const next = () => {
            if (index >= schools.length) {
              return db.run(
                `CREATE UNIQUE INDEX IF NOT EXISTS
                 idx_schools_booking_code
                 ON schools(booking_code)
                 WHERE booking_code IS NOT NULL
                   AND TRIM(booking_code) <> ''`,
                [],
                callback
              );
            }

            const school = schools[index++];

            if (
              school.booking_code &&
              String(school.booking_code).trim() !== ""
            ) {
              return next();
            }

            const bookingCode = randomBytes(12).toString("hex");

            db.run(
              `UPDATE schools
               SET booking_code = ?
               WHERE id = ?
                 AND (booking_code IS NULL OR TRIM(booking_code) = '')`,
              [bookingCode, school.id],
              (updateErr) => {
                if (updateErr) return callback(updateErr);
                next();
              }
            );
          };

          next();
        }
      );
    }
  );
};
// =====================================================
// MIGRATE LEARNER AND LICENCE STATUS
// =====================================================

const migrateLearnerLicenceStatus = (callback) => {
  ensureColumn(
    "students",
    "learnerStatus",
    "TEXT DEFAULT 'Not Applicable'",
    (err) => {
      if (err) return callback(err);

      ensureColumn(
        "students",
        "licenceStatus",
        "TEXT DEFAULT 'Not Applicable'",
        callback
      );
    }
  );
};

// =====================================================
// MIGRATE LESSON WHATSAPP REMINDERS
// =====================================================

const migrateLessonWhatsAppReminders = (callback) => {
  ensureColumn(
    "lessons",
    "notification_sent",
    "INTEGER DEFAULT 0",
    (err) => {
      if (err) return callback(err);

      ensureColumn(
        "lessons",
        "day_reminder_sent",
        "INTEGER DEFAULT 0",
        callback
      );
    }
  );
};

// =====================================================
// MIGRATE LEARNER CODE
// =====================================================

const migrateLearnerCode = (callback) => {
  ensureColumn("students", "learnerCode", "TEXT", callback);
};

// =====================================================
// MIGRATE TEST BOOKING INSTRUCTOR FIELDS
// =====================================================

const migrateTestBookingInstructorFields = (callback) => {
  ensureColumn(
    "test_bookings",
    "instructor_id",
    "INTEGER",
    (err) => {
      if (err) return callback(err);

      ensureColumn(
        "test_bookings",
        "instructor_name",
        "TEXT",
        callback
      );
    }
  );
};

// =====================================================
// MIGRATE STUDENT NUMBERS
// =====================================================

const migrateStudentNumbers = (callback) => {
  db.get(
    `SELECT name FROM sqlite_master
     WHERE type = 'index'
       AND name = 'idx_students_school_studentNo'`,
    [],
    (err, indexRow) => {
      if (err) return callback(err);
      if (indexRow) return callback(null);

      db.all(
        `SELECT school_id, studentNo, COUNT(*) AS count
         FROM students
         WHERE studentNo IS NOT NULL
           AND TRIM(studentNo) <> ''
         GROUP BY school_id, studentNo
         HAVING COUNT(*) > 1`,
        [],
        (duplicateErr, duplicates) => {
          if (duplicateErr) return callback(duplicateErr);

          if (duplicates && duplicates.length) {
            console.error(
              "Duplicate student numbers found:",
              duplicates
            );

            return callback(
              new Error(
                "Duplicate student numbers exist within the same school. Migration stopped to protect existing data."
              )
            );
          }

          db.run(
            `CREATE UNIQUE INDEX IF NOT EXISTS
             idx_students_school_studentNo
             ON students(school_id, studentNo)`,
            [],
            callback
          );
        }
      );
    }
  );
};

// =====================================================
// MIGRATE STUDENT USER ID
// =====================================================

const migrateStudentUserId = (callback) => {
  ensureColumn("students", "user_id", "INTEGER", (err) => {
    if (err) return callback(err);

    db.run(
      `UPDATE students
       SET user_id = (
         SELECT users.id
         FROM users
         WHERE users.school_id = students.school_id
           AND LOWER(TRIM(users.fullname)) =
               LOWER(TRIM(students.fullname))
           AND LOWER(TRIM(users.role)) = 'student'
         ORDER BY users.id
         LIMIT 1
       )
       WHERE user_id IS NULL
         AND EXISTS (
           SELECT 1
           FROM users
           WHERE users.school_id = students.school_id
             AND LOWER(TRIM(users.fullname)) =
                 LOWER(TRIM(students.fullname))
             AND LOWER(TRIM(users.role)) = 'student'
         )`,
      [],
      (updateErr) => {
        if (updateErr) return callback(updateErr);

        db.run(
          "CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id)",
          [],
          callback
        );
      }
    );
  });
};

// =====================================================
// MIGRATE INSTRUCTOR USER ID
// =====================================================

const migrateInstructorUserId = (callback) => {
  ensureColumn("instructors", "user_id", "INTEGER", (err) => {
    if (err) return callback(err);

    db.run(
      `UPDATE instructors
       SET user_id = (
         SELECT users.id
         FROM users
         WHERE users.school_id = instructors.school_id
           AND LOWER(TRIM(users.fullname)) =
               LOWER(TRIM(instructors.name))
           AND LOWER(TRIM(users.role)) = 'instructor'
           AND (
             SELECT COUNT(*)
             FROM users AS matching_users
             WHERE matching_users.school_id = instructors.school_id
               AND LOWER(TRIM(matching_users.fullname)) =
                   LOWER(TRIM(instructors.name))
               AND LOWER(TRIM(matching_users.role)) = 'instructor'
           ) = 1
         LIMIT 1
       )
       WHERE user_id IS NULL
         AND (
           SELECT COUNT(*)
           FROM users
           WHERE users.school_id = instructors.school_id
             AND LOWER(TRIM(users.fullname)) =
                 LOWER(TRIM(instructors.name))
             AND LOWER(TRIM(users.role)) = 'instructor'
         ) = 1`,
      [],
      (updateErr) => {
        if (updateErr) return callback(updateErr);

        db.run(
          "CREATE INDEX IF NOT EXISTS idx_instructors_user_id ON instructors(user_id)",
          [],
          callback
        );
      }
    );
  });
};

// =====================================================
// MIGRATE PUBLIC LESSON BOOKING REQUESTS
// =====================================================


const migrateLessonBookingRequests = (callback) => {
  const columns = [
    ["lesson_id", "INTEGER"],
    ["lesson_count", "INTEGER NOT NULL DEFAULT 1"],
    ["total_price", "REAL NOT NULL DEFAULT 0"],
    ["lesson_schedule", "TEXT"],
    ["service_code", "TEXT"],
    ["service_name", "TEXT"],
    ["service_price", "REAL NOT NULL DEFAULT 0"],
  ];

  let index = 0;

  const next = (err) => {
    if (err) return callback(err);

    if (index >= columns.length) {
      console.log("Lesson booking requests migration completed");
      return callback(null);
    }

    const [name, definition] = columns[index++];

    ensureColumn(
      "lesson_booking_requests",
      name,
      definition,
      (columnErr) => {
        if (columnErr) {
          console.error(
            `Booking request column migration failed (${name}):`,
            columnErr.message
          );
        }

        next(columnErr);
      }
    );
  };

  next(null);
};

// =====================================================
// MIGRATE SERVICE-SPECIFIC LESSON DURATION
// =====================================================

const migrateServiceLessonDuration = (callback) => {
  ensureColumn(
    "school_lesson_package_prices",
    "lesson_duration",
    "INTEGER NOT NULL DEFAULT 60",
    callback
  );
};

const migrateFixedLessonPackageDetails = (callback) => {
  ensureColumn(
    "school_fixed_lesson_packages",
    "vehicle_code",
    "TEXT NOT NULL DEFAULT ''",
    (vehicleErr) => {
      if (vehicleErr) return callback(vehicleErr);

      ensureColumn(
        "school_fixed_lesson_packages",
        "included_services",
        "TEXT NOT NULL DEFAULT '[]'",
        callback
      );
    }
  );
};

// =====================================================
// CREATE INDEXES
// =====================================================

const createIndexes = (callback) => {
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id)",
    "CREATE INDEX IF NOT EXISTS idx_students_status ON students(status)",
    "CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id)",
    "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)",
    "CREATE INDEX IF NOT EXISTS idx_lessons_student ON lessons(student)",
    "CREATE INDEX IF NOT EXISTS idx_lessons_instructor ON lessons(instructor)",
    "CREATE INDEX IF NOT EXISTS idx_lessons_date ON lessons(lesson_date)",
    "CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(studentId)",
    "CREATE INDEX IF NOT EXISTS idx_school_logo_requests_status ON school_logo_requests(status)",
    "CREATE INDEX IF NOT EXISTS idx_school_logo_requests_school ON school_logo_requests(school_id)"
  ];

  let index = 0;

  const next = (err) => {
    if (err) return callback(err);
    if (index >= indexes.length) return callback(null);

    db.run(indexes[index++], [], next);
  };

  next(null);
};

// =====================================================
// DEFAULT SCHOOL
// =====================================================

const setupDefaultSchool = (callback) => {
  db.run(
    `INSERT OR IGNORE INTO schools
      (id, schoolName, phone, email, address, registrationNumber, status)
     VALUES (1, 'DrivePro-SA', '', '', '', '', 'Active')`,
    [],
    callback
  );
};

// =====================================================
// DEFAULT ADMINISTRATOR
// =====================================================

const setupDefaultAdmin = (callback) => {
  db.get(
    "SELECT id FROM users WHERE username = ? LIMIT 1",
    ["admin"],
    (err, row) => {
      if (err) return callback(err);

      if (row) {
        console.log(
          "Existing administrator account preserved. No password reset performed."
        );
        return callback(null);
      }

      console.log(
        "No administrator account found. Secure administrator setup is required."
      );

      return callback(null);
    }
  );
};
// =====================================================
// DATABASE READY CHECK
// =====================================================

const databaseReadyCheck = () => {
  for (const [label, table] of [
    ["Users", "users"],
    ["Students", "students"],
    ["Schools", "schools"]
  ]) {
    db.get(
      `SELECT COUNT(*) AS count FROM ${table}`,
      [],
      (err, row) => {
        if (err) {
          console.error(
            `${label.toUpperCase()} READY CHECK ERROR:`,
            err.message
          );
        } else {
          console.log(`${label} in database: ${row.count}`);
        }
      }
    );
  }
};

// =====================================================
// RUN MIGRATIONS IN ORDER
// =====================================================

const migrations = [
  ["schools", migrateSchoolsTable],
  ["school booking codes", migrateSchoolBookingCodes],
  ["settings", migrateSettingsTable],
  ["test booking instructor fields", migrateTestBookingInstructorFields],
  ["learner/licence status", migrateLearnerLicenceStatus],
  ["learner code", migrateLearnerCode],
  ["lesson WhatsApp reminders", migrateLessonWhatsAppReminders],
  ["student numbers", migrateStudentNumbers],
  ["student user ID", migrateStudentUserId],
  ["instructor user ID", migrateInstructorUserId],
  ["lesson booking requests", migrateLessonBookingRequests],
  ["service lesson duration", migrateServiceLessonDuration],
  ["fixed lesson package details", migrateFixedLessonPackageDetails],
  ["indexes", createIndexes],
  ["default school", setupDefaultSchool],
  ["default administrator", setupDefaultAdmin]
];

const runMigrations = (index = 0) => {
  if (index >= migrations.length) {
    console.log("All database migrations completed");
    databaseReadyCheck();
    return;
  }

  const [label, migration] = migrations[index];

  console.log(`Starting migration: ${label}`);

  migration((err) => {
    if (err) {
      console.error(
        `DATABASE ${label.toUpperCase()} MIGRATION FAILED:`,
        err.message
      );
      return;
    }

    runMigrations(index + 1);
  });
};

// =====================================================
// INITIALIZE DATABASE
// =====================================================

createTables((err) => {
  if (err) {
    console.error(
      "DATABASE TABLE INITIALIZATION FAILED:",
      err.message
    );
    return;
  }

  runMigrations();
});

export default db;
