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
    totalLessons: 0,
    todayLessons: 0,
    bookedLessons: 0,
    completedLessons: 0,
    cancelledLessons: 0,
    upcomingLessons: 0,
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
                          // TOTAL LESSONS COUNT
                          // ========================

                          db.get(
                            `
                            SELECT COUNT(*) AS count
                            FROM lessons
                            WHERE school_id = ?
                            `,
                            [
                              schoolId
                            ],
                            (err, row) => {

                              if (err) {
                                console.error(
                                  "DASHBOARD TOTAL LESSONS ERROR:",
                                  err.message
                                );
                              } else {
                                dashboard.totalLessons =
                                  row?.count || 0;
                              }

                            }
                          );

                          // ========================
                          const today =
                            new Date()
                              .toISOString()
                              .split("T")[0];

                          // LESSON STATUS COUNTS
                          // ========================

                          db.get(
                            `
                            SELECT
                              SUM(CASE WHEN status = 'Booked' THEN 1 ELSE 0 END) AS bookedLessons,
                              SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completedLessons,
                              SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelledLessons,
                              SUM(CASE WHEN lesson_date > ? THEN 1 ELSE 0 END) AS upcomingLessons
                            FROM lessons
                            WHERE school_id = ?
                            `,
                            [
                              today,
                              schoolId
                            ],
                            (err, row) => {

                              if (err) {
                                console.error(
                                  "DASHBOARD LESSON STATUS COUNTS ERROR:",
                                  err.message
                                );
                              } else {
                                dashboard.bookedLessons =
                                  Number(row?.bookedLessons || 0);

                                dashboard.completedLessons =
                                  Number(row?.completedLessons || 0);

                                dashboard.cancelledLessons =
                                  Number(row?.cancelledLessons || 0);

                                dashboard.upcomingLessons =
                                  Number(row?.upcomingLessons || 0);
                              }

                            }
                          );


                          // ========================
                          // TODAY'S LESSONS COUNT
                          // ========================
                          // ========================

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
                                AND paymentDate LIKE ?
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

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const schoolId =
    Number(
      req.query.school_id ||
      req.user?.school_id ||
      1
    ) || 1;

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
    [
      schoolId
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
    totalLessons: 0,
    todayLessons: 0,
    bookedLessons: 0,
    completedLessons: 0,
    cancelledLessons: 0,
    upcomingLessons: 0,
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
                                  AND paymentDate LIKE ?
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



// =====================================================
// GET DASHBOARD ALERTS
// =====================================================

export const getDashboardAlerts = (req, res) => {

  const schoolId =
    getSchoolId(req);

  const alerts = {};

  // ===================================================
  // STUDENTS WITH OUTSTANDING BALANCES
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

      alerts.outstandingStudents =
        outstandingStudents || [];

      // ===============================================
      // CANCELLED LESSONS TODAY
      // ===============================================

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

          alerts.cancelledLessons =
            cancelledLessons || [];

          // =============================================
          // UNAVAILABLE VEHICLES
          // =============================================

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

              alerts.unavailableVehicles =
                unavailableVehicles || [];

              // =========================================
              // INACTIVE INSTRUCTORS
              // =========================================

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

                  alerts.inactiveInstructors =
                    inactiveInstructors || [];

                  // ======================================
                  // SEND ALERTS
                  // ======================================

                  res.json({
                    success: true,

                    school_id:
                      schoolId,

                    outstandingStudents:
                      alerts.outstandingStudents,

                    cancelledLessons:
                      alerts.cancelledLessons,

                    unavailableVehicles:
                      alerts.unavailableVehicles,

                    inactiveInstructors:
                      alerts.inactiveInstructors,
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
