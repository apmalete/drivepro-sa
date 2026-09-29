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

  const userId = Number(user.id);
  const schoolId = Number(user.school_id) || 1;
  const role = String(user.role || "").trim();

  // ===================================================
  // SYSTEM ADMINISTRATOR
  // ===================================================

  if (
    role.toLowerCase() ===
    "system administrator"
  ) {
    return res.json({
      success: true,

      user: {
        id: userId,
        username: user.username,
        fullname: user.fullname,
        role: "System Administrator",
        school_id: schoolId,
      },

      profile: null,
    });
  }

  // ===================================================
  // ADMINISTRATOR
  // ===================================================

  if (
    role.toLowerCase() ===
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
      [userId, schoolId],
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
          success: true,

          user: row || {
            id: userId,
            username: user.username,
            fullname: user.fullname,
            role,
            school_id: schoolId,
          },

          profile: null,
        });
      }
    );
  }

  // ===================================================
  // INSTRUCTOR
  // ===================================================

  if (
    role.toLowerCase() ===
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
        user.fullname || user.username,
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
          success: true,

          user: {
            id: userId,
            username: user.username,
            fullname: user.fullname,
            role: "Instructor",
            school_id: schoolId,
          },

          profile: instructor || null,
        });
      }
    );
  }

  // ===================================================
  // STUDENT
  // ===================================================

  if (
    role.toLowerCase() ===
    "student"
  ) {

    // -------------------------------------------------
    // FIRST: FIND STUDENT USING USER ID
    // -------------------------------------------------

    return db.get(
      `
      SELECT *
      FROM students
      WHERE school_id = ?
        AND user_id = ?
      LIMIT 1
      `,
      [
        schoolId,
        userId,
      ],
      (err, student) => {

        if (err) {
          console.error(
            "GET ME STUDENT BY USER ID ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to load student profile.",
          });
        }

        // ------------------------------------------------
        // STUDENT FOUND USING USER ID
        // ------------------------------------------------

        if (student) {

          return res.json({
            success: true,

            user: {
              id: userId,
              username: user.username,
              fullname: user.fullname,
              role: "Student",
              school_id: schoolId,
            },

            profile: student,
          });
        }

        // ------------------------------------------------
        // FALLBACK 1:
        // MATCH STUDENT NUMBER
        // ------------------------------------------------

        const studentNo =
          String(
            user.studentNo || ""
          ).trim();

        if (studentNo) {

          return db.get(
            `
            SELECT *
            FROM students
            WHERE school_id = ?
              AND LOWER(TRIM(studentNo)) =
                  LOWER(TRIM(?))
            LIMIT 1
            `,
            [
              schoolId,
              studentNo,
            ],
            (studentNoErr, studentByNumber) => {

              if (studentNoErr) {

                console.error(
                  "GET ME STUDENT BY STUDENT NUMBER ERROR:",
                  studentNoErr.message
                );

                return res.status(500).json({
                  success: false,
                  message:
                    "Failed to load student profile.",
                });
              }

              if (studentByNumber) {

                // Link student to logged-in user
                db.run(
                  `
                  UPDATE students
                  SET user_id = ?
                  WHERE id = ?
                    AND school_id = ?
                  `,
                  [
                    userId,
                    studentByNumber.id,
                    schoolId,
                  ],
                  (linkErr) => {

                    if (linkErr) {
                      console.error(
                        "STUDENT USER LINK ERROR:",
                        linkErr.message
                      );
                    }

                    return res.json({
                      success: true,

                      user: {
                        id: userId,
                        username: user.username,
                        fullname: user.fullname,
                        role: "Student",
                        school_id: schoolId,
                      },

                      profile: {
                        ...studentByNumber,
                        user_id: userId,
                      },
                    });
                  }
                );

                return;
              }

              // Continue to next fallback
              findByLearnerNumber();
            }
          );

          return;
        }

        // ------------------------------------------------
        // FALLBACK 2:
        // MATCH LEARNER NUMBER
        // ------------------------------------------------

        findByLearnerNumber();

        function findByLearnerNumber() {

          const learnerNumber =
            String(
              user.learnerNumber || ""
            ).trim();

          if (!learnerNumber) {
            return findByLearnerCode();
          }

          db.get(
            `
            SELECT *
            FROM students
            WHERE school_id = ?
              AND LOWER(TRIM(learnerNumber)) =
                  LOWER(TRIM(?))
            LIMIT 1
            `,
            [
              schoolId,
              learnerNumber,
            ],
            (learnerErr, studentByLearner) => {

              if (learnerErr) {

                console.error(
                  "GET ME STUDENT BY LEARNER NUMBER ERROR:",
                  learnerErr.message
                );

                return res.status(500).json({
                  success: false,
                  message:
                    "Failed to load student profile.",
                });
              }

              if (studentByLearner) {

                db.run(
                  `
                  UPDATE students
                  SET user_id = ?
                  WHERE id = ?
                    AND school_id = ?
                  `,
                  [
                    userId,
                    studentByLearner.id,
                    schoolId,
                  ],
                  (linkErr) => {

                    if (linkErr) {
                      console.error(
                        "STUDENT LEARNER LINK ERROR:",
                        linkErr.message
                      );
                    }

                    return res.json({
                      success: true,

                      user: {
                        id: userId,
                        username: user.username,
                        fullname: user.fullname,
                        role: "Student",
                        school_id: schoolId,
                      },

                      profile: {
                        ...studentByLearner,
                        user_id: userId,
                      },
                    });
                  }
                );

                return;
              }

              findByLearnerCode();
            }
          );
        }

        // ------------------------------------------------
        // FALLBACK 3:
        // MATCH LEARNER CODE
        // ------------------------------------------------

        function findByLearnerCode() {

          const learnerCode =
            String(
              user.learnerCode || ""
            ).trim();

          if (!learnerCode) {
            return findByFullname();
          }

          db.get(
            `
            SELECT *
            FROM students
            WHERE school_id = ?
              AND LOWER(TRIM(learnerCode)) =
                  LOWER(TRIM(?))
            LIMIT 1
            `,
            [
              schoolId,
              learnerCode,
            ],
            (codeErr, studentByCode) => {

              if (codeErr) {

                console.error(
                  "GET ME STUDENT BY LEARNER CODE ERROR:",
                  codeErr.message
                );

                return res.status(500).json({
                  success: false,
                  message:
                    "Failed to load student profile.",
                });
              }

              if (studentByCode) {

                db.run(
                  `
                  UPDATE students
                  SET user_id = ?
                  WHERE id = ?
                    AND school_id = ?
                  `,
                  [
                    userId,
                    studentByCode.id,
                    schoolId,
                  ],
                  (linkErr) => {

                    if (linkErr) {
                      console.error(
                        "STUDENT CODE LINK ERROR:",
                        linkErr.message
                      );
                    }

                    return res.json({
                      success: true,

                      user: {
                        id: userId,
                        username: user.username,
                        fullname: user.fullname,
                        role: "Student",
                        school_id: schoolId,
                      },

                      profile: {
                        ...studentByCode,
                        user_id: userId,
                      },
                    });
                  }
                );

                return;
              }

              findByFullname();
            }
          );
        }

        // ------------------------------------------------
        // FALLBACK 4:
        // MATCH FULL NAME
        // ------------------------------------------------

        function findByFullname() {

          const fullname =
            String(
              user.fullname ||
              user.username ||
              ""
            ).trim();

          if (!fullname) {

            return res.json({
              success: true,

              user: {
                id: userId,
                username: user.username,
                fullname: user.fullname,
                role: "Student",
                school_id: schoolId,
              },

              profile: null,
            });
          }

          db.get(
            `
            SELECT *
            FROM students
            WHERE school_id = ?
              AND LOWER(TRIM(fullname)) =
                  LOWER(TRIM(?))
            ORDER BY id DESC
            LIMIT 1
            `,
            [
              schoolId,
              fullname,
            ],
            (fullnameErr, studentByName) => {

              if (fullnameErr) {

                console.error(
                  "GET ME STUDENT BY FULLNAME ERROR:",
                  fullnameErr.message
                );

                return res.status(500).json({
                  success: false,
                  message:
                    "Failed to load student profile.",
                });
              }

              if (!studentByName) {

                console.log(
                  "NO STUDENT PROFILE FOUND FOR USER:",
                  {
                    userId,
                    fullname,
                    username:
                      user.username,
                    schoolId,
                  }
                );

                return res.json({
                  success: true,

                  user: {
                    id: userId,
                    username:
                      user.username,
                    fullname:
                      user.fullname,
                    role: "Student",
                    school_id:
                      schoolId,
                  },

                  profile: null,
                });
              }

              // ------------------------------------------------
              // AUTOMATICALLY LINK STUDENT TO USER
              // ------------------------------------------------

              db.run(
                `
                UPDATE students
                SET user_id = ?
                WHERE id = ?
                  AND school_id = ?
                `,
                [
                  userId,
                  studentByName.id,
                  schoolId,
                ],
                (linkErr) => {

                  if (linkErr) {

                    console.error(
                      "STUDENT FULLNAME LINK ERROR:",
                      linkErr.message
                    );

                  } else {

                    console.log(
                      "STUDENT LINKED TO USER:",
                      {
                        studentId:
                          studentByName.id,
                        userId,
                        fullname:
                          studentByName.fullname,
                      }
                    );
                  }

                  return res.json({
                    success: true,

                    user: {
                      id: userId,
                      username:
                        user.username,
                      fullname:
                        user.fullname,
                      role: "Student",
                      school_id:
                        schoolId,
                    },

                    profile: {
                      ...studentByName,
                      user_id:
                        userId,
                    },
                  });
                }
              );
            }
          );
        }
      }
    );
  }

  // ===================================================
  // UNKNOWN ROLE
  // ===================================================

  return res.status(403).json({
    success: false,
    message: "Unsupported user role.",
  });
};