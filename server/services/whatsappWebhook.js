import express from "express";
import crypto from "crypto";
import db from "../database/database.js";

const router = express.Router();

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
const APP_SECRET = process.env.META_APP_SECRET;

function runDatabase(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) return reject(error);
      resolve(this);
    });
  });
}

async function saveStatuses(statuses) {
  for (const message of statuses) {
    const error = message.errors?.[0];

    await runDatabase(
      `INSERT INTO whatsapp_message_status (
        message_id,
        recipient_id,
        status,
        event_timestamp,
        error_code,
        error_message,
        payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        message.id || null,
        message.recipient_id || null,
        message.status || null,
        message.timestamp || null,
        error?.code?.toString() || null,
        error?.title || error?.message || null,
        JSON.stringify(message)
      ]
    );

    console.log("WhatsApp delivery status:", message.status, message.id);
  }
}

db.run(`
  CREATE TABLE IF NOT EXISTS whatsapp_message_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT,
    recipient_id TEXT,
    status TEXT,
    event_timestamp TEXT,
    error_code TEXT,
    error_message TEXT,
    payload TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (error) => {
  if (error) {
    console.error("WhatsApp status table error:", error.message);
  } else {
    console.log("WhatsApp status table ready.");
  }
});

router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && VERIFY_TOKEN && token === VERIFY_TOKEN) {
    console.log("WhatsApp webhook verified.");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    if (!APP_SECRET) {
      console.error("META_APP_SECRET is not configured.");
      return res.sendStatus(500);
    }

    const signature = req.get("x-hub-signature-256");

    if (!signature || !Buffer.isBuffer(req.body)) {
      return res.sendStatus(401);
    }

    const expectedSignature =
      "sha256=" +
      crypto.createHmac("sha256", APP_SECRET).update(req.body).digest("hex");

    const supplied = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    if (
      supplied.length !== expected.length ||
      !crypto.timingSafeEqual(supplied, expected)
    ) {
      console.warn("Invalid WhatsApp webhook signature.");
      return res.sendStatus(401);
    }

    const body = JSON.parse(req.body.toString("utf8"));

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const statuses = change.value?.statuses || [];
        await saveStatuses(statuses);
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("WhatsApp webhook processing failed:", error.message);
    return res.sendStatus(500);
  }
});

export default router;
