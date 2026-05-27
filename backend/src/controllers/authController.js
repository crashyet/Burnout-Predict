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

    // Insert user (kita simpan OTP di kolom verification_token)
    await db.query(sql`
      INSERT INTO users (name, email, password, verification_token)
      VALUES (${name}, ${email}, ${hashedPassword}, ${otp})
    `);

    // Send email with OTP
    await sendVerificationEmail(email, otp);

    return successResponse(res, "User registered. Please check your email for the 6-digit OTP.", { email }, 201);
  } catch (err) {
    console.error("Registration Error:", err);
    return errorResponse(res, "Failed to register user: " + err.message);
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return errorResponse(res, "Email and OTP are required", 400);
  }

  try {
    const users = await db.query(sql`SELECT id FROM users WHERE email = ${email} AND verification_token = ${otp}`);
    
    if (users.length === 0) {
      return errorResponse(res, "Invalid OTP or email", 400);
    }

    const userId = users[0].id;

    // Update user status
    await db.query(sql`
      UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = ${userId}
    `);

    return successResponse(res, "Email verified successfully. You can now login.");
  } catch (err) {
    console.error("Verification Error:", err);
    return errorResponse(res, "Failed to verify OTP");
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
      return errorResponse(res, "Please verify your email before logging in", 401);
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

module.exports = { register, verifyOTP, login };
