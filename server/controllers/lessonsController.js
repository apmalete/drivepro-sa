// =====================================================
// UPDATE LESSON
//
// ADMINISTRATOR
//   -> can edit any lesson in their school
//
// INSTRUCTOR
//   -> can update ONLY lessons assigned to them
//   -> can change status to Completed or Cancelled
//   -> cannot change student, instructor, vehicle, date or time
//
// STUDENT
//   -> cannot update lessons
// =====================================================

export const updateLesson = (req, res) => {
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
  // GET LESSON FIRST
  // ===================================================

  db.get(
    `
      SELECT *
      FROM lessons
      WHERE id = ?
        AND school_id = ?
      LIMIT 1
    `,
    [id, schoolId],
    (findErr, existingLesson) => {
      if (findErr) {
        console.error(
          "FIND LESSON FOR UPDATE ERROR:",
          findErr.message
        );

        return res.status(500).json({
          success: false,
          message: findErr.message,
        });
      }

      if (!existingLesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found for this school.",
        });
      }

      // =================================================
      // INSTRUCTOR
      //
      // Instructor can ONLY update their own lessons.
      // Instructor can ONLY change the status.
      // =================================================

      if (role === "instructor") {
        const instructorName = getUserFullName(req);

        if (!instructorName) {
          return res.status(403).json({
            success: false,
            message: "Instructor information not found.",
          });
        }

        // -------------------------------------------------
        // MAKE SURE THIS LESSON BELONGS TO THIS INSTRUCTOR
        // -------------------------------------------------

        const assignedInstructor = String(
          existingLesson.instructor || ""
        )
          .trim()
          .toLowerCase();

        const loggedInInstructor = String(instructorName)
          .trim()
          .toLowerCase();

        if (assignedInstructor !== loggedInInstructor) {
          return res.status(403).json({
            success: false,
            message:
              "You can only update lessons assigned to you.",
          });
        }

        const { status } = req.body;

        // -------------------------------------------------
        // ONLY THESE STATUS CHANGES ARE ALLOWED
        // -------------------------------------------------

        const allowedStatuses = [
          "Completed",
          "Cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message:
              "Instructors can only change lesson status to Completed or Cancelled.",
          });
        }

        // -------------------------------------------------
        // UPDATE STATUS ONLY
        //
        // Student, instructor, vehicle, date and time
        // remain unchanged.
        // -------------------------------------------------

        db.run(
          `
            UPDATE lessons
            SET
              status = ?
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
          function (err) {
            if (err) {
              console.error(
                "INSTRUCTOR UPDATE LESSON ERROR:",
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

        return;
      }

      // =================================================
      // STUDENTS CANNOT UPDATE LESSONS
      // =================================================

      if (role === "student") {
        return res.status(403).json({
          success: false,
          message:
            "Students cannot update lessons.",
        });
      }

      // =================================================
      // ADMINISTRATOR / SYSTEM ADMINISTRATOR
      //
      // Full lesson editing permission.
      // =================================================

      if (isAdministrator(req)) {
        const {
          student,
          instructor,
          vehicle,
          lesson_date,
          lesson_time,
          status,
        } = req.body;

        // -------------------------------------------------
        // CHECK INSTRUCTOR / VEHICLE CONFLICT
        // -------------------------------------------------

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
          (err, conflictLesson) => {
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

            // =============================================
            // INSTRUCTOR CONFLICT
            // =============================================

            if (
              conflictLesson &&
              conflictLesson.instructor === instructor
            ) {
              return res.status(400).json({
                success: false,
                message:
                  "This instructor is already booked for the selected date and time.",
              });
            }

            // =============================================
            // VEHICLE CONFLICT
            // =============================================

            if (
              conflictLesson &&
              conflictLesson.vehicle === vehicle
            ) {
              return res.status(400).json({
                success: false,
                message:
                  "This vehicle is already booked for the selected date and time.",
              });
            }

            // =============================================
            // UPDATE FULL LESSON
            // =============================================

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

        return;
      }

      // =================================================
      // UNKNOWN / UNAUTHORISED ROLE
      // =================================================

      return res.status(403).json({
        success: false,
        message:
          "You are not authorised to update lessons.",
      });
    }
  );
};