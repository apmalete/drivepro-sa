import express from "express";

import {
  getSchools,
  getSchool,
  addSchool,
  updateSchool,
  updateSchoolStatus,
  deleteSchool,
} from "../controllers/schoolsController.js";

const router = express.Router();

// ======================================
// GET ALL SCHOOLS
// GET /schools
// ======================================

router.get("/", getSchools);

// ======================================
// GET ONE SCHOOL
// GET /schools/:id
// ======================================

router.get("/:id", getSchool);

// ======================================
// ADD SCHOOL
// POST /schools
// ======================================

router.post("/", addSchool);

// ======================================
// UPDATE SCHOOL
// PUT /schools/:id
// ======================================

router.put("/:id", updateSchool);

// ======================================
// UPDATE SCHOOL STATUS
// PATCH /schools/:id/status
// ======================================

router.patch(
  "/:id/status",
  updateSchoolStatus
);

// ======================================
// DELETE SCHOOL
// DELETE /schools/:id
// ======================================

router.delete(
  "/:id",
  deleteSchool
);

export default router;