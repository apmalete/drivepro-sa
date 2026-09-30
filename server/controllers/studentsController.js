import db from "../database/database.js";

// =====================================================
// GET SCHOOL ID FROM AUTHENTICATED USER
// =====================================================

const getSchoolId = (req) => {

  const schoolId = Number(
    req.user?.school_id
  );

  if (!schoolId) {
    return null;
  }

  return schoolId;
};

// =====================================================
// GET USER ROLE
// =====================================================

const getRole = (req) => {

  return String(
    req.user?.role || ""
  )
    .trim()
    .toLowerCase();
};

// =====================================================
// GET USER NAME
// =====================================================

const getUserName = (req) => {

  return String(
    req.user?.fullname ||
    req.user?.username ||
    ""
  ).trim();
};

// =====================================================
// GET USER ID
// =====================================================

const getUserId = (req) => {

  const userId = Number(
    req.user?.id
  );

  if (!userId) {
    return null;
  }

  return userId;
};

// =====================================================
// CHECK ADMINISTRATOR
// =====================================================

const isAdministrator = (req) => {

  const role = getRole(req);

  return (
    role === "administrator" ||
    role === "admin" ||
    role === "system administrator"
  );
};

// =====================================================
// CHECK INSTRUCTOR
// =====================================================

const isInstructor = (req) => {

  return (
    getRole(req) === "instructor"
  );
};

// =====================================================
// CHECK STUDENT
// =====================================================

const isStudent = (req) => {

  return (
    getRole(req) === "student"
  );
};

// =====================================================
// GET STUDENTS
// =====================================================

export const getStudents = (req, res) => {

  const schoolId =
    getSchoolId(req);

  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });
  }

  const role = getRole(req);

  const userName =
    getUserName(req);

  const userId =
    getUserId(req);

  // ===================================================
  // ADMINISTRATOR
  // ===================================================

  if (isAdministrator(req)) {

    return db.all(
      `
      SELECT *
      FROM students
      WHERE school_id = ?
      ORDER BY id DESC
      `,
      [schoolId],
      (err, rows) => {

        if (err) {

          console.error(
            "GET STUDENTS ERROR:",
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

  // ===================================================
  // INSTRUCTOR
  // ===================================================

  if (isInstructor(req)) {

    return db.all(
      `
      SELECT *
      FROM students
      WHERE school_id = ?
        AND LOWER(TRIM(instructor))
            = LOWER(TRIM(?))
      ORDER BY id DESC
      `,
      [
        schoolId,
        userName,
      ],
      (err, rows) => {

        if (err) {

          console.error(
            "GET INSTRUCTOR STUDENTS ERROR:",
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

  // ===================================================
  // STUDENT
  // ===================================================

  if (isStudent(req)) {

    /*
      STUDENT LOOKUP ORDER:

      1. user_id
      2. studentNo
      3. learnerNumber
      4. learnerCode
      5. fullname
    */

    return db.all(
      `
      SELECT *
      FROM students

      WHERE school_id = ?

        AND
        (
          user_id = ?

          OR

          (
            user_id IS NULL
            AND studentNo IS NOT NULL
            AND LOWER(TRIM(studentNo)) =
                LOWER(TRIM(?))
          )

          OR

          (
            user_id IS NULL
            AND learnerNumber IS NOT NULL
            AND LOWER(TRIM(learnerNumber)) =
                LOWER(TRIM(?))
          )

          OR

          (
            user_id IS NULL
            AND learnerCode IS NOT NULL
            AND LOWER(TRIM(learnerCode)) =
                LOWER(TRIM(?))
          )

          OR

          (
            user_id IS NULL
            AND fullname IS NOT NULL
            AND LOWER(TRIM(fullname)) =
                LOWER(TRIM(?))
          )
        )

      ORDER BY

        CASE

          WHEN user_id = ?
          THEN 1

          WHEN
            user_id IS NULL
            AND LOWER(TRIM(studentNo)) =
                LOWER(TRIM(?))
          THEN 2

          WHEN
            user_id IS NULL
            AND LOWER(TRIM(learnerNumber)) =
                LOWER(TRIM(?))
          THEN 3

          WHEN
            user_id IS NULL
            AND LOWER(TRIM(learnerCode)) =
                LOWER(TRIM(?))
          THEN 4

          WHEN
            user_id IS NULL
            AND LOWER(TRIM(fullname)) =
                LOWER(TRIM(?))
          THEN 5

          ELSE 99

        END
      `,
      [

        // School
        schoolId,

        // User ID
        userId,

        // Student number
        req.user?.username,

        // Learner number
        req.user?.username,

        // Learner code
        req.user?.username,

        // Full name
        req.user?.fullname,

        // ORDER BY user ID
        userId,

        // ORDER BY student number
        req.user?.username,

        // ORDER BY learner number
        req.user?.username,

        // ORDER BY learner code
        req.user?.username,

        // ORDER BY fullname
        req.user?.fullname,

      ],
      (err, rows) => {

        if (err) {

          console.error(
            "GET STUDENT PROFILE ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        // =================================================
        // AUTOMATICALLY LINK STUDENT TO USER
        // =================================================

        if (
          rows &&
          rows.length > 0 &&
          userId
        ) {

          const student =
            rows[0];

          if (
            Number(student.user_id) !== userId
          ) {

            db.run(
              `
              UPDATE students
              SET user_id = ?
              WHERE id = ?
                AND school_id = ?
                AND (
                  user_id IS NULL
                  OR user_id = ?
                )
              `,
              [
                userId,
                student.id,
                schoolId,
                userId,
              ],
              (linkErr) => {

                if (linkErr) {

                  console.error(
                    "STUDENT USER LINK ERROR:",
                    linkErr.message
                  );

                  return res.json(
                    rows || []
                  );
                }

                student.user_id =
                  userId;

                console.log(
                  `Student ${student.id} linked to user ${userId}`
                );

                return res.json(
                  rows || []
                );
              }
            );

            return;
          }
        }

        return res.json(
          rows || []
        );
      }
    );
  }

  // ===================================================
  // UNKNOWN / UNSUPPORTED ROLE
  // ===================================================

  return res.status(403).json({
    success: false,
    message:
      "You do not have permission to view students.",
  });
};

// =====================================================
// ADD STUDENT
// =====================================================

export const addStudent = (req, res) => {

  const schoolId =
    getSchoolId(req);

  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });
  }

  // ===================================================
  // ONLY ADMINISTRATORS CAN ADD STUDENTS
  // ===================================================

  if (!isAdministrator(req)) {

    return res.status(403).json({
      success: false,
      message:
        "Only administrators can add students.",
    });
  }

  console.log(
    "Student received:",
    req.body
  );

  // ===================================================
  // STUDENT DATA
  // ===================================================

  const {
    user_id,
    studentNo,
    fullname,
    idNumber,
    gender,
    phone,
    email,
    address,
    learnerNumber,
    learnerCode,
    learnerStatus,
    licenceCode,
    licenceStatus,
    instructor,
    vehicle,
    courseFee,
    amountPaid,
    balance,
    photo,
    status,
  } = req.body;

  // ===================================================
  // CLEAN DATA
  // ===================================================

  const suppliedUserId =
    user_id
      ? Number(user_id)
      : null;

  const cleanPhone =
    String(phone || "").trim();

  const cleanFullname =
    String(fullname || "").trim();

  // ===================================================
  // FIND EXISTING STUDENT ACCOUNT
  //
  // PRIORITY:
  //
  // 1. Explicit user_id
  // 2. Phone number = username
  // 3. Exact fullname
  //
  // Matching is restricted to the same school.
  // ===================================================

  const findStudentUser = (callback) => {

    // -------------------------------------------------
    // 1. EXPLICIT USER ID
    // -------------------------------------------------

    if (suppliedUserId) {

      return db.get(
        `
        SELECT
          id,
          fullname,
          username,
          role,
          school_id

        FROM users

        WHERE id = ?
          AND school_id = ?
          AND LOWER(TRIM(role)) = 'student'

        LIMIT 1
        `,
        [
          suppliedUserId,
          schoolId,
        ],
        (err, user) => {

          if (err) {

            console.error(
              "FIND STUDENT USER ERROR:",
              err.message
            );

            return callback(
              err,
              null
            );
          }

          if (user) {

            return callback(
              null,
              user
            );
          }

          return callback(
            null,
            null
          );
        }
      );
    }

    // -------------------------------------------------
    // 2. MATCH BY PHONE NUMBER
    //
    // Student accounts normally use their phone
    // number as username.
    // -------------------------------------------------

    if (cleanPhone) {

      return db.get(
        `
        SELECT
          id,
          fullname,
          username,
          role,
          school_id

        FROM users

        WHERE school_id = ?
          AND LOWER(TRIM(role)) = 'student'
          AND LOWER(TRIM(username)) =
              LOWER(TRIM(?))

        LIMIT 1
        `,
        [
          schoolId,
          cleanPhone,
        ],
        (err, user) => {

          if (err) {

            console.error(
              "FIND STUDENT USER BY PHONE ERROR:",
              err.message
            );

            return callback(
              err,
              null
            );
          }

          if (user) {

            return callback(
              null,
              user
            );
          }

          // -------------------------------------------
          // 3. MATCH BY EXACT FULLNAME
          // -------------------------------------------

          if (!cleanFullname) {

            return callback(
              null,
              null
            );
          }

          return db.get(
            `
            SELECT
              id,
              fullname,
              username,
              role,
              school_id

            FROM users

            WHERE school_id = ?
              AND LOWER(TRIM(role)) = 'student'
              AND LOWER(TRIM(fullname)) =
                  LOWER(TRIM(?))

            LIMIT 1
            `,
            [
              schoolId,
              cleanFullname,
            ],
            (nameErr, nameUser) => {

              if (nameErr) {

                console.error(
                  "FIND STUDENT USER BY NAME ERROR:",
                  nameErr.message
                );

                return callback(
                  nameErr,
                  null
                );
              }

              return callback(
                null,
                nameUser || null
              );
            }
          );
        }
      );
    }

    // -------------------------------------------------
    // NO PHONE
    // TRY EXACT FULLNAME
    // -------------------------------------------------

    if (!cleanFullname) {

      return callback(
        null,
        null
      );
    }

    return db.get(
      `
      SELECT
        id,
        fullname,
        username,
        role,
        school_id

      FROM users

      WHERE school_id = ?
        AND LOWER(TRIM(role)) = 'student'
        AND LOWER(TRIM(fullname)) =
            LOWER(TRIM(?))

      LIMIT 1
      `,
      [
        schoolId,
        cleanFullname,
      ],
      (err, user) => {

        if (err) {

          console.error(
            "FIND STUDENT USER BY NAME ERROR:",
            err.message
          );

          return callback(
            err,
            null
          );
        }

        return callback(
          null,
          user || null
        );
      }
    );
  };

  // ===================================================
  // FIND USER
  // THEN INSERT STUDENT
  // ===================================================

  findStudentUser(
    (findErr, matchedUser) => {

      if (findErr) {

        return res.status(500).json({
          success: false,
          message:
            findErr.message,
        });
      }

      const finalUserId =
        matchedUser
          ? Number(matchedUser.id)
          : (
              suppliedUserId ||
              null
            );

      console.log(
        "Student account matching result:",
        matchedUser
          ? {
              userId: matchedUser.id,
              fullname: matchedUser.fullname,
              username: matchedUser.username,
              schoolId: matchedUser.school_id,
            }
          : "No existing Student account found"
      );

      // =================================================
      // INSERT STUDENT
      // =================================================

      db.run(
        `
        INSERT INTO students
        (
          user_id,
          studentNo,
          fullname,
          idNumber,
          gender,
          phone,
          email,
          address,
          learnerNumber,
          learnerCode,
          learnerStatus,
          licenceCode,
          licenceStatus,
          instructor,
          vehicle,
          courseFee,
          amountPaid,
          balance,
          photo,
          status,
          school_id
        )

        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
        `,
        [

          // Linked Student account
          finalUserId,

          studentNo || null,

          fullname,

          idNumber || null,

          gender || null,

          phone,

          email || null,

          address || null,

          learnerNumber || null,

          learnerCode || null,

          learnerStatus ||
            "Not Applicable",

          licenceCode || null,

          licenceStatus ||
            "Not Applicable",

          instructor || null,

          vehicle || null,

          Number(courseFee) || 0,

          Number(amountPaid) || 0,

          Number(balance) || 0,

          photo || null,

          status || "Active",

          schoolId,

        ],
        function (err) {

          if (err) {

            console.error(
              "ADD STUDENT ERROR:",
              err.message
            );

            return res.status(500).json({
              success: false,
              message:
                err.message,
            });
          }

          console.log(
            `Student ${this.lastID} added successfully`
          );

          if (finalUserId) {

            console.log(
              `Student ${this.lastID} linked to user ${finalUserId}`
            );
          }

          return res.json({

            success: true,

            message:
              finalUserId
                ? "Student added and account linked successfully"
                : "Student added successfully",

            id: this.lastID,

            user_id:
              finalUserId,

          });
        }
      );
    }
  );
};

// =====================================================
// UPDATE STUDENT
// =====================================================

export const updateStudent = (req, res) => {

  const schoolId =
    getSchoolId(req);

  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });
  }

  // ===================================================
  // ONLY ADMINISTRATORS CAN UPDATE STUDENTS
  // ===================================================

  if (!isAdministrator(req)) {

    return res.status(403).json({
      success: false,
      message:
        "Only administrators can update students.",
    });
  }

  // ===================================================
  // STUDENT DATA
  // ===================================================

  const {
    user_id,
    studentNo,
    fullname,
    idNumber,
    gender,
    phone,
    email,
    address,
    learnerNumber,
    learnerCode,
    learnerStatus,
    licenceCode,
    licenceStatus,
    instructor,
    vehicle,
    courseFee,
    amountPaid,
    balance,
    photo,
    status,
  } = req.body;

  // ===================================================
  // UPDATE STUDENT
  // ===================================================

  db.run(
    `
    UPDATE students

    SET
      user_id = ?,
      studentNo = ?,
      fullname = ?,
      idNumber = ?,
      gender = ?,
      phone = ?,
      email = ?,
      address = ?,
      learnerNumber = ?,
      learnerCode = ?,
      learnerStatus = ?,
      licenceCode = ?,
      licenceStatus = ?,
      instructor = ?,
      vehicle = ?,
      courseFee = ?,
      amountPaid = ?,
      balance = ?,
      photo = ?,
      status = ?

    WHERE id = ?
      AND school_id = ?
    `,
    [

      user_id
        ? Number(user_id)
        : null,

      studentNo || null,

      fullname,

      idNumber || null,

      gender || null,

      phone,

      email || null,

      address || null,

      learnerNumber || null,

      learnerCode || null,

      learnerStatus ||
        "Not Applicable",

      licenceCode || null,

      licenceStatus ||
        "Not Applicable",

      instructor || null,

      vehicle || null,

      Number(courseFee) || 0,

      Number(amountPaid) || 0,

      Number(balance) || 0,

      photo || null,

      status || "Active",

      req.params.id,

      schoolId,

    ],
    function (err) {

      if (err) {

        console.error(
          "UPDATE STUDENT ERROR:",
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
            "Student not found for this school.",
        });
      }

      console.log(
        `Student ${req.params.id} updated successfully`
      );

      return res.json({

        success: true,

        message:
          "Student updated successfully",

      });
    }
  );
};

// =====================================================
// DELETE STUDENT
// =====================================================

export const deleteStudent = (req, res) => {

  const schoolId =
    getSchoolId(req);

  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });
  }

  // ===================================================
  // ONLY ADMINISTRATORS CAN DELETE STUDENTS
  // ===================================================

  if (!isAdministrator(req)) {

    return res.status(403).json({
      success: false,
      message:
        "Only administrators can delete students.",
    });
  }

  // ===================================================
  // DELETE STUDENT
  // ===================================================

  db.run(
    `
    DELETE FROM students
    WHERE id = ?
      AND school_id = ?
    `,
    [
      req.params.id,
      schoolId,
    ],
    function (err) {

      if (err) {

        console.error(
          "DELETE STUDENT ERROR:",
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
            "Student not found for this school.",
        });
      }

      console.log(
        `Student ${req.params.id} deleted successfully`
      );

      return res.json({

        success: true,

        message:
          "Student deleted successfully",

      });
    }
  );
};