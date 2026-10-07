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
// GET AUTHENTICATED INSTRUCTOR PROFILE
// =====================================================
//
// Instructor identification is done through:
// instructors.user_id
//
// We DO NOT trust the login fullname.
// =====================================================

const getInstructorProfile = (req, callback) => {
  const userId = Number(req.user?.id);
  const schoolId = getSchoolId(req);

  if (!userId || !schoolId) {
    return callback(null, null);
  }

  db.get(
    `
      SELECT
        id,
        name,
        phone,
        licence,
        experience,
        status,
        school_id,
        user_id
      FROM instructors
      WHERE user_id = ?
        AND school_id = ?
      LIMIT 1
    `,
    [userId, schoolId],
    (err, instructor) => {
      if (err) {
        console.error(
          "GET AUTHENTICATED INSTRUCTOR ERROR:",
          err.message
        );

        return callback(err, null);
      }

      callback(null, instructor || null);
    }
  );
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
// CHECK RECEPTIONIST
// =====================================================

const isReceptionist = (req) => {
  return getUserRole(req) === "receptionist";
};

// =====================================================
// CHECK INSTRUCTOR
// =====================================================

const isInstructor = (req) => {
  return getUserRole(req) === "instructor";
};

// =====================================================
// CHECK STUDENT
// =====================================================

const isStudent = (req) => {
  return getUserRole(req) === "student";
};

// =====================================================
// STAFF WHO CAN MANAGE LESSONS
//
// Administrator
// System Administrator
// Receptionist
// =====================================================

const canManageLessons = (req) => {
  return (
    isAdministrator(req) ||
    isReceptionist(req)
  );
};

// =====================================================
// GET LESSONS
//
// ADMINISTRATOR
//   -> sees all lessons for their school
//
// RECEPTIONIST
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
  // ADMINISTRATOR / SYSTEM ADMINISTRATOR / RECEPTIONIST
  // ===================================================

  if (
    role === "system administrator" ||
    role === "administrator" ||
    role === "admin" ||
    role === "receptionist"
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
            "GET STAFF LESSONS ERROR:",
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

  if (isInstructor(req)) {
    getInstructorProfile(
      req,
      (instructorErr, instructorProfile) => {
        if (instructorErr) {
          return res.status(500).json({
            success: false,
            message:
              "Failed to find instructor profile.",
          });
        }

        if (!instructorProfile) {
          return res.status(403).json({
            success: false,
            message:
              "Your instructor profile is not linked to this account.",
          });
        }

        db.all(
          `
          SELECT *
          FROM lessons
          WHERE school_id = ?
            AND LOWER(TRIM(instructor)) =
                LOWER(TRIM(?))
          ORDER BY lesson_date, lesson_time
          `,
          [
            schoolId,
            instructorProfile.name,
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
      }
    );

    return;
  }

  // ===================================================
  // STUDENT
  // ===================================================

  if (isStudent(req)) {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(403).json({
        success: false,
        message:
          "Student account information not found.",
      });
    }

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
            message:
              "Failed to find student profile.",
          });
        }

        if (!studentProfile) {
          return res.status(404).json({
            success: false,
            message:
              "Student profile is not linked to this account.",
          });
        }

        db.all(
          `
          SELECT *
          FROM lessons
          WHERE school_id = ?
            AND LOWER(TRIM(student)) =
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
    message:
      "You are not authorised to view lessons.",
  });
};

// =====================================================
// GET LESSONS FOR ONE STUDENT
//
// ADMINISTRATOR
// RECEPTIONIST
//   -> can view requested student lessons
//
// INSTRUCTOR
//   -> can only view students assigned to that instructor
//
// STUDENT
//   -> can only view their own lessons
// =====================================================

export const getStudentLessons = (req, res) => {
  const { studentName } = req.params;

  const schoolId = getSchoolId(req);

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
  // ===================================================

  if (isInstructor(req)) {
    getInstructorProfile(
      req,
      (instructorErr, instructorProfile) => {
        if (instructorErr) {
          return res.status(500).json({
            success: false,
            message:
              "Failed to find instructor profile.",
          });
        }

        if (!instructorProfile) {
          return res.status(403).json({
            success: false,
            message:
              "Your instructor profile is not linked to this account.",
          });
        }

        db.all(
          `
          SELECT *
          FROM lessons
          WHERE student = ?
            AND school_id = ?
            AND LOWER(TRIM(instructor)) =
                LOWER(TRIM(?))
          ORDER BY lesson_date DESC, lesson_time DESC
          `,
          [
            studentName,
            schoolId,
            instructorProfile.name,
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
      }
    );

    return;
  }

  // ===================================================
  // STUDENT
  // ===================================================

  if (isStudent(req)) {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(403).json({
        success: false,
        message:
          "Student account information not found.",
      });
    }

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
            message:
              "Failed to find student profile.",
          });
        }

        if (!studentProfile) {
          return res.status(404).json({
            success: false,
            message:
              "Student profile is not linked to this account.",
          });
        }

        db.all(
          `
          SELECT *
          FROM lessons
          WHERE school_id = ?
            AND LOWER(TRIM(student)) =
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
  // ADMINISTRATOR / SYSTEM ADMINISTRATOR / RECEPTIONIST
  // ===================================================

  if (
    isAdministrator(req) ||
    isReceptionist(req)
  ) {
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
            "GET STAFF STUDENT LESSONS ERROR:",
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
// ALLOWED:
// - System Administrator
// - Administrator
// - Receptionist
//
// NOT ALLOWED:
// - Instructor
// - Student
// =====================================================

export const addLesson = (req, res) => {
  const schoolId = getSchoolId(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

  if (!canManageLessons(req)) {
    return res.status(403).json({
      success: false,
      message:
        "Only administrators and receptionists can add lessons.",
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
  // REQUIRED FIELDS
  // ===================================================

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
  // VERIFY STUDENT BELONGS TO SCHOOL
  // ===================================================

  db.get(
    `
    SELECT *
    FROM students
    WHERE school_id = ?
      AND LOWER(TRIM(fullname)) =
          LOWER(TRIM(?))
    LIMIT 1
    `,
    [
      schoolId,
      student,
    ],
    (studentErr, studentRow) => {
      if (studentErr) {
        console.error(
          "CHECK LESSON STUDENT ERROR:",
          studentErr.message
        );

        return res.status(500).json({
          success: false,
          message: studentErr.message,
        });
      }

      if (!studentRow) {
        return res.status(400).json({
          success: false,
          message:
            "Selected student does not belong to your school.",
        });
      }

      // =================================================
      // VERIFY INSTRUCTOR BELONGS TO SCHOOL
      // =================================================

      db.get(
        `
        SELECT *
        FROM instructors
        WHERE school_id = ?
          AND LOWER(TRIM(name)) =
              LOWER(TRIM(?))
        LIMIT 1
        `,
        [
          schoolId,
          instructor,
        ],
        (instructorErr, instructorRow) => {
          if (instructorErr) {
            console.error(
              "CHECK LESSON INSTRUCTOR ERROR:",
              instructorErr.message
            );

            return res.status(500).json({
              success: false,
              message: instructorErr.message,
            });
          }

          if (!instructorRow) {
            return res.status(400).json({
              success: false,
              message:
                "Selected instructor does not belong to your school.",
            });
          }

          // =================================================
          // VERIFY VEHICLE BELONGS TO SCHOOL
          //
          // VEHICLES TABLE:
          // id
          // registration
          // make
          // model
          // year
          // transmission
          // fuel
          // status
          // school_id
          //
          // IMPORTANT:
          // There is NO "name" column.
          // =================================================

          db.get(
            `
            SELECT *
            FROM vehicles
            WHERE school_id = ?
              AND (
                LOWER(TRIM(registration)) =
                  LOWER(TRIM(?))

                OR

                LOWER(TRIM(model)) =
                  LOWER(TRIM(?))

                OR

                LOWER(TRIM(
                  COALESCE(registration, '') ||
                  CASE
                    WHEN registration IS NOT NULL
                         AND TRIM(registration) != ''
                         AND model IS NOT NULL
                         AND TRIM(model) != ''
                    THEN ' - '
                    ELSE ''
                  END ||
                  COALESCE(model, '')
                )) =
                  LOWER(TRIM(?))
              )
            LIMIT 1
            `,
            [
              schoolId,
              vehicle,
              vehicle,
              vehicle,
            ],
            (vehicleErr, vehicleRow) => {
              if (vehicleErr) {
                console.error(
                  "CHECK LESSON VEHICLE ERROR:",
                  vehicleErr.message
                );

                return res.status(500).json({
                  success: false,
                  message: vehicleErr.message,
                });
              }

              if (!vehicleRow) {
                return res.status(400).json({
                  success: false,
                  message:
                    "Selected vehicle does not belong to your school.",
                });
              }

              checkLessonConflictAndInsert();
            }
          );

          // =================================================
          // CHECK CONFLICT AND INSERT
          // =================================================

          function checkLessonConflictAndInsert() {
            db.get(
              `
              SELECT *
              FROM lessons
              WHERE lesson_date = ?
                AND lesson_time = ?
                AND school_id = ?
                AND (
                  LOWER(TRIM(instructor)) =
                    LOWER(TRIM(?))
                  OR
                  LOWER(TRIM(vehicle)) =
                    LOWER(TRIM(?))
                )
              LIMIT 1
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

                // ---------------------------------------------
                // INSTRUCTOR CONFLICT
                // ---------------------------------------------

                if (
                  existingLesson &&
                  String(
                    existingLesson.instructor || ""
                  )
                    .trim()
                    .toLowerCase() ===
                    String(instructor)
                      .trim()
                      .toLowerCase()
                ) {
                  return res.status(400).json({
                    success: false,
                    message:
                      "This instructor is already booked for the selected date and time.",
                  });
                }

                // ---------------------------------------------
                // VEHICLE CONFLICT
                // ---------------------------------------------

                if (
                  existingLesson &&
                  String(
                    existingLesson.vehicle || ""
                  )
                    .trim()
                    .toLowerCase() ===
                    String(vehicle)
                      .trim()
                      .toLowerCase()
                ) {
                  return res.status(400).json({
                    success: false,
                    message:
                      "This vehicle is already booked for the selected date and time.",
                  });
                }

                // ---------------------------------------------
                // INSERT LESSON
                // ---------------------------------------------

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
                  function (insertErr) {
                    if (insertErr) {
                      console.error(
                        "ADD LESSON ERROR:",
                        insertErr.message
                      );

                      return res.status(500).json({
                        success: false,
                        message:
                          insertErr.message,
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
          }
        }
      );
    }
  );
};

// =====================================================
// UPDATE LESSON
//
// ADMINISTRATOR / RECEPTIONIST
//   -> can edit lesson details
//
// INSTRUCTOR
//   -> can ONLY change own lesson to Completed/Cancelled
//
// STUDENT
//   -> cannot update
// =====================================================

export const updateLesson = (req, res) => {
  const { id } = req.params;
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
  // Instructor can update ONLY their own lesson status.
  // ===================================================

  if (isInstructor(req)) {
    const { status } = req.body;

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

    getInstructorProfile(
      req,
      (instructorErr, instructorProfile) => {
        if (instructorErr) {
          return res.status(500).json({
            success: false,
            message:
              "Failed to find instructor profile.",
          });
        }

        if (!instructorProfile) {
          return res.status(403).json({
            success: false,
            message:
              "Your instructor profile is not linked to this account.",
          });
        }

        db.get(
          `
          SELECT *
          FROM lessons
          WHERE id = ?
            AND school_id = ?
            AND LOWER(TRIM(instructor)) =
                LOWER(TRIM(?))
          LIMIT 1
          `,
          [
            id,
            schoolId,
            instructorProfile.name,
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

            db.run(
              `
              UPDATE lessons
              SET status = ?
              WHERE id = ?
                AND school_id = ?
                AND LOWER(TRIM(instructor)) =
                    LOWER(TRIM(?))
              `,
              [
                status,
                id,
                schoolId,
                instructorProfile.name,
              ],
              function (updateErr) {
                if (updateErr) {
                  console.error(
                    "INSTRUCTOR UPDATE LESSON ERROR:",
                    updateErr.message
                  );

                  return res.status(500).json({
                    success: false,
                    message:
                      updateErr.message,
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
      }
    );

    return;
  }

  // ===================================================
  // STUDENT CANNOT UPDATE
  // ===================================================

  if (isStudent(req)) {
    return res.status(403).json({
      success: false,
      message:
        "Students cannot update lessons.",
    });
  }

  // ===================================================
  // ADMINISTRATOR / RECEPTIONIST
  // ===================================================

  if (!canManageLessons(req)) {
    return res.status(403).json({
      success: false,
      message:
        "Only administrators and receptionists can update lessons.",
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
  // REQUIRED FIELDS
  // ===================================================

  if (!student || !instructor || !vehicle) {
    return res.status(400).json({
      success: false,
      message:
        "Student, instructor and vehicle are required.",
    });
  }

  if (!lesson_date || !lesson_time) {
    return res.status(400).json({
      success: false,
      message:
        "Lesson date and time are required.",
    });
  }

  // ===================================================
  // VERIFY STUDENT BELONGS TO SCHOOL
  // ===================================================

  db.get(
    `
    SELECT *
    FROM students
    WHERE school_id = ?
      AND LOWER(TRIM(fullname)) =
          LOWER(TRIM(?))
    LIMIT 1
    `,
    [
      schoolId,
      student,
    ],
    (studentErr, studentRow) => {
      if (studentErr) {
        console.error(
          "CHECK UPDATE STUDENT ERROR:",
          studentErr.message
        );

        return res.status(500).json({
          success: false,
          message: studentErr.message,
        });
      }

      if (!studentRow) {
        return res.status(400).json({
          success: false,
          message:
            "Selected student does not belong to your school.",
        });
      }

      // =================================================
      // VERIFY INSTRUCTOR BELONGS TO SCHOOL
      // =================================================

      db.get(
        `
        SELECT *
        FROM instructors
        WHERE school_id = ?
          AND LOWER(TRIM(name)) =
              LOWER(TRIM(?))
        LIMIT 1
        `,
        [
          schoolId,
          instructor,
        ],
        (instructorErr, instructorRow) => {
          if (instructorErr) {
            console.error(
              "CHECK UPDATE INSTRUCTOR ERROR:",
              instructorErr.message
            );

            return res.status(500).json({
              success: false,
              message: instructorErr.message,
            });
          }

          if (!instructorRow) {
            return res.status(400).json({
              success: false,
              message:
                "Selected instructor does not belong to your school.",
            });
          }

          // =================================================
          // VERIFY VEHICLE BELONGS TO SCHOOL
          //
          // IMPORTANT:
          // vehicles table uses:
          // registration + model
          //
          // There is NO "name" column.
          // =================================================

          db.get(
            `
            SELECT *
            FROM vehicles
            WHERE school_id = ?
              AND (
                LOWER(TRIM(registration)) =
                  LOWER(TRIM(?))

                OR

                LOWER(TRIM(model)) =
                  LOWER(TRIM(?))

                OR

                LOWER(TRIM(
                  COALESCE(registration, '') ||
                  CASE
                    WHEN registration IS NOT NULL
                         AND TRIM(registration) != ''
                         AND model IS NOT NULL
                         AND TRIM(model) != ''
                    THEN ' - '
                    ELSE ''
                  END ||
                  COALESCE(model, '')
                )) =
                  LOWER(TRIM(?))
              )
            LIMIT 1
            `,
            [
              schoolId,
              vehicle,
              vehicle,
              vehicle,
            ],
            (vehicleErr, vehicleRow) => {
              if (vehicleErr) {
                console.error(
                  "CHECK UPDATE VEHICLE ERROR:",
                  vehicleErr.message
                );

                return res.status(500).json({
                  success: false,
                  message: vehicleErr.message,
                });
              }

              if (!vehicleRow) {
                return res.status(400).json({
                  success: false,
                  message:
                    "Selected vehicle does not belong to your school.",
                });
              }

              checkLessonConflictAndUpdate();
            }
          );

          // =================================================
          // CHECK CONFLICT AND UPDATE
          // =================================================

          function checkLessonConflictAndUpdate() {
            db.get(
              `
              SELECT *
              FROM lessons
              WHERE lesson_date = ?
                AND lesson_time = ?
                AND id != ?
                AND school_id = ?
                AND (
                  LOWER(TRIM(instructor)) =
                    LOWER(TRIM(?))
                  OR
                  LOWER(TRIM(vehicle)) =
                    LOWER(TRIM(?))
                )
              LIMIT 1
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

                // ---------------------------------------------
                // INSTRUCTOR CONFLICT
                // ---------------------------------------------

                if (
                  existingLesson &&
                  String(
                    existingLesson.instructor || ""
                  )
                    .trim()
                    .toLowerCase() ===
                    String(instructor)
                      .trim()
                      .toLowerCase()
                ) {
                  return res.status(400).json({
                    success: false,
                    message:
                      "This instructor is already booked for the selected date and time.",
                  });
                }

                // ---------------------------------------------
                // VEHICLE CONFLICT
                // ---------------------------------------------

                if (
                  existingLesson &&
                  String(
                    existingLesson.vehicle || ""
                  )
                    .trim()
                    .toLowerCase() ===
                    String(vehicle)
                      .trim()
                      .toLowerCase()
                ) {
                  return res.status(400).json({
                    success: false,
                    message:
                      "This vehicle is already booked for the selected date and time.",
                  });
                }

                // =================================================
                // UPDATE LESSON
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
                    status || "Booked",
                    id,
                    schoolId,
                  ],
                  function (updateErr) {
                    if (updateErr) {
                      console.error(
                        "UPDATE LESSON ERROR:",
                        updateErr.message
                      );

                      return res.status(500).json({
                        success: false,
                        message:
                          updateErr.message,
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
          }
        }
      );
    }
  );
};

// =====================================================
// DELETE LESSON
//
// ONLY ADMINISTRATORS CAN DELETE LESSONS
//
// RECEPTIONIST CANNOT DELETE
// INSTRUCTOR CANNOT DELETE
// STUDENT CANNOT DELETE
// =====================================================

export const deleteLesson = (req, res) => {
  const { id } = req.params;

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