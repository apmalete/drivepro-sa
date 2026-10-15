import assert from "node:assert/strict";
import db from "./database/database.js";
import { getSettings, updateSettings } from "./controllers/settingsController.js";

const runQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const callController = (controller, req) =>
  new Promise((resolve, reject) => {
    let statusCode = 200;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(body) {
        resolve({ statusCode, body });
        return this;
      },
    };

    try {
      controller(req, res);
    } catch (err) {
      reject(err);
    }
  });

try {
  console.log("1. Reading Malete Driving School settings...");

  const before = await runQuery(
    `SELECT id, school_id, schoolName, phone, email, address,
            registrationNumber, defaultLessonDuration, defaultLessonPrice
     FROM settings WHERE school_id = 1 ORDER BY id LIMIT 1`
  );

  assert.ok(before, "School 1 settings must exist in the test database.");
  console.log("   School 1:", before.schoolName);

  console.log("2. Updating School 2 with test-only details...");

  const updateResult = await callController(updateSettings, {
    user: { school_id: 2, role: "Admin" },
    body: {
      schoolName: "School Two Isolation Test",
      phone: "0000000000",
      email: "school2-test@example.invalid",
      address: "TEST ONLY",
      registrationNumber: "TEST-ONLY",
      defaultLessonDuration: 60,
      defaultLessonPrice: 0,
    },
  });

  assert.equal(updateResult.statusCode, 200, JSON.stringify(updateResult.body));
  assert.equal(updateResult.body.success, true, JSON.stringify(updateResult.body));
  console.log("   Update succeeded:", updateResult.body.message);

  console.log("3. Verifying School 2 has its own settings...");

  const school2Result = await callController(getSettings, {
    user: { school_id: 2, role: "Admin" },
  });

  assert.equal(school2Result.statusCode, 200);
  assert.equal(school2Result.body.schoolName, "School Two Isolation Test");
  assert.equal(school2Result.body.school_id, 2);
  console.log("   School 2:", school2Result.body.schoolName);

  console.log("4. Checking Malete Driving School was not changed...");

  const after = await runQuery(
    `SELECT id, school_id, schoolName, phone, email, address,
            registrationNumber, defaultLessonDuration, defaultLessonPrice
     FROM settings WHERE school_id = 1 ORDER BY id LIMIT 1`
  );

  assert.deepEqual(
    after,
    before,
    "FAIL: School 1 settings changed when School 2 was updated."
  );

  console.log("   School 1 remains unchanged:", after.schoolName);
  console.log("\nPASS: School 2 settings are isolated from School 1.");
} catch (err) {
  console.error("\nTEST FAILED:", err.message);
  process.exitCode = 1;
} finally {
  db.close();
}
