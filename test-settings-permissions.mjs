import assert from "node:assert/strict";
import { requireSettingsAdministrator } from "./server/middleware/authMiddleware.js";

function check(user) {
  let statusCode = 200;
  let nextCalled = false;
  let responseBody;

  const req = { user };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  requireSettingsAdministrator(req, res, () => {
    nextCalled = true;
  });

  return { statusCode, nextCalled, responseBody };
}

for (const role of ["Admin", "Administrator", "System Administrator"]) {
  const result = check({ role, school_id: 2 });
  assert.equal(result.nextCalled, true, `${role} should be allowed`);
  console.log(`PASS: ${role} is allowed`);
}

for (const role of ["Instructor", "Receptionist", "Student"]) {
  const result = check({ role, school_id: 2 });
  assert.equal(result.statusCode, 403, `${role} should receive 403`);
  assert.equal(result.nextCalled, false, `${role} must be blocked`);
  console.log(`PASS: ${role} is blocked`);
}

const noUser = check(undefined);
assert.equal(noUser.statusCode, 401);
console.log("PASS: unauthenticated user is blocked");

const noSchool = check({ role: "Admin", school_id: null });
assert.equal(noSchool.statusCode, 403);
assert.equal(noSchool.nextCalled, false);
console.log("PASS: administrator without a valid school is blocked");

console.log("\nPASS: All settings permission tests passed.");
