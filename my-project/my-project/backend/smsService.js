// backend/smsService.js
const axios = require('axios');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// Defaulting to standard localhost for development if not explicitly provided
const SMS_API_URL = process.env.VITE_SMS_API_URL || 'http://10.41.105.49:5000/api/send-sms';
const SENDER_NUMBER = process.env.SMS_SENDER_ID || 'ONLINE COMPLAINT MANAGEMENT SYSTEM';

console.log(`[SMS Config] URL: ${SMS_API_URL}, Sender: ${SENDER_NUMBER}`);

/**
 * Sends an SMS using the simulator API.
 * @param {string|string[]} toList - The recipient phone number(s)
 * @param {string} message - The text content of the SMS
 */
const sendSms = async (toList, message) => {
  try {
    const payload = {
      from: SENDER_NUMBER,
      toList: Array.isArray(toList) ? toList : [toList],
      message,
    };

    // Attempt to hit the friend's API
    const response = await axios.post(SMS_API_URL, payload, { timeout: 10000 });

    // Log success
    console.log(`[SMS Simulator] Successfully sent SMS to ${payload.toList.join(', ')}`);
    return response.data;
  } catch (err) {
    // We log but do not throw, so that if the SMS API is offline, 
    // the OCMS email registration flow can still continue uninterrupted.
    if (err.response) {
      console.error("[SMS Simulator] Failed to send SMS:", err.response.data);
    } else {
      console.error("[SMS Simulator] Network/Timeout Error:", err.message);
    }
  }
};

const verifyAndSendSms = async (toList, message) => {
  const payload = {
    from: SENDER_NUMBER,
    toList: Array.isArray(toList) ? toList : [toList],
    message,
  };
  // We do not catch the error here so the calling route can handle the 400 response.
  const response = await axios.post(SMS_API_URL, payload, { timeout: 10000 });
  console.log(`[SMS Simulator] Successfully sent SMS to ${payload.toList.join(', ')}`);
  return response.data;
};

module.exports = { sendSms, verifyAndSendSms };
