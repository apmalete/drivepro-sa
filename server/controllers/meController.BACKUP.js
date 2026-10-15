import db from "../database/database.js";

// =====================================================
// GET CURRENT USER PROFILE
// =====================================================

export const getMe = (req, res) => {

  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated.",
    });
  }

  const userId =
    Number(user.id);

  const schoolId =
    Number(user.school_id);

  const role =
    String(user.role || "")
      .trim()
      .toLowerCase();

  // ===================================================
  // VALID SCHOOL
  // ===================================================

  if (
    !Number.isInteger(schoolId) ||
    schoolId <= 0
  ) {
    return res.status(403).json({
      success: false,
      message:
        "User is not assigned to a valid school.",
    });
  }

  // ===================================================
  // SYSTEM ADMINISTRATOR
  // ===================================================

  if (
    role ===
    "system administrator"
  ) {

    return res.json({
      success: true,

      user: {
        id:
          userId,

        username:
          user.username,

        fullname:
          user.fullname,

        role:
          "System Administrator",

        school_id:
          schoolId,
      },

      profile:
        null,
    });
  }

  // ===================================================
  // ADMINISTRATOR
  // ===================================================

  if (
    role ===
    "administrator"
  ) {

    return db.get(
      `
      SELECT
        id,
        fullname,
        username,
        role,
        status,
        school_id
      FROM users
      WHERE id = ?
        AND school_id = ?
      LIMIT 1
      `,
      [
        userId,
        schoolId,
      ],
      (err, row) => {

        if (err) {

          console.error(
            "GET ME ADMIN ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to load user profile.",
          });
        }

        return res.json({

          success:
            true,

          user:
            row || {
              id:
                userId,

              username:
                user.username,

              fullname:
                user.fullname,

              role:
                "Administrator",

              school_id:
                schoolId,
            },

          profile:
            null,
        });
      }
    );

    return;
  }

  // ===================================================
  // INSTRUCTOR
  // ===================================================

  if (
    role ===
    "instructor"
  ) {

    return db.get(
      `
      SELECT
        id,
        name,
        phone,
        licence,
        experience,
        status,
        school_id
      FROM instructors
      WHERE school_id = ?
        AND (
          LOWER(TRIM(name)) =
          LOWER(TRIM(?))
        )
      LIMIT 1
      `,
      [
        schoolId,
        user.fullname ||
          user.username,
      ],
      (err, instructor) => {

        if (err) {

          console.error(
            "GET ME INSTRUCTOR ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to load instructor profile.",
          });
        }

        return res.json({

          success:
            true,

          user: {
            id:
              userId,

            username:
              user.username,

            fullname:
              user.fullname,

            role:
              "Instructor",

            school_id:
              schoolId,
          },

          profile:
            instructor ||
            null,
        });
      }
    );

    return;
  }

  // ===================================================
  // STUDENT
  // ===================================================
  //
  // IMPORTANT:
  //
  // FIRST:
  // Find the student using students.user_id.
  //
  // SECOND:
  // If the account has not yet been linked,
  // fall back to matching the student's name.
  //
  // This makes the student relationship permanent.
  // ===================================================

  if (
    role ===
    "student"
  ) {

    // =================================================
    // FIRST SEARCH BY USER ID
    // =================================================

    return db.get(
      `
      SELECT
        s.*
      FROM students s
      WHERE s.user_id = ?
        AND s.school_id = ?
      LIMIT 1
      `,
      [
        userId,
        schoolId,
      ],
      (err, student) => {

        if (err) {

          console.error(
            "GET ME STUDENT USER ID ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to load student profile.",
          });
        }

        // =============================================
        // STUDENT FOUND BY USER ID
        // =============================================

        if (student) {

          console.log(
            "STUDENT PROFILE FOUND BY USER ID:",
            userId,
            "Student ID:",
            student.id
          );

          return res.json({

            success:
              true,

            user: {
              id:
                userId,

              username:
                user.username,

              fullname:
                user.fullname,

              role:
                "Student",

              school_id:
                schoolId,
            },

            profile:
              student,
          });
        }

        // =============================================
        // FALLBACK: MATCH BY NAME
        // =============================================

        db.get(
          `
          SELECT
            s.*
          FROM students s
          WHERE s.school_id = ?
            AND LOWER(TRIM(s.fullname)) =
                LOWER(TRIM(?))
          ORDER BY s.id DESC
          LIMIT 1
          `,
          [
            schoolId,
            user.fullname ||
              user.username,
          ],
          (nameErr, nameStudent) => {

            if (nameErr) {

              console.error(
                "GET ME STUDENT NAME ERROR:",
                nameErr.message
              );

              return res.status(500).json({
                success: false,
                message:
                  "Failed to load student profile.",
              });
            }

            // =========================================
            // NO STUDENT FOUND
            // =========================================

            if (!nameStudent) {

              console.log(
                "NO STUDENT PROFILE FOUND:",
                "User ID:",
                userId,
                "School:",
                schoolId,
                "Name:",
                user.fullname
              );

              return res.json({

                success:
                  true,

                user: {
                  id:
                    userId,

                  username:
                    user.username,

                  fullname:
                    user.fullname,

                  role:
                    "Student",

                  school_id:
                    schoolId,
                },

                profile:
                  null,
              });
            }

            // =========================================
            // LINK STUDENT TO USER
            // =========================================

            db.run(
              `
              UPDATE students
              SET user_id = ?
              WHERE id = ?
                AND school_id = ?
                AND (
                  user_id IS NULL
                  OR user_id = ?
                )
              `,
              [
                userId,
                nameStudent.id,
                schoolId,
                userId,
              ],
              (linkErr) => {

                if (linkErr) {

                  console.error(
                    "STUDENT AUTO LINK ERROR:",
                    linkErr.message
                  );

                  // Do not fail the profile request.
                  // We can still return the student.
                } else {

                  console.log(
                    "STUDENT AUTO LINKED:",
                    "User:",
                    userId,
                    "Student:",
                    nameStudent.id,
                    "School:",
                    schoolId
                  );

                  nameStudent.user_id =
                    userId;
                }

                return res.json({

                  success:
                    true,

                  user: {
                    id:
                      userId,

                    username:
                      user.username,

                    fullname:
                      user.fullname,

                    role:
                      "Student",

                    school_id:
                      schoolId,
                  },

                  profile:
                    nameStudent,
                });
              }
            );
          }
        );
      }
    );

  }

  // ===================================================
  // UNKNOWN ROLE
  // ===================================================

  return res.status(403).json({
    success: false,
    message:
      "Unsupported user role.",
  });
};