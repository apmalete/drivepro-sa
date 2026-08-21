import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./server/drivepro.db");

console.log("🔄 Starting student database migration...");

db.serialize(() => {

  // ==========================================
  // CHECK CURRENT STUDENTS TABLE
  // ==========================================

  db.get(
    `
    SELECT sql
    FROM sqlite_master
    WHERE type = 'table'
    AND name = 'students'
    `,
    [],
    (err, table) => {

      if (err) {
        console.error(
          "❌ Could not check students table:",
          err.message
        );
        db.close();
        return;
      }

      if (!table) {
        console.log(
          "❌ Students table does not exist."
        );
        db.close();
        return;
      }

      console.log(
        "✅ Students table found."
      );

      // ==========================================
      // CREATE NEW TABLE
      // ==========================================

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

          created_at TEXT DEFAULT CURRENT_TIMESTAMP,

          UNIQUE (school_id, studentNo)

        )
        `,
        [],
        (createErr) => {

          if (createErr) {

            console.error(
              "❌ Could not create new students table:",
              createErr.message
            );

            db.close();
            return;
          }

          console.log(
            "✅ New students table created."
          );

          // ==========================================
          // COPY EXISTING STUDENTS
          // ==========================================

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
              COALESCE(school_id, 1),
              created_at

            FROM students
            `,
            [],
            (copyErr) => {

              if (copyErr) {

                console.error(
                  "❌ Could not copy students:",
                  copyErr.message
                );

                db.run(
                  `DROP TABLE IF EXISTS students_new`
                );

                db.close();
                return;
              }

              console.log(
                "✅ Existing students copied."
              );

              // ==========================================
              // REMOVE OLD TABLE
              // ==========================================

              db.run(
                `DROP TABLE students`,
                (dropErr) => {

                  if (dropErr) {

                    console.error(
                      "❌ Could not remove old students table:",
                      dropErr.message
                    );

                    db.close();
                    return;
                  }

                  console.log(
                    "✅ Old students table removed."
                  );

                  // ==========================================
                  // RENAME NEW TABLE
                  // ==========================================

                  db.run(
                    `
                    ALTER TABLE students_new
                    RENAME TO students
                    `,
                    (renameErr) => {

                      if (renameErr) {

                        console.error(
                          "❌ Could not rename students table:",
                          renameErr.message
                        );

                        db.close();
                        return;
                      }

                      console.log("");
                      console.log(
                        "======================================"
                      );
                      console.log(
                        "✅ MIGRATION COMPLETED"
                      );
                      console.log(
                        "======================================"
                      );
                      console.log(
                        "Student numbers are now unique PER SCHOOL."
                      );
                      console.log(
                        "School 1 can have Student 001."
                      );
                      console.log(
                        "School 3 can also have Student 001."
                      );
                      console.log(
                        "School 4 can also have Student 001."
                      );
                      console.log(
                        "======================================"
                      );

                      db.close();
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