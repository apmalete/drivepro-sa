import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

console.log("***** DATABASE.JS LOADED *****");

sqlite3.verbose();

// ======================================
// SERVER DIRECTORY
// ======================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================
// DATABASE PATH
// ======================================

const databasePath = path.join(
  __dirname,
  "..",
  "drivepro.db"
);

console.log(
  "📁 DATABASE PATH:",
  databasePath
);

// ======================================
// DATABASE CONNECTION
// ======================================

const db = new sqlite3.Database(
  databasePath,
  (err) => {
    if (err) {
      console.error(
        "❌ Database connection failed:",
        err.message
      );
    } else {
      console.log(
        "✅ Database Connected"
      );
    }
  }
);

// ======================================
// STUDENTS
// ======================================

db.run(`
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
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// ======================================
// STUDENT UPGRADES
// ======================================

db.run(
  `ALTER TABLE students
   ADD COLUMN courseFee REAL DEFAULT 0`,
  (err) => {
    if (
      err &&
      !err.message.includes(
        "duplicate column name"
      )
    ) {
      console.error(
        "courseFee upgrade:",
        err.message
      );
    }
  }
);

db.run(
  `ALTER TABLE students
   ADD COLUMN amountPaid REAL DEFAULT 0`,
  (err) => {
    if (
      err &&
      !err.message.includes(
        "duplicate column name"
      )
    ) {
      console.error(
        "amountPaid upgrade:",
        err.message
      );
    }
  }
);

db.run(
  `ALTER TABLE students
   ADD COLUMN balance REAL DEFAULT 0`,
  (err) => {
    if (
      err &&
      !err.message.includes(
        "duplicate column name"
      )
    ) {
      console.error(
        "balance upgrade:",
        err.message
      );
    }
  }
);

db.run(
  `ALTER TABLE students
   ADD COLUMN photo TEXT`,
  (err) => {
    if (
      err &&
      !err.message.includes(
        "duplicate column name"
      )
    ) {
      console.error(
        "photo upgrade:",
        err.message
      );
    }
  }
);

// ======================================
// STUDENT SCHOOL UPGRADE
// ======================================

db.all(
  `PRAGMA table_info(students)`,
  [],
  (err, columns) => {

    if (err) {
      console.error(
        "STUDENTS COLUMN CHECK ERROR:",
        err.message
      );

      return;
    }

    const columnNames =
      columns.map(
        (column) => column.name
      );

    // ==================================
    // ASSIGN EXISTING STUDENTS
    // ==================================

    const assignStudentsToSchool = () => {

      db.run(
        `
        UPDATE students
        SET school_id = 1
        WHERE school_id IS NULL
           OR school_id = 0
        `,
        [],
        (err) => {

          if (err) {
            console.error(
              "STUDENT SCHOOL UPDATE ERROR:",
              err.message
            );

            return;
          }

          console.log(
            "✅ Existing students assigned to School 1"
          );
        }
      );
    };

    // ==================================
    // CHECK school_id
    // ==================================

    if (
      columnNames.includes(
        "school_id"
      )
    ) {

      console.log(
        "✅ Students school_id already exists"
      );

      assignStudentsToSchool();

      return;
    }

    // ==================================
    // ADD school_id
    // ==================================

    db.run(
      `
      ALTER TABLE students
      ADD COLUMN school_id INTEGER DEFAULT 1
      `,
      [],
      (err) => {

        if (err) {
          console.error(
            "student school_id upgrade error:",
            err.message
          );

          return;
        }

        console.log(
          "✅ Students school_id column added"
        );

        assignStudentsToSchool();
      }
    );
  }
);

// ======================================
// LESSONS
// ======================================

db.run(`
  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student TEXT NOT NULL,
    instructor TEXT NOT NULL,
    vehicle TEXT NOT NULL,
    lesson_date TEXT NOT NULL,
    lesson_time TEXT NOT NULL,
    status TEXT DEFAULT 'Booked'
  )
`);
// ======================================
// LESSON SCHOOL UPGRADE
// ======================================

db.all(
  `PRAGMA table_info(lessons)`,
  [],
  (err, columns) => {

    if (err) {
      console.error(
        "LESSONS COLUMN CHECK ERROR:",
        err.message
      );

      return;
    }

    const columnNames =
      columns.map(
        (column) => column.name
      );

    // ==================================
    // ASSIGN EXISTING LESSONS
    // ==================================

    const assignLessonsToSchool = () => {

      db.run(
        `
        UPDATE lessons
        SET school_id = 1
        WHERE school_id IS NULL
           OR school_id = 0
        `,
        [],
        (err) => {

          if (err) {
            console.error(
              "LESSON SCHOOL UPDATE ERROR:",
              err.message
            );

            return;
          }

          console.log(
            "✅ Existing lessons assigned to School 1"
          );
        }
      );
    };

    // ==================================
    // CHECK school_id
    // ==================================

    if (
      columnNames.includes(
        "school_id"
      )
    ) {

      console.log(
        "✅ Lessons school_id already exists"
      );

      assignLessonsToSchool();

      return;
    }

    // ==================================
    // ADD school_id
    // ==================================

    db.run(
      `
      ALTER TABLE lessons
      ADD COLUMN school_id INTEGER DEFAULT 1
      `,
      [],
      (err) => {

        if (err) {
          console.error(
            "lesson school_id upgrade error:",
            err.message
          );

          return;
        }

        console.log(
          "✅ Lessons school_id column added"
        );

        assignLessonsToSchool();
      }
    );
  }
);

// ======================================
// INSTRUCTORS
// ======================================

db.run(`
  CREATE TABLE IF NOT EXISTS instructors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    licence TEXT NOT NULL,
    experience TEXT NOT NULL,
    status TEXT DEFAULT 'Active'
  )
`);
// ======================================
// INSTRUCTOR SCHOOL UPGRADE
// ======================================

db.all(
  `PRAGMA table_info(instructors)`,
  [],
  (err, columns) => {

    if (err) {
      console.error(
        "INSTRUCTORS COLUMN CHECK ERROR:",
        err.message
      );

      return;
    }

    const columnNames =
      columns.map(
        (column) => column.name
      );

    // ==================================
    // ASSIGN EXISTING INSTRUCTORS
    // ==================================

    const assignInstructorsToSchool = () => {

      db.run(
        `
        UPDATE instructors
        SET school_id = 1
        WHERE school_id IS NULL
           OR school_id = 0
        `,
        [],
        (err) => {

          if (err) {
            console.error(
              "INSTRUCTOR SCHOOL UPDATE ERROR:",
              err.message
            );

            return;
          }

          console.log(
            "✅ Existing instructors assigned to School 1"
          );
        }
      );
    };

    // ==================================
    // CHECK school_id
    // ==================================

    if (
      columnNames.includes(
        "school_id"
      )
    ) {

      console.log(
        "✅ Instructors school_id already exists"
      );

      assignInstructorsToSchool();

      return;
    }

    // ==================================
    // ADD school_id
    // ==================================

    db.run(
      `
      ALTER TABLE instructors
      ADD COLUMN school_id INTEGER DEFAULT 1
      `,
      [],
      (err) => {

        if (err) {
          console.error(
            "instructor school_id upgrade error:",
            err.message
          );

          return;
        }

        console.log(
          "✅ Instructors school_id column added"
        );

        assignInstructorsToSchool();
      }
    );
  }
);

// ======================================
// VEHICLES
// ======================================

db.run(`
  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    transmission TEXT NOT NULL,
    fuel TEXT NOT NULL,
    status TEXT DEFAULT 'Available'
  )
`);
// ======================================
// VEHICLE SCHOOL UPGRADE
// ======================================

db.all(
  `PRAGMA table_info(vehicles)`,
  [],
  (err, columns) => {

    if (err) {
      console.error(
        "VEHICLES COLUMN CHECK ERROR:",
        err.message
      );

      return;
    }

    const columnNames =
      columns.map(
        (column) => column.name
      );

    // ==================================
    // ASSIGN EXISTING VEHICLES
    // ==================================

    const assignVehiclesToSchool = () => {

      db.run(
        `
        UPDATE vehicles
        SET school_id = 1
        WHERE school_id IS NULL
           OR school_id = 0
        `,
        [],
        (err) => {

          if (err) {
            console.error(
              "VEHICLE SCHOOL UPDATE ERROR:",
              err.message
            );

            return;
          }

          console.log(
            "✅ Existing vehicles assigned to School 1"
          );
        }
      );
    };

    // ==================================
    // CHECK school_id
    // ==================================

    if (
      columnNames.includes(
        "school_id"
      )
    ) {

      console.log(
        "✅ Vehicles school_id already exists"
      );

      assignVehiclesToSchool();

      return;
    }

    // ==================================
    // ADD school_id
    // ==================================

    db.run(
      `
      ALTER TABLE vehicles
      ADD COLUMN school_id INTEGER DEFAULT 1
      `,
      [],
      (err) => {

        if (err) {
          console.error(
            "vehicle school_id upgrade error:",
            err.message
          );

          return;
        }

        console.log(
          "✅ Vehicles school_id column added"
        );

        assignVehiclesToSchool();
      }
    );
  }
);

// ======================================
// PAYMENTS
// ======================================

db.run(`
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
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);
// ======================================
// PAYMENTS SCHOOL UPGRADE
// ======================================

db.all(
  `PRAGMA table_info(payments)`,
  [],
  (err, columns) => {

    if (err) {
      console.error(
        "PAYMENTS COLUMN CHECK ERROR:",
        err.message
      );

      return;
    }

    const columnNames =
      columns.map(
        (column) => column.name
      );

    // ==================================
    // ASSIGN EXISTING PAYMENTS
    // ==================================

    const assignPaymentsToSchool = () => {

      db.run(
        `
        UPDATE payments
        SET school_id = 1
        WHERE school_id IS NULL
           OR school_id = 0
        `,
        [],
        (err) => {

          if (err) {
            console.error(
              "PAYMENT SCHOOL UPDATE ERROR:",
              err.message
            );

            return;
          }

          console.log(
            "✅ Existing payments assigned to School 1"
          );
        }
      );
    };

    // ==================================
    // CHECK school_id
    // ==================================

    if (
      columnNames.includes(
        "school_id"
      )
    ) {

      console.log(
        "✅ Payments school_id already exists"
      );

      assignPaymentsToSchool();

      return;
    }

    // ==================================
    // ADD school_id
    // ==================================

    db.run(
      `
      ALTER TABLE payments
      ADD COLUMN school_id INTEGER DEFAULT 1
      `,
      [],
      (err) => {

        if (err) {
          console.error(
            "payment school_id upgrade error:",
            err.message
          );

          return;
        }

        console.log(
          "✅ Payments school_id column added"
        );

        assignPaymentsToSchool();
      }
    );
  }
);

// ======================================
// SCHOOLS
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
  (err) => {

    if (err) {
      console.error(
        "SCHOOLS TABLE ERROR:",
        err.message
      );

      return;
    }

    console.log(
      "✅ Schools table ready"
    );

    // ====================================
    // CREATE FIRST SCHOOL
    // ====================================

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
            "✅ Default school ready"
          );
        }
      }
    );
  }
);

// ======================================
// USERS
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

      return;
    }

    console.log(
      "✅ Users table ready"
    );

    // ====================================
    // CHECK USERS COLUMNS
    // ====================================

    db.all(
      `PRAGMA table_info(users)`,
      [],
      (err, columns) => {

        if (err) {
          console.error(
            "USERS COLUMN CHECK ERROR:",
            err.message
          );

          return;
        }

        const columnNames =
          columns.map(
            (column) => column.name
          );

        // ==================================
        // UPDATE EXISTING USERS
        // ==================================

        const updateUsers = () => {

          db.run(
            `
            UPDATE users
            SET school_id = 1
            WHERE school_id IS NULL
               OR school_id = 0
            `,
            [],
            (err) => {

              if (err) {
                console.error(
                  "USER SCHOOL UPDATE ERROR:",
                  err.message
                );

                return;
              }

              console.log(
                "✅ Existing users assigned to School 1"
              );
            }
          );
        };

        // ==================================
        // SCHOOL_ID EXISTS
        // ==================================

        if (
          columnNames.includes(
            "school_id"
          )
        ) {

          console.log(
            "✅ school_id already exists"
          );

          updateUsers();

          return;
        }

        // ==================================
        // ADD SCHOOL_ID
        // ==================================

        db.run(
          `
          ALTER TABLE users
          ADD COLUMN school_id INTEGER DEFAULT 1
          `,
          [],
          (err) => {

            if (err) {
              console.error(
                "school_id upgrade error:",
                err.message
              );

              return;
            }

            console.log(
              "✅ school_id column added"
            );

            updateUsers();
          }
        );
      }
    );
  }
);

// ======================================
// SETTINGS
// ======================================

db.run(
  `
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schoolName TEXT DEFAULT 'DrivePro-SA',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    registrationNumber TEXT DEFAULT '',
    lessonDuration INTEGER DEFAULT 60,
    lessonPrice REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
  `,
  [],
  (err) => {

    if (err) {
      console.error(
        "SETTINGS TABLE ERROR:",
        err.message
      );

      return;
    }

    console.log(
      "✅ Settings table ready"
    );

    // ====================================
    // CHECK SETTINGS COLUMNS
    // ====================================

    db.all(
      `PRAGMA table_info(settings)`,
      [],
      (err, columns) => {

        if (err) {
          console.error(
            "SETTINGS COLUMN CHECK ERROR:",
            err.message
          );

          return;
        }

        const columnNames =
          columns.map(
            (column) => column.name
          );

        // ==================================
        // ADD lessonDuration
        // ==================================

        const addLessonDuration = () => {

          if (
            columnNames.includes(
              "lessonDuration"
            )
          ) {

            console.log(
              "✅ lessonDuration already exists"
            );

            addLessonPrice();

            return;
          }

          db.run(
            `
            ALTER TABLE settings
            ADD COLUMN lessonDuration
            INTEGER DEFAULT 60
            `,
            [],
            (err) => {

              if (err) {
                console.error(
                  "lessonDuration upgrade error:",
                  err.message
                );

                return;
              }

              console.log(
                "✅ lessonDuration column added"
              );

              addLessonPrice();
            }
          );
        };

        // ==================================
        // ADD lessonPrice
        // ==================================

        const addLessonPrice = () => {

          if (
            columnNames.includes(
              "lessonPrice"
            )
          ) {

            console.log(
              "✅ lessonPrice already exists"
            );

            insertDefaultSettings();

            return;
          }

          db.run(
            `
            ALTER TABLE settings
            ADD COLUMN lessonPrice
            REAL DEFAULT 0
            `,
            [],
            (err) => {

              if (err) {
                console.error(
                  "lessonPrice upgrade error:",
                  err.message
                );

                return;
              }

              console.log(
                "✅ lessonPrice column added"
              );

              insertDefaultSettings();
            }
          );
        };

        // ==================================
        // DEFAULT SETTINGS
        // ==================================

        const insertDefaultSettings = () => {

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
              lessonDuration,
              lessonPrice
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
              0
            )
            `,
            [],
            (err) => {

              if (err) {
                console.error(
                  "DEFAULT SETTINGS ERROR:",
                  err.message
                );

                return;
              }

              console.log(
                "✅ Default settings ready"
              );
            }
          );
        };

        addLessonDuration();
      }
    );
  }
);

// ======================================
// DEFAULT ADMIN
// ======================================

db.run(
  `
  INSERT OR IGNORE INTO users
  (
    id,
    fullname,
    username,
    password,
    role,
    school_id
  )
  VALUES
  (
    1,
    'Administrator',
    'admin',
    '1234',
    'Administrator',
    1
  )
  `,
  [],
  (err) => {

    if (err) {
      console.error(
        "DEFAULT ADMIN ERROR:",
        err.message
      );
    } else {
      console.log(
        "✅ Default admin ready"
      );
    }
  }
);

// ======================================
// DEFAULT ADMIN
// ======================================

const setupDefaultAdmin = () => {

  // First check whether the admin account already exists
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

      // ======================================
      // ADMIN ALREADY EXISTS
      // ======================================

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
            "Administrator",
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
              "✅ Default admin account updated"
            );

          }
        );

        return;
      }

      // ======================================
      // ADMIN DOES NOT EXIST - CREATE IT
      // ======================================

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
          "Administrator",
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
            "✅ Default admin account created"
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
// EXPORT DATABASE
// ======================================

export default db;
export default db;