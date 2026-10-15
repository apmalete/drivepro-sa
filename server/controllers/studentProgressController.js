
import db from "../database/database.js";

const VALID_STATUSES = [
  "Not Assessed",
  "Needs Practice",
  "Improving",
  "Competent",
];

const SKILLS = [
  "Moving off and stopping",
  "Gear control",
  "Turning and observation",
  "Reversing",
  "Parking",
  "Mirrors and signalling",
];

const getRole = (req) =>
  String(req.user?.role || "").trim().toLowerCase();

const getSchoolId = (req) =>
  Number(req.user?.school_id);

const getUserId = (req) =>
  Number(req.user?.id);

const isInstructor = (req) =>
  getRole(req) === "instructor";

const isStudent = (req) =>
  getRole(req) === "student";

const isAdministrator = (req) =>
  [
    "administrator",
    "admin",
    "system administrator",
  ].includes(getRole(req));

const respondError = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

const getStudent = (studentId, callback) => {
  db.get(
    `SELECT id, fullname, instructor, school_id, user_id
     FROM students
     WHERE id = ?`,
    [studentId],
    callback
  );
};

const getInstructorProfile = (req, callback) => {
  db.get(
    `SELECT id, name, school_id
     FROM instructors
     WHERE user_id = ? AND school_id = ?`,
    [getUserId(req), getSchoolId(req)],
    callback
  );
};

const canAccessStudent = (req, student, callback) => {
  if (
    !student ||
    Number(student.school_id) !== getSchoolId(req)
  ) {
    return callback(null, false);
  }

  if (isAdministrator(req)) {
    return callback(null, true);
  }

  if (isStudent(req)) {
    return callback(
      null,
      Number(student.user_id) === getUserId(req)
    );
  }

  if (isInstructor(req)) {
    return getInstructorProfile(req, (err, instructor) => {
      if (err) return callback(err, false);
      if (!instructor) return callback(null, false);

      const assignedById =
        Number(student.instructor) === Number(instructor.id);

      const assignedByName =
        String(student.instructor || "").trim().toLowerCase() ===
        String(instructor.name || "").trim().toLowerCase();

      return callback(
        null,
        assignedById || assignedByName
      );
    });
  }

  return callback(null, false);
};

const validateAssessment = (body) => {
  const skill = String(body.skill || "").trim();
  const status = String(body.status || "").trim();
  const comments = String(body.comments || "").trim();

  if (!SKILLS.includes(skill)) {
    return { error: "Select a valid driving skill." };
  }

  if (!VALID_STATUSES.includes(status)) {
    return { error: "Select a valid assessment status." };
  }

  if (comments.length > 1000) {
    return {
      error: "Comments cannot exceed 1000 characters.",
    };
  }

  return { skill, status, comments };
};

// =====================================================
// GET /student-progress/student/:studentId
// Students can only retrieve their own linked record.
// Instructors and administrators retain their permissions.
// =====================================================

export const getStudentProgress = (req, res) => {
  const requestedStudentId = Number(req.params.studentId);

  const schoolId = getSchoolId(req);

  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    return respondError(
      res,
      403,
      "Your account is missing a valid school ID."
    );
  }

  const retrieveProgress = (student) => {
    if (!student) {
      return respondError(
        res,
        404,
        isStudent(req)
          ? "Your student account is not linked to a student record."
          : "Student not found."
      );
    }

    canAccessStudent(req, student, (accessErr, allowed) => {
      if (accessErr) {
        console.error(
          "PROGRESS ACCESS CHECK ERROR:",
          accessErr.message
        );

        return respondError(
          res,
          500,
          "Could not verify access."
        );
      }

      if (!allowed) {
        return respondError(
          res,
          403,
          "You cannot access this student's progress."
        );
      }

      db.all(
        `SELECT id, student_id, instructor_user_id, school_id,
                lesson_id, skill, status, comments, created_at
         FROM student_progress
         WHERE student_id = ? AND school_id = ?
         ORDER BY created_at DESC, id DESC`,
        [student.id, Number(student.school_id)],
        (err, rows) => {
          if (err) {
            console.error(
              "GET STUDENT PROGRESS ERROR:",
              err.message
            );

            return respondError(
              res,
              500,
              "Could not retrieve progress history."
            );
          }

          return res.json({
            success: true,
            student: {
              id: student.id,
              fullname: student.fullname,
            },
            skills: SKILLS,
            statuses: VALID_STATUSES,
            assessments: rows || [],
          });
        }
      );
    });
  };

  // For student logins, derive the student record from the
  // authenticated account instead of trusting the URL ID.
  if (isStudent(req)) {
    const userId = getUserId(req);

    if (!Number.isInteger(userId) || userId <= 0) {
      return respondError(
        res,
        403,
        "Your student login is missing a valid user ID."
      );
    }

    return db.get(
      `SELECT id, fullname, instructor, school_id, user_id
       FROM students
       WHERE user_id = ? AND school_id = ?`,
      [userId, schoolId],
      (err, student) => {
        if (err) {
          console.error(
            "STUDENT ACCOUNT LOOKUP ERROR:",
            err.message
          );

          return respondError(
            res,
            500,
            "Could not retrieve your student account."
          );
        }

        return retrieveProgress(student);
      }
    );
  }

  // Instructor and administrator requests still use the
  // requested student ID and the existing access checks.
  if (
    !Number.isInteger(requestedStudentId) ||
    requestedStudentId <= 0
  ) {
    return respondError(res, 400, "Invalid student ID.");
  }

  return getStudent(requestedStudentId, (err, student) => {
    if (err) {
      console.error(
        "PROGRESS STUDENT LOOKUP ERROR:",
        err.message
      );

      return respondError(
        res,
        500,
        "Could not retrieve student."
      );
    }

    return retrieveProgress(student);
  });
};

// =====================================================
// POST /student-progress
// Only instructors and administrators may record assessments.
// =====================================================

export const addStudentProgress = (req, res) => {
  const role = getRole(req);

  const canRecordAssessment = [
    "instructor",
    "administrator",
    "admin",
    "system administrator",
  ].includes(role);

  if (!canRecordAssessment) {
    return respondError(
      res,
      403,
      "You do not have permission to record assessments."
    );
  }

  const schoolId = getSchoolId(req);
  const userId = getUserId(req);

  if (
    !Number.isInteger(schoolId) ||
    schoolId <= 0 ||
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    return respondError(
      res,
      403,
      "Your account is missing a valid user or school ID."
    );
  }

  const studentId = Number(req.body.student_id);

  const lessonId =
    req.body.lesson_id == null || req.body.lesson_id === ""
      ? null
      : Number(req.body.lesson_id);

  const assessment = validateAssessment(req.body);

  if (!Number.isInteger(studentId) || studentId <= 0) {
    return respondError(
      res,
      400,
      "A valid student is required."
    );
  }

  if (
    lessonId !== null &&
    (!Number.isInteger(lessonId) || lessonId <= 0)
  ) {
    return respondError(res, 400, "Invalid lesson ID.");
  }

  if (assessment.error) {
    return respondError(res, 400, assessment.error);
  }

  const saveAssessment = (student, instructorName = null) => {
    const insertAssessment = () => {
      db.run(
        `INSERT INTO student_progress
         (student_id, instructor_user_id, school_id, lesson_id,
          skill, status, comments)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          studentId,
          userId,
          schoolId,
          lessonId,
          assessment.skill,
          assessment.status,
          assessment.comments,
        ],
        function (insertErr) {
          if (insertErr) {
            console.error(
              "SAVE STUDENT PROGRESS ERROR:",
              insertErr.message
            );

            return respondError(
              res,
              500,
              "Could not save the assessment."
            );
          }

          return res.status(201).json({
            success: true,
            message: "Student progress assessment saved.",
            assessment: {
              id: this.lastID,
              student_id: studentId,
              instructor_user_id: userId,
              school_id: schoolId,
              lesson_id: lessonId,
              skill: assessment.skill,
              status: assessment.status,
              comments: assessment.comments,
            },
          });
        }
      );
    };

    if (lessonId === null) {
      return insertAssessment();
    }

    let lessonSql = `
      SELECT id
      FROM lessons
      WHERE id = ?
        AND school_id = ?
        AND student = ?
    `;

    const lessonParams = [
      lessonId,
      schoolId,
      student.fullname,
    ];

    if (isInstructor(req)) {
      lessonSql += " AND instructor = ?";
      lessonParams.push(instructorName);
    }

    db.get(lessonSql, lessonParams, (lessonErr, lesson) => {
      if (lessonErr) {
        console.error(
          "LESSON VERIFICATION ERROR:",
          lessonErr.message
        );

        return respondError(
          res,
          500,
          "Could not verify lesson."
        );
      }

      if (!lesson) {
        return respondError(
          res,
          400,
          "The lesson does not match this student and instructor."
        );
      }

      return insertAssessment();
    });
  };

  getStudent(studentId, (studentErr, student) => {
    if (studentErr) {
      console.error(
        "STUDENT LOOKUP ERROR:",
        studentErr.message
      );

      return respondError(
        res,
        500,
        "Could not verify student."
      );
    }

    if (
      !student ||
      Number(student.school_id) !== schoolId
    ) {
      return respondError(
        res,
        404,
        "Student not found in your school."
      );
    }

    // Administrators can assess students in their school
    // without an instructor profile.
    if (isAdministrator(req)) {
      return saveAssessment(student);
    }

    // Instructors must have a linked profile and assigned student.
    return getInstructorProfile(
      req,
      (instructorErr, instructor) => {
        if (instructorErr) {
          console.error(
            "INSTRUCTOR LOOKUP ERROR:",
            instructorErr.message
          );

          return respondError(
            res,
            500,
            "Could not verify instructor."
          );
        }

        if (!instructor) {
          return respondError(
            res,
            403,
            "Your instructor profile is not linked to your account."
          );
        }

        const assignedById =
          Number(student.instructor) === Number(instructor.id);

        const assignedByName =
          String(student.instructor || "").trim().toLowerCase() ===
          String(instructor.name || "").trim().toLowerCase();

        if (!assignedById && !assignedByName) {
          return respondError(
            res,
            403,
            "You can only assess students assigned to you."
          );
        }

        return saveAssessment(student, instructor.name);
      }
    );
  });
};

export { SKILLS, VALID_STATUSES };
