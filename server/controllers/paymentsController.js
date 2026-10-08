import db from "../database/database.js";

// =====================================================
// FINANCIAL ACCESS ROLES
// =====================================================

const FINANCIAL_ROLES = [
  "administrator",
  "admin",
  "system administrator",
  "receptionist",
];


// =====================================================
// GET AUTHENTICATED USER ROLE
// =====================================================

const getUserRole = (req) => {
  return String(req.user?.role || "")
    .trim()
    .toLowerCase();
};


// =====================================================
// GET AUTHENTICATED SCHOOL ID
// =====================================================

const getAuthenticatedSchoolId = (req) => {
  return Number(req.user?.school_id) || 0;
};


// =====================================================
// CHECK FINANCIAL ACCESS
// =====================================================

const hasFinancialAccess = (req) => {
  const role = getUserRole(req);

  return FINANCIAL_ROLES.includes(role);
};


// =====================================================
// FIND STUDENT LINKED TO LOGGED-IN STUDENT USER
// =====================================================

const getLoggedInStudent = (req, callback) => {

  const userId = Number(req.user?.id);
  const schoolId = getAuthenticatedSchoolId(req);

  if (!userId || !schoolId) {
    return callback(
      null,
      null,
      "Student account is not properly linked to a school."
    );
  }

  db.get(
    `
    SELECT *
    FROM students
    WHERE user_id = ?
      AND school_id = ?
    LIMIT 1
    `,
    [
      userId,
      schoolId,
    ],
    (err, student) => {

      if (err) {
        return callback(
          err,
          null,
          null
        );
      }

      if (!student) {
        return callback(
          null,
          null,
          "Student profile could not be found."
        );
      }

      callback(
        null,
        student,
        null
      );
    }
  );
};


// =====================================================
// CHECK WHETHER REQUESTED STUDENT BELONGS TO SCHOOL
// =====================================================

const verifyStudentSchool = (
  studentId,
  schoolId,
  callback
) => {

  db.get(
    `
    SELECT *
    FROM students
    WHERE id = ?
      AND school_id = ?
    LIMIT 1
    `,
    [
      studentId,
      schoolId,
    ],
    callback
  );
};


// =====================================================
// GET ALL PAYMENTS
// =====================================================

export const getPayments = (req, res) => {

  const role = getUserRole(req);
  const schoolId = getAuthenticatedSchoolId(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message:
        "Authenticated school could not be determined.",
    });
  }


  // ===================================================
  // STUDENT
  // A STUDENT MAY ONLY SEE THEIR OWN PAYMENTS
  // ===================================================

  if (role === "student") {

    return getLoggedInStudent(
      req,
      (studentErr, student, studentMessage) => {

        if (studentErr) {

          console.error(
            "GET LOGGED-IN STUDENT PAYMENTS ERROR:",
            studentErr.message
          );

          return res.status(500).json({
            success: false,
            message: studentErr.message,
          });
        }

        if (!student) {

          return res.status(404).json({
            success: false,
            message:
              studentMessage ||
              "Student profile not found.",
          });
        }


        db.all(
          `
          SELECT *
          FROM payments
          WHERE studentId = ?
            AND school_id = ?
          ORDER BY paymentDate DESC, id DESC
          `,
          [
            student.id,
            schoolId,
          ],
          (err, rows) => {

            if (err) {

              console.error(
                "GET STUDENT OWN PAYMENTS ERROR:",
                err.message
              );

              return res.status(500).json({
                success: false,
                message: err.message,
              });
            }

            return res.json(
              rows || []
            );
          }
        );
      }
    );
  }


  // ===================================================
  // INSTRUCTOR
  // INSTRUCTORS CANNOT VIEW FINANCIAL INFORMATION
  // ===================================================

  if (role === "instructor") {

    return res.status(403).json({
      success: false,
      message:
        "Instructors are not allowed to view financial information.",
    });
  }


  // ===================================================
  // ADMINISTRATOR / RECEPTIONIST
  // ===================================================

  if (!hasFinancialAccess(req)) {

    return res.status(403).json({
      success: false,
      message:
        "Financial access is not permitted for this account.",
    });
  }


  db.all(
    `
    SELECT *
    FROM payments
    WHERE school_id = ?
    ORDER BY id DESC
    `,
    [
      schoolId,
    ],
    (err, rows) => {

      if (err) {

        console.error(
          "GET PAYMENTS ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json(
        rows || []
      );
    }
  );
};


// =====================================================
// GET PAYMENTS FOR ONE STUDENT
// =====================================================

export const getStudentPayments = (
  req,
  res
) => {

  const requestedStudentId =
    Number(req.params.studentId);

  const role = getUserRole(req);
  const schoolId =
    getAuthenticatedSchoolId(req);


  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "Authenticated school could not be determined.",
    });
  }


  if (!requestedStudentId) {

    return res.status(400).json({
      success: false,
      message:
        "Invalid student ID.",
    });
  }


  // ===================================================
  // STUDENT
  // FORCE STUDENT TO THEIR OWN STUDENT RECORD
  // ===================================================

  if (role === "student") {

    return getLoggedInStudent(
      req,
      (studentErr, student, studentMessage) => {

        if (studentErr) {

          console.error(
            "GET STUDENT PAYMENT PROFILE ERROR:",
            studentErr.message
          );

          return res.status(500).json({
            success: false,
            message: studentErr.message,
          });
        }


        if (!student) {

          return res.status(404).json({
            success: false,
            message:
              studentMessage ||
              "Student profile not found.",
          });
        }


        // =============================================
        // IMPORTANT SECURITY CHECK
        //
        // The studentId in the URL is NOT trusted.
        // It must match the authenticated student's ID.
        // =============================================

        if (
          Number(student.id) !==
          requestedStudentId
        ) {

          return res.status(403).json({
            success: false,
            message:
              "You are only allowed to view your own payment information.",
          });
        }


        db.all(
          `
          SELECT *
          FROM payments
          WHERE studentId = ?
            AND school_id = ?
          ORDER BY paymentDate DESC, id DESC
          `,
          [
            student.id,
            schoolId,
          ],
          (err, rows) => {

            if (err) {

              console.error(
                "GET OWN STUDENT PAYMENTS ERROR:",
                err.message
              );

              return res.status(500).json({
                success: false,
                message: err.message,
              });
            }

            res.json(
              rows || []
            );
          }
        );
      }
    );
  }


  // ===================================================
  // INSTRUCTOR
  // ===================================================

  if (role === "instructor") {

    return res.status(403).json({
      success: false,
      message:
        "Instructors are not allowed to view student financial information.",
    });
  }


  // ===================================================
  // ADMIN / RECEPTIONIST
  // ===================================================

  if (!hasFinancialAccess(req)) {

    return res.status(403).json({
      success: false,
      message:
        "Financial access is not permitted for this account.",
    });
  }


  // ===================================================
  // VERIFY STUDENT BELONGS TO AUTHENTICATED SCHOOL
  // ===================================================

  verifyStudentSchool(
    requestedStudentId,
    schoolId,
    (studentErr, student) => {

      if (studentErr) {

        console.error(
          "VERIFY PAYMENT STUDENT ERROR:",
          studentErr.message
        );

        return res.status(500).json({
          success: false,
          message: studentErr.message,
        });
      }


      if (!student) {

        return res.status(404).json({
          success: false,
          message:
            "Student not found for this school.",
        });
      }


      db.all(
        `
        SELECT *
        FROM payments
        WHERE studentId = ?
          AND school_id = ?
        ORDER BY paymentDate DESC, id DESC
        `,
        [
          requestedStudentId,
          schoolId,
        ],
        (err, rows) => {

          if (err) {

            console.error(
              "GET STUDENT PAYMENTS ERROR:",
              err.message
            );

            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }

          res.json(
            rows || []
          );
        }
      );
    }
  );
};


// =====================================================
// ADD PAYMENT
// ADMIN / RECEPTIONIST ONLY
// =====================================================

export const addPayment = (
  req,
  res
) => {

  if (!hasFinancialAccess(req)) {

    return res.status(403).json({
      success: false,
      message:
        "You are not allowed to add payments.",
    });
  }


  const schoolId =
    getAuthenticatedSchoolId(req);


  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "Authenticated school could not be determined.",
    });
  }


  const {
    receiptNo,
    studentId,
    studentName,
    paymentDate,
    paymentMethod,
    amount,
    reference,
    notes,
  } = req.body;


  // ===================================================
  // CHECK THAT STUDENT BELONGS TO AUTHENTICATED SCHOOL
  // ===================================================

  verifyStudentSchool(
    studentId,
    schoolId,
    (studentErr, student) => {

      if (studentErr) {

        console.error(
          "CHECK STUDENT PAYMENT ERROR:",
          studentErr.message
        );

        return res.status(500).json({
          success: false,
          message: studentErr.message,
        });
      }


      if (!student) {

        return res.status(404).json({
          success: false,
          message:
            "Student not found for this school.",
        });
      }


      // =================================================
      // INSERT PAYMENT
      // =================================================

      db.run(
        `
        INSERT INTO payments
        (
          receiptNo,
          studentId,
          studentName,
          paymentDate,
          paymentMethod,
          amount,
          reference,
          notes,
          school_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          receiptNo,
          studentId,
          studentName,
          paymentDate,
          paymentMethod,
          amount,
          reference,
          notes,
          schoolId,
        ],
        function (err) {

          if (err) {

            console.error(
              "ADD PAYMENT ERROR:",
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
                  "This receipt number already exists.",
              });
            }

            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }


          const paymentId =
            this.lastID;


          // ==========================================
          // UPDATE STUDENT BALANCE
          // ==========================================

          db.run(
            `
            UPDATE students
            SET
              amountPaid =
                COALESCE(amountPaid, 0) + ?,

              balance =
                COALESCE(courseFee, 0)
                -
                (
                  COALESCE(amountPaid, 0) + ?
                )
            WHERE id = ?
              AND school_id = ?
            `,
            [
              Number(amount) || 0,
              Number(amount) || 0,
              studentId,
              schoolId,
            ],
            function (updateErr) {

              if (updateErr) {

                console.error(
                  "UPDATE STUDENT PAYMENT ERROR:",
                  updateErr.message
                );

                return res.status(500).json({
                  success: false,
                  message:
                    updateErr.message,
                });
              }


              res.json({
                success: true,
                id: paymentId,
                message:
                  "Payment added successfully.",
              });
            }
          );
        }
      );
    }
  );
};


// =====================================================
// UPDATE PAYMENT
// ADMIN / RECEPTIONIST ONLY
// =====================================================

export const updatePayment = (
  req,
  res
) => {

  if (!hasFinancialAccess(req)) {

    return res.status(403).json({
      success: false,
      message:
        "You are not allowed to update payments.",
    });
  }


  const {
    id,
  } = req.params;


  const schoolId =
    getAuthenticatedSchoolId(req);


  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "Authenticated school could not be determined.",
    });
  }


  const {
    receiptNo,
    studentId,
    studentName,
    paymentDate,
    paymentMethod,
    amount,
    reference,
    notes,
  } = req.body;


  // ===================================================
  // FIRST GET THE OLD PAYMENT
  // ===================================================

  db.get(
    `
    SELECT *
    FROM payments
    WHERE id = ?
      AND school_id = ?
    `,
    [
      id,
      schoolId,
    ],
    (paymentErr, oldPayment) => {

      if (paymentErr) {

        console.error(
          "GET OLD PAYMENT ERROR:",
          paymentErr.message
        );

        return res.status(500).json({
          success: false,
          message: paymentErr.message,
        });
      }


      if (!oldPayment) {

        return res.status(404).json({
          success: false,
          message:
            "Payment not found for this school.",
        });
      }


      // =================================================
      // CHECK NEW STUDENT
      // =================================================

      verifyStudentSchool(
        studentId,
        schoolId,
        (studentErr, student) => {

          if (studentErr) {

            console.error(
              "CHECK PAYMENT STUDENT ERROR:",
              studentErr.message
            );

            return res.status(500).json({
              success: false,
              message: studentErr.message,
            });
          }


          if (!student) {

            return res.status(404).json({
              success: false,
              message:
                "Student not found for this school.",
            });
          }


          // ===========================================
          // UPDATE PAYMENT
          // ===========================================

          db.run(
            `
            UPDATE payments
            SET
              receiptNo = ?,
              studentId = ?,
              studentName = ?,
              paymentDate = ?,
              paymentMethod = ?,
              amount = ?,
              reference = ?,
              notes = ?
            WHERE id = ?
              AND school_id = ?
            `,
            [
              receiptNo,
              studentId,
              studentName,
              paymentDate,
              paymentMethod,
              amount,
              reference,
              notes,
              id,
              schoolId,
            ],
            function (err) {

              if (err) {

                console.error(
                  "UPDATE PAYMENT ERROR:",
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
                      "This receipt number already exists.",
                  });
                }

                return res.status(500).json({
                  success: false,
                  message: err.message,
                });
              }


              // ========================================
              // REMOVE OLD PAYMENT FROM OLD STUDENT
              // ========================================

              db.run(
                `
                UPDATE students
                SET
                  amountPaid =
                    COALESCE(amountPaid, 0) - ?,

                  balance =
                    COALESCE(courseFee, 0)
                    -
                    (
                      COALESCE(amountPaid, 0) - ?
                    )
                WHERE id = ?
                  AND school_id = ?
                `,
                [
                  Number(oldPayment.amount) || 0,
                  Number(oldPayment.amount) || 0,
                  oldPayment.studentId,
                  schoolId,
                ],
                function (oldStudentErr) {

                  if (oldStudentErr) {

                    console.error(
                      "OLD STUDENT BALANCE ERROR:",
                      oldStudentErr.message
                    );

                    return res.status(500).json({
                      success: false,
                      message:
                        oldStudentErr.message,
                    });
                  }


                  // ====================================
                  // ADD NEW PAYMENT TO NEW STUDENT
                  // ====================================

                  db.run(
                    `
                    UPDATE students
                    SET
                      amountPaid =
                        COALESCE(amountPaid, 0) + ?,

                      balance =
                        COALESCE(courseFee, 0)
                        -
                        (
                          COALESCE(amountPaid, 0) + ?
                        )
                    WHERE id = ?
                      AND school_id = ?
                    `,
                    [
                      Number(amount) || 0,
                      Number(amount) || 0,
                      studentId,
                      schoolId,
                    ],
                    function (newStudentErr) {

                      if (newStudentErr) {

                        console.error(
                          "NEW STUDENT BALANCE ERROR:",
                          newStudentErr.message
                        );

                        return res.status(500).json({
                          success: false,
                          message:
                            newStudentErr.message,
                        });
                      }


                      res.json({
                        success: true,
                        message:
                          "Payment updated successfully.",
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
};


// =====================================================
// DELETE PAYMENT
// ADMIN / RECEPTIONIST ONLY
// =====================================================

export const deletePayment = (
  req,
  res
) => {

  if (!hasFinancialAccess(req)) {

    return res.status(403).json({
      success: false,
      message:
        "You are not allowed to delete payments.",
    });
  }


  const {
    id,
  } = req.params;


  const schoolId =
    getAuthenticatedSchoolId(req);


  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "Authenticated school could not be determined.",
    });
  }


  // ===================================================
  // GET PAYMENT BEFORE DELETING
  // ===================================================

  db.get(
    `
    SELECT *
    FROM payments
    WHERE id = ?
      AND school_id = ?
    `,
    [
      id,
      schoolId,
    ],
    (paymentErr, payment) => {

      if (paymentErr) {

        console.error(
          "GET PAYMENT BEFORE DELETE ERROR:",
          paymentErr.message
        );

        return res.status(500).json({
          success: false,
          message: paymentErr.message,
        });
      }


      if (!payment) {

        return res.status(404).json({
          success: false,
          message:
            "Payment not found for this school.",
        });
      }


      // =================================================
      // DELETE PAYMENT
      // =================================================

      db.run(
        `
        DELETE FROM payments
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
              "DELETE PAYMENT ERROR:",
              err.message
            );

            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }


          // ============================================
          // RESTORE STUDENT BALANCE
          // ============================================

          db.run(
            `
            UPDATE students
            SET
              amountPaid =
                COALESCE(amountPaid, 0) - ?,

              balance =
                COALESCE(courseFee, 0)
                -
                (
                  COALESCE(amountPaid, 0) - ?
                )
            WHERE id = ?
              AND school_id = ?
            `,
            [
              Number(payment.amount) || 0,
              Number(payment.amount) || 0,
              payment.studentId,
              schoolId,
            ],
            function (updateErr) {

              if (updateErr) {

                console.error(
                  "RESTORE STUDENT BALANCE ERROR:",
                  updateErr.message
                );

                return res.status(500).json({
                  success: false,
                  message:
                    updateErr.message,
                });
              }


              res.json({
                success: true,
                message:
                  "Payment deleted successfully.",
              });
            }
          );
        }
      );
    }
  );
};