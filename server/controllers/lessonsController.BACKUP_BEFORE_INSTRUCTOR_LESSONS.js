import db from "../database/database.js";

// =====================================================
// GET SCHOOL ID FROM AUTHENTICATED USER
// =====================================================

const getSchoolId = (req) => {
  const schoolId = Number(req.user?.school_id);

  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    return null;
  }

  return schoolId;
};

// =====================================================
// GET USER ROLE
// =====================================================

const getUserRole = (req) => {
  return String(req.user?.role || "")
    .trim()
    .toLowerCase();
};

// =====================================================
// GET USERNAME
// =====================================================

const getUsername = (req) => {
  return String(req.user?.username || "").trim();
};

// =====================================================
// GET USER FULL NAME
// =====================================================

const getUserFullName = (req) => {
  return String(
    req.user?.fullname ||
    req.user?.fullName ||
    req.user?.username ||
    ""
  ).trim();
};

// =====================================================
// CHECK ADMINISTRATOR
// =====================================================

const isAdministrator = (req) => {
  const role = getUserRole(req);

  return (
    role === "administrator" ||
    role === "system administrator" ||
    role === "admin"
  );
};

// =====================================================
// CHECK SYSTEM ADMINISTRATOR
// =====================================================

const isSystemAdministrator = (req) => {
  const role = getUserRole(req);
  const username = getUsername(req).toLowerCase();

  return (
    role === "system administrator" ||
    username === "admin"
  );
};

// =====================================================
// GET LESSONS
//
// ADMINISTRATOR
//   -> sees all lessons for their school
//
// INSTRUCTOR
//   -> sees only lessons assigned to them
//
// STUDENT
//   -> sees only their own lessons
//
// SYSTEM ADMINISTRATOR
//   -> sees all lessons for their school
// =====================================================

export const getLessons = (req, res) => {
  const schoolId = getSchoolId(req);
  const role = getUserRole(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

  // ===================================================
  // SYSTEM ADMIN / ADMINISTRATOR
  // ===================================================

  if (
    role === "system administrator" ||
    role === "administrator" ||
    role === "admin"
  ) {
    db.all(
      `
      SELECT *
      FROM lessons
      WHERE school_id = ?
      ORDER BY lesson_date, lesson_time
      `,
      [schoolId],
      (err, rows) => {
        if (err) {
          console.error(
            "GET ADMIN LESSONS ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        return res.json(rows || []);
      }
    );

    return;
  }

  // ===================================================
  // INSTRUCTOR
  // ===================================================

  if (role === "instructor") {
    const instructorName = getUserFullName(req);

    if (!instructorName) {
      return res.status(403).json({
        success: false,
        message: "Instructor information not found.",
      });
    }

    db.all(
      `
      SELECT *
      FROM lessons
      WHERE school_id = ?
        AND LOWER(TRIM(instructor))
            =
            LOWER(TRIM(?))
      ORDER BY lesson_date, lesson_time
      `,
      [
        schoolId,
        instructorName,
      ],
      (err, rows) => {
        if (err) {
          console.error(
            "GET INSTRUCTOR LESSONS ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        return res.json(rows || []);
      }
    );

    return;
  }

  // ===================================================
  // STUDENT
  //
  // IMPORTANT:
  // Find the student using the authenticated user's
  // user_id rather than relying on the login fullname.
  //
  // This allows the student account name and the
  // student profile name to be different.
  // ===================================================

  if (role === "student") {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Student account information not found.",
      });
    }

    // -------------------------------------------------
    // FIND STUDENT PROFILE USING USER ID
    // -------------------------------------------------

    db.get(
      `
      SELECT
        id,
        fullname,
        school_id,
        user_id
      FROM students
      WHERE user_id = ?
        AND school_id = ?
      LIMIT 1
      `,
      [
        userId,
        schoolId,
      ],
      (studentErr, studentProfile) => {

        if (studentErr) {
          console.error(
            "GET STUDENT PROFILE FOR LESSONS ERROR:",
            studentErr.message
          );

          return res.status(500).json({
            success: false,
            message: "Failed to find student profile.",
          });
        }

        if (!studentProfile) {
          return res.status(404).json({
            success: false,
            message:
              "Student profile is not linked to this account.",
          });
        }

        // -------------------------------------------------
        // GET LESSONS USING STUDENT PROFILE NAME
        // -------------------------------------------------

        db.all(
          `
          SELECT *
          FROM lessons
          WHERE school_id = ?
            AND LOWER(TRIM(student))
                =
                LOWER(TRIM(?))
          ORDER BY lesson_date, lesson_time
          `,
          [
            schoolId,
            studentProfile.fullname,
          ],
          (err, rows) => {

            if (err) {
              console.error(
                "GET STUDENT LESSONS ERROR:",
                err.message
              );

              return res.status(500).json({
                success: false,
                message: err.message,
              });
            }

            return res.json(rows || []);
          }
        );
      }
    );

    return;
  }

  // ===================================================
  // UNKNOWN ROLE
  // ===================================================

  return res.status(403).json({
    success: false,
    message: "You are not authorised to view lessons.",
  });
};

// =====================================================
// GET LESSONS FOR ONE STUDENT
//
// /lessons/student/:studentName
//
// ADMINISTRATOR
//   -> can view requested student
//
// INSTRUCTOR
//   -> can only view students assigned to that instructor
//
// STUDENT
//   -> can only view their own lessons
// =====================================================

export const getStudentLessons = (req, res) => {
  const {
    studentName,
  } = req.params;

  const schoolId = getSchoolId(req);
  const role = getUserRole(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

  if (!studentName) {
    return res.status(400).json({
      success: false,
      message: "Student name is required.",
    });
  }

  // ===================================================
  // INSTRUCTOR
  //
  // Instructor can only view lessons for a student
  // assigned to that instructor.
  // ===================================================

  if (role === "instructor") {
    const instructorName = getUserFullName(req);

    db.all(
      `
      SELECT *
      FROM lessons
      WHERE student = ?
        AND school_id = ?
        AND LOWER(TRIM(instructor))
            =
            LOWER(TRIM(?))
      ORDER BY lesson_date DESC, lesson_time DESC
      `,
      [
        studentName,
        schoolId,
        instructorName,
      ],
      (err, rows) => {
        if (err) {
          console.error(
            "GET INSTRUCTOR STUDENT LESSONS ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        return res.json(rows || []);
      }
    );

    return;
  }

  // ===================================================
  // STUDENT
  //
  // IMPORTANT:
  // Do not compare the requested student name against
  // the login fullname.
  //
  // Instead, find the authenticated student's profile
  // using user_id and school_id.
  //
  // This prevents problems when:
  //
  // Login account:
  //     Malete Kgopotso
  //
  // Student profile:
  //     Kgopotso
  //
  // Lesson booking:
  //     Kgopotso
  //
  // The account remains protected because the student
  // profile is found from the authenticated user_id.
  // ===================================================

  if (role === "student") {

    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Student account information not found.",
      });
    }

    // -------------------------------------------------
    // FIND STUDENT PROFILE LINKED TO LOGGED-IN USER
    // -------------------------------------------------

    db.get(
      `
      SELECT
        id,
        fullname,
        school_id,
        user_id
      FROM students
      WHERE user_id = ?
        AND school_id = ?
      LIMIT 1
      `,
      [
        userId,
        schoolId,
      ],
      (studentErr, studentProfile) => {

        if (studentErr) {
          console.error(
            "GET STUDENT PROFILE FOR LESSONS ERROR:",
            studentErr.message
          );

          return res.status(500).json({
            success: false,
            message: "Failed to find student profile.",
          });
        }

        if (!studentProfile) {
          return res.status(404).json({
            success: false,
            message:
              "Student profile is not linked to this account.",
          });
        }

        // -------------------------------------------------
        // GET LESSONS FOR THE LINKED STUDENT PROFILE
        // -------------------------------------------------

        db.all(
          `
          SELECT *
          FROM lessons
          WHERE school_id = ?
            AND LOWER(TRIM(student))
                =
                LOWER(TRIM(?))
          ORDER BY lesson_date DESC, lesson_time DESC
          `,
          [
            schoolId,
            studentProfile.fullname,
          ],
          (err, rows) => {

            if (err) {
              console.error(
                "GET STUDENT LESSONS ERROR:",
                err.message
              );

              return res.status(500).json({
                success: false,
                message: err.message,
              });
            }

            return res.json(rows || []);
          }
        );
      }
    );

    return;
  }

  // ===================================================
  // ADMINISTRATOR / SYSTEM ADMINISTRATOR
  // ===================================================

  if (isAdministrator(req)) {
    db.all(
      `
      SELECT *
      FROM lessons
      WHERE student = ?
        AND school_id = ?
      ORDER BY lesson_date DESC, lesson_time DESC
      `,
      [
        studentName,
        schoolId,
      ],
      (err, rows) => {
        if (err) {
          console.error(
            "GET ADMIN STUDENT LESSONS ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        return res.json(rows || []);
      }
    );

    return;
  }

  return res.status(403).json({
    success: false,
    message:
      "You are not authorised to view these lessons.",
  });
};

// =====================================================
// ADD LESSON
//
// ONLY ADMINISTRATORS CAN CREATE LESSONS
// =====================================================

export const addLesson = (req, res) => {
  const schoolId = getSchoolId(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

  if (!isAdministrator(req)) {
    return res.status(403).json({
      success: false,
      message:
        "Only administrators can add lessons.",
    });
  }

  const {
    student,
    instructor,
    vehicle,
    lesson_date,
    lesson_time,
    status,
  } = req.body;

  if (!student) {
    return res.status(400).json({
      success: false,
      message: "Student is required.",
    });
  }

  if (!instructor) {
    return res.status(400).json({
      success: false,
      message: "Instructor is required.",
    });
  }

  if (!vehicle) {
    return res.status(400).json({
      success: false,
      message: "Vehicle is required.",
    });
  }

  if (!lesson_date) {
    return res.status(400).json({
      success: false,
      message: "Lesson date is required.",
    });
  }

  if (!lesson_time) {
    return res.status(400).json({
      success: false,
      message: "Lesson time is required.",
    });
  }

  // ===================================================
  // CHECK INSTRUCTOR / VEHICLE CONFLICT
  // ===================================================

  db.get(
    `
    SELECT *
    FROM lessons
    WHERE lesson_date = ?
      AND lesson_time = ?
      AND school_id = ?
      AND (
        instructor = ?
        OR vehicle = ?
      )
    `,
    [
      lesson_date,
      lesson_time,
      schoolId,
      instructor,
      vehicle,
    ],
    (err, existingLesson) => {

      if (err) {
        console.error(
          "CHECK LESSON CONFLICT ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      // =================================================
      // INSTRUCTOR CONFLICT
      // =================================================

      if (
        existingLesson &&
        existingLesson.instructor === instructor
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This instructor is already booked for the selected date and time.",
        });
      }

      // =================================================
      // VEHICLE CONFLICT
      // =================================================

      if (
        existingLesson &&
        existingLesson.vehicle === vehicle
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This vehicle is already booked for the selected date and time.",
        });
      }

      // =================================================
      // INSERT LESSON
      // =================================================

      db.run(
        `
        INSERT INTO lessons
        (
          student,
          instructor,
          vehicle,
          lesson_date,
          lesson_time,
          status,
          school_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          student,
          instructor,
          vehicle,
          lesson_date,
          lesson_time,
          status || "Booked",
          schoolId,
        ],
        function (err) {

          if (err) {
            console.error(
              "ADD LESSON ERROR:",
              err.message
            );

            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }

          return res.json({
            success: true,
            message:
              "Lesson created successfully.",
            id: this.lastID,
          });
        }
      );
    }
  );
};

// =====================================================
// UPDATE LESSON
//
// ONLY ADMINISTRATORS CAN UPDATE LESSONS
// =====================================================

export const updateLesson = (req, res) => {
  const {
    id,
  } = req.params;

  const schoolId = getSchoolId(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

    // ===================================================
  // INSTRUCTOR
  //
  // Instructors can update ONLY lessons assigned to them.
  // They can change the lesson status to:
  //   - Completed
  //   - Cancelled
  //
  // They cannot change the student, instructor, vehicle,
  // date or time.
  // ===================================================

  if (getUserRole(req) === "instructor") {
    const instructorName = getUserFullName(req);
    const { status } = req.body;

    if (!instructorName) {
      return res.status(403).json({
        success: false,
        message: "Instructor information not found.",
      });
    }

    const allowedStatuses = ["Completed", "Cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Instructors can only change lesson status to Completed or Cancelled.",
      });
    }

    // -------------------------------------------------
    // FIND THE LESSON AND VERIFY IT BELONGS TO
    // THE LOGGED-IN INSTRUCTOR
    // -------------------------------------------------

    db.get(
      `
        SELECT *
        FROM lessons
        WHERE id = ?
          AND school_id = ?
          AND LOWER(TRIM(instructor))
              =
              LOWER(TRIM(?))
        LIMIT 1
      `,
      [
        id,
        schoolId,
        instructorName,
      ],
      (findErr, lesson) => {
        if (findErr) {
          console.error(
            "FIND INSTRUCTOR LESSON ERROR:",
            findErr.message
          );

          return res.status(500).json({
            success: false,
            message: findErr.message,
          });
        }

        if (!lesson) {
          return res.status(403).json({
            success: false,
            message:
              "You can only update lessons assigned to you.",
          });
        }

        // -------------------------------------------------
        // UPDATE STATUS ONLY
        // -------------------------------------------------

        db.run(
          `
            UPDATE lessons
            SET status = ?
            WHERE id = ?
              AND school_id = ?
              AND LOWER(TRIM(instructor))
                  =
                  LOWER(TRIM(?))
          `,
          [
            status,
            id,
            schoolId,
            instructorName,
          ],
          function (updateErr) {
            if (updateErr) {
              console.error(
                "INSTRUCTOR UPDATE LESSON ERROR:",
                updateErr.message
              );

              return res.status(500).json({
                success: false,
                message: updateErr.message,
              });
            }

            if (this.changes === 0) {
              return res.status(404).json({
                success: false,
                message:
                  "Lesson could not be updated.",
              });
            }

            return res.json({
              success: true,
              message:
                `Lesson marked as ${status}.`,
            });
          }
        );
      }
    );

    return;
  }

  // ===================================================
  // STUDENTS CANNOT UPDATE LESSONS
  // ===================================================

  if (getUserRole(req) === "student") {
    return res.status(403).json({
      success: false,
      message:
        "Students cannot update lessons.",
    });
  }

  // ===================================================
  // ADMINISTRATOR / SYSTEM ADMINISTRATOR
  // ===================================================

  if (!isAdministrator(req)) {
    return res.status(403).json({
      success: false,
      message:
        "Only administrators can update lessons.",
    });
  }

  const {
    student,
    instructor,
    vehicle,
    lesson_date,
    lesson_time,
    status,
  } = req.body;

  // ===================================================
  // CHECK INSTRUCTOR / VEHICLE CONFLICT
  // ===================================================

  db.get(
    `
    SELECT *
    FROM lessons
    WHERE lesson_date = ?
      AND lesson_time = ?
      AND id != ?
      AND school_id = ?
      AND (
        instructor = ?
        OR vehicle = ?
      )
    `,
    [
      lesson_date,
      lesson_time,
      id,
      schoolId,
      instructor,
      vehicle,
    ],
    (err, existingLesson) => {

      if (err) {
        console.error(
          "CHECK LESSON UPDATE CONFLICT ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      // =================================================
      // INSTRUCTOR CONFLICT
      // =================================================

      if (
        existingLesson &&
        existingLesson.instructor === instructor
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This instructor is already booked for the selected date and time.",
        });
      }

      // =================================================
      // VEHICLE CONFLICT
      // =================================================

      if (
        existingLesson &&
        existingLesson.vehicle === vehicle
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This vehicle is already booked for the selected date and time.",
        });
      }

      // =================================================
      // UPDATE LESSON
      //
      // Reset WhatsApp notification flags because
      // the lesson may have changed.
      // =================================================

      db.run(
        `
        UPDATE lessons
        SET
          student = ?,
          instructor = ?,
          vehicle = ?,
          lesson_date = ?,
          lesson_time = ?,
          status = ?,
          notification_sent = 0,
          day_reminder_sent = 0
        WHERE id = ?
          AND school_id = ?
        `,
        [
          student,
          instructor,
          vehicle,
          lesson_date,
          lesson_time,
          status,
          id,
          schoolId,
        ],
        function (err) {

          if (err) {
            console.error(
              "UPDATE LESSON ERROR:",
              err.message
            );

            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }

          if (this.changes === 0) {
            return res.status(404).json({
              success: false,
              message:
                "Lesson not found for this school.",
            });
          }

          return res.json({
            success: true,
            message:
              "Lesson updated successfully.",
          });
        }
      );
    }
  );
};

// =====================================================
// DELETE LESSON
//
// ONLY ADMINISTRATORS CAN DELETE LESSONS
// =====================================================

export const deleteLesson = (req, res) => {
  const {
    id,
  } = req.params;

  const schoolId = getSchoolId(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

  if (!isAdministrator(req)) {
    return res.status(403).json({
      success: false,
      message:
        "Only administrators can delete lessons.",
    });
  }

  db.run(
    `
    DELETE FROM lessons
    WHERE id = ?
      AND school_id = ?
    `,
    [
      id,
      schoolId,
    ],
    function (err) {

      if (err) {
        console.error(
          "DELETE LESSON ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Lesson not found for this school.",
        });
      }

      return res.json({
        success: true,
        message:
          "Lesson deleted successfully.",
      });
    }
  );
};