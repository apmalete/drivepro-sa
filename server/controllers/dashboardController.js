import db from "../database/database.js";

// ======================================
// DASHBOARD CONTROLLER
// ======================================

// Helper function to safely get the school ID
const getSchoolId = (req) => {
  const schoolId =
    req.query.school_id ||
    req.user?.school_id ||
    req.body?.school_id ||
    1;

  return Number(schoolId) || 1;
};


// ======================================
// DASHBOARD SUMMARY
// ======================================

export const getDashboard = (req, res) => {

  const schoolId = getSchoolId(req);

  const dashboard = {
    totalStudents: 0,
    activeStudents: 0,
    totalInstructors: 0,
    activeInstructors: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    todayLessons: 0,
    monthlyIncome: 0
  };


  // ====================================
  // TOTAL STUDENTS
  // ====================================

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
        dashboard.totalStudents =
          row?.count || 0;
      }


      // ==================================
      // ACTIVE STUDENTS
      // ==================================

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
            dashboard.activeStudents =
              row?.count || 0;
          }


          // ================================
          // TOTAL INSTRUCTORS
          // ================================

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
                dashboard.totalInstructors =
                  row?.count || 0;
              }


              // ==============================
              // ACTIVE INSTRUCTORS
              // ==============================

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
                    dashboard.activeInstructors =
                      row?.count || 0;
                  }


                  // ============================
                  // TOTAL VEHICLES
                  // ============================

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
                        dashboard.totalVehicles =
                          row?.count || 0;
                      }


                      // ==========================
                      // ACTIVE VEHICLES
                      // ==========================

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
                            dashboard.activeVehicles =
                              row?.count || 0;
                          }


                          // ========================
                          // TODAY'S LESSONS COUNT
                          // ========================

                          const today =
                            new Date()
                              .toISOString()
                              .split("T")[0];

                          db.get(
                            `
                            SELECT COUNT(*) AS count
                            FROM lessons
                            WHERE school_id = ?
                            AND lesson_date = ?
                            `,
                            [
                              schoolId,
                              today
                            ],
                            (err, row) => {

                              if (err) {
                                console.error(
                                  "DASHBOARD TODAY LESSONS COUNT ERROR:",
                                  err.message
                                );
                              } else {
                                dashboard.todayLessons =
                                  row?.count || 0;
                              }


                              // ======================
                              // MONTHLY INCOME
                              // ======================

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
                                AND payment_date LIKE ?
                                `,
                                [
                                  schoolId,
                                  `${month}%`
                                ],
                                (err, row) => {

                                  if (err) {
                                    console.error(
                                      "DASHBOARD MONTHLY INCOME ERROR:",
                                      err.message
                                    );
                                  } else {
                                    dashboard.monthlyIncome =
                                      row?.total || 0;
                                  }


                                  // ====================
                                  // SEND DASHBOARD
                                  // ====================

                                  res.json({
                                    success: true,
                                    data: dashboard
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
};
// ======================================
// TODAY'S LESSONS
// ======================================

export const getTodayLessons = (req, res) => {

  const schoolId = Number(
    req.query.school_id ||
    req.user?.school_id ||
    1
  ) || 1;

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  db.all(
    `
    SELECT
      lessons.id,
      lessons.student_id,
      lessons.instructor_id,
      lessons.vehicle_id,
      lessons.lesson_date,
      lessons.lesson_time,
      lessons.duration,
      lessons.status,
      lessons.notes,

      students.fullname AS student_name,
      students.studentNo AS student_number,

      instructors.fullname AS instructor_name,

      vehicles.registration AS vehicle_registration,
      vehicles.make AS vehicle_make,
      vehicles.model AS vehicle_model

    FROM lessons

    LEFT JOIN students
      ON students.id = lessons.student_id

    LEFT JOIN instructors
      ON instructors.id = lessons.instructor_id

    LEFT JOIN vehicles
      ON vehicles.id = lessons.vehicle_id

    WHERE lessons.school_id = ?
      AND lessons.lesson_date = ?

    ORDER BY lessons.lesson_time ASC
    `,
    [
      schoolId,
      today
    ],
    (err, rows) => {

      if (err) {

        console.error(
          "TODAY'S LESSONS ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: "Failed to load today's lessons",
          error: err.message
        });
      }

      res.json({
        success: true,
        data: rows || []
      });
    }
  );
};


// ======================================
// MONTHLY INCOME
// ======================================

export const getMonthlyIncome = (req, res) => {

  const schoolId = Number(
    req.query.school_id ||
    req.user?.school_id ||
    1
  ) || 1;

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

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
      AND payment_date LIKE ?
    `,
    [
      schoolId,
      `${month}%`
    ],
    (err, row) => {

      if (err) {

        console.error(
          "MONTHLY INCOME ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: "Failed to load monthly income",
          error: err.message
        });
      }

      res.json({
        success: true,
        data: {
          total: Number(
            row?.total || 0
          )
        }
      });
    }
  );
};
// ======================================
// DASHBOARD STATISTICS
// ======================================

export const getDashboardStats = (req, res) => {

  const schoolId = Number(
    req.query.school_id ||
    req.user?.school_id ||
    1
  ) || 1;

  const stats = {
    totalStudents: 0,
    activeStudents: 0,
    totalInstructors: 0,
    activeInstructors: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    todayLessons: 0,
    monthlyIncome: 0
  };

  // ====================================
  // TOTAL STUDENTS
  // ====================================

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
          "TOTAL STUDENTS ERROR:",
          err.message
        );
      } else {
        stats.totalStudents =
          Number(row?.count || 0);
      }

      // ==================================
      // ACTIVE STUDENTS
      // ==================================

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
              "ACTIVE STUDENTS ERROR:",
              err.message
            );
          } else {
            stats.activeStudents =
              Number(row?.count || 0);
          }

          // ================================
          // TOTAL INSTRUCTORS
          // ================================

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
                  "TOTAL INSTRUCTORS ERROR:",
                  err.message
                );
              } else {
                stats.totalInstructors =
                  Number(row?.count || 0);
              }

              // ==============================
              // ACTIVE INSTRUCTORS
              // ==============================

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
                      "ACTIVE INSTRUCTORS ERROR:",
                      err.message
                    );
                  } else {
                    stats.activeInstructors =
                      Number(row?.count || 0);
                  }

                  // ============================
                  // TOTAL VEHICLES
                  // ============================

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
                          "TOTAL VEHICLES ERROR:",
                          err.message
                        );
                      } else {
                        stats.totalVehicles =
                          Number(row?.count || 0);
                      }

                      // ==========================
                      // ACTIVE VEHICLES
                      // ==========================

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
                              "ACTIVE VEHICLES ERROR:",
                              err.message
                            );
                          } else {
                            stats.activeVehicles =
                              Number(row?.count || 0);
                          }

                          // ========================
                          // TODAY'S LESSONS
                          // ========================

                          const today =
                            new Date()
                              .toISOString()
                              .split("T")[0];

                          db.get(
                            `
                            SELECT COUNT(*) AS count
                            FROM lessons
                            WHERE school_id = ?
                              AND lesson_date = ?
                            `,
                            [
                              schoolId,
                              today
                            ],
                            (err, row) => {

                              if (err) {
                                console.error(
                                  "TODAY LESSONS STATS ERROR:",
                                  err.message
                                );
                              } else {
                                stats.todayLessons =
                                  Number(
                                    row?.count || 0
                                  );
                              }

                              // ======================
                              // MONTHLY INCOME
                              // ======================

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
                                  AND payment_date LIKE ?
                                `,
                                [
                                  schoolId,
                                  `${month}%`
                                ],
                                (err, row) => {

                                  if (err) {
                                    console.error(
                                      "MONTHLY INCOME STATS ERROR:",
                                      err.message
                                    );
                                  } else {
                                    stats.monthlyIncome =
                                      Number(
                                        row?.total || 0
                                      );
                                  }

                                  // ==================
                                  // SEND STATISTICS
                                  // ==================

                                  res.json({
                                    success: true,
                                    data: stats
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
};
// ======================================
// DASHBOARD SUMMARY ALIASES
// ======================================

// Some parts of the application may use
// these controller names. Keep them available
// so existing routes continue working.

export const dashboard = getDashboard;
export const todayLessons = getTodayLessons;
export const monthlyIncome = getMonthlyIncome;
export const dashboardStats = getDashboardStats;