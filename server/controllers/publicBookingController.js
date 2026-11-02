
import db from "../database/database.js";

const allowedStaffRoles = [
  "administrator",
  "system administrator",
  "admin",
  "receptionist",
];

const publicBookingServices = [
  { code: "manual_k53_test", name: "Manual refresher - K53 test" },
  { code: "manual_code8_k53", name: "Manual refresher - Code 8 K53" },
  { code: "manual_code10_k53", name: "Manual refresher - Code 10 K53" },
  { code: "refresher_own_car", name: "Refresher using own car" },
  { code: "learners_test", name: "Learner's test" },
  { code: "automatic_code8_refresher", name: "Automatic - Code 8 refresher" },
];

const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

const todayLocal = () => {
  const today = new Date();
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
};

const isValidDateTime = (date, time) => {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^\d{2}:\d{2}$/.test(time)
  ) {
    return false;
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day &&
    date >= todayLocal() &&
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59
  );
};

const isAllowedStaff = (req) =>
  allowedStaffRoles.includes(
    String(req.user?.role || "").trim().toLowerCase()
  );

// =====================================================
// PUBLIC: ACTIVE DRIVING SCHOOLS
// =====================================================

export const getPublicBookingSchools = (req, res) => {
  db.all("PRAGMA table_info(schools)", [], (err, columns) => {
    if (err) {
      console.error("PUBLIC SCHOOLS ERROR:", err.message);
      return sendError(res, 500, "Could not load driving schools.");
    }

    const names = new Set((columns || []).map((column) => column.name));
    let nameExpression;

    if (names.has("schoolName") && names.has("name")) {
      nameExpression = "COALESCE(NULLIF(schoolName, ''), name)";
    } else if (names.has("schoolName")) {
      nameExpression = "schoolName";
    } else if (names.has("name")) {
      nameExpression = "name";
    } else {
      return sendError(res, 500, "School name column was not found.");
    }

    db.all(
      `SELECT id, ${nameExpression} AS schoolName
       FROM schools
       WHERE LOWER(TRIM(COALESCE(status, 'Active'))) = 'active'
       ORDER BY schoolName`,
      [],
      (schoolErr, schools) => {
        if (schoolErr) {
          console.error("PUBLIC SCHOOLS ERROR:", schoolErr.message);
          return sendError(res, 500, "Could not load driving schools.");
        }

        return res.json(schools || []);
      }
    );
  });
};

// =====================================================
// PUBLIC: ACTIVE INSTRUCTORS FOR A SCHOOL
// =====================================================

export const getPublicBookingInstructors = (req, res) => {
  const schoolId = Number(req.params.schoolId);

  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    return sendError(res, 400, "Invalid driving school.");
  }

  db.get(
    `SELECT id FROM schools
     WHERE id = ?
       AND LOWER(TRIM(COALESCE(status, 'Active'))) = 'active'`,
    [schoolId],
    (schoolErr, school) => {
      if (schoolErr) {
        console.error("PUBLIC SCHOOL CHECK ERROR:", schoolErr.message);
        return sendError(res, 500, "Could not check the driving school.");
      }

      if (!school) {
        return sendError(res, 404, "Driving school not found or inactive.");
      }

      db.all(
        `SELECT id, name
         FROM instructors
         WHERE school_id = ?
           AND LOWER(TRIM(COALESCE(status, 'Active'))) = 'active'
         ORDER BY name`,
        [schoolId],
        (instructorErr, instructors) => {
          if (instructorErr) {
            console.error("PUBLIC INSTRUCTORS ERROR:", instructorErr.message);
            return sendError(res, 500, "Could not load instructors.");
          }

          return res.json(instructors || []);
        }
      );
    }
  );
};

// =====================================================
// INTERNAL: GET SCHOOL PRICING
// =====================================================

const getSchoolPricing = (schoolId, callback) => {
  db.get(
    `SELECT id, schoolName
     FROM schools
     WHERE id = ?
       AND LOWER(TRIM(COALESCE(status, 'Active'))) = 'active'`,
    [schoolId],
    (schoolErr, school) => {
      if (schoolErr) return callback(schoolErr);

      if (!school) {
        return callback(new Error("Driving school not found or inactive."));
      }

      db.get(
        `SELECT id, schoolName, defaultLessonPrice, defaultLessonDuration,
                lessonPrice, lessonDuration
         FROM settings
         WHERE school_id = ?
            OR LOWER(TRIM(COALESCE(schoolName, ''))) =
               LOWER(TRIM(?))
         ORDER BY CASE WHEN school_id = ? THEN 0 ELSE 1 END, id
         LIMIT 1`,
        [schoolId, school.schoolName, schoolId],
        (settingsErr, settings) => {
          if (settingsErr) return callback(settingsErr);

          if (!settings) {
            return callback(
              new Error("Pricing settings were not found for this school.")
            );
          }

          const defaultPrice = Number(settings.defaultLessonPrice);
          const savedPrice = Number(settings.lessonPrice);
          const defaultDuration = Number(settings.defaultLessonDuration);
          const savedDuration = Number(settings.lessonDuration);

          callback(null, {
            school_id: school.id,
            schoolName: school.schoolName,
            lessonPrice:
              Number.isFinite(defaultPrice) && defaultPrice > 0
                ? defaultPrice
                : Number.isFinite(savedPrice) && savedPrice > 0
                  ? savedPrice
                  : 0,
            lessonDuration:
              Number.isFinite(defaultDuration) && defaultDuration > 0
                ? defaultDuration
                : Number.isFinite(savedDuration) && savedDuration > 0
                  ? savedDuration
                  : 60,
          });
        }
      );
    }
  );
};

// =====================================================
// PUBLIC: SERVICE PRICES AND FIXED-PRICE PACKAGES
// =====================================================

export const getPublicBookingPricing = (req, res) => {
  const schoolId = Number(req.params.schoolId);

  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    return sendError(res, 400, "Invalid driving school.");
  }

  getSchoolPricing(schoolId, (err, pricing) => {
    if (err) {
      console.error("PUBLIC BOOKING PRICING ERROR:", err.message);
      const notFound =
        err.message.includes("not found") ||
        err.message.includes("inactive");

      return sendError(res, notFound ? 404 : 500, err.message);
    }

    db.all(
      `SELECT package_code, package_name, price, lesson_duration
       FROM school_lesson_package_prices
       WHERE school_id = ?`,
      [schoolId],
      (priceErr, savedPrices) => {
        if (priceErr) {
          console.error("PUBLIC SERVICE PRICES ERROR:", priceErr.message);
          return sendError(
            res,
            500,
            "Could not load this school's service prices."
          );
        }

        db.all(
          `SELECT id, service_code, package_name, lesson_count,
                  total_price, vehicle_code, included_services
           FROM school_fixed_lesson_packages
           WHERE school_id = ? AND is_active = 1
           ORDER BY service_code, lesson_count`,
          [schoolId],
          (packageErr, savedPackages) => {
            if (packageErr) {
              console.error("PUBLIC FIXED PACKAGES ERROR:", packageErr.message);
              return sendError(
                res,
                500,
                "Could not load this school's fixed packages."
              );
            }

            const priceMap = new Map(
              (savedPrices || []).map((item) => [
                item.package_code,
                {
                  price: Number(item.price),
                  duration: Number(item.lesson_duration) || 60,
                },
              ])
            );

            const packagesByService = new Map();

            (savedPackages || []).forEach((item) => {
              if (!packagesByService.has(item.service_code)) {
                packagesByService.set(item.service_code, []);
              }

              let includedServices = [];

              try {
                includedServices = Array.isArray(item.included_services)
                  ? item.included_services
                  : JSON.parse(item.included_services || "[]");

                if (!Array.isArray(includedServices)) {
                  includedServices = [];
                }
              } catch {
                includedServices = [];
              }

              packagesByService.get(item.service_code).push({
                package_id: Number(item.id),
                package_name: item.package_name,
                lesson_count: Number(item.lesson_count),
                total_price: Number(item.total_price),
                vehicle_code: item.vehicle_code || "",
                included_services: includedServices,
              });
            });

            const services = publicBookingServices.map((service) => {
              const saved = priceMap.get(service.code);
              const price = saved ? saved.price : null;

              return {
                service_code: service.code,
                service_name: service.name,
                price,
                duration: saved ? saved.duration : 60,
                available:
                  price !== null &&
                  Number.isFinite(price) &&
                  price > 0,
                fixed_packages: packagesByService.get(service.code) || [],
              };
            });

            return res.json({ ...pricing, services });
          }
        );
      }
    );
  });
};

// =====================================================
// PUBLIC: CREATE A PENDING BOOKING REQUEST
// =====================================================

export const createPublicLessonRequest = (req, res) => {
  const {
    school_id,
    customer_name,
    customer_phone,
    customer_email,
    requested_date,
    requested_time,
    preferred_instructor_id,
    customer_notes,
    lesson_count,
    lesson_schedule,
    service_code,
    package_id,
  } = req.body || {};

  const schoolId = Number(school_id);
  const instructorId =
    preferred_instructor_id === "" ||
    preferred_instructor_id == null
      ? null
      : Number(preferred_instructor_id);

  const packageId =
    package_id === "" || package_id == null ? null : Number(package_id);

  const name = String(customer_name || "").trim();
  const phone = String(customer_phone || "").trim();
  const email = String(customer_email || "").trim();
  const notes = String(customer_notes || "").trim();
  const serviceCode = String(service_code || "").trim();

  if (!Number.isInteger(schoolId) || schoolId <= 0 || !name || !phone) {
    return sendError(
      res,
      400,
      "Please provide your name, phone and driving school."
    );
  }

  if (
    name.length > 120 ||
    phone.length > 30 ||
    email.length > 150 ||
    notes.length > 1000
  ) {
    return sendError(res, 400, "One or more fields are too long.");
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendError(res, 400, "Please enter a valid email address.");
  }

  if (
    instructorId !== null &&
    (!Number.isInteger(instructorId) || instructorId <= 0)
  ) {
    return sendError(res, 400, "Invalid preferred instructor.");
  }

  if (
    packageId !== null &&
    (!Number.isInteger(packageId) || packageId <= 0)
  ) {
    return sendError(res, 400, "Invalid lesson package.");
  }

  const selectedService = publicBookingServices.find(
    (service) => service.code === serviceCode
  );

  if (!selectedService) {
    return sendError(res, 400, "Please select a valid service.");
  }

  if (packageId === null && Number(lesson_count ?? 1) !== 1) {
    return sendError(
      res,
      400,
      "Please select a saved fixed-price package for multiple lessons."
    );
  }

  const processRequest = (lessonCount, servicePrice, totalPrice, serviceName) => {
    let schedule;

    if (Array.isArray(lesson_schedule)) {
      schedule = lesson_schedule;
    } else if (lessonCount === 1 && requested_date && requested_time) {
      schedule = [
        {
          requested_date: String(requested_date).trim(),
          requested_time: String(requested_time).trim(),
        },
      ];
    } else {
      return sendError(
        res,
        400,
        "Please provide a preferred date and time for every lesson."
      );
    }

    if (schedule.length !== lessonCount) {
      return sendError(
        res,
        400,
        `Please provide exactly ${lessonCount} lesson dates and times.`
      );
    }

    const validatedSchedule = [];

    for (let index = 0; index < schedule.length; index++) {
      const slot = schedule[index] || {};
      const date = String(slot.requested_date ?? slot.date ?? "").trim();
      const time = String(slot.requested_time ?? slot.time ?? "").trim();

      if (!isValidDateTime(date, time)) {
        return sendError(
          res,
          400,
          `Choose a valid date and time for lesson ${index + 1}.`
        );
      }

      validatedSchedule.push({
        lesson_number: index + 1,
        requested_date: date,
        requested_time: time,
      });
    }

    const firstDate = validatedSchedule[0].requested_date;
    const firstTime = validatedSchedule[0].requested_time;
    const savedSchedule = JSON.stringify(validatedSchedule);

    const saveRequest = () => {
      db.run(
        `INSERT INTO lesson_booking_requests
         (school_id, customer_name, customer_phone, customer_email,
          requested_date, requested_time, preferred_instructor_id,
          customer_notes, status, lesson_count, total_price,
          lesson_schedule, service_code, service_name, service_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?, ?)`,
        [
          schoolId,
          name,
          phone,
          email || null,
          firstDate,
          firstTime,
          instructorId,
          notes || null,
          lessonCount,
          totalPrice,
          savedSchedule,
          selectedService.code,
          serviceName,
          servicePrice,
        ],
        function (insertErr) {
          if (insertErr) {
            console.error("PUBLIC LESSON REQUEST ERROR:", insertErr.message);
            return sendError(
              res,
              500,
              "Your request could not be saved. Please try again."
            );
          }

          return res.status(201).json({
            success: true,
            requestId: this.lastID,
            status: "Pending",
            service_code: selectedService.code,
            service_name: serviceName,
            service_price: servicePrice,
            lesson_count: lessonCount,
            total_price: totalPrice,
            lesson_schedule: validatedSchedule,
            message:
              "Your request has been submitted. The driving school must confirm it.",
          });
        }
      );
    };

    if (instructorId === null) return saveRequest();

    db.get(
      `SELECT id FROM instructors
       WHERE id = ? AND school_id = ?
         AND LOWER(TRIM(COALESCE(status, 'Active'))) = 'active'`,
      [instructorId, schoolId],
      (instructorErr, instructor) => {
        if (instructorErr) {
          console.error("BOOKING INSTRUCTOR CHECK ERROR:", instructorErr.message);
          return sendError(
            res,
            500,
            "Could not validate the preferred instructor."
          );
        }

        if (!instructor) {
          return sendError(
            res,
            400,
            "Please choose an active instructor from this school."
          );
        }

        return saveRequest();
      }
    );
  };

  db.get(
    `SELECT id FROM schools
     WHERE id = ?
       AND LOWER(TRIM(COALESCE(status, 'Active'))) = 'active'`,
    [schoolId],
    (schoolErr, school) => {
      if (schoolErr) {
        console.error("PUBLIC BOOKING SCHOOL CHECK ERROR:", schoolErr.message);
        return sendError(
          res,
          500,
          "Could not validate the driving school."
        );
      }

      if (!school) {
        return sendError(
          res,
          400,
          "Please select an active driving school."
        );
      }

      if (packageId !== null) {
        db.get(
          `SELECT id, package_name, lesson_count, total_price
           FROM school_fixed_lesson_packages
           WHERE id = ? AND school_id = ?
             AND service_code = ? AND is_active = 1`,
          [packageId, schoolId, selectedService.code],
          (packageErr, savedPackage) => {
            if (packageErr) {
              console.error("BOOKING FIXED PACKAGE ERROR:", packageErr.message);
              return sendError(
                res,
                500,
                "Could not verify the selected package."
              );
            }

            if (!savedPackage) {
              return sendError(
                res,
                400,
                "That package is unavailable for the selected school and service."
              );
            }

            const lessonCount = Number(savedPackage.lesson_count);
            const totalPrice = Number(savedPackage.total_price);

            if (
              !Number.isInteger(lessonCount) ||
              lessonCount < 2 ||
              lessonCount > 100 ||
              !Number.isFinite(totalPrice) ||
              totalPrice < 0
            ) {
              return sendError(
                res,
                400,
                "The selected package has invalid saved pricing."
              );
            }

            db.get(
              `SELECT price FROM school_lesson_package_prices
               WHERE school_id = ? AND package_code = ?`,
              [schoolId, selectedService.code],
              (priceErr, savedPrice) => {
                if (priceErr) {
                  console.error("BOOKING SERVICE PRICE ERROR:", priceErr.message);
                  return sendError(
                    res,
                    500,
                    "Could not verify the service price."
                  );
                }

                const servicePrice = Number(savedPrice?.price);
                const validPrice =
                  Number.isFinite(servicePrice) && servicePrice >= 0
                    ? servicePrice
                    : 0;

                return processRequest(
                  lessonCount,
                  validPrice,
                  totalPrice,
                  `${selectedService.name} - ${savedPackage.package_name}`
                );
              }
            );
          }
        );

        return;
      }

      db.get(
        `SELECT price FROM school_lesson_package_prices
         WHERE school_id = ? AND package_code = ?`,
        [schoolId, selectedService.code],
        (priceErr, savedPrice) => {
          if (priceErr) {
            console.error("BOOKING SERVICE PRICE ERROR:", priceErr.message);
            return sendError(
              res,
              500,
              "Could not verify the selected service price."
            );
          }

          const servicePrice = Number(savedPrice?.price);

          if (!savedPrice || !Number.isFinite(servicePrice) || servicePrice <= 0) {
            return sendError(
              res,
              400,
              "This service is not currently available at the selected school."
            );
          }

          return processRequest(
            1,
            servicePrice,
            Math.round(servicePrice * 100) / 100,
            selectedService.name
          );
        }
      );
    }
  );
};

// =====================================================
// STAFF: LIST BOOKING REQUESTS FOR THEIR SCHOOL
// =====================================================

export const getLessonBookingRequests = (req, res) => {
  const schoolId = Number(req.user?.school_id);

  if (!isAllowedStaff(req)) {
    return sendError(
      res,
      403,
      "Only administrators and receptionists can review requests."
    );
  }

  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    return sendError(res, 403, "Your account has no valid school assigned.");
  }

  db.all(
    `SELECT r.*, i.name AS preferred_instructor_name
     FROM lesson_booking_requests r
     LEFT JOIN instructors i ON i.id = r.preferred_instructor_id
     WHERE r.school_id = ?
     ORDER BY r.created_at DESC`,
    [schoolId],
    (err, requests) => {
      if (err) {
        console.error("GET BOOKING REQUESTS ERROR:", err.message);
        return sendError(res, 500, "Could not load booking requests.");
      }

      return res.json(requests || []);
    }
  );
};

// =====================================================
// STAFF: UPDATE REQUEST STATUS
// =====================================================

export const updateLessonBookingRequestStatus = (req, res) => {
  const schoolId = Number(req.user?.school_id);
  const requestId = Number(req.params.id);
  const status = String(req.body?.status || "").trim();

  if (!isAllowedStaff(req)) {
    return sendError(
      res,
      403,
      "Only administrators and receptionists can update requests."
    );
  }

  if (
    !Number.isInteger(schoolId) ||
    schoolId <= 0 ||
    !Number.isInteger(requestId) ||
    requestId <= 0
  ) {
    return sendError(res, 400, "Invalid school or request.");
  }

  if (!["Pending", "Contacted", "Rejected"].includes(status)) {
    return sendError(
      res,
      400,
      "Status must be Pending, Contacted or Rejected."
    );
  }

  db.run(
    `UPDATE lesson_booking_requests
     SET status = ?
     WHERE id = ? AND school_id = ? AND status != 'Scheduled'`,
    [status, requestId, schoolId],
    function (err) {
      if (err) {
        console.error("UPDATE BOOKING REQUEST ERROR:", err.message);
        return sendError(res, 500, "Could not update the request.");
      }

      if (this.changes === 0) {
        return sendError(res, 404, "Request not found or already scheduled.");
      }

      return res.json({
        success: true,
        message: "Request status updated.",
        status,
      });
    }
  );
};

// =====================================================
// STAFF: SCHEDULE A LESSON FROM A BOOKING REQUEST
// =====================================================

export const scheduleLessonFromRequest = (req, res) => {
  const schoolId = Number(req.user?.school_id);
  const requestId = Number(req.params.id);
  const body = req.body || {};

  if (!isAllowedStaff(req)) {
    return sendError(res, 403, "You are not authorised to schedule lessons.");
  }

  if (
    !Number.isInteger(schoolId) ||
    schoolId <= 0 ||
    !Number.isInteger(requestId) ||
    requestId <= 0
  ) {
    return sendError(res, 400, "Invalid school or booking request.");
  }

  // Accept both frontend payload formats.
  let assignments = body.session_assignments || body.sessions;

  // Backward compatibility for single-lesson requests.
  if (!Array.isArray(assignments)) {
    assignments = [
      {
        instructor_id: body.instructor_id,
        vehicle_id: body.vehicle_id,
        lesson_date: body.lesson_date,
        lesson_time: body.lesson_time,
      },
    ];
  }

  if (assignments.length < 1 || assignments.length > 100) {
    return sendError(res, 400, "Invalid lesson assignments.");
  }

  const today = todayLocal();

  const normalized = assignments.map((item) => ({
    instructorId: Number(item?.instructor_id),
    vehicleId: Number(item?.vehicle_id),
    date: String(item?.lesson_date || "").trim(),
    time: String(item?.lesson_time || "").trim(),
  }));

  for (let i = 0; i < normalized.length; i++) {
    const item = normalized[i];

    if (
      !Number.isInteger(item.instructorId) ||
      item.instructorId <= 0 ||
      !Number.isInteger(item.vehicleId) ||
      item.vehicleId <= 0 ||
      !isValidDateTime(item.date, item.time)
    ) {
      return sendError(
        res,
        400,
        `Choose a valid instructor, vehicle, date and time for lesson ${i + 1}.`
      );
    }

    if (item.date < today) {
      return sendError(
        res,
        400,
        `Lesson ${i + 1} cannot be in the past.`
      );
    }
  }

  for (let i = 0; i < normalized.length; i++) {
    for (let j = i + 1; j < normalized.length; j++) {
      const a = normalized[i];
      const b = normalized[j];

      if (
        a.date === b.date &&
        a.time === b.time &&
        (a.instructorId === b.instructorId ||
          a.vehicleId === b.vehicleId)
      ) {
        return sendError(
          res,
          409,
          `Lessons ${i + 1} and ${j + 1} cannot use the same instructor or vehicle at the same time.`
        );
      }
    }
  }

  db.serialize(() => {
    db.run("BEGIN IMMEDIATE TRANSACTION", (beginErr) => {
      if (beginErr) {
        console.error("SCHEDULE BEGIN ERROR:", beginErr.message);
        return sendError(res, 500, "Could not begin scheduling.");
      }

      let finished = false;

      const fail = (code, message) => {
        if (finished) return;
        finished = true;

        db.run("ROLLBACK", () => {
          res.status(code).json({ success: false, message });
        });
      };

      const succeed = (lessonIds, studentId) => {
        if (finished) return;
        finished = true;

        db.run("COMMIT", (commitErr) => {
          if (commitErr) {
            return db.run("ROLLBACK", () => {
              res.status(500).json({
                success: false,
                message: "Could not complete scheduling.",
              });
            });
          }

          return res.status(201).json({
            success: true,
            message: `Successfully scheduled ${lessonIds.length} lesson(s).`,
            lesson_id: lessonIds[0],
            lesson_ids: lessonIds,
            lessons_created: lessonIds.length,
            student_id: studentId,
            status: "Scheduled",
          });
        });
      };

      db.get(
        `SELECT * FROM lesson_booking_requests
         WHERE id = ? AND school_id = ?`,
        [requestId, schoolId],
        (requestErr, request) => {
          if (requestErr) {
            return fail(500, "Could not load the booking request.");
          }

          if (!request) {
            return fail(404, "Booking request not found for your school.");
          }

          if (request.lesson_id || request.status === "Scheduled") {
            return fail(
              409,
              "This request is already linked to a lesson or marked Scheduled. Check existing lessons before retrying."
            );
          }

          if (request.status === "Rejected") {
            return fail(400, "A rejected request cannot be scheduled.");
          }

          const expectedCount = Math.max(
            1,
            Number(request.lesson_count) || 1
          );

          if (normalized.length !== expectedCount) {
            return fail(
              400,
              `This package requires ${expectedCount} session assignment(s).`
            );
          }

          const resolved = [];
          let current = 0;

          const validateAssignments = () => {
            if (finished) return;

            if (current >= normalized.length) {
              checkConflicts(0, findOrCreateStudent);
              return;
            }

            const assignment = normalized[current];

            db.get(
              `SELECT id, name FROM instructors
               WHERE id = ? AND school_id = ?
                 AND LOWER(TRIM(COALESCE(status, 'Active'))) = 'active'`,
              [assignment.instructorId, schoolId],
              (instructorErr, instructor) => {
                if (instructorErr) {
                  return fail(500, "Could not validate the instructor.");
                }

                if (!instructor) {
                  return fail(
                    400,
                    `Lesson ${current + 1}: select an active instructor from your school.`
                  );
                }

                db.get(
                  `SELECT id, registration, model FROM vehicles
                   WHERE id = ? AND school_id = ?
                     AND LOWER(TRIM(COALESCE(status, 'Available'))) = 'available'`,
                  [assignment.vehicleId, schoolId],
                  (vehicleErr, vehicle) => {
                    if (vehicleErr) {
                      return fail(500, "Could not validate the vehicle.");
                    }

                    if (!vehicle) {
                      return fail(
                        400,
                        `Lesson ${current + 1}: select an available vehicle from your school.`
                      );
                    }

                    resolved.push({
                      ...assignment,
                      instructorName: instructor.name,
                      vehicleName:
                        `${vehicle.registration} - ${vehicle.model || ""}`.trim(),
                    });

                    current++;
                    validateAssignments();
                  }
                );
              }
            );
          };

          const checkConflicts = (index, callback) => {
            if (finished) return;

            if (index >= resolved.length) {
              return callback();
            }

            const item = resolved[index];

            db.get(
              `SELECT id FROM lessons
               WHERE school_id = ?
                 AND lesson_date = ?
                 AND lesson_time = ?
                 AND (
                   LOWER(TRIM(instructor)) = LOWER(TRIM(?))
                   OR LOWER(TRIM(vehicle)) = LOWER(TRIM(?))
                 )
               LIMIT 1`,
              [
                schoolId,
                item.date,
                item.time,
                item.instructorName,
                item.vehicleName,
              ],
              (conflictErr, conflict) => {
                if (conflictErr) {
                  return fail(500, "Could not check lesson availability.");
                }

                if (conflict) {
                  return fail(
                    409,
                    `Lesson ${index + 1}: the instructor or vehicle is already booked at that time.`
                  );
                }

                checkConflicts(index + 1, callback);
              }
            );
          };

          const findOrCreateStudent = () => {
            db.get(
              `SELECT id FROM students
               WHERE school_id = ?
                 AND (
                   LOWER(TRIM(phone)) = LOWER(TRIM(?))
                   OR LOWER(TRIM(fullname)) = LOWER(TRIM(?))
                 )
               ORDER BY CASE
                 WHEN LOWER(TRIM(phone)) = LOWER(TRIM(?)) THEN 0
                 ELSE 1
               END
               LIMIT 1`,
              [
                schoolId,
                request.customer_phone,
                request.customer_name,
                request.customer_phone,
              ],
              (studentErr, student) => {
                if (studentErr) {
                  return fail(500, "Could not find the student.");
                }

                if (student) {
                  return createLessons(student.id);
                }

                db.run(
                  `INSERT INTO students
                   (fullname, phone, email, status, school_id)
                   VALUES (?, ?, ?, 'Active', ?)`,
                  [
                    request.customer_name,
                    request.customer_phone,
                    request.customer_email || null,
                    schoolId,
                  ],
                  function (createStudentErr) {
                    if (createStudentErr) {
                      console.error(
                        "SCHEDULE STUDENT ERROR:",
                        createStudentErr.message
                      );
                      return fail(
                        500,
                        "Could not create the student profile."
                      );
                    }

                    createLessons(this.lastID);
                  }
                );
              }
            );
          };

          const createLessons = (studentId) => {
            const lessonIds = [];
            let index = 0;

            const createNext = () => {
              if (finished) return;

              if (index >= resolved.length) {
                db.run(
                  `UPDATE lesson_booking_requests
                   SET lesson_id = ?, status = 'Scheduled'
                   WHERE id = ? AND school_id = ?
                     AND lesson_id IS NULL
                     AND status IN ('Pending', 'Contacted')`,
                  [lessonIds[0], requestId, schoolId],
                  function (updateErr) {
                    if (updateErr) {
                      return fail(
                        500,
                        "Could not update the booking request."
                      );
                    }

                    if (this.changes !== 1) {
                      return fail(
                        409,
                        "The request changed while scheduling. The transaction will be rolled back."
                      );
                    }

                    return succeed(lessonIds, studentId);
                  }
                );

                return;
              }

              const item = resolved[index];

              db.run(
                `INSERT INTO lessons
                 (student, instructor, vehicle, lesson_date,
                  lesson_time, status, school_id)
                 VALUES (?, ?, ?, ?, ?, 'Booked', ?)`,
                [
                  request.customer_name,
                  item.instructorName,
                  item.vehicleName,
                  item.date,
                  item.time,
                  schoolId,
                ],
                function (lessonErr) {
                  if (lessonErr) {
                    console.error("SCHEDULE LESSON ERROR:", lessonErr.message);
                    return fail(
                      500,
                      "Could not create all lessons in the package."
                    );
                  }

                  lessonIds.push(this.lastID);
                  index++;
                  createNext();
                }
              );
            };

            createNext();
          };

          validateAssignments();
        }
      );
    });
  });
};
