// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const authRoutes = require("./routes/authRoutes");
// const resumeRoutes = require("./routes/resumeRoutes");
// require("dotenv").config();

// const candidateRoutes = require("./routes/candidateRoutes");

// const app = express();
// const port = process.env.PORT;
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   next();
// });

// app.use(express.json());
// app.use(cors());

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// app.use("/api", authRoutes);
// app.use("/api", resumeRoutes);
// app.use("/api", candidateRoutes);

// app.listen(port, () => {
//   console.log(`Server listening on port http://192.168.10.178:${port}`);
// });

// backend/server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // You have Mongoose, but the upload route doesn't use it directly
const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes"); // This should now contain the /upload logic
const candidateRoutes = require("./routes/candidateRoutes");
const jdRoutes = require("./routes/jdRoutes");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5001; // Ensure PORT is set in .env or default
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`); // Your existing logger
  next();
});

// CORS Configuration - Good to be more specific if possible
const corsOptions = {
  // origin: 'http://localhost:3000', // Your frontend URL
  // optionsSuccessStatus: 200
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    // useNewUrlParser: true, // These are no longer needed for Mongoose 6+
    // useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API Routes
app.use("/api", authRoutes);
app.use("/api", resumeRoutes); // This will now include the /upload route
app.use("/api", candidateRoutes);
app.use("/api", jdRoutes);
// app.use("/api", companyRoutes);
// Simple root route for testing if the server is up
app.get("/", (req, res) => {
  res.send("CoreHire.AI Backend is running!");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
  // Check for GEMINI_API_KEY at startup for early warning
  if (!process.env.GEMINI_API_KEY) {
    console.warn(
      "WARNING: GEMINI_API_KEY is not set in the .env file. AI features will not work."
    );
  }
  if (!process.env.MONGODB_URI) {
    console.warn(
      "WARNING: MONGODB_URI is not set in the .env file. Database features will not work."
    );
  }
});
