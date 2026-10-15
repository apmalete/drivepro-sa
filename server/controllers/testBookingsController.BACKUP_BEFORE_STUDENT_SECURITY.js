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
// GET USER ID
// =====================================================

const getUserId = (req) => {
  const userId = Number(req.user?.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return userId;
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
// CHECK SCHOOL ADMIN / RECEPTIONIST
// =====================================================

const isSchoolAdministrator = (req) => {
  const role = getUserRole(req);

  return (
    role === "administrator" ||
    role === "admin" ||
    role === "receptionist" ||
    role === "system administrator"
  );
};

// =====================================================
// GET AUTHENTICATED INSTRUCTOR PROFILE
// =====================================================

const getInstructorProfile = (req, callback) => {
  const userId = getUserId(req);
  const schoolId = getSchoolId(req);

  if (!userId || !schoolId) {
    return callback(null, null);
  }

  db.get(
    `
    SELECT
      id,
      name,
      user_id,
      school_id
    FROM instructors
    WHERE user_id = ?
      AND school_id = ?
    LIMIT 1
    `,
    [userId, schoolId],
    (err, instructor) => {
      if (err) {
        console.error(
          "GET INSTRUCTOR PROFILE ERROR:",
          err.message
        );

        return callback(err, null);
      }

      callback(null, instructor || null);
    }
  );
};

// =====================================================
// CHECK WHETHER INSTRUCTOR CAN ACCESS STUDENT
// =====================================================
//
// Student is assigned to instructor when either:
//
// 1. students.instructor matches instructors.name
// OR
// 2. test_bookings.instructor_id matches instructors.id
//
// =====================================================

const instructorCanAccessStudent = (
  instructor,
  student
) => {
  if (!instructor || !student) {
    return false;
  }

  const instructorId =
    Number(instructor.id);

  const studentInstructorId =
    Number(student.instructor_id);

  const instructorName =
    String(instructor.name || "")
      .trim()
      .toLowerCase();

  const studentInstructorName =
    String(student.instructor || "")
      .trim()
      .toLowerCase();

  return (
    (
      instructorId > 0 &&
      studentInstructorId > 0 &&
      instructorId === studentInstructorId
    ) ||
    (
      instructorName &&
      studentInstructorName &&
      instructorName === studentInstructorName
    )
  );
};

// =====================================================
// GET STUDENT + ASSIGNED INSTRUCTOR
// =====================================================

const getStudentWithInstructor = (
  studentId,
  schoolId,
  callback
) => {
  db.get(
    `
    SELECT
      s.id,
      s.fullname,
      s.instructor,
      s.school_id,

      i.id AS instructor_id,
      i.name AS instructor_name,
      i.user_id AS instructor_user_id

    FROM students s

    LEFT JOIN instructors i
      ON LOWER(TRIM(i.name)) =
         LOWER(TRIM(s.instructor))
     AND i.school_id = s.school_id

    WHERE s.id = ?
      AND s.school_id = ?

    LIMIT 1
    `,
    [studentId, schoolId],
    callback
  );
};

// =====================================================
// GET TEST BOOKINGS
// =====================================================
//
// ADMINISTRATOR / ADMIN / RECEPTIONIST
//   -> ALL bookings for their school
//
// INSTRUCTOR
//   -> ONLY bookings for their assigned students
//
// =====================================================

export const getTestBookings = (req, res) => {
  const schoolId = getSchoolId(req);
  const role = getUserRole(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

  // ===================================================
  // ADMINISTRATORS / RECEPTIONISTS
  // ===================================================

  if (isSchoolAdministrator(req)) {
    db.all(
      `
      SELECT *
      FROM test_bookings
      WHERE school_id = ?
      ORDER BY booking_date, booking_time
      `,
      [schoolId],
      (err, rows) => {
        if (err) {
          console.error(
            "GET ADMIN TEST BOOKINGS ERROR:",
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
    getInstructorProfile(
      req,
      (instructorErr, instructor) => {
        if (instructorErr) {
          return res.status(500).json({
            success: false,
            message:
              "Failed to find instructor profile.",
          });
        }

        if (!instructor) {
          return res.status(403).json({
            success: false,
            message:
              "Your instructor profile is not linked to this account.",
          });
        }

        db.all(
          `
          SELECT DISTINCT tb.*
          FROM test_bookings tb

          INNER JOIN students s
            ON s.id = tb.student_id
           AND s.school_id = tb.school_id

          WHERE tb.school_id = ?

            AND
            (
              LOWER(TRIM(s.instructor)) =
              LOWER(TRIM(?))

              OR

              tb.instructor_id = ?
            )

          ORDER BY
            tb.booking_date,
            tb.booking_time
          `,
          [
            schoolId,
            instructor.name,
            instructor.id,
          ],
          (err, rows) => {
            if (err) {
              console.error(
                "GET INSTRUCTOR TEST BOOKINGS ERROR:",
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
  // OTHER USERS
  // ===================================================

  return res.status(403).json({
    success: false,
    message:
      "You do not have permission to view test bookings.",
  });
};

// =====================================================
// GET TEST BOOKINGS FOR ONE STUDENT
// =====================================================
//
// ADMIN / RECEPTIONIST
//   -> allowed
//
// INSTRUCTOR
//   -> only if student belongs to that instructor
//
// =====================================================

export const getStudentTestBookings = (
  req,
  res
) => {
  const { studentId } = req.params;

  const schoolId = getSchoolId(req);
  const role = getUserRole(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

  // ===================================================
  // ADMIN / RECEPTIONIST
  // ===================================================

  if (isSchoolAdministrator(req)) {
    db.all(
      `
      SELECT *
      FROM test_bookings
      WHERE student_id = ?
        AND school_id = ?
      ORDER BY booking_date DESC, booking_time DESC
      `,
      [studentId, schoolId],
      (err, rows) => {
        if (err) {
          console.error(
            "GET STUDENT TEST BOOKINGS ERROR:",
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
    getInstructorProfile(
      req,
      (instructorErr, instructor) => {
        if (instructorErr) {
          return res.status(500).json({
            success: false,
            message:
              "Failed to find instructor profile.",
          });
        }

        if (!instructor) {
          return res.status(403).json({
            success: false,
            message:
              "Your instructor profile is not linked to this account.",
          });
        }

        getStudentWithInstructor(
          studentId,
          schoolId,
          (studentErr, student) => {
            if (studentErr) {
              return res.status(500).json({
                success: false,
                message: studentErr.message,
              });
            }

            if (!student) {
              return res.status(404).json({
                success: false,
                message: "Student not found.",
              });
            }

            if (
              !instructorCanAccessStudent(
                instructor,
                student
              )
            ) {
              return res.status(403).json({
                success: false,
                message:
                  "You do not have permission to view this student's test bookings.",
              });
            }

            db.all(
              `
              SELECT *
              FROM test_bookings
              WHERE student_id = ?
                AND school_id = ?
              ORDER BY booking_date DESC,
                       booking_time DESC
              `,
              [studentId, schoolId],
              (err, rows) => {
                if (err) {
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
      }
    );

    return;
  }

  return res.status(403).json({
    success: false,
    message:
      "You do not have permission to view test bookings.",
  });
};

// =====================================================
// ADD TEST BOOKING
// =====================================================

export const addTestBooking = (req, res) => {
  const schoolId = getSchoolId(req);
  const role = getUserRole(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

  const {
    student_id,
    test_type,
    booking_date,
    booking_time,
    test_centre,
    booking_reference,
    status,
  } = req.body;

  if (
    !student_id ||
    !test_type ||
    !booking_date ||
    !booking_time
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Student, test type, date and time are required.",
    });
  }

  // ===================================================
  // GET STUDENT
  // ===================================================

  getStudentWithInstructor(
    student_id,
    schoolId,
    (studentErr, student) => {
      if (studentErr) {
        console.error(
          "CHECK STUDENT FOR TEST BOOKING ERROR:",
          studentErr.message
        );

        return res.status(500).json({
          success: false,
          message: studentErr.message,
        });
      }

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found.",
        });
      }

      // =================================================
      // INSTRUCTOR PERMISSION CHECK
      // =================================================

      if (role === "instructor") {
        getInstructorProfile(
          req,
          (instructorErr, instructor) => {
            if (instructorErr) {
              return res.status(500).json({
                success: false,
                message:
                  "Failed to find instructor profile.",
              });
            }

            if (!instructor) {
              return res.status(403).json({
                success: false,
                message:
                  "Your instructor profile is not linked to this account.",
              });
            }

            if (
              !instructorCanAccessStudent(
                instructor,
                student
              )
            ) {
              return res.status(403).json({
                success: false,
                message:
                  "You can only create test bookings for students assigned to you.",
              });
            }

            insertTestBooking(
              student,
              schoolId,
              req,
              res
            );
          }
        );

        return;
      }

      // =================================================
      // ADMIN / RECEPTIONIST
      // =================================================

      if (isSchoolAdministrator(req)) {
        insertTestBooking(
          student,
          schoolId,
          req,
          res
        );

        return;
      }

      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to create test bookings.",
      });
    }
  );
};

// =====================================================
// INSERT TEST BOOKING
// =====================================================

const insertTestBooking = (
  student,
  schoolId,
  req,
  res
) => {
  const {
    test_type,
    booking_date,
    booking_time,
    test_centre,
    booking_reference,
    status,
  } = req.body;

  db.run(
    `
    INSERT INTO test_bookings
    (
      student_id,
      student_name,
      test_type,
      booking_date,
      booking_time,
      test_centre,
      booking_reference,
      status,
      reminder_sent,
      day_reminder_sent,
      school_id,
      instructor_id,
      instructor_name
    )
    VALUES
    (
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      0,
      0,
      ?,
      ?,
      ?
    )
    `,
    [
      student.id,
      student.fullname,
      test_type,
      booking_date,
      booking_time,
      test_centre || "",
      booking_reference || "",
      status || "Pending",
      schoolId,
      student.instructor_id || null,
      student.instructor_name ||
        student.instructor ||
        null,
    ],
    function (insertErr) {
      if (insertErr) {
        console.error(
          "ADD TEST BOOKING ERROR:",
          insertErr.message
        );

        return res.status(500).json({
          success: false,
          message: insertErr.message,
        });
      }

      return res.status(201).json({
        success: true,
        id: this.lastID,
        message:
          "Test booking created successfully.",
      });
    }
  );
};

// =====================================================
// UPDATE TEST BOOKING
// =====================================================

export const updateTestBooking = (
  req,
  res
) => {
  const { id } = req.params;

  const schoolId = getSchoolId(req);
  const role = getUserRole(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

  const {
    student_id,
    test_type,
    booking_date,
    booking_time,
    test_centre,
    booking_reference,
    status,
  } = req.body;

  if (
    !student_id ||
    !test_type ||
    !booking_date ||
    !booking_time
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Student, test type, date and time are required.",
    });
  }

  // ===================================================
  // GET BOOKING FIRST
  // ===================================================

  db.get(
    `
    SELECT *
    FROM test_bookings
    WHERE id = ?
      AND school_id = ?
    LIMIT 1
    `,
    [id, schoolId],
    (bookingErr, booking) => {
      if (bookingErr) {
        return res.status(500).json({
          success: false,
          message: bookingErr.message,
        });
      }

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Test booking not found.",
        });
      }

      // =================================================
      // GET NEW STUDENT
      // =================================================

      getStudentWithInstructor(
        student_id,
        schoolId,
        (studentErr, student) => {
          if (studentErr) {
            return res.status(500).json({
              success: false,
              message: studentErr.message,
            });
          }

          if (!student) {
            return res.status(404).json({
              success: false,
              message: "Student not found.",
            });
          }

          // ===============================================
          // INSTRUCTOR PERMISSION
          // ===============================================

          if (role === "instructor") {
            getInstructorProfile(
              req,
              (instructorErr, instructor) => {
                if (instructorErr) {
                  return res.status(500).json({
                    success: false,
                    message:
                      "Failed to find instructor profile.",
                  });
                }

                if (!instructor) {
                  return res.status(403).json({
                    success: false,
                    message:
                      "Your instructor profile is not linked to this account.",
                  });
                }

                const canAccessOriginalBooking =
                  Number(booking.instructor_id) ===
                    Number(instructor.id) ||
                  String(
                    booking.instructor_name || ""
                  )
                    .trim()
                    .toLowerCase() ===
                    String(instructor.name || "")
                      .trim()
                      .toLowerCase();

                const canAccessNewStudent =
                  instructorCanAccessStudent(
                    instructor,
                    student
                  );

                if (
                  !canAccessOriginalBooking ||
                  !canAccessNewStudent
                ) {
                  return res.status(403).json({
                    success: false,
                    message:
                      "You can only update test bookings belonging to your students.",
                  });
                }

                performTestBookingUpdate(
                  id,
                  schoolId,
                  student,
                  req,
                  res
                );
              }
            );

            return;
          }

          // ===============================================
          // ADMIN / RECEPTIONIST
          // ===============================================

          if (isSchoolAdministrator(req)) {
            performTestBookingUpdate(
              id,
              schoolId,
              student,
              req,
              res
            );

            return;
          }

          return res.status(403).json({
            success: false,
            message:
              "You do not have permission to update test bookings.",
          });
        }
      );
    }
  );
};

// =====================================================
// PERFORM TEST BOOKING UPDATE
// =====================================================

const performTestBookingUpdate = (
  id,
  schoolId,
  student,
  req,
  res
) => {
  const {
    test_type,
    booking_date,
    booking_time,
    test_centre,
    booking_reference,
    status,
  } = req.body;

  db.run(
    `
    UPDATE test_bookings
    SET
      student_id = ?,
      student_name = ?,
      test_type = ?,
      booking_date = ?,
      booking_time = ?,
      test_centre = ?,
      booking_reference = ?,
      status = ?,
      instructor_id = ?,
      instructor_name = ?

    WHERE id = ?
      AND school_id = ?
    `,
    [
      student.id,
      student.fullname,
      test_type,
      booking_date,
      booking_time,
      test_centre || "",
      booking_reference || "",
      status || "Pending",
      student.instructor_id || null,
      student.instructor_name ||
        student.instructor ||
        null,
      id,
      schoolId,
    ],
    function (updateErr) {
      if (updateErr) {
        console.error(
          "UPDATE TEST BOOKING ERROR:",
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
          message: "Test booking not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Test booking updated successfully.",
      });
    }
  );
};

// =====================================================
// UPDATE TEST BOOKING STATUS
// =====================================================

export const updateTestBookingStatus = (
  req,
  res
) => {
  const { id } = req.params;
  const { status } = req.body;

  const schoolId = getSchoolId(req);
  const role = getUserRole(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required.",
    });
  }

  const allowedStatuses = [
    "Pending",
    "Confirmed",
    "Completed",
    "Cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking status.",
    });
  }

  // ===================================================
  // ADMIN / RECEPTIONIST
  // ===================================================

  if (isSchoolAdministrator(req)) {
    updateBookingStatus(
      id,
      schoolId,
      status,
      res
    );

    return;
  }

  // ===================================================
  // INSTRUCTOR
  // ===================================================

  if (role === "instructor") {
    getInstructorProfile(
      req,
      (instructorErr, instructor) => {
        if (instructorErr) {
          return res.status(500).json({
            success: false,
            message:
              "Failed to find instructor profile.",
          });
        }

        if (!instructor) {
          return res.status(403).json({
            success: false,
            message:
              "Your instructor profile is not linked to this account.",
          });
        }

        db.get(
          `
          SELECT *
          FROM test_bookings
          WHERE id = ?
            AND school_id = ?
          LIMIT 1
          `,
          [id, schoolId],
          (bookingErr, booking) => {
            if (bookingErr) {
              return res.status(500).json({
                success: false,
                message: bookingErr.message,
              });
            }

            if (!booking) {
              return res.status(404).json({
                success: false,
                message:
                  "Test booking not found.",
              });
            }

            const allowed =
              Number(booking.instructor_id) ===
                Number(instructor.id) ||
              String(
                booking.instructor_name || ""
              )
                .trim()
                .toLowerCase() ===
                String(instructor.name || "")
                  .trim()
                  .toLowerCase();

            if (!allowed) {
              return res.status(403).json({
                success: false,
                message:
                  "You can only change the status of your students' test bookings.",
              });
            }

            updateBookingStatus(
              id,
              schoolId,
              status,
              res
            );
          }
        );
      }
    );

    return;
  }

  return res.status(403).json({
    success: false,
    message:
      "You do not have permission to update test booking status.",
  });
};

// =====================================================
// ACTUALLY UPDATE BOOKING STATUS
// =====================================================

const updateBookingStatus = (
  id,
  schoolId,
  status,
  res
) => {
  db.run(
    `
    UPDATE test_bookings
    SET status = ?

    WHERE id = ?
      AND school_id = ?
    `,
    [status, id, schoolId],
    function (err) {
      if (err) {
        console.error(
          "UPDATE TEST BOOKING STATUS ERROR:",
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
          message: "Test booking not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Test booking status updated successfully.",
      });
    }
  );
};

// =====================================================
// DELETE TEST BOOKING
// =====================================================

export const deleteTestBooking = (
  req,
  res
) => {
  const { id } = req.params;

  const schoolId = getSchoolId(req);
  const role = getUserRole(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

  // ===================================================
  // ADMIN / RECEPTIONIST
  // ===================================================

  if (isSchoolAdministrator(req)) {
    deleteBooking(
      id,
      schoolId,
      res
    );

    return;
  }

  // ===================================================
  // INSTRUCTOR
  // ===================================================

  if (role === "instructor") {
    getInstructorProfile(
      req,
      (instructorErr, instructor) => {
        if (instructorErr) {
          return res.status(500).json({
            success: false,
            message:
              "Failed to find instructor profile.",
          });
        }

        if (!instructor) {
          return res.status(403).json({
            success: false,
            message:
              "Your instructor profile is not linked to this account.",
          });
        }

        db.get(
          `
          SELECT *
          FROM test_bookings
          WHERE id = ?
            AND school_id = ?
          LIMIT 1
          `,
          [id, schoolId],
          (bookingErr, booking) => {
            if (bookingErr) {
              return res.status(500).json({
                success: false,
                message: bookingErr.message,
              });
            }

            if (!booking) {
              return res.status(404).json({
                success: false,
                message:
                  "Test booking not found.",
              });
            }

            const allowed =
              Number(booking.instructor_id) ===
                Number(instructor.id) ||
              String(
                booking.instructor_name || ""
              )
                .trim()
                .toLowerCase() ===
                String(instructor.name || "")
                  .trim()
                  .toLowerCase();

            if (!allowed) {
              return res.status(403).json({
                success: false,
                message:
                  "You can only delete your students' test bookings.",
              });
            }

            deleteBooking(
              id,
              schoolId,
              res
            );
          }
        );
      }
    );

    return;
  }

  return res.status(403).json({
    success: false,
    message:
      "You do not have permission to delete test bookings.",
  });
};

// =====================================================
// ACTUALLY DELETE BOOKING
// =====================================================

const deleteBooking = (
  id,
  schoolId,
  res
) => {
  db.run(
    `
    DELETE FROM test_bookings
    WHERE id = ?
      AND school_id = ?
    `,
    [id, schoolId],
    function (err) {
      if (err) {
        console.error(
          "DELETE TEST BOOKING ERROR:",
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
            "Test booking not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Test booking deleted successfully.",
      });
    }
  );
};