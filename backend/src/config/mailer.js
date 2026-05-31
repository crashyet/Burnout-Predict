const https = require("https");
require("dotenv").config();

const sendVerificationEmail = async (email, otp) => {
  const data = JSON.stringify({
    from: `Burnout Predict <${process.env.EMAIL_FROM}>`,
    to: [email],
    subject: "Your Verification Code - Burnout Predict",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
        <p>Thank you for registering. Please use the following 6-digit OTP code to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; background: #F3F4F6; padding: 10px 20px; border-radius: 5px;">${otp}</span>
        </div>
        <p>This code will expire shortly. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 Burnout Predict. All rights reserved.</p>
      </div>
    `,
  });

  const options = {
    hostname: "api.resend.com",
    port: 443,
    path: "/emails",
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.EMAIL_PASS}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`Resend API returned status code ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

module.exports = { sendVerificationEmail };
