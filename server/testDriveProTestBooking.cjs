require("dotenv").config();

async function testDriveProTestBooking() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v25.0";

  const recipient = "27797551170";

  const templateName =
    process.env.WHATSAPP_TEST_BOOKING_TEMPLATE ||
    "drivepro_test_booking";

  const languageCode =
    process.env.WHATSAPP_TEST_BOOKING_LANGUAGE ||
    "en";

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const studentName = "Puleng";
  const testType = "Learner's Licence";
  const testDate = "29 September 2026";
  const testTime = "10:30";
  const testCentre = "Ransburg";

  const body = {
    messaging_product: "whatsapp",
    to: recipient,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: studentName,
            },
            {
              type: "text",
              text: testType,
            },
            {
              type: "text",
              text: testDate,
            },
            {
              type: "text",
              text: testTime,
            },
            {
              type: "text",
              text: testCentre,
            },
          ],
        },
      ],
    },
  };

  console.log("📱 Testing DrivePro test-booking template...");
  console.log("Phone Number ID:", phoneNumberId);
  console.log("Recipient:", recipient);
  console.log("Template:", templateName);
  console.log("Language:", languageCode);

  console.log("\nTemplate parameters:");
  console.log("1. Student:", studentName);
  console.log("2. Test type:", testType);
  console.log("3. Date:", testDate);
  console.log("4. Time:", testTime);
  console.log("5. Test centre:", testCentre);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    console.log("\n📨 Meta response:");
    console.log(JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.log("\n❌ DRIVEPRO TEST-BOOKING WHATSAPP FAILED");
      return;
    }

    console.log("\n✅ DRIVEPRO TEST-BOOKING WHATSAPP SENT SUCCESSFULLY!");
  } catch (error) {
    console.error("\n❌ REQUEST ERROR:");
    console.error(error.message);
  }
}

testDriveProTestBooking();