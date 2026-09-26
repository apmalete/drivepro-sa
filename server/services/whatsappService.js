/**
 * ============================================================
 * DrivePro-SA WhatsApp Service
 * ============================================================
 *
 * Connects DrivePro-SA to the Meta WhatsApp Cloud API.
 *
 * IMPORTANT:
 * South African numbers are automatically converted to:
 *
 * 0797551170
 *      ↓
 * 27797551170
 *
 * Meta WhatsApp Cloud API requires the international format.
 */

const API_VERSION =
  process.env.WHATSAPP_API_VERSION || "v25.0";

const ACCESS_TOKEN =
  process.env.WHATSAPP_ACCESS_TOKEN;

const PHONE_NUMBER_ID =
  process.env.WHATSAPP_PHONE_NUMBER_ID;


// ============================================================
// TEST BOOKING TEMPLATES
// ============================================================

const TEST_BOOKING_TEMPLATE =
  process.env.WHATSAPP_TEST_BOOKING_TEMPLATE ||
  "drivepro_test_booking";

const TEST_BOOKING_TEMPLATE_LANGUAGE =
  process.env.WHATSAPP_TEST_BOOKING_LANGUAGE ||
  "en";

const TEST_DAY_TEMPLATE =
  process.env.WHATSAPP_TEST_DAY_REMINDER_TEMPLATE ||
  "";

const TEST_DAY_TEMPLATE_LANGUAGE =
  process.env.WHATSAPP_TEST_DAY_REMINDER_LANGUAGE ||
  "en";


// ============================================================
// LESSON TEMPLATES
// ============================================================

const LESSON_BOOKING_TEMPLATE =
  process.env.WHATSAPP_LESSON_BOOKING_TEMPLATE ||
  "";

const LESSON_BOOKING_TEMPLATE_LANGUAGE =
  process.env.WHATSAPP_LESSON_BOOKING_LANGUAGE ||
  "en";

const LESSON_DAY_TEMPLATE =
  process.env.WHATSAPP_LESSON_DAY_REMINDER_TEMPLATE ||
  "";

const LESSON_DAY_TEMPLATE_LANGUAGE =
  process.env.WHATSAPP_LESSON_DAY_REMINDER_LANGUAGE ||
  "en";


// ============================================================
// NORMALIZE WHATSAPP PHONE NUMBER
// ============================================================

function normalizeWhatsAppPhoneNumber(phoneNumber) {

  if (!phoneNumber) {
    throw new Error(
      "A WhatsApp phone number is required."
    );
  }

  let phone =
    String(phoneNumber).trim();

  phone =
    phone.replace(
      /[^0-9+]/g,
      ""
    );

  if (phone.startsWith("+27")) {
    phone =
      phone.substring(1);
  }

  if (phone.startsWith("27")) {
    return phone;
  }

  if (phone.startsWith("0")) {
    return (
      "27" +
      phone.substring(1)
    );
  }

  return phone;
}


// ============================================================
// CHECK CONFIGURATION
// ============================================================

export function isWhatsAppConfigured() {

  return Boolean(
    ACCESS_TOKEN &&
    PHONE_NUMBER_ID
  );
}


// ============================================================
// GET API URL
// ============================================================

function getWhatsAppApiUrl() {

  if (!PHONE_NUMBER_ID) {
    throw new Error(
      "WHATSAPP_PHONE_NUMBER_ID is not configured."
    );
  }

  return (
    `https://graph.facebook.com/` +
    `${API_VERSION}/` +
    `${PHONE_NUMBER_ID}/messages`
  );
}


// ============================================================
// SEND NORMAL TEXT MESSAGE
// ============================================================

export async function sendWhatsAppText(
  phoneNumber,
  message
) {

  if (!ACCESS_TOKEN) {
    throw new Error(
      "WHATSAPP_ACCESS_TOKEN is not configured."
    );
  }

  if (!PHONE_NUMBER_ID) {
    throw new Error(
      "WHATSAPP_PHONE_NUMBER_ID is not configured."
    );
  }

  if (!phoneNumber) {
    throw new Error(
      "A WhatsApp phone number is required."
    );
  }

  if (!message) {
    throw new Error(
      "A WhatsApp message is required."
    );
  }

  const normalizedPhone =
    normalizeWhatsAppPhoneNumber(
      phoneNumber
    );

  console.log(
    "WhatsApp phone number:",
    phoneNumber,
    "→",
    normalizedPhone
  );

  const response =
    await fetch(
      getWhatsAppApiUrl(),
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${ACCESS_TOKEN}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            messaging_product:
              "whatsapp",

            to:
              normalizedPhone,

            type:
              "text",

            text: {
              preview_url:
                false,

              body:
                message,
            },
          }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {

    console.error(
      "WhatsApp API Error:",
      JSON.stringify(
        data,
        null,
        2
      )
    );

    throw new Error(
      data?.error?.message ||
      "WhatsApp API request failed."
    );
  }

  console.log(
    "WhatsApp text message sent:",
    JSON.stringify(
      data,
      null,
      2
    )
  );

  return data;
}


// ============================================================
// SEND WHATSAPP TEMPLATE
// ============================================================

export async function sendWhatsAppTemplate(
  phoneNumber,
  templateName,
  languageCode = "en",
  parameters = []
) {

  if (!ACCESS_TOKEN) {
    throw new Error(
      "WHATSAPP_ACCESS_TOKEN is not configured."
    );
  }

  if (!PHONE_NUMBER_ID) {
    throw new Error(
      "WHATSAPP_PHONE_NUMBER_ID is not configured."
    );
  }

  if (!phoneNumber) {
    throw new Error(
      "A WhatsApp phone number is required."
    );
  }

  if (!templateName) {
    throw new Error(
      "A WhatsApp template name is required."
    );
  }

  const normalizedPhone =
    normalizeWhatsAppPhoneNumber(
      phoneNumber
    );

  console.log(
    "WhatsApp phone number:",
    phoneNumber,
    "→",
    normalizedPhone
  );

  const bodyParameters =
    parameters.map(
      (value) => ({
        type:
          "text",

        text:
          String(
            value ?? ""
          ),
      })
    );

  const requestBody = {

    messaging_product:
      "whatsapp",

    to:
      normalizedPhone,

    type:
      "template",

    template: {

      name:
        templateName,

      language: {

        code:
          languageCode,

      },

      components: [

        {

          type:
            "body",

          parameters:
            bodyParameters,

        },

      ],

    },

  };


  console.log(
    "Sending WhatsApp template:",
    JSON.stringify(
      requestBody,
      null,
      2
    )
  );


  const response =
    await fetch(
      getWhatsAppApiUrl(),
      {

        method:
          "POST",

        headers: {

          Authorization:
            `Bearer ${ACCESS_TOKEN}`,

          "Content-Type":
            "application/json",

        },

        body:
          JSON.stringify(
            requestBody
          ),

      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    console.error(
      "WhatsApp TEMPLATE API ERROR:",
      JSON.stringify(
        data,
        null,
        2
      )
    );

    throw new Error(
      data?.error?.message ||
      "WhatsApp template request failed."
    );
  }


  console.log(
    "WhatsApp template sent successfully:",
    JSON.stringify(
      data,
      null,
      2
    )
  );


  return data;
}


// ============================================================
// TEST MESSAGE
// ============================================================

export async function sendDriveProTestMessage(
  phoneNumber
) {

  const message =
    "🚗 DrivePro-SA WhatsApp Test\n\n" +
    "Hello! This is a test message from DrivePro-SA.\n\n" +
    "WhatsApp notifications are connected successfully.";

  return sendWhatsAppText(
    phoneNumber,
    message
  );
}


// ============================================================
// TEST BOOKING CONFIRMATION
// ============================================================

export async function sendTestBookingConfirmation(
  booking
) {

  if (!booking) {
    throw new Error(
      "Test booking information is required."
    );
  }

  if (!booking.phone) {
    throw new Error(
      `No phone number found for ${booking.student_name}.`
    );
  }

  return sendWhatsAppTemplate(

    booking.phone,

    TEST_BOOKING_TEMPLATE,

    TEST_BOOKING_TEMPLATE_LANGUAGE,

    [

      booking.student_name,

      booking.test_type,

      formatTestDate(
        booking.booking_date
      ),

      booking.booking_time,

      booking.test_centre ||
        "Test Centre",

    ]

  );
}


// ============================================================
// TEST DAY REMINDER
// ============================================================

export async function sendTestDayReminder(
  booking
) {

  if (!TEST_DAY_TEMPLATE) {

    throw new Error(
      "WHATSAPP_TEST_DAY_REMINDER_TEMPLATE is not configured yet."
    );
  }

  if (!booking.phone) {

    throw new Error(
      `No phone number found for ${booking.student_name}.`
    );
  }

  return sendWhatsAppTemplate(

    booking.phone,

    TEST_DAY_TEMPLATE,

    TEST_DAY_TEMPLATE_LANGUAGE,

    [

      booking.student_name,

      booking.test_type,

      booking.booking_time,

      booking.test_centre ||
        "Test Centre",

    ]

  );
}


// ============================================================
// LESSON BOOKING NOTIFICATION
// ============================================================

export async function sendLessonBookingNotification(
  lesson
) {

  if (!LESSON_BOOKING_TEMPLATE) {

    throw new Error(
      "WHATSAPP_LESSON_BOOKING_TEMPLATE is not configured yet."
    );
  }

  if (!lesson.phone) {

    throw new Error(
      `No phone number found for ${lesson.student}.`
    );
  }

  return sendWhatsAppTemplate(

    lesson.phone,

    LESSON_BOOKING_TEMPLATE,

    LESSON_BOOKING_TEMPLATE_LANGUAGE,

    [

      lesson.student,

      formatTestDate(
        lesson.lesson_date
      ),

      lesson.lesson_time,

      lesson.instructor,

      lesson.vehicle,

    ]

  );
}


// ============================================================
// LESSON DAY REMINDER
// ============================================================

export async function sendLessonDayReminder(
  lesson
) {

  if (!LESSON_DAY_TEMPLATE) {

    throw new Error(
      "WHATSAPP_LESSON_DAY_REMINDER_TEMPLATE is not configured yet."
    );
  }

  if (!lesson.phone) {

    throw new Error(
      `No phone number found for ${lesson.student}.`
    );
  }

  return sendWhatsAppTemplate(

    lesson.phone,

    LESSON_DAY_TEMPLATE,

    LESSON_DAY_TEMPLATE_LANGUAGE,

    [

      lesson.student,

      lesson.lesson_time,

      lesson.instructor,

    ]

  );
}


// ============================================================
// FORMAT DATE
// ============================================================

function formatTestDate(
  dateString
) {

  if (!dateString) {
    return "";
  }

  const parts =
    String(dateString)
      .split("-");

  if (
    parts.length !== 3
  ) {
    return dateString;
  }

  const [
    year,
    month,
    day,
  ] = parts;

  const date =
    new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

  return date.toLocaleDateString(
    "en-ZA",
    {
      day:
        "numeric",

      month:
        "long",

      year:
        "numeric",
    }
  );
}