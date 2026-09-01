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
    : path.join(
        __dirname,
        "..",
        "drivepro.db"
      );

console.log(
  "DATABASE PATH:",
  databasePath
);

// =====================================================
// DATABASE CONNECTION
// =====================================================

const db = new sqlite3.Database(
  databasePath,
  (err) => {
    if (err) {
      console.error(
        "DATABASE CONNECTION FAILED:",
        err.message
      );
    } else {
      console.log(
        "Database Connected"
      );
    }
  }
);

// =====================================================
// CREATE TABLE HELPER
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
            console.error(
              "USERS TABLE ERROR:",
              err.message
            );
          } else {
            console.log(
              "Users table ready"
            );
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
                console.error(
                  "SCHOOLS TABLE ERROR:",
                  err.message
                );

                return callback(err);
              }

              console.log(
                "Schools table ready"
              );

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
                        console.log(
                          "Vehicles table ready"
                        );
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
                            console.log(
                              "Lessons table ready"
                            );
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
                                console.log(
                                  "Payments table ready"
                                );
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

      // =================================================
      // ADD schoolName IF MISSING
      // =================================================

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

      // =================================================
      // COPY OLD name INTO schoolName
      // =================================================

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

      // =================================================
      // ADD REGISTRATION NUMBER
      // =================================================

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

      // =================================================
      // ADD STATUS
      // =================================================

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

      // =================================================
      // RUN MIGRATION IN ORDER
      // =================================================

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
// MIGRATE STUDENT NUMBERS
// =====================================================
//
// OLD DATABASE:
//   studentNo TEXT UNIQUE
//
// PROBLEM:
//   Student numbers were globally unique.
//
// CORRECT DATABASE:
//   studentNo TEXT
//
//   UNIQUE(school_id, studentNo)
//
// This allows:
//
//   School 1 + Student 1 -> allowed
//   School 2 + Student 1 -> allowed
//
// But:
//
//   School 2 + Student 1
//   School 2 + Student 1 -> NOT allowed
//
// =====================================================

const migrateStudentNumbers = (callback) => {

  console.log(
    "***** STARTING STUDENT NUMBER MIGRATION *****"
  );

  // ===================================================
  // CHECK IF NEW INDEX ALREADY EXISTS
  // ===================================================

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

      // -------------------------------------------------
      // If already migrated, stop here.
      // -------------------------------------------------

      if (existingIndex) {

        console.log(
          "Student number migration already complete"
        );

        return callback(null);
      }

      // =================================================
      // CHECK FOR DUPLICATES WITHIN THE SAME SCHOOL
      // =================================================

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

            return callback(
              duplicateErr
            );
          }

          // ------------------------------------------------
          // Do not change the database if existing records
          // already contain a duplicate within one school.
          // ------------------------------------------------

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

          // =================================================
          // CREATE TEMPORARY TABLE
          // =================================================

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
              (createErr) => {

                if (createErr) {

                  console.error(
                    "STUDENTS NEW TABLE ERROR:",
                    createErr.message
                  );

                  return callback(
                    createErr
                  );
                }

                console.log(
                  "Temporary students table created"
                );

                // =================================================
                // COPY EXISTING STUDENTS
                // =================================================

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
                    licenceCode,
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
                    licenceCode,
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

                    // =================================================
                    // DROP OLD STUDENTS TABLE
                    // =================================================

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

                        // =================================================
                        // RENAME NEW TABLE
                        // =================================================

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

                              return callback(
                                renameErr
                              );
                            }

                            console.log(
                              "Students table rebuilt successfully"
                            );

                            // =================================================
                            // CREATE SCHOOL-SPECIFIC UNIQUE INDEX
                            // =================================================

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

                                  return callback(
                                    indexErr
                                  );
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
// CREATE INDEXES
// =====================================================

const createIndexes = (callback) => {

  const indexes = [

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

              return callback(
                updateErr
              );
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

            return callback(
              insertErr
            );
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
// 3. Migrate student numbers
// 4. Create indexes
// 5. Create default school
// 6. Create/update admin
// 7. Run ready checks
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

    migrateStudentNumbers((err) => {

      if (err) {

        console.error(
          "DATABASE STUDENT NUMBER MIGRATION FAILED:",
          err.message
        );

        return;
      }

      createIndexes((err) => {

        if (err) {

          console.error(
            "DATABASE INDEX CREATION FAILED:",
            err.message
          );

          return;
        }

        setupDefaultSchool((err) => {

          if (err) {

            console.error(
              "DEFAULT SCHOOL SETUP FAILED:",
              err.message
            );

            return;
          }

          setupDefaultAdmin((err) => {

            if (err) {

              console.error(
                "DEFAULT ADMIN SETUP FAILED:",
                err.message
              );

              return;
            }

            databaseReadyCheck();

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