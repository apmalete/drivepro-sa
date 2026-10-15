import sqlite3 from "sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databasePath = path.join(__dirname, "..", "drivepro-test.db");

const db = new sqlite3.Database(databasePath, (err) => {
  if (err) {
    console.error("Test database connection failed:", err.message);
  } else {
    console.log("Connected to isolated test database.");
  }
});

export default db;
