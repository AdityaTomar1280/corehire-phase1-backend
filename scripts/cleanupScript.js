// cleanupScript.js
require("dotenv").config({ path: require("path").resolve(__dirname, ".env") }); // Adjust path to your .env
const mongoose = require("mongoose");
const JobDescription = require("../models/JobDescription"); // Assuming your model is here

const MONGODB_URI = process.env.MONGODB_URI;

async function removeFullTextContent() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not set in .env file.");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    console.log(
      "Attempting to remove 'fullTextContent' field from all job descriptions..."
    );

    const result = await JobDescription.updateMany(
      {}, // Empty filter to match all
      { $unset: { fullTextContent: "" } }
    );

    console.log("Update operation result:");
    console.log(`- Matched documents: ${result.matchedCount}`);
    console.log(`- Modified documents: ${result.modifiedCount}`);

    if (result.acknowledged) {
      console.log("'fullTextContent' field removal process completed.");
    } else {
      console.error("The update operation was not acknowledged by the server.");
    }
  } catch (error) {
    console.error("Error during cleanup script:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

removeFullTextContent();
