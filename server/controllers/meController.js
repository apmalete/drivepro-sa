import db from "../database/database.js";

// =====================================================
// GET CURRENT USER PROFILE
// =====================================================

export const getMe = (req, res) => {

  const user = req.user;

  // ===================================================
  // CHECK AUTHENTICATION
  // ===================================================

  if (!user) {

    return res.status(401).json({
      success: false,
      message: "User not authenticated.",
    });

  }

  // ===================================================
  // USER INFORMATION
  // ===================================================

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

  }

  // ===================================================
  // STUDENT
  // ===================================================
  //
  // STUDENT PROFILE MATCHING ORDER:
  //
  // 1. Match by students.user_id
  // 2. Match by phone number = username
  // 3. Match by full name
  // 4. Permanently link the profile to user_id
  //
  // The student must always belong to the same school.
  //
  // ===================================================

  if (
    role ===
    "student"
  ) {

    // =================================================
    // FIRST:
    // SEARCH BY PERMANENT USER ID
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

        // =============================================
        // DATABASE ERROR
        // =============================================

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
            student.id,
            "School:",
            schoolId
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
        // SECOND:
        // SEARCH BY PHONE NUMBER
        //
        // Example:
        //
        // User username:
        //     0736258819
        //
        // Student phone:
        //     0736258819
        //
        // Only profiles that are currently unlinked
        // or already belong to this same user can match.
        // =============================================

        db.get(
          `
          SELECT
            s.*
          FROM students s
          WHERE s.school_id = ?
            AND (
              s.user_id IS NULL
              OR s.user_id = ?
            )
            AND LOWER(
              REPLACE(
                TRIM(COALESCE(s.phone, '')),
                ' ',
                ''
              )
            ) =
            LOWER(
              REPLACE(
                TRIM(?),
                ' ',
                ''
              )
            )
          ORDER BY s.id DESC
          LIMIT 1
          `,
          [
            schoolId,
            userId,
            user.username || "",
          ],
          (phoneErr, phoneStudent) => {

            // =========================================
            // PHONE SEARCH ERROR
            // =========================================

            if (phoneErr) {

              console.error(
                "GET ME STUDENT PHONE ERROR:",
                phoneErr.message
              );

              return res.status(500).json({
                success: false,
                message:
                  "Failed to load student profile.",
              });

            }

            // =========================================
            // STUDENT FOUND BY PHONE
            // =========================================

            if (phoneStudent) {

              console.log(
                "STUDENT PROFILE FOUND BY PHONE:",
                user.username,
                "Student ID:",
                phoneStudent.id,
                "School:",
                schoolId
              );

              // =======================================
              // PERMANENTLY LINK USER TO STUDENT
              // =======================================

              return db.run(
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
                  phoneStudent.id,
                  schoolId,
                  userId,
                ],
                (linkErr) => {

                  if (linkErr) {

                    console.error(
                      "STUDENT PHONE AUTO LINK ERROR:",
                      linkErr.message
                    );

                  } else {

                    console.log(
                      "STUDENT AUTO LINKED BY PHONE:",
                      "User:",
                      userId,
                      "Student:",
                      phoneStudent.id,
                      "School:",
                      schoolId
                    );

                    phoneStudent.user_id =
                      userId;

                  }

                  // =================================
                  // RETURN STUDENT PROFILE
                  // =================================

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
                      phoneStudent,

                  });

                }
              );

            }

            // =========================================
            // THIRD:
            // FALLBACK TO FULL NAME
            // =========================================

            db.get(
              `
              SELECT
                s.*
              FROM students s
              WHERE s.school_id = ?
                AND (
                  s.user_id IS NULL
                  OR s.user_id = ?
                )
                AND LOWER(TRIM(s.fullname)) =
                    LOWER(TRIM(?))
              ORDER BY s.id DESC
              LIMIT 1
              `,
              [
                schoolId,
                userId,
                user.fullname ||
                  user.username ||
                  "",
              ],
              (nameErr, nameStudent) => {

                // =====================================
                // NAME SEARCH ERROR
                // =====================================

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

                // =====================================
                // NO STUDENT FOUND
                // =====================================

                if (!nameStudent) {

                  console.log(
                    "NO STUDENT PROFILE FOUND:",
                    "User ID:",
                    userId,
                    "School:",
                    schoolId,
                    "Username:",
                    user.username,
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

                // =====================================
                // STUDENT FOUND BY NAME
                // =====================================

                console.log(
                  "STUDENT PROFILE FOUND BY NAME:",
                  user.fullname ||
                    user.username,
                  "Student ID:",
                  nameStudent.id,
                  "School:",
                  schoolId
                );

                // =====================================
                // PERMANENTLY LINK USER TO STUDENT
                // =====================================

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
                        "STUDENT NAME AUTO LINK ERROR:",
                        linkErr.message
                      );

                    } else {

                      console.log(
                        "STUDENT AUTO LINKED BY NAME:",
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

                    // =================================
                    // RETURN STUDENT PROFILE
                    // =================================

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