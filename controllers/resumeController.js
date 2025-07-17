// const {
//   extractTextFromWord,
//   extractTextFromPDF,
//   summarizeResume,
//   compareResumeToJobDescription,
// } = require("../services/resumeServices");

// const handleResumeUpload = async (req, res) => {
//   if (!req.files || req.files.length === 0) {
//     return res.status(400).send("No files uploaded.");
//   }

//   const jobDescription = req.body.jobDescription;
//   if (!jobDescription) {
//     return res.status(400).send("Job description is required.");
//   }

//   try {
//     const resumeAnalyses = [];
//     for (const file of req.files) {
//       let resumeText = "";
//       const filePath = file.path;
//       const filename = file.originalname;

//       try {
//         if (
//           file.mimetype === "application/msword" ||
//           file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//         ) {
//           resumeText = await extractTextFromWord(filePath);
//         } else if (file.mimetype === "application/pdf") {
//           resumeText = await extractTextFromPDF(filePath);
//         } else {
//           resumeAnalyses.push({
//             filename,
//             name: "N/A",
//             email: "N/A",
//             similarityScore: 0,
//             commonSkills: [],
//             preferred: "No",
//             error: "Unsupported file type.",
//             resumeSummary: "Unsupported file type.",
//           });
//           continue;
//         }
//       } catch (err) {
//         console.error(`Error processing ${filename}:`, err);
//         resumeAnalyses.push({
//           filename,
//           name: "N/A",
//           email: "N/A",
//           similarityScore: 0,
//           commonSkills: [],
//           preferred: "No",
//           error: "Failed to extract text.",
//           resumeSummary: "Failed to extract text.",
//         });
//         continue;
//       }

//       const analysis = await compareResumeToJobDescription(resumeText, jobDescription);
//       const resumeSummary = await summarizeResume(resumeText);

//       resumeAnalyses.push({
//         filename,
//         ...analysis,
//         resumeSummary,
//       });
//     }

//     res.status(200).json(resumeAnalyses);
//   } catch (error) {
//     console.error("Overall Error:", error);
//     res.status(500).json({ message: "Analysis failed." });
//   }
// };

// module.exports = { handleResumeUpload };

const {
  extractTextFromWord,
  extractTextFromPDF,
  summarizeResume,
  compareResumeToJobDescription,
} = require("../services/resumeServices");

exports.handleResumeUpload = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files uploaded.");
  }

  let jobDescription = req.body.jobDescription;

  // Check if a job description file is uploaded
  if (!jobDescription && req.files.jobDescriptionFile) {
    const jobDescriptionFile = req.files.jobDescriptionFile[0]; // Access the uploaded file

    try {
      if (
        jobDescriptionFile.mimetype === "application/msword" ||
        jobDescriptionFile.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        jobDescription = await extractTextFromWord(jobDescriptionFile.path);
      } else if (jobDescriptionFile.mimetype === "application/pdf") {
        jobDescription = await extractTextFromPDF(jobDescriptionFile.path);
      } else {
        return res.status(400).send("Unsupported job description file type.");
      }
    } catch (err) {
      console.error("Error processing job description file:", err);
      return res.status(500).send("Failed to process job description file.");
    }
  }

  if (!jobDescription) {
    return res.status(400).send("Job description is required.");
  }

  try {
    const resumeAnalyses = [];
    for (const file of req.files.resumes) {
      let resumeText = "";
      const filePath = file.path;
      const filename = file.originalname;

      try {
        if (
          file.mimetype === "application/msword" ||
          file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          resumeText = await extractTextFromWord(filePath);
        } else if (file.mimetype === "application/pdf") {
          resumeText = await extractTextFromPDF(filePath);
        } else {
          resumeAnalyses.push({
            filename,
            name: "N/A",
            email: "N/A",
            similarityScore: 0,
            commonSkills: [],
            preferred: "No",
            error: "Unsupported file type.",
            resumeSummary: "Unsupported file type.",
          });
          continue;
        }
      } catch (err) {
        console.error(`Error processing ${filename}:`, err);
        resumeAnalyses.push({
          filename,
          name: "N/A",
          email: "N/A",
          similarityScore: 0,
          commonSkills: [],
          preferred: "No",
          error: "Failed to extract text.",
          resumeSummary: "Failed to extract text.",
        });
        continue;
      }

      const analysis = await compareResumeToJobDescription(
        resumeText,
        jobDescription
      );
      const resumeSummary = await summarizeResume(resumeText);

      resumeAnalyses.push({
        filename,
        ...analysis,
        resumeSummary,
      });
    }

    res.status(200).json(resumeAnalyses);
  } catch (error) {
    console.error("Overall Error:", error);
    res.status(500).json({ message: "Analysis failed." });
  }
};

// filepath: c:\Users\AdityaTomar\CoreHire_Phase2\backend\controllers\resumeController.js
exports.handleInitialAnalysis = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    const analysis = await compareResumeToJobDescription(
      resumeText,
      jobDescription
    );

    // Return only essential details
    res.status(200).json({
      name: analysis.name,
      email: analysis.email,
      phone: analysis.phone,
      location: analysis.location,
      similarityScore: analysis.similarityScore,
      resumeSummary: await summarizeResume(resumeText),
    });
  } catch (error) {
    console.error("Error in initial analysis:", error);
    res.status(500).json({ message: "Initial analysis failed." });
  }
};

exports.handleDetailedAnalysis = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    const analysis = await compareResumeToJobDescription(
      resumeText,
      jobDescription
    );

    // Return detailed data
    res.status(200).json({
      keySkills: analysis.keySkills,
      totalExperienceYears: analysis.totalExperienceYears,
      mainDomain: analysis.mainDomain,
      companiesWorked: analysis.companiesWorked,
      education: analysis.education,
      commonSkills: analysis.commonSkills,
      preferred: analysis.preferred,
    });
  } catch (error) {
    console.error("Error in detailed analysis:", error);
    res.status(500).json({ message: "Detailed analysis failed." });
  }
};
