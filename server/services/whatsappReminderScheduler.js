/**
 * ============================================================
 * DrivePro-SA WhatsApp Reminder Scheduler
 * ============================================================
 *
 * Automatically checks:
 *
 * 1. Confirmed test bookings
 * 2. Test-day reminders
 * 3. Booked driving lessons
 * 4. Lesson-day reminders
 *
 * The scheduler runs every 60 seconds.
 */

import db from "../database/database.js";

import {
  isWhatsAppConfigured,
  sendTestBookingConfirmation,
  sendTestDayReminder,
  sendLessonBookingNotification,
  sendLessonDayReminder,
} from "./whatsappService.js";


const TIME_ZONE =
  "Africa/Johannesburg";


// ============================================================
// GET CURRENT SOUTH AFRICAN DATE
// ============================================================

function getSouthAfricanDate() {

  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          TIME_ZONE,

        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    );

  return formatter.format(
    new Date()
  );
}


// ============================================================
// TEST BOOKINGS
// ============================================================

function getPendingConfirmationBookings() {

  return new Promise(
    (resolve, reject) => {

      db.all(
        `
        SELECT
          tb.id,
          tb.student_id,
          tb.student_name,
          tb.test_type,
          tb.booking_date,
          tb.booking_time,
          tb.test_centre,
          tb.booking_reference,
          tb.status,
          tb.reminder_sent,
          tb.day_reminder_sent,
          tb.school_id,
          s.phone
        FROM test_bookings tb

        LEFT JOIN students s
          ON s.id = tb.student_id
         AND s.school_id = tb.school_id

        WHERE
          tb.status = 'Confirmed'
          AND tb.reminder_sent = 0

        ORDER BY
          tb.booking_date,
          tb.booking_time
        `,
        [],
        (err, rows) => {

          if (err) {
            return reject(err);
          }

          resolve(
            rows || []
          );
        }
      );

    }
  );
}


function getTodayBookings() {

  const today =
    getSouthAfricanDate();

  return new Promise(
    (resolve, reject) => {

      db.all(
        `
        SELECT
          tb.id,
          tb.student_id,
          tb.student_name,
          tb.test_type,
          tb.booking_date,
          tb.booking_time,
          tb.test_centre,
          tb.booking_reference,
          tb.status,
          tb.reminder_sent,
          tb.day_reminder_sent,
          tb.school_id,
          s.phone
        FROM test_bookings tb

        LEFT JOIN students s
          ON s.id = tb.student_id
         AND s.school_id = tb.school_id

        WHERE
          tb.status = 'Confirmed'
          AND tb.booking_date = ?
          AND tb.day_reminder_sent = 0

        ORDER BY
          tb.booking_time
        `,
        [today],
        (err, rows) => {

          if (err) {
            return reject(err);
          }

          resolve(
            rows || []
          );
        }
      );

    }
  );
}


function markConfirmationSent(
  bookingId
) {

  return new Promise(
    (resolve, reject) => {

      db.run(
        `
        UPDATE test_bookings
        SET reminder_sent = 1
        WHERE id = ?
        `,
        [bookingId],
        (err) => {

          if (err) {
            return reject(err);
          }

          resolve();
        }
      );

    }
  );
}


function markDayReminderSent(
  bookingId
) {

  return new Promise(
    (resolve, reject) => {

      db.run(
        `
        UPDATE test_bookings
        SET day_reminder_sent = 1
        WHERE id = ?
        `,
        [bookingId],
        (err) => {

          if (err) {
            return reject(err);
          }

          resolve();
        }
      );

    }
  );
}


// ============================================================
// PROCESS TEST BOOKING CONFIRMATIONS
// ============================================================

async function processConfirmationMessages() {

  if (!isWhatsAppConfigured()) {
    return;
  }

  let bookings;

  try {

    bookings =
      await getPendingConfirmationBookings();

  } catch (error) {

    console.error(
      "WHATSAPP BOOKING QUERY ERROR:",
      error.message
    );

    return;
  }


  for (
    const booking of bookings
  ) {

    if (!booking.phone) {

      console.error(
        `WhatsApp reminder skipped for ${booking.student_name}: no phone number.`
      );

      continue;
    }


    try {

      console.log(
        `Sending test booking confirmation to ${booking.student_name}...`
      );

      await sendTestBookingConfirmation(
        booking
      );

      await markConfirmationSent(
        booking.id
      );

      console.log(
        `Test booking confirmation sent to ${booking.student_name}.`
      );

    } catch (error) {

      console.error(
        `WhatsApp confirmation failed for ${booking.student_name}:`,
        error.message
      );
    }
  }
}


// ============================================================
// PROCESS TEST DAY REMINDERS
// ============================================================

async function processDayReminders() {

  if (!isWhatsAppConfigured()) {
    return;
  }

  let bookings;

  try {

    bookings =
      await getTodayBookings();

  } catch (error) {

    console.error(
      "WHATSAPP DAY REMINDER QUERY ERROR:",
      error.message
    );

    return;
  }


  for (
    const booking of bookings
  ) {

    if (!booking.phone) {

      console.error(
        `Day reminder skipped for ${booking.student_name}: no phone number.`
      );

      continue;
    }


    try {

      console.log(
        `Sending test day reminder to ${booking.student_name}...`
      );

      await sendTestDayReminder(
        booking
      );

      await markDayReminderSent(
        booking.id
      );

      console.log(
        `Test day reminder sent to ${booking.student_name}.`
      );

    } catch (error) {

      /*
       * The second template has not been configured yet.
       * Do not repeatedly print an error every 60 seconds.
       */

      if (
        error.message.includes(
          "WHATSAPP_TEST_DAY_REMINDER_TEMPLATE"
        )
      ) {
        return;
      }

      console.error(
        `WhatsApp day reminder failed for ${booking.student_name}:`,
        error.message
      );
    }
  }
}


// ============================================================
// LESSON QUERIES
// ============================================================

function getPendingLessonNotifications() {

  return new Promise(
    (resolve, reject) => {

      db.all(
        `
        SELECT
          l.id,
          l.student,
          l.instructor,
          l.vehicle,
          l.lesson_date,
          l.lesson_time,
          l.status,
          l.notification_sent,
          l.day_reminder_sent,
          l.school_id,
          s.phone
        FROM lessons l

        LEFT JOIN students s
          ON LOWER(TRIM(s.fullname))
           = LOWER(TRIM(l.student))
         AND s.school_id = l.school_id

        WHERE
          l.status NOT IN ('Cancelled', 'Completed')
          AND l.notification_sent = 0

        ORDER BY
          l.lesson_date,
          l.lesson_time
        `,
        [],
        (err, rows) => {

          if (err) {
            return reject(err);
          }

          resolve(
            rows || []
          );
        }
      );

    }
  );
}


function getTodayLessons() {

  const today =
    getSouthAfricanDate();

  return new Promise(
    (resolve, reject) => {

      db.all(
        `
        SELECT
          l.id,
          l.student,
          l.instructor,
          l.vehicle,
          l.lesson_date,
          l.lesson_time,
          l.status,
          l.notification_sent,
          l.day_reminder_sent,
          l.school_id,
          s.phone
        FROM lessons l

        LEFT JOIN students s
          ON LOWER(TRIM(s.fullname))
           = LOWER(TRIM(l.student))
         AND s.school_id = l.school_id

        WHERE
          l.status NOT IN ('Cancelled', 'Completed')
          AND l.lesson_date = ?
          AND l.day_reminder_sent = 0

        ORDER BY
          l.lesson_time
        `,
        [today],
        (err, rows) => {

          if (err) {
            return reject(err);
          }

          resolve(
            rows || []
          );
        }
      );

    }
  );
}


// ============================================================
// MARK LESSON NOTIFICATION SENT
// ============================================================

function markLessonNotificationSent(
  lessonId
) {

  return new Promise(
    (resolve, reject) => {

      db.run(
        `
        UPDATE lessons
        SET notification_sent = 1
        WHERE id = ?
        `,
        [lessonId],
        (err) => {

          if (err) {
            return reject(err);
          }

          resolve();
        }
      );

    }
  );
}


// ============================================================
// MARK LESSON DAY REMINDER SENT
// ============================================================

function markLessonDayReminderSent(
  lessonId
) {

  return new Promise(
    (resolve, reject) => {

      db.run(
        `
        UPDATE lessons
        SET day_reminder_sent = 1
        WHERE id = ?
        `,
        [lessonId],
        (err) => {

          if (err) {
            return reject(err);
          }

          resolve();
        }
      );

    }
  );
}


// ============================================================
// PROCESS LESSON BOOKING NOTIFICATIONS
// ============================================================

async function processLessonNotifications() {

  if (!isWhatsAppConfigured()) {
    return;
  }

  let lessons;

  try {

    lessons =
      await getPendingLessonNotifications();

  } catch (error) {

    console.error(
      "WHATSAPP LESSON QUERY ERROR:",
      error.message
    );

    return;
  }


  for (
    const lesson of lessons
  ) {

    if (!lesson.phone) {

      console.error(
        `Lesson WhatsApp notification skipped for ${lesson.student}: no phone number.`
      );

      continue;
    }


    try {

      console.log(
        `Sending lesson booking notification to ${lesson.student}...`
      );

      await sendLessonBookingNotification(
        lesson
      );

      await markLessonNotificationSent(
        lesson.id
      );

      console.log(
        `Lesson booking notification sent to ${lesson.student}.`
      );

    } catch (error) {

      /*
       * Lesson template is not configured yet.
       * Leave notification_sent = 0 so the lesson can
       * automatically send once the template is configured.
       */

      if (
        error.message.includes(
          "WHATSAPP_LESSON_BOOKING_TEMPLATE"
        )
      ) {
        return;
      }

      console.error(
        `Lesson WhatsApp notification failed for ${lesson.student}:`,
        error.message
      );
    }
  }
}


// ============================================================
// PROCESS LESSON DAY REMINDERS
// ============================================================

async function processLessonDayReminders() {

  if (!isWhatsAppConfigured()) {
    return;
  }

  let lessons;

  try {

    lessons =
      await getTodayLessons();

  } catch (error) {

    console.error(
      "WHATSAPP LESSON DAY QUERY ERROR:",
      error.message
    );

    return;
  }


  for (
    const lesson of lessons
  ) {

    if (!lesson.phone) {

      console.error(
        `Lesson day reminder skipped for ${lesson.student}: no phone number.`
      );

      continue;
    }


    try {

      console.log(
        `Sending lesson day reminder to ${lesson.student}...`
      );

      await sendLessonDayReminder(
        lesson
      );

      await markLessonDayReminderSent(
        lesson.id
      );

      console.log(
        `Lesson day reminder sent to ${lesson.student}.`
      );

    } catch (error) {

      if (
        error.message.includes(
          "WHATSAPP_LESSON_DAY_REMINDER_TEMPLATE"
        )
      ) {
        return;
      }

      console.error(
        `Lesson day reminder failed for ${lesson.student}:`,
        error.message
      );
    }
  }
}


// ============================================================
// RUN ALL WHATSAPP TASKS
// ============================================================

async function runWhatsAppReminderCheck() {

  console.log(
    "📱 Checking DrivePro-SA WhatsApp reminders..."
  );

  await processConfirmationMessages();

  await processDayReminders();

  await processLessonNotifications();

  await processLessonDayReminders();
}


// ============================================================
// START SCHEDULER
// ============================================================

export function startWhatsAppReminderScheduler() {

  console.log(
    "📱 WhatsApp reminder scheduler started."
  );

  runWhatsAppReminderCheck()
    .catch(
      (error) => {

        console.error(
          "WHATSAPP INITIAL CHECK ERROR:",
          error.message
        );

      }
    );


  setInterval(
    () => {

      runWhatsAppReminderCheck()
        .catch(
          (error) => {

            console.error(
              "WHATSAPP SCHEDULER ERROR:",
              error.message
            );

          }
        );

    },
    60 * 1000
  );
}