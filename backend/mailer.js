const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "akshuraj2k6@gmail.com",        
    pass: "qpin enrp rozy uvih",          
  },
});


const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"OCMS Support" <akshuraj2k6@gmail.com>`,
    to: toEmail,
    subject: "OCMS Email Verification OTP",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Online Complaint Management System</h2>
        <p>Your OTP for account registration is:</p>
        <h1 style="color:#1e3c72;">${otp}</h1>
        <p>This OTP is valid for <strong>5 minutes</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr/>
        <small>OCMS – Government of India</small>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOtpEmail;