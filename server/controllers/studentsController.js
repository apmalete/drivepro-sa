import db from "../database/database.js";

// =====================================================
// GET SCHOOL ID FROM AUTHENTICATED USER
// =====================================================

const getSchoolId = (req) => {
  const schoolId =
    Number(req.user?.school_id);

  if (!schoolId) {
    return null;
  }

  return schoolId;
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

  db.all(
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

      res.json(rows || []);
    }
  );
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

  console.log(
    "Student received:",
    req.body
  );

  const {
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

  db.run(
    `
    INSERT INTO students
    (
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
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
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
      schoolId,
    ],    function (err) {

      if (err) {

        console.error(
          "ADD STUDENT ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        message:
          "Student added successfully",
        id: this.lastID,
      });
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

  const {
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

  db.run(
    `
    UPDATE students
    SET
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
      req.params.id,
      schoolId,
    ],    function (err) {

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

      res.json({
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

      res.json({
        success: true,
        message:
          "Student deleted successfully",
      });
    }
  );
};







