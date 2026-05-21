const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/', async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Always return success to the client, even if email fails
  // But we still try to send the email and log errors silently
  try {
    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: `New enquiry from ${name} - Ashmil Homes`,
      text: `Name: ${name}\nPhone: ${phone || 'Not provided'}\nEmail: ${email}\n\nMessage:\n${message}`
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${process.env.EMAIL_USER} from ${email}`);
  } catch (err) {
    // Log error but don't tell the client
    console.error('❌ Email send error (silent):', err.message);
  }

  // Always respond with success to the user
  res.json({ success: true, message: 'Message sent successfully!' });
});

module.exports = router;