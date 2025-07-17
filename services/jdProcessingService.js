// // backend/services/jdProcessingService.js
// const fs = require("fs").promises; // Use promises API for async file system operations
// const path = require("path");
// const mammoth = require("mammoth");
// const pdf = require("pdf-parse");
// const JobDescription = require("../models/JobDescription"); // Your Mongoose model

// // --- Text Extraction (similar to your existing, but takes path) ---
// async function extractTextFromFilePath(filePath) {
//   const ext = path.extname(filePath).toLowerCase();
//   try {
//     if (ext === ".docx") {
//       const result = await mammoth.extractRawText({ path: filePath });
//       return result.value;
//     } else if (ext === ".doc") {
//       // Mammoth might handle .doc, but it's less reliable than for .docx
//       // Consider a fallback or warning for .doc
//       try {
//         const result = await mammoth.extractRawText({ path: filePath });
//         return result.value;
//       } catch (docError) {
//         console.warn(
//           `Mammoth failed for .doc file ${filePath}, trying alternative or skipping text extraction for this format if not critical.`
//         );
//         // You might need a library specifically for .doc if mammoth fails often, or convert them to docx/pdf first
//         return ""; // Or throw error
//       }
//     } else if (ext === ".pdf") {
//       const dataBuffer = await fs.readFile(filePath);
//       const data = await pdf(dataBuffer);
//       return data.text;
//     } else if (ext === ".txt") {
//       return await fs.readFile(filePath, "utf8");
//     } else {
//       console.warn(`Unsupported file type for text extraction: ${filePath}`);
//       return null; // Or throw an error
//     }
//   } catch (error) {
//     console.error(`Error extracting text from ${filePath}:`, error);
//     throw error; // Re-throw to be handled by the caller
//   }
// }

// // --- Section Parsing (This is the most challenging part and relies on consistent JD structure) ---
// function parseJdSections(textContent) {
//   const sections = {
//     overview: "",
//     keyResponsibilities: [],
//     qualificationsAndEducation: [],
//     preferredSkills: [],
//   };

//   if (!textContent) return sections;

//   // Normalize text: convert to lowercase for matching, handle multiple newlines
//   const lowerText = textContent.toLowerCase();
//   const lines = textContent.split(/\r?\n/); // Split by newline

//   // Define keywords for section headers (make these robust)
//   const overviewKeywords = [
//     "overview",
//     "job overview",
//     "summary",
//     "position summary",
//     "role overview",
//   ];
//   const respKeywords = [
//     "key responsibilities",
//     "responsibilities",
//     "duties and responsibilities",
//     "your role",
//     "what you will do",
//   ];
//   const qualKeywords = [
//     "qualifications and education requirements",
//     "qualifications",
//     "requirements",
//     "skills and qualifications",
//     "education and experience",
//     "candidate profile",
//   ];
//   const skillsKeywords = [
//     "preferred skills",
//     "desired skills",
//     "additional skills",
//     "nice to have",
//   ];

//   let currentSection = null;
//   let contentBuffer = [];

//   const findSectionStart = (line, keywords) =>
//     keywords.some(
//       (kw) =>
//         line.toLowerCase().startsWith(kw) ||
//         line.toLowerCase().includes(kw + ":")
//     );

//   for (const line of lines) {
//     const trimmedLine = line.trim();

//     if (findSectionStart(trimmedLine, qualKeywords)) {
//       if (currentSection)
//         sections[currentSection].push(...contentBuffer.filter((l) => l.trim()));
//       currentSection = "qualificationsAndEducation";
//       contentBuffer = [trimmedLine.split(/:(.*)/s)[1]?.trim() || ""]; // Capture content after colon if any
//       continue;
//     } else if (findSectionStart(trimmedLine, skillsKeywords)) {
//       if (currentSection)
//         sections[currentSection].push(...contentBuffer.filter((l) => l.trim()));
//       currentSection = "preferredSkills";
//       contentBuffer = [trimmedLine.split(/:(.*)/s)[1]?.trim() || ""];
//       continue;
//     } else if (findSectionStart(trimmedLine, respKeywords)) {
//       if (currentSection)
//         sections[currentSection].push(...contentBuffer.filter((l) => l.trim()));
//       currentSection = "keyResponsibilities";
//       contentBuffer = [trimmedLine.split(/:(.*)/s)[1]?.trim() || ""];
//       continue;
//     } else if (findSectionStart(trimmedLine, overviewKeywords)) {
//       if (currentSection)
//         sections[currentSection].push(...contentBuffer.filter((l) => l.trim()));
//       currentSection = "overview"; // Overview is usually a single block of text
//       contentBuffer = [trimmedLine.split(/:(.*)/s)[1]?.trim() || ""];
//       continue;
//     }

//     if (currentSection && trimmedLine) {
//       if (currentSection === "overview") {
//         // Append to overview string
//         sections.overview += (sections.overview ? "\n" : "") + trimmedLine;
//       } else if (
//         trimmedLine.startsWith("•") ||
//         trimmedLine.startsWith("-") ||
//         trimmedLine.startsWith("*") ||
//         /^[a-zA-Z0-9]\./.test(trimmedLine)
//       ) {
//         // If it's a bullet point or list item, push directly
//         if (
//           contentBuffer.length > 0 &&
//           !(
//             contentBuffer[contentBuffer.length - 1].startsWith("•") ||
//             contentBuffer[contentBuffer.length - 1].startsWith("-")
//           )
//         ) {
//           // Push previous buffer line as a paragraph if it wasn't a bullet
//           sections[currentSection].push(contentBuffer.join(" ").trim());
//           contentBuffer = [];
//         }
//         sections[currentSection].push(trimmedLine);
//       } else {
//         // Accumulate lines for a paragraph
//         contentBuffer.push(trimmedLine);
//       }
//     }
//   }
//   // Add any remaining buffer for the last section
//   if (currentSection && contentBuffer.length > 0) {
//     if (currentSection === "overview" && !sections.overview) {
//       // If overview was the only/last section
//       sections.overview = contentBuffer.join("\n").trim();
//     } else if (currentSection !== "overview") {
//       sections[currentSection].push(...contentBuffer.filter((l) => l.trim()));
//     }
//   }

//   // Post-process lists to clean them up
//   [
//     "keyResponsibilities",
//     "qualificationsAndEducation",
//     "preferredSkills",
//   ].forEach((key) => {
//     sections[key] = sections[key]
//       .map((item) => item.replace(/^[\s•*-]+/, "").trim()) // Remove leading bullets/hyphens
//       .filter((item) => item.length > 0); // Remove empty items
//   });

//   // If overview is still empty and other sections have content, try to infer it or leave it blank
//   // This parsing is basic and might need significant refinement based on your JD formats.
//   // For truly robust parsing of varied JDs, a proper NLP model/library would be better.

//   return sections;
// }

// // --- Main Processing Function ---
// async function processJdDirectory(baseDirectory) {
//   console.log(`Starting JD processing for directory: ${baseDirectory}`);
//   let filesProcessed = 0;
//   let filesSaved = 0;
//   let filesFailed = 0;

//   try {
//     const roleFolders = await fs.readdir(baseDirectory, {
//       withFileTypes: true,
//     });

//     for (const roleFolderDirent of roleFolders) {
//       if (roleFolderDirent.isDirectory()) {
//         const roleName = roleFolderDirent.name;
//         const rolePath = path.join(baseDirectory, roleName);
//         console.log(`Processing role: ${roleName}`);

//         try {
//           const jdFiles = await fs.readdir(rolePath);
//           for (const jdFileName of jdFiles) {
//             const fullJdPath = path.join(rolePath, jdFileName);
//             const stat = await fs.stat(fullJdPath);

//             if (stat.isFile()) {
//               console.log(`-- Processing JD file: ${jdFileName}`);
//               filesProcessed++;
//               try {
//                 // Check if already processed to avoid duplicates if script is run multiple times
//                 const existingJd = await JobDescription.findOne({
//                   role: roleName,
//                   originalFileName: jdFileName,
//                 });
//                 if (existingJd) {
//                   console.log(
//                     `---- JD ${jdFileName} already exists in DB. Skipping.`
//                   );
//                   continue;
//                 }

//                 const textContent = await extractTextFromFilePath(fullJdPath);
//                 if (textContent === null) {
//                   // Unsupported file type from extractTextFromFilePath
//                   console.log(
//                     `---- Skipping ${jdFileName} due to unsupported file type or extraction error.`
//                   );
//                   filesFailed++;
//                   continue;
//                 }
//                 if (!textContent.trim()) {
//                   console.log(
//                     `---- No content extracted from ${jdFileName}. Skipping.`
//                   );
//                   filesFailed++;
//                   continue;
//                 }

//                 const sections = parseJdSections(textContent);

//                 const newJd = new JobDescription({
//                   role: roleName,
//                   originalFileName: jdFileName,
//                   fullPath: fullJdPath,
//                   overview: sections.overview,
//                   keyResponsibilities: sections.keyResponsibilities,
//                   qualificationsAndEducation:
//                     sections.qualificationsAndEducation,
//                   preferredSkills: sections.preferredSkills,
//                   fullTextContent: textContent, // Store full text if needed
//                 });

//                 await newJd.save();
//                 filesSaved++;
//                 console.log(`---- Successfully saved ${jdFileName} to DB.`);
//               } catch (fileError) {
//                 console.error(
//                   `---- Error processing file ${jdFileName}:`,
//                   fileError.message
//                 );
//                 filesFailed++;
//               }
//             }
//           }
//         } catch (readDirError) {
//           console.error(`Error reading directory ${rolePath}:`, readDirError);
//         }
//       }
//     }
//     console.log("\nJD Processing Summary:");
//     console.log(`Total Files Encountered (potential JDs): ${filesProcessed}`);
//     console.log(`Successfully Saved to DB: ${filesSaved}`);
//     console.log(`Failed to Process/Save: ${filesFailed}`);
//   } catch (error) {
//     console.error(`Critical error during JD processing: ${error}`);
//   }
// }

// module.exports = {
//   processJdDirectory,
//   extractTextFromFilePath,
//   parseJdSections,
// };

// backend/services/jdProcessingService.js
const fs = require("fs").promises;
const path = require("path");
const mammoth = require("mammoth");
const pdf = require("pdf-parse");
const JobDescription = require("../models/JobDescription");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai"); // Import Gemini

// Ensure GEMINI_API_KEY is available (loaded via dotenv in the script that calls this)
if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL: GEMINI_API_KEY is not set in the environment.");
  // process.exit(1); // Or handle this more gracefully depending on context
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Text Extraction (extractTextFromFilePath - remains the same as before) ---
async function extractTextFromFilePath(filePath) {
  // ... (Your existing extractTextFromFilePath function from the previous answer)
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (ext === ".doc") {
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
      } catch (docError) {
        console.warn(`Mammoth failed for .doc file ${filePath}.`);
        return "";
      }
    } else if (ext === ".pdf") {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } else if (ext === ".txt") {
      return await fs.readFile(filePath, "utf8");
    } else {
      console.warn(`Unsupported file type for text extraction: ${filePath}`);
      return null;
    }
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error);
    throw error;
  }
}

// backend/services/jdProcessingService.js
// ... (fs, path, mammoth, pdf, JobDescription, GoogleGenerativeAI, genAI imports remain the same)
// ... (extractTextFromFilePath function remains the same)

async function extractJdDetailsWithGemini(
  jdFullText,
  jdFileName = "this job description"
) {
  if (!jdFullText || jdFullText.trim().length < 100) {
    // Increased minimum length slightly
    console.warn(
      `JD content for "${jdFileName}" is too short or empty for detailed Gemini processing. Returning default structure.`
    );
    return {
      overview: `Overview for ${jdFileName} could not be extracted. Content too short.`,
      keyResponsibilities: [
        "Responsibilities not extracted due to short content.",
      ],
      qualificationsAndEducation: [
        "Qualifications not extracted due to short content.",
      ],
      preferredSkills: ["Preferred skills not extracted due to short content."],
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const generationConfig = {
    temperature: 0.1, // Even lower for more precise extraction
    topK: 1,
    topP: 0.95, // Allow some flexibility but keep it focused
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  // New prompt, more focused on the sections *after* potential metadata
  const prompt = `
    From the provided job description text, extract the content for the following sections: "Overview", "Key Responsibilities", "Qualifications and Education Requirements", and "Preferred Skills".
    These sections usually appear after a general metadata block or a main heading like "JOB DESCRIPTION". Focus on the descriptive parts of the job.

    The output MUST be ONLY a valid JSON object with the following exact structure and keys.
    If a section's content is not found or is unclear, provide an empty string for "overview" or an empty array [] for list-based sections for that specific key. Do not add any explanations or text outside the JSON structure.

    JSON Structure:
    {
      "overview": "The content found under or immediately following a heading like 'Overview:'. This should be a paragraph or a few sentences describing the role.",
      "keyResponsibilities": [
        "Each distinct responsibility listed, typically as a bullet point or separate line under 'Key Responsibilities:'.",
        "Another responsibility."
      ],
      "qualificationsAndEducation": [
        "Each distinct qualification, education requirement, or experience level mentioned under 'Qualifications and Education Requirements:'.",
        "Example: Bachelor's/Master's degree in computer science or a related field.",
        "Example: At least 3-6 years' experience"
      ],
      "preferredSkills": [
        "Each distinct skill listed under 'Preferred Skills:'.",
        "Another preferred skill."
      ]
    }

    Job Description Text:
    ---
    ${jdFullText}
    ---

    JSON Output:
  `;

  try {
    console.log(
      `Sending JD content of "${jdFileName}" to Gemini for section extraction (v2 prompt)...`
    );
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });
    const response = result.response;

    if (
      !response ||
      !response.candidates ||
      !response.candidates.length > 0 ||
      !response.candidates[0].content ||
      !response.candidates[0].content.parts ||
      !response.candidates[0].content.parts.length > 0
    ) {
      console.error(
        `Gemini response format unexpected for "${jdFileName}". Full response:`,
        JSON.stringify(response, null, 2)
      );
      throw new Error("Unexpected response format from Gemini model.");
    }

    let responseText = response.candidates[0].content.parts[0].text;

    // Clean the response text: remove markdown, trim
    responseText = responseText
      .replace(/^```json\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    console.log(
      `Gemini raw cleaned response for "${jdFileName}":`,
      responseText.substring(0, 500) + "..."
    ); // Log more of the response

    let parsedDetails;
    try {
      parsedDetails = JSON.parse(responseText);
    } catch (jsonError) {
      console.error(
        `Failed to parse Gemini JSON response for "${jdFileName}":`,
        jsonError
      );
      console.error("Gemini response that failed parsing:", responseText);
      // Attempt to find JSON within a possibly malformed string (if not already caught by cleaning)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch && jsonMatch[0]) {
        try {
          parsedDetails = JSON.parse(jsonMatch[0]);
          console.log(
            `Successfully parsed JSON from substring for "${jdFileName}"`
          );
        } catch (subJsonError) {
          console.error(
            `Failed to parse JSON substring for "${jdFileName}":`,
            subJsonError
          );
          throw new Error(
            "Gemini returned malformed JSON for JD details, even after attempting substring parse."
          );
        }
      } else {
        throw new Error(
          "Gemini returned non-JSON or unrecoverable malformed JSON for JD details."
        );
      }
    }

    // Ensure all keys exist and have correct types, even if Gemini omits them or returns wrong type
    const safelyGetArray = (data) =>
      Array.isArray(data)
        ? data.filter((item) => typeof item === "string" && item.trim() !== "")
        : [];
    const safelyGetString = (data) =>
      typeof data === "string" ? data.trim() : "";

    return {
      overview: safelyGetString(parsedDetails.overview),
      keyResponsibilities: safelyGetArray(parsedDetails.keyResponsibilities),
      qualificationsAndEducation: safelyGetArray(
        parsedDetails.qualificationsAndEducation
      ),
      preferredSkills: safelyGetArray(parsedDetails.preferredSkills),
    };
  } catch (error) {
    console.error(
      `Error in extractJdDetailsWithGemini for "${jdFileName}":`,
      error.message
    );
    // Fallback structure in case of Gemini error or critical parsing failure
    return {
      overview: `Error extracting overview for ${jdFileName}. Gemini processing failed.`,
      keyResponsibilities: [
        `Error: Could not extract responsibilities from ${jdFileName}.`,
      ],
      qualificationsAndEducation: [
        `Error: Could not extract qualifications from ${jdFileName}.`,
      ],
      preferredSkills: [
        `Error: Could not extract preferred skills from ${jdFileName}.`,
      ],
    };
  }
}

// --- Main Processing Function (processJdDirectory - remains the same) ---
// It will call the updated extractJdDetailsWithGemini
async function processJdDirectory(baseDirectory) {
  // ... (Your existing processJdDirectory function from the previous answer, no changes needed here)
  console.log(
    `Starting JD processing with Gemini for directory: ${baseDirectory}`
  );
  let filesProcessed = 0;
  let filesSaved = 0;
  let filesFailed = 0;
  let filesSkipped = 0;

  try {
    const roleFolders = await fs.readdir(baseDirectory, {
      withFileTypes: true,
    });

    for (const roleFolderDirent of roleFolders) {
      if (roleFolderDirent.isDirectory()) {
        const roleName = roleFolderDirent.name;
        const rolePath = path.join(baseDirectory, roleName);
        console.log(`Processing role: ${roleName}`);

        try {
          const jdFiles = await fs.readdir(rolePath);
          for (const jdFileName of jdFiles) {
            const fullJdPath = path.join(rolePath, jdFileName);
            const stat = await fs.stat(fullJdPath);

            if (stat.isFile()) {
              console.log(`-- Processing JD file: ${jdFileName}`);
              filesProcessed++;
              try {
                const existingJd = await JobDescription.findOne({
                  role: roleName,
                  originalFileName: jdFileName,
                });
                if (existingJd) {
                  console.log(
                    `---- JD ${jdFileName} already exists in DB. Skipping.`
                  );
                  filesSkipped++;
                  continue;
                }

                const textContent = await extractTextFromFilePath(fullJdPath);
                if (textContent === null) {
                  console.log(
                    `---- Skipping ${jdFileName} (unsupported file type or text extraction error).`
                  );
                  filesFailed++;
                  continue;
                }
                if (!textContent || !textContent.trim()) {
                  // Added check for null textContent
                  console.log(
                    `---- No content extracted from ${jdFileName}. Skipping.`
                  );
                  filesFailed++;
                  continue;
                }

                // Use Gemini to extract sections
                const sections = await extractJdDetailsWithGemini(
                  textContent,
                  jdFileName
                );

                const newJd = new JobDescription({
                  role: roleName,
                  originalFileName: jdFileName,
                  fullPath: fullJdPath,
                  overview: sections.overview,
                  keyResponsibilities: sections.keyResponsibilities,
                  qualificationsAndEducation:
                    sections.qualificationsAndEducation,
                  preferredSkills: sections.preferredSkills,
                  fullTextContent: textContent,
                });

                await newJd.save();
                filesSaved++;
                console.log(
                  `---- Successfully saved ${jdFileName} to DB after Gemini processing.`
                );
              } catch (fileError) {
                console.error(
                  `---- Error processing file ${jdFileName}:`,
                  fileError.message
                );
                filesFailed++;
              }
            }
          }
        } catch (readDirError) {
          console.error(`Error reading directory ${rolePath}:`, readDirError);
        }
      }
    }
    console.log("\nJD Processing Summary (with Gemini):");
    console.log(`Total Files Encountered: ${filesProcessed}`);
    console.log(`Already in DB (Skipped): ${filesSkipped}`);
    console.log(`Successfully Saved to DB: ${filesSaved}`);
    console.log(`Failed to Process/Save: ${filesFailed}`);
  } catch (error) {
    console.error(`Critical error during JD processing: ${error}`);
  }
}

module.exports = {
  processJdDirectory,
  extractTextFromFilePath,
  extractJdDetailsWithGemini,
};

module.exports = {
  processJdDirectory,
  extractTextFromFilePath,
  extractJdDetailsWithGemini,
};
