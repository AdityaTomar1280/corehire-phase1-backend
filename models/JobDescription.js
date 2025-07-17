// backend/models/JobDescription.js
const mongoose = require("mongoose");

const jobDescriptionSchema = new mongoose.Schema({
  role: {
    // e.g., "SAP SD", "Sales", "Business Manager"
    type: String,
    required: true,
    index: true,
  },
  originalFileName: {
    type: String,
    required: true,
  },
  fullPath: {
    // Full path on disk when it was processed (for reference)
    type: String,
  },
  overview: {
    type: String,
    default: "",
  },
  keyResponsibilities: {
    type: [String], // Array of strings for bullet points or paragraphs
    default: [],
  },
  qualificationsAndEducation: {
    type: [String], // Array of strings
    default: [],
  },
  preferredSkills: {
    type: [String], // Array of strings
    default: [],
  },
  fullTextContent: {
    // Optionally store the full extracted text
    type: String,
    default: "",
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
});

jobDescriptionSchema.index({ role: 1, originalFileName: 1 }, { unique: true });

module.exports = mongoose.model("JobDescription", jobDescriptionSchema);
