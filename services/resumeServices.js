// // services/resumeService.js
// const fs = require("fs");
// const pdf = require("pdf-parse");
// const mammoth = require("mammoth");
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// async function extractTextFromWord(filePath) {
//   try {
//     const result = await mammoth.extractRawText({ path: filePath });
//     return result.value;
//   } catch (error) {
//     console.error("Error extracting text from Word document:", error);
//     throw error;
//   }
// }

// async function extractTextFromPDF(filePath) {
//   try {
//     const dataBuffer = fs.readFileSync(filePath);
//     const pdfData = await pdf(dataBuffer);
//     return pdfData.text;
//   } catch (error) {
//     console.error("Error extracting text from PDF:", error);
//     throw error;
//   }
// }

// async function summarizeResume(resumeText) {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
//     const prompt = `Create a concise summary of the following resume: ${resumeText}\n\nSummary:`;
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     return response.text().trim();
//   } catch (error) {
//     console.error("Gemini API Error (Summary):", error);
//     return "Unable to summarize resume.";
//   }
// }

// async function compareResumeToJobDescription(resumeText, jobDescription) {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     const extractionPrompt = `From the following resume, extract the full name and email address. Respond STRICTLY in JSON format, WITHOUT code block markers:
// {
//     "name": "[Full Name]",
//     "email": "[Email Address]"
// }
// Resume: ${resumeText}`;

//     const analysisPrompt = `Analyze the following resume in relation to the job description. Provide a similarity score (0-100), list the Skills you find in the resume text as KeySkills and common skills as commonSkills that are common the given job desciption, also get the total experience in years and state whether the resume is a good fit for the job (Yes/No).

// Job Description: ${jobDescription}
// Resume: ${resumeText}

// Respond STRICTLY in JSON format, WITHOUT code block markers:
// {
//     "keySkills":["skill1", "skill2", ...],
//     "similarityScore": [Score],
//     "commonSkills": ["skill1", "skill2", ...],
//     "preferred": "[Yes/No]",
//     "totalExperienceYears": [Experience]
// }`;

//     const extractionResult = await model.generateContent(extractionPrompt);
//     let extractionText = (await extractionResult.response).text();
//     extractionText = extractionText.replace(/```json\n|```/g, "");

//     let extractionJsonResponse;
//     try {
//       extractionJsonResponse = JSON.parse(extractionText);
//       if (!extractionJsonResponse.name || !extractionJsonResponse.email) {
//         throw new Error("Invalid structure");
//       }
//     } catch (e) {
//       console.warn("Invalid extraction response:", e);
//       extractionJsonResponse = { name: "N/A", email: "N/A" };
//     }

//     const analysisResult = await model.generateContent(analysisPrompt);
//     let analysisText = (await analysisResult.response).text();
//     analysisText = analysisText.replace(/```json\n|```/g, "");

//     let analysisJsonResponse;
//     try {
//       analysisJsonResponse = JSON.parse(analysisText);
//       if (
//         typeof analysisJsonResponse.similarityScore !== "number" ||
//         !Array.isArray(analysisJsonResponse.commonSkills) ||
//         typeof analysisJsonResponse.preferred !== "string"
//       ) {
//         throw new Error("Invalid structure");
//       }
//     } catch (e) {
//       console.warn("Invalid analysis response:", e);
//       analysisJsonResponse = {
//         similarityScore: 0,
//         commonSkills: [],
//         preferred: "No",
//       };
//     }

//     return {
//       name: extractionJsonResponse.name,
//       email: extractionJsonResponse.email,
//       similarityScore: analysisJsonResponse.similarityScore,
//       commonSkills: analysisJsonResponse.commonSkills,
//       preferred: analysisJsonResponse.preferred,
//       totalExperienceYears: analysisJsonResponse.totalExperienceYears,
//     };
//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     return {
//       name: "N/A",
//       email: "N/A",
//       similarityScore: 0,
//       keySkills: [],
//       commonSkills: [],
//       preferred: "No",
//     };
//   }
// }

// // async function compareResumeToJobDescription(resumeText, jobDescription) {
// //   try {
// //     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// //     const extractionPrompt = `
// // From the following resume, extract these details in JSON format WITHOUT any markdown or code block markers:

// // {
// //   "name": "[Full Name]",
// //   "email": "[Email Address]",
// //   "keySkills": "[Comma-separated skills list]", // Example: "Python, Machine Learning, Data Analysis"
// //   "totalExperienceYears": [Number], // Estimate total years of professional experience from education and work history
// //   "mainDomain": "[Main domain or field of experience]" // Example: "Software Development", "Data Science", "Finance"
// // }

// // If any information is missing, put "N/A" for strings or 0 for numbers.

// // Resume:
// // ${resumeText}
// //     `;

// //     const analysisPrompt = `
// // Analyze the following resume in relation to the provided job description. Respond STRICTLY in JSON format WITHOUT any markdown or code block markers:

// // {
// //   "similarityScore": [Score], // Similarity between resume and job description (0-100)
// //   "commonSkills": ["skill1", "skill2", ...], // Skills common to both resume and job description
// //   "preferred": "[Yes/No]" // Is this resume a good fit? (Yes/No)
// // }

// // Job Description:
// // ${jobDescription}

// // Resume:
// // ${resumeText}
// //     `;

// //     const extractionResult = await model.generateContent(extractionPrompt);
// //     let extractionText = (await extractionResult.response).text();
// //     extractionText = extractionText.replace(/```json\n|```/g, "");

// //     let extractionJsonResponse;
// //     try {
// //       extractionJsonResponse = JSON.parse(extractionText);
// //       if (!extractionJsonResponse.name || !extractionJsonResponse.email) {
// //         throw new Error("Invalid extraction structure");
// //       }
// //     } catch (e) {
// //       console.warn("Invalid extraction response:", e);
// //       extractionJsonResponse = {
// //         name: "N/A",
// //         email: "N/A",
// //         keySkills: "N/A",
// //         totalExperienceYears: 0,
// //         mainDomain: "N/A",
// //       };
// //     }

// //     const analysisResult = await model.generateContent(analysisPrompt);
// //     let analysisText = (await analysisResult.response).text();
// //     analysisText = analysisText.replace(/```json\n|```/g, "");

// //     let analysisJsonResponse;
// //     try {
// //       analysisJsonResponse = JSON.parse(analysisText);
// //       if (
// //         typeof analysisJsonResponse.similarityScore !== "number" ||
// //         !Array.isArray(analysisJsonResponse.commonSkills) ||
// //         typeof analysisJsonResponse.preferred !== "string"
// //       ) {
// //         throw new Error("Invalid analysis structure");
// //       }
// //     } catch (e) {
// //       console.warn("Invalid analysis response:", e);
// //       analysisJsonResponse = {
// //         similarityScore: 0,
// //         commonSkills: [],
// //         preferred: "No",
// //       };
// //     }

// //     return {
// //       name: extractionJsonResponse.name,
// //       email: extractionJsonResponse.email,
// //       keySkills: extractionJsonResponse.keySkills || "N/A", // <-- now a comma-separated string
// //       totalExperienceYears: extractionJsonResponse.totalExperienceYears || 0,
// //       mainDomain: extractionJsonResponse.mainDomain || "N/A",
// //       similarityScore: analysisJsonResponse.similarityScore,
// //       commonSkills: analysisJsonResponse.commonSkills,
// //       preferred: analysisJsonResponse.preferred,
// //     };
// //   } catch (error) {
// //     console.error("Gemini API Error:", error);
// //     return {
// //       name: "N/A",
// //       email: "N/A",
// //       keySkills: "N/A",
// //       totalExperienceYears: 0,
// //       mainDomain: "N/A",
// //       similarityScore: 0,
// //       commonSkills: [],
// //       preferred: "No",
// //     };
// //   }
// // }

// module.exports = {
//   extractTextFromWord,
//   extractTextFromPDF,
//   summarizeResume,
//   compareResumeToJobDescription,
// };

// const fs = require("fs");
// const pdf = require("pdf-parse");
// const mammoth = require("mammoth");
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// async function extractTextFromWord(filePath) {
//   try {
//     const result = await mammoth.extractRawText({ path: filePath });
//     return result.value;
//   } catch (error) {
//     console.error("Error extracting text from Word document:", error);
//     throw error;
//   }
// }

// async function extractTextFromPDF(filePath) {
//   try {
//     const dataBuffer = fs.readFileSync(filePath);
//     const pdfData = await pdf(dataBuffer);
//     return pdfData.text;
//   } catch (error) {
//     console.error("Error extracting text from PDF:", error);
//     throw error;
//   }
// }

// async function extractTextFromJobDescription(file) {
//   try {
//     if (
//       file.mimetype === "application/msword" ||
//       file.mimetype ===
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//     ) {
//       return await extractTextFromWord(file.path);
//     } else if (file.mimetype === "application/pdf") {
//       return await extractTextFromPDF(file.path);
//     } else {
//       throw new Error("Unsupported file type for job description.");
//     }
//   } catch (error) {
//     console.error("Error extracting text from job description file:", error);
//     throw error;
//   }
// }

// async function summarizeResume(resumeText) {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const prompt = `Create a concise summary of the following resume: ${resumeText}\n\nSummary:`;
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     return response.text().trim();
//   } catch (error) {
//     console.error("Gemini API Error (Summary):", error);
//     return "Unable to summarize resume.";
//   }
// }

// async function compareResumeToJobDescription(resumeText, jobDescription) {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//     // Prompt to extract candidate details from the resume
//     const extractionPrompt = `
// From the following resume, extract these details in JSON format WITHOUT any markdown or code block markers:

// {
//   "name": "[Full Name]",
//   "email": "[Email Address]",
//   "phone": "[Phone Number]",
//   "location": "[Candidate's Location]", // Example: "City, State, Country"
//   "keySkills": "[skills list as an array]", // Example: "Python, Machine Learning, Data Analysis"
//   "totalExperienceYears": [Number], // Estimate total years of professional experience from education and work history
//   "mainDomain": "[Main domain or field of experience]", // Example: "Software Development", "Data Science", "Finance", "SAP"
//   "companiesWorked": [
//     {
//       "companyName": "[Company Name]",
//       "role": "[Role/Position]",
//       "duration": "[Duration]" // Example: "2 years", "Jan 2020 - Dec 2022"
//     },
//     ...
//   ],
//   "education": [
//     {
//       "degree": "[Degree Name]", // Example: "Bachelor of Science in Computer Science"
//       "institution": "[Institution Name]", // Example: "University of California"
//       "year": "[Year or Duration]" // Example: "2015-2019"
//     },
//     ...
//   ]
// }

// If any information is missing, put "N/A" for strings or 0 for numbers.

// Resume:
// ${resumeText}
// `;

//     // Prompt to analyze the resume in relation to the job description
//     const analysisPrompt = `
// Analyze the following resume in relation to the provided job description. Respond STRICTLY in JSON format WITHOUT any markdown or code block markers:

// {
//   "similarityScore": [Score], // Similarity between resume and job description (0-100)
//   "commonSkills": ["skill1", "skill2", ...], // Skills common to both resume and job description
//   "preferred": "[Yes/No]", // Is this resume a good fit? (Yes/No)
//   "keySkills": ["skill1", "skill2", ...], // Key skills extracted from the resume
//   "mainDomain": "[Main domain or field of experience]", // Example: "Software Development", "Data Science"
//   "totalExperienceYears": [Number], // Total years of professional experience
//   "location": "[Candidate's Location]", // Example: "City, State, Country"
//   "companiesWorked": [
//     {
//       "companyName": "[Company Name]",
//       "role": "[Role/Position]",
//       "duration": "[Duration]" // Example: "2 years", "Jan 2020 - Dec 2022"
//     },
//     ...
//   ],
//   "education": [
//     {
//       "degree": "[Degree Name]", // Example: "Bachelor of Science in Computer Science"
//       "institution": "[Institution Name]", // Example: "University of California"
//       "year": "[Year or Duration]" // Example: "2015-2019"
//     },
//     ...
//   ]
// }

// Job Description:
// ${jobDescription}

// Resume:
// ${resumeText}
// `;

//     // Prompt to extract the role name from the job description
//     const roleExtractionPrompt = `
// From the following job description, extract the role name or position title. Respond STRICTLY in JSON format WITHOUT any markdown or code block markers:

// {
//   "roleName": "[Role Name]" // Example: "Software Engineer", "Data Scientist", "SAP Consultant"
// }

// Job Description:
// ${jobDescription}
// `;

//     // Extract candidate details
//     const extractionResult = await model.generateContent(extractionPrompt);
//     let extractionText = (await extractionResult.response).text();
//     extractionText = extractionText.replace(/```json\n|```/g, "");

//     let extractionJsonResponse;
//     try {
//       extractionJsonResponse = JSON.parse(extractionText);
//       if (!extractionJsonResponse.name || !extractionJsonResponse.email) {
//         throw new Error("Invalid extraction structure");
//       }
//     } catch (e) {
//       console.warn("Invalid extraction response:", e);
//       extractionJsonResponse = {
//         name: "N/A",
//         email: "N/A",
//         phone: "N/A",
//         location: "N/A",
//         keySkills: "N/A",
//         totalExperienceYears: 0,
//         mainDomain: "N/A",
//         companiesWorked: [],
//         education: [],
//       };
//     }

//     const analysisResult = await model.generateContent(analysisPrompt);
//     let analysisText = (await analysisResult.response).text();
//     analysisText = analysisText.replace(/```json\n|```/g, "");

//     let analysisJsonResponse;
//     try {
//       analysisJsonResponse = JSON.parse(analysisText);
//       if (
//         typeof analysisJsonResponse.similarityScore !== "number" ||
//         !Array.isArray(analysisJsonResponse.commonSkills) ||
//         typeof analysisJsonResponse.preferred !== "string"
//       ) {
//         throw new Error("Invalid analysis structure");
//       }
//     } catch (e) {
//       console.warn("Invalid analysis response:", e);
//       analysisJsonResponse = {
//         similarityScore: 0,
//         commonSkills: [],
//         preferred: "No",
//       };
//     }

//     // Extract the role name
//     const roleResult = await model.generateContent(roleExtractionPrompt);
//     let roleText = (await roleResult.response).text();
//     roleText = roleText.replace(/```json\n|```/g, "");

//     let roleJsonResponse;
//     try {
//       roleJsonResponse = JSON.parse(roleText);
//       if (!roleJsonResponse.roleName) {
//         throw new Error("Invalid role extraction structure");
//       }
//     } catch (e) {
//       console.warn("Invalid role extraction response:", e);
//       roleJsonResponse = { roleName: "N/A" };
//     }

//     return {
//       name: extractionJsonResponse.name,
//       email: extractionJsonResponse.email,
//       phone: extractionJsonResponse.phone,
//       location: extractionJsonResponse.location,
//       keySkills: extractionJsonResponse.keySkills || "N/A",
//       totalExperienceYears: extractionJsonResponse.totalExperienceYears || 0,
//       mainDomain: extractionJsonResponse.mainDomain || "N/A",
//       companiesWorked: extractionJsonResponse.companiesWorked || [],
//       education: extractionJsonResponse.education || [],
//       similarityScore: analysisJsonResponse.similarityScore,
//       commonSkills: analysisJsonResponse.commonSkills,
//       preferred: analysisJsonResponse.preferred,
//       roleName: roleJsonResponse.roleName, // Include the extracted role name
//     };
//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     return {
//       name: "N/A",
//       email: "N/A",
//       phone: "N/A",
//       location: "N/A",
//       keySkills: "N/A",
//       totalExperienceYears: 0,
//       mainDomain: "N/A",
//       companiesWorked: [],
//       education: [],
//       similarityScore: 0,
//       commonSkills: [],
//       preferred: "No",
//       roleName: "N/A", // Default role name
//     };
//   }
// }

// module.exports = {
//   extractTextFromWord,
//   extractTextFromPDF,
//   extractTextFromJobDescription, // Added this function
//   summarizeResume,
//   compareResumeToJobDescription,
// };

// const fs = require("fs");
// const pdf = require("pdf-parse");
// const mammoth = require("mammoth");
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// // Ensure the environment variable is set
// if (!process.env.GEMINI_API_KEY) {
//   console.error("GEMINI_API_KEY environment variable not set.");
//   process.exit(1); // Exit if the API key is missing
// }

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// async function extractTextFromWord(filePath) {
//   try {
//     console.log(`Attempting to extract text from Word: ${filePath}`);
//     const result = await mammoth.extractRawText({ path: filePath });
//     console.log("Word extraction successful.");
//     return result.value;
//   } catch (error) {
//     console.error("Error extracting text from Word document:", error);
//     throw error; // Re-throw to be caught by the caller
//   }
// }

// async function extractTextFromPDF(filePath) {
//   try {
//     console.log(`Attempting to extract text from PDF: ${filePath}`);
//     // Add an option to disable warnings if they are noisy
//     // const options = { disableWarning: true };
//     const dataBuffer = fs.readFileSync(filePath);
//     const pdfData = await pdf(dataBuffer);
//     console.log("PDF extraction successful.");
//     return pdfData.text;
//   } catch (error) {
//     console.error("Error extracting text from PDF:", error);
//     throw error; // Re-throw to be caught by the caller
//   }
// }

// async function extractTextFromJobDescription(file) {
//   if (!file || !file.path || !file.mimetype) {
//     throw new Error("Invalid file object provided.");
//   }
//   try {
//     console.log(
//       `Extracting text from file: ${file.originalname} (MIME: ${file.mimetype})`
//     );
//     if (
//       file.mimetype === "application/msword" || // .doc
//       file.mimetype ===
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
//     ) {
//       return await extractTextFromWord(file.path);
//     } else if (file.mimetype === "application/pdf") {
//       return await extractTextFromPDF(file.path);
//     } else {
//       throw new Error(
//         `Unsupported file type for job description: ${file.mimetype}`
//       );
//     }
//   } catch (error) {
//     console.error("Error extracting text from job description file:", error);
//     // Clean up the uploaded file if extraction failed, assuming file.path exists
//     if (file.path) {
//         try {
//             fs.unlinkSync(file.path);
//             console.log(`Cleaned up file: ${file.path}`);
//         } catch (cleanupError) {
//             console.error(`Error cleaning up file ${file.path}:`, cleanupError);
//         }
//     }
//     throw error; // Re-throw the original error
//   }
// }

// async function summarizeResume(resumeText) {
//   // Use a faster model for summarization
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//   try {
//     console.log("Generating resume summary...");
//     const prompt = `Create a concise summary of the following resume focusing on key qualifications, experience, and skills. The summary should be suitable for a quick overview.\n\nResume:\n${resumeText}\n\nConcise Summary:`;
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const summary = response.text().trim();
//     console.log("Resume summary generated successfully.");
//     return summary;
//   } catch (error) {
//     console.error("Gemini API Error (Summary):", error);
//     // Provide a fallback message that indicates failure
//     return "Summary generation failed.";
//   }
// }

// async function compareResumeToJobDescription(resumeText, jobDescription) {
//   // Use a more capable model for detailed analysis and structured output
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//   // Combine all requests into a single prompt for better context and efficiency
//   const prompt = `
// You are an AI assistant specialized in analyzing resumes and comparing them to job descriptions.
// Your task is to extract key information from the resume, analyze its fit with the job description, and present the results in a precise JSON format.

// Follow these instructions carefully:
// 1.  **Output Format:** Respond STRICTLY and ONLY in JSON format. DO NOT include any markdown code block markers (like \`\`\`json) or any other text before or after the JSON object.
// 2.  **JSON Structure:** Your output JSON object must conform exactly to the following structure. Provide only the JSON object itself, nothing else.
//     {
//       "name": "[Full Name from Resume]",
//       "email": "[Email Address from Resume]",
//       "phone": "[Phone Number from Resume]",
//       "location": "[Candidate's Location from Resume]",
//       "keySkills": [],
//       "totalExperienceYears": 0,
//       "mainDomain": "[Candidate's primary domain or typical role/field of experience from Resume]",
//       "companiesWorked": [
//         {
//           "companyName": "[Company Name]",
//           "role": "[Role/Position]",
//           "duration": "[Duration or dates]"
//         }
//       ],
//       "education": [
//         {
//           "degree": "[Degree Name]",
//           "institution": "[Institution Name]",
//           "year": "[Year of Graduation or Duration]"
//         }
//       ],
//       "similarityScore": 0,
//       "commonSkills": [],
//       "preferred": "[Yes or No]",
//       "roleName": "[Exact or closest possible role/position title from the Job Description]"
//     }
// 3.  **Data Extraction Rules:**
//     *   Extract information directly and only from the provided Resume text.
//     *   If a piece of information (like name, email, phone, location, specific work history details) is genuinely not present in the Resume text, use the string "N/A" for text fields, 0 for \`totalExperienceYears\`, and empty arrays \`[]\` for \`keySkills\`, \`companiesWorked\`, and \`education\`. Do NOT fabricate information.
//     *   Estimate \`totalExperienceYears\` based on the professional work history entries listed in the resume. If no work history is listed, use 0.
//     *   Extract \`keySkills\` as a JSON array of strings (e.g., \`["Python", "Machine Learning", "SQL"]\`), focusing on prominent technical or professional skills relevant to the job market. Include only distinct skills.
//     *   For \`companiesWorked\` and \`education\`, include entries only if clearly present in the resume. Each entry in \`companiesWorked\` should have \`companyName\`, \`role\`, and \`duration\`. Each entry in \`education\` should have \`degree\`, \`institution\`, and \`year\`. If a field within an entry is missing, use "N/A". List entries chronologically if possible, newest first.
//     *   Extract the primary \`roleName\` from the Job Description. Look for common job title patterns near the beginning or in headers.
//     *   Infer the candidate's overall \`mainDomain\` or typical role/field (e.g., "Software Engineering", "Data Science", "Marketing", "SAP", "Customer Service") based on their experience, skills, and education in the resume.

// 4.  **Analysis Rules (PRIORITY on Role Name Alignment):**
//     *   **HIGHEST PRIORITY:** Compare the candidate's inferred \`mainDomain\` from the resume with the extracted \`roleName\` from the Job Description.
//     *   **If the candidate's \`mainDomain\` does NOT significantly align with the \`roleName\` from the Job Description (e.g., a candidate with a "Marketing" domain applying for a "Software Engineering" role, or an "SAP Consultant" applying for a "Data Scientist" role), OR if \`mainDomain\` is "N/A":**
//         *   Set \`similarityScore\` to a very low value (between 0 and 10).
//         *   Set \`preferred\` to "No".
//         *   Apply these two rules REGARDLESS of how many individual skills or years of experience might technically match. The core role mismatch is considered a primary disqualifier for this analysis.
//     *   **If the candidate's \`mainDomain\` DOES significantly align with the \`roleName\` from the Job Description:**
//         *   Calculate \`similarityScore\` (11-100) based on the relevance of the candidate's experience, skills, and education to the requirements and preferences stated in the Job Description. A higher score means a better fit.
//         *   Determine \`preferred\` status ('Yes' or 'No') based on the overall assessment of fit against the Job Description requirements (including minimum experience, essential skills, etc.), allowing for a "Yes" if the match is strong.
//     *   Identify \`commonSkills\` that are explicitly mentioned or strongly implied as requirements/assets in the Job Description AND present in the Resume. This is still important information to extract even if the role doesn't match, but it does not override the role mismatch for \`similarityScore\` or \`preferred\`.

// **Job Description:**
// ${jobDescription}

// **Resume:**
// ${resumeText}

// **JSON Output:**
// `;

//   try {
//     console.log("Starting resume vs. job description comparison...");
//     // console.log("Prompt being sent:", prompt); // Optional: log prompt for debugging

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     let responseText = response.text();

//     console.log("Attempting to parse JSON response...");
//     responseText = responseText.replace(/^```json\n|```$/g, "").trim();

//     let jsonResponse;
//     try {
//       jsonResponse = JSON.parse(responseText);
//       console.log("JSON parsed successfully.");
//       // Basic validation to see if the essential structure is present
//       if (
//         typeof jsonResponse.name !== 'string' ||
//         typeof jsonResponse.email !== 'string' ||
//         typeof jsonResponse.similarityScore !== 'number' ||
//         !Array.isArray(jsonResponse.commonSkills) ||
//         typeof jsonResponse.preferred !== 'string' ||
//         typeof jsonResponse.roleName !== 'string' ||
//         typeof jsonResponse.mainDomain !== 'string'
//       ) {
//          throw new Error("Parsed JSON has unexpected structure.");
//       }
//     } catch (parseError) {
//       console.error("Failed to parse JSON from Gemini response:", parseError);
//       console.log("Raw Gemini Response:", responseText); // Log raw response for debugging

//       // Attempt a fallback by trying to find a JSON object within the response
//       const jsonMatch = responseText.match(/\{[\s\S]*\}/);
//       if (jsonMatch) {
//          try {
//             jsonResponse = JSON.parse(jsonMatch[0]);
//             console.log("Successfully parsed JSON from substring.");
//              // Basic validation again
//              if (
//                 typeof jsonResponse.name !== 'string' ||
//                 typeof jsonResponse.email !== 'string' ||
//                 typeof jsonResponse.similarityScore !== 'number' ||
//                 !Array.isArray(jsonResponse.commonSkills) ||
//                 typeof jsonResponse.preferred !== 'string' ||
//                 typeof jsonResponse.roleName !== 'string' ||
//                 typeof jsonResponse.mainDomain !== 'string'
//               ) {
//                  throw new Error("Parsed substring JSON has unexpected structure.");
//               }
//          } catch (substringParseError) {
//             console.error("Failed to parse JSON substring:", substringParseError);
//              // If even substring fails, return the default error object
//             return {
//               name: "N/A",
//               email: "N/A",
//               phone: "N/A",
//               location: "N/A",
//               keySkills: [],
//               totalExperienceYears: 0,
//               mainDomain: "N/A",
//               companiesWorked: [],
//               education: [],
//               similarityScore: 0,
//               commonSkills: [],
//               preferred: "No",
//               roleName: "N/A",
//             };
//          }
//       } else {
//          // If no JSON object found at all, return the default error object
//           console.error("No JSON object found in Gemini response.");
//           return {
//             name: "N/A",
//             email: "N/A",
//             phone: "N/A",
//             location: "N/A",
//             keySkills: [],
//             totalExperienceYears: 0,
//             mainDomain: "N/A",
//             companiesWorked: [],
//             education: [],
//             similarityScore: 0,
//             commonSkills: [],
//             preferred: "No",
//             roleName: "N/A",
//           };
//       }
//     }

//     // Ensure keys match the expected structure and fill N/A or defaults if missing from parsed object
//     const finalResponse = {
//         name: typeof jsonResponse.name === 'string' && jsonResponse.name.length > 0 && jsonResponse.name.toLowerCase() !== 'n/a' ? jsonResponse.name : "N/A",
//         email: typeof jsonResponse.email === 'string' && jsonResponse.email.length > 0 && jsonResponse.email.toLowerCase() !== 'n/a' ? jsonResponse.email : "N/A",
//         phone: typeof jsonResponse.phone === 'string' && jsonResponse.phone.length > 0 && jsonResponse.phone.toLowerCase() !== 'n/a' ? jsonResponse.phone : "N/A",
//         location: typeof jsonResponse.location === 'string' && jsonResponse.location.length > 0 && jsonResponse.location.toLowerCase() !== 'n/a' ? jsonResponse.location : "N/A",
//         keySkills: Array.isArray(jsonResponse.keySkills) ? jsonResponse.keySkills.filter(s => typeof s === 'string' && s.length > 0) : [],
//         totalExperienceYears: typeof jsonResponse.totalExperienceYears === 'number' && jsonResponse.totalExperienceYears >= 0 ? jsonResponse.totalExperienceYears : 0,
//         mainDomain: typeof jsonResponse.mainDomain === 'string' && jsonResponse.mainDomain.length > 0 && jsonResponse.mainDomain.toLowerCase() !== 'n/a' ? jsonResponse.mainDomain : "N/A",
//         companiesWorked: Array.isArray(jsonResponse.companiesWorked) ? jsonResponse.companiesWorked.filter(c => typeof c === 'object' && c !== null && typeof c.companyName === 'string') : [],
//         education: Array.isArray(jsonResponse.education) ? jsonResponse.education.filter(e => typeof e === 'object' && e !== null && typeof e.institution === 'string') : [],
//         // Apply validation and default for similarityScore - important if model fails role logic
//         similarityScore: typeof jsonResponse.similarityScore === 'number' && jsonResponse.similarityScore >= 0 && jsonResponse.similarityScore <= 100 ? jsonResponse.similarityScore : 0,
//         commonSkills: Array.isArray(jsonResponse.commonSkills) ? jsonResponse.commonSkills.filter(s => typeof s === 'string' && s.length > 0) : [],
//         // Apply validation and default for preferred - important if model fails role logic
//         preferred: jsonResponse.preferred === 'Yes' || jsonResponse.preferred === 'No' ? jsonResponse.preferred : "No",
//         roleName: typeof jsonResponse.roleName === 'string' && jsonResponse.roleName.length > 0 && jsonResponse.roleName.toLowerCase() !== 'n/a' ? jsonResponse.roleName : "N/A",
//     };

//     // A final safety check could be added here if you don't fully trust the model
//     // to follow the priority rule even with few-shot examples.
//     // For instance, if roleName != 'N/A' and mainDomain != 'N/A' and they seem unrelated,
//     // you could programmatically force similarityScore lower and preferred to "No".
//     // Example (simple keyword check - might need tuning):
//     /*
//     const roleKeywords = finalResponse.roleName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
//     const domainKeywords = finalResponse.mainDomain.toLowerCase().split(/\s+/).filter(w => w.length > 2);
//     const commonKeywordCount = roleKeywords.filter(kw => domainKeywords.includes(kw)).length;
//     const minCommonKeywordsForAlignment = 1; // Adjust threshold as needed

//     if (finalResponse.roleName !== 'N/A' && finalResponse.mainDomain !== 'N/A' && commonKeywordCount < minCommonKeywordsForAlignment) {
//          console.warn(`Programmatic role mismatch detected (JD: "${finalResponse.roleName}", Resume Domain: "${finalResponse.mainDomain}"). Overriding score and preferred.`);
//          finalResponse.similarityScore = finalResponse.similarityScore > 10 ? 10 : finalResponse.similarityScore; // Ensure score is low
//          finalResponse.preferred = "No";
//     }
//     */

//     return finalResponse;

//   } catch (error) {
//     console.error("Gemini API Error during comparison or final processing:", error);
//     // Return a default object in case of API errors or unexpected processing failures
//     return {
//       name: "N/A",
//       email: "N/A",
//       phone: "N/A",
//       location: "N/A",
//       keySkills: [],
//       totalExperienceYears: 0,
//       mainDomain: "N/A",
//       companiesWorked: [],
//       education: [],
//       similarityScore: 0,
//       commonSkills: [],
//       preferred: "No",
//       roleName: "N/A",
//     };
//   }
// }

// module.exports = {
//   extractTextFromWord,
//   extractTextFromPDF,
//   extractTextFromJobDescription,
//   summarizeResume,
//   compareResumeToJobDescription,
// };

// backend/analyzer.js
// backend/services/resumeServices.js (or your analyzer.js equivalent)
// const fs = require("fs"); // readFileSync no longer needed for PDF if directly using buffer
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractTextFromWordBuffer(fileObject) {
  // Takes the multer file object
  try {
    console.log(
      `Attempting to extract text from Word buffer: ${fileObject.originalname}`
    );
    if (!fileObject.buffer) {
      throw new Error("File buffer is missing for Word document.");
    }
    const result = await mammoth.extractRawText({ buffer: fileObject.buffer });
    console.log("Word extraction from buffer successful.");
    return result.value;
  } catch (error) {
    console.error(
      `Error extracting text from Word buffer (${fileObject.originalname}):`,
      error
    );
    throw error;
  }
}

async function extractTextFromPDFBuffer(fileObject) {
  // Takes the multer file object
  try {
    console.log(
      `Attempting to extract text from PDF buffer: ${fileObject.originalname}`
    );
    if (!fileObject.buffer) {
      throw new Error("File buffer is missing for PDF document.");
    }
    const pdfData = await pdf(fileObject.buffer); // pdf-parse directly accepts a Buffer
    console.log("PDF extraction from buffer successful.");
    return pdfData.text;
  } catch (error) {
    console.error(
      `Error extracting text from PDF buffer (${fileObject.originalname}):`,
      error
    );
    throw error;
  }
}

async function extractTextFromTextBuffer(fileObject) {
  // Takes the multer file object
  try {
    console.log(
      `Attempting to extract text from TXT buffer: ${fileObject.originalname}`
    );
    if (!fileObject.buffer) {
      throw new Error("File buffer is missing for TXT document.");
    }
    // Assuming UTF-8 encoding for text files
    const text = fileObject.buffer.toString("utf-8");
    console.log("Text extraction from TXT buffer successful.");
    return text;
  } catch (error) {
    console.error(
      `Error extracting text from TXT buffer (${fileObject.originalname}):`,
      error
    );
    throw error;
  }
}

// This is the primary function called by the route
async function extractTextFromBuffer(fileObject) {
  if (
    !fileObject ||
    !fileObject.buffer ||
    !fileObject.mimetype ||
    !fileObject.originalname
  ) {
    throw new Error(
      `Invalid file object provided for buffer extraction. Received: ${JSON.stringify(fileObject)}`
    );
  }
  try {
    console.log(
      `Extracting text from buffer: ${fileObject.originalname} (MIME: ${fileObject.mimetype})`
    );
    if (
      fileObject.mimetype === "application/msword" ||
      fileObject.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return await extractTextFromWordBuffer(fileObject);
    } else if (fileObject.mimetype === "application/pdf") {
      return await extractTextFromPDFBuffer(fileObject);
    } else if (fileObject.mimetype === "text/plain") {
      return await extractTextFromTextBuffer(fileObject);
    } else {
      throw new Error(
        `Unsupported file type for buffer extraction: ${fileObject.mimetype} for file ${fileObject.originalname}`
      );
    }
  } catch (error) {
    // Error is already logged in specific extraction functions
    // No file cleanup here as it's buffer-based
    throw error; // Re-throw to be caught by the route handler
  }
}

// summarizeResume and compareResumeToJobDescription functions remain UNCHANGED
// as they operate on text strings, not file paths or buffers.

async function summarizeResume(resumeText) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  try {
    // ... (rest of your summarizeResume logic)
    console.log("Generating resume summary...");
    const prompt = `Create a concise summary of the following resume focusing on key qualifications, experience, and skills. The summary should be suitable for a quick overview.\n\nResume:\n${resumeText}\n\nConcise Summary:`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();
    console.log("Resume summary generated successfully.");
    return summary;
  } catch (error) {
    console.error("Gemini API Error (Summary):", error);
    return "Summary generation failed.";
  }
}

async function compareResumeToJobDescription(resumeText, jobDescription) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  // ... (rest of your extensive compareResumeToJobDescription prompt and logic)
  const prompt = `
You are an AI assistant specialized in analyzing resumes and comparing them to job descriptions.
Your task is to extract key information from the resume, analyze its fit with the job description, and present the results in a precise JSON format.

Follow these instructions carefully:
1.  **Output Format:** Respond STRICTLY and ONLY in JSON format. DO NOT include any markdown code block markers (like \`\`\`json) or any other text before or after the JSON object.
2.  **JSON Structure:** Your output JSON object must conform exactly to the following structure. Provide only the JSON object itself, nothing else.
    {
      "name": "[Full Name from Resume]",
      "email": "[Email Address from Resume]",
      "phone": "[Phone Number from Resume]",
      "location": "[Candidate's Location from Resume]",
      "keySkills": [],
      "totalExperienceYears": 0,
      "mainDomain": "[Candidate's primary domain or typical role/field of experience from Resume]",
      "companiesWorked": [
        {
          "companyName": "[Company Name]",
          "role": "[Role/Position]",
          "duration": "[Duration or dates]"
        }
      ],
      "education": [
        {
          "degree": "[Degree Name]",
          "institution": "[Institution Name]",
          "year": "[Year of Graduation or Duration]"
        }
      ],
      "similarityScore": 0,
      "commonSkills": [],
      "preferred": "[Yes or No]",
      "roleName": "[Exact or closest possible role/position title from the Job Description]"
    }
3.  **Data Extraction Rules:**
    *   Extract information directly and only from the provided Resume text.
    *   If a piece of information (like name, email, phone, location, specific work history details) is genuinely not present in the Resume text, use the string "N/A" for text fields, 0 for \`totalExperienceYears\`, and empty arrays \`[]\` for \`keySkills\`, \`companiesWorked\`, and \`education\`. Do NOT fabricate information.
    *   Estimate \`totalExperienceYears\` based on the professional work history entries listed in the resume. If no work history is listed, use 0.
    *   Extract \`keySkills\` as a JSON array of strings (e.g., \`["Python", "Machine Learning", "SQL"]\`), focusing on prominent technical or professional skills relevant to the job market. Include only distinct skills.
    *   For \`companiesWorked\` and \`education\`, include entries only if clearly present in the resume. Each entry in \`companiesWorked\` should have \`companyName\`, \`role\`, and \`duration\`. Each entry in \`education\` should have \`degree\`, \`institution\`, and \`year\`. If a field within an entry is missing, use "N/A". List entries chronologically if possible, newest first.
    *   Extract the primary \`roleName\` from the Job Description. Look for common job title patterns near the beginning or in headers.
    *   Infer the candidate's overall \`mainDomain\` or typical role/field (e.g., "Software Engineering", "Data Science", "Marketing", "SAP", "Customer Service") based on their experience, skills, and education in the resume.

4.  **Analysis Rules (PRIORITY on Role Name Alignment):**
    *   **HIGHEST PRIORITY:** Compare the candidate's inferred \`mainDomain\` from the resume with the extracted \`roleName\` from the Job Description.
    *   **If the candidate's \`mainDomain\` does NOT significantly align with the \`roleName\` from the Job Description (e.g., a candidate with a "Marketing" domain applying for a "Software Engineering" role, or an "SAP Consultant" applying for a "Data Scientist" role), OR if \`mainDomain\` is "N/A":**
        *   Set \`similarityScore\` to a very low value (between 0 and 10).
        *   Set \`preferred\` to "No".
        *   Apply these two rules REGARDLESS of how many individual skills or years of experience might technically match. The core role mismatch is considered a primary disqualifier for this analysis.
    *   **If the candidate's \`mainDomain\` DOES significantly align with the \`roleName\` from the Job Description:**
        *   Calculate \`similarityScore\` (11-100) based on the relevance of the candidate's experience, skills, and education to the requirements and preferences stated in the Job Description. A higher score means a better fit.
        *   Determine \`preferred\` status ('Yes' or 'No') based on the overall assessment of fit against the Job Description requirements (including minimum experience, essential skills, etc.), allowing for a "Yes" if the match is strong.
    *   Identify \`commonSkills\` that are explicitly mentioned or strongly implied as requirements/assets in the Job Description AND present in the Resume. This is still important information to extract even if the role doesn't match, but it does not override the role mismatch for \`similarityScore\` or \`preferred\`.

**Job Description:**
${jobDescription}

**Resume:**
${resumeText}

**JSON Output:**
`;

  try {
    console.log("Starting resume vs. job description comparison...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();
    responseText = responseText.replace(/^```json\n|```$/g, "").trim();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
      if (
        typeof jsonResponse.name !== "string" ||
        typeof jsonResponse.email !== "string" ||
        typeof jsonResponse.similarityScore !== "number" ||
        !Array.isArray(jsonResponse.commonSkills) ||
        typeof jsonResponse.preferred !== "string" ||
        typeof jsonResponse.roleName !== "string" ||
        typeof jsonResponse.mainDomain !== "string"
      ) {
        throw new Error("Parsed JSON has unexpected structure.");
      }
    } catch (parseError) {
      console.error(
        "Failed to parse JSON from Gemini response:",
        parseError,
        "Raw Response:",
        responseText
      );
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          jsonResponse = JSON.parse(jsonMatch[0]);
          if (
            /* re-validate structure */
            typeof jsonResponse.name !== "string" ||
            typeof jsonResponse.email !== "string" ||
            typeof jsonResponse.similarityScore !== "number" ||
            !Array.isArray(jsonResponse.commonSkills) ||
            typeof jsonResponse.preferred !== "string" ||
            typeof jsonResponse.roleName !== "string" ||
            typeof jsonResponse.mainDomain !== "string"
          ) {
            throw new Error("Parsed substring JSON has unexpected structure.");
          }
        } catch (substringParseError) {
          console.error("Failed to parse JSON substring:", substringParseError);
          throw new Error(
            "Could not parse valid JSON from Gemini response (substring attempt)."
          );
        }
      } else {
        throw new Error("No JSON object found in Gemini response.");
      }
    }

    const finalResponse = {
      name:
        typeof jsonResponse.name === "string" &&
        jsonResponse.name.length > 0 &&
        jsonResponse.name.toLowerCase() !== "n/a"
          ? jsonResponse.name
          : "N/A",
      email:
        typeof jsonResponse.email === "string" &&
        jsonResponse.email.length > 0 &&
        jsonResponse.email.toLowerCase() !== "n/a"
          ? jsonResponse.email
          : "N/A",
      phone:
        typeof jsonResponse.phone === "string" &&
        jsonResponse.phone.length > 0 &&
        jsonResponse.phone.toLowerCase() !== "n/a"
          ? jsonResponse.phone
          : "N/A",
      location:
        typeof jsonResponse.location === "string" &&
        jsonResponse.location.length > 0 &&
        jsonResponse.location.toLowerCase() !== "n/a"
          ? jsonResponse.location
          : "N/A",
      keySkills: Array.isArray(jsonResponse.keySkills)
        ? jsonResponse.keySkills.filter(
            (s) => typeof s === "string" && s.length > 0
          )
        : [],
      totalExperienceYears:
        typeof jsonResponse.totalExperienceYears === "number" &&
        jsonResponse.totalExperienceYears >= 0
          ? jsonResponse.totalExperienceYears
          : 0,
      mainDomain:
        typeof jsonResponse.mainDomain === "string" &&
        jsonResponse.mainDomain.length > 0 &&
        jsonResponse.mainDomain.toLowerCase() !== "n/a"
          ? jsonResponse.mainDomain
          : "N/A",
      companiesWorked: Array.isArray(jsonResponse.companiesWorked)
        ? jsonResponse.companiesWorked.filter(
            (c) =>
              typeof c === "object" &&
              c !== null &&
              typeof c.companyName === "string"
          )
        : [],
      education: Array.isArray(jsonResponse.education)
        ? jsonResponse.education.filter(
            (e) =>
              typeof e === "object" &&
              e !== null &&
              typeof e.institution === "string"
          )
        : [],
      similarityScore:
        typeof jsonResponse.similarityScore === "number" &&
        jsonResponse.similarityScore >= 0 &&
        jsonResponse.similarityScore <= 100
          ? jsonResponse.similarityScore
          : 0,
      commonSkills: Array.isArray(jsonResponse.commonSkills)
        ? jsonResponse.commonSkills.filter(
            (s) => typeof s === "string" && s.length > 0
          )
        : [],
      preferred:
        jsonResponse.preferred === "Yes" || jsonResponse.preferred === "No"
          ? jsonResponse.preferred
          : "No",
      roleName:
        typeof jsonResponse.roleName === "string" &&
        jsonResponse.roleName.length > 0 &&
        jsonResponse.roleName.toLowerCase() !== "n/a"
          ? jsonResponse.roleName
          : "N/A",
    };
    console.log(finalResponse);
    return finalResponse;
  } catch (error) {
    console.error(
      "Gemini API Error during comparison or final processing:",
      error
    );
    return {
      name: "N/A",
      email: "N/A",
      phone: "N/A",
      location: "N/A",
      keySkills: [],
      totalExperienceYears: 0,
      mainDomain: "N/A",
      companiesWorked: [],
      education: [],
      similarityScore: 0,
      commonSkills: [],
      preferred: "No",
      roleName: "N/A (Error)",
      error: `Comparison failed: ${error.message}`, // Add error message to the response
    };
  }
}

module.exports = {
  extractTextFromBuffer, // Export the new buffer-based extraction function
  summarizeResume,
  compareResumeToJobDescription,
};
