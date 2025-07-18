const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("./../services/sendEmail");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // const verificationToken = jwt.sign(
    //   { userId: newUser._id },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "24h" }
    // );

    // const verificationLink = `http://192.168.10.178/verifyemail?token=${verificationToken}`;

    // const emailHtml = `
    //   <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
    //     <h1 style="color: #5e35b1; text-align: center;">Welcome to CoreHire.ai</h1>
    //     <p>Hello ${name},</p>
    //     <p>Thank you for registering with CoreHire.ai. Please verify your email address by clicking the button below:</p>
    //     <div style="text-align: center; margin: 30px 0;">
    //       <a href="${verificationLink}"
    //          style="background-color: #5e35b1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
    //         Verify Email
    //       </a>
    //     </div>
    //     <p>Or copy and paste this link in your browser:</p>
    //     <p>${verificationLink}</p>
    //     <p>This link will expire in 24 hours.</p>
    //     <p>If you didn't create an account, please ignore this email.</p>
    //   </div>
    // `;

    // await sendEmail(email, "Verify Your CoreHire.ai Account", emailHtml);

    // return res.status(201).json({
    //   message:
    //     "Registration successful! Please check your email to verify your account.",
    // });

    return res.status(201).json({
      message:
        "Registration successful! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Registration failed. Please try again.",
      error: error.message,
    });
  }
};

// exports.verifyEmail = async (req, res, next) => {
//   try {
//     const { token } = req.query;

//     if (!token) {
//       return res
//         .status(400)
//         .json({ message: "Verification token is required." });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     if (user.isVerified) {
//       res.status(200).json({ message: "Email already verified." });
//       return res.redirect("http://192.168.10.178/signin");
//     }

//     user.isVerified = true;
//     await user.save();

//     res.status(200).json({ message: "Email verified successfully." });
//     return res.redirect("http://192.168.10.178/signin");
//   } catch (error) {
//     console.error("Verification error:", error);
//     if (error.name === "JsonWebTokenError") {
//       return res.status(400).json({ message: "Invalid verification token." });
//     }
//     if (error.name === "TokenExpiredError") {
//       return res
//         .status(400)
//         .json({ message: "Verification token has expired." });
//     }
//     return res
//       .status(500)
//       .json({ message: "Verification failed. Please try again." });
//   }
// };

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // if (!user.isVerified) {
    //   return res.status(403).json({
    //     message: "Please verify your email before logging in.",
    //     isVerified: false,
    //   });
    // }

    // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "24h",
    // });

    // return res.status(200).json({
    //   token,
    //   user: {
    //     id: user._id,
    //     name: user.name,
    //     email: user.email,
    //   },
    //   isVerified: true,
    //   message: "Login successful",
    // });

    return res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed. Please try again." });
  }
};

exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User doesn't exist" });

    const secret = process.env.JWT_SECRET + user.password;
    const token = jwt.sign({ id: user._id, email: user.email }, secret, {
      expiresIn: "1h",
    });
    const resetURL = `https://corehire-phase1.vercel.app/resetpassword?id=${user._id}&token=${token}`;
    // const resetURL = `http://localhost:3000/resetpassword?id=${user._id}&token=${token}`;

    await sendEmail(
      user.email,
      "Password Reset Request",
      `
    <h2>Password Reset Request</h2>
    <p>Hello ${user.name || "User"},</p>
    <p>We received a request to reset your password. Click the button below to reset it:</p>
    <p>
      <a href="${resetURL}" 
         style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
    </p>
    <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
    <p><a href="${resetURL}">${resetURL}</a></p>
    <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>
    <p>For security reasons, this link will expire in 1 hour.</p>
    <p>Best regards,</p>
    <p><strong>CoreHire.ai</strong>(Powered by CoreOps.ai)</p>
  `
    );

    res.status(200).json({ message: "Password reset link sent" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { id, token } = req.query;
    const { password } = req.body;

    const user = await User.findOne({ _id: id });
    if (!user) return res.status(400).json({ message: "User not found!" });

    const secret = process.env.JWT_SECRET + user.password;
    jwt.verify(token, secret);

    const encryptedPassword = await bcrypt.hash(password, 12);
    await User.updateOne(
      { _id: id },
      { $set: { password: encryptedPassword } }
    );

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    res.status(500).json({ message: "Invalid or expired token" });
  }
};
