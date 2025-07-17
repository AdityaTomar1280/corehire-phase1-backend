// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// // Register API Endpoint
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user
//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     // Save user to database
//     await newUser.save();

//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     console.error("Registration error:", error);
//     res.status(500).json({ message: "Registration failed" });
//   }
// });

// // Login API Endpoint
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Check password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Create JWT token
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.status(200).json({ message: "Login successful", token });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Login failed" });
//   }
// });

// module.exports = router; // CORRECTED: Export the router instance

const express = require("express");
const router = express.Router();
const authController = require("./../controllers/authController");


// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//     });
//     await newUser.save();

//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     console.error("Registration error:", error);
//     res.status(500).json({ message: "Registration failed" });
//   }
// });

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.status(200).json({ message: "Login successful", token });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Login failed" });
//   }
// });

router.route("/register").post(authController.register);
router.route("/login").post(authController.login);
// router.route("/verifyEmail").get(authController.verifyEmail);
router
  .route("/request-password-reset")
  .post(authController.requestPasswordReset);
router.route("/reset-password").post(authController.resetPassword);

// router.post("/request-password-reset", async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User doesn't exist" });

//     const secret = process.env.JWT_SECRET + user.password;
//     const token = jwt.sign({ id: user._id, email: user.email }, secret, {
//       expiresIn: "1h",
//     });
//     const resetURL = `http://localhost:3001/resetpassword?id=${user._id}&token=${token}`;

//     await sendEmail(
//       user.email,
//       "Password Reset Request",
//       `
//     <h2>Password Reset Request</h2>
//     <p>Hello ${user.name || "User"},</p>
//     <p>We received a request to reset your password. Click the button below to reset it:</p>
//     <p>
//       <a href="${resetURL}"
//          style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
//         Reset Password
//       </a>
//     </p>
//     <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
//     <p><a href="${resetURL}">${resetURL}</a></p>
//     <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>
//     <p>For security reasons, this link will expire in 1 hour.</p>
//     <p>Best regards,</p>
//     <p><strong>CoreHire.ai</strong>(Powered by CoreOps.ai)</p>
//   `
//     );

//     res.status(200).json({ message: "Password reset link sent" });
//   } catch (error) {
//     res.status(500).json({ message: "Something went wrong" });
//   }
// });

// router.post("/reset-password", async (req, res) => {
//   try {
//     const { id, token } = req.query;
//     const { password } = req.body;

//     const user = await User.findOne({ _id: id });
//     if (!user) return res.status(400).json({ message: "User not found!" });

//     const secret = process.env.JWT_SECRET + user.password;
//     jwt.verify(token, secret);

//     const encryptedPassword = await bcrypt.hash(password, 12);
//     await User.updateOne(
//       { _id: id },
//       { $set: { password: encryptedPassword } }
//     );

//     res.status(200).json({ message: "Password has been reset" });
//   } catch (error) {
//     res.status(500).json({ message: "Invalid or expired token" });
//   }
// });

module.exports = router;
