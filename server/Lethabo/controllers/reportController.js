import db from "../database/database.js";

// ======================================
// GET SCHOOL ID
// ======================================

const getSchoolId = (req) => {
  return Number(req.query.school_id) || 1;
};


// ======================================
// GET ADVANCED FINANCIAL REPORT
// ======================================

export const getFinancialReport = (req, res) => {

  const { startDate, endDate } = req.query;

  const schoolId = getSchoolId(req);

  // ======================================
  // VALIDATE DATES
  // ======================================

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "Start date and end date are required.",
    });
  }

  if (startDate > endDate) {
    return res.status(400).json({
      success: false,
      message: "Start date cannot be after end date.",
    });
  }


  // ======================================
  // TOTAL PAYMENTS / INCOME
  // ======================================

  db.get(
    `
    SELECT
      IFNULL(SUM(amount), 0) AS totalIncome,
      COUNT(*) AS totalPayments
    FROM payments
    WHERE paymentDate BETWEEN ? AND ?
      AND school_id = ?
    `,
    [
      startDate,
      endDate,
      schoolId,
    ],
    (err, paymentRow) => {

      if (err) {
        console.error(
          "REPORT PAYMENT ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }


      // ======================================
      // OUTSTANDING BALANCE
      // ======================================

      db.get(
        `
        SELECT
          IFNULL(
            SUM(
              CASE
                WHEN (courseFee - amountPaid) > 0
                THEN (courseFee - amountPaid)
                ELSE 0
              END
            ),
            0
          ) AS outstandingBalance
        FROM students
        WHERE school_id = ?
        `,
        [
          schoolId,
        ],
        (err, balanceRow) => {

          if (err) {
            console.error(
              "REPORT BALANCE ERROR:",
              err.message
            );

            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }


          // ======================================
          // TOTAL STUDENTS
          // ======================================

          db.get(
            `
            SELECT COUNT(*) AS totalStudents
            FROM students
            WHERE school_id = ?
            `,
            [
              schoolId,
            ],
            (err, studentRow) => {

              if (err) {
                return res.status(500).json({
                  success: false,
                  message: err.message,
                });
              }


              // ======================================
              // NEW STUDENTS
              // ======================================

              db.get(
                `
                SELECT COUNT(*) AS newStudents
                FROM students
                WHERE date(created_at)
                BETWEEN ? AND ?
                  AND school_id = ?
                `,
                [
                  startDate,
                  endDate,
                  schoolId,
                ],
                (err, newStudentRow) => {

                  if (err) {
                    return res.status(500).json({
                      success: false,
                      message: err.message,
                    });
                  }


                  // ======================================
                  // ACTIVE STUDENTS
                  // ======================================

                  db.get(
                    `
                    SELECT COUNT(*) AS activeStudents
                    FROM students
                    WHERE status = 'Active'
                      AND school_id = ?
                    `,
                    [
                      schoolId,
                    ],
                    (err, activeStudentRow) => {

                      if (err) {
                        return res.status(500).json({
                          success: false,
                          message: err.message,
                        });
                      }


                      // ======================================
                      // STUDENTS WITH BALANCE
                      // ======================================

                      db.get(
                        `
                        SELECT COUNT(*) AS studentsWithBalance
                        FROM students
                        WHERE (courseFee - amountPaid) > 0
                          AND school_id = ?
                        `,
                        [
                          schoolId,
                        ],
                        (err, balanceStudentRow) => {

                          if (err) {
                            return res.status(500).json({
                              success: false,
                              message: err.message,
                            });
                          }


                          // ======================================
                          // TOTAL LESSONS
                          // ======================================

                          db.get(
                            `
                            SELECT COUNT(*) AS totalLessons
                            FROM lessons
                            WHERE lesson_date BETWEEN ? AND ?
                              AND school_id = ?
                            `,
                            [
                              startDate,
                              endDate,
                              schoolId,
                            ],
                            (err, lessonRow) => {

                              if (err) {
                                return res.status(500).json({
                                  success: false,
                                  message: err.message,
                                });
                              }


                              // ======================================
                              // COMPLETED LESSONS
                              // ======================================

                              db.get(
                                `
                                SELECT COUNT(*) AS completedLessons
                                FROM lessons
                                WHERE lesson_date BETWEEN ? AND ?
                                  AND status = 'Completed'
                                  AND school_id = ?
                                `,
                                [
                                  startDate,
                                  endDate,
                                  schoolId,
                                ],
                                (err, completedRow) => {

                                  if (err) {
                                    return res.status(500).json({
                                      success: false,
                                      message: err.message,
                                    });
                                  }


                                  // ======================================
                                  // BOOKED LESSONS
                                  // ======================================

                                  db.get(
                                    `
                                    SELECT COUNT(*) AS bookedLessons
                                    FROM lessons
                                    WHERE lesson_date BETWEEN ? AND ?
                                      AND status = 'Booked'
                                      AND school_id = ?
                                    `,
                                    [
                                      startDate,
                                      endDate,
                                      schoolId,
                                    ],
                                    (err, bookedRow) => {

                                      if (err) {
                                        return res.status(500).json({
                                          success: false,
                                          message: err.message,
                                        });
                                      }


                                      // ======================================
                                      // CANCELLED LESSONS
                                      // ======================================

                                      db.get(
                                        `
                                        SELECT COUNT(*) AS cancelledLessons
                                        FROM lessons
                                        WHERE lesson_date BETWEEN ? AND ?
                                          AND status = 'Cancelled'
                                          AND school_id = ?
                                        `,
                                        [
                                          startDate,
                                          endDate,
                                          schoolId,
                                        ],
                                        (err, cancelledRow) => {

                                          if (err) {
                                            return res.status(500).json({
                                              success: false,
                                              message: err.message,
                                            });
                                          }


                                          // ======================================
                                          // PAYMENT METHOD BREAKDOWN
                                          // ======================================

                                          db.all(
                                            `
                                            SELECT
                                              paymentMethod,
                                              IFNULL(
                                                SUM(amount),
                                                0
                                              ) AS amount,
                                              COUNT(*) AS count
                                            FROM payments
                                            WHERE paymentDate BETWEEN ? AND ?
                                              AND school_id = ?
                                            GROUP BY paymentMethod
                                            ORDER BY amount DESC
                                            `,
                                            [
                                              startDate,
                                              endDate,
                                              schoolId,
                                            ],
                                            (err, paymentMethods) => {

                                              if (err) {
                                                return res.status(500).json({
                                                  success: false,
                                                  message: err.message,
                                                });
                                              }


                                              // ======================================
                                              // LESSONS BY INSTRUCTOR
                                              // ======================================

                                              db.all(
                                                `
                                                SELECT
                                                  instructor,
                                                  COUNT(*) AS totalLessons,

                                                  SUM(
                                                    CASE
                                                      WHEN status = 'Completed'
                                                      THEN 1
                                                      ELSE 0
                                                    END
                                                  ) AS completedLessons,

                                                  SUM(
                                                    CASE
                                                      WHEN status = 'Booked'
                                                      THEN 1
                                                      ELSE 0
                                                    END
                                                  ) AS bookedLessons,

                                                  SUM(
                                                    CASE
                                                      WHEN status = 'Cancelled'
                                                      THEN 1
                                                      ELSE 0
                                                    END
                                                  ) AS cancelledLessons

                                                FROM lessons

                                                WHERE lesson_date
                                                BETWEEN ? AND ?

                                                  AND school_id = ?

                                                GROUP BY instructor

                                                ORDER BY totalLessons DESC
                                                `,
                                                [
                                                  startDate,
                                                  endDate,
                                                  schoolId,
                                                ],
                                                (err, instructorRows) => {

                                                  if (err) {
                                                    return res.status(500).json({
                                                      success: false,
                                                      message: err.message,
                                                    });
                                                  }


                                                  // ======================================
                                                  // LESSONS BY VEHICLE
                                                  // ======================================

                                                  db.all(
                                                    `
                                                    SELECT
                                                      vehicle,
                                                      COUNT(*) AS totalLessons,

                                                      SUM(
                                                        CASE
                                                          WHEN status = 'Completed'
                                                          THEN 1
                                                          ELSE 0
                                                        END
                                                      ) AS completedLessons,

                                                      SUM(
                                                        CASE
                                                          WHEN status = 'Booked'
                                                          THEN 1
                                                          ELSE 0
                                                        END
                                                      ) AS bookedLessons,

                                                      SUM(
                                                        CASE
                                                          WHEN status = 'Cancelled'
                                                          THEN 1
                                                          ELSE 0
                                                        END
                                                      ) AS cancelledLessons

                                                    FROM lessons

                                                    WHERE lesson_date
                                                    BETWEEN ? AND ?

                                                      AND school_id = ?

                                                    GROUP BY vehicle

                                                    ORDER BY totalLessons DESC
                                                    `,
                                                    [
                                                      startDate,
                                                      endDate,
                                                      schoolId,
                                                    ],
                                                    (err, vehicleRows) => {

                                                      if (err) {
                                                        return res.status(500).json({
                                                          success: false,
                                                          message: err.message,
                                                        });
                                                      }


                                                      // ======================================
                                                      // SEND REPORT
                                                      // ======================================

                                                      res.json({

                                                        success: true,

                                                        school_id:
                                                          schoolId,

                                                        startDate,

                                                        endDate,


                                                        // ==================================
                                                        // FINANCIAL
                                                        // ==================================

                                                        totalIncome:
                                                          Number(
                                                            paymentRow?.totalIncome || 0
                                                          ),

                                                        totalPayments:
                                                          Number(
                                                            paymentRow?.totalPayments || 0
                                                          ),

                                                        outstandingBalance:
                                                          Number(
                                                            balanceRow?.outstandingBalance || 0
                                                          ),


                                                        // ==================================
                                                        // STUDENTS
                                                        // ==================================

                                                        totalStudents:
                                                          Number(
                                                            studentRow?.totalStudents || 0
                                                          ),

                                                        newStudents:
                                                          Number(
                                                            newStudentRow?.newStudents || 0
                                                          ),

                                                        activeStudents:
                                                          Number(
                                                            activeStudentRow?.activeStudents || 0
                                                          ),

                                                        studentsWithBalance:
                                                          Number(
                                                            balanceStudentRow?.studentsWithBalance || 0
                                                          ),


                                                        // ==================================
                                                        // LESSONS
                                                        // ==================================

                                                        totalLessons:
                                                          Number(
                                                            lessonRow?.totalLessons || 0
                                                          ),

                                                        completedLessons:
                                                          Number(
                                                            completedRow?.completedLessons || 0
                                                          ),

                                                        bookedLessons:
                                                          Number(
                                                            bookedRow?.bookedLessons || 0
                                                          ),

                                                        cancelledLessons:
                                                          Number(
                                                            cancelledRow?.cancelledLessons || 0
                                                          ),


                                                        // ==================================
                                                        // PAYMENT METHODS
                                                        // ==================================

                                                        paymentMethods:
                                                          paymentMethods || [],


                                                        // ==================================
                                                        // INSTRUCTORS
                                                        // ==================================

                                                        instructors:
                                                          instructorRows || [],


                                                        // ==================================
                                                        // VEHICLES
                                                        // ==================================

                                                        vehicles:
                                                          vehicleRows || [],

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
        }
      );
    }
  );
};