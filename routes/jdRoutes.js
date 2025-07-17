// backend/routes/jdRoutes.js (example)
const express = require("express");
const router = express.Router();
const JobDescription = require("../models/JobDescription");

router.get("/jd-roles", async (req, res) => {
  try {
    const roles = await JobDescription.distinct("role");
    res.json({ roles: roles.sort() });
  } catch (error) {
    console.error("Error fetching JD roles:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch job roles from database." });
  }
});

router.get("/jds-by-role/:roleName", async (req, res) => {
  try {
    const roleName = req.params.roleName;
    const jds = await JobDescription.find({ role: roleName }).select(
      "_id originalFileName"
    );
    res.json({ jds });
  } catch (error) {
    console.error(`Error fetching JDs for role ${req.params.roleName}:`, error);
    res.status(500).json({
      message: "Failed to fetch job descriptions for the selected role.",
    });
  }
});

// GET full details of a specific JD by its ID
router.get("/jd-by-id/:jdId", async (req, res) => {
  try {
    const jdId = req.params.jdId;
    const jd = await JobDescription.findById(jdId);
    if (!jd) {
      return res.status(404).json({ message: "Job description not found." });
    }
    res.json({ jd });
  } catch (error) {
    console.error(`Error fetching JD by ID ${req.params.jdId}:`, error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid JD ID format." });
    }
    res
      .status(500)
      .json({ message: "Failed to fetch job description details." });
  }
});

module.exports = router;
