// // backend/scripts/loadJdsToDB.js
// const mongoose = require("mongoose");
// const { processJdDirectory } = require("../services/jdProcessingService");
// const path = require("path"); // Node.js path module

// require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

// const MONGODB_URI = process.env.MONGODB_URI;
// const JD_BASE_DIRECTORY = "C:/Users/AdityaTomar/Downloads/JD"; // YOUR ACTUAL PATH

// console.log("JD_BASE_DIRECTORY is currently set to:", JD_BASE_DIRECTORY); // <-- ADD THIS LOG

// if (
//   JD_BASE_DIRECTORY === "YOUR_ABSOLUTE_PATH_TO_THE_MAIN_JD_FOLDER_HERE" ||
//   !JD_BASE_DIRECTORY
// ) {
//   console.error(
//     "Error: Please set the JD_BASE_DIRECTORY variable in loadJdsToDB.js to the correct path."
//   );
//   // process.exit(1); // <-- TEMPORARILY COMMENT THIS OUT for debugging
// }

// if (!MONGODB_URI) {
//   console.error("Error: MONGODB_URI is not defined in your .env file.");
//   process.exit(1);
// }
// if (
//   JD_BASE_DIRECTORY === "C:\Users\AdityaTomar\Downloads\JD" ||
//   !JD_BASE_DIRECTORY
// ) {
//   console.error(
//     "Error: Please set the JD_BASE_DIRECTORY variable in loadJdsToDB.js to the correct path."
//   );
//   process.exit(1);
// }

// async function run() {
//   try {
//     await mongoose.connect(MONGODB_URI, {
//       // useNewUrlParser: true, // Deprecated in Mongoose 6+
//       // useUnifiedTopology: true, // Deprecated
//     });
//     console.log("Connected to MongoDB successfully.");

//     await processJdDirectory(JD_BASE_DIRECTORY);
//   } catch (error) {
//     console.error("Error during script execution:", error);
//   } finally {
//     await mongoose.disconnect();
//     console.log("Disconnected from MongoDB.");
//   }
// }

// run();

// backend/scripts/loadJdsToDB.js
const path = require("path"); // Require path module
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") }); // Correct path to .env
const mongoose = require("mongoose");
const { processJdDirectory } = require("../services/jdProcessingService");

const MONGODB_URI = process.env.MONGODB_URI;
const JD_BASE_DIRECTORY = "C:/Users/AdityaTomar/Downloads/JD"; // YOUR ACTUAL ABSOLUTE PATH

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in your .env file.");
  process.exit(1);
}
// Remove the check for the placeholder string if you've set the path directly
if (
  !JD_BASE_DIRECTORY ||
  JD_BASE_DIRECTORY === "YOUR_ABSOLUTE_PATH_TO_THE_MAIN_JD_FOLDER_HERE"
) {
  console.error(
    "Error: Please set the JD_BASE_DIRECTORY variable in loadJdsToDB.js to the correct absolute path."
  );
  process.exit(1);
}

async function run() {
  if (!process.env.GEMINI_API_KEY) {
    console.error(
      "Error: GEMINI_API_KEY is not defined in your .env file. Cannot proceed with JD processing."
    );
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully.");

    await processJdDirectory(JD_BASE_DIRECTORY);
  } catch (error) {
    console.error("Error during script execution:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
