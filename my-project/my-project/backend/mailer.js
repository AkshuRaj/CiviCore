const axios = require("axios");

/**
 * Sends an OTP email using the friend's stimulation API.
 * @param {string} toEmail - The recipient's email address
 * @param {string} otp - The 6-digit OTP
 */
const sendOtpEmail = async (toEmail, otp) => {
  const EMAIL_API_URL = process.env.EMAIL_API_URL || "http://10.213.120.189:5000/api/external/send";
  const EMAIL_API_KEY = process.env.EMAIL_API_KEY || "sk_24aa5a3203bdca35795a41dd0ab11a98";

  const payload = {
    to: toEmail,
    subject: "OCMS Email Verification OTP",
    body: `Your Online Complaint Management System (OCMS) verification code is: ${otp}. This code is valid for 5 minutes.`,
    scheduledAt: null
  };

  try {
    const response = await axios.post(EMAIL_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": EMAIL_API_KEY
      },
      timeout: 10000
    });
    console.log(`[Email Stimulation] Successfully sent OTP to ${toEmail}`);
    return response.data;
  } catch (err) {
    if (err.response) {
      console.error("[Email Stimulation] API Error:", err.response.data);
    } else {
      console.error("[Email Stimulation] Network/Timeout Error:", err.message);
    }
    // We log but don't strictly throw to avoid crashing the whole flow if the friend's server is down
  }
};

module.exports = sendOtpEmail;