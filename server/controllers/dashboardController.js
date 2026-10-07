import db from "../database/database.js";

// =====================================================
// DASHBOARD CONTROLLER
// =====================================================

// -----------------------------------------------------
// ROLE HELPERS
// -----------------------------------------------------

const getRole = (req) => {
  return String(req.user?.role || "")
    .trim()
    .toLowerCase();
};

const isInstructor = (req) => {
  return getRole(req) === "instructor";
};

const isSystemAdministrator = (req) => {
  const role = getRole(req);

  return (
    role === "system administrator" ||
    String(req.user?.username || "").trim().toLowerCase() === "admin"
  );
};

// -----------------------------------------------------
// SCHOOL ID
// -----------------------------------------------------

const getSchoolId = (req) => {
  const schoolId = Number(req.user?.school_id);

  return schoolId || 1;
};

// -----------------------------------------------------
// TODAY
// -----------------------------------------------------

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

// =====================================================
// INSTRUCTOR LESSON FILTER
// =====================================================
//
// IMPORTANT:
//
// Lessons currently store the instructor by NAME.
// The instructors table now contains user_id.
//
// Therefore an instructor is allowed to see a lesson
// only when:
//
// instructors.user_id = logged-in user's id
//
// AND
//
// instructors.name = lessons.instructor
//
// AND
//
// instructors.school_id = lessons.school_id
//
// =====================================================

const instructorLessonExists = `
  EXISTS (
    SELECT 1
    FROM instructors i
    WHERE i.user_id = ?
      AND i.school_id = l.school_id
      AND LOWER(TRIM(i.name)) = LOWER(TRIM(l.instructor))
  )
`;

// =====================================================
// DASHBOARD SUMMARY
// =====================================================

export const getDashboard = (req, res) => {
  const schoolId = getSchoolId(req);
  const role = getRole(req);
  const userId = Number(req.user?.id);

  const today = getToday();

  // ===================================================
  // INSTRUCTOR DASHBOARD
  // ===================================================

  if (isInstructor(req)) {
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Instructor account is not authenticated.",
      });
    }

    // -------------------------------------------------
    // TOTAL STUDENTS
    // -------------------------------------------------

    db.get(
      `
      SELECT COUNT(DISTINCT l.student) AS count
      FROM lessons l
      WHERE l.school_id = ?
        AND ${instructorLessonExists}
      `,
      [schoolId, userId],
      (err, studentRow) => {
        if (err) {
          console.error(
            "INSTRUCTOR DASHBOARD STUDENTS ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message: "Failed to load instructor students.",
          });
        }

        const totalStudents = Number(studentRow?.count || 0);

        // -------------------------------------------------
        // ACTIVE STUDENTS
        // -------------------------------------------------

        db.get(
          `
          SELECT COUNT(DISTINCT l.student) AS count
          FROM lessons l
          LEFT JOIN students s
            ON LOWER(TRIM(s.fullname)) = LOWER(TRIM(l.student))
           AND s.school_id = l.school_id
          WHERE l.school_id = ?
            AND ${instructorLessonExists}
            AND (
              s.status = 'Active'
              OR s.status IS NULL
            )
          `,
          [schoolId, userId],
          (err, activeStudentRow) => {
            if (err) {
              console.error(
                "INSTRUCTOR DASHBOARD ACTIVE STUDENTS ERROR:",
                err.message
              );
            }

            const activeStudents = Number(
              activeStudentRow?.count || 0
            );

            // -------------------------------------------------
            // INSTRUCTOR COUNT
            // -------------------------------------------------

            db.get(
              `
              SELECT COUNT(*) AS count
              FROM instructors
              WHERE user_id = ?
                AND school_id = ?
              `,
              [userId, schoolId],
              (err, instructorRow) => {
                if (err) {
                  console.error(
                    "INSTRUCTOR DASHBOARD PROFILE ERROR:",
                    err.message
                  );
                }

                const totalInstructors = Number(
                  instructorRow?.count || 0
                );

                // -------------------------------------------------
                // ACTIVE INSTRUCTOR
                // -------------------------------------------------

                db.get(
                  `
                  SELECT COUNT(*) AS count
                  FROM instructors
                  WHERE user_id = ?
                    AND school_id = ?
                    AND status = 'Active'
                  `,
                  [userId, schoolId],
                  (err, activeInstructorRow) => {
                    if (err) {
                      console.error(
                        "INSTRUCTOR DASHBOARD ACTIVE PROFILE ERROR:",
                        err.message
                      );
                    }

                    const activeInstructors = Number(
                      activeInstructorRow?.count || 0
                    );

                    // -------------------------------------------------
                    // VEHICLES USED BY THIS INSTRUCTOR
                    // -------------------------------------------------

                    db.get(
                      `
                      SELECT COUNT(DISTINCT l.vehicle) AS count
                      FROM lessons l
                      WHERE l.school_id = ?
                        AND ${instructorLessonExists}
                        AND TRIM(COALESCE(l.vehicle, '')) != ''
                      `,
                      [schoolId, userId],
                      (err, vehicleRow) => {
                        if (err) {
                          console.error(
                            "INSTRUCTOR DASHBOARD VEHICLES ERROR:",
                            err.message
                          );
                        }

                        const totalVehicles = Number(
                          vehicleRow?.count || 0
                        );

                        // -------------------------------------------------
                        // TOTAL LESSONS
                        // -------------------------------------------------

                        db.get(
                          `
                          SELECT COUNT(*) AS count
                          FROM lessons l
                          WHERE l.school_id = ?
                            AND ${instructorLessonExists}
                          `,
                          [schoolId, userId],
                          (err, lessonRow) => {
                            if (err) {
                              console.error(
                                "INSTRUCTOR DASHBOARD LESSONS ERROR:",
                                err.message
                              );
                            }

                            const totalLessons = Number(
                              lessonRow?.count || 0
                            );

                            // -------------------------------------------------
                            // TODAY'S LESSONS
                            // -------------------------------------------------

                            db.get(
                              `
                              SELECT COUNT(*) AS count
                              FROM lessons l
                              WHERE l.school_id = ?
                                AND l.lesson_date = ?
                                AND ${instructorLessonExists}
                              `,
                              [schoolId, today, userId],
                              (err, todayRow) => {
                                if (err) {
                                  console.error(
                                    "INSTRUCTOR DASHBOARD TODAY ERROR:",
                                    err.message
                                  );
                                }

                                const todayLessons = Number(
                                  todayRow?.count || 0
                                );

                                // -------------------------------------------------
                                // LESSON STATUS COUNTS
                                // -------------------------------------------------

                                db.get(
                                  `
                                  SELECT
                                    SUM(
                                      CASE
                                        WHEN l.status = 'Booked'
                                        THEN 1
                                        ELSE 0
                                      END
                                    ) AS bookedLessons,

                                    SUM(
                                      CASE
                                        WHEN l.status = 'Completed'
                                        THEN 1
                                        ELSE 0
                                      END
                                    ) AS completedLessons,

                                    SUM(
                                      CASE
                                        WHEN l.status = 'Cancelled'
                                        THEN 1
                                        ELSE 0
                                      END
                                    ) AS cancelledLessons,

                                    SUM(
                                      CASE
                                        WHEN l.lesson_date > ?
                                        THEN 1
                                        ELSE 0
                                      END
                                    ) AS upcomingLessons

                                  FROM lessons l

                                  WHERE l.school_id = ?
                                    AND ${instructorLessonExists}
                                  `,
                                  [
                                    today,
                                    schoolId,
                                    userId,
                                  ],
                                  (err, statusRow) => {
                                    if (err) {
                                      console.error(
                                        "INSTRUCTOR DASHBOARD STATUS ERROR:",
                                        err.message
                                      );
                                    }

                                    const dashboard = {
                                      totalStudents,
                                      activeStudents,

                                      totalInstructors,
                                      activeInstructors,

                                      totalVehicles,
                                      activeVehicles:
                                        totalVehicles,

                                      totalLessons,

                                      todayLessons,

                                      bookedLessons: Number(
                                        statusRow?.bookedLessons || 0
                                      ),

                                      completedLessons: Number(
                                        statusRow?.completedLessons || 0
                                      ),

                                      cancelledLessons: Number(
                                        statusRow?.cancelledLessons || 0
                                      ),

                                      upcomingLessons: Number(
                                        statusRow?.upcomingLessons || 0
                                      ),

                                      // SECURITY:
                                      // Instructor must not see school income.
                                      monthlyIncome: 0,
                                    };

                                    return res.json({
                                      success: true,
                                      data: dashboard,
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
                );
              }
            );
          }
        );
      }
    );

    return;
  }

  // ===================================================
  // ADMIN / SYSTEM ADMIN DASHBOARD
  // ===================================================
  //
  // Existing school-wide behaviour remains here.
  //
  // System Administrator:
  //     can see the selected school.
  //
  // Administrator:
  //     can see own school.
  //
  // ===================================================

  const dashboard = {
    totalStudents: 0,
    activeStudents: 0,

    totalInstructors: 0,
    activeInstructors: 0,

    totalVehicles: 0,
    activeVehicles: 0,

    totalLessons: 0,

    todayLessons: 0,

    bookedLessons: 0,
    completedLessons: 0,
    cancelledLessons: 0,
    upcomingLessons: 0,

    monthlyIncome: 0,
  };

  // ---------------------------------------------------
  // TOTAL STUDENTS
  // ---------------------------------------------------

  db.get(
    `
    SELECT COUNT(*) AS count
    FROM students
    WHERE school_id = ?
    `,
    [schoolId],
    (err, row) => {
      if (err) {
        console.error(
          "DASHBOARD STUDENTS ERROR:",
          err.message
        );
      } else {
        dashboard.totalStudents = Number(
          row?.count || 0
        );
      }

      // -------------------------------------------------
      // ACTIVE STUDENTS
      // -------------------------------------------------

      db.get(
        `
        SELECT COUNT(*) AS count
        FROM students
        WHERE school_id = ?
          AND status = 'Active'
        `,
        [schoolId],
        (err, row) => {
          if (err) {
            console.error(
              "DASHBOARD ACTIVE STUDENTS ERROR:",
              err.message
            );
          } else {
            dashboard.activeStudents = Number(
              row?.count || 0
            );
          }

          // -------------------------------------------------
          // TOTAL INSTRUCTORS
          // -------------------------------------------------

          db.get(
            `
            SELECT COUNT(*) AS count
            FROM instructors
            WHERE school_id = ?
            `,
            [schoolId],
            (err, row) => {
              if (err) {
                console.error(
                  "DASHBOARD INSTRUCTORS ERROR:",
                  err.message
                );
              } else {
                dashboard.totalInstructors = Number(
                  row?.count || 0
                );
              }

              // -------------------------------------------------
              // ACTIVE INSTRUCTORS
              // -------------------------------------------------

              db.get(
                `
                SELECT COUNT(*) AS count
                FROM instructors
                WHERE school_id = ?
                  AND status = 'Active'
                `,
                [schoolId],
                (err, row) => {
                  if (err) {
                    console.error(
                      "DASHBOARD ACTIVE INSTRUCTORS ERROR:",
                      err.message
                    );
                  } else {
                    dashboard.activeInstructors = Number(
                      row?.count || 0
                    );
                  }

                  // -------------------------------------------------
                  // TOTAL VEHICLES
                  // -------------------------------------------------

                  db.get(
                    `
                    SELECT COUNT(*) AS count
                    FROM vehicles
                    WHERE school_id = ?
                    `,
                    [schoolId],
                    (err, row) => {
                      if (err) {
                        console.error(
                          "DASHBOARD VEHICLES ERROR:",
                          err.message
                        );
                      } else {
                        dashboard.totalVehicles = Number(
                          row?.count || 0
                        );
                      }

                      // -------------------------------------------------
                      // ACTIVE VEHICLES
                      // -------------------------------------------------

                      db.get(
                        `
                        SELECT COUNT(*) AS count
                        FROM vehicles
                        WHERE school_id = ?
                          AND status = 'Active'
                        `,
                        [schoolId],
                        (err, row) => {
                          if (err) {
                            console.error(
                              "DASHBOARD ACTIVE VEHICLES ERROR:",
                              err.message
                            );
                          } else {
                            dashboard.activeVehicles = Number(
                              row?.count || 0
                            );
                          }

                          // -------------------------------------------------
                          // TOTAL LESSONS
                          // -------------------------------------------------

                          db.get(
                            `
                            SELECT COUNT(*) AS count
                            FROM lessons
                            WHERE school_id = ?
                            `,
                            [schoolId],
                            (err, row) => {
                              if (err) {
                                console.error(
                                  "DASHBOARD TOTAL LESSONS ERROR:",
                                  err.message
                                );
                              } else {
                                dashboard.totalLessons = Number(
                                  row?.count || 0
                                );
                              }

                              // -------------------------------------------------
                              // LESSON STATUS COUNTS
                              // -------------------------------------------------

                              db.get(
                                `
                                SELECT
                                  SUM(
                                    CASE
                                      WHEN status = 'Booked'
                                      THEN 1
                                      ELSE 0
                                    END
                                  ) AS bookedLessons,

                                  SUM(
                                    CASE
                                      WHEN status = 'Completed'
                                      THEN 1
                                      ELSE 0
                                    END
                                  ) AS completedLessons,

                                  SUM(
                                    CASE
                                      WHEN status = 'Cancelled'
                                      THEN 1
                                      ELSE 0
                                    END
                                  ) AS cancelledLessons,

                                  SUM(
                                    CASE
                                      WHEN lesson_date > ?
                                      THEN 1
                                      ELSE 0
                                    END
                                  ) AS upcomingLessons

                                FROM lessons

                                WHERE school_id = ?
                                `,
                                [today, schoolId],
                                (err, row) => {
                                  if (err) {
                                    console.error(
                                      "DASHBOARD LESSON STATUS ERROR:",
                                      err.message
                                    );
                                  } else {
                                    dashboard.bookedLessons =
                                      Number(
                                        row?.bookedLessons || 0
                                      );

                                    dashboard.completedLessons =
                                      Number(
                                        row?.completedLessons || 0
                                      );

                                    dashboard.cancelledLessons =
                                      Number(
                                        row?.cancelledLessons || 0
                                      );

                                    dashboard.upcomingLessons =
                                      Number(
                                        row?.upcomingLessons || 0
                                      );
                                  }

                                  // -------------------------------------------------
                                  // TODAY'S LESSONS
                                  // -------------------------------------------------

                                  db.get(
                                    `
                                    SELECT COUNT(*) AS count
                                    FROM lessons
                                    WHERE school_id = ?
                                      AND lesson_date = ?
                                    `,
                                    [schoolId, today],
                                    (err, row) => {
                                      if (err) {
                                        console.error(
                                          "DASHBOARD TODAY LESSONS ERROR:",
                                          err.message
                                        );
                                      } else {
                                        dashboard.todayLessons =
                                          Number(
                                            row?.count || 0
                                          );
                                      }

                                      // -------------------------------------------------
                                      // MONTHLY INCOME
                                      // -------------------------------------------------

                                      const month =
                                        today.substring(0, 7);

                                      db.get(
                                        `
                                        SELECT
                                          COALESCE(
                                            SUM(amount),
                                            0
                                          ) AS total
                                        FROM payments
                                        WHERE school_id = ?
                                          AND paymentDate LIKE ?
                                        `,
                                        [
                                          schoolId,
                                          `${month}%`,
                                        ],
                                        (err, row) => {
                                          if (err) {
                                            console.error(
                                              "DASHBOARD MONTHLY INCOME ERROR:",
                                              err.message
                                            );
                                          } else {
                                            dashboard.monthlyIncome =
                                              Number(
                                                row?.total || 0
                                              );
                                          }

                                          // -------------------------------------------------
                                          // SEND DASHBOARD
                                          // -------------------------------------------------

                                          return res.json({
                                            success: true,
                                            data: dashboard,
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
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};

// =====================================================
// TODAY'S LESSONS
// =====================================================

export const getTodayLessons = (req, res) => {
  const today = getToday();

  const schoolId = getSchoolId(req);
  const userId = Number(req.user?.id);

  // ---------------------------------------------------
  // INSTRUCTOR
  // ---------------------------------------------------

  if (isInstructor(req)) {
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Instructor account is not authenticated.",
      });
    }

    db.all(
      `
      SELECT
        l.id,
        l.student,
        l.instructor,
        l.vehicle,
        l.lesson_date,
        l.lesson_time,
        l.status,

        l.student AS student_name,
        l.student AS student_number,

        l.instructor AS instructor_name,
        l.vehicle AS vehicle_registration

      FROM lessons l

      WHERE l.school_id = ?
        AND l.lesson_date = ?
        AND ${instructorLessonExists}

      ORDER BY l.lesson_time ASC
      `,
      [
        schoolId,
        today,
        userId,
      ],
      (err, rows) => {
        if (err) {
          console.error(
            "INSTRUCTOR TODAY LESSONS ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message: "Failed to load today's lessons.",
          });
        }

        return res.json({
          success: true,
          data: rows || [],
        });
      }
    );

    return;
  }

  // ---------------------------------------------------
  // ADMIN / SCHOOL DASHBOARD
  // ---------------------------------------------------

  db.all(
    `
    SELECT
      id,
      student,
      instructor,
      vehicle,
      lesson_date,
      lesson_time,
      status,

      student AS student_name,
      student AS student_number,

      instructor AS instructor_name,
      vehicle AS vehicle_registration

    FROM lessons

    WHERE school_id = ?
      AND lesson_date = DATE('now', 'localtime')

    ORDER BY lesson_time ASC
    `,
    [schoolId],
    (err, rows) => {
      if (err) {
        console.error(
          "TODAY'S LESSONS ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: "Failed to load today's lessons.",
          error: err.message,
        });
      }

      return res.json({
        success: true,
        data: rows || [],
      });
    }
  );
};

// =====================================================
// MONTHLY INCOME
// =====================================================

export const getMonthlyIncome = (req, res) => {
  // Instructors must never receive financial information.
  if (isInstructor(req)) {
    return res.json({
      success: true,
      data: {
        total: 0,
      },
    });
  }

  const schoolId = getSchoolId(req);

  const today = getToday();
  const month = today.substring(0, 7);

  db.get(
    `
    SELECT
      COALESCE(
        SUM(amount),
        0
      ) AS total

    FROM payments

    WHERE school_id = ?
      AND paymentDate LIKE ?
    `,
    [
      schoolId,
      `${month}%`,
    ],
    (err, row) => {
      if (err) {
        console.error(
          "MONTHLY INCOME ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: "Failed to load monthly income.",
          error: err.message,
        });
      }

      return res.json({
        success: true,
        data: {
          total: Number(
            row?.total || 0
          ),
        },
      });
    }
  );
};

// =====================================================
// DASHBOARD STATISTICS
// =====================================================

export const getDashboardStats = (req, res) => {
  return getDashboard(req, res);
};

// =====================================================
// DASHBOARD ALIASES
// =====================================================

export const dashboard = getDashboard;

export const todayLessons = getTodayLessons;

export const monthlyIncome = getMonthlyIncome;

export const dashboardStats = getDashboardStats;

// =====================================================
// GET DASHBOARD ALERTS
// =====================================================

export const getDashboardAlerts = (req, res) => {
  const schoolId = getSchoolId(req);
  const userId = Number(req.user?.id);

  // ---------------------------------------------------
  // INSTRUCTOR ALERTS
  // ---------------------------------------------------

  if (isInstructor(req)) {
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Instructor account is not authenticated.",
      });
    }

    // -------------------------------------------------
    // OUTSTANDING STUDENTS
    // Only students who have lessons with this instructor
    // -------------------------------------------------

    db.all(
      `
      SELECT
        s.id,
        s.studentNo,
        s.fullname,
        s.balance

      FROM students s

      WHERE s.balance > 0
        AND s.school_id = ?

        AND EXISTS (
          SELECT 1
          FROM lessons l
          WHERE l.school_id = s.school_id
            AND LOWER(TRIM(l.student)) =
                LOWER(TRIM(s.fullname))
            AND ${instructorLessonExists}
        )

      ORDER BY s.balance DESC

      LIMIT 10
      `,
      [
        schoolId,
        userId,
      ],
      (err, outstandingStudents) => {
        if (err) {
          console.error(
            "INSTRUCTOR DASHBOARD OUTSTANDING STUDENTS ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        // -------------------------------------------------
        // CANCELLED LESSONS
        // -------------------------------------------------

        db.all(
          `
          SELECT
            l.student,
            l.instructor,
            l.vehicle,
            l.lesson_time,
            l.status

          FROM lessons l

          WHERE l.lesson_date =
                DATE('now', 'localtime')

            AND l.status = 'Cancelled'

            AND l.school_id = ?

            AND ${instructorLessonExists}

          ORDER BY l.lesson_time
          `,
          [
            schoolId,
            userId,
          ],
          (err, cancelledLessons) => {
            if (err) {
              console.error(
                "INSTRUCTOR DASHBOARD CANCELLED LESSONS ERROR:",
                err.message
              );

              return res.status(500).json({
                success: false,
                message: err.message,
              });
            }

            // -------------------------------------------------
            // VEHICLES USED BY INSTRUCTOR
            //
            // Only vehicles appearing in his lessons.
            // -------------------------------------------------

            db.all(
              `
              SELECT DISTINCT
                v.id,
                v.registration,
                v.make,
                v.model,
                v.status

              FROM vehicles v

              INNER JOIN lessons l
                ON LOWER(TRIM(l.vehicle)) =
                   LOWER(TRIM(v.registration))
               AND l.school_id = v.school_id

              WHERE v.school_id = ?

                AND ${instructorLessonExists}

              ORDER BY v.registration
              `,
              [
                schoolId,
                userId,
              ],
              (err, instructorVehicles) => {
                if (err) {
                  console.error(
                    "INSTRUCTOR DASHBOARD VEHICLES ERROR:",
                    err.message
                  );

                  return res.status(500).json({
                    success: false,
                    message: err.message,
                  });
                }

                // -------------------------------------------------
                // OWN INSTRUCTOR STATUS
                // -------------------------------------------------

                db.get(
                  `
                  SELECT
                    id,
                    name,
                    phone,
                    status

                  FROM instructors

                  WHERE user_id = ?
                    AND school_id = ?

                  LIMIT 1
                  `,
                  [
                    userId,
                    schoolId,
                  ],
                  (err, instructor) => {
                    if (err) {
                      console.error(
                        "INSTRUCTOR DASHBOARD PROFILE ERROR:",
                        err.message
                      );
                    }

                    return res.json({
                      success: true,

                      school_id: schoolId,

                      // Financial data deliberately excluded
                      monthlyIncome: 0,

                      outstandingStudents:
                        outstandingStudents || [],

                      cancelledLessons:
                        cancelledLessons || [],

                      unavailableVehicles:
                        (instructorVehicles || []).filter(
                          (vehicle) =>
                            vehicle.status !== "Available"
                        ),

                      inactiveInstructors:
                        instructor &&
                        instructor.status !== "Active"
                          ? [instructor]
                          : [],
                    });
                  }
                );
              }
            );
          }
        );
      }
    );

    return;
  }

  // ===================================================
  // ADMIN / SYSTEM ADMIN ALERTS
  // ===================================================

  db.all(
    `
    SELECT
      id,
      studentNo,
      fullname,
      balance

    FROM students

    WHERE balance > 0
      AND school_id = ?

    ORDER BY balance DESC

    LIMIT 10
    `,
    [schoolId],
    (err, outstandingStudents) => {
      if (err) {
        console.error(
          "DASHBOARD OUTSTANDING STUDENTS ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      db.all(
        `
        SELECT
          student,
          instructor,
          vehicle,
          lesson_time,
          status

        FROM lessons

        WHERE lesson_date =
              DATE('now', 'localtime')

          AND status = 'Cancelled'

          AND school_id = ?

        ORDER BY lesson_time
        `,
        [schoolId],
        (err, cancelledLessons) => {
          if (err) {
            console.error(
              "DASHBOARD CANCELLED LESSONS ERROR:",
              err.message
            );

            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }

          db.all(
            `
            SELECT
              id,
              registration,
              make,
              model,
              status

            FROM vehicles

            WHERE status != 'Available'

              AND school_id = ?

            ORDER BY registration
            `,
            [schoolId],
            (err, unavailableVehicles) => {
              if (err) {
                console.error(
                  "DASHBOARD VEHICLES ERROR:",
                  err.message
                );

                return res.status(500).json({
                  success: false,
                  message: err.message,
                });
              }

              db.all(
                `
                SELECT
                  id,
                  name,
                  phone,
                  status

                FROM instructors

                WHERE status != 'Active'

                  AND school_id = ?

                ORDER BY name
                `,
                [schoolId],
                (err, inactiveInstructors) => {
                  if (err) {
                    console.error(
                      "DASHBOARD INSTRUCTORS ERROR:",
                      err.message
                    );

                    return res.status(500).json({
                      success: false,
                      message: err.message,
                    });
                  }

                  return res.json({
                    success: true,

                    school_id: schoolId,

                    outstandingStudents:
                      outstandingStudents || [],

                    cancelledLessons:
                      cancelledLessons || [],

                    unavailableVehicles:
                      unavailableVehicles || [],

                    inactiveInstructors:
                      inactiveInstructors || [],
                  });
                }
              );
            }
          );
        }
      );
    }
  );
};