// const mongoose = require("mongoose");

// const candidateSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   resumeSummary: { type: String },
//   similarityScore: { type: Number },
//   interviewStatus: {
//     type: String,
//     enum: [
//       "Not Started",
//       "Resume Screening",
//       "Phone Interview",
//       "Technical Assessment",
//       "On-site Interview",
//       "Reference Check",
//       "Offer Extended",
//       "Hired",
//       "Rejected",
//     ],
//     default: "Not Started",
//   },
//   interviewNotes: [
//     {
//       stage: String,
//       note: String,
//       createdAt: { type: Date, default: Date.now },
//     },
//   ],
//   nextInterviewDate: { type: Date },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });

// // Update the updatedAt field before saving
// candidateSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

// module.exports = mongoose.model("Candidate", candidateSchema);

// const mongoose = require("mongoose");

// const candidateSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   phoneNumber: String,
//   location: String,
//   resumeSummary: { type: String },
//   similarityScore: { type: Number },
//   keySkills: [String],
//   commonSkills: [String],
//   totalExperienceYears: { type: Number, default: 0 },
//   mainDomain: { type: String },
//   education: [
//     {
//       degree: String,
//       institution: String,
//       year: String,
//     },
//   ],
//   interviewStatus: {
//     type: String,
//     enum: [
//       "Not Started",
//       "Resume Screening",
//       "Phone Interview",
//       "Technical Assessment",
//       "On-site Interview",
//       "Reference Check",
//       "Offer Extended",
//       "Hired",
//       "Rejected",
//     ],
//     default: "Not Started",
//   },
//   interviewNotes: [
//     {
//       stage: String,
//       note: String,
//       createdAt: { type: Date, default: Date.now },
//     },
//   ],
//   nextInterviewDate: { type: Date },
//   resumeFile: {
//     filename: String,
//     contentType: String,
//     data: Buffer,
//   },
//   companiesWorked: [
//     {
//       companyName: String,
//       role: String,
//       duration: { type: mongoose.Schema.Types.Mixed },
//     },
//   ],
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
//   roleName: { type: String },
// });

// // Update the updatedAt field before saving
// candidateSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

// module.exports = mongoose.model("Candidate", candidateSchema);

const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: String,
  location: String,
  resumeSummary: { type: String },
  similarityScore: { type: Number },
  keySkills: [String],
  commonSkills: [String],
  totalExperienceYears: { type: Number, default: 0 },
  mainDomain: { type: String },
  education: [
    {
      degree: String, // Example: "Bachelor of Science in Computer Science"
      institution: String, // Example: "University of California"
      year: String, // Example: "2015-2019"
    },
  ],
  interviewStatus: {
    type: String,
    enum: [
      "Not Started",
      "Resume Screening",
      "Phone Interview",
      "Technical Assessment",
      "On-site Interview",
      "Reference Check",
      "Offer Extended",
      "Hired",
      "Rejected",
    ],
    default: "Not Started",
  },
  interviewNotes: [
    {
      stage: String,
      note: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  nextInterviewDate: { type: Date },
  resumeFile: {
    filename: String,
    contentType: String,
    data: Buffer,
  },
  companiesWorked: [
    {
      companyName: String,
      role: String,
      duration: { type: mongoose.Schema.Types.Mixed },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  roleName: { type: String },
});

// Update the updatedAt field before saving
candidateSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Candidate", candidateSchema);
