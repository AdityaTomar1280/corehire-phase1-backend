// const express = require('express');
// const router = express.Router();
// const candidateController = require('../controllers/candidateController');

// router.post('/candidates', candidateController.saveSelectedCandidates);
// router.get('/candidates', candidateController.getAllCandidates);
// module.exports = router;

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const candidateController = require("../controllers/candidateController");

// Configure multer for resume file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../temp"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// Basic candidate routes
router.post("/candidates", candidateController.saveSelectedCandidates);
router.get("/candidates", candidateController.getAllCandidates);
router.get("/candidates/:id", candidateController.getCandidateById);
router.delete("/candidates/:id", candidateController.deleteCandidate);

// Resume file routes
router.get("/candidates/:id/resume", candidateController.getCandidateResume);
router.post(
  "/candidates/:id/resume",
  upload.single("resumeFile"),
  candidateController.storeResumeFile
);

// Profile update route
router.put(
  "/candidates/:id/profile",
  candidateController.updateCandidateProfile
);

// Interview tracking routes
router.put(
  "/candidates/:id/interview-status",
  candidateController.updateInterviewStatus
);
router.get("/interview-tracking", candidateController.getInterviewTrackingData);

module.exports = router;
