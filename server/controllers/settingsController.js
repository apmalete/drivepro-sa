import db from "../database/database.js";

const lessonPackageDefinitions = [
  { code: "manual_k53_test", name: "Manual refresher - K53 test" },
  { code: "manual_code8_k53", name: "Manual refresher - Code 8 K53" },
  { code: "manual_code10_k53", name: "Manual refresher - Code 10 K53" },
  { code: "refresher_own_car", name: "Refresher using own car" },
  { code: "learners_test", name: "Learner's test" },
  { code: "automatic_code8_refresher", name: "Automatic - Code 8 refresher" },
];

const validPackageServiceCodes = new Set(
  lessonPackageDefinitions.map((item) => item.code)
);

// GET SETTINGS
export const getSettings = (req, res) => {
  const schoolId = Number(req.user?.school_id);

  if (!Number.isInteger(schoolId) || schoolId < 1) {
    return res.status(403).json({
      success: false,
      message: "Your account is not linked to a valid school.",
    });
  }

  db.get(
    `SELECT id, schoolName, phone, email, address,
            registrationNumber, defaultLessonDuration,
            defaultLessonPrice, lessonDuration, lessonPrice
     FROM settings
     WHERE school_id = ?
     ORDER BY id
     LIMIT 1`,
    [schoolId],
    (err, row) => {
      if (err) {
        console.error("GET SETTINGS ERROR:", err.message);
        return res.status(500).json({
          success: false,
          message: "Failed to load school settings.",
        });
      }

      if (!row) {
        return res.json({
          id: null,
          school_id: schoolId,
          schoolName: "DrivePro-SA",
          phone: "",
          email: "",
          address: "",
          registrationNumber: "",
          defaultLessonDuration: 60,
          defaultLessonPrice: 0,
          lessonDuration: 60,
          lessonPrice: 0,
        });
      }

      return res.json({
        id: row.id,
        school_id: schoolId,
        schoolName: row.schoolName || "DrivePro-SA",
        phone: row.phone || "",
        email: row.email || "",
        address: row.address || "",
        registrationNumber: row.registrationNumber || "",
        defaultLessonDuration: Number(row.defaultLessonDuration) || 60,
        defaultLessonPrice: Number(row.defaultLessonPrice) || 0,
        lessonDuration: Number(row.lessonDuration) || 60,
        lessonPrice: Number(row.lessonPrice) || 0,
      });
    }
  );
};

// UPDATE SETTINGS
export const updateSettings = (req, res) => {
  const schoolId = Number(req.user?.school_id);

  if (!Number.isInteger(schoolId) || schoolId < 1) {
    return res.status(403).json({
      success: false,
      message: "Your account is not linked to a valid school.",
    });
  }

  const {
    schoolName,
    phone,
    email,
    address,
    registrationNumber,
    defaultLessonDuration,
    defaultLessonPrice,
  } = req.body || {};

  if (typeof schoolName !== "string" || !schoolName.trim()) {
    return res.status(400).json({
      success: false,
      message: "School name is required.",
    });
  }

  const duration = Number(defaultLessonDuration);
  const price = Number(defaultLessonPrice);

  if (
    !Number.isInteger(duration) ||
    duration < 15 ||
    duration > 480 ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 1000000
  ) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid lesson duration and lesson price.",
    });
  }

  const values = [
    schoolName.trim(),
    typeof phone === "string" ? phone.trim() : "",
    typeof email === "string" ? email.trim() : "",
    typeof address === "string" ? address.trim() : "",
    typeof registrationNumber === "string"
      ? registrationNumber.trim()
      : "",
    duration,
    Math.round(price * 100) / 100,
  ];

  db.get(
    `SELECT id FROM settings
     WHERE school_id = ?
     ORDER BY id
     LIMIT 1`,
    [schoolId],
    (findErr, row) => {
      if (findErr) {
        console.error("FIND SETTINGS ERROR:", findErr.message);
        return res.status(500).json({
          success: false,
          message: "Failed to find school settings.",
        });
      }

      if (row) {
        db.run(
          `UPDATE settings
           SET schoolName = ?,
               phone = ?,
               email = ?,
               address = ?,
               registrationNumber = ?,
               defaultLessonDuration = ?,
               defaultLessonPrice = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ? AND school_id = ?`,
          [...values, row.id, schoolId],
          (updateErr) => {
            if (updateErr) {
              console.error("UPDATE SETTINGS ERROR:", updateErr.message);
              return res.status(500).json({
                success: false,
                message: "Failed to update school settings.",
              });
            }

            return res.json({
              success: true,
              message: "School settings updated successfully.",
            });
          }
        );

        return;
      }

      db.run(
        `INSERT INTO settings (
           schoolName, phone, email, address, registrationNumber,
           defaultLessonDuration, defaultLessonPrice,
           lessonDuration, lessonPrice, school_id
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [...values, 60, 0, schoolId],
        (insertErr) => {
          if (insertErr) {
            console.error("INSERT SETTINGS ERROR:", insertErr.message);
            return res.status(500).json({
              success: false,
              message: "Failed to create school settings.",
            });
          }

          return res.json({
            success: true,
            message: "School settings created successfully.",
          });
        }
      );
    }
  );
};

// GET THE SIX SERVICE PRICES AND DURATIONS
export const getLessonPackagePrices = (req, res) => {
  const schoolId = Number(req.user?.school_id);

  if (!Number.isInteger(schoolId) || schoolId < 1) {
    return res.status(403).json({
      success: false,
      message: "Your account is not linked to a valid school.",
    });
  }

  db.all(
    `SELECT package_code, package_name, price, lesson_duration
     FROM school_lesson_package_prices
     WHERE school_id = ?`,
    [schoolId],
    (err, rows) => {
      if (err) {
        console.error("GET LESSON PACKAGE PRICES ERROR:", err.message);
        return res.status(500).json({
          success: false,
          message: "Failed to load lesson service prices.",
        });
      }

      const saved = new Map(
        (rows || []).map((row) => [
          row.package_code,
          {
            price: Number(row.price) || 0,
            duration: Number(row.lesson_duration) || 60,
          },
        ])
      );

      return res.json(
        lessonPackageDefinitions.map((item) => {
          const savedItem = saved.get(item.code);

          return {
            ...item,
            price: savedItem?.price ?? 0,
            duration: savedItem?.duration ?? 60,
          };
        })
      );
    }
  );
};

// SAVE THE SIX SERVICE PRICES AND DURATIONS
export const updateLessonPackagePrices = (req, res) => {
  const schoolId = Number(req.user?.school_id);

  if (!Number.isInteger(schoolId) || schoolId < 1) {
    return res.status(403).json({
      success: false,
      message: "Your account is not linked to a valid school.",
    });
  }

  const prices = req.body?.prices;

  if (
    !Array.isArray(prices) ||
    prices.length !== lessonPackageDefinitions.length
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide prices for all six services.",
    });
  }

  const supplied = new Map();

  for (const item of prices) {
    const code = String(item?.code || "");
    const price = Number(item?.price);
    const duration = Number(item?.duration ?? 60);

    if (
      !validPackageServiceCodes.has(code) ||
      supplied.has(code) ||
      !Number.isFinite(price) ||
      price < 0 ||
      price > 1000000 ||
      !Number.isInteger(duration) ||
      duration < 15 ||
      duration > 480
    ) {
      return res.status(400).json({
        success: false,
        message:
          "One or more service prices or lesson durations are invalid. Duration must be 15 to 480 minutes.",
      });
    }

    supplied.set(code, {
      price: Math.round(price * 100) / 100,
      duration,
    });
  }

  if (supplied.size !== lessonPackageDefinitions.length) {
    return res.status(400).json({
      success: false,
      message: "Please provide a price and duration for every service.",
    });
  }

  db.serialize(() => {
    db.run("BEGIN IMMEDIATE TRANSACTION", (beginErr) => {
      if (beginErr) {
        console.error("BEGIN PRICE TRANSACTION ERROR:", beginErr.message);
        return res.status(500).json({
          success: false,
          message: "Could not begin saving service prices.",
        });
      }

      let transactionFinished = false;

      const rollback = (message, detail) => {
        if (transactionFinished) return;
        transactionFinished = true;

        console.error("SAVE LESSON PACKAGE PRICES ERROR:", detail || message);

        db.run("ROLLBACK", () => {
          return res.status(500).json({
            success: false,
            message,
          });
        });
      };

      let index = 0;

      const saveNext = () => {
        if (index >= lessonPackageDefinitions.length) {
          return db.run("COMMIT", (commitErr) => {
            if (commitErr) {
              console.error(
                "COMMIT PRICE TRANSACTION ERROR:",
                commitErr.message
              );

              transactionFinished = true;

              return db.run("ROLLBACK", () => {
                res.status(500).json({
                  success: false,
                  message: "Could not complete saving service prices.",
                });
              });
            }

            transactionFinished = true;

            return res.json({
              success: true,
              message: "Lesson service prices and durations saved successfully.",
            });
          });
        }

        const item = lessonPackageDefinitions[index++];
        const values = supplied.get(item.code);

        db.run(
          `INSERT INTO school_lesson_package_prices
             (school_id, package_code, package_name, price,
              lesson_duration, updated_at)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
           ON CONFLICT(school_id, package_code)
           DO UPDATE SET
             package_name = excluded.package_name,
             price = excluded.price,
             lesson_duration = excluded.lesson_duration,
             updated_at = CURRENT_TIMESTAMP`,
          [
            schoolId,
            item.code,
            item.name,
            values.price,
            values.duration,
          ],
          (err) => {
            if (err) {
              return rollback(
                "Failed to save lesson service prices and durations.",
                err.message
              );
            }

            saveNext();
          }
        );
      };

      saveNext();
    });
  });
};


 // GET FIXED PACKAGES FOR THE LOGGED-IN SCHOOL
export const getFixedLessonPackages = (req, res) => {
  const schoolId = Number(req.user?.school_id);

  if (!Number.isInteger(schoolId) || schoolId < 1) {
    return res.status(403).json({
      success: false,
      message: "Your account is not linked to a valid school.",
    });
  }

  db.all(
    `SELECT id, service_code, package_name, lesson_count,
            total_price, is_active, vehicle_code, included_services
     FROM school_fixed_lesson_packages
     WHERE school_id = ?
     ORDER BY service_code, lesson_count`,
    [schoolId],
    (err, rows) => {
      if (err) {
        console.error("GET FIXED LESSON PACKAGES ERROR:", err.message);
        return res.status(500).json({
          success: false,
          message: "Failed to load fixed lesson packages.",
        });
      }

      const packages = (rows || []).map((row) => {
        let includedServices = [];

        try {
          const parsed = JSON.parse(row.included_services || "[]");
          if (Array.isArray(parsed)) {
            includedServices = parsed;
          }
        } catch {
          includedServices = [];
        }

        return {
          ...row,
          lesson_count: Number(row.lesson_count),
          total_price: Number(row.total_price),
          is_active: Boolean(row.is_active),
          vehicle_code: row.vehicle_code || "",
          included_services: includedServices,
        };
      });

      return res.json({
        success: true,
        packages,
      });
    }
  );
};

// SAVE FIXED PACKAGES FOR THE LOGGED-IN SCHOOL
export const updateFixedLessonPackages = (req, res) => {
  const schoolId = Number(req.user?.school_id);

  if (!Number.isInteger(schoolId) || schoolId < 1) {
    return res.status(403).json({
      success: false,
      message: "Your account is not linked to a valid school.",
    });
  }

  const packages = req.body?.packages;

  if (!Array.isArray(packages) || packages.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Provide a valid list of up to 100 packages.",
    });
  }

  const allowedVehicles = new Set(["", "code8", "code10", "code14"]);
  const allowedServices = new Set([
    "car_hire",
    "booking",
    "issuing",
    "transport",
  ]);

  const preparedPackages = [];
  const seen = new Set();

  for (const item of packages) {
    const code = String(item?.service_code || "");
    const name = String(item?.package_name || "").trim();
    const count = Number(item?.lesson_count);
    const price = Number(item?.total_price);
    const vehicleCode = String(item?.vehicle_code || "").toLowerCase();
    const includedServices = item?.included_services ?? [];

    if (
      !validPackageServiceCodes.has(code) ||
      !name ||
      name.length > 100 ||
      !Number.isInteger(count) ||
      count < 2 ||
      count > 100 ||
      !Number.isFinite(price) ||
      price < 0 ||
      price > 1000000 ||
      !allowedVehicles.has(vehicleCode) ||
      !Array.isArray(includedServices) ||
      !includedServices.every(
        (service) =>
          typeof service === "string" && allowedServices.has(service)
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A package has invalid details. Check its name, lesson count, price, vehicle code and included services.",
      });
    }

    const key = `${code}:${name.toLowerCase()}`;

    if (seen.has(key)) {
      return res.status(400).json({
        success: false,
        message: "Package names must be unique within each service.",
      });
    }

    seen.add(key);

    preparedPackages.push({
      service_code: code,
      package_name: name,
      lesson_count: count,
      total_price: Math.round(price * 100) / 100,
      vehicle_code: vehicleCode,
      included_services: JSON.stringify([...new Set(includedServices)]),
    });
  }

  db.serialize(() => {
    db.run("BEGIN IMMEDIATE TRANSACTION", (beginErr) => {
      if (beginErr) {
        console.error("BEGIN FIXED PACKAGE TRANSACTION ERROR:", beginErr.message);
        return res.status(500).json({
          success: false,
          message: "Could not begin saving fixed packages.",
        });
      }

      let transactionFinished = false;

      const fail = (message, detail) => {
        if (transactionFinished) return;
        transactionFinished = true;

        console.error("SAVE FIXED PACKAGES ERROR:", detail || message);

        db.run("ROLLBACK", () => {
          res.status(500).json({
            success: false,
            message,
          });
        });
      };

      // Keep existing records for booking history.
      // Packages not submitted are deactivated, not deleted.
      db.run(
        `UPDATE school_fixed_lesson_packages
         SET is_active = 0, updated_at = CURRENT_TIMESTAMP
         WHERE school_id = ?`,
        [schoolId],
        (deactivateErr) => {
          if (deactivateErr) {
            return fail(
              "Could not update fixed packages.",
              deactivateErr.message
            );
          }

          let index = 0;

          const saveNext = () => {
            if (index >= preparedPackages.length) {
              return db.run("COMMIT", (commitErr) => {
                if (commitErr) {
                  console.error(
                    "COMMIT FIXED PACKAGES ERROR:",
                    commitErr.message
                  );

                  transactionFinished = true;

                  return db.run("ROLLBACK", () => {
                    res.status(500).json({
                      success: false,
                      message: "Could not finish saving fixed packages.",
                    });
                  });
                }

                transactionFinished = true;

                return res.json({
                  success: true,
                  message: "Fixed lesson packages saved successfully.",
                });
              });
            }

            const item = preparedPackages[index++];

            db.run(
              `INSERT INTO school_fixed_lesson_packages
                 (school_id, service_code, package_name,
                  lesson_count, total_price, is_active,
                  vehicle_code, included_services, updated_at)
               VALUES (?, ?, ?, ?, ?, 1, ?, ?, CURRENT_TIMESTAMP)
               ON CONFLICT(school_id, service_code, package_name)
               DO UPDATE SET
                 lesson_count = excluded.lesson_count,
                 total_price = excluded.total_price,
                 is_active = 1,
                 vehicle_code = excluded.vehicle_code,
                 included_services = excluded.included_services,
                 updated_at = CURRENT_TIMESTAMP`,
              [
                schoolId,
                item.service_code,
                item.package_name,
                item.lesson_count,
                item.total_price,
                item.vehicle_code,
                item.included_services,
              ],
              (saveErr) => {
                if (saveErr) {
                  return fail(
                    "Could not save fixed lesson packages.",
                    saveErr.message
                  );
                }

                saveNext();
              }
            );
          };

          saveNext();
        }
      );
    });
  });
};
