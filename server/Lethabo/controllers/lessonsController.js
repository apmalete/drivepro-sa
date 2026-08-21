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
// GET ALL LESSONS
// =====================================================

export const getLessons = (req, res) => {

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
    FROM lessons
    WHERE school_id = ?
    ORDER BY lesson_date, lesson_time
    `,
    [schoolId],
    (err, rows) => {

      if (err) {

        console.error(
          "GET LESSONS ERROR:",
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
// GET LESSONS FOR ONE STUDENT
// =====================================================

export const getStudentLessons = (
  req,
  res
) => {

  const {
    studentName,
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
          "GET STUDENT LESSONS ERROR:",
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
// ADD LESSON
// =====================================================

export const addLesson = (
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
    student,
    instructor,
    vehicle,
    lesson_date,
    lesson_time,
    status,
  } = req.body;


  // ===================================================
  // CHECK INSTRUCTOR AND VEHICLE CONFLICT
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


      // ================================================
      // INSTRUCTOR ALREADY BOOKED
      // ================================================

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


      // ================================================
      // VEHICLE ALREADY BOOKED
      // ================================================

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


      // ================================================
      // ADD LESSON
      // ================================================

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

          res.json({
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
// =====================================================

export const updateLesson = (
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


      // ================================================
      // INSTRUCTOR CONFLICT
      // ================================================

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


      // ================================================
      // VEHICLE CONFLICT
      // ================================================

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


      // ================================================
      // UPDATE LESSON
      // ================================================

      db.run(
        `
        UPDATE lessons
        SET
          student = ?,
          instructor = ?,
          vehicle = ?,
          lesson_date = ?,
          lesson_time = ?,
          status = ?
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


          // ============================================
          // LESSON NOT FOUND
          // ============================================

          if (this.changes === 0) {

            return res.status(404).json({
              success: false,
              message:
                "Lesson not found for this school.",
            });
          }


          res.json({
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
// =====================================================

export const deleteLesson = (
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


      // ================================================
      // LESSON NOT FOUND
      // ================================================

      if (this.changes === 0) {

        return res.status(404).json({
          success: false,
          message:
            "Lesson not found for this school.",
        });
      }


      res.json({
        success: true,
        message:
          "Lesson deleted successfully.",
      });
    }
  );
};