import db from "../database/database.js";

// =====================================================
// GET SCHOOL ID
// =====================================================

const getSchoolId = (req) => {
  return Number(req.query.school_id) || 1;
};


// =====================================================
// GET DASHBOARD SUMMARY
// =====================================================

export const getDashboard = (req, res) => {

  const schoolId = getSchoolId(req);

  console.log(
    "DASHBOARD SCHOOL ID:",
    schoolId
  );

  const dashboard = {};

  // ===================================================
  // TOTAL STUDENTS
  // ===================================================

  db.get(
    `
    SELECT COUNT(*) AS totalStudents
    FROM students
    WHERE school_id = ?
    `,
    [schoolId],
    (err, studentRow) => {

      if (err) {
        console.error(
          "DASHBOARD STUDENTS ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      dashboard.totalStudents =
        Number(
          studentRow?.totalStudents || 0
        );

      // ===============================================
      // TOTAL INSTRUCTORS
      // ===============================================

      db.get(
        `
        SELECT COUNT(*) AS totalInstructors
        FROM instructors
        WHERE school_id = ?
        `,
        [schoolId],
        (err, instructorRow) => {

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

          dashboard.totalInstructors =
            Number(
              instructorRow?.totalInstructors || 0
            );

          // =============================================
          // TOTAL VEHICLES
          // =============================================

          db.get(
            `
            SELECT COUNT(*) AS totalVehicles
            FROM vehicles
            WHERE school_id = ?
            `,
            [schoolId],
            (err, vehicleRow) => {

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

              dashboard.totalVehicles =
                Number(
                  vehicleRow?.totalVehicles || 0
                );

              // =========================================
              // TOTAL LESSONS
              // =========================================

              db.get(
                `
                SELECT COUNT(*) AS totalLessons
                FROM lessons
                WHERE school_id = ?
                `,
                [schoolId],
                (err, lessonRow) => {

                  if (err) {
                    console.error(
                      "DASHBOARD LESSONS ERROR:",
                      err.message
                    );

                    return res.status(500).json({
                      success: false,
                      message: err.message,
                    });
                  }

                  dashboard.totalLessons =
                    Number(
                      lessonRow?.totalLessons || 0
                    );

                  // =======================================
                  // TODAY'S LESSONS
                  // =======================================

                  db.get(
                    `
                    SELECT COUNT(*) AS todaysLessons
                    FROM lessons
                    WHERE lesson_date =
                      DATE('now', 'localtime')
                    AND school_id = ?
                    `,
                    [schoolId],
                    (err, todayRow) => {

                      if (err) {
                        console.error(
                          "DASHBOARD TODAY LESSONS ERROR:",
                          err.message
                        );

                        return res.status(500).json({
                          success: false,
                          message: err.message,
                        });
                      }

                      dashboard.todaysLessons =
                        Number(
                          todayRow?.todaysLessons || 0
                        );

                      // ===================================
                      // BOOKED LESSONS
                      // ===================================

                      db.get(
                        `
                        SELECT COUNT(*) AS bookedLessons
                        FROM lessons
                        WHERE status = 'Booked'
                        AND school_id = ?
                        `,
                        [schoolId],
                        (err, bookedRow) => {

                          if (err) {
                            console.error(
                              "DASHBOARD BOOKED LESSONS ERROR:",
                              err.message
                            );

                            return res.status(500).json({
                              success: false,
                              message: err.message,
                            });
                          }

                          dashboard.bookedLessons =
                            Number(
                              bookedRow?.bookedLessons || 0
                            );

                          // ================================
                          // COMPLETED LESSONS
                          // ================================

                          db.get(
                            `
                            SELECT COUNT(*) AS completedLessons
                            FROM lessons
                            WHERE status = 'Completed'
                            AND school_id = ?
                            `,
                            [schoolId],
                            (err, completedRow) => {

                              if (err) {
                                console.error(
                                  "DASHBOARD COMPLETED LESSONS ERROR:",
                                  err.message
                                );

                                return res.status(500).json({
                                  success: false,
                                  message: err.message,
                                });
                              }

                              dashboard.completedLessons =
                                Number(
                                  completedRow?.completedLessons || 0
                                );

                              // ==============================
                              // CANCELLED LESSONS
                              // ==============================

                              db.get(
                                `
                                SELECT COUNT(*) AS cancelledLessons
                                FROM lessons
                                WHERE status = 'Cancelled'
                                AND school_id = ?
                                `,
                                [schoolId],
                                (err, cancelledRow) => {

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

                                  dashboard.cancelledLessons =
                                    Number(
                                      cancelledRow?.cancelledLessons || 0
                                    );

                                  // ============================
                                  // UPCOMING LESSONS
                                  // ============================

                                  db.get(
                                    `
                                    SELECT COUNT(*) AS upcomingLessons
                                    FROM lessons
                                    WHERE lesson_date >
                                      DATE('now', 'localtime')
                                    AND status = 'Booked'
                                    AND school_id = ?
                                    `,
                                    [schoolId],
                                    (err, upcomingRow) => {

                                      if (err) {
                                        console.error(
                                          "DASHBOARD UPCOMING LESSONS ERROR:",
                                          err.message
                                        );

                                        return res.status(500).json({
                                          success: false,
                                          message: err.message,
                                        });
                                      }

                                      dashboard.upcomingLessons =
                                        Number(
                                          upcomingRow?.upcomingLessons || 0
                                        );

                                      // ==========================
                                      // MONTHLY INCOME
                                      // ==========================

                                      db.get(
                                        `
                                        SELECT
                                          IFNULL(
                                            SUM(amount),
                                            0
                                          ) AS monthlyIncome
                                        FROM payments
                                        WHERE strftime(
                                          '%Y-%m',
                                          paymentDate
                                        ) =
                                        strftime(
                                          '%Y-%m',
                                          'now',
                                          'localtime'
                                        )
                                        AND school_id = ?
                                        `,
                                        [schoolId],
                                        (err, incomeRow) => {

                                          if (err) {
                                            console.error(
                                              "DASHBOARD MONTHLY INCOME ERROR:",
                                              err.message
                                            );

                                            return res.status(500).json({
                                              success: false,
                                              message: err.message,
                                            });
                                          }

                                          dashboard.monthlyIncome =
                                            Number(
                                              incomeRow?.monthlyIncome || 0
                                            );

                                          // ========================
                                          // OUTSTANDING BALANCE
                                          // ========================

                                          db.get(
                                            `
                                            SELECT
                                              IFNULL(
                                                SUM(
                                                  CASE
                                                    WHEN balance > 0
                                                    THEN balance
                                                    ELSE 0
                                                  END
                                                ),
                                                0
                                              ) AS outstandingBalance
                                            FROM students
                                            WHERE school_id = ?
                                            `,
                                            [schoolId],
                                            (err, balanceRow) => {

                                              if (err) {
                                                console.error(
                                                  "DASHBOARD BALANCE ERROR:",
                                                  err.message
                                                );

                                                return res.status(500).json({
                                                  success: false,
                                                  message: err.message,
                                                });
                                              }

                                              dashboard.outstandingBalance =
                                                Number(
                                                  balanceRow?.outstandingBalance || 0
                                                );

                                              // ======================
                                              // SEND DASHBOARD
                                              // ======================

                                              res.json({
                                                success: true,

                                                school_id:
                                                  schoolId,

                                                totalStudents:
                                                  dashboard.totalStudents,

                                                totalInstructors:
                                                  dashboard.totalInstructors,

                                                totalVehicles:
                                                  dashboard.totalVehicles,

                                                totalLessons:
                                                  dashboard.totalLessons,

                                                todaysLessons:
                                                  dashboard.todaysLessons,

                                                bookedLessons:
                                                  dashboard.bookedLessons,

                                                completedLessons:
                                                  dashboard.completedLessons,

                                                cancelledLessons:
                                                  dashboard.cancelledLessons,

                                                upcomingLessons:
                                                  dashboard.upcomingLessons,

                                                monthlyIncome:
                                                  dashboard.monthlyIncome,

                                                outstandingBalance:
                                                  dashboard.outstandingBalance,
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
    }
  );
};


// =====================================================
// GET TODAY'S LESSONS
// =====================================================

export const getTodaysLessons = (req, res) => {

  const schoolId =
    getSchoolId(req);

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
    AND school_id = ?
    ORDER BY lesson_time
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
          message: err.message,
        });
      }

      res.json(rows || []);
    }
  );
};


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