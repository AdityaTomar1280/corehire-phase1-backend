// routes/resumeRoutes.js
// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const { handleResumeUpload } = require("../controllers/resumeController");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, "../uploads");
//     fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// router.post("/upload", upload.array("resumes"), handleResumeUpload);

// module.exports = router;

// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const { handleResumeUpload } = require("../controllers/resumeController");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, "../uploads");
//     fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// // Configure multer to handle both resumes and job description files
// const upload = multer({ storage });

// router.post(
//   "/upload",
//   upload.fields([
//     { name: "resumes", maxCount: 10 }, // Handle multiple resumes
//     { name: "jobDescriptionFile", maxCount: 1 }, // Handle a single job description file
//   ]),
//   handleResumeUpload
// );

// module.exports = router;



// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const resumeController = require("../controllers/resumeController");

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, "../uploads");
//     fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// const upload = multer({ storage });

// // Route to handle resume uploads
// router.post(
//   "/upload",
//   upload.fields([
//     { name: "resumes", maxCount: 100 },
//     { name: "jobDescriptionFile", maxCount: 1 },
//   ]),
//   resumeController.handleResumeUpload
// );

// router.post("/initial-analysis", resumeController.handleInitialAnalysis);
// router.post("/detailed-analysis", resumeController.handleDetailedAnalysis);

// module.exports = router;

// backend/routes/resumeRoutes.js (or a new file like analysisRoutes.js)

const express = require('express');
const multer = require('multer');
// const fs = require('fs'); // No longer needed for file system operations here
const path = require('path'); // Still useful for __dirname if needed for other things
const {
  extractTextFromBuffer, // UPDATED: This function will now handle buffers
  compareResumeToJobDescription,
  summarizeResume
} = require('../services/resumeServices'); // Assuming resumeServices.js is updated

const router = express.Router();

// --- Multer Configuration for In-Memory Storage ---
const storage = multer.memoryStorage(); // Store files in memory as Buffers

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.warn(`Unsupported file type rejected: ${file.originalname} (${file.mimetype})`);
    // Provide a more specific error message for the frontend
    cb(new Error(`Unsupported file type: ${file.mimetype} for ${file.fieldname}. Allowed: PDF, DOC, DOCX, TXT.`), false);
  }
};

const upload = multer({
  storage: storage, // Use memory storage
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB file size limit (adjust as needed for memory)
    files: 21 // Max 20 resumes + 1 JD file
  }
});

// --- No file cleanup functions needed as files are not saved to disk ---

// --- API Route for Upload and Analysis ---
router.post(
  '/upload',
  (req, res, next) => {
    upload.fields([
        { name: 'resumes', maxCount: 20 },
        { name: 'jobDescriptionFile', maxCount: 1 },
    ])(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error("Multer error:", err);
            return res.status(400).json({ message: `File upload error: ${err.message}` });
        } else if (err) {
            console.error("File filter or other upload error:", err);
            return res.status(400).json({ message: err.message || "Invalid file type or count." });
        }
        next();
    });
  },
  async (req, res) => {
    console.log('POST /api/upload handler reached (in-memory processing)');
    const resumeFileObjects = req.files && req.files.resumes ? req.files.resumes : [];
    const jdFileObject = req.files && req.files.jobDescriptionFile ? req.files.jobDescriptionFile[0] : null;
    const { jobDescriptionText } = req.body;

    if (!process.env.GEMINI_API_KEY) {
        console.error("FATAL: GEMINI_API_KEY is not set on the server.");
        return res.status(500).json({ message: "Server configuration error: API key missing." });
    }

    if (resumeFileObjects.length === 0) {
      return res.status(400).json({ message: 'No resume files uploaded.' });
    }

    let jobDescriptionForAI = "";

    try {
      // 1. Process Job Description File (from memory buffer)
      if (jdFileObject) {
        console.log(`Processing uploaded JD file from memory: ${jdFileObject.originalname}`);
        // Pass the file object (which contains the buffer) to the modified extraction function
        const jdFileText = await extractTextFromBuffer(jdFileObject);
        jobDescriptionForAI += jdFileText;
      }

      // 2. Append Job Description Text
      if (jobDescriptionText && jobDescriptionText.trim() !== "") {
        if (jobDescriptionForAI.length > 0 && jdFileObject) { // Add separator if both present
          jobDescriptionForAI += "\n\n--- Additional Details from Text Input ---\n";
        }
        jobDescriptionForAI += jobDescriptionText.trim();
      }

      // 3. Validate Job Description Content
      if (!jobDescriptionForAI.trim()) {
        console.error('No job description content provided.');
        return res.status(400).json({ message: 'Job description is missing or empty.' });
      }
      console.log("Final Job Description for AI (first 200 chars):\n", jobDescriptionForAI.substring(0, 200) + "...");

      const analysisResults = [];
      for (const resumeFile of resumeFileObjects) {
        let resumeText;
        try {
          console.log(`Processing resume file from memory: ${resumeFile.originalname}`);
          // Pass the file object (containing the buffer) to the extraction function
          resumeText = await extractTextFromBuffer(resumeFile);

          const summary = await summarizeResume(resumeText);
          const analysis = await compareResumeToJobDescription(resumeText, jobDescriptionForAI);

          analysisResults.push({
            fileName: resumeFile.originalname,
            summary,
            analysis,
          });
        } catch (error) {
          console.error(`Error processing resume ${resumeFile.originalname}:`, error.message);
          analysisResults.push({
            fileName: resumeFile.originalname,
            error: `Failed to process resume: ${error.message}`,
            summary: "N/A",
            analysis: { name: "N/A", email: "N/A", phone: "N/A", location: "N/A", keySkills: [], totalExperienceYears: 0, mainDomain: "N/A", companiesWorked: [], education: [], similarityScore: 0, commonSkills: [], preferred: "No", roleName: "N/A (Error)" }
          });
        }
        // No file cleanup needed for this specific resumeFile.path as it's in memory
      }

      // No cleanup for jdFileObject.path as it was also in memory
      console.log("Analysis complete. Sending results.");
      res.json(analysisResults);

    } catch (error) {
      console.error('Critical error during upload processing:', error);
      // No general file cleanup needed here as files were in memory
      res.status(500).json({ message: `An internal server error occurred: ${error.message}` });
    }
  }
);

module.exports = router;