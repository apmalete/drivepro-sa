import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

console.log("***** DATABASE.JS LOADED *****");

sqlite3.verbose();

// =====================================================
// SERVER DIRECTORY
// =====================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================================
// DATABASE PATH
// =====================================================
//
// LOCAL:
//   server/drivepro.db
//
// RAILWAY:
//   /app/data/drivepro.db
//
// =====================================================

const databasePath =
  process.env.NODE_ENV === "production"
    ? "/app/data/drivepro.db"
    : path.join(__dirname, "..", "drivepro.db");

console.log("DATABASE PATH:", databasePath);

// =====================================================
// DATABASE CONNECTION
// =====================================================

const db = new sqlite3.Database(databasePath, (err) => {
  if (err) {
    console.error("DATABASE CONNECTION FAILED:", err.message);
  } else {
    console.log("Database Connected");
  }
});

// =====================================================
// CREATE TABLES
// =====================================================

const createTables = (callback) => {

  // ===================================================
  // STUDENTS
  // ===================================================

  db.run(
    `
    CREATE TABLE IF NOT EXISTS students (
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
    )
    `,
    [],
    (err) => {

      if (err) {
        console.error("STUDENTS TABLE ERROR:", err.message);
      } else {
        console.log("Students table ready");
      }

      // =================================================
      // USERS
      // =================================================

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
            console.error("USERS TABLE ERROR:", err.message);
          } else {
            console.log("Users table ready");
          }

          // =============================================
          // SCHOOLS
          // =============================================

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
                console.error("SCHOOLS TABLE ERROR:", err.message);
                return callback(err);
              }

              console.log("Schools table ready");

              // =========================================
              // INSTRUCTORS
              // =========================================

              db.run(
                `
                CREATE TABLE IF NOT EXISTS instructors (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  phone TEXT NOT NULL,
                  licence TEXT NOT NULL,
                  experience TEXT NOT NULL,
                  status TEXT DEFAULT 'Active',
                  school_id INTEGER DEFAULT 1,
                  user_id INTEGER
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
                    console.log("Instructors table ready");
                  }

                  // =======================================
                  // VEHICLES
                  // =======================================

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
                        console.log("Vehicles table ready");
                      }

                      // =================================
                      // LESSONS
                      // =================================

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
                            console.log("Lessons table ready");
                          }

                          // ===============================
                          // PAYMENTS
                          // ===============================

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
                                console.log("Payments table ready");
                              }

                              // =============================
                              // SETTINGS
                              // =============================

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

                                  // =============================================
                                  // TEST BOOKINGS
                                  // =============================================

                                  db.run(
                                    `
                                    CREATE TABLE IF NOT EXISTS test_bookings (
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
                                    )
                                    `,
                                    [],
                                    (testBookingErr) => {

                                      if (testBookingErr) {
                                        console.error(
                                          "TEST BOOKINGS TABLE ERROR:",
                                          testBookingErr.message
                                        );

                                        return callback(testBookingErr);
                                      }

                                      console.log(
                                        "Test bookings table ready"
                                      );

                                      callback(null);
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};
// =====================================================
// TEST BOOKINGS - INSTRUCTOR FIELDS
// =====================================================

db.run(
  `ALTER TABLE test_bookings ADD COLUMN instructor_id INTEGER`,
  (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Error adding instructor_id:", err.message);
    } else if (!err) {
      console.log("✅ test_bookings instructor_id added");
    }
  }
);

db.run(
  `ALTER TABLE test_bookings ADD COLUMN instructor_name TEXT`,
  (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Error adding instructor_name:", err.message);
    } else if (!err) {
      console.log("✅ test_bookings instructor_name added");
    }
  }
);
// =====================================================
// MIGRATE SETTINGS TABLE
// =====================================================

const migrateSettingsTable = (callback) => {

  db.all(
    `PRAGMA table_info(settings)`,
    [],
    (err, columns) => {

      if (err) {
        console.error(
          "SETTINGS MIGRATION CHECK ERROR:",
          err.message
        );

        return callback(err);
      }

      const existingColumns = new Set(
        (columns || []).map(
          (column) => column.name
        )
      );

      const columnsToAdd = [
        {
          name: "schoolName",
          definition: "TEXT DEFAULT 'DrivePro-SA'"
        },
        {
          name: "phone",
          definition: "TEXT DEFAULT ''"
        },
        {
          name: "email",
          definition: "TEXT DEFAULT ''"
        },
        {
          name: "address",
          definition: "TEXT DEFAULT ''"
        },
        {
          name: "registrationNumber",
          definition: "TEXT DEFAULT ''"
        },
        {
          name: "defaultLessonDuration",
          definition: "INTEGER DEFAULT 60"
        },
        {
          name: "defaultLessonPrice",
          definition: "REAL DEFAULT 0"
        },
        {
          name: "lessonDuration",
          definition: "INTEGER DEFAULT 60"
        },
        {
          name: "lessonPrice",
          definition: "REAL DEFAULT 0"
        },
        {
          name: "school_id",
          definition: "INTEGER DEFAULT 1"
        },
        {
          name: "created_at",
          definition: "TEXT"
        },
        {
          name: "updated_at",
          definition: "TEXT"
        }
      ];

      let index = 0;

      const addNextColumn = () => {

        if (index >= columnsToAdd.length) {

          db.run(
            `
            INSERT OR IGNORE INTO settings
            (
              id,
              schoolName,
              phone,
              email,
              address,
              registrationNumber,
              defaultLessonDuration,
              defaultLessonPrice,
              lessonDuration,
              lessonPrice,
              school_id
            )
            VALUES
            (
              1,
              'DrivePro-SA',
              '',
              '',
              '',
              '',
              60,
              0,
              60,
              0,
              1
            )
            `,
            [],
            (insertErr) => {

              if (insertErr) {

                console.error(
                  "DEFAULT SETTINGS ERROR:",
                  insertErr.message
                );

                return callback(insertErr);
              }

              console.log(
                "Settings migration completed"
              );

              callback(null);
            }
          );

          return;
        }

        const column = columnsToAdd[index];

        index++;

        if (
          existingColumns.has(
            column.name
          )
        ) {
          return addNextColumn();
        }

        console.log(
          `Adding settings column: ${column.name}`
        );

        db.run(
          `
          ALTER TABLE settings
          ADD COLUMN ${column.name} ${column.definition}
          `,
          [],
          (alterErr) => {

            if (alterErr) {

              console.error(
                `SETTINGS COLUMN MIGRATION ERROR (${column.name}):`,
                alterErr.message
              );

              return callback(alterErr);
            }

            console.log(
              `Settings column added: ${column.name}`
            );

            addNextColumn();
          }
        );
      };

      addNextColumn();
    }
  );
};

// =====================================================
// MIGRATE SCHOOLS TABLE
// =====================================================

const migrateSchoolsTable = (callback) => {

  db.all(
    `PRAGMA table_info(schools)`,
    [],
    (err, columns) => {

      if (err) {
        console.error(
          "SCHOOLS MIGRATION CHECK ERROR:",
          err.message
        );

        return callback(err);
      }

      const existingColumns = new Set(
        (columns || []).map(
          (column) => column.name
        )
      );

      const addColumn = (
        sql,
        label,
        next
      ) => {

        db.run(
          sql,
          [],
          (err) => {

            if (err) {

              console.error(
                `SCHOOLS MIGRATION ERROR (${label}):`,
                err.message
              );

              return next(err);
            }

            console.log(
              `Schools migration: added ${label}`
            );

            next(null);
          }
        );
      };

      const addSchoolName = (next) => {

        if (
          existingColumns.has(
            "schoolName"
          )
        ) {
          return next(null);
        }

        addColumn(
          `
          ALTER TABLE schools
          ADD COLUMN schoolName TEXT DEFAULT 'DrivePro-SA'
          `,
          "schoolName",
          next
        );
      };

      const copyOldSchoolName = (next) => {

        if (
          !existingColumns.has(
            "name"
          )
        ) {
          return next(null);
        }

        db.run(
          `
          UPDATE schools
          SET schoolName = name
          WHERE
            (schoolName IS NULL OR schoolName = '')
            AND name IS NOT NULL
          `,
          [],
          (err) => {

            if (err) {

              console.error(
                "SCHOOLS NAME MIGRATION ERROR:",
                err.message
              );

              return next(err);
            }

            console.log(
              "Schools migration: old name copied to schoolName"
            );

            next(null);
          }
        );
      };

      const addRegistrationNumber = (next) => {

        if (
          existingColumns.has(
            "registrationNumber"
          )
        ) {
          return next(null);
        }

        addColumn(
          `
          ALTER TABLE schools
          ADD COLUMN registrationNumber TEXT DEFAULT ''
          `,
          "registrationNumber",
          next
        );
      };

      const addStatus = (next) => {

        if (
          existingColumns.has(
            "status"
          )
        ) {
          return next(null);
        }

        addColumn(
          `
          ALTER TABLE schools
          ADD COLUMN status TEXT DEFAULT 'Active'
          `,
          "status",
          next
        );
      };

      addSchoolName((err) => {

        if (err) {
          return callback(err);
        }

        copyOldSchoolName((err) => {

          if (err) {
            return callback(err);
          }

          addRegistrationNumber((err) => {

            if (err) {
              return callback(err);
            }

            addStatus((err) => {

              if (err) {
                return callback(err);
              }

              console.log(
                "Schools migration complete"
              );

              callback(null);
            });
          });
        });
      });
    }
  );
};

// =====================================================
// MIGRATE LEARNER AND LICENCE STATUS
// =====================================================

const migrateLearnerLicenceStatus = (callback) => {

  db.all(
    "PRAGMA table_info(students)",
    [],
    (err, columns) => {

      if (err) {
        console.error(
          "STUDENT STATUS COLUMN CHECK FAILED:",
          err.message
        );

        return callback(err);
      }

      const columnNames = columns.map(
        (column) => column.name
      );

      const addLearnerStatus =
        !columnNames.includes("learnerStatus");

      const addLicenceStatus =
        !columnNames.includes("licenceStatus");

      const addColumn = (sql, next) => {

        db.run(
          sql,
          [],
          (columnErr) => {

            if (columnErr) {

              console.error(
                "STUDENT STATUS COLUMN MIGRATION FAILED:",
                columnErr.message
              );

              return next(columnErr);
            }

            next(null);
          }
        );
      };

      const finish = () => {

        console.log(
          "Learner/licence status migration completed"
        );

        callback(null);
      };

      if (addLearnerStatus) {

        addColumn(
          "ALTER TABLE students ADD COLUMN learnerStatus TEXT DEFAULT 'Not Applicable'",
          (learnerErr) => {

            if (learnerErr) {
              return callback(learnerErr);
            }

            if (addLicenceStatus) {

              addColumn(
                "ALTER TABLE students ADD COLUMN licenceStatus TEXT DEFAULT 'Not Applicable'",
                (licenceErr) => {

                  if (licenceErr) {
                    return callback(licenceErr);
                  }

                  finish();
                }
              );

            } else {

              finish();

            }

          }
        );

      } else if (addLicenceStatus) {

        addColumn(
          "ALTER TABLE students ADD COLUMN licenceStatus TEXT DEFAULT 'Not Applicable'",
          (licenceErr) => {

            if (licenceErr) {
              return callback(licenceErr);
            }

            finish();
          }
        );

      } else {

        finish();

      }

    }
  );
};

// =====================================================
// MIGRATE LESSON WHATSAPP REMINDER COLUMNS
// =====================================================

const migrateLessonWhatsAppReminders = (callback) => {

  db.all(
    `PRAGMA table_info(lessons)`,
    [],
    (err, columns) => {

      if (err) {
        console.error(
          "LESSON WHATSAPP COLUMN CHECK ERROR:",
          err.message
        );

        return callback(err);
      }

      const existingColumns = new Set(
        (columns || []).map(
          (column) => column.name
        )
      );

      const columnsToAdd = [
        {
          name: "notification_sent",
          definition: "INTEGER DEFAULT 0"
        },
        {
          name: "day_reminder_sent",
          definition: "INTEGER DEFAULT 0"
        }
      ];

      let index = 0;

      const addNextColumn = () => {

        if (index >= columnsToAdd.length) {

          console.log(
            "Lesson WhatsApp reminder migration completed"
          );

          return callback(null);
        }

        const column = columnsToAdd[index];

        index++;

        if (existingColumns.has(column.name)) {
          return addNextColumn();
        }

        console.log(
          `Adding lesson WhatsApp column: ${column.name}`
        );

        db.run(
          `
          ALTER TABLE lessons
          ADD COLUMN ${column.name} ${column.definition}
          `,
          [],
          (alterErr) => {

            if (alterErr) {

              console.error(
                `LESSON WHATSAPP COLUMN MIGRATION ERROR (${column.name}):`,
                alterErr.message
              );

              return callback(alterErr);
            }

            console.log(
              `Lesson WhatsApp column added: ${column.name}`
            );

            addNextColumn();
          }
        );
      };

      addNextColumn();
    }
  );
};

// =====================================================
// MIGRATE LEARNER CODE
// =====================================================

const migrateLearnerCode = (callback) => {

  db.all(
    "PRAGMA table_info(students)",
    [],
    (err, columns) => {

      if (err) {
        console.error(
          "LEARNER CODE MIGRATION CHECK ERROR:",
          err.message
        );

        return callback(err);
      }

      const exists = columns.some(
        (column) => column.name === "learnerCode"
      );

      if (exists) {

        console.log(
          "Learner code migration already complete"
        );

        return callback(null);
      }

      db.run(
        "ALTER TABLE students ADD COLUMN learnerCode TEXT",
        [],
        (alterErr) => {

          if (alterErr) {

            console.error(
              "LEARNER CODE MIGRATION ERROR:",
              alterErr.message
            );

            return callback(alterErr);
          }

          console.log(
            "Learner code migration completed"
          );

          callback(null);
        }
      );
    }
  );
};

// =====================================================
// MIGRATE STUDENT NUMBERS
// =====================================================

const migrateStudentNumbers = (callback) => {

  console.log(
    "***** STARTING STUDENT NUMBER MIGRATION *****"
  );

  db.get(
    `
    SELECT name
    FROM sqlite_master
    WHERE type = 'index'
      AND name = 'idx_students_school_studentNo'
    `,
    [],
    (err, existingIndex) => {

      if (err) {

        console.error(
          "STUDENT NUMBER MIGRATION CHECK ERROR:",
          err.message
        );

        return callback(err);
      }

      if (existingIndex) {

        console.log(
          "Student number migration already complete"
        );

        return callback(null);
      }

      db.all(
        `
        SELECT
          school_id,
          studentNo,
          COUNT(*) AS count
        FROM students
        WHERE studentNo IS NOT NULL
          AND TRIM(studentNo) <> ''
        GROUP BY
          school_id,
          studentNo
        HAVING COUNT(*) > 1
        `,
        [],
        (duplicateErr, duplicates) => {

          if (duplicateErr) {

            console.error(
              "STUDENT NUMBER DUPLICATE CHECK ERROR:",
              duplicateErr.message
            );

            return callback(duplicateErr);
          }

          if (
            duplicates &&
            duplicates.length > 0
          ) {

            console.error(
              "STUDENT NUMBER MIGRATION STOPPED."
            );

            console.error(
              "Duplicate student numbers found within the same school:",
              duplicates
            );

            return callback(
              new Error(
                "Duplicate student numbers exist within the same school. Migration stopped to protect existing data."
              )
            );
          }

          db.serialize(() => {

            console.log(
              "Creating temporary students table..."
            );

            db.run(
              `
              CREATE TABLE students_new (
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
              )
              `,
              [],
              (createErr) => {

                if (createErr) {

                  console.error(
                    "STUDENTS NEW TABLE ERROR:",
                    createErr.message
                  );

                  return callback(createErr);
                }

                console.log(
                  "Temporary students table created"
                );

                db.run(
                  `
                  INSERT INTO students_new
                  (
                    id,
                    studentNo,
                    fullname,
                    idNumber,
                    gender,
                    phone,
                    email,
                    address,
                    learnerNumber,
                    learnerCode,
                    learnerStatus,
                    licenceCode,
                    licenceStatus,
                    instructor,
                    vehicle,
                    courseFee,
                    amountPaid,
                    balance,
                    photo,
                    status,
                    school_id,
                    created_at
                  )
                  SELECT
                    id,
                    studentNo,
                    fullname,
                    idNumber,
                    gender,
                    phone,
                    email,
                    address,
                    learnerNumber,
                    learnerCode,
                    learnerStatus,
                    licenceCode,
                    licenceStatus,
                    instructor,
                    vehicle,
                    courseFee,
                    amountPaid,
                    balance,
                    photo,
                    status,
                    school_id,
                    created_at
                  FROM students
                  `,
                  [],
                  (copyErr) => {

                    if (copyErr) {

                      console.error(
                        "STUDENTS DATA COPY ERROR:",
                        copyErr.message
                      );

                      db.run(
                        `
                        DROP TABLE IF EXISTS students_new
                        `,
                        [],
                        () => {
                          callback(copyErr);
                        }
                      );

                      return;
                    }

                    console.log(
                      "Existing students copied successfully"
                    );

                    db.run(
                      `
                      DROP TABLE students
                      `,
                      [],
                      (dropErr) => {

                        if (dropErr) {

                          console.error(
                            "OLD STUDENTS TABLE DROP ERROR:",
                            dropErr.message
                          );

                          db.run(
                            `
                            DROP TABLE IF EXISTS students_new
                            `,
                            [],
                            () => {
                              callback(dropErr);
                            }
                          );

                          return;
                        }

                        console.log(
                          "Old students table removed"
                        );

                        db.run(
                          `
                          ALTER TABLE students_new
                          RENAME TO students
                          `,
                          [],
                          (renameErr) => {

                            if (renameErr) {

                              console.error(
                                "STUDENTS TABLE RENAME ERROR:",
                                renameErr.message
                              );

                              return callback(renameErr);
                            }

                            console.log(
                              "Students table rebuilt successfully"
                            );

                            db.run(
                              `
                              CREATE UNIQUE INDEX IF NOT EXISTS
                              idx_students_school_studentNo
                              ON students
                              (
                                school_id,
                                studentNo
                              )
                              `,
                              [],
                              (indexErr) => {

                                if (indexErr) {

                                  console.error(
                                    "STUDENT NUMBER UNIQUE INDEX ERROR:",
                                    indexErr.message
                                  );

                                  return callback(indexErr);
                                }

                                console.log(
                                  "Student number migration complete"
                                );

                                callback(null);
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );

          });
        }
      );
    }
  );
};

// =====================================================
// MIGRATE STUDENT USER ID
// =====================================================
//
// This connects:
//
// USERS
//   id
//   fullname
//   role = Student
//   school_id
//
// to:
//
// STUDENTS
//   user_id
//
// Existing records are automatically linked when the
// student fullname and school match.
//
// =====================================================

const migrateStudentUserId = (callback) => {

  db.all(
    `PRAGMA table_info(students)`,
    [],
    (err, columns) => {

      if (err) {

        console.error(
          "STUDENT USER ID MIGRATION CHECK ERROR:",
          err.message
        );

        return callback(err);
      }

      const exists = (columns || []).some(
        (column) =>
          String(column.name).toLowerCase() === "user_id"
      );

      const addUserIdColumn = (next) => {

        if (exists) {

          console.log(
            "Student user_id column already exists"
          );

          return next(null);
        }

        db.run(
          `
          ALTER TABLE students
          ADD COLUMN user_id INTEGER
          `,
          [],
          (alterErr) => {

            if (alterErr) {

              console.error(
                "STUDENT USER ID COLUMN MIGRATION ERROR:",
                alterErr.message
              );

              return next(alterErr);
            }

            console.log(
              "Student user_id column added"
            );

            next(null);
          }
        );
      };

      addUserIdColumn((columnErr) => {

        if (columnErr) {
          return callback(columnErr);
        }

        // =================================================
        // LINK EXISTING STUDENTS TO STUDENT USERS
        // =================================================

        db.run(
          `
          UPDATE students
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
            )
          `,
          [],
          (updateErr) => {

            if (updateErr) {

              console.error(
                "STUDENT USER ID BACKFILL ERROR:",
                updateErr.message
              );

              return callback(updateErr);
            }

            console.log(
              "Existing student/user records linked where names matched"
            );

            // =================================================
            // CREATE USER ID INDEX
            // =================================================

            db.run(
              `
              CREATE INDEX IF NOT EXISTS idx_students_user_id
              ON students(user_id)
              `,
              [],
              (indexErr) => {

                if (indexErr) {

                  console.error(
                    "STUDENT USER ID INDEX ERROR:",
                    indexErr.message
                  );

                  return callback(indexErr);
                }

                console.log(
                  "Student user_id index ready"
                );

                callback(null);
              }
            );
          }
        );
      });
    }
  );
};

// =====================================================
// MIGRATE INSTRUCTOR USER ID
// =====================================================
//
// This connects:
//
// USERS
//   id
//   fullname
//   role = Instructor
//   school_id
//
// to:
//
// INSTRUCTORS
//   user_id
//
// Existing instructor records are linked only when there
// is exactly ONE matching Instructor user in the same school.
// This avoids incorrectly linking two instructors who have
// the same name.
//
// =====================================================

const migrateInstructorUserId = (callback) => {

  db.all(
    `PRAGMA table_info(instructors)`,
    [],
    (err, columns) => {

      if (err) {

        console.error(
          "INSTRUCTOR USER ID MIGRATION CHECK ERROR:",
          err.message
        );

        return callback(err);
      }

      const exists = (columns || []).some(
        (column) =>
          String(column.name).toLowerCase() === "user_id"
      );

      const addUserIdColumn = (next) => {

        if (exists) {

          console.log(
            "Instructor user_id column already exists"
          );

          return next(null);
        }

        db.run(
          `
          ALTER TABLE instructors
          ADD COLUMN user_id INTEGER
          `,
          [],
          (alterErr) => {

            if (alterErr) {

              console.error(
                "INSTRUCTOR USER ID COLUMN MIGRATION ERROR:",
                alterErr.message
              );

              return next(alterErr);
            }

            console.log(
              "Instructor user_id column added"
            );

            next(null);
          }
        );
      };

      addUserIdColumn((columnErr) => {

        if (columnErr) {
          return callback(columnErr);
        }

        // =================================================
        // LINK EXISTING INSTRUCTORS TO INSTRUCTOR USERS
        // =================================================
        //
        // Only link when there is exactly ONE matching
        // instructor user with the same name in the same
        // school.
        //
        // If two instructors have the same name, the record
        // remains unlinked so we do not connect the wrong
        // person.
        // =================================================

        db.run(
          `
          UPDATE instructors
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
            ) = 1
          `,
          [],
          (updateErr) => {

            if (updateErr) {

              console.error(
                "INSTRUCTOR USER ID BACKFILL ERROR:",
                updateErr.message
              );

              return callback(updateErr);
            }

            console.log(
              "Existing instructor/user records linked where name and school matched uniquely"
            );

            // =================================================
            // CREATE USER ID INDEX
            // =================================================

            db.run(
              `
              CREATE INDEX IF NOT EXISTS idx_instructors_user_id
              ON instructors(user_id)
              `,
              [],
              (indexErr) => {

                if (indexErr) {

                  console.error(
                    "INSTRUCTOR USER ID INDEX ERROR:",
                    indexErr.message
                  );

                  return callback(indexErr);
                }

                console.log(
                  "Instructor user_id index ready"
                );

                callback(null);
              }
            );
          }
        );
      });
    }
  );
};

// =====================================================
// CREATE INDEXES
// =====================================================

const createIndexes = (callback) => {

  const indexes = [

    {
      name: "idx_students_user_id",
      sql: `
        CREATE INDEX IF NOT EXISTS idx_students_user_id
        ON students(user_id)
      `
    },

    {
      name: "idx_instructors_user_id",
      sql: `
        CREATE INDEX IF NOT EXISTS idx_instructors_user_id
        ON instructors(user_id)
      `
    },

    {
      name: "idx_students_school",
      sql: `
        CREATE INDEX IF NOT EXISTS idx_students_school
        ON students(school_id)
      `
    },

    {
      name: "idx_students_status",
      sql: `
        CREATE INDEX IF NOT EXISTS idx_students_status
        ON students(status)
      `
    },

    {
      name: "idx_users_school",
      sql: `
        CREATE INDEX IF NOT EXISTS idx_users_school
        ON users(school_id)
      `
    },

    {
      name: "idx_users_username",
      sql: `
        CREATE INDEX IF NOT EXISTS idx_users_username
        ON users(username)
      `
    },

    {
      name: "idx_lessons_student",
      sql: `
        CREATE INDEX IF NOT EXISTS idx_lessons_student
        ON lessons(student)
      `
    },

    {
      name: "idx_lessons_instructor",
      sql: `
        CREATE INDEX IF NOT EXISTS idx_lessons_instructor
        ON lessons(instructor)
      `
    },

    {
      name: "idx_lessons_date",
      sql: `
        CREATE INDEX IF NOT EXISTS idx_lessons_date
        ON lessons(lesson_date)
      `
    },

    {
      name: "idx_payments_student",
      sql: `
        CREATE INDEX IF NOT EXISTS idx_payments_student
        ON payments(studentId)
      `
    }

  ];

  let indexNumber = 0;

  const nextIndex = () => {

    if (
      indexNumber >=
      indexes.length
    ) {

      console.log(
        "Database indexes ready"
      );

      return callback(null);
    }

    const index =
      indexes[indexNumber];

    indexNumber++;

    db.run(
      index.sql,
      [],
      (err) => {

        if (err) {

          console.error(
            `${index.name} ERROR:`,
            err.message
          );

          return callback(err);
        }

        nextIndex();
      }
    );
  };

  console.log(
    "Creating database indexes..."
  );

  nextIndex();
};

// =====================================================
// DEFAULT SCHOOL
// =====================================================

const setupDefaultSchool = (callback) => {

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

        return callback(err);
      }

      console.log(
        "Default school ready"
      );

      callback(null);
    }
  );
};

// =====================================================
// DEFAULT ADMIN
// =====================================================

const setupDefaultAdmin = (callback) => {

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

        return callback(err);
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
            "admin",
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

              return callback(updateErr);
            }

            console.log(
              "Default admin account updated"
            );

            callback(null);
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

            return callback(insertErr);
          }

          console.log(
            "Default admin account created"
          );

          callback(null);
        }
      );
    }
  );
};

// =====================================================
// DATABASE READY CHECK
// =====================================================

const databaseReadyCheck = () => {

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
};

// =====================================================
// INITIALIZE DATABASE
// =====================================================
//
// 1. Create tables
// 2. Migrate schools
// 3. Migrate settings
// 4. Migrate learner/licence status
// 5. Migrate learner code
// 6. Migrate lesson WhatsApp reminders
// 7. Migrate student numbers
// 8. Migrate student user ID
// 9. Migrate instructor user ID
// 10. Create indexes
// 11. Create default school
// 12. Create/update admin
// 13. Run ready checks
//
// =====================================================

createTables((err) => {

  if (err) {

    console.error(
      "DATABASE TABLE INITIALIZATION FAILED:",
      err.message
    );

    return;
  }

  migrateSchoolsTable((err) => {

    if (err) {

      console.error(
        "DATABASE SCHOOLS MIGRATION FAILED:",
        err.message
      );

      return;
    }

    migrateSettingsTable((err) => {

      if (err) {

        console.error(
          "DATABASE SETTINGS MIGRATION FAILED:",
          err.message
        );

        return;
      }

      migrateLearnerLicenceStatus((err) => {

        if (err) {

          console.error(
            "DATABASE LEARNER/LICENCE STATUS MIGRATION FAILED:",
            err.message
          );

          return;
        }

        migrateLearnerCode((err) => {

          if (err) {

            console.error(
              "DATABASE LEARNER CODE MIGRATION FAILED:",
              err.message
            );

            return;
          }

          migrateLessonWhatsAppReminders((err) => {

            if (err) {

              console.error(
                "DATABASE LESSON WHATSAPP MIGRATION FAILED:",
                err.message
              );

              return;
            }

            migrateStudentNumbers((err) => {

              if (err) {

                console.error(
                  "DATABASE STUDENT NUMBER MIGRATION FAILED:",
                  err.message
                );

                return;
              }

              // =================================================
              // STUDENT USER ID MIGRATION
              // =================================================

              migrateStudentUserId((err) => {

                if (err) {

                  console.error(
                    "DATABASE STUDENT USER ID MIGRATION FAILED:",
                    err.message
                  );

                  return;
                }

                // =================================================
                // INSTRUCTOR USER ID MIGRATION
                // =================================================

                migrateInstructorUserId((err) => {

                  if (err) {

                    console.error(
                      "DATABASE INSTRUCTOR USER ID MIGRATION FAILED:",
                      err.message
                    );

                    return;
                  }

                  // =================================================
                  // CREATE INDEXES
                  // =================================================

                  createIndexes((err) => {

                    if (err) {

                      console.error(
                        "DATABASE INDEX CREATION FAILED:",
                        err.message
                      );

                      return;
                    }

                    // =================================================
                    // DEFAULT SCHOOL
                    // =================================================

                    setupDefaultSchool((err) => {

                      if (err) {

                        console.error(
                          "DEFAULT SCHOOL SETUP FAILED:",
                          err.message
                        );

                        return;
                      }

                      // =================================================
                      // DEFAULT ADMIN
                      // =================================================

                      setupDefaultAdmin((err) => {

                        if (err) {

                          console.error(
                            "DEFAULT ADMIN SETUP FAILED:",
                            err.message
                          );

                          return;
                        }

                        // =================================================
                        // DATABASE READY
                        // =================================================

                        databaseReadyCheck();

                      });

                    });

                  });

                });

              });

            });

          });

        });

      });

    });

  });

});

// =====================================================
// EXPORT DATABASE
// =====================================================

export default db;