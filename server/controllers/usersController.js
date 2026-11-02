
import db from "../database/database.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// =====================================================
// JWT SECRET
// =====================================================

const JWT_SECRET = process.env.JWT_SECRET;

// =====================================================
// PASSWORD SECURITY
// =====================================================

const hashPassword = async (password) => {
  return bcrypt.hash(String(password), 12);
};

const isBcryptHash = (password) => {
  return /^\$2[aby]\$/.test(String(password || ""));
};

// =====================================================
// DATABASE HELPERS
// =====================================================

const dbGet = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

const dbRun = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({
        lastID: this.lastID,
        changes: this.changes,
      });
    });
  });

// =====================================================
// GET SCHOOL ID FROM AUTHENTICATED USER
// =====================================================

const getAuthenticatedSchoolId = (req) => {
  const schoolId = Number(req.user?.school_id);

  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    return null;
  }

  return schoolId;
};

// =====================================================
// CHECK SYSTEM ADMINISTRATOR
// =====================================================

const isSystemAdministrator = (req) => {
  const role = String(req.user?.role || "")
    .trim()
    .toLowerCase();

  return role === "system administrator";
};

// =====================================================
// LOGIN
// =====================================================

export const loginUser = (req, res) => {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not configured.");

    return res.status(500).json({
      success: false,
      message: "Authentication service is not configured.",
    });
  }

  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required.",
    });
  }

  console.log("LOGIN ATTEMPT:", username);

  db.get(
    `
    SELECT *
    FROM users
    WHERE LOWER(TRIM(username)) = LOWER(TRIM(?))
    LIMIT 1
    `,
    [username],
    async (err, user) => {
      if (err) {
        console.error("LOGIN DATABASE ERROR:", err.message);

        return res.status(500).json({
          success: false,
          message: "Database error during login.",
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password.",
        });
      }

      // ===============================================
      // VERIFY PASSWORD
      // ===============================================

      const storedPassword = String(user.password || "");
      const passwordIsHashed = isBcryptHash(storedPassword);

      let passwordMatches = false;

      try {
        passwordMatches = passwordIsHashed
          ? await bcrypt.compare(password, storedPassword)
          : storedPassword === password;
      } catch (passwordError) {
        console.error(
          "PASSWORD VERIFICATION ERROR:",
          passwordError.message
        );

        return res.status(500).json({
          success: false,
          message: "Unable to verify password.",
        });
      }

      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password.",
        });
      }

      // ===============================================
      // UPGRADE LEGACY PLAIN-TEXT PASSWORD
      // ===============================================

      if (!passwordIsHashed) {
        try {
          const upgradedPassword = await hashPassword(password);

          await dbRun(
            "UPDATE users SET password = ? WHERE id = ?",
            [upgradedPassword, user.id]
          );

          user.password = upgradedPassword;

          console.log("Legacy password securely upgraded.");
        } catch (upgradeError) {
          console.error(
            "PASSWORD UPGRADE ERROR:",
            upgradeError.message
          );

          return res.status(500).json({
            success: false,
            message: "Unable to secure your password. Please try again.",
          });
        }
      }

      // ===============================================
      // CHECK USER STATUS
      // ===============================================

      if (
        String(user.status).trim().toLowerCase() !== "active"
      ) {
        return res.status(403).json({
          success: false,
          message: "This user account is inactive.",
        });
      }

      const userRole = String(user.role || "").trim();
      const schoolId = Number(user.school_id);

      // ===============================================
      // SYSTEM ADMINISTRATOR
      // ===============================================

      if (userRole.toLowerCase() === "system administrator") {
        const safeUser = {
          id: user.id,
          fullname: user.fullname,
          username: user.username,
          role: userRole,
          status: user.status,
          school_id: schoolId,
        };

        const token = jwt.sign(
          {
            id: user.id,
            username: user.username,
            role: userRole,
            school_id: schoolId,
          },
          JWT_SECRET,
          {
            expiresIn: "8h",
          }
        );

        console.log(
          "LOGIN SUCCESS:",
          username,
          "Role:",
          userRole
        );

        return res.json({
          success: true,
          token,
          user: safeUser,
        });
      }

      // ===============================================
      // NORMAL USER MUST HAVE VALID SCHOOL
      // ===============================================

      if (!Number.isInteger(schoolId) || schoolId <= 0) {
        return res.status(403).json({
          success: false,
          message: "This user is not assigned to a valid school.",
        });
      }

      // ===============================================
      // CHECK SCHOOL
      // ===============================================

      db.get(
        `
        SELECT id, schoolName, status
        FROM schools
        WHERE id = ?
        `,
        [schoolId],
        (schoolErr, school) => {
          if (schoolErr) {
            console.error("SCHOOL CHECK ERROR:", schoolErr.message);

            return res.status(500).json({
              success: false,
              message: "Unable to verify school.",
            });
          }

          if (!school) {
            return res.status(403).json({
              success: false,
              message:
                "The school assigned to this user does not exist.",
            });
          }

          if (
            String(school.status).trim().toLowerCase() !== "active"
          ) {
            return res.status(403).json({
              success: false,
              message:
                "This school is inactive. Please contact the system administrator.",
            });
          }

          const safeUser = {
            id: user.id,
            fullname: user.fullname,
            username: user.username,
            role: userRole,
            status: user.status,
            school_id: schoolId,
          };

          const token = jwt.sign(
            {
              id: user.id,
              username: user.username,
              role: userRole,
              school_id: schoolId,
            },
            JWT_SECRET,
            {
              expiresIn: "8h",
            }
          );

          console.log(
            "LOGIN SUCCESS:",
            username,
            "Role:",
            userRole,
            "School:",
            schoolId
          );

          return res.json({
            success: true,
            token,
            user: safeUser,
          });
        }
      );
    }
  );
};

// =====================================================
// GET USERS
// =====================================================

export const getUsers = (req, res) => {
  if (isSystemAdministrator(req)) {
    return db.all(
      `
      SELECT
        users.id,
        users.fullname,
        users.username,
        users.role,
        users.status,
        users.school_id,
        users.created_at,
        (
          SELECT students.id
          FROM students
          WHERE students.user_id = users.id
          LIMIT 1
        ) AS student_id,
        (
          SELECT instructors.id
          FROM instructors
          WHERE instructors.user_id = users.id
          LIMIT 1
        ) AS instructor_id
      FROM users
      ORDER BY users.id DESC
      `,
      [],
      (err, rows) => {
        if (err) {
          console.error("GET ALL USERS ERROR:", err.message);

          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        return res.json(rows || []);
      }
    );
  }

  const schoolId = getAuthenticatedSchoolId(req);

  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

  db.all(
    `
    SELECT
      users.id,
      users.fullname,
      users.username,
      users.role,
      users.status,
      users.school_id,
      users.created_at,
      (
        SELECT students.id
        FROM students
        WHERE students.user_id = users.id
        LIMIT 1
      ) AS student_id,
      (
        SELECT instructors.id
        FROM instructors
        WHERE instructors.user_id = users.id
        LIMIT 1
      ) AS instructor_id
    FROM users
    WHERE users.school_id = ?
    ORDER BY users.id DESC
    `,
    [schoolId],
    (err, rows) => {
      if (err) {
        console.error("GET USERS ERROR:", err.message);

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      return res.json(rows || []);
    }
  );
};

// =====================================================
// ADD USER
// =====================================================

export const addUser = async (req, res) => {
  try {
    const {
      fullname,
      username,
      password,
      role,
      status,
      school_id,
      student_id,
      instructor_id,
    } = req.body;

    if (!fullname || !String(fullname).trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    if (!username || !String(username).trim()) {
      return res.status(400).json({
        success: false,
        message: "Username is required.",
      });
    }

    if (!password || !String(password).trim()) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "User role is required.",
      });
    }

    const allowedRoles = [
      "Administrator",
      "Receptionist",
      "Instructor",
      "Student",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    // ===============================================
    // DETERMINE SCHOOL
    // ===============================================

    let schoolId;

    if (isSystemAdministrator(req)) {
      schoolId = Number(school_id);

      if (!Number.isInteger(schoolId) || schoolId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Please select a valid school.",
        });
      }
    } else {
      schoolId = getAuthenticatedSchoolId(req);

      if (!schoolId) {
        return res.status(403).json({
          success: false,
          message: "School information not found.",
        });
      }
    }

    const passwordHash = await hashPassword(password);

    // ===============================================
    // STUDENT ACCOUNT
    // ===============================================

    if (String(role).trim().toLowerCase() === "student") {
      const selectedStudentId = Number(student_id);

      if (
        !Number.isInteger(selectedStudentId) ||
        selectedStudentId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select a Student Profile before creating the Student account.",
        });
      }

      const studentProfile = await dbGet(
        `
        SELECT id, fullname, school_id, user_id
        FROM students
        WHERE id = ? AND school_id = ?
        LIMIT 1
        `,
        [selectedStudentId, schoolId]
      );

      if (!studentProfile) {
        return res.status(400).json({
          success: false,
          message:
            "The selected Student Profile does not exist in the selected school.",
        });
      }

      if (
        studentProfile.user_id !== null &&
        Number(studentProfile.user_id) > 0
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This Student Profile is already linked to another login account.",
        });
      }

      const insertedUser = await dbRun(
        `
        INSERT INTO users
        (
          fullname,
          username,
          password,
          role,
          status,
          school_id
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          String(fullname).trim(),
          String(username).trim(),
          passwordHash,
          role,
          status || "Active",
          schoolId,
        ]
      );

      const newUserId = insertedUser.lastID;

      try {
        const linkedStudent = await dbRun(
          `
          UPDATE students
          SET user_id = ?
          WHERE id = ?
            AND school_id = ?
            AND user_id IS NULL
          `,
          [newUserId, selectedStudentId, schoolId]
        );

        if (linkedStudent.changes === 0) {
          await dbRun(
            "DELETE FROM users WHERE id = ?",
            [newUserId]
          );

          return res.status(409).json({
            success: false,
            message:
              "The selected Student Profile is already linked to another account.",
          });
        }
      } catch (linkError) {
        await dbRun(
          "DELETE FROM users WHERE id = ?",
          [newUserId]
        ).catch(() => {});

        throw linkError;
      }

      return res.status(201).json({
        success: true,
        message: "Student account created and linked successfully.",
        id: newUserId,
        student_id: selectedStudentId,
        school_id: schoolId,
      });
    }

    // ===============================================
    // INSTRUCTOR ACCOUNT
    // ===============================================

    if (String(role).trim().toLowerCase() === "instructor") {
      const selectedInstructorId = Number(instructor_id);

      if (
        !Number.isInteger(selectedInstructorId) ||
        selectedInstructorId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select the existing instructor profile before creating the Instructor account.",
        });
      }

      const instructorProfile = await dbGet(
        `
        SELECT id, name, school_id, user_id
        FROM instructors
        WHERE id = ? AND school_id = ?
        LIMIT 1
        `,
        [selectedInstructorId, schoolId]
      );

      if (!instructorProfile) {
        return res.status(400).json({
          success: false,
          message:
            "The selected Instructor Profile does not exist in the selected school.",
        });
      }

      if (
        instructorProfile.user_id !== null &&
        Number(instructorProfile.user_id) > 0
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This Instructor Profile is already linked to another login account.",
        });
      }

      const insertedUser = await dbRun(
        `
        INSERT INTO users
        (
          fullname,
          username,
          password,
          role,
          status,
          school_id
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          String(fullname).trim(),
          String(username).trim(),
          passwordHash,
          role,
          status || "Active",
          schoolId,
        ]
      );

      const newUserId = insertedUser.lastID;

      try {
        const linkedInstructor = await dbRun(
          `
          UPDATE instructors
          SET user_id = ?
          WHERE id = ?
            AND school_id = ?
            AND user_id IS NULL
          `,
          [newUserId, selectedInstructorId, schoolId]
        );

        if (linkedInstructor.changes === 0) {
          await dbRun(
            "DELETE FROM users WHERE id = ?",
            [newUserId]
          );

          return res.status(409).json({
            success: false,
            message:
              "The selected Instructor Profile is already linked to another account.",
          });
        }
      } catch (linkError) {
        await dbRun(
          "DELETE FROM users WHERE id = ?",
          [newUserId]
        ).catch(() => {});

        throw linkError;
      }

      return res.status(201).json({
        success: true,
        message: "Instructor account created and linked successfully.",
        id: newUserId,
        instructor_id: selectedInstructorId,
        school_id: schoolId,
      });
    }

    // ===============================================
    // NORMAL STAFF ACCOUNT
    // ===============================================

    const school = await dbGet(
      `
      SELECT id, status
      FROM schools
      WHERE id = ?
      `,
      [schoolId]
    );

    if (!school) {
      return res.status(400).json({
        success: false,
        message: "Selected school does not exist.",
      });
    }

    if (String(school.status).trim().toLowerCase() !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "You cannot create a user for an inactive school.",
      });
    }

    const insertedUser = await dbRun(
      `
      INSERT INTO users
      (
        fullname,
        username,
        password,
        role,
        status,
        school_id
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        String(fullname).trim(),
        String(username).trim(),
        passwordHash,
        role,
        status || "Active",
        schoolId,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "User added successfully.",
      id: insertedUser.lastID,
      school_id: schoolId,
    });
  } catch (error) {
    console.error("ADD USER ERROR:", error.message);

    if (error.message?.includes("UNIQUE constraint failed")) {
      return res.status(409).json({
        success: false,
        message: "This username already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create user account.",
    });
  }
};

// =====================================================
// UPDATE USER
// =====================================================

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fullname,
      username,
      password,
      role,
      status,
      school_id,
    } = req.body;

    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (!fullname || !String(fullname).trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    if (!username || !String(username).trim()) {
      return res.status(400).json({
        success: false,
        message: "Username is required.",
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "User role is required.",
      });
    }

    const allowedRoles = [
      "Administrator",
      "Receptionist",
      "Instructor",
      "Student",
      "System Administrator",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    let passwordHash = null;

    if (password) {
      passwordHash = await hashPassword(password);
    }

    const cleanFullname = String(fullname).trim();
    const cleanUsername = String(username).trim();
    const cleanStatus = status || "Active";

    // ===============================================
    // PROTECT MAIN SYSTEM ADMINISTRATOR
    // ===============================================

    if (userId === 1 && !isSystemAdministrator(req)) {
      return res.status(403).json({
        success: false,
        message:
          "Only the System Administrator can update this account.",
      });
    }

    // ===============================================
    // MAIN SYSTEM ADMINISTRATOR
    // ===============================================

    if (userId === 1) {
      if (role !== "System Administrator") {
        return res.status(403).json({
          success: false,
          message:
            "The main System Administrator role cannot be changed.",
        });
      }

      if (status && status !== "Active") {
        return res.status(403).json({
          success: false,
          message:
            "The main System Administrator cannot be deactivated.",
        });
      }

      if (passwordHash) {
        await dbRun(
          `
          UPDATE users
          SET
            fullname = ?,
            username = ?,
            password = ?,
            role = ?,
            status = ?
          WHERE id = ?
          `,
          [
            cleanFullname,
            cleanUsername,
            passwordHash,
            role,
            cleanStatus,
            userId,
          ]
        );
      } else {
        await dbRun(
          `
          UPDATE users
          SET
            fullname = ?,
            username = ?,
            role = ?,
            status = ?
          WHERE id = ?
          `,
          [
            cleanFullname,
            cleanUsername,
            role,
            cleanStatus,
            userId,
          ]
        );
      }

      return res.json({
        success: true,
        message: "User updated successfully.",
      });
    }

    // ===============================================
    // SYSTEM ADMINISTRATOR
    // ===============================================

    if (isSystemAdministrator(req)) {
      const newSchoolId = Number(school_id);

      if (!Number.isInteger(newSchoolId) || newSchoolId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Please select a valid school.",
        });
      }

      const school = await dbGet(
        `
        SELECT id, schoolName, status
        FROM schools
        WHERE id = ?
        `,
        [newSchoolId]
      );

      if (!school) {
        return res.status(400).json({
          success: false,
          message: "Selected school does not exist.",
        });
      }

      if (String(school.status).trim().toLowerCase() !== "active") {
        return res.status(403).json({
          success: false,
          message:
            "You cannot assign a user to an inactive school.",
        });
      }

      let result;

      if (passwordHash) {
        result = await dbRun(
          `
          UPDATE users
          SET
            fullname = ?,
            username = ?,
            password = ?,
            role = ?,
            status = ?,
            school_id = ?
          WHERE id = ?
          `,
          [
            cleanFullname,
            cleanUsername,
            passwordHash,
            role,
            cleanStatus,
            newSchoolId,
            userId,
          ]
        );
      } else {
        result = await dbRun(
          `
          UPDATE users
          SET
            fullname = ?,
            username = ?,
            role = ?,
            status = ?,
            school_id = ?
          WHERE id = ?
          `,
          [
            cleanFullname,
            cleanUsername,
            role,
            cleanStatus,
            newSchoolId,
            userId,
          ]
        );
      }

      if (result.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      console.log(
        "USER SCHOOL UPDATED:",
        userId,
        "NEW SCHOOL:",
        newSchoolId
      );

      return res.json({
        success: true,
        message: "User updated successfully.",
        school_id: newSchoolId,
      });
    }

    // ===============================================
    // NORMAL SCHOOL ADMINISTRATOR
    // ===============================================

    const schoolId = getAuthenticatedSchoolId(req);

    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: "School information not found.",
      });
    }

    if (role === "System Administrator") {
      return res.status(403).json({
        success: false,
        message:
          "Only the System Administrator can assign this role.",
      });
    }

    let result;

    if (passwordHash) {
      result = await dbRun(
        `
        UPDATE users
        SET
          fullname = ?,
          username = ?,
          password = ?,
          role = ?,
          status = ?
        WHERE id = ?
          AND school_id = ?
        `,
        [
          cleanFullname,
          cleanUsername,
          passwordHash,
          role,
          cleanStatus,
          userId,
          schoolId,
        ]
      );
    } else {
      result = await dbRun(
        `
        UPDATE users
        SET
          fullname = ?,
          username = ?,
          role = ?,
          status = ?
        WHERE id = ?
          AND school_id = ?
        `,
        [
          cleanFullname,
          cleanUsername,
          role,
          cleanStatus,
          userId,
          schoolId,
        ]
      );
    }

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found for this school.",
      });
    }

    return res.json({
      success: true,
      message: "User updated successfully.",
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error.message);

    if (error.message?.includes("UNIQUE constraint failed")) {
      return res.status(409).json({
        success: false,
        message: "This username already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update user.",
    });
  }
};

// =====================================================
// DELETE USER
// =====================================================

export const deleteUser = (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID.",
    });
  }

  // ===============================================
  // PROTECT MAIN ADMIN
  // ===============================================

  if (id === 1) {
    return res.status(403).json({
      success: false,
      message:
        "The main System Administrator account cannot be deleted.",
    });
  }

  // ===============================================
  // DETERMINE SCHOOL ACCESS
  // ===============================================

  const systemAdmin = isSystemAdministrator(req);
  const schoolId = systemAdmin
    ? null
    : getAuthenticatedSchoolId(req);

  if (!systemAdmin && !schoolId) {
    return res.status(403).json({
      success: false,
      message: "School information not found.",
    });
  }

  // ===============================================
  // UNLINK INSTRUCTOR PROFILE
  // ===============================================

  const unlinkSql = systemAdmin
    ? `
      UPDATE instructors
      SET user_id = NULL
      WHERE user_id = ?
      `
    : `
      UPDATE instructors
      SET user_id = NULL
      WHERE user_id = ?
        AND school_id = ?
      `;

  const unlinkParams = systemAdmin
    ? [id]
    : [id, schoolId];

  db.run(unlinkSql, unlinkParams, (unlinkErr) => {
    if (unlinkErr) {
      console.error(
        "UNLINK INSTRUCTOR ERROR:",
        unlinkErr.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to unlink the Instructor Profile before deleting the user.",
      });
    }

    // =============================================
    // DELETE USER
    // =============================================

    const deleteSql = systemAdmin
      ? `
        DELETE FROM users
        WHERE id = ?
        `
      : `
        DELETE FROM users
        WHERE id = ?
          AND school_id = ?
        `;

    const deleteParams = systemAdmin
      ? [id]
      : [id, schoolId];

    db.run(deleteSql, deleteParams, function (err) {
      if (err) {
        console.error("DELETE USER ERROR:", err.message);

        return res.status(500).json({
          success: false,
          message: "Unable to delete user.",
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: systemAdmin
            ? "User not found."
            : "User not found for this school.",
        });
      }

      return res.json({
        success: true,
        message: "User deleted successfully.",
      });
    });
  });
};
