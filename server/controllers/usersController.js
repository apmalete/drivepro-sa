import db from "../database/database.js";
import jwt from "jsonwebtoken";

// =====================================================
// JWT SECRET
// =====================================================

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "drivepro-sa-secret-key-change-later";


// =====================================================
// GET SCHOOL ID FROM AUTHENTICATED USER
// IMPORTANT:
// DO NOT DEFAULT NORMAL USERS TO SCHOOL 1
// =====================================================

const getAuthenticatedSchoolId = (req) => {

  const schoolId =
    Number(req.user?.school_id);

  if (
    !Number.isInteger(schoolId) ||
    schoolId <= 0
  ) {
    return null;
  }

  return schoolId;
};


// =====================================================
// CHECK SYSTEM ADMINISTRATOR
// =====================================================

const isSystemAdministrator = (req) => {

  const role =
    String(
      req.user?.role || ""
    )
      .trim()
      .toLowerCase();

  const username =
    String(
      req.user?.username || ""
    )
      .trim()
      .toLowerCase();

  return (
    role === "system administrator" ||
    username === "admin"
  );
};


// =====================================================
// LOGIN
// =====================================================

export const loginUser = (req, res) => {

  const username =
    String(
      req.body.username || ""
    ).trim();

  const password =
    String(
      req.body.password || ""
    );


  // ===================================================
  // VALIDATION
  // ===================================================

  if (
    !username ||
    !password
  ) {

    return res.status(400).json({
      success: false,
      message:
        "Username and password are required.",
    });

  }


  console.log(
    "LOGIN ATTEMPT:",
    username
  );


  // ===================================================
  // FIND USER
  // ===================================================

  db.get(
    `
    SELECT *
    FROM users
    WHERE LOWER(TRIM(username))
      =
      LOWER(TRIM(?))
    LIMIT 1
    `,
    [
      username,
    ],
    (err, user) => {

      if (err) {

        console.error(
          "LOGIN DATABASE ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message:
            "Database error during login.",
        });

      }


      // ===============================================
      // USER NOT FOUND
      // ===============================================

      if (!user) {

        return res.status(401).json({
          success: false,
          message:
            "Invalid username or password.",
        });

      }


      // ===============================================
      // PASSWORD
      // ===============================================

      if (
        String(user.password) !==
        password
      ) {

        return res.status(401).json({
          success: false,
          message:
            "Invalid username or password.",
        });

      }


      // ===============================================
      // USER STATUS
      // ===============================================

      if (
        String(user.status)
          .trim()
          .toLowerCase() !==
        "active"
      ) {

        return res.status(403).json({
          success: false,
          message:
            "This user account is inactive.",
        });

      }


      // ===============================================
      // DETERMINE ROLE
      // ===============================================

      let userRole =
        user.role;


      // ===============================================
      // MAIN ADMIN
      // ===============================================

      if (
        String(user.username)
          .trim()
          .toLowerCase() ===
        "admin"
      ) {

        userRole =
          "System Administrator";


        db.run(
          `
          UPDATE users
          SET role = ?
          WHERE id = ?
          `,
          [
            "System Administrator",
            user.id,
          ],
          (updateErr) => {

            if (updateErr) {

              console.error(
                "SYSTEM ADMIN ROLE UPDATE ERROR:",
                updateErr.message
              );

            }

          }
        );

      }


      // ===============================================
      // SCHOOL ID
      // ===============================================

      const schoolId =
        Number(user.school_id) || 1;


      // ===============================================
      // SYSTEM ADMINISTRATOR
      // ===============================================

      if (
        userRole ===
        "System Administrator"
      ) {

        const safeUser = {

          id:
            user.id,

          fullname:
            user.fullname,

          username:
            user.username,

          role:
            userRole,

          status:
            user.status,

          school_id:
            schoolId,

        };


        const token =
          jwt.sign(
            {

              id:
                user.id,

              username:
                user.username,

              role:
                userRole,

              school_id:
                schoolId,

            },

            JWT_SECRET,

            {
              expiresIn:
                "8h",
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

          success:
            true,

          token:
            token,

          user:
            safeUser,

        });

      }


      // ===============================================
      // NORMAL USER MUST HAVE VALID SCHOOL
      // ===============================================

      if (
        !Number.isInteger(
          schoolId
        ) ||
        schoolId <= 0
      ) {

        return res.status(403).json({
          success: false,
          message:
            "This user is not assigned to a valid school.",
        });

      }


      // ===============================================
      // CHECK SCHOOL
      // ===============================================

      db.get(
        `
        SELECT
          id,
          schoolName,
          status
        FROM schools
        WHERE id = ?
        `,
        [
          schoolId,
        ],
        (schoolErr, school) => {

          if (schoolErr) {

            console.error(
              "SCHOOL CHECK ERROR:",
              schoolErr.message
            );

            return res.status(500).json({
              success: false,
              message:
                "Unable to verify school.",
            });

          }


          if (!school) {

            return res.status(403).json({
              success: false,
              message:
                "The school assigned to this user does not exist.",
            });

          }


          // =========================================
          // INACTIVE SCHOOL
          // =========================================

          if (
            String(school.status)
              .trim()
              .toLowerCase() !==
            "active"
          ) {

            return res.status(403).json({
              success: false,
              message:
                "This school is inactive. Please contact the system administrator.",
            });

          }


          // =========================================
          // SAFE USER
          // =========================================

          const safeUser = {

            id:
              user.id,

            fullname:
              user.fullname,

            username:
              user.username,

            role:
              userRole,

            status:
              user.status,

            school_id:
              schoolId,

          };


          // =========================================
          // JWT
          // =========================================

          const token =
            jwt.sign(
              {

                id:
                  user.id,

                username:
                  user.username,

                role:
                  userRole,

                school_id:
                  schoolId,

              },

              JWT_SECRET,

              {
                expiresIn:
                  "8h",
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

            success:
              true,

            token:
              token,

            user:
              safeUser,

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

  // ===================================================
  // SYSTEM ADMINISTRATOR
  // SEE ALL SCHOOLS
  // ===================================================

  if (
    isSystemAdministrator(req)
  ) {

    db.all(
      `
      SELECT
        id,
        fullname,
        username,
        role,
        status,
        school_id,
        created_at
      FROM users
      ORDER BY id DESC
      `,
      [],
      (err, rows) => {

        if (err) {

          console.error(
            "GET ALL USERS ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message:
              err.message,
          });

        }

        return res.json(
          rows || []
        );

      }
    );

    return;
  }


  // ===================================================
  // NORMAL ADMIN
  // ONLY THEIR SCHOOL
  // ===================================================

  const schoolId =
    getAuthenticatedSchoolId(req);


  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });

  }


  db.all(
    `
    SELECT
      id,
      fullname,
      username,
      role,
      status,
      school_id,
      created_at
    FROM users
    WHERE school_id = ?
    ORDER BY id DESC
    `,
    [
      schoolId,
    ],
    (err, rows) => {

      if (err) {

        console.error(
          "GET USERS ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message:
            err.message,
        });

      }

      return res.json(
        rows || []
      );

    }
  );

};


// =====================================================
// ADD USER
// =====================================================

export const addUser = (req, res) => {

  const {
    fullname,
    username,
    password,
    role,
    status,
    school_id,
  } = req.body;


  // ===================================================
  // VALIDATION
  // ===================================================

  if (
    !fullname ||
    !String(fullname).trim()
  ) {

    return res.status(400).json({
      success: false,
      message:
        "Full name is required.",
    });

  }


  if (
    !username ||
    !String(username).trim()
  ) {

    return res.status(400).json({
      success: false,
      message:
        "Username is required.",
    });

  }


  if (!password) {

    return res.status(400).json({
      success: false,
      message:
        "Password is required.",
    });

  }


  if (!role) {

    return res.status(400).json({
      success: false,
      message:
        "User role is required.",
    });

  }


  const allowedRoles = [

    "Administrator",

    "Receptionist",

    "Instructor",

  ];


  if (
    !allowedRoles.includes(
      role
    )
  ) {

    return res.status(400).json({
      success: false,
      message:
        "Invalid user role.",
    });

  }


  // ===================================================
  // DETERMINE SCHOOL
  // ===================================================

  let schoolId;


  if (
    isSystemAdministrator(req)
  ) {

    schoolId =
      Number(school_id);


    if (
      !Number.isInteger(
        schoolId
      ) ||
      schoolId <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Please select a valid school.",
      });

    }

  } else {

    schoolId =
      getAuthenticatedSchoolId(req);


    if (!schoolId) {

      return res.status(403).json({
        success: false,
        message:
          "School information not found.",
      });

    }

  }


  // ===================================================
  // VERIFY SCHOOL
  // ===================================================

  db.get(
    `
    SELECT
      id,
      status
    FROM schools
    WHERE id = ?
    `,
    [
      schoolId,
    ],
    (schoolErr, school) => {

      if (schoolErr) {

        return res.status(500).json({
          success: false,
          message:
            schoolErr.message,
        });

      }


      if (!school) {

        return res.status(400).json({
          success: false,
          message:
            "Selected school does not exist.",
        });

      }


      if (
        String(school.status)
          .trim()
          .toLowerCase() !==
        "active"
      ) {

        return res.status(403).json({
          success: false,
          message:
            "You cannot create a user for an inactive school.",
        });

      }


      // =============================================
      // INSERT
      // =============================================

      db.run(
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
        VALUES
        (?, ?, ?, ?, ?, ?)
        `,
        [

          String(
            fullname
          ).trim(),

          String(
            username
          ).trim(),

          password,

          role,

          status ||
            "Active",

          schoolId,

        ],
        function (err) {

          if (err) {

            console.error(
              "ADD USER ERROR:",
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
                  "This username already exists.",
              });

            }


            return res.status(500).json({
              success: false,
              message:
                err.message,
            });

          }


          return res.status(201).json({

            success:
              true,

            message:
              "User added successfully.",

            id:
              this.lastID,

            school_id:
              schoolId,

          });

        }
      );

    }
  );

};


// =====================================================
// UPDATE USER
// =====================================================

export const updateUser = (req, res) => {

  const {
    id,
  } = req.params;


  const {
    fullname,
    username,
    password,
    role,
    status,
    school_id,       // IMPORTANT FIX
  } = req.body;


  // ===================================================
  // VALIDATION
  // ===================================================

  if (
    !fullname ||
    !String(fullname).trim()
  ) {

    return res.status(400).json({
      success: false,
      message:
        "Full name is required.",
    });

  }


  if (
    !username ||
    !String(username).trim()
  ) {

    return res.status(400).json({
      success: false,
      message:
        "Username is required.",
    });

  }


  if (!role) {

    return res.status(400).json({
      success: false,
      message:
        "User role is required.",
    });

  }


  const allowedRoles = [

    "Administrator",

    "Receptionist",

    "Instructor",

    "System Administrator",

  ];


  if (
    !allowedRoles.includes(
      role
    )
  ) {

    return res.status(400).json({
      success: false,
      message:
        "Invalid user role.",
    });

  }


  // ===================================================
  // MAIN SYSTEM ADMINISTRATOR
  // ===================================================

  if (
    Number(id) === 1
  ) {

    if (
      role !==
      "System Administrator"
    ) {

      return res.status(403).json({
        success: false,
        message:
          "The main System Administrator role cannot be changed.",
      });

    }


    if (
      status &&
      status !==
      "Active"
    ) {

      return res.status(403).json({
        success: false,
        message:
          "The main System Administrator cannot be deactivated.",
      });

    }


    // ===============================================
    // UPDATE MAIN ADMIN
    // ===============================================

    if (password) {

      db.run(
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

          String(
            fullname
          ).trim(),

          String(
            username
          ).trim(),

          password,

          role,

          status ||
            "Active",

          id,

        ],
        function (err) {

          if (err) {

            console.error(
              "SYSTEM ADMIN UPDATE ERROR:",
              err.message
            );

            return res.status(500).json({
              success: false,
              message:
                err.message,
            });

          }


          return res.json({
            success:
              true,
            message:
              "User updated successfully.",
          });

        }
      );

      return;
    }


    db.run(
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

        String(
          fullname
        ).trim(),

        String(
          username
        ).trim(),

        role,

        status ||
          "Active",

        id,

      ],
      function (err) {

        if (err) {

          return res.status(500).json({
            success: false,
            message:
              err.message,
          });

        }


        return res.json({
          success:
            true,
          message:
            "User updated successfully.",
        });

      }
    );

    return;
  }


  // ===================================================
  // SYSTEM ADMINISTRATOR
  // CAN MOVE USERS BETWEEN SCHOOLS
  // ===================================================

  if (
    isSystemAdministrator(req)
  ) {

    const newSchoolId =
      Number(school_id);


    // ===============================================
    // SCHOOL REQUIRED
    // ===============================================

    if (
      !Number.isInteger(
        newSchoolId
      ) ||
      newSchoolId <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Please select a valid school.",
      });

    }


    // ===============================================
    // CHECK SCHOOL
    // ===============================================

    db.get(
      `
      SELECT
        id,
        schoolName,
        status
      FROM schools
      WHERE id = ?
      `,
      [
        newSchoolId,
      ],
      (schoolErr, school) => {

        if (schoolErr) {

          console.error(
            "CHECK SCHOOL ERROR:",
            schoolErr.message
          );

          return res.status(500).json({
            success: false,
            message:
              schoolErr.message,
          });

        }


        if (!school) {

          return res.status(400).json({
            success: false,
            message:
              "Selected school does not exist.",
          });

        }


        // =============================================
        // DO NOT ASSIGN USER TO INACTIVE SCHOOL
        // =============================================

        if (
          String(school.status)
            .trim()
            .toLowerCase() !==
          "active"
        ) {

          return res.status(403).json({
            success: false,
            message:
              "You cannot assign a user to an inactive school.",
          });

        }


        // =============================================
        // UPDATE WITH PASSWORD
        // =============================================

        if (password) {

          db.run(
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

              String(
                fullname
              ).trim(),

              String(
                username
              ).trim(),

              password,

              role,

              status ||
                "Active",

              newSchoolId,

              id,

            ],
            function (err) {

              if (err) {

                console.error(
                  "SYSTEM ADMIN UPDATE USER ERROR:",
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
                      "This username already exists.",
                  });

                }


                return res.status(500).json({
                  success: false,
                  message:
                    err.message,
                });

              }


              if (
                this.changes === 0
              ) {

                return res.status(404).json({
                  success: false,
                  message:
                    "User not found.",
                });

              }


              console.log(
                "USER SCHOOL UPDATED:",
                id,
                "NEW SCHOOL:",
                newSchoolId
              );


              return res.json({

                success:
                  true,

                message:
                  "User updated successfully.",

                school_id:
                  newSchoolId,

              });

            }
          );

          return;
        }


        // =============================================
        // UPDATE WITHOUT PASSWORD
        // =============================================

        db.run(
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

            String(
              fullname
            ).trim(),

            String(
              username
            ).trim(),

            role,

            status ||
              "Active",

            newSchoolId,

            id,

          ],
          function (err) {

            if (err) {

              console.error(
                "SYSTEM ADMIN UPDATE USER ERROR:",
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
                    "This username already exists.",
                });

              }


              return res.status(500).json({
                success: false,
                message:
                  err.message,
              });

            }


            if (
              this.changes === 0
            ) {

              return res.status(404).json({
                success: false,
                message:
                  "User not found.",
              });

            }


            console.log(
              "USER SCHOOL UPDATED:",
              id,
              "NEW SCHOOL:",
              newSchoolId
            );


            return res.json({

              success:
                true,

              message:
                "User updated successfully.",

              school_id:
                newSchoolId,

            });

          }
        );

      }
    );

    return;
  }


  // ===================================================
  // NORMAL SCHOOL ADMINISTRATOR
  // ===================================================

  const schoolId =
    getAuthenticatedSchoolId(req);


  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });

  }


  // ===================================================
  // NORMAL ADMIN CANNOT CREATE SYSTEM ADMIN
  // ===================================================

  if (
    role ===
    "System Administrator"
  ) {

    return res.status(403).json({
      success: false,
      message:
        "Only the System Administrator can assign this role.",
    });

  }


  // ===================================================
  // NORMAL ADMIN CANNOT CHANGE SCHOOL
  // ===================================================

  // We deliberately ignore school_id from the form.
  // Normal administrators can only manage their own school.


  // ===================================================
  // UPDATE WITH PASSWORD
  // ===================================================

  if (password) {

    db.run(
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

        String(
          fullname
        ).trim(),

        String(
          username
        ).trim(),

        password,

        role,

        status ||
          "Active",

        id,

        schoolId,

      ],
      function (err) {

        if (err) {

          console.error(
            "UPDATE USER ERROR:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message:
              err.message,
          });

        }


        if (
          this.changes === 0
        ) {

          return res.status(404).json({
            success: false,
            message:
              "User not found for this school.",
          });

        }


        return res.json({
          success:
            true,
          message:
            "User updated successfully.",
        });

      }
    );

    return;
  }


  // ===================================================
  // UPDATE WITHOUT PASSWORD
  // ===================================================

  db.run(
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

      String(
        fullname
      ).trim(),

      String(
        username
      ).trim(),

      role,

      status ||
        "Active",

      id,

      schoolId,

    ],
    function (err) {

      if (err) {

        console.error(
          "UPDATE USER ERROR:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message:
            err.message,
        });

      }


      if (
        this.changes === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "User not found for this school.",
        });

      }


      return res.json({
        success:
          true,
        message:
          "User updated successfully.",
      });

    }
  );

};


// =====================================================
// DELETE USER
// =====================================================

export const deleteUser = (req, res) => {

  const {
    id,
  } = req.params;


  // ===================================================
  // PROTECT MAIN ADMIN
  // ===================================================

  if (
    Number(id) === 1
  ) {

    return res.status(403).json({
      success: false,
      message:
        "The main System Administrator account cannot be deleted.",
    });

  }


  // ===================================================
  // SYSTEM ADMIN
  // ===================================================

  if (
    isSystemAdministrator(req)
  ) {

    db.run(
      `
      DELETE FROM users
      WHERE id = ?
      `,
      [
        id,
      ],
      function (err) {

        if (err) {

          return res.status(500).json({
            success: false,
            message:
              err.message,
          });

        }


        if (
          this.changes === 0
        ) {

          return res.status(404).json({
            success: false,
            message:
              "User not found.",
          });

        }


        return res.json({
          success:
            true,
          message:
            "User deleted successfully.",
        });

      }
    );

    return;
  }


  // ===================================================
  // NORMAL ADMIN
  // ===================================================

  const schoolId =
    getAuthenticatedSchoolId(req);


  if (!schoolId) {

    return res.status(403).json({
      success: false,
      message:
        "School information not found.",
    });

  }


  db.run(
    `
    DELETE FROM users
    WHERE id = ?
    AND school_id = ?
    `,
    [
      id,
      schoolId,
    ],
    function (err) {

      if (err) {

        return res.status(500).json({
          success: false,
          message:
            err.message,
        });

      }


      if (
        this.changes === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "User not found for this school.",
        });

      }


      return res.json({
        success:
          true,
        message:
          "User deleted successfully.",
      });

    }
  );

};