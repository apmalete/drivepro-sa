import db from "../database/database.js";

// =====================================================
// GET SCHOOL ID FROM AUTHENTICATED USER
// =====================================================

const getSchoolId = (req) => {

  const schoolId =
    Number(req.user?.school_id);

  if (!schoolId) {
    return null;
  }

  return schoolId;
};


// =====================================================
// GET ALL TEST BOOKINGS
// =====================================================

export const getTestBookings = (
  req,
  res
) => {

  const schoolId =
    getSchoolId(req);

  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });
  }

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
          "GET TEST BOOKINGS ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json(rows || []);
    }
  );
};


// =====================================================
// GET TEST BOOKINGS FOR ONE STUDENT
// =====================================================

export const getStudentTestBookings = (
  req,
  res
) => {

  const {
    studentId,
  } = req.params;

  const schoolId =
    getSchoolId(req);

  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });
  }

  db.all(
    `
    SELECT *
    FROM test_bookings
    WHERE student_id = ?
      AND school_id = ?
    ORDER BY booking_date DESC, booking_time DESC
    `,
    [
      studentId,
      schoolId,
    ],
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

      res.json(rows || []);
    }
  );
};


// =====================================================
// ADD TEST BOOKING
// =====================================================

export const addTestBooking = (
  req,
  res
) => {

  const schoolId =
    getSchoolId(req);

  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
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


  // ===================================================
  // VALIDATE REQUIRED INFORMATION
  // ===================================================

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
  // CHECK STUDENT
  // ===================================================

  db.get(
    `
    SELECT
      id,
      fullname
    FROM students
    WHERE id = ?
      AND school_id = ?
    LIMIT 1
    `,
    [
      student_id,
      schoolId,
    ],
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
          message:
            "Student not found.",
        });
      }


      // =================================================
      // INSERT TEST BOOKING
      // =================================================

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
          school_id
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

          res.status(201).json({
            success: true,
            id: this.lastID,
            message:
              "Test booking created successfully.",
          });
        }
      );
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

  const {
    id,
  } = req.params;

  const schoolId =
    getSchoolId(req);

  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
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
  // CHECK STUDENT BELONGS TO SCHOOL
  // ===================================================

  db.get(
    `
    SELECT
      id,
      fullname
    FROM students
    WHERE id = ?
      AND school_id = ?
    LIMIT 1
    `,
    [
      student_id,
      schoolId,
    ],
    (studentErr, student) => {

      if (studentErr) {

        console.error(
          "CHECK STUDENT UPDATE TEST BOOKING ERROR:",
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
          message:
            "Student not found.",
        });
      }


      // =================================================
      // UPDATE
      // =================================================

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
          status = ?
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
              message:
                "Test booking not found.",
            });
          }

          res.json({
            success: true,
            message:
              "Test booking updated successfully.",
          });
        }
      );
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

  const {
    id,
  } = req.params;

  const {
    status,
  } = req.body;

  const schoolId =
    getSchoolId(req);

  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });
  }

  if (!status) {

    return res.status(400).json({
      success: false,
      message:
        "Status is required.",
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
      message:
        "Invalid booking status.",
    });
  }


  db.run(
    `
    UPDATE test_bookings
    SET status = ?
    WHERE id = ?
      AND school_id = ?
    `,
    [
      status,
      id,
      schoolId,
    ],
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
          message:
            "Test booking not found.",
        });
      }

      res.json({
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

  const {
    id,
  } = req.params;

  const schoolId =
    getSchoolId(req);

  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });
  }


  db.run(
    `
    DELETE FROM test_bookings
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

      res.json({
        success: true,
        message:
          "Test booking deleted successfully.",
      });
    }
  );
};