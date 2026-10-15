import db from "../database/database.js";

// =====================================================
// GET SCHOOL ID
// =====================================================

const getSchoolId = (req) => {
  return Number(req.query.school_id) || 1;
};


// =====================================================
// GET ALL PAYMENTS
// =====================================================

export const getPayments = (req, res) => {

  const schoolId = getSchoolId(req);

  db.all(
    `
    SELECT *
    FROM payments
    WHERE school_id = ?
    ORDER BY id DESC
    `,
    [schoolId],
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

      res.json(rows || []);
    }
  );
};


// =====================================================
// GET PAYMENTS FOR ONE STUDENT
// =====================================================

export const getStudentPayments = (req, res) => {

  const { studentId } = req.params;

  const schoolId = getSchoolId(req);

  db.all(
    `
    SELECT *
    FROM payments
    WHERE studentId = ?
      AND school_id = ?
    ORDER BY paymentDate DESC, id DESC
    `,
    [
      studentId,
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

      res.json(rows || []);
    }
  );
};


// =====================================================
// ADD PAYMENT
// =====================================================

export const addPayment = (req, res) => {

  const schoolId =
    Number(req.body.school_id) || 1;

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
  // CHECK THAT STUDENT BELONGS TO THIS SCHOOL
  // ===================================================

  db.get(
    `
    SELECT *
    FROM students
    WHERE id = ?
      AND school_id = ?
    `,
    [
      studentId,
      schoolId,
    ],
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
// =====================================================

export const updatePayment = (req, res) => {

  const { id } = req.params;

  const schoolId =
    Number(req.body.school_id) || 1;

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

      db.get(
        `
        SELECT *
        FROM students
        WHERE id = ?
          AND school_id = ?
        `,
        [
          studentId,
          schoolId,
        ],
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
// =====================================================

export const deletePayment = (req, res) => {

  const { id } = req.params;

  const schoolId =
    Number(req.query.school_id) || 1;


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