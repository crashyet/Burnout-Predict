const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql } = require("@databases/pg");
const db = require("../config/db");
const { sendVerificationEmail } = require("../config/mailer");
const { successResponse, errorResponse } = require("../utils/response");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return errorResponse(res, "Name, email, and password are required", 400);
  }

  try {
    // Check if user exists
    const existingUsers = await db.query(sql`SELECT id FROM users WHERE email = ${email}`);
    if (existingUsers.length > 0) {
      return errorResponse(res, "Email already registered", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000 + 7 * 60 * 60 * 1000); // 5 minutes (WIB/UTC+7)

    // Insert user
    await db.query(sql`
      INSERT INTO users (name, email, password, otp, otp_expiry)
      VALUES (${name}, ${email}, ${hashedPassword}, ${otp}, ${otpExpiry})
    `);

    // Send email with OTP
    try {
      await sendVerificationEmail(email, otp);
    } catch (mailErr) {
      console.error("Failed to send verification email:", mailErr);
      console.log(`[DEV/TEST] OTP code for ${email} is: ${otp}`);
      try {
        require('fs').appendFileSync(
          require('path').join(__dirname, '../../backend_debug.log'),
          `${new Date().toISOString()} [REGISTER] Failed to send email to ${email}: ${mailErr.stack || mailErr.message}\n`
        );
      } catch (logErr) { /* ignore */ }
      if (process.env.NODE_ENV === "production") {
        throw new Error("Failed to send verification email: " + mailErr.message);
      }
    }

    return successResponse(res, "User registered. Please check your email for the 6-digit OTP.", { email }, 201);
  } catch (err) {
    console.error("Registration Error:", err);
    return errorResponse(res, "Failed to register user: " + err.message);
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp, otp_code } = req.body;
  const targetOtp = otp || otp_code;

  if (!email || !targetOtp) {
    return errorResponse(res, "Email and OTP are required", 400);
  }

  try {
    const users = await db.query(sql`SELECT id, name, email, otp, otp_expiry FROM users WHERE email = ${email}`);
    
    if (users.length === 0) {
      return errorResponse(res, "Invalid OTP or email", 400);
    }

    const user = users[0];

    if (!user.otp || user.otp !== targetOtp) {
      return errorResponse(res, "Invalid OTP", 400);
    }

    // Check expiry
    const now = new Date();
    const expiry = new Date(user.otp_expiry);
    if (expiry < now) {
      return errorResponse(res, "OTP has expired. Please request a new one.", 400);
    }

    const userId = user.id;

    // Update user status
    await db.query(sql`
      UPDATE users SET is_verified = TRUE, otp = NULL, otp_expiry = NULL WHERE id = ${userId}
    `);

    // Generate JWT on successful verification
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return successResponse(res, "Email verified successfully.", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Verification Error:", err);
    return errorResponse(res, "Failed to verify OTP");
  }
};

const resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return errorResponse(res, "Email is required", 400);
  }

  try {
    // Check if user exists
    const users = await db.query(sql`SELECT id, is_verified FROM users WHERE email = ${email}`);
    if (users.length === 0) {
      return errorResponse(res, "Email is not registered", 404);
    }

    const user = users[0];
    if (user.is_verified) {
      return errorResponse(res, "Email is already verified", 400);
    }

    // Generate new randomized 6 digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000 + 7 * 60 * 60 * 1000); // 5 minutes (WIB/UTC+7)

    // Update user record
    await db.query(sql`
      UPDATE users 
      SET otp = ${newOtp}, otp_expiry = ${otpExpiry} 
      WHERE id = ${user.id}
    `);

    // Send email with new OTP
    try {
      await sendVerificationEmail(email, newOtp);
    } catch (mailErr) {
      console.error("Failed to send verification email:", mailErr);
      console.log(`[DEV/TEST] Resent OTP code for ${email} is: ${newOtp}`);
      try {
        require('fs').appendFileSync(
          require('path').join(__dirname, '../../backend_debug.log'),
          `${new Date().toISOString()} [RESEND] Failed to send email to ${email}: ${mailErr.stack || mailErr.message}\n`
        );
      } catch (logErr) { /* ignore */ }
      if (process.env.NODE_ENV === "production") {
        throw new Error("Failed to send verification email: " + mailErr.message);
      }
    }

    return successResponse(res, "A new OTP has been sent to your email.", { email });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    return errorResponse(res, "Failed to resend OTP: " + err.message);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, "Email and password are required", 400);
  }

  try {
    const users = await db.query(sql`SELECT * FROM users WHERE email = ${email}`);
    
    if (users.length === 0) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    // Check if verified
    if (!user.is_verified) {
      // Generate new randomized 6 digit OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000 + 7 * 60 * 60 * 1000); // 5 minutes (WIB/UTC+7)

      // Update user record
      await db.query(sql`
        UPDATE users 
        SET otp = ${newOtp}, otp_expiry = ${otpExpiry} 
        WHERE id = ${user.id}
      `);

      // Send email with new OTP
      try {
        await sendVerificationEmail(user.email, newOtp);
      } catch (mailErr) {
        console.error("Failed to send verification email during login:", mailErr);
        console.log(`[DEV/TEST] Login unverified new OTP for ${user.email} is: ${newOtp}`);
        try {
          require('fs').appendFileSync(
            require('path').join(__dirname, '../../backend_debug.log'),
            `${new Date().toISOString()} [LOGIN] Failed to send email to ${user.email}: ${mailErr.stack || mailErr.message}\n`
          );
        } catch (logErr) { /* ignore */ }
        if (process.env.NODE_ENV === "production") {
          throw new Error("Failed to send verification email: " + mailErr.message);
        }
      }

      return errorResponse(res, "Please verify your email before logging in", 401, {
        unverified: true,
        email: user.email
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return successResponse(res, "Login successful", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return errorResponse(res, "Failed to login");
  }
};

module.exports = { register, verifyOTP, login, resendOTP };
