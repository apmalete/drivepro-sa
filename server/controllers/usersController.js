import db from "../database/database.js";
import jwt from "jsonwebtoken";

// =====================================================
// JWT SECRET
// =====================================================

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "drivepro-sa-secret-key-change-later";

// =====================================================
// GET SCHOOL ID FROM AUTHENTICATED USER
// =====================================================

const getAuthenticatedSchoolId = (req) => {
  const schoolId =
    Number(req.user?.school_id);

  if (
    !Number.isInteger(schoolId) ||
    schoolId <= 0
  ) {
    return null;
  }

  return schoolId;
};

// =====================================================
// CHECK SYSTEM ADMINISTRATOR
// =====================================================

const isSystemAdministrator = (req) => {
  const role =
    String(
      req.user?.role || ""
    )
      .trim()
      .toLowerCase();

  const username =
    String(
      req.user?.username || ""
    )
      .trim()
      .toLowerCase();

  return (
    role === "system administrator" ||
    username === "admin"
  );
};

// =====================================================
// LOGIN
// =====================================================

export const loginUser = (req, res) => {
  const username =
    String(
      req.body.username || ""
    ).trim();

  const password =
    String(
      req.body.password || ""
    );

  if (
    !username ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Username and password are required.",
    });
  }

  console.log(
    "LOGIN ATTEMPT:",
    username
  );

  db.get(
    `
    SELECT *
    FROM users
    WHERE LOWER(TRIM(username))
      =
      LOWER(TRIM(?))
    LIMIT 1
    `,
    [
      username,
    ],
    (err, user) => {

      if (err) {
        console.error(
          "LOGIN DATABASE ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message:
            "Database error during login.",
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid username or password.",
        });
      }

      if (
        String(user.password) !==
        password
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid username or password.",
        });
      }

      if (
        String(user.status)
          .trim()
          .toLowerCase() !==
        "active"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "This user account is inactive.",
        });
      }

      let userRole =
        user.role;

      // =================================================
      // MAIN ADMIN
      // =================================================

      if (
        String(user.username)
          .trim()
          .toLowerCase() ===
        "admin"
      ) {
        userRole =
          "System Administrator";

        db.run(
          `
          UPDATE users
          SET role = ?
          WHERE id = ?
          `,
          [
            "System Administrator",
            user.id,
          ],
          (updateErr) => {

            if (updateErr) {
              console.error(
                "SYSTEM ADMIN ROLE UPDATE ERROR:",
                updateErr.message
              );
            }
          }
        );
      }

      const schoolId =
        Number(user.school_id) || 1;

      // =================================================
      // SYSTEM ADMINISTRATOR
      // =================================================

      if (
        userRole ===
        "System Administrator"
      ) {
        const safeUser = {
          id:
            user.id,

          fullname:
            user.fullname,

          username:
            user.username,

          role:
            userRole,

          status:
            user.status,

          school_id:
            schoolId,
        };

        const token =
          jwt.sign(
            {
              id:
                user.id,

              username:
                user.username,

              role:
                userRole,

              school_id:
                schoolId,
            },

            JWT_SECRET,

            {
              expiresIn:
                "8h",
            }
          );

        console.log(
          "LOGIN SUCCESS:",
          username,
          "Role:",
          userRole,
          "School:",
          schoolId
        );

        return res.json({
          success:
            true,

          token:
            token,

          user:
            safeUser,
        });
      }

      // =================================================
      // NORMAL USER MUST HAVE VALID SCHOOL
      // =================================================

      if (
        !Number.isInteger(
          schoolId
        ) ||
        schoolId <= 0
      ) {
        return res.status(403).json({
          success: false,
          message:
            "This user is not assigned to a valid school.",
        });
      }

      // =================================================
      // CHECK SCHOOL
      // =================================================

      db.get(
        `
        SELECT
          id,
          schoolName,
          status
        FROM schools
        WHERE id = ?
        `,
        [
          schoolId,
        ],
        (schoolErr, school) => {

          if (schoolErr) {
            console.error(
              "SCHOOL CHECK ERROR:",
              schoolErr.message
            );

            return res.status(500).json({
              success: false,
              message:
                "Unable to verify school.",
            });
          }

          if (!school) {
            return res.status(403).json({
              success: false,
              message:
                "The school assigned to this user does not exist.",
            });
          }

          if (
            String(school.status)
              .trim()
              .toLowerCase() !==
            "active"
          ) {
            return res.status(403).json({
              success: false,
              message:
                "This school is inactive. Please contact the system administrator.",
            });
          }

          const safeUser = {
            id:
              user.id,

            fullname:
              user.fullname,

            username:
              user.username,

            role:
              userRole,

            status:
              user.status,

            school_id:
              schoolId,
          };

          const token =
            jwt.sign(
              {
                id:
                  user.id,

                username:
                  user.username,

                role:
                  userRole,

                school_id:
                  schoolId,
              },

              JWT_SECRET,

              {
                expiresIn:
                  "8h",
              }
            );

          console.log(
            "LOGIN SUCCESS:",
            username,
            "Role:",
            userRole,
            "School:",
            schoolId
          );

          return res.json({
            success:
              true,

            token:
              token,

            user:
              safeUser,
          });
        }
      );
    }
  );
};

// =====================================================
// GET USERS
// =====================================================

export const getUsers = (req, res) => {

  // ===================================================
  // SYSTEM ADMINISTRATOR
  // SEE ALL SCHOOLS
  // ===================================================

  if (
    isSystemAdministrator(req)
  ) {
    return db.all(
      `
      SELECT
        users.id,
        users.fullname,
        users.username,
        users.role,
        users.status,
        users.school_id,
        users.created_at,

        (
          SELECT students.id
          FROM students
          WHERE students.user_id = users.id
          LIMIT 1
        ) AS student_id,

        (
          SELECT instructors.id
          FROM instructors
          WHERE instructors.user_id = users.id
          LIMIT 1
        ) AS instructor_id

      FROM users
      ORDER BY users.id DESC
      `,
      [],
      (err, rows) => {

        if (err) {
          console.error(
            "GET ALL USERS ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message:
              err.message,
          });
        }

        return res.json(
          rows || []
        );
      }
    );
  }

  // ===================================================
  // NORMAL ADMIN
  // ONLY THEIR SCHOOL
  // ===================================================

  const schoolId =
    getAuthenticatedSchoolId(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });
  }

  db.all(
    `
    SELECT
      users.id,
      users.fullname,
      users.username,
      users.role,
      users.status,
      users.school_id,
      users.created_at,

      (
        SELECT students.id
        FROM students
        WHERE students.user_id = users.id
        LIMIT 1
      ) AS student_id,

      (
        SELECT instructors.id
        FROM instructors
        WHERE instructors.user_id = users.id
        LIMIT 1
      ) AS instructor_id

    FROM users
    WHERE users.school_id = ?
    ORDER BY users.id DESC
    `,
    [
      schoolId,
    ],
    (err, rows) => {

      if (err) {
        console.error(
          "GET USERS ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message:
            err.message,
        });
      }

      return res.json(
        rows || []
      );
    }
  );
};

// =====================================================
// ADD USER
// =====================================================

export const addUser = (req, res) => {

  const {
    fullname,
    username,
    password,
    role,
    status,
    school_id,
    student_id,
    instructor_id,
  } = req.body;

  // ===================================================
  // VALIDATION
  // ===================================================

  if (
    !fullname ||
    !String(fullname).trim()
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Full name is required.",
    });
  }

  if (
    !username ||
    !String(username).trim()
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Username is required.",
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message:
        "Password is required.",
    });
  }

  if (!role) {
    return res.status(400).json({
      success: false,
      message:
        "User role is required.",
    });
  }

  const allowedRoles = [
    "Administrator",
    "Receptionist",
    "Instructor",
    "Student",
  ];

  if (
    !allowedRoles.includes(
      role
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid user role.",
    });
  }

  console.log(
    "ADD USER ROLE RECEIVED:",
    JSON.stringify(role)
  );

  // ===================================================
  // DETERMINE SCHOOL
  // ===================================================

  let schoolId;

  if (
    isSystemAdministrator(req)
  ) {
    schoolId =
      Number(school_id);

    if (
      !Number.isInteger(
        schoolId
      ) ||
      schoolId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a valid school.",
      });
    }
  } else {
    schoolId =
      getAuthenticatedSchoolId(req);

    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message:
          "School information not found.",
      });
    }
  }

  // ===================================================
  // STUDENT VALIDATION BEFORE CREATING ACCOUNT
  // ===================================================
  //
  // A Student account MUST have an exact student_id.
  //
  // ===================================================

  if (
    String(role)
      .trim()
      .toLowerCase() ===
    "student"
  ) {

    const selectedStudentId =
      Number(student_id);

    if (
      !Number.isInteger(
        selectedStudentId
      ) ||
      selectedStudentId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a Student Profile before creating the Student account.",
      });
    }

    // -----------------------------------------------
    // VERIFY EXACT PROFILE
    // -----------------------------------------------

    return db.get(
      `
      SELECT
        id,
        fullname,
        school_id,
        user_id
      FROM students
      WHERE id = ?
        AND school_id = ?
      LIMIT 1
      `,
      [
        selectedStudentId,
        schoolId,
      ],
      (studentErr, studentProfile) => {

        if (studentErr) {
          console.error(
            "STUDENT PROFILE CHECK ERROR:",
            studentErr.message
          );

          return res.status(500).json({
            success: false,
            message:
              "Unable to verify the selected Student Profile.",
          });
        }

        if (!studentProfile) {
          return res.status(400).json({
            success: false,
            message:
              "The selected Student Profile does not exist in the selected school.",
          });
        }

        // ---------------------------------------------
        // PROFILE ALREADY LINKED
        // ---------------------------------------------

        if (
          studentProfile.user_id !== null &&
          Number(studentProfile.user_id) > 0
        ) {
          return res.status(409).json({
            success: false,
            message:
              "This Student Profile is already linked to another login account.",
          });
        }

        // ---------------------------------------------
        // CREATE STUDENT USER
        // ---------------------------------------------

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
          (?, ?, ?, ?, ?, ?)
          `,
          [
            String(
              fullname
            ).trim(),

            String(
              username
            ).trim(),

            password,

            role,

            status ||
              "Active",

            schoolId,
          ],
          function (err) {

            if (err) {
              console.error(
                "ADD STUDENT USER ERROR:",
                err.message
              );

              if (
                err.message.includes(
                  "UNIQUE constraint failed"
                )
              ) {
                return res.status(409).json({
                  success: false,
                  message:
                    "This username already exists.",
                });
              }

              return res.status(500).json({
                success: false,
                message:
                  err.message,
              });
            }

            const newUserId =
              this.lastID;

            // -----------------------------------------
            // LINK EXACT STUDENT PROFILE
            // -----------------------------------------

            db.run(
              `
              UPDATE students
              SET user_id = ?
              WHERE id = ?
                AND school_id = ?
                AND user_id IS NULL
              `,
              [
                newUserId,
                selectedStudentId,
                schoolId,
              ],
              function (linkErr) {

                if (linkErr) {
                  console.error(
                    "STUDENT USER LINK ERROR:",
                    linkErr.message
                  );

                  // Remove account if linking failed.

                  db.run(
                    `
                    DELETE FROM users
                    WHERE id = ?
                    `,
                    [newUserId]
                  );

                  return res.status(500).json({
                    success: false,
                    message:
                      "Student account could not be linked to the selected profile.",
                  });
                }

                if (
                  this.changes === 0
                ) {
                  console.error(
                    "STUDENT PROFILE LINK FAILED:",
                    selectedStudentId
                  );

                  db.run(
                    `
                    DELETE FROM users
                    WHERE id = ?
                    `,
                    [newUserId]
                  );

                  return res.status(409).json({
                    success: false,
                    message:
                      "The selected Student Profile is already linked to another account.",
                  });
                }

                console.log(
                  "STUDENT ACCOUNT LINKED SUCCESSFULLY:",
                  "User:",
                  newUserId,
                  "Student:",
                  selectedStudentId,
                  "School:",
                  schoolId,
                  "Name:",
                  studentProfile.fullname
                );

                return res.status(201).json({
                  success:
                    true,

                  message:
                    "Student account created and linked successfully.",

                  id:
                    newUserId,

                  student_id:
                    selectedStudentId,

                  school_id:
                    schoolId,
                });
              }
            );
          }
        );
      }
    );
  }

  // ===================================================
  // INSTRUCTOR VALIDATION BEFORE CREATING ACCOUNT
  // ===================================================
  //
  // An Instructor account MUST have an exact
  // Instructor Profile.
  //
  // User Account
  //      ↓
  // instructors.user_id
  //
  // ===================================================

  if (
    String(role)
      .trim()
      .toLowerCase() ===
    "instructor"
  ) {

    const selectedInstructorId =
      Number(instructor_id);

    if (
      !Number.isInteger(
        selectedInstructorId
      ) ||
      selectedInstructorId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select the existing instructor profile before creating the Instructor account.",
      });
    }

    // -----------------------------------------------
    // VERIFY EXACT INSTRUCTOR PROFILE
    // -----------------------------------------------

    return db.get(
      `
      SELECT
        id,
        name,
        school_id,
        user_id
      FROM instructors
      WHERE id = ?
        AND school_id = ?
      LIMIT 1
      `,
      [
        selectedInstructorId,
        schoolId,
      ],
      (instructorErr, instructorProfile) => {

        if (instructorErr) {
          console.error(
            "INSTRUCTOR PROFILE CHECK ERROR:",
            instructorErr.message
          );

          return res.status(500).json({
            success: false,
            message:
              "Unable to verify the selected Instructor Profile.",
          });
        }

        // ---------------------------------------------
        // PROFILE DOES NOT EXIST
        // ---------------------------------------------

        if (!instructorProfile) {
          return res.status(400).json({
            success: false,
            message:
              "The selected Instructor Profile does not exist in the selected school.",
          });
        }

        // ---------------------------------------------
        // PROFILE ALREADY LINKED
        // ---------------------------------------------

        if (
          instructorProfile.user_id !== null &&
          Number(instructorProfile.user_id) > 0
        ) {
          return res.status(409).json({
            success: false,
            message:
              "This Instructor Profile is already linked to another login account.",
          });
        }

        // ---------------------------------------------
        // CREATE INSTRUCTOR USER
        // ---------------------------------------------

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
          (?, ?, ?, ?, ?, ?)
          `,
          [
            String(
              fullname
            ).trim(),

            String(
              username
            ).trim(),

            password,

            role,

            status ||
              "Active",

            schoolId,
          ],
          function (err) {

            if (err) {
              console.error(
                "ADD INSTRUCTOR USER ERROR:",
                err.message
              );

              if (
                err.message.includes(
                  "UNIQUE constraint failed"
                )
              ) {
                return res.status(409).json({
                  success: false,
                  message:
                    "This username already exists.",
                });
              }

              return res.status(500).json({
                success: false,
                message:
                  err.message,
              });
            }

            const newUserId =
              this.lastID;

            // -----------------------------------------
            // LINK EXACT INSTRUCTOR PROFILE
            // -----------------------------------------

            db.run(
              `
              UPDATE instructors
              SET user_id = ?
              WHERE id = ?
                AND school_id = ?
                AND user_id IS NULL
              `,
              [
                newUserId,
                selectedInstructorId,
                schoolId,
              ],
              function (linkErr) {

                if (linkErr) {
                  console.error(
                    "INSTRUCTOR USER LINK ERROR:",
                    linkErr.message
                  );

                  // Remove account if linking failed.

                  db.run(
                    `
                    DELETE FROM users
                    WHERE id = ?
                    `,
                    [newUserId]
                  );

                  return res.status(500).json({
                    success: false,
                    message:
                      "Instructor account could not be linked to the selected profile.",
                  });
                }

                // -----------------------------------------
                // LINK FAILED
                // -----------------------------------------

                if (
                  this.changes === 0
                ) {
                  console.error(
                    "INSTRUCTOR PROFILE LINK FAILED:",
                    selectedInstructorId
                  );

                  db.run(
                    `
                    DELETE FROM users
                    WHERE id = ?
                    `,
                    [newUserId]
                  );

                  return res.status(409).json({
                    success: false,
                    message:
                      "The selected Instructor Profile is already linked to another account.",
                  });
                }

                console.log(
                  "INSTRUCTOR ACCOUNT LINKED SUCCESSFULLY:",
                  "User:",
                  newUserId,
                  "Instructor:",
                  selectedInstructorId,
                  "School:",
                  schoolId,
                  "Name:",
                  instructorProfile.name
                );

                return res.status(201).json({
                  success:
                    true,

                  message:
                    "Instructor account created and linked successfully.",

                  id:
                    newUserId,

                  instructor_id:
                    selectedInstructorId,

                  school_id:
                    schoolId,
                });
              }
            );
          }
        );
      }
    );
  }

  // ===================================================
  // NORMAL USER
  // ===================================================

  // Verify school before creating non-student user.

  db.get(
    `
    SELECT
      id,
      status
    FROM schools
    WHERE id = ?
    `,
    [
      schoolId,
    ],
    (schoolErr, school) => {

      if (schoolErr) {
        return res.status(500).json({
          success: false,
          message:
            schoolErr.message,
        });
      }

      if (!school) {
        return res.status(400).json({
          success: false,
          message:
            "Selected school does not exist.",
        });
      }

      if (
        String(school.status)
          .trim()
          .toLowerCase() !==
        "active"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot create a user for an inactive school.",
        });
      }

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
        (?, ?, ?, ?, ?, ?)
        `,
        [
          String(
            fullname
          ).trim(),

          String(
            username
          ).trim(),

          password,

          role,

          status ||
            "Active",

          schoolId,
        ],
        function (err) {

          if (err) {
            console.error(
              "ADD USER ERROR:",
              err.message
            );

            if (
              err.message.includes(
                "UNIQUE constraint failed"
              )
            ) {
              return res.status(409).json({
                success: false,
                message:
                  "This username already exists.",
              });
            }

            return res.status(500).json({
              success: false,
              message:
                err.message,
            });
          }

          return res.status(201).json({
            success:
              true,

            message:
              "User added successfully.",

            id:
              this.lastID,

            school_id:
              schoolId,
          });
        }
      );
    }
  );
};

// =====================================================
// UPDATE USER
// =====================================================

export const updateUser = (req, res) => {

  const {
    id,
  } = req.params;

  const {
    fullname,
    username,
    password,
    role,
    status,
    school_id,
  } = req.body;

  if (
    !fullname ||
    !String(fullname).trim()
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Full name is required.",
    });
  }

  if (
    !username ||
    !String(username).trim()
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Username is required.",
    });
  }

  if (!role) {
    return res.status(400).json({
      success: false,
      message:
        "User role is required.",
    });
  }

  const allowedRoles = [
    "Administrator",
    "Receptionist",
    "Instructor",
    "Student",
    "System Administrator",
  ];

  if (
    !allowedRoles.includes(
      role
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid user role.",
    });
  }

  // ===================================================
  // MAIN SYSTEM ADMINISTRATOR
  // ===================================================

  if (
    Number(id) === 1
  ) {

    if (
      role !==
      "System Administrator"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "The main System Administrator role cannot be changed.",
      });
    }

    if (
      status &&
      status !==
      "Active"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "The main System Administrator cannot be deactivated.",
      });
    }

    if (password) {

      db.run(
        `
        UPDATE users
        SET
          fullname = ?,
          username = ?,
          password = ?,
          role = ?,
          status = ?
        WHERE id = ?
        `,
        [
          String(
            fullname
          ).trim(),

          String(
            username
          ).trim(),

          password,

          role,

          status ||
            "Active",

          id,
        ],
        function (err) {

          if (err) {
            console.error(
              "SYSTEM ADMIN UPDATE ERROR:",
              err.message
            );

            return res.status(500).json({
              success: false,
              message:
                err.message,
            });
          }

          return res.json({
            success:
              true,

            message:
              "User updated successfully.",
          });
        }
      );

      return;
    }

    db.run(
      `
      UPDATE users
      SET
        fullname = ?,
        username = ?,
        role = ?,
        status = ?
      WHERE id = ?
      `,
      [
        String(
          fullname
        ).trim(),

        String(
          username
        ).trim(),

        role,

        status ||
          "Active",

        id,
      ],
      function (err) {

        if (err) {
          return res.status(500).json({
            success: false,
            message:
              err.message,
          });
        }

        return res.json({
          success:
            true,

          message:
            "User updated successfully.",
        });
      }
    );

    return;
  }

  // ===================================================
  // SYSTEM ADMINISTRATOR
  // CAN MOVE USERS BETWEEN SCHOOLS
  // ===================================================

  if (
    isSystemAdministrator(req)
  ) {

    const newSchoolId =
      Number(school_id);

    if (
      !Number.isInteger(
        newSchoolId
      ) ||
      newSchoolId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a valid school.",
      });
    }

    db.get(
      `
      SELECT
        id,
        schoolName,
        status
      FROM schools
      WHERE id = ?
      `,
      [
        newSchoolId,
      ],
      (schoolErr, school) => {

        if (schoolErr) {
          console.error(
            "CHECK SCHOOL ERROR:",
            schoolErr.message
          );

          return res.status(500).json({
            success: false,
            message:
              schoolErr.message,
          });
        }

        if (!school) {
          return res.status(400).json({
            success: false,
            message:
              "Selected school does not exist.",
          });
        }

        if (
          String(school.status)
            .trim()
            .toLowerCase() !==
          "active"
        ) {
          return res.status(403).json({
            success: false,
            message:
              "You cannot assign a user to an inactive school.",
          });
        }

        if (password) {

          db.run(
            `
            UPDATE users
            SET
              fullname = ?,
              username = ?,
              password = ?,
              role = ?,
              status = ?,
              school_id = ?
            WHERE id = ?
            `,
            [
              String(
                fullname
              ).trim(),

              String(
                username
              ).trim(),

              password,

              role,

              status ||
                "Active",

              newSchoolId,

              id,
            ],
            function (err) {

              if (err) {
                console.error(
                  "SYSTEM ADMIN UPDATE USER ERROR:",
                  err.message
                );

                if (
                  err.message.includes(
                    "UNIQUE constraint failed"
                  )
                ) {
                  return res.status(409).json({
                    success: false,
                    message:
                      "This username already exists.",
                  });
                }

                return res.status(500).json({
                  success: false,
                  message:
                    err.message,
                });
              }

              if (
                this.changes === 0
              ) {
                return res.status(404).json({
                  success: false,
                  message:
                    "User not found.",
                });
              }

              console.log(
                "USER SCHOOL UPDATED:",
                id,
                "NEW SCHOOL:",
                newSchoolId
              );

              return res.json({
                success:
                  true,

                message:
                  "User updated successfully.",

                school_id:
                  newSchoolId,
              });
            }
          );

          return;
        }

        db.run(
          `
          UPDATE users
          SET
            fullname = ?,
            username = ?,
            role = ?,
            status = ?,
            school_id = ?
          WHERE id = ?
          `,
          [
            String(
              fullname
            ).trim(),

            String(
              username
            ).trim(),

            role,

            status ||
              "Active",

            newSchoolId,

            id,
          ],
          function (err) {

            if (err) {
              console.error(
                "SYSTEM ADMIN UPDATE USER ERROR:",
                err.message
              );

              if (
                err.message.includes(
                  "UNIQUE constraint failed"
                )
              ) {
                return res.status(409).json({
                  success: false,
                  message:
                    "This username already exists.",
                });
              }

              return res.status(500).json({
                success: false,
                message:
                  err.message,
              });
            }

            if (
              this.changes === 0
            ) {
              return res.status(404).json({
                success: false,
                message:
                  "User not found.",
              });
            }

            console.log(
              "USER SCHOOL UPDATED:",
              id,
              "NEW SCHOOL:",
              newSchoolId
            );

            return res.json({
              success:
                true,

              message:
                "User updated successfully.",

              school_id:
                newSchoolId,
            });
          }
        );
      }
    );

    return;
  }

  // ===================================================
  // NORMAL SCHOOL ADMINISTRATOR
  // ===================================================

  const schoolId =
    getAuthenticatedSchoolId(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });
  }

  if (
    role ===
    "System Administrator"
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Only the System Administrator can assign this role.",
    });
  }

  // ===================================================
  // UPDATE WITH PASSWORD
  // ===================================================

  if (password) {

    db.run(
      `
      UPDATE users
      SET
        fullname = ?,
        username = ?,
        password = ?,
        role = ?,
        status = ?
      WHERE id = ?
      AND school_id = ?
      `,
      [
        String(
          fullname
        ).trim(),

        String(
          username
        ).trim(),

        password,

        role,

        status ||
          "Active",

        id,

        schoolId,
      ],
      function (err) {

        if (err) {
          console.error(
            "UPDATE USER ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message:
              err.message,
          });
        }

        if (
          this.changes === 0
        ) {
          return res.status(404).json({
            success: false,
            message:
              "User not found for this school.",
          });
        }

        return res.json({
          success:
            true,

          message:
            "User updated successfully.",
        });
      }
    );

    return;
  }

  // ===================================================
  // UPDATE WITHOUT PASSWORD
  // ===================================================

  db.run(
    `
    UPDATE users
    SET
      fullname = ?,
      username = ?,
      role = ?,
      status = ?
    WHERE id = ?
    AND school_id = ?
    `,
    [
      String(
        fullname
      ).trim(),

      String(
        username
      ).trim(),

      role,

      status ||
        "Active",

      id,

      schoolId,
    ],
    function (err) {

      if (err) {
        console.error(
          "UPDATE USER ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message:
            err.message,
        });
      }

      if (
        this.changes === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "User not found for this school.",
        });
      }

      return res.json({
        success:
          true,

        message:
          "User updated successfully.",
      });
    }
  );
};

// =====================================================
// DELETE USER
// =====================================================

export const deleteUser = (req, res) => {

  const {
    id,
  } = req.params;

  // ===================================================
  // PROTECT MAIN ADMIN
  // ===================================================

  if (
    Number(id) === 1
  ) {
    return res.status(403).json({
      success: false,
      message:
        "The main System Administrator account cannot be deleted.",
    });
  }

  // ===================================================
  // SYSTEM ADMIN
  // ===================================================

  if (
    isSystemAdministrator(req)
  ) {

    // -----------------------------------------------
    // UNLINK INSTRUCTOR PROFILE FIRST
    // -----------------------------------------------

    db.run(
      `
      UPDATE instructors
      SET user_id = NULL
      WHERE user_id = ?
      `,
      [
        id,
      ],
      (unlinkErr) => {

        if (unlinkErr) {
          return res.status(500).json({
            success: false,
            message:
              "Unable to unlink the Instructor Profile before deleting the user.",
          });
        }

        // ---------------------------------------------
        // DELETE USER
        // ---------------------------------------------

        db.run(
          `
          DELETE FROM users
          WHERE id = ?
          `,
          [
            id,
          ],
          function (err) {

            if (err) {
              return res.status(500).json({
                success: false,
                message:
                  err.message,
              });
            }

            if (
              this.changes === 0
            ) {
              return res.status(404).json({
                success: false,
                message:
                  "User not found.",
              });
            }

            return res.json({
              success:
                true,

              message:
                "User deleted successfully.",
            });
          }
        );
      }
    );

    return;
  }

  // ===================================================
  // NORMAL ADMIN
  // ===================================================

  const schoolId =
    getAuthenticatedSchoolId(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });
  }

  // -----------------------------------------------
  // UNLINK INSTRUCTOR PROFILE FIRST
  // -----------------------------------------------

  db.run(
    `
    UPDATE instructors
    SET user_id = NULL
    WHERE user_id = ?
      AND school_id = ?
    `,
    [
      id,
      schoolId,
    ],
    (unlinkErr) => {

      if (unlinkErr) {
        return res.status(500).json({
          success: false,
          message:
            "Unable to unlink the Instructor Profile before deleting the user.",
        });
      }

      // ---------------------------------------------
      // DELETE USER
      // ---------------------------------------------

      db.run(
        `
        DELETE FROM users
        WHERE id = ?
        AND school_id = ?
        `,
        [
          id,
          schoolId,
        ],
        function (err) {

          if (err) {
            return res.status(500).json({
              success: false,
              message:
                err.message,
            });
          }

          if (
            this.changes === 0
          ) {
            return res.status(404).json({
              success: false,
              message:
                "User not found for this school.",
            });
          }

          return res.json({
            success:
              true,

            message:
              "User deleted successfully.",
          });
        }
      );
    }
  );
};