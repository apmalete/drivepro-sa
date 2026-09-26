require("dotenv").config();

async function testWhatsApp() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v25.0";

  if (!token) {
    console.error("❌ WHATSAPP_ACCESS_TOKEN is missing");
    return;
  }

  if (!phoneNumberId) {
    console.error("❌ WHATSAPP_PHONE_NUMBER_ID is missing");
    return;
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: "27797551170",
    type: "template",
    template: {
      name: "hello_world",
      language: {
        code: "en_US"
      }
    }
  };

  console.log("📱 Testing WhatsApp...");
  console.log("Phone Number ID:", phoneNumberId);
  console.log("Recipient:", "27797551170");
  console.log("Template:", "hello_world");
  console.log("Language:", "en_US");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    console.log("\n📨 Meta response:");
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("\n✅ WHATSAPP TEST SUCCESSFUL!");
    } else {
      console.log("\n❌ WHATSAPP TEST FAILED");
    }
  } catch (error) {
    console.error("\n❌ Connection error:", error.message);
  }
}

testWhatsApp();